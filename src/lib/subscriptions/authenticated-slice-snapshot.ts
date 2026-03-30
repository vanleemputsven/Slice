import type { Preferences } from "@/lib/validation/preferences";
import type { SubscriptionRecord } from "@/lib/validation/subscription";

/** Server-fetched user data used to hydrate the client store before Supabase auth resolves. */
export type AuthenticatedSliceSnapshot = {
  userId: string;
  subscriptions: SubscriptionRecord[];
  preferences: Preferences;
};
