"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import {
  burnRateHours,
  burnRateWorkdays,
  getMonthlyMyShare,
  listRenewalHorizon,
  nextCycleDate,
  summarizeSubscriptions,
} from "@/lib/subscriptions/calculations";
import type {
  SubscriptionFormInput,
  SubscriptionRecord,
} from "@/lib/validation/subscription";
import { buildInsights } from "@/lib/subscriptions/insights";
import { formatCurrency } from "@/lib/utils/currency";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardInsights } from "@/components/dashboard/dashboard-insights";
import { MonthlyShareExplorer } from "@/components/dashboard/monthly-share-explorer";
import { TopCostFocus } from "@/components/dashboard/top-cost-focus";
import { GuidedAddDialog } from "@/components/subscriptions/guided-add-dialog";
import { SubscriptionFormDialog } from "@/components/subscriptions/subscription-form-dialog";
import { ProviderAvatar } from "@/components/subscriptions/provider-avatar";

function subscriptionToForm(
  sub: SubscriptionRecord,
  nextPaymentDate: string
): SubscriptionFormInput {
  return {
    name: sub.name,
    provider: sub.provider,
    iconKey: sub.iconKey ?? "",
    category: sub.category,
    billingCycle: sub.billingCycle,
    customPeriodMonths: sub.customPeriodMonths,
    totalPrice: sub.totalPrice,
    currency: sub.currency,
    shared: sub.shared,
    shareCount: sub.shareCount,
    nextPaymentDate,
    notes: sub.notes ?? "",
    active: sub.active,
    reviewFlag: sub.reviewFlag ?? false,
  };
}
import { sliceDateLocale } from "@/lib/i18n/locale";
import type { SliceMessageKey } from "@/lib/i18n/messages";
import { useSliceT } from "@/lib/i18n/use-slice-t";

const REMINDER_LEAD_CHOICES = [0, 1, 3, 7, 14] as const;

function reminderLeadChoices(current: number): number[] {
  if (
    REMINDER_LEAD_CHOICES.includes(
      current as (typeof REMINDER_LEAD_CHOICES)[number]
    )
  ) {
    return [...REMINDER_LEAD_CHOICES];
  }
  return [...REMINDER_LEAD_CHOICES, current].sort((a, b) => a - b);
}

function reminderLeadLabel(
  t: (key: SliceMessageKey, vars?: Record<string, string | number>) => string,
  days: number
): string {
  switch (days) {
    case 0:
      return t("dashboard.horizonLead0");
    case 1:
      return t("dashboard.horizonLead1");
    case 3:
      return t("dashboard.horizonLead3");
    case 7:
      return t("dashboard.horizonLead7");
    case 14:
      return t("dashboard.horizonLead14");
    default:
      return t("dashboard.horizonLeadDays", { days });
  }
}

export function DashboardClient() {
  const {
    ready,
    subscriptions,
    preferences,
    setHourlyWage,
    setHoursPerWorkday,
    setReminderLeadDays,
    addSubscription,
    updateSubscription,
  } = useSubscriptions();
  const [addOpen, setAddOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionRecord | null>(null);
  const { t, locale } = useSliceT();
  const dateLoc = sliceDateLocale(locale);

  const summary = useMemo(
    () => summarizeSubscriptions(subscriptions, new Date()),
    [subscriptions]
  );

  const insights = useMemo(
    () =>
      buildInsights(
        subscriptions,
        new Date(),
        preferences.currency ?? "USD",
        locale
      ),
    [subscriptions, preferences.currency, locale]
  );

  const hourly = preferences.hourlyWage;
  const hoursPerMo = useMemo(
    () =>
      hourly != null && hourly > 0
        ? burnRateHours(summary.monthlyMyShare, hourly)
        : null,
    [summary.monthlyMyShare, hourly]
  );
  const workdays = useMemo(
    () =>
      burnRateWorkdays(hoursPerMo, preferences.hoursPerWorkday ?? 8),
    [hoursPerMo, preferences.hoursPerWorkday]
  );

  const today = useMemo(() => new Date(), []);
  const horizon = useMemo(
    () =>
      listRenewalHorizon(
        subscriptions,
        today,
        preferences.reminderLeadDays
      ),
    [subscriptions, today, preferences.reminderLeadDays]
  );
  const horizonTotal = useMemo(
    () => horizon.reduce((sum, charge) => sum + charge.personalShare, 0),
    [horizon]
  );
  const horizonHours = useMemo(() => {
    if (hourly == null || hourly <= 0 || horizonTotal <= 0) return null;
    return burnRateHours(horizonTotal, hourly);
  }, [hourly, horizonTotal]);
  const subscriptionById = useMemo(
    () => new Map(subscriptions.map((sub) => [sub.id, sub])),
    [subscriptions]
  );

  const mostExpensive = useMemo(() => {
    const active = subscriptions.filter((s) => s.active);
    if (active.length === 0) return null;
    return [...active].sort(
      (a, b) => getMonthlyMyShare(b) - getMonthlyMyShare(a)
    )[0];
  }, [subscriptions]);

  const cur = preferences.currency ?? "USD";
  const hasSubscriptions = subscriptions.length > 0;

  if (!ready) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-fg">
            {t("dashboard.title")}
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <Link
          href="/subscriptions"
          className="slice-btn-secondary shrink-0 self-start sm:self-auto"
        >
          {t("dashboard.manageSubs")}
        </Link>
      </div>

      <section aria-labelledby="horizon-panel">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="min-w-0">
            <h2
              id="horizon-panel"
              className="text-base font-semibold text-fg"
            >
              {t("dashboard.horizonTitle")}
            </h2>
            {horizon.length === 0 ? (
              <p className="mt-2 max-w-[46ch] text-sm text-fg-secondary">
                {hasSubscriptions
                  ? t("dashboard.horizonEmpty")
                  : t("dashboard.horizonEmptyStart")}
              </p>
            ) : (
              <>
                <p className="mt-3 font-mono text-3xl font-semibold tabular-nums tracking-tight text-fg">
                  {formatCurrency(horizonTotal, cur, dateLoc)}
                </p>
                <p className="mt-1 max-w-[46ch] text-sm text-fg-secondary">
                  {horizonHours != null
                    ? t("dashboard.horizonWork", {
                        hours: horizonHours.toFixed(1),
                      })
                    : t("dashboard.horizonSum", {
                        amount: formatCurrency(horizonTotal, cur, dateLoc),
                      })}
                </p>
              </>
            )}
          </div>
          <label className="block w-full sm:w-52">
            <span className="slice-label" id="horizon-lead-label">
              {t("dashboard.horizonLeadLabel")}
            </span>
            <select
              className="slice-input mt-1 w-full cursor-pointer"
              aria-labelledby="horizon-lead-label"
              value={preferences.reminderLeadDays}
              onChange={(event) => {
                setReminderLeadDays(Number(event.target.value));
              }}
            >
              {reminderLeadChoices(preferences.reminderLeadDays).map((days) => (
                <option key={days} value={days}>
                  {reminderLeadLabel(t, days)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          className="slice-btn-primary mt-4"
          onClick={() => {
            setEditing(null);
            setAddOpen(false);
            setGuideOpen(true);
          }}
        >
          {t("dashboard.horizonAdd")}
        </button>
        {horizon.length > 0 ? (
          <ul className="mt-5 divide-y divide-white/[0.07]" aria-labelledby="horizon-panel">
            {horizon.map((charge) => {
              const sub = subscriptionById.get(charge.subscriptionId);
              if (!sub) return null;
              const when =
                charge.daysUntil === 0
                  ? t("dashboard.dueToday")
                  : charge.daysUntil === 1
                    ? t("dashboard.dueTomorrow")
                    : t("dashboard.dueInDays", { days: charge.daysUntil });
              const [year, month, day] = charge.dueOn.split("-").map(Number);
              const due = new Date(year, (month ?? 1) - 1, day ?? 1);
              const chargeHours =
                hourly != null && hourly > 0
                  ? burnRateHours(charge.personalShare, hourly)
                  : null;
              return (
                <li
                  key={charge.subscriptionId}
                  className="flex items-start justify-between gap-3 py-3 first:pt-0"
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left hover:bg-white/[0.03]"
                    aria-label={t("dashboard.horizonEdit", { name: sub.name })}
                    onClick={() => {
                      setAddOpen(false);
                      setEditing(sub);
                    }}
                  >
                    <ProviderAvatar
                      name={sub.name}
                      provider={sub.provider}
                      iconKey={sub.iconKey}
                      size="sm"
                    />
                    <span className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">{sub.name}</p>
                    <p
                      className={`text-xs ${
                        charge.insideReminderLead ? "text-accent" : "text-fg-secondary"
                      }`}
                    >
                      {when}{" "}
                      {due.toLocaleDateString(dateLoc, {
                        month: "short",
                        day: "numeric",
                      })}
                      {charge.insideReminderLead
                        ? ` ${t("dashboard.horizonMarked")}`
                        : ""}
                    </p>
                    {sub.shared ? (
                      <p className="text-xs text-fg-secondary">
                        {t("dashboard.horizonYourShare")}
                      </p>
                    ) : null}
                    </span>
                  </button>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="font-mono text-sm font-semibold tabular-nums text-fg">
                      {formatCurrency(charge.personalShare, cur, dateLoc)}
                    </p>
                    {chargeHours != null ? (
                      <p className="font-mono text-xs tabular-nums text-fg-secondary">
                        {t("dashboard.horizonHours", {
                          hours: chargeHours.toFixed(1),
                        })}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      className="text-xs font-semibold text-fg-secondary underline-offset-2 hover:text-fg hover:underline"
                      aria-label={t("dashboard.horizonRecordAria", { name: sub.name })}
                      onClick={() => {
                        const next = nextCycleDate(sub, charge.dueOn);
                        if (!next) return;
                        updateSubscription(sub.id, subscriptionToForm(sub, next));
                      }}
                    >
                      {t("dashboard.horizonRecord")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {hasSubscriptions ? (
        <MonthlyShareExplorer subscriptions={subscriptions} currency={cur} />
      ) : null}

      {hasSubscriptions ? (
      <section
        aria-labelledby="dash-stats"
        className="border-t border-white/[0.08] pt-6"
      >
        <h2 id="dash-stats" className="sr-only">
          {t("dashboard.summaryStats")}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          <article className="xl:border-r xl:border-white/[0.08] xl:pr-6">
            <div className="text-muted">
              <span className="slice-label">{t("dashboard.statMonthYours")}</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-fg sm:text-3xl">
              {formatCurrency(summary.monthlyMyShare, cur, dateLoc)}
            </p>
            <p className="mt-1 text-xs text-muted">
              {t("dashboard.statFullPlans")}{" "}
              <span className="tabular-nums text-fg-secondary">
                {formatCurrency(summary.monthlyFullTotal, cur, dateLoc)}
              </span>
              {t("dashboard.statPerMo")}
            </p>
          </article>

          <article className="xl:border-r xl:border-white/[0.08] xl:pr-6">
            <div className="text-muted">
              <span className="slice-label">{t("dashboard.statYearYours")}</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-fg sm:text-3xl">
              {formatCurrency(summary.yearlyMyShare, cur, dateLoc)}
            </p>
            <p className="mt-1 text-xs text-muted">{t("dashboard.statYearlyHint")}</p>
          </article>

          <article className="xl:border-r xl:border-white/[0.08] xl:pr-6">
            <div className="text-muted">
              <span className="slice-label">{t("dashboard.statActive")}</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-fg sm:text-3xl">
              {summary.activeCount}
            </p>
            <p className="mt-1 text-xs text-muted">
              {summary.upcomingCount} {t("dashboard.statDue30")}
            </p>
          </article>

          <article>
            <div className="text-muted">
              <span className="slice-label">{t("dashboard.statSharedPlans")}</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-fg sm:text-3xl">
              {summary.sharedCount}
            </p>
            <p className="mt-1 text-xs text-muted">{t("dashboard.statSplitCount")}</p>
          </article>
        </div>
      </section>
      ) : null}

      {hasSubscriptions && (mostExpensive || insights.length > 0) ? (
        <section className="slice-card overflow-hidden">
          <div className="grid lg:grid-cols-12 lg:divide-x lg:divide-white/[0.07]">
            {mostExpensive ? (
              <div
                className={`p-5 sm:p-6 ${
                  insights.length > 0 ? "lg:col-span-5" : "lg:col-span-12"
                }`}
              >
                <TopCostFocus
                  embedded
                  subscription={mostExpensive}
                  currency={cur}
                />
              </div>
            ) : null}
            {insights.length > 0 ? (
              <div
                className={`p-5 sm:p-6 ${
                  mostExpensive ? "lg:col-span-7" : "lg:col-span-12"
                }`}
              >
                <DashboardInsights embedded items={insights} />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasSubscriptions ? (
        <DashboardCharts subscriptions={subscriptions} currency={cur} />
      ) : null}

      <section className="border-t border-white/[0.08] pt-6" aria-labelledby="burn-panel">
        <div>
            <h2
              id="burn-panel"
              className="text-base font-semibold text-fg"
            >
              {t("dashboard.workTime")}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {t("dashboard.workTimeHint")}
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:items-end">
              <label className="block">
                <span className="slice-label">{t("dashboard.hourlyLabel")}</span>
              <input
                type="number"
                min={0}
                step={0.5}
                className="slice-input tabular-nums"
                value={hourly ?? ""}
                placeholder={t("dashboard.hourlyPlaceholder")}
                aria-label={t("dashboard.hourlyAria")}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") {
                    setHourlyWage(null);
                    return;
                  }
                  const n = Number(v);
                  if (!Number.isNaN(n)) setHourlyWage(n);
                }}
              />
            </label>
            <label className="block">
              <span className="slice-label">{t("dashboard.hoursPerDay")}</span>
              <input
                type="number"
                min={1}
                max={24}
                step={0.5}
                className="slice-input tabular-nums"
                value={preferences.hoursPerWorkday ?? 8}
                aria-label={t("dashboard.hoursPerDayAria")}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (!Number.isNaN(n) && n > 0) setHoursPerWorkday(n);
                }}
              />
            </label>
          </div>

          {hourly == null || hourly <= 0 ? (
            <p className="mt-4 text-sm text-muted">
              {t("dashboard.addRateHint")}
            </p>
          ) : (
            <dl className="mt-6 space-y-4 border-t border-white/[0.07] pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="slice-label">{t("dashboard.hoursPerMonth")}</dt>
                <dd className="font-mono text-xl font-semibold tabular-nums text-fg">
                  {hoursPerMo != null ? hoursPerMo.toFixed(1) : "—"}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="slice-label">
                  {t("dashboard.workdaysPerMo", {
                    hours: preferences.hoursPerWorkday ?? 8,
                  })}
                </dt>
                <dd className="font-mono text-xl font-semibold tabular-nums text-fg">
                  {workdays != null ? workdays.toFixed(2) : "—"}
                </dd>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-2 border-t border-white/[0.07] pt-4">
                <dt className="slice-label">
                  {t("dashboard.hoursPerYear")}
                </dt>
                <dd className="text-right text-sm text-fg">
                  <span className="font-mono font-semibold tabular-nums">
                    {hoursPerMo != null
                      ? (hoursPerMo * 12).toFixed(0)
                      : "—"}
                  </span>
                </dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      <GuidedAddDialog
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onSubmit={(values) => addSubscription(values)}
        onFullForm={() => {
          setGuideOpen(false);
          setEditing(null);
          setAddOpen(true);
        }}
      />
      <SubscriptionFormDialog
        open={addOpen || editing != null}
        initial={editing}
        onClose={() => {
          setAddOpen(false);
          setEditing(null);
        }}
        onSubmit={(values) => {
          if (editing) updateSubscription(editing.id, values);
          else addSubscription(values);
        }}
      />
    </div>
  );
}
