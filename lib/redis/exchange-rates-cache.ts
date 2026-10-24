import { redis, getWithDailyRefresh } from "./redis-config";

export interface ExchangeRatesCache {
  rates: Record<string, number>;
  lastUpdated: string;
  fetchedAt?: string;
  source: "exchangerate-api";
}

const EXCHANGE_RATES_KEY = "exchange:rates";

/**
 * Fetch and cache exchange rates. Returns null if the fetch fails,
 * leaving the last good rates in the cache.
 */
export async function updateExchangeRatesCache(): Promise<ExchangeRatesCache | null> {
  const fresh = await fetchFromExchangeRateAPI();
  if (!fresh) return null;

  fresh.fetchedAt = new Date().toISOString();
  await redis.set(EXCHANGE_RATES_KEY, fresh);
  return fresh;
}

/**
 * Get cached exchange rates from Redis, refreshing them if they're over a day old
 */
export async function getCachedExchangeRates(): Promise<ExchangeRatesCache | null> {
  try {
    return await getWithDailyRefresh(
      EXCHANGE_RATES_KEY,
      updateExchangeRatesCache
    );
  } catch (error) {
    console.error("Redis fetch error:", error);
    return null;
  }
}

async function fetchFromExchangeRateAPI(): Promise<ExchangeRatesCache | null> {
  const apiKey = process.env.EXCHANGERATEAPI_API_KEY!;

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
      { next: { revalidate: 0 } }
    );

    if (!response.ok) throw new Error(`Failed: ${response.status}`);

    const data = await response.json();

    if (data.result !== "success" || !data.conversion_rates) {
      throw new Error(`Invalid response: ${data["error-type"] ?? "unknown"}`);
    }

    return {
      rates: data.conversion_rates,
      lastUpdated: new Date(data.time_last_update_unix * 1000).toISOString(),
      source: "exchangerate-api",
    };
  } catch (error) {
    console.error("exchangerate-api.com failed:", error);
    return null;
  }
}
