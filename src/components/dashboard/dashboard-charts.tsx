"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SubscriptionRecord } from "@/lib/validation/subscription";
import {
  CHART_AXIS_MUTED,
  CHART_GRID_STROKE,
  CHART_SEGMENT_COLORS,
  spendByCategory,
  topByPersonalSpend,
} from "@/lib/subscriptions/chart-data";
import { formatCurrency } from "@/lib/utils/currency";

type DashboardChartsProps = {
  subscriptions: SubscriptionRecord[];
  currency: string;
};

function ChartTooltip({
  active,
  payload,
  label,
  currency,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number;
  currency: string;
  formatter?: (value: number, payload: Record<string, unknown>) => string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const v = typeof item.value === "number" ? item.value : 0;
  const p = (item.payload ?? {}) as Record<string, unknown>;
  const title =
    (typeof p.name === "string" ? p.name : null) ??
    (typeof label === "string" ? label : null) ??
    (typeof item.name === "string" ? item.name : "—");
  const text = formatter ? formatter(v, p) : formatCurrency(v, currency);
  return (
    <div className="rounded-md bg-[rgb(20_22_28/0.96)] px-2.5 py-2 text-xs shadow-lg ring-1 ring-accent/25">
      <p className="font-medium text-fg">{title}</p>
      <p className="mt-0.5 font-mono tabular-nums text-accent-bright">{text}</p>
      {typeof p.fullMonthly === "number" && p.shared === true ? (
        <p className="mt-1 text-[11px] text-muted">
          Full {formatCurrency(p.fullMonthly as number, currency)}/mo
        </p>
      ) : null}
    </div>
  );
}

export function DashboardCharts({
  subscriptions,
  currency,
}: DashboardChartsProps) {
  const categories = useMemo(
    () => spendByCategory(subscriptions),
    [subscriptions]
  );
  const topSpend = useMemo(
    () => topByPersonalSpend(subscriptions, 8),
    [subscriptions]
  );

  const pieData = useMemo(
    () =>
      categories.map((c) => ({
        name: c.category,
        value: Math.round(c.value * 100) / 100,
        percent: Math.round(c.percent * 10) / 10,
      })),
    [categories]
  );

  const [pieActive, setPieActive] = useState<number | undefined>(undefined);

  const hasActiveSubs = subscriptions.some((s) => s.active);
  const hasPie = pieData.length > 0;
  const hasBars = topSpend.length > 0;

  if (!hasActiveSubs) {
    return (
      <section aria-label="Charts" className="slice-card px-5 py-6 sm:px-6">
        <h2 className="text-base font-semibold text-fg">Spending</h2>
        <p className="mt-2 text-sm text-muted">
          Add subscriptions for category split and ranking.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Spending charts" className="slice-card overflow-hidden">
      <div className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
        <h2 className="text-base font-semibold text-fg">Spending</h2>
        <p className="mt-1 text-sm text-muted">
          By category and by line item. Percent = share of your monthly total.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-white/[0.07]">
        <div className="px-5 py-5 sm:px-6">
          <h3 className="mt-0 text-sm font-medium text-fg">Category</h3>
          <div className="mt-2 h-[248px] w-full min-h-[220px]">
            {hasPie ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 8, bottom: 8 }}>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={88}
                      paddingAngle={2}
                      stroke="transparent"
                      animationBegin={0}
                      animationDuration={420}
                      onMouseEnter={(_, i) => setPieActive(i)}
                      onMouseLeave={() => setPieActive(undefined)}
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            CHART_SEGMENT_COLORS[
                              i % CHART_SEGMENT_COLORS.length
                            ]
                          }
                          className="outline-none"
                          style={{
                            opacity:
                              pieActive === undefined || pieActive === i
                                ? 1
                                : 0.35,
                            transition: "opacity 0.2s ease",
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={
                        <ChartTooltip
                          currency={currency}
                          formatter={(v, pl) => {
                            const pct = pl.percent as number | undefined;
                            return `${formatCurrency(v, currency)}/mo${pct != null ? ` · ${pct}%` : ""}`;
                          }}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted">
                No data.
              </p>
            )}
          </div>
          {hasPie ? (
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px]">
              {pieData.map((d, i) => (
                <li key={d.name}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-left text-fg-secondary transition-colors hover:text-fg"
                    onClick={() =>
                      setPieActive(pieActive === i ? undefined : i)
                    }
                  >
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          CHART_SEGMENT_COLORS[
                            i % CHART_SEGMENT_COLORS.length
                          ],
                      }}
                      aria-hidden
                    />
                    <span>{d.name}</span>
                    <span className="font-mono text-muted">{d.percent}%</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="px-5 py-5 sm:px-6">
          <h3 className="text-sm font-medium text-fg">Ranking (your share)</h3>
          <div className="mt-2 h-[268px] w-full min-h-[240px]">
            {hasBars ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topSpend}
                  margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                  barCategoryGap="14%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={CHART_GRID_STROKE}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: CHART_AXIS_MUTED, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: CHART_GRID_STROKE }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={104}
                    tick={{ fill: "rgb(246 247 251 / 0.72)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgb(255 88 77 / 0.06)" }}
                    content={
                      <ChartTooltip
                        currency={currency}
                        formatter={(v, pl) => {
                          const full = pl.fullMonthly as number;
                          const sh = pl.shared as boolean;
                          return `${formatCurrency(v, currency)}/mo${sh ? ` · full ${formatCurrency(full, currency)}` : ""}`;
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="myShare"
                    radius={[0, 6, 6, 0]}
                    animationDuration={450}
                  >
                    {topSpend.map((row, i) => (
                      <Cell
                        key={row.id}
                        fill={
                          CHART_SEGMENT_COLORS[i % CHART_SEGMENT_COLORS.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted">
                No data.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
