import type { SubscriptionRecord } from "@/lib/validation/subscription";
import {
  getAnnualMyShare,
  getMonthlyMyShare,
  getMonthlyTotalPrice,
  getNextPaymentOnOrAfter,
} from "@/lib/subscriptions/calculations";
import { formatCurrency } from "@/lib/utils/currency";

export type CostInsight = {
  id: string;
  title: string;
  description: string;
  /** Short next step so the card feels actionable */
  tip?: string;
  variant: "neutral" | "warning" | "accent";
};

export function buildInsights(
  subs: SubscriptionRecord[],
  now: Date = new Date(),
  currencyCode: string = "USD"
): CostInsight[] {
  const active = subs.filter((s) => s.active);
  const insights: CostInsight[] = [];

  if (active.length === 0) return insights;

  const topMonthly = [...active].sort(
    (a, b) => getMonthlyMyShare(b) - getMonthlyMyShare(a)
  )[0];

  const byAnnualPersonal = [...active].sort(
    (a, b) => getAnnualMyShare(b) - getAnnualMyShare(a)
  );
  const topAnnual = byAnnualPersonal[0];

  if (
    topAnnual &&
    topMonthly &&
    topAnnual.id !== topMonthly.id
  ) {
    insights.push({
      id: "yearly-leader",
      title: "Yearly total ≠ monthly leader",
      description: `Highest yearly cost for you: ${topAnnual.name} (${formatCurrency(getAnnualMyShare(topAnnual), currencyCode)}/yr). Highest monthly share: ${topMonthly.name}. Annual billing often changes the order.`,
      tip: "Open each subscription and check cycle and price if you are choosing what to cancel.",
      variant: "accent",
    });
  }

  const shared = active.filter((s) => s.shared);
  if (shared.length > 0) {
    const topShared = [...shared].sort(
      (a, b) => getMonthlyMyShare(b) - getMonthlyMyShare(a)
    )[0];
    if (topShared) {
      const full = formatCurrency(
        getMonthlyTotalPrice(topShared),
        currencyCode
      );
      insights.push({
        id: "share-visibility",
        title: "Biggest shared subscription",
        description: `${topShared.name}: you pay ${formatCurrency(getMonthlyMyShare(topShared), currencyCode)}/mo; full bill about ${full}/mo.`,
        tip: "Update the number of people if the split changed.",
        variant: "neutral",
      });
    }
  }

  const reviewCandidates = active.filter((s) => s.reviewFlag);
  if (reviewCandidates.length > 0) {
    const names = reviewCandidates.slice(0, 3).map((s) => s.name).join(", ");
    const more =
      reviewCandidates.length > 3
        ? ` (+${reviewCandidates.length - 3} more)`
        : "";
    insights.push({
      id: "flagged",
      title: "Flagged for review",
      description: `${reviewCandidates.length} item${reviewCandidates.length === 1 ? "" : "s"}: ${names}${more}.`,
      tip: "Decide keep, downgrade, or cancel when you have a minute.",
      variant: "warning",
    });
  }

  const soon = active.filter((s) => {
    const next = getNextPaymentOnOrAfter(s, now);
    const ms = next.getTime() - now.getTime();
    const days = ms / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 14;
  });
  if (soon.length >= 3) {
    insights.push({
      id: "cluster",
      title: "Many renewals in two weeks",
      description: `${soon.length} subscriptions have a payment in the next 14 days.`,
      tip: "Skim the due dates so nothing hits the same day by surprise.",
      variant: "neutral",
    });
  }

  return insights.slice(0, 5);
}
