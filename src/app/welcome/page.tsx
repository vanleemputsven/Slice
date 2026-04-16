import { redirect } from "next/navigation";
import { Suspense } from "react";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import type { AppLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import { WelcomePageSkeleton } from "@/components/skeleton/auth-skeleton";
import {
  welcomeCurrencyCodes,
  type WelcomeCurrencyCode,
} from "@/lib/validation/welcome-profile";

import { WelcomeForm } from "./welcome-form";

export const metadata = {
  title: "Welcome",
  description: "Optional details to personalize your Slice workspace.",
};

function coerceWelcomeCurrency(code: string): WelcomeCurrencyCode {
  const u = code.trim().toUpperCase();
  if ((welcomeCurrencyCodes as readonly string[]).includes(u)) {
    return u as WelcomeCurrencyCode;
  }
  return "EUR";
}

async function WelcomePageContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/welcome")}`);
  }

  const { data: prefs, error } = await supabase
    .from("user_preferences")
    .select("welcome_completed_at, locale, currency, preferred_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    redirect(safeNextPath(sp.next, "/dashboard"));
  }

  if (prefs?.welcome_completed_at) {
    redirect(safeNextPath(sp.next, "/dashboard"));
  }

  const locale = (prefs?.locale === "nl" ? "nl" : "en") as AppLocale;
  const currency = coerceWelcomeCurrency(prefs?.currency ?? "USD");
  const preferredName = prefs?.preferred_name?.trim() ?? "";

  return (
    <WelcomeForm
      nextPath={safeNextPath(sp.next, "/dashboard")}
      initialLocale={locale}
      initialCurrency={currency}
      initialPreferredName={preferredName}
    />
  );
}

export default function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={<WelcomePageSkeleton />}>
      <WelcomePageContent searchParams={searchParams} />
    </Suspense>
  );
}
