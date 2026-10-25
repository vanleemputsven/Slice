import { describe, expect, it } from "vitest";
import type { SubscriptionRecord } from "@/lib/validation/subscription";
import {
  burnRateHours,
  burnRateWorkdays,
  formatCalendarDate,
  getMonthlyMyShare,
  listRenewalHorizon,
  nextCycleDate,
} from "@/lib/subscriptions/calculations";

function subscription(
  overrides: Partial<SubscriptionRecord> &
    Pick<SubscriptionRecord, "billingCycle" | "totalPrice" | "nextPaymentDate">
): SubscriptionRecord {
  return {
    id: "00000000-0000-4000-a000-000000000099",
    name: "Music",
    provider: "Spotify",
    category: "Entertainment",
    currency: "EUR",
    shared: false,
    active: true,
    reviewFlag: false,
    createdAt: "2026-01-01T12:00:00.000Z",
    updatedAt: "2026-01-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("listRenewalHorizon", () => {
  it("lists a yearly charge at the cycle price, on that calendar day", () => {
    const charges = listRenewalHorizon(
      [
        subscription({
          billingCycle: "yearly",
          totalPrice: 120,
          nextPaymentDate: "2026-10-28",
        }),
      ],
      new Date(2026, 9, 25)
    );

    expect(charges).toEqual([
      {
        subscriptionId: "00000000-0000-4000-a000-000000000099",
        dueOn: "2026-10-28",
        daysUntil: 3,
        personalShare: 120,
        insideReminderLead: true,
      },
    ]);
  });

  it("splits a shared cycle price across the people on it", () => {
    const charges = listRenewalHorizon(
      [
        subscription({
          billingCycle: "yearly",
          totalPrice: 120,
          shared: true,
          shareCount: 2,
          nextPaymentDate: "2026-10-28",
        }),
      ],
      new Date(2026, 9, 25)
    );

    expect(charges[0]?.personalShare).toBe(60);
  });

  it("keeps a custom-period charge at the cycle price", () => {
    const charges = listRenewalHorizon(
      [
        subscription({
          billingCycle: "custom",
          customPeriodMonths: 3,
          totalPrice: 90,
          nextPaymentDate: "2026-10-29",
        }),
      ],
      new Date(2026, 9, 25)
    );

    expect(charges).toEqual([
      {
        subscriptionId: "00000000-0000-4000-a000-000000000099",
        dueOn: "2026-10-29",
        daysUntil: 4,
        personalShare: 90,
        insideReminderLead: false,
      },
    ]);
  });

  it("includes the 14th day and leaves out the 15th", () => {
    const from = new Date(2026, 9, 25);
    const onTheEdge = listRenewalHorizon(
      [
        subscription({
          id: "00000000-0000-4000-a000-000000000014",
          billingCycle: "monthly",
          totalPrice: 10,
          nextPaymentDate: "2026-11-08",
        }),
      ],
      from
    );
    const pastTheEdge = listRenewalHorizon(
      [
        subscription({
          id: "00000000-0000-4000-a000-000000000015",
          billingCycle: "monthly",
          totalPrice: 10,
          nextPaymentDate: "2026-11-09",
        }),
      ],
      from
    );

    expect(onTheEdge.map((charge) => charge.daysUntil)).toEqual([14]);
    expect(onTheEdge[0]?.insideReminderLead).toBe(false);
    expect(pastTheEdge).toEqual([]);
  });

  it("drops an inactive subscription", () => {
    const charges = listRenewalHorizon(
      [
        subscription({
          billingCycle: "monthly",
          totalPrice: 10,
          nextPaymentDate: "2026-10-26",
          active: false,
        }),
      ],
      new Date(2026, 9, 25)
    );

    expect(charges).toEqual([]);
  });

  it("rolls a past yearly anchor forward to the next charge", () => {
    const charges = listRenewalHorizon(
      [
        subscription({
          billingCycle: "yearly",
          totalPrice: 120,
          nextPaymentDate: "2025-10-25",
        }),
      ],
      new Date(2026, 9, 25)
    );

    expect(charges).toEqual([
      {
        subscriptionId: "00000000-0000-4000-a000-000000000099",
        dueOn: "2026-10-25",
        daysUntil: 0,
        personalShare: 120,
        insideReminderLead: true,
      },
    ]);
  });

  it("uses a custom reminder lead instead of the three-day default", () => {
    const charges = listRenewalHorizon(
      [
        subscription({
          billingCycle: "monthly",
          totalPrice: 10,
          nextPaymentDate: "2026-10-30",
        }),
      ],
      new Date(2026, 9, 25),
      7
    );

    expect(charges).toEqual([
      {
        subscriptionId: "00000000-0000-4000-a000-000000000099",
        dueOn: "2026-10-30",
        daysUntil: 5,
        personalShare: 10,
        insideReminderLead: true,
      },
    ]);
  });

  it("marks only the due date when the reminder lead is zero", () => {
    const from = new Date(2026, 9, 25);
    const charges = listRenewalHorizon(
      [
        subscription({
          id: "00000000-0000-4000-a000-000000000010",
          name: "Today",
          billingCycle: "monthly",
          totalPrice: 8,
          nextPaymentDate: "2026-10-25",
        }),
        subscription({
          id: "00000000-0000-4000-a000-000000000011",
          name: "Tomorrow",
          billingCycle: "monthly",
          totalPrice: 9,
          nextPaymentDate: "2026-10-26",
        }),
      ],
      from,
      0
    );

    expect(charges.map((charge) => charge.insideReminderLead)).toEqual([
      true,
      false,
    ]);
  });

  it("leaves a monthly charge that already passed this month off the horizon", () => {
    const charges = listRenewalHorizon(
      [
        subscription({
          billingCycle: "monthly",
          totalPrice: 12,
          nextPaymentDate: "2026-10-24",
        }),
      ],
      new Date(2026, 9, 25)
    );

    expect(charges).toEqual([]);
  });
});

describe("monthly share and work time", () => {
  it("spreads a yearly cycle price across twelve months", () => {
    const share = getMonthlyMyShare(
      subscription({
        billingCycle: "yearly",
        totalPrice: 120,
        nextPaymentDate: "2026-10-28",
      })
    );

    expect(share).toBe(10);
  });

  it("splits a monthly cycle before counting it as a month", () => {
    const share = getMonthlyMyShare(
      subscription({
        billingCycle: "monthly",
        totalPrice: 18,
        shared: true,
        shareCount: 3,
        nextPaymentDate: "2026-10-28",
      })
    );

    expect(share).toBe(6);
  });

  it("turns a month of personal spend into hours and workdays", () => {
    expect(burnRateHours(160, 20)).toBe(8);
    expect(burnRateHours(160, 0)).toBeNull();
    expect(burnRateWorkdays(8, 8)).toBe(1);
    expect(burnRateWorkdays(null, 8)).toBeNull();
  });
});

describe("nextCycleDate", () => {
  it("moves a monthly charge one month, including a short February", () => {
    const sub = subscription({
      billingCycle: "monthly",
      totalPrice: 9,
      nextPaymentDate: "2026-01-31",
    });
    expect(nextCycleDate(sub, "2026-10-28")).toBe("2026-11-28");
    expect(nextCycleDate(sub, "2026-01-31")).toBe("2026-02-28");
  });

  it("moves a yearly charge one year and a custom charge by its period", () => {
    expect(
      nextCycleDate(
        subscription({
          billingCycle: "yearly",
          totalPrice: 120,
          nextPaymentDate: "2026-10-28",
        }),
        "2026-10-28"
      )
    ).toBe("2027-10-28");
    expect(
      nextCycleDate(
        subscription({
          billingCycle: "custom",
          customPeriodMonths: 3,
          totalPrice: 30,
          nextPaymentDate: "2026-10-28",
        }),
        "2026-10-28"
      )
    ).toBe("2027-01-28");
  });

  it("rejects a date that is not a calendar day", () => {
    expect(
      nextCycleDate(
        subscription({
          billingCycle: "monthly",
          totalPrice: 9,
          nextPaymentDate: "2026-10-28",
        }),
        "28-10-2026"
      )
    ).toBeNull();
  });
});

describe("formatCalendarDate", () => {
  it("keeps the local calendar day when that day is already the previous UTC day", () => {
    const early = new Date(2026, 9, 25, 0, 30, 0);
    expect(formatCalendarDate(early)).toBe("2026-10-25");
    if (early.getTimezoneOffset() < 0) {
      expect(early.toISOString().slice(0, 10)).toBe("2026-10-24");
    }
  });
});
