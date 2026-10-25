import type { SubscriptionCategory } from "@/lib/subscriptions/categories";
import {
  subscriptionFormSchema,
  type SubscriptionFormInput,
} from "@/lib/validation/subscription";

/** Known services the questions can name. `other` asks for a name. */
export const GUIDED_SERVICE_IDS = [
  "netflix",
  "spotify",
  "disney",
  "youtube",
  "prime",
  "icloud",
  "fitness",
  "mobile",
  "chatgpt",
  "other",
] as const;

export type GuidedServiceId = (typeof GUIDED_SERVICE_IDS)[number];

const SERVICE_CATEGORY: Record<GuidedServiceId, SubscriptionCategory> = {
  netflix: "Entertainment",
  spotify: "Entertainment",
  disney: "Entertainment",
  youtube: "Entertainment",
  prime: "Entertainment",
  icloud: "Utilities",
  fitness: "Health",
  mobile: "Utilities",
  chatgpt: "Productivity",
  other: "Other",
};

export function guidedCategory(id: GuidedServiceId): SubscriptionCategory {
  return SERVICE_CATEGORY[id];
}

/** Known services skip the name question. */
export function guidedQuestionCount(id: GuidedServiceId): number {
  return id === "other" ? 5 : 4;
}

export type GuidedDraft = {
  serviceId: GuidedServiceId;
  name: string;
  billingCycle: "monthly" | "yearly";
  totalPrice: number;
  nextPaymentDate: string;
  shared: boolean;
  shareCount: number | null;
  currency: string;
};

/** Turns one finished interview into a subscription. Incomplete answers return null. */
export function buildGuidedSubscription(
  draft: GuidedDraft
): SubscriptionFormInput | null {
  const name = draft.name.trim();
  if (name.length === 0) return null;
  if (!Number.isFinite(draft.totalPrice) || draft.totalPrice <= 0) return null;
  if (draft.shared && (draft.shareCount == null || draft.shareCount < 2)) {
    return null;
  }

  const parsed = subscriptionFormSchema.safeParse({
    name,
    provider: name,
    iconKey: draft.serviceId === "other" ? "" : draft.serviceId,
    category: guidedCategory(draft.serviceId),
    billingCycle: draft.billingCycle,
    totalPrice: draft.totalPrice,
    currency: draft.currency,
    shared: draft.shared,
    shareCount: draft.shared ? draft.shareCount ?? undefined : undefined,
    nextPaymentDate: draft.nextPaymentDate,
    notes: "",
    active: true,
    reviewFlag: false,
  });

  return parsed.success ? parsed.data : null;
}
