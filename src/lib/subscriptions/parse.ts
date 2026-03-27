import { subscriptionRecordSchema } from "@/lib/validation/subscription";
import type { SubscriptionRecord } from "@/lib/validation/subscription";

export function parseSubscriptionRecords(input: unknown): SubscriptionRecord[] {
  if (!Array.isArray(input)) return [];
  const out: SubscriptionRecord[] = [];
  for (const item of input) {
    const r = subscriptionRecordSchema.safeParse(item);
    if (r.success) out.push(r.data);
  }
  return out;
}
