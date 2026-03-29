"use client";

import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import type { AppLocale } from "@/lib/i18n/locale";
import { useSliceT } from "@/lib/i18n/use-slice-t";
import { HEADER_CONTROL_SHELL } from "@/components/layout/header-controls";

const segmentClass = (active: boolean) =>
  `relative z-[1] flex w-1/2 min-w-0 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-[background,color] tabular-nums ${
    active
      ? "text-fg"
      : "text-fg-secondary hover:bg-white/[0.06] hover:text-fg"
  }`;

export function LanguageToggle() {
  const { preferences, setLocale } = useSubscriptions();
  const { t } = useSliceT();
  const locale: AppLocale = preferences.locale ?? "en";

  const set = (next: AppLocale) => {
    if (next !== locale) setLocale(next);
  };

  return (
    <div
      role="group"
      aria-label={t("language.toggleAria")}
      className={`relative inline-flex min-h-0 ${HEADER_CONTROL_SHELL}`}
    >
      <span
        className="pointer-events-none absolute inset-y-1 w-[calc(50%-6px)] rounded-full bg-white/12 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] transition-[left] duration-200 ease-out"
        style={{
          left: locale === "nl" ? "4px" : "calc(50% + 2px)",
        }}
        aria-hidden
      />
      <button
        type="button"
        className={segmentClass(locale === "nl")}
        aria-pressed={locale === "nl"}
        onClick={() => set("nl")}
      >
        NL
      </button>
      <button
        type="button"
        className={segmentClass(locale === "en")}
        aria-pressed={locale === "en"}
        onClick={() => set("en")}
      >
        EN
      </button>
    </div>
  );
}
