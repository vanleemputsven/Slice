import { BRAND_MARKS, type BrandMark } from "@/lib/subscriptions/brand-marks";

/** Spoken names and stored icon keys that share one glyph. */
const ALIASES: Record<string, string> = {
  netflix: "netflix",
  spotify: "spotify",
  youtube: "youtube",
  youtubepremium: "youtube",
  youtubemusic: "youtubemusic",
  icloud: "icloud",
  icloudplus: "icloud",
  apple: "apple",
  applemusic: "applemusic",
  appletv: "appletv",
  appletvplus: "appletv",
  github: "github",
  notion: "notion",
  crunchyroll: "crunchyroll",
  deezer: "deezer",
  dropbox: "dropbox",
  discord: "discord",
  playstation: "playstation",
  playstationplus: "playstation",
  psplus: "playstation",
  duolingo: "duolingo",
  nordvpn: "nordvpn",
  expressvpn: "expressvpn",
  audible: "audible",
  hbo: "hbomax",
  hbomax: "hbomax",
  paramount: "paramountplus",
  paramountplus: "paramountplus",
  peloton: "peloton",
  strava: "strava",
  tidal: "tidal",
  twitch: "twitch",
  zoom: "zoom",
  figma: "figma",
  googledrive: "googledrive",
  gemini: "googlegemini",
  googlegemini: "googlegemini",
  googleone: "google",
  google: "google",
  steam: "steam",
  claude: "claude",
  dazn: "dazn",
  now: "now",
  rtl: "rtl",
  rtlplus: "rtl",
  sky: "sky",
  disney: "disney",
  disneyplus: "disney",
  prime: "prime",
  primevideo: "prime",
  amazonprime: "prime",
  xbox: "xbox",
  xboxgamepass: "xbox",
  nintendo: "nintendo",
  nintendoswitch: "nintendo",
  nintendoswitchonline: "nintendo",
  hulu: "hulu",
  peacock: "peacock",
  chatgpt: "chatgpt",
  openai: "chatgpt",
  microsoft365: "microsoft365",
  microsoft: "microsoft365",
  office365: "microsoft365",
  vtmgo: "vtmgo",
  vtmgoplus: "vtmgo",
  videoland: "videoland",
  nlziet: "nlziet",
  canal: "canal",
  canalplus: "canal",
  mycanal: "canal",
};

export function normalizeBrandKey(value: string): string {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

/** The glyph slug for a row, or null when we have no mark for it. */
export function brandSlugFor(input: {
  iconKey?: string | null;
  name?: string | null;
  provider?: string | null;
}): string | null {
  for (const raw of [input.iconKey, input.name, input.provider]) {
    if (!raw) continue;
    const slug = ALIASES[normalizeBrandKey(raw)];
    if (slug && BRAND_MARKS[slug]) return slug;
  }
  return null;
}

/**
 * Near-black brand inks disappear on the dark canvas, so those glyphs go light.
 * The check is the brightest channel. Relative luminance would call a pure red
 * such as YouTube almost black, and the mark would turn white.
 */
export function brandGlyph(hex: string): string {
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  if (Math.max(red, green, blue) < 80) return "#F6F7FB";
  return `#${hex}`;
}

export type ResolvedBrandMark = {
  slug: string;
  path: string;
  glyph: string;
  viewBox: string;
  paths: readonly string[];
  stroke?: number;
  fills?: readonly string[];
};

export function brandMarkFor(input: {
  iconKey?: string | null;
  name?: string | null;
  provider?: string | null;
}): ResolvedBrandMark | null {
  const slug = brandSlugFor(input);
  if (!slug) return null;
  const mark: BrandMark | undefined = BRAND_MARKS[slug];
  if (!mark) return null;
  return {
    slug,
    path: mark.path,
    glyph: brandGlyph(mark.hex),
    viewBox: mark.viewBox ?? "0 0 24 24",
    paths: mark.paths ?? [mark.path],
    stroke: mark.stroke,
    fills: mark.fills,
  };
}
