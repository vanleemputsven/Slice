"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SubscriptionRecord } from "@/lib/validation/subscription";
import {
  daysUntil,
  getAnnualMyShare,
  getMonthlyMyShare,
  getMonthlyTotalPrice,
  getNextPaymentOnOrAfter,
} from "@/lib/subscriptions/calculations";
import { formatCurrency } from "@/lib/utils/currency";
import { sliceDateLocale } from "@/lib/i18n/locale";
import { useSliceT } from "@/lib/i18n/use-slice-t";
import { subscriptionCategoryLabel } from "@/lib/i18n/category-labels";

type TopCostFocusProps = {
  subscription: SubscriptionRecord;
  currency: string;
  /** Omit outer card — use inside a parent `slice-card` with layout padding */
  embedded?: boolean;
};

export function TopCostFocus({
  subscription: s,
  currency,
  embedded = false,
}: TopCostFocusProps) {
  const { t, locale } = useSliceT();
  const dateLoc = sliceDateLocale(locale);
  const now = new Date();
  const next = getNextPaymentOnOrAfter(s, now);
  const days = daysUntil(next, now);
  const dueLabel =
    days < 0
      ? t("topCost.dueStale")
      : days === 0
        ? t("topCost.dueToday")
        : days === 1
          ? t("topCost.dueTomorrow")
          : t("topCost.dueInDays", { days });

  const monthlyYours = getMonthlyMyShare(s);
  const monthlyFull = getMonthlyTotalPrice(s);

  return (
    <section
      className={embedded ? "min-w-0" : "slice-card p-5 sm:p-6"}
      aria-labelledby="top-cost-heading"
    >
      <div className="border-b border-white/[0.07] pb-4">
        <p
          id="top-cost-heading"
          className="text-xs font-medium uppercase tracking-wide text-muted"
        >
          {t("topCost.kicker")}
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-tight text-fg sm:text-2xl">
          {s.name}
        </h2>
        <p className="mt-1 text-sm text-fg-secondary">
          {s.provider}
          <span className="text-muted"> · </span>
          {subscriptionCategoryLabel(s.category, locale)}
        </p>
      </div>

      <div className="mt-4 space-y-4 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.06] pb-3">
          <span className="text-muted">{t("topCost.youPayMo")}</span>
          <span className="font-mono text-lg font-semibold tabular-nums text-fg">
            {formatCurrency(monthlyYours, currency)}
          </span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.06] pb-3">
          <span className="text-muted">{t("topCost.fullPlan")}</span>
          <span className="font-mono text-base font-medium tabular-nums text-fg-secondary">
            {formatCurrency(monthlyFull, currency)}
          </span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.06] pb-3">
          <span className="text-muted">{t("topCost.nextCharge")}</span>
          <span className="text-right">
            <span className="font-medium text-fg">
              {next.toLocaleDateString(dateLoc, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="ml-2 text-muted">· {dueLabel}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-muted">{t("topCost.sharing")}</span>
          <span className="text-right text-fg">
            {s.shared
              ? t("topCost.sharingSplit", {
                  count: String(s.shareCount ?? "—"),
                  amount: formatCurrency(getAnnualMyShare(s), currency),
                })
              : t("topCost.soloYear", {
                  amount: formatCurrency(getAnnualMyShare(s), currency),
                })}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/subscriptions?highlight=${s.id}`}
          className="slice-btn-primary inline-flex text-sm"
        >
          {t("topCost.openRow")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href="/subscriptions" className="slice-btn-secondary text-sm">
          {t("topCost.fullList")}
        </Link>
      </div>
    </section>
  );
}
