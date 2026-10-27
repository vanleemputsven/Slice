import type { AppLocale } from "@/lib/i18n/locale";
import { brandSlugFor } from "@/lib/subscriptions/brand-mark";
import type { SubscriptionCategory } from "@/lib/subscriptions/categories";
import { formatCalendarDate } from "@/lib/subscriptions/calculations";
import {
  subscriptionFormSchema,
  type SubscriptionFormInput,
} from "@/lib/validation/subscription";

/**
 * Public list prices for the add-a-charge picker.
 * Sources, dates, and what we refused to guess: docs/subscription-catalog.md.
 * Checked as a set on 26 October 2026. A missing region means the person types
 * the amount. We never invent a price to fill a gap.
 */
export const CATALOG_CHECKED = "2026-10-26";

export const CATALOG_REGIONS = ["BE", "NL", "FR", "DE", "GB", "US"] as const;
export type CatalogRegion = (typeof CATALOG_REGIONS)[number];

export const CATALOG_GROUPS = [
  "streaming",
  "music",
  "cloud",
  "ai",
  "play",
  "home",
] as const;
export type CatalogGroup = (typeof CATALOG_GROUPS)[number];

export type CatalogCycle = "monthly" | "yearly";

type Copy = { en: string; nl: string };

export type CatalogPlan = {
  id: string;
  cycle: CatalogCycle;
  amount: number;
  currency: "EUR" | "GBP" | "USD";
  name: Copy;
  detail: Copy;
  /** People the plan is sold for. Not applied until the person says they split the bill. */
  household?: number;
};

export type CatalogService = {
  id: string;
  name: string;
  iconKey: string;
  letters: string;
  tile: string;
  ink: string;
  /** Shown and stored instead of `name` when the service is not a brand. */
  label?: Copy;
  category: SubscriptionCategory;
  group: CatalogGroup;
  /** When set, the service only appears for these regions. */
  only?: readonly CatalogRegion[];
  /** Hidden where the service is not sold on its own. */
  hide?: readonly CatalogRegion[];
  search: readonly string[];
  /** Plan id to preselect. Empty when the region has no list price. */
  suggest: string;
  plans: Partial<Record<CatalogRegion, readonly CatalogPlan[]>>;
};

function copy(en: string, nl: string): Copy {
  return { en, nl };
}

function plan(
  id: string,
  cycle: CatalogCycle,
  amount: number,
  currency: CatalogPlan["currency"],
  name: Copy,
  detail: Copy,
  household?: number
): CatalogPlan {
  return {
    id,
    cycle,
    amount,
    currency,
    name,
    detail,
    ...(household ? { household } : {}),
  };
}

const screens = {
  oneHd: copy("1 screen, HD", "1 scherm, HD"),
  twoFhd: copy("2 screens, Full HD", "2 schermen, Full HD"),
  fourUhd: copy("4 screens, Ultra HD", "4 schermen, Ultra HD"),
  ads: copy("With ads", "Met reclame"),
  adsBeforeTax: copy("With ads, before sales tax", "Met reclame, vóór sales tax"),
  twoBeforeTax: copy(
    "2 screens, Full HD, before sales tax",
    "2 schermen, Full HD, vóór sales tax"
  ),
  fourBeforeTax: copy(
    "4 screens, Ultra HD, before sales tax",
    "4 schermen, Ultra HD, vóór sales tax"
  ),
};

const tier = {
  basic: copy("Basic", "Basic"),
  standard: copy("Standard", "Standaard"),
  premium: copy("Premium", "Premium"),
  ads: copy("Standard with ads", "Standaard met reclame"),
};

function netflixEuro(
  basic: number | null,
  ads: number | null,
  standard: number,
  premium: number
): CatalogPlan[] {
  const rows: CatalogPlan[] = [];
  if (ads != null) {
    rows.push(plan("ads", "monthly", ads, "EUR", tier.ads, screens.ads));
  }
  if (basic != null) {
    rows.push(plan("basic", "monthly", basic, "EUR", tier.basic, screens.oneHd));
  }
  rows.push(
    plan("standard", "monthly", standard, "EUR", tier.standard, screens.twoFhd)
  );
  rows.push(
    plan("premium", "monthly", premium, "EUR", tier.premium, screens.fourUhd)
  );
  return rows;
}

function spotifyPlans(
  currency: CatalogPlan["currency"],
  student: number,
  individual: number,
  duo: number,
  family: number
): CatalogPlan[] {
  return [
    plan(
      "student",
      "monthly",
      student,
      currency,
      copy("Student", "Student"),
      copy("Student price", "Studententarief")
    ),
    plan(
      "individual",
      "monthly",
      individual,
      currency,
      copy("Individual", "Individual"),
      copy("1 account", "1 account")
    ),
    plan(
      "duo",
      "monthly",
      duo,
      currency,
      copy("Duo", "Duo"),
      copy("2 accounts, one address", "2 accounts, één adres"),
      2
    ),
    plan(
      "family",
      "monthly",
      family,
      currency,
      copy("Family", "Family"),
      copy("Up to 6 accounts, one address", "Tot 6 accounts, één adres"),
      6
    ),
  ];
}

const disneyMonth = {
  ads: copy("Standard with ads", "Standaard met reclame"),
  standard: copy("Standard", "Standaard"),
  premium: copy("Premium", "Premium"),
};

function disneyPlans(): CatalogPlan[] {
  return [
    plan("ads", "monthly", 6.99, "EUR", disneyMonth.ads, screens.ads),
    plan("standard", "monthly", 10.99, "EUR", disneyMonth.standard, screens.twoFhd),
    plan("premium", "monthly", 15.99, "EUR", disneyMonth.premium, screens.fourUhd),
    plan(
      "standard",
      "yearly",
      109.9,
      "EUR",
      disneyMonth.standard,
      screens.twoFhd
    ),
    plan("premium", "yearly", 159.9, "EUR", disneyMonth.premium, screens.fourUhd),
  ];
}

function icloudPlans(
  currency: CatalogPlan["currency"],
  gb50: number,
  gb200: number,
  tb2: number,
  tb6: number,
  tb12: number
): CatalogPlan[] {
  return [
    plan("50", "monthly", gb50, currency, copy("50 GB", "50 GB"), copy("iCloud+", "iCloud+")),
    plan("200", "monthly", gb200, currency, copy("200 GB", "200 GB"), copy("iCloud+", "iCloud+")),
    plan("2tb", "monthly", tb2, currency, copy("2 TB", "2 TB"), copy("iCloud+", "iCloud+")),
    plan("6tb", "monthly", tb6, currency, copy("6 TB", "6 TB"), copy("iCloud+", "iCloud+")),
    plan("12tb", "monthly", tb12, currency, copy("12 TB", "12 TB"), copy("iCloud+", "iCloud+")),
  ];
}

export const CATALOG: readonly CatalogService[] = [
  {
    id: "netflix",
    name: "Netflix",
    iconKey: "netflix",
    letters: "N",
    tile: "#E50914",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    search: ["netflix"],
    suggest: "standard",
    plans: {
      BE: netflixEuro(10.99, null, 16.99, 21.99),
      NL: netflixEuro(9.99, null, 15.99, 20.99),
      FR: netflixEuro(null, 7.99, 14.99, 21.99),
      DE: netflixEuro(null, 6.99, 15.99, 21.99),
      GB: [
        plan("ads", "monthly", 7.99, "GBP", tier.ads, screens.ads),
        plan("standard", "monthly", 13.99, "GBP", tier.standard, screens.twoFhd),
        plan("premium", "monthly", 20.99, "GBP", tier.premium, screens.fourUhd),
      ],
      US: [
        plan("ads", "monthly", 8.99, "USD", tier.ads, screens.adsBeforeTax),
        plan("standard", "monthly", 19.99, "USD", tier.standard, screens.twoBeforeTax),
        plan("premium", "monthly", 26.99, "USD", tier.premium, screens.fourBeforeTax),
      ],
    },
  },
  {
    id: "disney",
    name: "Disney+",
    iconKey: "disney",
    letters: "D+",
    tile: "#113CCF",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    search: ["disney", "disneyplus"],
    suggest: "standard",
    plans: { BE: disneyPlans(), NL: disneyPlans() },
  },
  {
    id: "prime",
    name: "Prime Video",
    iconKey: "prime",
    letters: "Pr",
    tile: "#00A8E1",
    ink: "#0B0C0F",
    category: "Entertainment",
    group: "streaming",
    search: ["prime", "amazon", "primevideo"],
    suggest: "ads",
    plans: {
      BE: [
        plan(
          "ads",
          "monthly",
          2.99,
          "EUR",
          copy("With ads", "Met reclame"),
          copy("Prime Video", "Prime Video")
        ),
        plan(
          "noads",
          "monthly",
          4.98,
          "EUR",
          copy("Without ads", "Zonder reclame"),
          copy("Prime Video", "Prime Video")
        ),
        plan(
          "ads",
          "yearly",
          25,
          "EUR",
          copy("With ads", "Met reclame"),
          copy("Prime Video", "Prime Video")
        ),
      ],
    },
  },
  {
    id: "youtube",
    name: "YouTube Premium",
    iconKey: "youtube",
    letters: "YT",
    tile: "#FF0000",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    search: ["youtube", "youtubepremium", "yt"],
    suggest: "individual",
    plans: {
      BE: [
        plan(
          "lite",
          "monthly",
          8.99,
          "EUR",
          copy("Premium Lite", "Premium Lite"),
          copy("Most videos without ads, no Music", "De meeste video's zonder reclame, geen Music")
        ),
        plan(
          "student",
          "monthly",
          8.99,
          "EUR",
          copy("Student", "Student"),
          copy("Student price", "Studententarief")
        ),
        plan(
          "individual",
          "monthly",
          14.99,
          "EUR",
          copy("Individual", "Individual"),
          copy("No ads, downloads, YouTube Music", "Geen reclame, downloads, YouTube Music")
        ),
        plan(
          "family",
          "monthly",
          27.99,
          "EUR",
          copy("Family", "Family"),
          copy("Up to 5 people", "Tot 5 personen"),
          5
        ),
      ],
    },
  },
  {
    id: "hbomax",
    name: "HBO Max",
    iconKey: "hbomax",
    letters: "HB",
    tile: "#000000",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    search: ["hbo", "hbomax", "max"],
    suggest: "standard",
    plans: {
      BE: [
        plan("ads", "monthly", 6.99, "EUR", copy("With ads", "Met reclame"), copy("Entry plan", "Instap")),
        plan(
          "standard",
          "monthly",
          10.99,
          "EUR",
          copy("Standard", "Standaard"),
          copy("Without ads", "Zonder reclame")
        ),
        plan(
          "premium",
          "monthly",
          15.99,
          "EUR",
          copy("Premium", "Premium"),
          copy("Without ads, higher quality", "Zonder reclame, hogere kwaliteit")
        ),
        plan("ads", "yearly", 69.9, "EUR", copy("With ads", "Met reclame"), copy("Entry plan", "Instap")),
        plan(
          "standard",
          "yearly",
          109,
          "EUR",
          copy("Standard", "Standaard"),
          copy("Without ads", "Zonder reclame")
        ),
        plan(
          "premium",
          "yearly",
          159,
          "EUR",
          copy("Premium", "Premium"),
          copy("Without ads, higher quality", "Zonder reclame, hogere kwaliteit")
        ),
      ],
      NL: [
        plan(
          "ads",
          "monthly",
          5.99,
          "EUR",
          copy("With ads", "Met reclame"),
          copy("Full HD, with ads", "Full HD, met reclame")
        ),
        plan(
          "standard",
          "monthly",
          11.99,
          "EUR",
          copy("Standard", "Standaard"),
          copy("Full HD", "Full HD")
        ),
        plan(
          "premium",
          "monthly",
          16.99,
          "EUR",
          copy("Premium", "Premium"),
          copy("Up to 4K", "Tot 4K")
        ),
        plan(
          "ads",
          "yearly",
          59.9,
          "EUR",
          copy("With ads", "Met reclame"),
          copy("Full HD, with ads", "Full HD, met reclame")
        ),
        plan(
          "standard",
          "yearly",
          119,
          "EUR",
          copy("Standard", "Standaard"),
          copy("Full HD", "Full HD")
        ),
        plan(
          "premium",
          "yearly",
          169,
          "EUR",
          copy("Premium", "Premium"),
          copy("Up to 4K", "Tot 4K")
        ),
      ],
    },
  },
  {
    id: "appletv",
    name: "Apple TV",
    iconKey: "appletv",
    letters: "TV",
    tile: "#000000",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    search: ["appletv", "apple"],
    suggest: "plus",
    plans: {
      BE: [
        plan(
          "plus",
          "monthly",
          9.99,
          "EUR",
          copy("Apple TV", "Apple TV"),
          copy("One plan", "Eén plan")
        ),
      ],
      NL: [
        plan(
          "plus",
          "monthly",
          9.99,
          "EUR",
          copy("Apple TV", "Apple TV"),
          copy("One plan", "Eén plan")
        ),
      ],
      FR: [
        plan(
          "plus",
          "monthly",
          9.99,
          "EUR",
          copy("Apple TV", "Apple TV"),
          copy("Public price", "Publieksprijs")
        ),
      ],
    },
  },
  {
    id: "paramount",
    name: "Paramount+",
    iconKey: "paramountplus",
    letters: "P+",
    tile: "#0064FF",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    hide: ["BE"],
    search: ["paramount"],
    suggest: "standard",
    plans: {
      FR: [
        plan(
          "standard",
          "monthly",
          7.99,
          "EUR",
          copy("Standard", "Standaard"),
          copy("2 screens", "2 schermen")
        ),
      ],
    },
  },
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    iconKey: "crunchyroll",
    letters: "CR",
    tile: "#FF5E00",
    ink: "#0B0C0F",
    category: "Entertainment",
    group: "streaming",
    search: ["crunchyroll", "anime"],
    suggest: "fan",
    plans: {
      BE: [
        plan(
          "fan",
          "monthly",
          7.99,
          "EUR",
          copy("Fan", "Fan"),
          copy("App Store price", "App Store-prijs")
        ),
      ],
    },
  },
  {
    id: "streamz",
    name: "Streamz",
    iconKey: "streamz",
    letters: "St",
    tile: "#FF3D00",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    only: ["BE"],
    search: ["streamz", "dpg"],
    suggest: "premium",
    plans: {
      BE: [
        plan(
          "ads",
          "monthly",
          9.99,
          "EUR",
          copy("Basic with ads", "Basic met reclame"),
          copy("Flemish streaming", "Vlaamse streaming")
        ),
        plan(
          "premium",
          "monthly",
          14.99,
          "EUR",
          copy("Premium", "Premium"),
          copy("Flemish streaming", "Vlaamse streaming")
        ),
        plan(
          "plus",
          "monthly",
          22.99,
          "EUR",
          copy("Premium+", "Premium+"),
          copy("Flemish streaming", "Vlaamse streaming")
        ),
        plan(
          "ads",
          "yearly",
          95.88,
          "EUR",
          copy("Basic with ads", "Basic met reclame"),
          copy("Billed once a year", "In één keer per jaar")
        ),
        plan(
          "premium",
          "yearly",
          143.88,
          "EUR",
          copy("Premium", "Premium"),
          copy("Billed once a year", "In één keer per jaar")
        ),
        plan(
          "plus",
          "yearly",
          215.88,
          "EUR",
          copy("Premium+", "Premium+"),
          copy("Billed once a year", "In één keer per jaar")
        ),
      ],
    },
  },
  {
    id: "videoland",
    name: "Videoland",
    iconKey: "videoland",
    letters: "VL",
    tile: "#E30613",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    only: ["NL"],
    search: ["videoland", "rtl"],
    suggest: "plus",
    plans: {
      NL: [
        plan(
          "basis",
          "monthly",
          6.99,
          "EUR",
          copy("Basis", "Basis"),
          copy("1 screen, with ads", "1 scherm, met reclame")
        ),
        plan(
          "plus",
          "monthly",
          11.99,
          "EUR",
          copy("Plus", "Plus"),
          copy("2 screens, downloads", "2 schermen, downloads")
        ),
        plan(
          "premium",
          "monthly",
          14.99,
          "EUR",
          copy("Premium", "Premium"),
          copy("4 screens, downloads", "4 schermen, downloads")
        ),
      ],
    },
  },
  {
    id: "vtmgo",
    name: "VTM GO+",
    iconKey: "vtmgo",
    letters: "V+",
    tile: "#FFE14A",
    ink: "#0B0C0F",
    category: "Entertainment",
    group: "streaming",
    only: ["BE"],
    search: ["vtm", "vtmgo", "goplus"],
    suggest: "month",
    plans: {
      BE: [
        plan(
          "month",
          "monthly",
          4.95,
          "EUR",
          copy("Monthly", "Maandelijks"),
          copy("Cancel any month", "Maandelijks opzegbaar")
        ),
        plan(
          "year",
          "monthly",
          3.95,
          "EUR",
          copy("Yearly term", "Jaarabonnement"),
          copy("€3.95 each month for a year", "€3,95 per maand, voor een jaar")
        ),
      ],
    },
  },
  {
    id: "playsports",
    name: "Play Sports",
    iconKey: "playsports",
    letters: "Pl",
    tile: "#E30613",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    only: ["BE"],
    search: ["playsports", "sport", "telenet"],
    suggest: "total",
    plans: {
      BE: [
        plan(
          "total",
          "monthly",
          34.99,
          "EUR",
          copy("Play Sports + DAZN Total", "Play Sports + DAZN Total"),
          copy("Full sports pack via Telenet", "Volledig sportpakket via Telenet")
        ),
      ],
    },
  },
  {
    id: "dazn",
    name: "DAZN",
    iconKey: "dazn",
    letters: "DZ",
    tile: "#0B0C0F",
    ink: "#F8F8F5",
    category: "Entertainment",
    group: "streaming",
    search: ["dazn", "sport", "proleague"],
    suggest: "flex",
    plans: {
      BE: [
        plan(
          "flex",
          "monthly",
          29.99,
          "EUR",
          copy("Total, flexible", "Total, flexibel"),
          copy("30 days' notice", "Opzegtermijn van 30 dagen")
        ),
        plan(
          "year",
          "monthly",
          24.99,
          "EUR",
          copy("Total, 12 months", "Total, 12 maanden"),
          copy("Billed each month, one-year term", "Elke maand, looptijd van een jaar")
        ),
      ],
    },
  },
  {
    id: "nlziet",
    name: "NLZIET",
    iconKey: "nlziet",
    letters: "NL",
    tile: "#5B2C83",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    only: ["NL"],
    search: ["nlziet", "npo", "kijk"],
    suggest: "premium",
    plans: {
      NL: [
        plan(
          "basis",
          "monthly",
          7.95,
          "EUR",
          copy("Basis", "Basis"),
          copy("1 device", "1 apparaat")
        ),
        plan(
          "premium",
          "monthly",
          9.95,
          "EUR",
          copy("Premium", "Premium"),
          copy("2 devices, most catch-up without ads", "2 apparaten, de meeste programma's zonder reclame")
        ),
        plan(
          "extra",
          "monthly",
          11.95,
          "EUR",
          copy("Extra", "Extra"),
          copy("3 devices, extra channels", "3 apparaten, extra zenders")
        ),
        plan(
          "premium",
          "yearly",
          107.4,
          "EUR",
          copy("Premium", "Premium"),
          copy("Billed once a year", "In één keer per jaar")
        ),
        plan(
          "extra",
          "yearly",
          131.4,
          "EUR",
          copy("Extra", "Extra"),
          copy("Billed once a year", "In één keer per jaar")
        ),
      ],
    },
  },
  {
    id: "canal",
    name: "Canal+",
    iconKey: "canal",
    letters: "C+",
    tile: "#F4F1EA",
    ink: "#0B0C0F",
    category: "Entertainment",
    group: "streaming",
    only: ["FR"],
    search: ["canal", "canalplus"],
    suggest: "canal",
    plans: {
      FR: [
        plan(
          "canal",
          "monthly",
          24.99,
          "EUR",
          copy("Canal+", "Canal+"),
          copy("Monthly list price, no lock-in", "Maandprijs, zonder engagement")
        ),
      ],
    },
  },
  {
    id: "rtlplus",
    name: "RTL+",
    iconKey: "rtl",
    letters: "RTL",
    tile: "#FA002E",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    only: ["DE"],
    search: ["rtl", "rtlplus"],
    suggest: "",
    plans: {},
  },
  {
    id: "sky",
    name: "Sky",
    iconKey: "sky",
    letters: "Sk",
    tile: "#0072C9",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    only: ["GB", "DE"],
    search: ["sky"],
    suggest: "",
    plans: {},
  },
  {
    id: "now",
    name: "NOW",
    iconKey: "now",
    letters: "NW",
    tile: "#001211",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    only: ["GB"],
    search: ["now", "nowtv"],
    suggest: "entertainment",
    plans: {
      GB: [
        plan(
          "entertainment",
          "monthly",
          7.99,
          "GBP",
          copy("Entertainment", "Entertainment"),
          copy("Flexible monthly price", "Flexibele maandprijs")
        ),
      ],
    },
  },
  {
    id: "hulu",
    name: "Hulu",
    iconKey: "hulu",
    letters: "Hu",
    tile: "#1CE783",
    ink: "#0B0C0F",
    category: "Entertainment",
    group: "streaming",
    only: ["US"],
    search: ["hulu"],
    suggest: "",
    plans: {},
  },
  {
    id: "peacock",
    name: "Peacock",
    iconKey: "peacock",
    letters: "Pe",
    tile: "#6C4AB6",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "streaming",
    only: ["US"],
    search: ["peacock", "nbc"],
    suggest: "",
    plans: {},
  },
  {
    id: "spotify",
    name: "Spotify",
    iconKey: "spotify",
    letters: "Sp",
    tile: "#1ED760",
    ink: "#0B0C0F",
    category: "Entertainment",
    group: "music",
    search: ["spotify"],
    suggest: "individual",
    plans: { BE: spotifyPlans("EUR", 6.99, 13.99, 19.99, 23.99), NL: spotifyPlans("EUR", 6.99, 13.99, 19.99, 23.99), FR: spotifyPlans("EUR", 7.07, 12.14, 17.2, 21.24), DE: spotifyPlans("EUR", 6.99, 12.99, 17.99, 21.99), GB: spotifyPlans("GBP", 5.99, 12.99, 17.99, 21.99), US: spotifyPlans("USD", 6.99, 12.99, 18.99, 21.99) },
  },
  {
    id: "applemusic",
    name: "Apple Music",
    iconKey: "applemusic",
    letters: "AM",
    tile: "#FA243C",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "music",
    search: ["applemusic", "apple"],
    suggest: "individual",
    plans: {
      BE: [
        plan(
          "student",
          "monthly",
          6.99,
          "EUR",
          copy("Student", "Student"),
          copy("Includes Apple TV", "Inclusief Apple TV")
        ),
        plan(
          "individual",
          "monthly",
          11.99,
          "EUR",
          copy("Individual", "Individual"),
          copy("1 person", "1 persoon")
        ),
        plan(
          "family",
          "monthly",
          19.99,
          "EUR",
          copy("Family", "Family"),
          copy("Up to 6 people", "Tot 6 personen"),
          6
        ),
      ],
    },
  },
  {
    id: "deezer",
    name: "Deezer",
    iconKey: "deezer",
    letters: "Dz",
    tile: "#A238FF",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "music",
    search: ["deezer"],
    suggest: "",
    plans: {},
  },
  {
    id: "tidal",
    name: "TIDAL",
    iconKey: "tidal",
    letters: "Ti",
    tile: "#000000",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "music",
    search: ["tidal"],
    suggest: "",
    plans: {},
  },
  {
    id: "icloud",
    name: "iCloud+",
    iconKey: "icloud",
    letters: "iC",
    tile: "#3693F3",
    ink: "#F6F7FB",
    category: "Utilities",
    group: "cloud",
    search: ["icloud", "apple"],
    suggest: "200",
    plans: {
      BE: icloudPlans("EUR", 0.99, 2.99, 9.99, 29.99, 59.99),
      NL: icloudPlans("EUR", 0.99, 2.99, 9.99, 29.99, 59.99),
      FR: icloudPlans("EUR", 0.99, 2.99, 9.99, 29.99, 59.99),
      DE: icloudPlans("EUR", 0.99, 2.99, 9.99, 29.99, 59.99),
      GB: icloudPlans("GBP", 0.99, 2.99, 8.99, 26.99, 54.99),
      US: icloudPlans("USD", 0.99, 2.99, 9.99, 29.99, 59.99),
    },
  },
  {
    id: "googleone",
    name: "Google One",
    iconKey: "google",
    letters: "G1",
    tile: "#4285F4",
    ink: "#F6F7FB",
    category: "Cloud / Developer Tools",
    group: "cloud",
    search: ["google", "googleone", "drive", "opslag"],
    suggest: "200",
    plans: {
      BE: [
        plan(
          "100",
          "monthly",
          1.99,
          "EUR",
          copy("100 GB", "100 GB"),
          copy("App Store price", "App Store-prijs")
        ),
        plan(
          "200",
          "monthly",
          2.99,
          "EUR",
          copy("200 GB", "200 GB"),
          copy("App Store price", "App Store-prijs")
        ),
      ],
    },
  },
  {
    id: "dropbox",
    name: "Dropbox",
    iconKey: "dropbox",
    letters: "Db",
    tile: "#0061FF",
    ink: "#F6F7FB",
    category: "Cloud / Developer Tools",
    group: "cloud",
    search: ["dropbox"],
    suggest: "",
    plans: {},
  },
  {
    id: "notion",
    name: "Notion",
    iconKey: "notion",
    letters: "No",
    tile: "#000000",
    ink: "#F6F7FB",
    category: "Productivity",
    group: "cloud",
    search: ["notion"],
    suggest: "plus",
    plans: {
      BE: [
        plan(
          "plus",
          "monthly",
          12.99,
          "EUR",
          copy("Plus", "Plus"),
          copy("App Store price", "App Store-prijs")
        ),
      ],
    },
  },
  {
    id: "microsoft365",
    name: "Microsoft 365",
    iconKey: "microsoft365",
    letters: "365",
    tile: "#D83B01",
    ink: "#F6F7FB",
    category: "Productivity",
    group: "cloud",
    search: ["microsoft", "office", "365", "word"],
    suggest: "personal",
    plans: {
      BE: [
        plan(
          "personal",
          "monthly",
          10,
          "EUR",
          copy("Personal", "Personal"),
          copy("1 person, 1 TB", "1 persoon, 1 TB")
        ),
        plan(
          "family",
          "monthly",
          13,
          "EUR",
          copy("Family", "Family"),
          copy("Up to 6 people, 2 TB", "Tot 6 personen, 2 TB"),
          6
        ),
        plan(
          "personal",
          "yearly",
          99,
          "EUR",
          copy("Personal", "Personal"),
          copy("Billed once a year", "In één keer per jaar")
        ),
        plan(
          "family",
          "yearly",
          129,
          "EUR",
          copy("Family", "Family"),
          copy("Billed once a year", "In één keer per jaar"),
          6
        ),
      ],
    },
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    iconKey: "chatgpt",
    letters: "GPT",
    tile: "#10A37F",
    ink: "#F6F7FB",
    category: "Productivity",
    group: "ai",
    search: ["chatgpt", "openai", "gpt"],
    suggest: "plus",
    plans: {
      BE: [
        plan(
          "go",
          "monthly",
          7.99,
          "EUR",
          copy("Go", "Go"),
          copy("Belgium App Store", "Belgische App Store")
        ),
        plan(
          "plus",
          "monthly",
          22.99,
          "EUR",
          copy("Plus", "Plus"),
          copy("Belgium App Store", "Belgische App Store")
        ),
      ],
    },
  },
  {
    id: "claude",
    name: "Claude",
    iconKey: "claude",
    letters: "Cl",
    tile: "#C96442",
    ink: "#F6F7FB",
    category: "Productivity",
    group: "ai",
    search: ["claude", "anthropic"],
    suggest: "pro",
    plans: {
      BE: [
        plan(
          "pro",
          "monthly",
          22,
          "EUR",
          copy("Pro", "Pro"),
          copy("Belgium App Store", "Belgische App Store")
        ),
      ],
    },
  },
  {
    id: "playstation",
    name: "PlayStation Plus",
    iconKey: "playstation",
    letters: "PS",
    tile: "#0070D1",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "play",
    search: ["playstation", "psplus", "ps"],
    suggest: "extra",
    plans: {
      BE: [
        plan(
          "essential",
          "monthly",
          9.99,
          "EUR",
          copy("Essential", "Essential"),
          copy("Monthly games and online play", "Maandelijkse games en online spelen")
        ),
        plan(
          "extra",
          "monthly",
          15.99,
          "EUR",
          copy("Extra", "Extra"),
          copy("Game catalogue", "Gamecatalogus")
        ),
        plan(
          "premium",
          "monthly",
          18.99,
          "EUR",
          copy("Premium", "Premium"),
          copy("Classics and cloud streaming", "Klassiekers en cloudstreaming")
        ),
        plan(
          "essential",
          "yearly",
          71.99,
          "EUR",
          copy("Essential", "Essential"),
          copy("Billed once a year", "In één keer per jaar")
        ),
        plan(
          "extra",
          "yearly",
          125.99,
          "EUR",
          copy("Extra", "Extra"),
          copy("Billed once a year", "In één keer per jaar")
        ),
        plan(
          "premium",
          "yearly",
          151.99,
          "EUR",
          copy("Premium", "Premium"),
          copy("Billed once a year", "In één keer per jaar")
        ),
      ],
    },
  },
  {
    id: "xbox",
    name: "Xbox Game Pass",
    iconKey: "xbox",
    letters: "Xb",
    tile: "#107C10",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "play",
    search: ["xbox", "gamepass"],
    suggest: "ultimate",
    plans: {
      BE: [
        plan(
          "premium",
          "monthly",
          12.99,
          "EUR",
          copy("Premium", "Premium"),
          copy("Console and PC catalogue", "Catalogus voor console en pc")
        ),
        plan(
          "ultimate",
          "monthly",
          20.99,
          "EUR",
          copy("Ultimate", "Ultimate"),
          copy("Day-one games, EA Play", "Games op dag één, EA Play")
        ),
      ],
    },
  },
  {
    id: "nintendo",
    name: "Nintendo Switch Online",
    iconKey: "nintendo",
    letters: "NS",
    tile: "#E60012",
    ink: "#F6F7FB",
    category: "Entertainment",
    group: "play",
    search: ["nintendo", "switch"],
    suggest: "",
    plans: {},
  },
  {
    id: "fitness",
    name: "Fitness",
    label: copy("Fitness", "Fitness"),
    iconKey: "fitness",
    letters: "Fi",
    tile: "#F6F7FB",
    ink: "#0B0C0F",
    category: "Health",
    group: "home",
    search: ["fitness", "gym", "sportschool", "basicfit"],
    suggest: "",
    plans: {},
  },
  {
    id: "mobile",
    name: "Mobile",
    label: copy("Mobile", "Mobiel"),
    iconKey: "mobile",
    letters: "Mo",
    tile: "#F6F7FB",
    ink: "#0B0C0F",
    category: "Utilities",
    group: "home",
    search: ["mobile", "gsm", "phone", "telenet", "proximus", "orange"],
    suggest: "",
    plans: {},
  },
  {
    id: "internet",
    name: "Internet",
    label: copy("Internet", "Internet"),
    iconKey: "internet",
    letters: "In",
    tile: "#F6F7FB",
    ink: "#0B0C0F",
    category: "Utilities",
    group: "home",
    search: ["internet", "wifi", "broadband"],
    suggest: "",
    plans: {},
  },
];

export function catalogCopy(text: Copy, locale: AppLocale): string {
  return locale === "nl" ? text.nl : text.en;
}

export function serviceLabel(service: CatalogService, locale: AppLocale): string {
  return service.label ? catalogCopy(service.label, locale) : service.name;
}

export function catalogService(id: string): CatalogService | undefined {
  return CATALOG.find((service) => service.id === id);
}

/** Colored monogram for a service that has no brand glyph. */
export function catalogTileFor(input: {
  iconKey?: string | null;
  name?: string | null;
  provider?: string | null;
}): { letters: string; tile: string; ink: string } | null {
  const needles = [input.iconKey, input.name, input.provider]
    .map((value) => (value ? normalize(value) : ""))
    .filter((value) => value.length > 0);
  if (needles.length === 0) return null;
  for (const service of CATALOG) {
    const keys = [service.iconKey, service.id, service.name, service.label?.en, service.label?.nl]
      .map((value) => (value ? normalize(value) : ""))
      .filter((value) => value.length > 0);
    if (needles.some((needle) => keys.includes(needle))) {
      return { letters: service.letters, tile: service.tile, ink: service.ink };
    }
  }
  return null;
}

/** Euro opens on Belgium, where the list is fullest. GBP and USD open on their own list. */
export function defaultCatalogRegion(currency: string): CatalogRegion {
  const code = currency.trim().toUpperCase();
  if (code === "GBP") return "GB";
  if (code === "USD") return "US";
  return "BE";
}

export function regionCurrency(region: CatalogRegion): CatalogPlan["currency"] {
  if (region === "GB") return "GBP";
  if (region === "US") return "USD";
  return "EUR";
}

export function servicesForRegion(region: CatalogRegion): CatalogService[] {
  return CATALOG.filter((service) => {
    if (service.hide?.includes(region)) return false;
    if (service.only && !service.only.includes(region)) return false;
    return true;
  });
}

export function serviceMatches(service: CatalogService, query: string): boolean {
  const needle = normalize(query);
  if (!needle) return true;
  const hay = [service.name, service.id, ...service.search].map(normalize);
  return hay.some((part) => part.includes(needle));
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

export function plansFor(
  service: CatalogService,
  region: CatalogRegion,
  cycle?: CatalogCycle
): CatalogPlan[] {
  const rows = service.plans[region] ?? [];
  if (!cycle) return [...rows];
  return rows.filter((row) => row.cycle === cycle);
}

export function suggestedPlan(
  service: CatalogService,
  region: CatalogRegion
): CatalogPlan | null {
  const monthly = plansFor(service, region, "monthly");
  const pool = monthly.length > 0 ? monthly : plansFor(service, region);
  if (pool.length === 0) return null;
  return pool.find((row) => row.id === service.suggest) ?? pool[0] ?? null;
}

/** Cheapest monthly plan, or the cheapest plan when the service is yearly only. */
export function fromPlan(
  service: CatalogService,
  region: CatalogRegion
): CatalogPlan | null {
  const monthly = plansFor(service, region, "monthly");
  const pool = monthly.length > 0 ? monthly : plansFor(service, region);
  return pool.reduce<CatalogPlan | null>((lowest, row) => {
    if (!lowest || row.amount < lowest.amount) return row;
    return lowest;
  }, null);
}

export function findPlan(
  service: CatalogService,
  region: CatalogRegion,
  id: string,
  cycle: CatalogCycle
): CatalogPlan | undefined {
  return plansFor(service, region).find(
    (row) => row.id === id && row.cycle === cycle
  );
}

/** Accepts 16.99 and 16,99. Rejects zero, blanks, and more than two decimals. */
export function parseMoney(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999_999) return null;
  return amount;
}

/** Same calendar day next month. The 31st lands on the last day of the next month. */
export function defaultNextChargeDate(from = new Date()): string {
  const day = from.getDate();
  const next = new Date(from.getFullYear(), from.getMonth() + 1, 1);
  const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, last));
  return formatCalendarDate(next);
}

/** Personal share averaged per month. Yearly plans are divided by 12 first. */
export function monthlyPersonalShare(
  amount: number,
  cycle: CatalogCycle,
  shared: boolean,
  people: number | null
): number {
  const monthly = cycle === "yearly" ? amount / 12 : amount;
  if (!shared || people == null || people < 2) return monthly;
  return monthly / people;
}

export type CatalogChargeInput = {
  serviceId: string | null;
  customName: string;
  region: CatalogRegion;
  locale: AppLocale;
  planId: string | null;
  cycle: CatalogCycle;
  listed: boolean;
  amount: number;
  shared: boolean;
  shareCount: number | null;
  nextPaymentDate: string;
};

/**
 * One confirmed row. A listed plan keeps the catalog amount, not whatever was
 * typed beside it. A typed amount uses the region's currency.
 */
export function buildCatalogCharge(
  input: CatalogChargeInput
): SubscriptionFormInput | null {
  const service = input.serviceId ? catalogService(input.serviceId) : undefined;
  if (input.serviceId && !service) return null;

  const name = (
    service ? serviceLabel(service, input.locale) : input.customName
  ).trim();
  if (name.length === 0) return null;

  let amount = input.amount;
  let currency: string = regionCurrency(input.region);
  let notes = "";

  if (service && input.planId) {
    const chosen = findPlan(service, input.region, input.planId, input.cycle);
    if (input.listed) {
      if (!chosen) return null;
      amount = chosen.amount;
      currency = chosen.currency;
    }
    if (chosen) {
      notes = `${catalogCopy(chosen.name, input.locale)} · ${catalogCopy(chosen.detail, input.locale)}`;
    }
  } else if (input.listed) {
    return null;
  }

  if (!Number.isFinite(amount) || amount <= 0) return null;

  const slug = brandSlugFor({
    iconKey: service?.iconKey,
    name,
    provider: name,
  });

  const parsed = subscriptionFormSchema.safeParse({
    name,
    provider: name,
    iconKey: slug ?? service?.iconKey ?? "",
    category: service?.category ?? "Other",
    billingCycle: input.cycle,
    totalPrice: amount,
    currency,
    shared: input.shared,
    shareCount: input.shared ? input.shareCount ?? undefined : undefined,
    nextPaymentDate: input.nextPaymentDate,
    notes,
    active: true,
    reviewFlag: false,
  });

  return parsed.success ? parsed.data : null;
}
