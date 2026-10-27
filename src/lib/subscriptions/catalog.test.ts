import { describe, expect, it } from "vitest";
import {
  CATALOG,
  CATALOG_REGIONS,
  buildCatalogCharge,
  catalogTileFor,
  defaultCatalogRegion,
  defaultNextChargeDate,
  findPlan,
  fromPlan,
  monthlyPersonalShare,
  parseMoney,
  servicesForRegion,
  suggestedPlan,
} from "@/lib/subscriptions/catalog";
import { brandSlugFor } from "@/lib/subscriptions/brand-mark";
import { pictogramFor } from "@/lib/subscriptions/pictogram";

const date = "2026-11-26";

describe("catalog prices", () => {
  it("keeps Netflix list prices that were checked, and omits an ads plan where it is not on sale", () => {
    const netflix = CATALOG.find((service) => service.id === "netflix");
    expect(netflix).toBeDefined();
    expect(findPlan(netflix!, "BE", "standard", "monthly")?.amount).toBe(16.99);
    expect(findPlan(netflix!, "BE", "basic", "monthly")?.amount).toBe(10.99);
    expect(findPlan(netflix!, "BE", "premium", "monthly")?.amount).toBe(21.99);
    expect(findPlan(netflix!, "BE", "ads", "monthly")).toBeUndefined();
    expect(findPlan(netflix!, "NL", "standard", "monthly")?.amount).toBe(15.99);
    expect(findPlan(netflix!, "FR", "ads", "monthly")?.amount).toBe(7.99);
    expect(findPlan(netflix!, "DE", "ads", "monthly")?.amount).toBe(6.99);
    expect(findPlan(netflix!, "GB", "standard", "monthly")).toMatchObject({
      amount: 13.99,
      currency: "GBP",
    });
    expect(findPlan(netflix!, "US", "standard", "monthly")).toMatchObject({
      amount: 19.99,
      currency: "USD",
    });
  });

  it("uses the same Spotify plans in Belgium and the Netherlands, and the local list elsewhere", () => {
    const spotify = CATALOG.find((service) => service.id === "spotify")!;
    expect(findPlan(spotify, "BE", "individual", "monthly")?.amount).toBe(13.99);
    expect(findPlan(spotify, "NL", "family", "monthly")).toMatchObject({
      amount: 23.99,
      household: 6,
    });
    expect(findPlan(spotify, "FR", "individual", "monthly")?.amount).toBe(12.14);
    expect(findPlan(spotify, "DE", "duo", "monthly")?.amount).toBe(17.99);
    expect(findPlan(spotify, "GB", "individual", "monthly")).toMatchObject({
      amount: 12.99,
      currency: "GBP",
    });
    expect(findPlan(spotify, "US", "family", "monthly")).toMatchObject({
      amount: 21.99,
      currency: "USD",
    });
  });

  it("keeps local platforms in their country and a checked price on the plan people actually buy", () => {
    expect(servicesForRegion("BE").some((service) => service.id === "vtmgo")).toBe(true);
    expect(servicesForRegion("NL").some((service) => service.id === "vtmgo")).toBe(false);
    expect(findPlan(CATALOG.find((service) => service.id === "vtmgo")!, "BE", "month", "monthly")?.amount).toBe(4.95);
    expect(findPlan(CATALOG.find((service) => service.id === "videoland")!, "NL", "plus", "monthly")?.amount).toBe(11.99);
    expect(findPlan(CATALOG.find((service) => service.id === "nlziet")!, "NL", "premium", "yearly")?.amount).toBe(107.4);
    expect(findPlan(CATALOG.find((service) => service.id === "streamz")!, "BE", "premium", "yearly")?.amount).toBe(143.88);
    expect(findPlan(CATALOG.find((service) => service.id === "dazn")!, "BE", "flex", "monthly")?.amount).toBe(29.99);
    expect(findPlan(CATALOG.find((service) => service.id === "canal")!, "FR", "canal", "monthly")?.amount).toBe(24.99);
    expect(findPlan(CATALOG.find((service) => service.id === "now")!, "GB", "entertainment", "monthly")).toMatchObject({
      amount: 7.99,
      currency: "GBP",
    });
    expect(servicesForRegion("BE").some((service) => service.id === "paramount")).toBe(false);
    expect(findPlan(CATALOG.find((service) => service.id === "paramount")!, "FR", "standard", "monthly")?.amount).toBe(7.99);
    expect(findPlan(CATALOG.find((service) => service.id === "icloud")!, "GB", "2tb", "monthly")).toMatchObject({
      amount: 8.99,
      currency: "GBP",
    });
    expect(findPlan(CATALOG.find((service) => service.id === "icloud")!, "BE", "2tb", "monthly")?.amount).toBe(9.99);
    expect(findPlan(CATALOG.find((service) => service.id === "applemusic")!, "BE", "individual", "monthly")?.amount).toBe(11.99);
    expect(findPlan(CATALOG.find((service) => service.id === "microsoft365")!, "BE", "personal", "yearly")?.amount).toBe(99);
    expect(findPlan(CATALOG.find((service) => service.id === "playstation")!, "BE", "extra", "yearly")?.amount).toBe(125.99);
    expect(findPlan(CATALOG.find((service) => service.id === "xbox")!, "BE", "ultimate", "monthly")?.amount).toBe(20.99);

    const pictogramOnly = new Set(["streamz", "playsports", "fitness", "mobile", "internet"]);
    for (const service of CATALOG) {
      expect(service.iconKey.length).toBeGreaterThan(0);
      expect(service.letters.length).toBeGreaterThan(0);
      expect(service.letters.length).toBeLessThanOrEqual(3);
      const tile = catalogTileFor({ iconKey: service.iconKey, name: service.name });
      expect(tile?.letters).toBe(service.letters);
      const slug = brandSlugFor({ iconKey: service.iconKey, name: service.name });
      if (pictogramOnly.has(service.id)) {
        expect(slug).toBeNull();
        expect(pictogramFor({ iconKey: service.iconKey, name: service.name })).toBeTruthy();
      } else {
        expect(slug).toBeTruthy();
      }
    }
  });

  it("hides local services outside their country and never stores a non-positive price", () => {
    expect(servicesForRegion("US").some((service) => service.id === "streamz")).toBe(
      false
    );
    expect(servicesForRegion("BE").some((service) => service.id === "streamz")).toBe(
      true
    );
    expect(servicesForRegion("BE").some((service) => service.id === "videoland")).toBe(
      false
    );

    for (const service of CATALOG) {
      for (const region of CATALOG_REGIONS) {
        const rows = service.plans[region] ?? [];
        const ids = new Set<string>();
        for (const row of rows) {
          expect(row.amount).toBeGreaterThan(0);
          expect(row.currency).toBe(region === "GB" ? "GBP" : region === "US" ? "USD" : "EUR");
          const key = `${row.id}:${row.cycle}`;
          expect(ids.has(key)).toBe(false);
          ids.add(key);
        }
        if (rows.length > 0 && service.suggest) {
          expect(suggestedPlan(service, region)?.id).toBe(service.suggest);
        }
        if (rows.length === 0) expect(fromPlan(service, region)).toBeNull();
      }
    }
  });

  it("opens euro amounts on Belgium and sterling or dollars on their own list", () => {
    expect(defaultCatalogRegion("eur")).toBe("BE");
    expect(defaultCatalogRegion("GBP")).toBe("GB");
    expect(defaultCatalogRegion("USD")).toBe("US");
    expect(defaultCatalogRegion("JPY")).toBe("BE");
  });
});

describe("parseMoney and the next charge date", () => {
  it("accepts a comma or a dot and rejects a blank or a zero", () => {
    expect(parseMoney("16,99")).toBe(16.99);
    expect(parseMoney(" 2.99 ")).toBe(2.99);
    expect(parseMoney("0")).toBeNull();
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("16.999")).toBeNull();
  });

  it("lands the 31st on the last day of the next month", () => {
    expect(defaultNextChargeDate(new Date(2026, 0, 31))).toBe("2026-02-28");
    expect(defaultNextChargeDate(new Date(2026, 9, 26))).toBe("2026-11-26");
  });
});

describe("buildCatalogCharge", () => {
  it("stores the listed Netflix plan, not a typed amount beside it", () => {
    expect(
      buildCatalogCharge({
        serviceId: "netflix",
        customName: "",
        region: "BE",
        locale: "nl",
        planId: "standard",
        cycle: "monthly",
        listed: true,
        amount: 1,
        shared: false,
        shareCount: null,
        nextPaymentDate: date,
      })
    ).toMatchObject({
      name: "Netflix",
      provider: "Netflix",
      iconKey: "netflix",
      category: "Entertainment",
      totalPrice: 16.99,
      currency: "EUR",
      billingCycle: "monthly",
      shared: false,
      notes: "Standaard · 2 schermen, Full HD",
      reviewFlag: false,
    });
  });

  it("keeps a typed price and still names the plan they started from", () => {
    expect(
      buildCatalogCharge({
        serviceId: "netflix",
        customName: "",
        region: "BE",
        locale: "nl",
        planId: "standard",
        cycle: "monthly",
        listed: false,
        amount: 12.5,
        shared: false,
        shareCount: null,
        nextPaymentDate: date,
      })
    ).toMatchObject({
      totalPrice: 12.5,
      notes: "Standaard · 2 schermen, Full HD",
    });
  });

  it("keeps a typed price for a service without a list, and a custom name", () => {
    expect(
      buildCatalogCharge({
        serviceId: "fitness",
        customName: "",
        region: "NL",
        locale: "en",
        planId: null,
        cycle: "monthly",
        listed: false,
        amount: 29.99,
        shared: false,
        shareCount: null,
        nextPaymentDate: date,
      })
    ).toMatchObject({
      name: "Fitness",
      category: "Health",
      totalPrice: 29.99,
      currency: "EUR",
      notes: "",
      iconKey: "fitness",
    });

    expect(
      buildCatalogCharge({
        serviceId: null,
        customName: "  Krant  ",
        region: "GB",
        locale: "en",
        planId: null,
        cycle: "monthly",
        listed: false,
        amount: 12,
        shared: false,
        shareCount: null,
        nextPaymentDate: date,
      })
    ).toMatchObject({
      name: "Krant",
      category: "Other",
      currency: "GBP",
      totalPrice: 12,
    });
  });

  it("splits a family plan only when asked, and refuses a blank or a share of one", () => {
    const family = buildCatalogCharge({
      serviceId: "spotify",
      customName: "",
      region: "BE",
      locale: "en",
      planId: "family",
      cycle: "monthly",
      listed: true,
      amount: 1,
      shared: true,
      shareCount: 6,
      nextPaymentDate: date,
    });
    expect(family).toMatchObject({ shared: true, shareCount: 6, totalPrice: 23.99 });
    expect(monthlyPersonalShare(23.99, "monthly", true, 6)).toBeCloseTo(23.99 / 6);

    expect(
      buildCatalogCharge({
        serviceId: "spotify",
        customName: "",
        region: "BE",
        locale: "en",
        planId: "family",
        cycle: "monthly",
        listed: true,
        amount: 1,
        shared: true,
        shareCount: 1,
        nextPaymentDate: date,
      })
    ).toBeNull();

    expect(
      buildCatalogCharge({
        serviceId: null,
        customName: "   ",
        region: "BE",
        locale: "nl",
        planId: null,
        cycle: "monthly",
        listed: false,
        amount: 10,
        shared: false,
        shareCount: null,
        nextPaymentDate: date,
      })
    ).toBeNull();
  });
});
