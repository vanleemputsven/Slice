import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

const PROTECTED_PREFIXES = ["/dashboard", "/subscriptions", "/settings"];
const WELCOME_PATH = "/welcome";

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isWelcomePath(pathname: string): boolean {
  return pathname === WELCOME_PATH || pathname.startsWith(`${WELCOME_PATH}/`);
}

async function fetchWelcomeCompleted(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("welcome_completed_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return true;
  }
  if (!data) {
    return false;
  }
  return data.welcome_completed_at != null;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabasePublicConfig());
  } catch {
    if (isProtectedPath(request.nextUrl.pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "config");
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isWelcomePath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", WELCOME_PATH);
    return NextResponse.redirect(redirectUrl);
  }

  if (!user && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user) {
    const welcomeDone = await fetchWelcomeCompleted(supabase, user.id);

    if (isWelcomePath(pathname) && welcomeDone) {
      const nextPath = safeNextPath(
        request.nextUrl.searchParams.get("next"),
        "/dashboard"
      );
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = nextPath;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (isProtectedPath(pathname) && !welcomeDone && !isWelcomePath(pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = WELCOME_PATH;
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.searchParams.delete("next");
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
