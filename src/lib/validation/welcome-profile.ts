import { z } from "zod";
import { appLocaleSchema } from "@/lib/i18n/locale";

/** Short allowlist for the welcome step (matches dashboard ISO codes). */
export const welcomeCurrencyCodes = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "CAD",
  "AUD",
  "NOK",
  "SEK",
  "DKK",
  "PLN",
] as const;

export type WelcomeCurrencyCode = (typeof welcomeCurrencyCodes)[number];

const welcomeCurrencySchema = z.enum(welcomeCurrencyCodes);

export const welcomeProfileFormSchema = z.object({
  preferredName: z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length <= 80, { message: "max_name" })
    .transform((s) => (s.length === 0 ? null : s)),
  locale: appLocaleSchema,
  currency: z
    .string()
    .length(3)
    .transform((s) => s.toUpperCase())
    .pipe(welcomeCurrencySchema),
});

/** Validated payload (null = leave display name empty). */
export type WelcomeProfileFormInput = z.infer<typeof welcomeProfileFormSchema>;

/** React Hook Form values before transforms. */
export type WelcomeProfileFormFieldValues = z.input<
  typeof welcomeProfileFormSchema
>;
