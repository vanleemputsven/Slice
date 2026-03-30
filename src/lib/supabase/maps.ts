import { preferencesSchema, type Preferences } from "@/lib/validation/preferences";
import {
  subscriptionRecordSchema,
  type SubscriptionRecord,
} from "@/lib/validation/subscription";

export type SubscriptionRow = {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  icon_key: string | null;
  category: string;
  billing_cycle: string;
  custom_period_months: number | null;
  total_price: number | string;
  currency: string;
  shared: boolean;
  share_count: number | null;
  next_payment_date: string;
  notes: string | null;
  active: boolean;
  review_flag: boolean;
  created_at: string;
  updated_at: string;
};

function num(v: number | string): number {
  return typeof v === "string" ? Number(v) : v;
}

/**
 * Postgres / PostgREST often returns timestamps with a space separator or offset
 * without "T". Zod's z.string().datetime() expects RFC 3339; normalize via Date.
 */
function toIsoDateTimeString(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid timestamp from database: ${value}`);
  }
  return d.toISOString();
}

export function rowToSubscriptionRecord(row: SubscriptionRow): SubscriptionRecord {
  const nextPayment =
    typeof row.next_payment_date === "string"
      ? row.next_payment_date.slice(0, 10)
      : String(row.next_payment_date);
  return subscriptionRecordSchema.parse({
    id: row.id,
    name: row.name,
    provider: row.provider,
    iconKey: row.icon_key ?? undefined,
    category: row.category,
    billingCycle: row.billing_cycle,
    customPeriodMonths: row.custom_period_months ?? undefined,
    totalPrice: num(row.total_price),
    currency: row.currency,
    shared: row.shared,
    shareCount: row.share_count ?? undefined,
    nextPaymentDate: nextPayment,
    notes: row.notes ?? undefined,
    active: row.active,
    reviewFlag: row.review_flag,
    createdAt: toIsoDateTimeString(row.created_at),
    updatedAt: toIsoDateTimeString(row.updated_at),
  });
}

/** Full row for insert (includes id, user_id). */
export function subscriptionInsertFromRecord(
  userId: string,
  rec: SubscriptionRecord
): Record<string, unknown> {
  return {
    id: rec.id,
    user_id: userId,
    name: rec.name,
    provider: rec.provider,
    icon_key: rec.iconKey ?? null,
    category: rec.category,
    billing_cycle: rec.billingCycle,
    custom_period_months:
      rec.billingCycle === "custom" ? (rec.customPeriodMonths ?? null) : null,
    total_price: rec.totalPrice,
    currency: rec.currency,
    shared: rec.shared,
    share_count: rec.shared ? (rec.shareCount ?? null) : null,
    next_payment_date: rec.nextPaymentDate,
    notes: rec.notes ?? null,
    active: rec.active,
    review_flag: rec.reviewFlag ?? false,
    created_at: rec.createdAt,
    updated_at: rec.updatedAt,
  };
}

/** Mutable columns for update (by id). */
export function subscriptionUpdateFromRecord(
  rec: SubscriptionRecord
): Record<string, unknown> {
  return {
    name: rec.name,
    provider: rec.provider,
    icon_key: rec.iconKey ?? null,
    category: rec.category,
    billing_cycle: rec.billingCycle,
    custom_period_months:
      rec.billingCycle === "custom" ? (rec.customPeriodMonths ?? null) : null,
    total_price: rec.totalPrice,
    currency: rec.currency,
    shared: rec.shared,
    share_count: rec.shared ? (rec.shareCount ?? null) : null,
    next_payment_date: rec.nextPaymentDate,
    notes: rec.notes ?? null,
    active: rec.active,
    review_flag: rec.reviewFlag ?? false,
    updated_at: rec.updatedAt,
  };
}

export type PreferencesRow = {
  user_id: string;
  hourly_wage: number | string | null;
  hours_per_workday: number;
  currency: string;
  locale: string;
  updated_at: string;
  preferred_name?: string | null;
  welcome_completed_at?: string | null;
};

export function rowToPreferences(row: PreferencesRow): Preferences {
  const hourlyRaw = row.hourly_wage;
  const hourly =
    hourlyRaw === null || hourlyRaw === undefined
      ? null
      : typeof hourlyRaw === "string"
        ? Number(hourlyRaw)
        : hourlyRaw;
  const rawName = row.preferred_name;
  const preferredName =
    rawName == null || String(rawName).trim() === ""
      ? null
      : String(rawName).trim().slice(0, 80);

  return preferencesSchema.parse({
    hourlyWage: hourly,
    hoursPerWorkday: row.hours_per_workday,
    currency: row.currency,
    locale: row.locale,
    preferredName,
  });
}

export function preferencesToUpsert(
  userId: string,
  p: Preferences
): Record<string, unknown> {
  return {
    user_id: userId,
    hourly_wage: p.hourlyWage,
    hours_per_workday: p.hoursPerWorkday,
    currency: p.currency,
    locale: p.locale,
    updated_at: new Date().toISOString(),
  };
}
