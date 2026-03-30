import { z } from "zod";
import { appLocaleSchema } from "@/lib/i18n/locale";

export const preferencesSchema = z.object({
  hourlyWage: z.coerce.number().min(0).max(10_000).nullable(),
  hoursPerWorkday: z.coerce.number().min(1).max(24).default(8),
  currency: z.string().length(3).default("USD"),
  locale: appLocaleSchema.default("en"),
  preferredName: z.string().max(80).nullable().default(null),
});

export type Preferences = z.infer<typeof preferencesSchema>;

/** Default row when no `user_preferences` exists yet; keep in sync with the client provider. */
export const defaultPreferences: Preferences = preferencesSchema.parse({
  hourlyWage: null,
  hoursPerWorkday: 8,
  currency: "USD",
  locale: "en",
  preferredName: null,
});
