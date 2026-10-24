import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { getCurrentMetalPrices } from "@/lib/redis/metals-cache";
import { isOlderThan } from "@/lib/utils";

/**
 * Nisab values in USD; pages convert them to the visitor's currency client-side
 */
export interface NisabValues {
  nisabGold: number;
  nisabSilver: number;
  dowry: number;
  diyyah: number;
  lastUpdated: string;
  // True when prices haven't been refreshed for a while, i.e. the daily update is failing
  isStale: boolean;
  goldPriceChange: number;
  silverPriceChange: number;
  goldPricePerGram: number;
  silverPricePerGram: number;
}

export const GOLD_NISAB_GRAMS = 87.48;
export const SILVER_NISAB_GRAMS = 612.36;
const MAHR_AL_FATIMAH_GRAMS = 1487.5; // 500 dirhams × 2.975g
const DIYYAH_GOLD_GRAMS = 4374; // Approximately 1000 dinars

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
      nisabGold: Number((goldPricePerGram * GOLD_NISAB_GRAMS).toFixed(2)),
      nisabSilver: Number((silverPricePerGram * SILVER_NISAB_GRAMS).toFixed(2)),
      dowry: Number((silverPricePerGram * MAHR_AL_FATIMAH_GRAMS).toFixed(2)),
      diyyah: Number((goldPricePerGram * DIYYAH_GOLD_GRAMS).toFixed(2)),
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
  const values = await getNisabValues();
  if (!values && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
    throw new Error("Nisab values are unavailable");
  }
  return values;
}
