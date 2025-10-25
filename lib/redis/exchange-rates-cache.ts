import { redis } from "./redis-config"

export interface ExchangeRatesCache {
  rates: Record<string, number>
  lastUpdated: string
  source: "exchangerate-api" | "frankfurter" | "fallback"
}

const EXCHANGE_RATES_KEY = "exchange:rates"

/**
 * Fetch and cache exchange rates
 */
export async function updateExchangeRatesCache(): Promise<ExchangeRatesCache | null> {
  const primaryResult = await fetchFromExchangeRateAPI()
  await redis.set(EXCHANGE_RATES_KEY, primaryResult)
  console.log("✅ Exchange rates cached in Redis")
  return primaryResult
}

/**
 * Get cached exchange rates from Redis
 */
export async function getCachedExchangeRates(): Promise<ExchangeRatesCache | null> {
  try {
    const cached = await redis.get<ExchangeRatesCache>(EXCHANGE_RATES_KEY)

    if (!cached) {
      console.log("No exchange rates cache found, fetching...")
      return await updateExchangeRatesCache()
    }

    const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime()
    const ONE_DAY = 24 * 60 * 60 * 1000

    if (cacheAge > ONE_DAY) {
      console.log("Exchange rates cache is stale, refreshing...")
      return await updateExchangeRatesCache()
    }

    return cached
  } catch (error) {
    console.error("Redis fetch error:", error)
    return null
  }
}

/**
 * Primary: exchangerate-api.com
 */
async function fetchFromExchangeRateAPI(): Promise<ExchangeRatesCache | null> {
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`,
      { next: { revalidate: 0 } }
    )

    if (!response.ok) throw new Error(`Failed: ${response.status}`)

    const data = await response.json()

    return {
      rates: data.conversion_rates || {},
      lastUpdated: new Date(data.time_last_update_unix * 1000).toISOString(),
      source: "exchangerate-api",
    }
  } catch (error) {
    console.error("exchangerate-api.com failed:", error)
    return null
  }
}

// /**
//  * Fallback: frankfurter
//  */
// async function fetchFromFrankfurter(): Promise<ExchangeRatesCache | null> {
//   try {
//     const response = await fetch(
//       "https://api.frankfurter.app/latest?from=USD",
//       { next: { revalidate: 0 } }
//     )

//     if (!response.ok) throw new Error(`Failed: ${response.status}`)

//     const data = await response.json()

//     console.log("✅ Fetched exchange rates from frankfurter")

//     return {
//       rates: { USD: 1, ...data.rates },
//       lastUpdated: new Date().toISOString(),
//       source: "frankfurter",
//     }
//   } catch (error) {
//     console.error("❌ frankfurter failed:", error)
//     return null
//   }
// }
