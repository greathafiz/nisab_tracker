import type { CurrencyCode } from "./currencies";

/**
 * The Nisab is 20 dinars (mithqal) of gold or 200 dirhams of silver. Scholars convert
 * these to grams with different coin weights; see docs/nisab-weights-research.md.
 * Mahr al-Fatimah (500 dirhams) and Diyyah (1000 dinars) follow from the same weights.
 */
export const NISAB_STANDARDS = {
  // AAOIFI Shari'ah Standard 35, al-Qaradawi, and most fatwa bodies outside South Asia
  majority: {
    label: "85 g / 595 g",
    description: "AAOIFI and most scholars",
    dinarGrams: 4.25,
    dirhamGrams: 2.975,
    goldGrams: 85,
    silverGrams: 595,
  },
  // Hanafi scholars in South Asia: 7.5 tola of gold, 52.5 tola of silver
  hanafi: {
    label: "87.48 g / 612.36 g",
    description: "Hanafi / tola (South Asia)",
    dinarGrams: 4.374,
    dirhamGrams: 3.0618,
    goldGrams: 87.48,
    silverGrams: 612.36,
  },
} as const;

export type NisabStandardId = keyof typeof NISAB_STANDARDS;

// Where Hanafi tola weights are the norm (the countries that price gold per tola)
const HANAFI_CURRENCIES: CurrencyCode[] = ["PKR", "INR", "BDT"];

export function defaultStandardFor(currency: CurrencyCode): NisabStandardId {
  return HANAFI_CURRENCIES.includes(currency) ? "hanafi" : "majority";
}

export function nisabAmounts(
  prices: { goldPricePerGram: number; silverPricePerGram: number },
  standard: NisabStandardId
) {
  const { goldGrams, silverGrams } = NISAB_STANDARDS[standard];
  return {
    gold: prices.goldPricePerGram * goldGrams,
    silver: prices.silverPricePerGram * silverGrams,
  };
}

export const STANDARDS_EXPLAINER =
  "Nisab is 20 dinars of gold or 200 dirhams of silver. Most scholars and AAOIFI convert this to 85 g of gold / 595 g of silver; Hanafi scholars in South Asia use 87.48 g / 612.36 g (7.5 / 52.5 tola), about 3% higher. Both are valid, so use the one your scholar follows.";
