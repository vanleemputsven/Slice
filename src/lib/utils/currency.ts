/**
 * @param locale BCP 47 tag, e.g. from `sliceDateLocale` so EUR follows nl‑NL vs en‑US grouping.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
