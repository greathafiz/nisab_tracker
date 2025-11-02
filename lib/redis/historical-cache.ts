/**
 * Redis-based historical metals price caching
 * Stores 7-day and 30-day price history
 * Updates once daily via cron job
 */

import { TROY_OUNCE_TO_GRAMS } from "../utils";
import { redis } from "./redis-config";

export interface HistoricalDataPoint {
  date: string;
  goldPrice: number;
  silverPrice: number;
}

export interface HistoricalCache {
  sevenDay: HistoricalDataPoint[];
  thirtyDay: HistoricalDataPoint[];
  lastUpdated: string;
}

const HISTORICAL_CACHE_KEY = "metals:historical";

/**
 * Fetch and cache historical metal prices (7-day and 30-day)
 * Called once daily via cron job
 */
export async function updateHistoricalPricesCache(): Promise<HistoricalCache> {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  try {
    const sevenDayData = await fetchHistoricalData(
      formatDate(sevenDaysAgo),
      formatDate(today)
    );

    const thirtyDayData = await fetchHistoricalData(
      formatDate(thirtyDaysAgo),
      formatDate(today)
    );

    const historicalCache: HistoricalCache = {
      sevenDay: sevenDayData,
      thirtyDay: thirtyDayData,
      lastUpdated: new Date().toISOString(),
    };

    await redis.set(HISTORICAL_CACHE_KEY, historicalCache);

    return historicalCache;
  } catch (error) {
    console.error("Failed to update historical data:", error);

    const cached = await redis.get<HistoricalCache>(HISTORICAL_CACHE_KEY);
    if (cached) return cached;

    return {
      sevenDay: [],
      thirtyDay: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Get cached historical data from Redis
 */
export async function getCachedHistoricalData(): Promise<HistoricalCache | null> {
  try {
    const cached = await redis.get<HistoricalCache>(HISTORICAL_CACHE_KEY);

    if (!cached) return await updateHistoricalPricesCache();

    // Check if cache is stale (older than 24 hours)
    const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    if (cacheAge > ONE_DAY) {
      // Refresh in background, but return stale data immediately
      updateHistoricalPricesCache().catch((err) =>
        console.error("Background update failed:", err)
      );
    }

    return cached;
  } catch (error) {
    console.error("Redis fetch error:", error);
    return null;
  }
}

/**
 * Fetch historical data from metalpriceapi.com
 * Makes two parallel requests (one for gold, one for silver) due to free plan limitations
 */
async function fetchHistoricalData(
  startDate: string,
  endDate: string
): Promise<HistoricalDataPoint[]> {
  const apiKey = process.env.METAL_PRICE_API_KEY;

  if (!apiKey) {
    throw new Error("METAL_PRICE_API_KEY not configured");
  }

  const [goldResponse, silverResponse] = await Promise.all([
    fetch(
      `https://api.metalpriceapi.com/v1/timeframe?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}&base=USD&currencies=XAU`,
      { next: { revalidate: 0 } }
    ),
    fetch(
      `https://api.metalpriceapi.com/v1/timeframe?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}&base=USD&currencies=XAG`,
      { next: { revalidate: 0 } }
    ),
  ]);

  if (!goldResponse.ok)
    throw new Error(`Gold API failed: ${goldResponse.status}`);

  if (!silverResponse.ok)
    throw new Error(`Silver API failed: ${silverResponse.status}`);

  const [goldData, silverData] = await Promise.all([
    goldResponse.json(),
    silverResponse.json(),
  ]);

  if (!goldData.success || !goldData.rates) {
    throw new Error("Invalid gold historical data response");
  }

  if (!silverData.success || !silverData.rates) {
    throw new Error("Invalid silver historical data response");
  }

  // Merge gold and silver data by date
  const goldRates = goldData.rates as Record<string, { XAU: number }>;
  const silverRates = silverData.rates as Record<string, { XAG: number }>;

  const historicalData: HistoricalDataPoint[] = Object.keys(goldRates).map(
    (date) => ({
      date,
      goldPrice: Number(
        (1 / goldRates[date].XAU / TROY_OUNCE_TO_GRAMS).toFixed(4)
      ), // USD per gram
      silverPrice: Number(
        (1 / silverRates[date].XAG / TROY_OUNCE_TO_GRAMS).toFixed(4)
      ),
    })
  );

  // Sort by date ascending
  return historicalData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
