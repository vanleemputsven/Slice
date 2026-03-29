"use client";

import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import type { AppLocale } from "@/lib/i18n/locale";
import { sliceT, type SliceMessageKey } from "@/lib/i18n/messages";

export function useSliceT(): {
  t: (key: SliceMessageKey, vars?: Record<string, string | number>) => string;
  locale: AppLocale;
} {
  const { preferences } = useSubscriptions();
  const locale = preferences.locale ?? "en";
  const t = (key: SliceMessageKey, vars?: Record<string, string | number>) =>
    sliceT(locale, key, vars);
  return { t, locale };
}
