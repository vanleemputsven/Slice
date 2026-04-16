"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRoundX } from "lucide-react";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import {
  welcomeCurrencyCodes,
  welcomeCurrencySchema,
} from "@/lib/validation/welcome-profile";
import { formatCurrency } from "@/lib/utils/currency";
import { sliceDateLocale } from "@/lib/i18n/locale";
import { useSliceT } from "@/lib/i18n/use-slice-t";
import { deleteUserAccount } from "@/lib/account/delete-account";
import { createClient } from "@/lib/supabase/client";

const PREVIEW_SAMPLE = 1234.56;

export function SettingsClient() {
  const router = useRouter();
  const { ready, preferences, setCurrency } = useSubscriptions();
  const { t, locale } = useSliceT();
  const dateLoc = sliceDateLocale(locale);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const stored = (preferences.currency ?? "USD").slice(0, 3).toUpperCase();
  const inAllowlist = welcomeCurrencySchema.safeParse(stored).success;

  const selectOptions = useMemo(() => {
    if (inAllowlist) return [...welcomeCurrencyCodes];
    return [
      stored,
      ...welcomeCurrencyCodes.filter((c) => c !== stored),
    ] as string[];
  }, [inAllowlist, stored]);

  const onCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parsed = welcomeCurrencySchema.safeParse(e.target.value);
    if (parsed.success) setCurrency(parsed.data);
  };

  if (!ready) {
    return (
      <div className="animate-pulse space-y-4" aria-hidden>
        <div className="h-10 w-64 rounded-2xl bg-white/[0.06]" />
        <div className="slice-card h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
          {t("settings.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-fg-secondary">
          {t("settings.subtitle")}
        </p>
      </header>

      <section
        className="slice-card p-5 sm:p-6"
        aria-labelledby="settings-currency-heading"
      >
        <h2
          id="settings-currency-heading"
          className="text-lg font-semibold tracking-tight text-fg"
        >
          {t("settings.currencySection")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t("settings.currencyHint")}
        </p>

        <div className="mt-6 grid gap-6 sm:max-w-md">
          <div>
            <label htmlFor="settings-currency" className="slice-label">
              {t("settings.currencyLabel")}
            </label>
            <select
              id="settings-currency"
              className="slice-input mt-2 w-full cursor-pointer"
              value={stored}
              onChange={onCurrencyChange}
            >
              {selectOptions.map((code) => {
                const allowed = welcomeCurrencySchema.safeParse(code).success;
                return (
                  <option
                    key={code}
                    value={code}
                    className="bg-surface"
                    disabled={!allowed}
                  >
                    {allowed
                      ? code
                      : t("settings.legacyOption", { code })}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {t("settings.previewLabel")}
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-fg">
              {formatCurrency(PREVIEW_SAMPLE, stored, dateLoc)}
            </p>
          </div>
        </div>
      </section>

      <section
        className="slice-card border-danger/35 p-5 sm:p-6"
        aria-labelledby="settings-delete-heading"
      >
        <h2
          id="settings-delete-heading"
          className="text-lg font-semibold tracking-tight text-fg"
        >
          {t("settings.deleteSection")}
        </h2>
        <h3 className="mt-3 text-base font-semibold text-danger">
          {t("settings.deleteTitle")}
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t("settings.deleteDescription")}
        </p>
        {deleteError ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-fg"
          >
            {deleteError}
          </p>
        ) : null}
        <div className="mt-6">
          <button
            type="button"
            disabled={deleteBusy}
            className="slice-btn-secondary border-danger/45 text-danger hover:border-danger hover:bg-danger/10"
            onClick={() => {
              setDeleteError(null);
              if (
                typeof window !== "undefined" &&
                !window.confirm(t("settings.deleteConfirm"))
              ) {
                return;
              }
              void (async () => {
                setDeleteBusy(true);
                try {
                  const result = await deleteUserAccount({});
                  if (result.ok) {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    router.refresh();
                    router.push("/login");
                    return;
                  }
                  if (result.code === "not_configured") {
                    setDeleteError(t("settings.deleteNotConfigured"));
                  } else {
                    setDeleteError(t("settings.deleteFailed"));
                  }
                } finally {
                  setDeleteBusy(false);
                }
              })();
            }}
          >
            <UserRoundX className="size-4 shrink-0" aria-hidden />
            {deleteBusy ? t("settings.deleteWorking") : t("settings.deleteButton")}
          </button>
        </div>
      </section>
    </div>
  );
}
