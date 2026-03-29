import type { AppLocale } from "@/lib/i18n/locale";
import { sliceT } from "@/lib/i18n/messages";
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
  currencyCode: string = "USD",
  locale: AppLocale = "en"
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

  if (topAnnual && topMonthly && topAnnual.id !== topMonthly.id) {
    insights.push({
      id: "yearly-leader",
      title: sliceT(locale, "insights.yearlyLeader.title"),
      description: sliceT(locale, "insights.yearlyLeader.description", {
        annualName: topAnnual.name,
        annualAmount: formatCurrency(getAnnualMyShare(topAnnual), currencyCode),
        monthlyName: topMonthly.name,
      }),
      tip: sliceT(locale, "insights.yearlyLeader.tip"),
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
        title: sliceT(locale, "insights.sharedLargest.title"),
        description: sliceT(locale, "insights.sharedLargest.description", {
          name: topShared.name,
          yours: formatCurrency(getMonthlyMyShare(topShared), currencyCode),
          full,
        }),
        tip: sliceT(locale, "insights.sharedLargest.tip"),
        variant: "neutral",
      });
    }
  }

  const reviewCandidates = active.filter((s) => s.reviewFlag);
  if (reviewCandidates.length > 0) {
    const names = reviewCandidates
      .slice(0, 3)
      .map((s) => s.name)
      .join(", ");
    const more =
      reviewCandidates.length > 3
        ? sliceT(locale, "insights.flagged.more", {
            n: reviewCandidates.length - 3,
          })
        : "";
    const description =
      reviewCandidates.length === 1
        ? sliceT(locale, "insights.flagged.descriptionOne", { names, more })
        : sliceT(locale, "insights.flagged.descriptionMany", {
            count: reviewCandidates.length,
            names,
            more,
          });
    insights.push({
      id: "flagged",
      title: sliceT(locale, "insights.flagged.title"),
      description,
      tip: sliceT(locale, "insights.flagged.tip"),
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
      title: sliceT(locale, "insights.cluster.title"),
      description: sliceT(locale, "insights.cluster.description", {
        count: soon.length,
      }),
      tip: sliceT(locale, "insights.cluster.tip"),
      variant: "neutral",
    });
  }

  return insights.slice(0, 5);
}
