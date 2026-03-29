import type { SubscriptionFormValidationMessages } from "@/lib/validation/subscription";
import type { AppLocale } from "@/lib/i18n/locale";

const en: SubscriptionFormValidationMessages = {
  nameRequired: "Name is required",
  providerRequired: "Provider is required",
  dateFormat: "Use YYYY-MM-DD",
  invalidDate: "Invalid date",
  pricePositive: "Price must be positive",
  customPeriod: "Enter billing period in months",
  shareCount: "Enter how many people split this (2+)",
};

const nl: SubscriptionFormValidationMessages = {
  nameRequired: "Naam is verplicht",
  providerRequired: "Aanbieder is verplicht",
  dateFormat: "Gebruik JJJJ-MM-DD",
  invalidDate: "Ongeldige datum",
  pricePositive: "Prijs moet positief zijn",
  customPeriod: "Vul de factureringsperiode in maanden in",
  shareCount: "Vul in met hoeveel personen je dit deelt (2+)",
};

export const subscriptionFormValidationByLocale: Record<
  AppLocale,
  SubscriptionFormValidationMessages
> = {
  en,
  nl,
};
