export const SUBSCRIPTION_CATEGORIES = [
  "Entertainment",
  "Productivity",
  "Utilities",
  "Health",
  "Education",
  "Cloud / Developer Tools",
  "Other",
] as const;

export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];
