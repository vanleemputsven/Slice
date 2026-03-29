import type { SubscriptionCategory } from "@/lib/subscriptions/categories";
import type { AppLocale } from "@/lib/i18n/locale";

const nl: Record<SubscriptionCategory, string> = {
  Entertainment: "Entertainment",
  Productivity: "Productiviteit",
  Utilities: "Nutsvoorzieningen / tools",
  Health: "Gezondheid",
  Education: "Onderwijs",
  "Cloud / Developer Tools": "Cloud / developer tools",
  Other: "Overig",
};

export function subscriptionCategoryLabel(
  category: SubscriptionCategory,
  locale: AppLocale
): string {
  return locale === "nl" ? nl[category] : category;
}
