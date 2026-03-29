"use client";

import Link from "next/link";
import { SliceMark } from "@/components/brand/slice-mark";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useSliceT } from "@/lib/i18n/use-slice-t";

export function NotFoundView() {
  const { t } = useSliceT();
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="slice-header-shell border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="shrink-0" aria-label={t("header.homeAria")}>
            <SliceMark />
          </Link>
          <LanguageToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold text-fg">{t("notFound.title")}</h1>
        <p className="max-w-md text-center text-sm text-muted">
          {t("notFound.hint")}
        </p>
        <Link href="/dashboard" className="slice-btn-primary">
          {t("notFound.cta")}
        </Link>
      </div>
    </div>
  );
}
