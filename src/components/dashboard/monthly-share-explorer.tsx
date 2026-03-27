"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CHART_SEGMENT_COLORS } from "@/lib/subscriptions/chart-data";
import { getMonthlyMyShare } from "@/lib/subscriptions/calculations";
import { formatCurrency } from "@/lib/utils/currency";
import type { SubscriptionRecord } from "@/lib/validation/subscription";

type Row = {
  id: string;
  name: string;
  share: number;
  color: string;
};

type MonthlyShareExplorerProps = {
  subscriptions: SubscriptionRecord[];
  currency: string;
};

export function MonthlyShareExplorer({
  subscriptions,
  currency,
}: MonthlyShareExplorerProps) {
  const reduceMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const rows: Row[] = useMemo(() => {
    const active = subscriptions.filter((s) => s.active);
    return [...active]
      .map((s) => ({
        id: s.id,
        name: s.name,
        share: getMonthlyMyShare(s),
        color: "",
      }))
      .filter((r) => r.share > 0)
      .sort((a, b) => b.share - a.share)
      .map((r, i) => ({
        ...r,
        color: CHART_SEGMENT_COLORS[i % CHART_SEGMENT_COLORS.length],
      }));
  }, [subscriptions]);

  const total = useMemo(
    () => rows.reduce((s, r) => s + r.share, 0),
    [rows]
  );

  const selected = selectedId
    ? rows.find((r) => r.id === selectedId)
    : null;
  const highlightedId = selectedId != null ? selectedId : hoveredId;

  const afterRemove = selected ? total - selected.share : null;
  const savings = selected ? selected.share : null;

  const leftPct = useMemo(() => {
    const c: number[] = [];
    let acc = 0;
    for (const r of rows) {
      c.push(acc);
      acc += total > 0 ? (r.share / total) * 100 : 0;
    }
    return c;
  }, [rows, total]);

  useEffect(() => {
    if (selectedId && !rows.some((r) => r.id === selectedId)) {
      setSelectedId(null);
    }
  }, [rows, selectedId]);

  if (rows.length === 0) {
    return (
      <section
        className="slice-card p-5 sm:p-6"
        aria-labelledby="slice-explorer-empty"
      >
        <h2
          id="slice-explorer-empty"
          className="text-base font-semibold text-fg sm:text-lg"
        >
          No subscriptions
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          Add at least one active subscription to see your monthly total here.
        </p>
        <Link
          href="/subscriptions"
          className="slice-btn-primary mt-4 inline-flex text-sm"
        >
          Subscriptions
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    );
  }

  return (
    <section className="slice-card p-5 sm:p-6" aria-labelledby="slice-explorer-title">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p
            id="slice-explorer-title"
            className="text-xs font-medium text-muted"
          >
            Monthly total (your share)
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight text-fg sm:text-4xl">
            {formatCurrency(total, currency)}
            <span className="ml-2 text-lg font-normal text-fg-secondary sm:text-xl">
              / mo
            </span>
          </p>
          <p className="mt-2 max-w-lg text-sm text-muted">
            Bar = share per subscription. Hover to emphasize; click to pin and
            see the total if you remove that line.
          </p>
        </div>
      </div>

      <div
        className="mt-6 overflow-hidden rounded-lg bg-white/[0.03]"
        aria-label="Subscription shares as proportion of monthly total"
      >
        <div className="relative flex h-12 w-full sm:h-14">
          {rows.map((r, i) => {
            const pct = total > 0 ? (r.share / total) * 100 : 0;
            const left = leftPct[i] ?? 0;
            const isOn = highlightedId === r.id;
            const isSel = selectedId === r.id;
            const dimOthers = highlightedId != null;

            return (
              <motion.button
                key={r.id}
                id={`slice-seg-${r.id}`}
                type="button"
                aria-pressed={isSel}
                title={`${r.name}: ${formatCurrency(r.share, currency)}/mo`}
                className="absolute top-0 flex h-full items-end justify-center overflow-hidden border-r border-canvas last:border-r-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                style={{
                  left: `${left}%`,
                  width: `${pct}%`,
                  backgroundColor: r.color,
                }}
                initial={false}
                animate={{
                  filter:
                    dimOthers && !isOn
                      ? "brightness(0.52) saturate(0.9)"
                      : isOn
                        ? "brightness(1.06)"
                        : "brightness(1)",
                  scaleY:
                    dimOthers && !isOn
                      ? reduceMotion
                        ? 1
                        : 0.9
                      : isOn && !reduceMotion
                        ? 1.03
                        : 1,
                  zIndex: isOn ? 2 : 0,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0.12 }
                    : { type: "spring", stiffness: 420, damping: 28 }
                }
                whileHover={
                  reduceMotion || (dimOthers && !isOn)
                    ? undefined
                    : { scaleY: 1.05 }
                }
                whileTap={{ scaleY: 0.97 }}
                onMouseEnter={() => setHoveredId(r.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(r.id)}
                onBlur={() => setHoveredId(null)}
                onClick={() =>
                  setSelectedId((id) => (id === r.id ? null : r.id))
                }
              >
                <span className="sr-only">
                  {r.name}, {formatCurrency(r.share, currency)} per month,{" "}
                  {pct.toFixed(1)} percent
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-fg-secondary">
        {rows.slice(0, 12).map((r) => (
          <li key={r.id} className="flex items-center gap-1.5">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: r.color }}
              aria-hidden
            />
            <span className="max-w-[10rem] truncate">{r.name}</span>
          </li>
        ))}
        {rows.length > 12 ? (
          <li className="text-muted">+{rows.length - 12}</li>
        ) : null}
      </ul>

      <div className="mt-5 min-h-[4.5rem] border-t border-white/[0.07] pt-5">
        <AnimatePresence mode="wait">
          {selected && afterRemove != null && savings != null ? (
            <motion.div
              key={selected.id}
              role="status"
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={
                reduceMotion
                  ? { duration: 0.12 }
                  : { type: "spring", stiffness: 400, damping: 32 }
              }
            >
              <p className="text-sm text-fg">
                Without <strong className="font-semibold">{selected.name}</strong>
                :{" "}
                <span className="font-mono font-semibold tabular-nums">
                  {formatCurrency(afterRemove, currency)}
                </span>
                <span className="text-fg-secondary"> / mo</span>
                <span className="text-muted"> — </span>
                <span className="font-mono tabular-nums text-accent-bright">
                  −{formatCurrency(savings, currency)}
                </span>
                <span className="text-muted">
                  {" "}
                  ({total > 0 ? ((savings / total) * 100).toFixed(0) : 0}% of
                  this total)
                </span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/subscriptions?highlight=${selected.id}`}
                  className="slice-btn-primary !px-4 !py-2 text-xs sm:text-sm"
                >
                  Open row
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  className="slice-btn-secondary !px-4 !py-2 text-xs sm:text-sm"
                  onClick={() => setSelectedId(null)}
                >
                  Clear
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted"
            >
              Click a segment to pin it.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
