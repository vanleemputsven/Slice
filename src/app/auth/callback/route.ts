import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const base =
        !isLocalEnv && forwardedHost
          ? `https://${forwardedHost}`
          : origin;
      return NextResponse.redirect(new URL(next, base).toString());
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin).toString());
}
