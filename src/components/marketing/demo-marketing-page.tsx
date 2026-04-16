"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCallback, useLayoutEffect, useState } from "react";
import type { AppLocale } from "@/lib/i18n/locale";
import { sliceT, type SliceMessageKey } from "@/lib/i18n/messages";
import { LandingScanWizard } from "@/components/marketing/landing-scan-wizard";

const LOGIN_LOCALE_KEY = "slice-login-locale";

function readLoginLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  try {
    const s = sessionStorage.getItem(LOGIN_LOCALE_KEY);
    if (s === "nl" || s === "en") return s;
  } catch {
    /* ignore */
  }
  return "en";
}

type DemoMarketingPageProps = {
  isSignedIn: boolean;
};

export function DemoMarketingPage({ isSignedIn }: DemoMarketingPageProps) {
  const [locale, setLocale] = useState<AppLocale>("en");
  const [mounted, setMounted] = useState(false);

  const t = useCallback(
    (key: SliceMessageKey, vars?: Record<string, string | number>) =>
      sliceT(locale, key, vars),
    [locale]
  );

  useLayoutEffect(() => {
    setLocale(readLoginLocale());
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale === "nl" ? "nl" : "en";
  }, [locale]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="h-10 w-40 rounded-md bg-white/[0.07]" />
        <div className="mt-6 h-64 w-full max-w-lg rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-fg">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at center, rgb(255 255 255 / 0.055) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 85% 70% at 50% 0%, black, transparent)",
        }}
      />

      <header className="slice-header-shell sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-fg-secondary transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-4 shrink-0 opacity-80" aria-hidden />
            {t("auth.backToSlice")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:px-8">
        <LandingScanWizard isSignedIn={isSignedIn} t={t} />
      </main>
    </div>
  );
}
