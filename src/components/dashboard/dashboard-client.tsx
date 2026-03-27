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
import { DashboardInsights } from "@/components/dashboard/dashboard-insights";
import { MonthlyShareExplorer } from "@/components/dashboard/monthly-share-explorer";
import { TopCostFocus } from "@/components/dashboard/top-cost-focus";

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="slice-card h-56 rounded-[var(--slice-radius-xl)] bg-white/[0.04]" />
      <div className="h-8 w-48 rounded-2xl bg-white/[0.06]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="slice-card h-28" />
        ))}
      </div>
    </div>
  );
}

export function DashboardClient() {
  const {
    ready,
    subscriptions,
    preferences,
    setHourlyWage,
    setHoursPerWorkday,
  } = useSubscriptions();

  const summary = useMemo(
    () => summarizeSubscriptions(subscriptions, new Date()),
    [subscriptions]
  );

  const insights = useMemo(
    () =>
      buildInsights(subscriptions, new Date(), preferences.currency ?? "USD"),
    [subscriptions, preferences.currency]
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
    return (
      <div className="animate-slice-in">
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="animate-slice-in space-y-10">
      <MonthlyShareExplorer subscriptions={subscriptions} currency={cur} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
            Overview
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted">
            Totals, charts, notes, renewals, hours at your rate.
          </p>
        </div>
        <Link
          href="/subscriptions"
          className="slice-btn-secondary shrink-0 self-start sm:self-auto"
        >
          Manage subscriptions
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <section
        aria-labelledby="dash-stats"
        className="slice-card p-5 sm:p-6"
      >
        <h2 id="dash-stats" className="sr-only">
          Summary statistics
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          <article className="xl:border-r xl:border-white/[0.08] xl:pr-6">
            <div className="flex items-center gap-2 text-muted">
              <Wallet className="size-4 text-accent" aria-hidden />
              <span className="slice-label">Month (yours)</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-fg sm:text-3xl">
              {formatCurrency(summary.monthlyMyShare, cur)}
            </p>
            <p className="mt-1 text-xs text-muted">
              Full plans{" "}
              <span className="tabular-nums text-fg-secondary">
                {formatCurrency(summary.monthlyFullTotal, cur)}
              </span>
              /mo
            </p>
          </article>

          <article className="xl:border-r xl:border-white/[0.08] xl:pr-6">
            <div className="flex items-center gap-2 text-muted">
              <PieChart className="size-4 text-accent" aria-hidden />
              <span className="slice-label">Year (yours)</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-fg sm:text-3xl">
              {formatCurrency(summary.yearlyMyShare, cur)}
            </p>
            <p className="mt-1 text-xs text-muted">×12 on current list</p>
          </article>

          <article className="xl:border-r xl:border-white/[0.08] xl:pr-6">
            <div className="flex items-center gap-2 text-muted">
              <Layers className="size-4 text-accent" aria-hidden />
              <span className="slice-label">Active</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-fg sm:text-3xl">
              {summary.activeCount}
            </p>
            <p className="mt-1 text-xs text-muted">
              {summary.upcomingCount} due in 30d
            </p>
          </article>

          <article>
            <div className="flex items-center gap-2 text-muted">
              <Share2 className="size-4 text-accent" aria-hidden />
              <span className="slice-label">Shared plans</span>
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-fg sm:text-3xl">
              {summary.sharedCount}
            </p>
            <p className="mt-1 text-xs text-muted">Split count on each row</p>
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
              Work time
            </h2>
            <p className="mt-1 text-sm text-muted">
              Hours (and rough workdays) to cover your subscription share at
              your rate.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:items-end">
              <label className="block">
                <span className="slice-label">Hourly take-home</span>
              <input
                type="number"
                min={0}
                step={0.5}
                className="slice-input tabular-nums"
                value={hourly ?? ""}
                placeholder="e.g. 42"
                aria-label="Hourly wage for burn rate"
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
              <span className="slice-label">Hours / workday</span>
              <input
                type="number"
                min={1}
                max={24}
                step={0.5}
                className="slice-input tabular-nums"
                value={preferences.hoursPerWorkday ?? 8}
                aria-label="Hours per workday for workday equivalent"
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (!Number.isNaN(n) && n > 0) setHoursPerWorkday(n);
                }}
              />
            </label>
          </div>

          {hourly == null || hourly <= 0 ? (
            <p className="mt-4 text-sm text-muted">
              Add a rate to see hours and workdays.
            </p>
          ) : (
            <dl className="mt-6 space-y-4 border-t border-white/[0.07] pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="slice-label">Hours / month</dt>
                <dd className="font-mono text-xl font-semibold tabular-nums text-fg">
                  {hoursPerMo != null ? hoursPerMo.toFixed(1) : "—"}
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="slice-label">
                  Workdays / mo ({preferences.hoursPerWorkday ?? 8} h)
                </dt>
                <dd className="font-mono text-xl font-semibold tabular-nums text-fg">
                  {workdays != null ? workdays.toFixed(2) : "—"}
                </dd>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-2 border-t border-white/[0.07] pt-4">
                <dt className="flex items-center gap-2 slice-label">
                  <AlarmClock className="size-3.5 text-accent" aria-hidden />
                  Hours / year
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
              Upcoming
            </h2>
            <p className="mt-1 text-xs text-muted">
              Week {thisWeek.length} · 30d {thisMonth.length}
            </p>
            <ul className="mt-4 space-y-0 divide-y divide-white/[0.07]">
              {upcoming.length === 0 ? (
                <li className="py-3 text-sm text-muted">None active.</li>
              ) : (
                upcoming.map(({ sub, next }) => {
                  const d = daysUntil(next, new Date());
                  const label =
                    d === 0 ? "Today" : d === 1 ? "Tomorrow" : `In ${d}d`;
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
                          {next.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm tabular-nums text-accent-bright">
                        {formatCurrency(getMonthlyMyShare(sub), cur)}
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
            No subscriptions yet
          </p>
          <p className="mt-2 text-sm text-muted">
            Add subscriptions on the subscriptions page, or load sample data to
            try the app.
          </p>
          <Link href="/subscriptions" className="slice-btn-primary mt-5 inline-flex">
            Go to subscriptions
          </Link>
        </div>
      )}
    </div>
  );
}
