import { z } from "zod";

export const preferencesSchema = z.object({
  hourlyWage: z.coerce.number().min(0).max(10_000).nullable(),
  hoursPerWorkday: z.coerce.number().min(1).max(24).default(8),
  currency: z.string().length(3).default("USD"),
});

export type Preferences = z.infer<typeof preferencesSchema>;
