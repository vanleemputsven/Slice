"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { X } from "lucide-react";
import {
  subscriptionFormSchema,
  type SubscriptionFormInput,
  type SubscriptionRecord,
} from "@/lib/validation/subscription";
import { SUBSCRIPTION_CATEGORIES } from "@/lib/subscriptions/categories";

export type SubscriptionFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SubscriptionFormInput) => void;
  initial?: SubscriptionRecord | null;
  title?: string;
};

const emptyDefaults = (): SubscriptionFormInput => ({
  name: "",
  provider: "",
  iconKey: "",
  category: "Other",
  billingCycle: "monthly",
  customPeriodMonths: undefined,
  totalPrice: 9.99,
  currency: "USD",
  shared: false,
  shareCount: undefined,
  nextPaymentDate: new Date().toISOString().slice(0, 10),
  notes: "",
  active: true,
  reviewFlag: false,
});

export function SubscriptionFormDialog({
  open,
  onClose,
  onSubmit,
  initial,
  title,
}: SubscriptionFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const form = useForm<SubscriptionFormInput>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: emptyDefaults(),
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
          : emptyDefaults()
      );
    } else if (el.open) {
      el.close();
    }
  }, [open, initial, form]);

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
            {title ?? (initial ? "Edit subscription" : "Add subscription")}
          </h2>
          <button
            type="button"
            className="border border-transparent p-1.5 text-muted transition-colors hover:border-border-subtle hover:bg-surface-alt hover:text-fg"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="slice-label">Name</span>
              <input className="slice-input" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.name.message}
                </p>
              )}
            </label>
            <label className="block sm:col-span-2">
              <span className="slice-label">Provider</span>
              <input className="slice-input" {...form.register("provider")} />
              {form.formState.errors.provider && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.provider.message}
                </p>
              )}
            </label>
            <label className="block sm:col-span-2">
              <span className="slice-label">Category</span>
              <select className="slice-input" {...form.register("category")}>
                {SUBSCRIPTION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="slice-label">Billing cycle</span>
              <select
                className="slice-input"
                {...form.register("billingCycle")}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom (every N months)</option>
              </select>
            </label>
            {billingCycle === "custom" && (
              <label className="block">
                <span className="slice-label">Every N months</span>
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
              <span className="slice-label">Total price (per bill)</span>
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
              <span className="slice-label">Currency (ISO)</span>
              <input
                className="slice-input uppercase"
                maxLength={3}
                {...form.register("currency")}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="slice-label">Next payment</span>
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
            <legend className="slice-label px-1">Sharing</legend>
            <label className="mt-3 flex items-center gap-2 text-sm text-fg">
              <input type="checkbox" {...form.register("shared")} />
              Shared with others
            </label>
            {shared && (
              <label className="mt-3 block">
                <span className="slice-label">People splitting (incl. you)</span>
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
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-fg-secondary">
            <input type="checkbox" {...form.register("reviewFlag")} />
            Flag for review (trimming candidate)
          </label>

          <label className="block">
            <span className="slice-label">Notes</span>
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
            Check highlighted fields.
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" className="slice-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="slice-btn-primary">
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}
