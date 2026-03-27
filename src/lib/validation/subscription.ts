import { z } from "zod";
import type { SubscriptionCategory } from "@/lib/subscriptions/categories";
import { SUBSCRIPTION_CATEGORIES } from "@/lib/subscriptions/categories";

export const billingCycleSchema = z.enum(["monthly", "yearly", "custom"]);

export const subscriptionCategorySchema = z.enum(
  SUBSCRIPTION_CATEGORIES as unknown as [
    SubscriptionCategory,
    ...SubscriptionCategory[],
  ]
);

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

const subscriptionFieldsSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  provider: z.string().min(1, "Provider is required").max(120),
  iconKey: z.string().max(40).optional(),
  category: subscriptionCategorySchema,
  billingCycle: billingCycleSchema,
  customPeriodMonths: z.coerce.number().int().min(1).max(36).optional(),
  totalPrice: z.coerce.number().positive("Price must be positive").max(999_999),
  currency: z.string().length(3).default("USD"),
  shared: z.boolean(),
  shareCount: z.coerce.number().int().min(2).max(50).optional(),
  nextPaymentDate: isoDate,
  notes: z.string().max(500).optional(),
  active: z.boolean(),
  reviewFlag: z.boolean().optional(),
});

function refineSubscriptionFields(
  data: z.infer<typeof subscriptionFieldsSchema>,
  ctx: z.RefinementCtx
) {
  if (data.billingCycle === "custom") {
    if (data.customPeriodMonths == null || data.customPeriodMonths < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter billing period in months",
        path: ["customPeriodMonths"],
      });
    }
  }
  if (data.shared) {
    if (data.shareCount == null || data.shareCount < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter how many people split this (2+)",
        path: ["shareCount"],
      });
    }
  }
}

export const subscriptionFormSchema = subscriptionFieldsSchema.superRefine(
  refineSubscriptionFields
);

export type SubscriptionFormInput = z.infer<typeof subscriptionFormSchema>;

export const subscriptionRecordSchema = subscriptionFieldsSchema
  .extend({
    id: z.string().uuid(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .superRefine((data, ctx) => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = data;
    void _id;
    void _c;
    void _u;
    refineSubscriptionFields(rest, ctx);
  });

export type SubscriptionRecord = z.infer<typeof subscriptionRecordSchema>;
