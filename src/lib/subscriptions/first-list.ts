import { z } from "zod";
import { subscriptionCategorySchema } from "@/lib/validation/subscription";

/** Session handoff from the landing scan to the first signed-in list. */
export const FIRST_LIST_STORAGE_KEY = "slice-first-list-v1";

export const firstListRowSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: subscriptionCategorySchema,
  billingCycle: z.enum(["monthly", "yearly"]),
  totalPrice: z.number().positive().max(999_999),
  nextPaymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const firstListDraftSchema = z.object({
  rows: z.array(firstListRowSchema).min(1).max(8),
});

export type FirstListRow = z.infer<typeof firstListRowSchema>;

export function parseFirstListDraft(raw: unknown): FirstListRow[] | null {
  const parsed = firstListDraftSchema.safeParse(raw);
  return parsed.success ? parsed.data.rows : null;
}

export function storeFirstListDraft(rows: FirstListRow[]): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(
    FIRST_LIST_STORAGE_KEY,
    JSON.stringify({ rows })
  );
}

/** Reads the draft once. A second call returns null so a refresh cannot insert twice. */
export function takeFirstListDraft(): FirstListRow[] | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(FIRST_LIST_STORAGE_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(FIRST_LIST_STORAGE_KEY);
  try {
    return parseFirstListDraft(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}
