import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { getCurrentMetalPrices } from "@/lib/redis/metals-cache";
import { getCachedExchangeRates } from "@/lib/redis/exchange-rates-cache";
import type { CurrencyCode } from "@/lib/currencies";
import { isOlderThan } from "@/lib/utils";

/**
 * Metal prices in USD per gram. Nisab amounts depend on the weight standard, so pages
 * derive them with nisabAmounts() from lib/nisab-standards.ts.
 */
export interface NisabValues {
  lastUpdated: string;
  // True when prices haven't been refreshed for a while, i.e. the daily update is failing
  isStale: boolean;
  goldPriceChange: number;
  silverPriceChange: number;
  goldPricePerGram: number;
  silverPricePerGram: number;
}

const STALE_AFTER_MS = 48 * 60 * 60 * 1000;

export async function getNisabValues(): Promise<NisabValues | null> {
  try {
    const priceCache = await getCurrentMetalPrices();

    if (!priceCache) {
      console.error("Failed to get cached metals prices");
      return null;
    }

    const { goldPricePerGram, silverPricePerGram } = priceCache;

    return {
      lastUpdated: priceCache.lastUpdated,
      isStale: isOlderThan(
        priceCache.fetchedAt ?? priceCache.lastUpdated,
        STALE_AFTER_MS
      ),
      goldPriceChange: priceCache.goldPriceChange,
      silverPriceChange: priceCache.silverPriceChange,
      goldPricePerGram,
      silverPricePerGram,
    };
  } catch (error) {
    console.error("Error calculating Nisab values:", error);
    return null;
  }
}

/**
 * Nisab values for rendering a page.
 *
 * After the build, a failure throws: during ISR revalidation that makes Next.js keep
 * serving the last good page instead of caching an error state for the next hour.
 * During the build it returns null so the page can render its fallback.
 */
export async function getNisabValuesForPage(): Promise<NisabValues | null> {
  return orThrowAfterBuild(await getNisabValues(), "Nisab values");
}

/**
 * USD exchange rates for rendering a page, with the same failure handling as
 * getNisabValuesForPage
 */
export async function getExchangeRatesForPage(): Promise<Partial<
  Record<CurrencyCode, number>
> | null> {
  const cache = await getCachedExchangeRates();
  return orThrowAfterBuild(
    cache && { ...cache.rates, USD: 1 },
    "Exchange rates"
  );
}

function orThrowAfterBuild<T>(value: T | null, what: string): T | null {
  if (!value && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
    throw new Error(`${what} are unavailable`);
  }
  return value;
}
