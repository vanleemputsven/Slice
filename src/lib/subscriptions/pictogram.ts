import type { LucideIcon } from "lucide-react";
import {
  AppWindow,
  CirclePlay,
  Clapperboard,
  Dumbbell,
  Feather,
  Goal,
  Joystick,
  Gamepad2,
  Plus,
  Popcorn,
  Smartphone,
  Sparkles,
  Star,
  Tv,
  TvMinimalPlay,
  Waves,
  Wifi,
} from "lucide-react";

/**
 * Open pictograms (Lucide, ISC) for services whose trademark artwork is not in
 * the CC0 set. These are not the brand logos. They sit on the service color.
 */
const ICONS = {
  disney: Star,
  prime: CirclePlay,
  streamz: Waves,
  videoland: Clapperboard,
  vtmgo: TvMinimalPlay,
  playsports: Goal,
  nlziet: Tv,
  canal: Plus,
  hulu: Popcorn,
  peacock: Feather,
  chatgpt: Sparkles,
  xbox: Gamepad2,
  nintendo: Joystick,
  microsoft365: AppWindow,
  fitness: Dumbbell,
  mobile: Smartphone,
  internet: Wifi,
} satisfies Record<string, LucideIcon>;

const ALIASES: Record<string, keyof typeof ICONS> = {
  disney: "disney",
  disneyplus: "disney",
  prime: "prime",
  primevideo: "prime",
  streamz: "streamz",
  videoland: "videoland",
  vtmgo: "vtmgo",
  vtmgoplus: "vtmgo",
  playsports: "playsports",
  nlziet: "nlziet",
  canal: "canal",
  canalplus: "canal",
  hulu: "hulu",
  peacock: "peacock",
  chatgpt: "chatgpt",
  openai: "chatgpt",
  xbox: "xbox",
  xboxgamepass: "xbox",
  nintendo: "nintendo",
  nintendoswitch: "nintendo",
  nintendoswitchonline: "nintendo",
  microsoft365: "microsoft365",
  fitness: "fitness",
  mobile: "mobile",
  mobiel: "mobile",
  internet: "internet",
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
}

export function pictogramFor(input: {
  iconKey?: string | null;
  name?: string | null;
  provider?: string | null;
}): LucideIcon | null {
  for (const raw of [input.iconKey, input.name, input.provider]) {
    if (!raw) continue;
    const key = ALIASES[normalize(raw)];
    if (key) return ICONS[key];
  }
  return null;
}
