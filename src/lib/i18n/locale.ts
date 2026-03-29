import { z } from "zod";

export const appLocaleSchema = z.enum(["en", "nl"]);
export type AppLocale = z.infer<typeof appLocaleSchema>;

export function sliceDateLocale(locale: AppLocale): string {
  return locale === "nl" ? "nl-NL" : "en-US";
}
