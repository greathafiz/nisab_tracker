import { TROY_OUNCE_TO_GRAMS } from "../utils";
import { redis, getWithDailyRefresh } from "./redis-config";

export interface MetalsPriceCache {
  goldPricePerGram: number;
  silverPricePerGram: number;
  goldPriceChange: number; // 24h change %
  silverPriceChange: number; // 24h change %
  lastUpdated: string;
  fetchedAt?: string;
  source: "metalpriceapi" | "goldpriceio" | "islamicapi";
}

interface PreviousDayPrices {
  gold: number;
  silver: number;
  date: string;
}

/**
 * Metals Price Cache Module
 *
 * Manages current gold/silver prices with a 3-tier fallback system:
 * 1. Primary: metalpriceapi.com (100 req/month)
 * 2. Fallback 1: goldapi.io (100 req/month)
 * 3. Fallback 2: islamicapi.com (limited to Islamic finance data)
 *
 * Prices are stored in Redis and updated daily via cron job. If every source fails,
 * the last good prices stay in the cache; we never show made-up prices.
 * Previous day's prices are kept for calculating 24h change percentage.
 */

const METALS_CACHE_KEY = "metals:current";
const PREVIOUS_PRICES_KEY = "metals:previous";

/**
 * Fetch prices from each source in turn and cache the first that succeeds.
 * Returns null if every source fails, leaving the existing cache untouched.
 */
export async function updateCurrentMetalPrices(): Promise<MetalsPriceCache | null> {
  const fresh =
    (await fetchFromMetalPriceAPI()) ??
    (await fetchFromGoldAPIIO()) ??
    (await fetchFromIslamicAPI());

  if (!fresh) {
    console.error("All metal price APIs failed");
    return null;
  }

  fresh.fetchedAt = new Date().toISOString();
  await saveToCacheWithHistory(fresh);
  return fresh;
}

/**
 * Get cached prices from Redis, refreshing them if they're over a day old
 */
export async function getCurrentMetalPrices(): Promise<MetalsPriceCache | null> {
  try {
    return await getWithDailyRefresh(
      METALS_CACHE_KEY,
      updateCurrentMetalPrices
    );
  } catch (error) {
    console.error("Redis fetch error:", error);
    return null;
  }
}

/**
 * Save to Redis and update historical prices for change calculation
 */
async function saveToCacheWithHistory(cache: MetalsPriceCache): Promise<void> {
  const previousPrices =
    await redis.get<PreviousDayPrices>(PREVIOUS_PRICES_KEY);

  if (previousPrices) {
    cache.goldPriceChange = calculatePriceChange(
      cache.goldPricePerGram,
      previousPrices.gold
    );
    cache.silverPriceChange = calculatePriceChange(
      cache.silverPricePerGram,
      previousPrices.silver
    );
  }

  await redis.set(METALS_CACHE_KEY, cache);

  const newPreviousPrices: PreviousDayPrices = {
    gold: cache.goldPricePerGram,
    silver: cache.silverPricePerGram,
    date: new Date().toISOString(),
  };
  await redis.set(PREVIOUS_PRICES_KEY, newPreviousPrices);
}

function unixToISOString(timestamp: number | undefined): string {
  return timestamp
    ? new Date(timestamp * 1000).toISOString()
    : new Date().toISOString();
}

/**
 * Primary: metalpriceapi.com
 */
async function fetchFromMetalPriceAPI(): Promise<MetalsPriceCache | null> {
  const apiKey = process.env.METALPRICEAPI_API_KEY!;

  try {
    const response = await fetch(
      `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU,XAG`,
      { next: { revalidate: 0 } }
    );

    if (!response.ok) {
      throw new Error(`metalpriceapi.com failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.rates) {
      throw new Error("Invalid response from metalpriceapi.com");
    }

    // Convert from USD per troy ounce to USD per gram
    const goldPricePerGram = 1 / data.rates.XAU / TROY_OUNCE_TO_GRAMS;
    const silverPricePerGram = 1 / data.rates.XAG / TROY_OUNCE_TO_GRAMS;

    return {
      goldPricePerGram: Number(goldPricePerGram.toFixed(4)),
      silverPricePerGram: Number(silverPricePerGram.toFixed(4)),
      goldPriceChange: 0, // Will be calculated when saving
      silverPriceChange: 0,
      lastUpdated: unixToISOString(data.timestamp),
      source: "metalpriceapi",
    };
  } catch (error) {
    console.error("metalpriceapi.com failed:", error);
    return null;
  }
}

/**
 * Fallback 1: goldapi.io
 */
async function fetchFromGoldAPIIO(): Promise<MetalsPriceCache | null> {
  const apiKey = process.env.GOLDAPI_IO_API_KEY!;

  try {
    const [goldResponse, silverResponse] = await Promise.all([
      fetch(`https://www.goldapi.io/api/XAU/USD`, {
        headers: { "x-access-token": apiKey },
        next: { revalidate: 0 },
      }),
      fetch(`https://www.goldapi.io/api/XAG/USD`, {
        headers: { "x-access-token": apiKey },
        next: { revalidate: 0 },
      }),
    ]);

    if (!goldResponse.ok || !silverResponse.ok) {
      throw new Error("goldprice.io request failed");
    }

    const goldData = await goldResponse.json();
    const silverData = await silverResponse.json();

    return {
      goldPricePerGram: Number(goldData.price_gram_24k.toFixed(4)),
      silverPricePerGram: Number(silverData.price_gram_24k.toFixed(4)),
      goldPriceChange: 0,
      silverPriceChange: 0,
      lastUpdated: unixToISOString(goldData.timestamp ?? silverData.timestamp),
      source: "goldpriceio",
    };
  } catch (error) {
    console.error("goldprice.io failed:", error);
    return null;
  }
}

/**
 * Fallback 2: islamicapi.com
 */
async function fetchFromIslamicAPI(): Promise<MetalsPriceCache | null> {
  const apiKey = process.env.ISLAMICAPI_API_KEY!;

  try {
    const response = await fetch(
      `https://islamicapi.com/api/v1/zakat-nisab/?standard=classical&currency=usd&unit=g&api_key=${apiKey}`,
      { next: { revalidate: 0 } }
    );

    if (!response.ok)
      throw new Error(`islamicapi.com failed: ${response.status}`);

    const data = await response.json();

    if (data.code !== 200 || !data.data?.nisab_thresholds)
      throw new Error("Invalid response from islamicapi.com");

    return {
      goldPricePerGram: Number(
        data.data.nisab_thresholds.gold.unit_price.toFixed(4)
      ),
      silverPricePerGram: Number(
        data.data.nisab_thresholds.silver.unit_price.toFixed(4)
      ),
      goldPriceChange: 0,
      silverPriceChange: 0,
      lastUpdated: data.data.updated_at || new Date().toISOString(),
      source: "islamicapi",
    };
  } catch (error) {
    console.error("islamicapi.com failed:", error);
    return null;
  }
}

/**
 * Calculate percentage change from previous day
 */
function calculatePriceChange(
  currentPrice: number,
  previousPrice: number
): number {
  if (!previousPrice) return 0;

  const change = ((currentPrice - previousPrice) / previousPrice) * 100;
  return Number(change.toFixed(2));
}
