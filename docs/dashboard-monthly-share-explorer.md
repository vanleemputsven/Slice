# Monthly share explorer (dashboard hero)

## Why it exists

The dashboard already shows totals in cards and charts. This block answers a different question: **how each subscription contributes to the monthly number you pay**, in one glance, and **what changes if you remove one**.

## Implementation

- **Component:** `src/components/dashboard/monthly-share-explorer.tsx`
- **Motion:** [framer-motion](https://www.framer.com/motion/) for spring transitions and `AnimatePresence` on the “without this sub” panel. Respects `prefers-reduced-motion` via `useReducedMotion()`.
- **Colours:** Reuses `CHART_SEGMENT_COLORS` (coral–orange ramp) from `chart-data.ts` so the hero matches charts.
- **Data:** Only active subscriptions; values are `getMonthlyMyShare` (after split), same basis as the rest of the app.

## Placement

Rendered at the **top** of the dashboard (`DashboardClient`), above the “Overview” heading, so the primary interactive story loads first.
