import type { SubscriptionRecord } from "@/lib/validation/subscription";

/** Full subscription cost averaged per month (before splitting). */
export function getMonthlyTotalPrice(sub: SubscriptionRecord): number {
  if (!sub.active) return 0;
  switch (sub.billingCycle) {
    case "monthly":
      return sub.totalPrice;
    case "yearly":
      return sub.totalPrice / 12;
    case "custom": {
      const m = sub.customPeriodMonths ?? 1;
      return sub.totalPrice / m;
    }
    default:
      return 0;
  }
}

/** Personal monthly cost after share split. */
export function getMonthlyMyShare(sub: SubscriptionRecord): number {
  const base = getMonthlyTotalPrice(sub);
  if (!sub.shared) return base;
  const n = sub.shareCount ?? 1;
  return base / n;
}

export function getAnnualTotalPrice(sub: SubscriptionRecord): number {
  return getMonthlyTotalPrice(sub) * 12;
}

export function getAnnualMyShare(sub: SubscriptionRecord): number {
  return getMonthlyMyShare(sub) * 12;
}

export type SubscriptionTotals = {
  monthlyMyShare: number;
  yearlyMyShare: number;
  monthlyFullTotal: number;
  yearlyFullTotal: number;
  activeCount: number;
  sharedCount: number;
  upcomingCount: number;
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** A stored `YYYY-MM-DD` is that calendar day, not UTC midnight. */
function parseCalendarDate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return new Date(Number.NaN);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Local calendar day. `toISOString().slice(0, 10)` is the UTC day and can be yesterday or tomorrow. */
export function formatCalendarDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d;
}

/** The charge date after `dueOn`, one cycle later. Recording a charge stores this. */
export function nextCycleDate(
  sub: Pick<SubscriptionRecord, "billingCycle" | "customPeriodMonths">,
  dueOn: string
): string | null {
  const due = parseCalendarDate(dueOn);
  if (Number.isNaN(due.getTime())) return null;
  const months =
    sub.billingCycle === "yearly"
      ? 12
      : sub.billingCycle === "custom"
        ? Math.max(1, sub.customPeriodMonths ?? 1)
        : 1;
  return formatCalendarDate(addMonths(due, months));
}

/** Next occurrence of payment on or after `from` based on billing cycle. */
export function getNextPaymentOnOrAfter(
  sub: SubscriptionRecord,
  from: Date
): Date {
  const anchor = startOfDay(parseCalendarDate(sub.nextPaymentDate));
  if (anchor >= startOfDay(from)) return anchor;

  let cursor = new Date(anchor);
  const cap = 500;
  let i = 0;
  while (cursor < startOfDay(from) && i < cap) {
    switch (sub.billingCycle) {
      case "monthly":
        cursor = addMonths(cursor, 1);
        break;
      case "yearly":
        cursor = addMonths(cursor, 12);
        break;
      case "custom":
        cursor = addMonths(cursor, sub.customPeriodMonths ?? 1);
        break;
    }
    i += 1;
  }
  return cursor;
}

export function daysUntil(date: Date, from: Date = new Date()): number {
  const a = startOfDay(from).getTime();
  const b = startOfDay(date).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function summarizeSubscriptions(
  subs: SubscriptionRecord[],
  reference: Date = new Date()
): SubscriptionTotals {
  const active = subs.filter((s) => s.active);
  let monthlyMyShare = 0;
  let monthlyFullTotal = 0;
  let sharedCount = 0;

  for (const s of active) {
    monthlyMyShare += getMonthlyMyShare(s);
    monthlyFullTotal += getMonthlyTotalPrice(s);
    if (s.shared) sharedCount += 1;
  }

  const startRef = startOfDay(reference);
  const endWeek = new Date(startRef);
  endWeek.setDate(endWeek.getDate() + 7);
  const endMonth = new Date(startRef);
  endMonth.setMonth(endMonth.getMonth() + 1);

  let upcomingCount = 0;
  for (const s of active) {
    const next = getNextPaymentOnOrAfter(s, reference);
    if (next <= endMonth) upcomingCount += 1;
  }

  return {
    monthlyMyShare,
    yearlyMyShare: monthlyMyShare * 12,
    monthlyFullTotal,
    yearlyFullTotal: monthlyFullTotal * 12,
    activeCount: active.length,
    sharedCount,
    upcomingCount,
  };
}

export function burnRateHours(
  monthlyPersonalSpend: number,
  hourlyWage: number
): number | null {
  if (hourlyWage <= 0) return null;
  return monthlyPersonalSpend / hourlyWage;
}

/** Days, including today, that a charge stays on the renewal horizon. */
export const RENEWAL_HORIZON_DAYS = 14;

/** Days before a charge, including the due date, that Slice marks it. */
export const REMINDER_LEAD_DAYS = 3;

export type RenewalCharge = {
  subscriptionId: string;
  dueOn: string;
  daysUntil: number;
  personalShare: number;
  insideReminderLead: boolean;
};

/** Money that leaves on the charge date. Not the monthly share. */
export function getPersonalShare(sub: SubscriptionRecord): number {
  if (!sub.active) return 0;
  if (!sub.shared) return sub.totalPrice;
  const people = sub.shareCount ?? 1;
  return sub.totalPrice / people;
}

export function listRenewalHorizon(
  subs: SubscriptionRecord[],
  from: Date,
  reminderLeadDays: number = REMINDER_LEAD_DAYS
): RenewalCharge[] {
  const charges: RenewalCharge[] = [];

  for (const sub of subs) {
    if (!sub.active) continue;
    const due = getNextPaymentOnOrAfter(sub, from);
    if (Number.isNaN(due.getTime())) continue;
    const until = daysUntil(due, from);
    if (until < 0 || until > RENEWAL_HORIZON_DAYS) continue;
    charges.push({
      subscriptionId: sub.id,
      dueOn: formatCalendarDate(due),
      daysUntil: until,
      personalShare: getPersonalShare(sub),
      insideReminderLead: until <= reminderLeadDays,
    });
  }

  charges.sort(
    (a, b) =>
      a.daysUntil - b.daysUntil ||
      a.subscriptionId.localeCompare(b.subscriptionId)
  );
  return charges;
}

export function burnRateWorkdays(
  hoursPerMonth: number | null,
  hoursPerWorkday: number
): number | null {
  if (hoursPerMonth == null || hoursPerWorkday <= 0) return null;
  return hoursPerMonth / hoursPerWorkday;
}
