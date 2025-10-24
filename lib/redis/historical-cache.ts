/**
 * Redis-based historical metals price caching
 * Stores 7-day and 30-day price history
 * Updates once daily via cron job
 */

import { kv } from "@vercel/kv"

export interface HistoricalDataPoint {
  date: string
  goldPrice: number
  silverPrice: number
}

export interface HistoricalCache {
  sevenDay: HistoricalDataPoint[]
  thirtyDay: HistoricalDataPoint[]
  lastUpdated: string
}

// Redis keys
const HISTORICAL_CACHE_KEY = "metals:historical"

const TROY_OUNCE_TO_GRAMS = 31.1035

/**
 * Fetch and cache historical metal prices (7-day and 30-day)
 * Called once daily via cron job
 */
export async function updateHistoricalPricesCache(): Promise<HistoricalCache> {
  console.log("📈 Updating historical prices cache in Redis...")

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const formatDate = (date: Date) => date.toISOString().split("T")[0]

  try {
    // Fetch 7-day data
    const sevenDayData = await fetchHistoricalData(
      formatDate(sevenDaysAgo),
      formatDate(today)
    )

    // Fetch 30-day data
    const thirtyDayData = await fetchHistoricalData(
      formatDate(thirtyDaysAgo),
      formatDate(today)
    )

    const historicalCache: HistoricalCache = {
      sevenDay: sevenDayData,
      thirtyDay: thirtyDayData,
      lastUpdated: new Date().toISOString(),
    }

    // Save to Redis
    await kv.set(HISTORICAL_CACHE_KEY, historicalCache)
    console.log("✅ Historical data cached in Redis")

    return historicalCache
  } catch (error) {
    console.error("❌ Failed to update historical data:", error)

    // Return cached data or empty arrays
    const cached = await getCachedHistoricalData()
    if (cached) {
      console.warn("⚠️ Using cached historical data")
      return cached
    }

    return {
      sevenDay: [],
      thirtyDay: [],
      lastUpdated: new Date().toISOString(),
    }
  }
}

/**
 * Get cached historical data from Redis
 */
export async function getCachedHistoricalData(): Promise<HistoricalCache | null> {
  try {
    const cached = await kv.get<HistoricalCache>(HISTORICAL_CACHE_KEY)

    if (!cached) {
      console.log("💾 No historical cache found, fetching fresh data...")
      return await updateHistoricalPricesCache()
    }

    // Check if cache is stale (older than 24 hours)
    const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime()
    const ONE_DAY = 24 * 60 * 60 * 1000

    if (cacheAge > ONE_DAY) {
      console.log("⏰ Historical cache is stale, refreshing...")
      return await updateHistoricalPricesCache()
    }

    return cached
  } catch (error) {
    console.error("❌ Redis fetch error:", error)
    return null
  }
}

/**
 * Fetch historical data from metalpriceapi.com
 */
async function fetchHistoricalData(
  startDate: string,
  endDate: string
): Promise<HistoricalDataPoint[]> {
  const apiKey = process.env.METAL_PRICE_API_KEY

  if (!apiKey) {
    throw new Error("METAL_PRICE_API_KEY not configured")
  }

  const response = await fetch(
    `https://api.metalpriceapi.com/v1/timeframe?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}&base=USD&currencies=XAU,XAG`,
    { next: { revalidate: 0 } }
  )

  if (!response.ok) {
    throw new Error(`metalpriceapi.com timeframe failed: ${response.status}`)
  }

  const data = await response.json()

  if (!data.success || !data.rates) {
    throw new Error("Invalid historical data response")
  }

  // Transform API response to our format
  const historicalData: HistoricalDataPoint[] = Object.entries(data.rates).map(
    ([date, rates]: [string, { XAU: number; XAG: number }]) => ({
      date,
      goldPrice: Number((1 / rates.XAU / TROY_OUNCE_TO_GRAMS).toFixed(4)), // USD per gram
      silverPrice: Number((1 / rates.XAG / TROY_OUNCE_TO_GRAMS).toFixed(4)),
    })
  )

  // Sort by date ascending
  return historicalData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}
