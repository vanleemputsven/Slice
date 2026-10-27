"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import type { AppLocale } from "@/lib/i18n/locale";
import { useSliceT } from "@/lib/i18n/use-slice-t";

export function LanguageToggle() {
  const { preferences, setLocale } = useSubscriptions();
  const { t } = useSliceT();
  const locale: AppLocale = preferences.locale ?? "en";

  return (
    <SegmentedControl
      value={locale}
      onChange={setLocale}
      ariaLabel={t("language.toggleAria")}
      equalWidth
      options={[
        { value: "nl", label: "NL" },
        { value: "en", label: "EN" },
      ]}
    />
  );
}
