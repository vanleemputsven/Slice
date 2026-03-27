import type { SubscriptionRecord } from "@/lib/validation/subscription";
import { getMonthlyMyShare, getMonthlyTotalPrice } from "./calculations";

/**
 * Coral → orange ramp only (one family on dark UI).
 * Use index modulo length for segments; contrast comes from lightness spread.
 */
export const CHART_SEGMENT_COLORS = [
  "#FF584D",
  "#FF7D76",
  "#E04F3D",
  "#FB923C",
  "#F97316",
  "#EA580C",
  "#FDA174",
  "#C2410C",
] as const;

/** Bar / grid lines that stay on-theme without rainbow charts. */
export const CHART_AXIS_MUTED = "rgb(255 88 77 / 0.22)";
export const CHART_GRID_STROKE = "rgb(255 88 77 / 0.09)";

export type CategorySlice = {
  category: string;
  value: number;
  percent: number;
};

export function spendByCategory(
  subs: SubscriptionRecord[]
): CategorySlice[] {
  const active = subs.filter((s) => s.active);
  const map = new Map<string, number>();
  for (const s of active) {
    const m = getMonthlyMyShare(s);
    map.set(s.category, (map.get(s.category) ?? 0) + m);
  }
  const entries = [...map.entries()]
    .filter(([, v]) => v > 0)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
  const total = entries.reduce((s, e) => s + e.value, 0);
  if (total <= 0) return [];
  return entries.map((e) => ({
    category: e.category,
    value: e.value,
    percent: (e.value / total) * 100,
  }));
}

export type TopSpendRow = {
  id: string;
  name: string;
  myShare: number;
  fullMonthly: number;
  shared: boolean;
};

export function topByPersonalSpend(
  subs: SubscriptionRecord[],
  limit = 8
): TopSpendRow[] {
  const active = subs.filter((s) => s.active);
  return [...active]
    .map((s) => ({
      id: s.id,
      name: s.name,
      myShare: getMonthlyMyShare(s),
      fullMonthly: getMonthlyTotalPrice(s),
      shared: s.shared,
    }))
    .sort((a, b) => b.myShare - a.myShare)
    .slice(0, limit);
}
