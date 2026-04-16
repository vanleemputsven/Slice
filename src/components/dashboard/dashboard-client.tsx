"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlarmClock,
  ArrowRight,
  CalendarDays,
  Layers,
  PieChart,
  Share2,
  Timer,
  Wallet,
} from "lucide-react";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import {
  burnRateHours,
  burnRateWorkdays,
  daysUntil,
  getMonthlyMyShare,
  getNextPaymentOnOrAfter,
  summarizeSubscriptions,
} from "@/lib/subscriptions/calculations";
import { buildInsights } from "@/lib/subscriptions/insights";
import { formatCurrency } from "@/lib/utils/currency";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardInsights } from "@/components/dashboard/dashboard-insights";
import { MonthlyShareExplorer } from "@/components/dashboard/monthly-share-explorer";
import { TopCostFocus } from "@/components/dashboard/top-cost-focus";
import { sliceDateLocale } from "@/lib/i18n/locale";
import { useSliceT } from "@/lib/i18n/use-slice-t";

export function DashboardClient() {
  const {
    ready,
    subscriptions,
    preferences,
    setHourlyWage,
    setHoursPerWorkday,
  } = useSubscriptions();
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

  const upcoming = useMemo(() => {
    const now = new Date();
    const active = subscriptions.filter((s) => s.active);
    return [...active]
      .map((s) => ({
        sub: s,
        next: getNextPaymentOnOrAfter(s, now),
      }))
      .sort((a, b) => a.next.getTime() - b.next.getTime())
      .slice(0, 6);
  }, [subscriptions]);

  const thisWeek = useMemo(() => {
    const now = new Date();
    return upcoming.filter(({ next }) => {
      const d = daysUntil(next, now);
      return d >= 0 && d <= 7;
    });
  }, [upcoming]);

  const thisMonth = useMemo(() => {
    const now = new Date();
    return upcoming.filter(({ next }) => {
      const d = daysUntil(next, now);
      return d >= 0 && d <= 30;
    });
  }, [upcoming]);

  const mostExpensive = useMemo(() => {
    const active = subscriptions.filter((s) => s.active);
    if (active.length === 0) return null;
    return [...active].sort(
      (a, b) => getMonthlyMyShare(b) - getMonthlyMyShare(a)
    )[0];
  }, [subscriptions]);

  const cur = preferences.currency ?? "USD";

  if (!ready) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-10">
      <MonthlyShareExplorer
        subscriptions={subscriptions}
        currency={cur}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
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
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <section
        aria-labelledby="dash-stats"
        className="slice-card p-5 sm:p-6"
      >
        <h2 id="dash-stats" className="sr-only">
          {t("dashboard.summaryStats")}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          <article className="xl:border-r xl:border-white/[0.08] xl:pr-6">
            <div className="flex items-center gap-2 text-muted">
              <Wallet className="size-4 text-accent" aria-hidden />
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
            <div className="flex items-center gap-2 text-muted">
              <PieChart className="size-4 text-accent" aria-hidden />
              <span className="slice-label">{t("dashboard.statYearYours")}</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-fg sm:text-3xl">
              {formatCurrency(summary.yearlyMyShare, cur, dateLoc)}
            </p>
            <p className="mt-1 text-xs text-muted">{t("dashboard.statYearlyHint")}</p>
          </article>

          <article className="xl:border-r xl:border-white/[0.08] xl:pr-6">
            <div className="flex items-center gap-2 text-muted">
              <Layers className="size-4 text-accent" aria-hidden />
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
            <div className="flex items-center gap-2 text-muted">
              <Share2 className="size-4 text-accent" aria-hidden />
              <span className="slice-label">{t("dashboard.statSharedPlans")}</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-fg sm:text-3xl">
              {summary.sharedCount}
            </p>
            <p className="mt-1 text-xs text-muted">{t("dashboard.statSplitCount")}</p>
          </article>
        </div>
      </section>

      {(mostExpensive || insights.length > 0) && (
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
      )}

      <DashboardCharts subscriptions={subscriptions} currency={cur} />

      <section className="slice-card overflow-hidden" aria-labelledby="burn-panel">
        <div className="grid lg:grid-cols-5 lg:divide-x lg:divide-white/[0.07]">
          <div className="p-5 sm:p-6 lg:col-span-3">
            <h2
              id="burn-panel"
              className="flex items-center gap-2 text-base font-semibold text-fg sm:text-lg"
            >
              <Timer className="size-5 shrink-0 text-accent" aria-hidden />
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
                <dt className="flex items-center gap-2 slice-label">
                  <AlarmClock className="size-3.5 text-accent" aria-hidden />
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

          <div className="p-5 sm:p-6 lg:col-span-2">
            <h2 className="flex items-center gap-2 text-base font-semibold text-fg sm:text-lg">
              <CalendarDays className="size-5 shrink-0 text-accent" aria-hidden />
              {t("dashboard.upcoming")}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {t("dashboard.upcomingCounts", {
                week: thisWeek.length,
                month: thisMonth.length,
              })}
            </p>
            <ul className="mt-4 space-y-0 divide-y divide-white/[0.07]">
              {upcoming.length === 0 ? (
                <li className="py-3 text-sm text-muted">{t("dashboard.noneActive")}</li>
              ) : (
                upcoming.map(({ sub, next }) => {
                  const d = daysUntil(next, new Date());
                  const label =
                    d === 0
                      ? t("dashboard.dueToday")
                      : d === 1
                        ? t("dashboard.dueTomorrow")
                        : t("dashboard.dueInDays", { days: d });
                  return (
                    <li
                      key={sub.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-fg">
                          {sub.name}
                        </p>
                        <p className="text-xs text-muted">
                          {label} ·{" "}
                          {next.toLocaleDateString(dateLoc, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm tabular-nums text-accent-bright">
                        {formatCurrency(getMonthlyMyShare(sub), cur, dateLoc)}
                      </p>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </section>

      {subscriptions.length === 0 && (
        <div className="slice-card border-dashed border-border-subtle p-8 text-center">
          <p className="text-base font-semibold text-fg">
            {t("dashboard.emptyTitle")}
          </p>
          <p className="mt-2 text-sm text-muted">
            {t("dashboard.emptyHint")}
          </p>
          <Link href="/subscriptions" className="slice-btn-primary mt-5 inline-flex">
            {t("dashboard.emptyCta")}
          </Link>
        </div>
      )}
    </div>
  );
}
