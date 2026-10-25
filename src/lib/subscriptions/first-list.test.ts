import { describe, expect, it } from "vitest";
import { parseFirstListDraft } from "@/lib/subscriptions/first-list";

describe("parseFirstListDraft", () => {
  it("keeps a named charge and drops a draft that has no price", () => {
    expect(
      parseFirstListDraft({
        rows: [
          {
            name: "Krant",
            category: "Education",
            billingCycle: "monthly",
            totalPrice: 12,
            nextPaymentDate: "2026-11-02",
          },
        ],
      })
    ).toEqual([
      {
        name: "Krant",
        category: "Education",
        billingCycle: "monthly",
        totalPrice: 12,
        nextPaymentDate: "2026-11-02",
      },
    ]);

    expect(
      parseFirstListDraft({
        rows: [
          {
            name: "Krant",
            category: "Education",
            billingCycle: "monthly",
            totalPrice: 0,
            nextPaymentDate: "2026-11-02",
          },
        ],
      })
    ).toBeNull();
  });
});
