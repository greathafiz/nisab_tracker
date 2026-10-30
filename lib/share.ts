import { SITE_URL } from "./site";
import { formatMoneyRounded, type CurrencyCode } from "./currencies";
import { getCountryByCurrency, countryInName } from "./countries";

/**
 * The message forwarded to WhatsApp groups and posted to X. Both figures go in the
 * text itself, because many people read the forward without opening the link.
 */
export function nisabShareText({
  place,
  silver,
  gold,
  currency,
  date,
}: {
  place: string;
  silver: number;
  gold: number;
  currency: CurrencyCode;
  date: string;
}): string {
  return [
    `Today's Nisab in ${place} (${date}):`,
    `🥈 Silver: ${formatMoneyRounded(silver, currency)}`,
    `🥇 Gold: ${formatMoneyRounded(gold, currency)}`,
  ].join("\n");
}

// The country page for a currency, whose preview image shows that day's figures
export function nisabShareTarget(currency: CurrencyCode) {
  const country = getCountryByCurrency(currency);
  return country
    ? {
        place: countryInName(country),
        url: `${SITE_URL}/nisab/${country.slug}`,
      }
    : { place: "USD", url: SITE_URL };
}
