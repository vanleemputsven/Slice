"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { X } from "lucide-react";
import {
  subscriptionFormSchemaForLocale,
  type SubscriptionFormInput,
  type SubscriptionRecord,
} from "@/lib/validation/subscription";
import { SUBSCRIPTION_CATEGORIES } from "@/lib/subscriptions/categories";
import { subscriptionCategoryLabel } from "@/lib/i18n/category-labels";
import { useSliceT } from "@/lib/i18n/use-slice-t";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";

export type SubscriptionFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SubscriptionFormInput) => void;
  initial?: SubscriptionRecord | null;
  title?: string;
};

const emptyDefaults = (currencyCode: string): SubscriptionFormInput => ({
  name: "",
  provider: "",
  iconKey: "",
  category: "Other",
  billingCycle: "monthly",
  customPeriodMonths: undefined,
  totalPrice: 9.99,
  currency: currencyCode.slice(0, 3).toUpperCase(),
  shared: false,
  shareCount: undefined,
  nextPaymentDate: new Date().toISOString().slice(0, 10),
  notes: "",
  active: true,
  reviewFlag: false,
});

function SubscriptionFormDialogInner({
  open,
  onClose,
  onSubmit,
  initial,
  title,
}: SubscriptionFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { t, locale } = useSliceT();
  const { preferences } = useSubscriptions();
  const defaultRowCurrency = preferences.currency ?? "USD";
  const schema = useMemo(
    () => subscriptionFormSchemaForLocale(locale),
    [locale]
  );

  const form = useForm<SubscriptionFormInput>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults(defaultRowCurrency),
  });

  const billingCycle = useWatch({
    control: form.control,
    name: "billingCycle",
    defaultValue: "monthly",
  });
  const shared = useWatch({
    control: form.control,
    name: "shared",
    defaultValue: false,
  });

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) {
        el.showModal();
      }
      form.reset(
        initial
          ? {
              name: initial.name,
              provider: initial.provider,
              iconKey: initial.iconKey ?? "",
              category: initial.category,
              billingCycle: initial.billingCycle,
              customPeriodMonths: initial.customPeriodMonths,
              totalPrice: initial.totalPrice,
              currency: initial.currency,
              shared: initial.shared,
              shareCount: initial.shareCount,
              nextPaymentDate: initial.nextPaymentDate,
              notes: initial.notes ?? "",
              active: initial.active,
              reviewFlag: initial.reviewFlag ?? false,
            }
          : emptyDefaults(defaultRowCurrency)
      );
    } else if (el.open) {
      el.close();
    }
  }, [open, initial, form, defaultRowCurrency]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [onClose]);

  const heading =
    title ?? (initial ? t("form.editTitle") : t("form.addTitle"));

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-surface p-0 text-fg shadow-card ring-1 ring-white/[0.06]"
      aria-labelledby="sub-form-title"
    >
      <form
        className="max-h-[85vh] overflow-y-auto p-5 sm:p-6"
        onSubmit={form.handleSubmit((vals) => {
          onSubmit(vals);
          onClose();
        })}
      >
        <div className="flex items-start justify-between gap-3">
          <h2
            id="sub-form-title"
            className="text-xl font-bold text-fg"
          >
            {heading}
          </h2>
          <button
            type="button"
            className="border border-transparent p-1.5 text-muted transition-colors hover:border-border-subtle hover:bg-surface-alt hover:text-fg"
            aria-label={t("form.closeAria")}
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="slice-label">{t("form.name")}</span>
              <input className="slice-input" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.name.message}
                </p>
              )}
            </label>
            <label className="block sm:col-span-2">
              <span className="slice-label">{t("form.provider")}</span>
              <input className="slice-input" {...form.register("provider")} />
              {form.formState.errors.provider && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.provider.message}
                </p>
              )}
            </label>
            <label className="block sm:col-span-2">
              <span className="slice-label">{t("form.category")}</span>
              <select className="slice-input" {...form.register("category")}>
                {SUBSCRIPTION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {subscriptionCategoryLabel(c, locale)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="slice-label">{t("form.billingCycle")}</span>
              <select
                className="slice-input"
                {...form.register("billingCycle")}
              >
                <option value="monthly">{t("form.billingMonthly")}</option>
                <option value="yearly">{t("form.billingYearly")}</option>
                <option value="custom">{t("form.billingCustom")}</option>
              </select>
            </label>
            {billingCycle === "custom" && (
              <label className="block">
                <span className="slice-label">{t("form.everyNMonths")}</span>
                <input
                  type="number"
                  min={1}
                  className="slice-input tabular-nums"
                  {...form.register("customPeriodMonths")}
                />
                {form.formState.errors.customPeriodMonths && (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.customPeriodMonths.message}
                  </p>
                )}
              </label>
            )}
            <label className="block">
              <span className="slice-label">{t("form.totalPrice")}</span>
              <input
                type="number"
                step="0.01"
                min={0}
                className="slice-input tabular-nums"
                {...form.register("totalPrice")}
              />
              {form.formState.errors.totalPrice && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.totalPrice.message}
                </p>
              )}
            </label>
            <label className="block">
              <span className="slice-label">{t("form.currencyIso")}</span>
              <input
                className="slice-input uppercase"
                maxLength={3}
                {...form.register("currency")}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="slice-label">{t("form.nextPayment")}</span>
              <input
                type="date"
                className="slice-input"
                {...form.register("nextPaymentDate")}
              />
              {form.formState.errors.nextPaymentDate && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.nextPaymentDate.message}
                </p>
              )}
            </label>
          </div>

          <fieldset className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <legend className="slice-label px-1">{t("form.sharingLegend")}</legend>
            <label className="mt-3 flex items-center gap-2 text-sm text-fg">
              <input type="checkbox" {...form.register("shared")} />
              {t("form.sharedLabel")}
            </label>
            {shared && (
              <label className="mt-3 block">
                <span className="slice-label">{t("form.shareCount")}</span>
                <input
                  type="number"
                  min={2}
                  className="slice-input tabular-nums"
                  {...form.register("shareCount")}
                />
                {form.formState.errors.shareCount && (
                  <p className="mt-1 text-xs text-danger" role="alert">
                    {form.formState.errors.shareCount.message}
                  </p>
                )}
              </label>
            )}
          </fieldset>

          <label className="flex items-center gap-2 text-sm text-fg-secondary">
            <input type="checkbox" {...form.register("active")} />
            {t("form.active")}
          </label>
          <label className="flex items-center gap-2 text-sm text-fg-secondary">
            <input type="checkbox" {...form.register("reviewFlag")} />
            {t("form.reviewFlag")}
          </label>

          <label className="block">
            <span className="slice-label">{t("form.notes")}</span>
            <textarea
              rows={3}
              className="slice-input"
              {...form.register("notes")}
            />
            {form.formState.errors.notes && (
              <p className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.notes.message}
              </p>
            )}
          </label>
        </div>

        {form.formState.errors.root && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {t("form.rootError")}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className="slice-btn-secondary" onClick={onClose}>
            {t("form.cancel")}
          </button>
          <button type="submit" className="slice-btn-primary">
            {t("form.save")}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export function SubscriptionFormDialog(props: SubscriptionFormDialogProps) {
  const { preferences } = useSubscriptions();
  const locale = preferences.locale ?? "en";
  return <SubscriptionFormDialogInner key={locale} {...props} />;
}
