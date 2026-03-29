import { z } from "zod";
import { appLocaleSchema } from "@/lib/i18n/locale";

export const preferencesSchema = z.object({
  hourlyWage: z.coerce.number().min(0).max(10_000).nullable(),
  hoursPerWorkday: z.coerce.number().min(1).max(24).default(8),
  currency: z.string().length(3).default("USD"),
  locale: appLocaleSchema.default("en"),
});

export type Preferences = z.infer<typeof preferencesSchema>;
