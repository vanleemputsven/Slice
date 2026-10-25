import { describe, expect, it } from "vitest";
import {
  buildGuidedSubscription,
  guidedQuestionCount,
} from "@/lib/subscriptions/guided-add";

const netflix = {
  serviceId: "netflix" as const,
  name: "Netflix",
  billingCycle: "monthly" as const,
  totalPrice: 15.99,
  nextPaymentDate: "2026-11-02",
  shared: false,
  shareCount: null,
  currency: "EUR",
};

describe("buildGuidedSubscription", () => {
  it("stores the named service, the cycle price, and the date", () => {
    expect(buildGuidedSubscription(netflix)).toMatchObject({
      name: "Netflix",
      provider: "Netflix",
      category: "Entertainment",
      billingCycle: "monthly",
      totalPrice: 15.99,
      nextPaymentDate: "2026-11-02",
      shared: false,
      currency: "EUR",
      iconKey: "netflix",
      active: true,
    });
  });

  it("keeps a typed name and marks a shared account", () => {
    expect(
      buildGuidedSubscription({
        ...netflix,
        serviceId: "other",
        name: "  Basic-Fit  ",
        shared: true,
        shareCount: 2,
      })
    ).toMatchObject({
      name: "Basic-Fit",
      category: "Other",
      shared: true,
      shareCount: 2,
    });
  });

  it("refuses a blank name, a zero price, or a share of one", () => {
    expect(buildGuidedSubscription({ ...netflix, name: "  " })).toBeNull();
    expect(buildGuidedSubscription({ ...netflix, totalPrice: 0 })).toBeNull();
    expect(
      buildGuidedSubscription({ ...netflix, shared: true, shareCount: 1 })
    ).toBeNull();
  });

  it("asks one extra question when the service is not in the list", () => {
    expect(guidedQuestionCount("spotify")).toBe(4);
    expect(guidedQuestionCount("other")).toBe(5);
  });
});
