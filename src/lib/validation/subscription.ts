import { z } from "zod";
import type { SubscriptionCategory } from "@/lib/subscriptions/categories";
import { SUBSCRIPTION_CATEGORIES } from "@/lib/subscriptions/categories";
import { subscriptionFormValidationByLocale } from "@/lib/i18n/form-validation";
import type { AppLocale } from "@/lib/i18n/locale";

export const billingCycleSchema = z.enum(["monthly", "yearly", "custom"]);

export const subscriptionCategorySchema = z.enum(
  SUBSCRIPTION_CATEGORIES as unknown as [
    SubscriptionCategory,
    ...SubscriptionCategory[],
  ]
);

export type SubscriptionFormValidationMessages = {
  nameRequired: string;
  providerRequired: string;
  dateFormat: string;
  invalidDate: string;
  pricePositive: string;
  customPeriod: string;
  shareCount: string;
};

function isoDateSchema(messages: SubscriptionFormValidationMessages) {
  return z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, messages.dateFormat)
    .refine((s) => !Number.isNaN(Date.parse(s)), messages.invalidDate);
}

function refineSubscriptionFields(
  data: {
    billingCycle: z.infer<typeof billingCycleSchema>;
    customPeriodMonths?: number | undefined;
    shared: boolean;
    shareCount?: number | undefined;
  },
  ctx: z.RefinementCtx,
  messages: SubscriptionFormValidationMessages
) {
  if (data.billingCycle === "custom") {
    if (data.customPeriodMonths == null || data.customPeriodMonths < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: messages.customPeriod,
        path: ["customPeriodMonths"],
      });
    }
  }
  if (data.shared) {
    if (data.shareCount == null || data.shareCount < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: messages.shareCount,
        path: ["shareCount"],
      });
    }
  }
}

function subscriptionFieldsSchema(messages: SubscriptionFormValidationMessages) {
  return z.object({
    name: z.string().min(1, messages.nameRequired).max(120),
    provider: z.string().min(1, messages.providerRequired).max(120),
    iconKey: z.string().max(40).optional(),
    category: subscriptionCategorySchema,
    billingCycle: billingCycleSchema,
    customPeriodMonths: z.coerce.number().int().min(1).max(36).optional(),
    totalPrice: z.coerce.number().positive(messages.pricePositive).max(999_999),
    currency: z.string().length(3).default("USD"),
    shared: z.boolean(),
    shareCount: z.coerce.number().int().min(2).max(50).optional(),
    nextPaymentDate: isoDateSchema(messages),
    notes: z.string().max(500).optional(),
    active: z.boolean(),
    reviewFlag: z.boolean().optional(),
  });
}

export function buildSubscriptionFormSchema(
  messages: SubscriptionFormValidationMessages
) {
  const fields = subscriptionFieldsSchema(messages);
  return fields.superRefine((data, ctx) =>
    refineSubscriptionFields(data, ctx, messages)
  );
}

const defaultFormMessages = subscriptionFormValidationByLocale.en;

/** English validation copy — used for record parsing and default tooling. */
const defaultSubscriptionFields = subscriptionFieldsSchema(defaultFormMessages);

export const subscriptionFormSchema = defaultSubscriptionFields.superRefine(
  (data, ctx) => refineSubscriptionFields(data, ctx, defaultFormMessages)
);

export function subscriptionFormSchemaForLocale(locale: AppLocale) {
  return buildSubscriptionFormSchema(subscriptionFormValidationByLocale[locale]);
}

export type SubscriptionFormInput = z.infer<typeof subscriptionFormSchema>;

export const subscriptionRecordSchema = defaultSubscriptionFields
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
    refineSubscriptionFields(rest, ctx, defaultFormMessages);
  });

export type SubscriptionRecord = z.infer<typeof subscriptionRecordSchema>;
