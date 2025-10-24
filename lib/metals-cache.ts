interface MetalsPriceCache {
  goldPricePerGram: number
  silverPricePerGram: number
  goldPriceChange: number
  silverPriceChange: number
  lastUpdated: string
  source: "metalpriceapi" | "goldpriceio" | "islamicapi" | "fallback"
}

// In-memory cache for development (use Redis/Vercel KV in production)
let cachedPrices: MetalsPriceCache | null = null
let previousDayPrices: { gold: number; silver: number } | null = null

const TROY_OUNCE_TO_GRAMS = 31.1034768

/**
 * Get cached prices (for API routes to use)
 */
export async function getCachedMetalsPrices(): Promise<MetalsPriceCache> {
  if (!cachedPrices) {
    return await updateMetalsPriceCache()
  }

  const cacheAge = Date.now() - new Date(cachedPrices.lastUpdated).getTime()
  const ONE_DAY = 24 * 60 * 60 * 1000

  if (cacheAge > ONE_DAY) {
    return await updateMetalsPriceCache()
  }

  return cachedPrices
}

/**
 * Fetch and cache metal prices from multiple sources with fallback chain
 */
export async function updateMetalsPriceCache(): Promise<MetalsPriceCache> {
  // Try metalpriceapi.com first
  const metalPriceResult = await fetchFromMetalPriceAPI()
  if (metalPriceResult) {
    cachedPrices = metalPriceResult
    updatePreviousDayPrices(metalPriceResult)
    return metalPriceResult
  }

  // Fallback to goldprice.io
  const goldPriceResult = await fetchFromGoldPriceIO()
  if (goldPriceResult) {
    cachedPrices = goldPriceResult
    updatePreviousDayPrices(goldPriceResult)
    return goldPriceResult
  }

  // Fallback to islamicapi.com
  const islamicAPIResult = await fetchFromIslamicAPI()
  if (islamicAPIResult) {
    cachedPrices = islamicAPIResult
    updatePreviousDayPrices(islamicAPIResult)
    return islamicAPIResult
  }

  // Final fallback: use cached data or static fallback
  if (cachedPrices) {
    console.warn("⚠️ All APIs failed, using cached data")
    return cachedPrices
  }

  console.error("❌ All APIs failed, using static fallback")
  return getStaticFallback()
}

/**
 * Primary: metalpriceapi.com
 */
async function fetchFromMetalPriceAPI(): Promise<MetalsPriceCache | null> {
  const apiKey = process.env.METAL_PRICE_API_KEY

  if (!apiKey) {
    console.warn("⚠️ METAL_PRICE_API_KEY not configured")
    return null
  }

  try {
    const response = await fetch(
      `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU,XAG`,
      { next: { revalidate: 0 } }
    )

    if (!response.ok) {
      throw new Error(`metalpriceapi.com failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !data.rates) {
      throw new Error("Invalid response from metalpriceapi.com")
    }

    // Convert from USD per troy ounce to USD per gram
    const goldPricePerGram = 1 / data.rates.XAU / TROY_OUNCE_TO_GRAMS
    const silverPricePerGram = 1 / data.rates.XAG / TROY_OUNCE_TO_GRAMS

    // Calculate 24h price change
    const goldPriceChange = calculatePriceChange(
      goldPricePerGram,
      previousDayPrices?.gold
    )
    const silverPriceChange = calculatePriceChange(
      silverPricePerGram,
      previousDayPrices?.silver
    )

    console.log("Fetched from metalpriceapi.com")

    return {
      goldPricePerGram: Number(goldPricePerGram.toFixed(4)),
      silverPricePerGram: Number(silverPricePerGram.toFixed(4)),
      goldPriceChange,
      silverPriceChange,
      lastUpdated: new Date().toISOString(),
      source: "metalpriceapi",
    }
  } catch (error) {
    console.error("metalpriceapi.com failed:", error)
    return null
  }
}

/**
 * Fallback 1: goldprice.io
 */
async function fetchFromGoldPriceIO(): Promise<MetalsPriceCache | null> {
  const apiKey = process.env.GOLD_PRICE_IO_API_KEY

  if (!apiKey) {
    console.warn("⚠️ GOLD_PRICE_IO_API_KEY not configured")
    return null
  }

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
    ])

    if (!goldResponse.ok) {
      throw new Error(`goldprice.io gold failed: ${goldResponse.status}`)
    }
    if (!silverResponse.ok) {
      throw new Error(`goldprice.io silver failed: ${silverResponse.status}`)
    }

    const [goldData, silverData] = await Promise.all([
      goldResponse.json(),
      silverResponse.json(),
    ])

    const goldPricePerGram = goldData.price_gram_24k
    const silverPricePerGram = silverData.price_gram_24k

    const goldPriceChange = calculatePriceChange(
      goldPricePerGram,
      previousDayPrices?.gold
    )
    const silverPriceChange = calculatePriceChange(
      silverPricePerGram,
      previousDayPrices?.silver
    )

    console.log("Fetched from goldprice.io")

    return {
      goldPricePerGram: Number(goldPricePerGram.toFixed(4)),
      silverPricePerGram: Number(silverPricePerGram.toFixed(4)),
      goldPriceChange,
      silverPriceChange,
      lastUpdated: new Date().toISOString(),
      source: "goldpriceio",
    }
  } catch (error) {
    console.error("goldprice.io failed:", error)
    return null
  }
}

/**
 * Fallback 2: islamicapi.com (extract unit prices from their response)
 */
async function fetchFromIslamicAPI(): Promise<MetalsPriceCache | null> {
  const apiKey = process.env.ISLAMIC_API_KEY

  try {
    const response = await fetch(
      `https://islamicapi.com/api/v1/zakat-nisab/?standard=classical&currency=usd&unit=g&api_key=${apiKey}`,
      { next: { revalidate: 0 } }
    )

    if (!response.ok) {
      throw new Error(`islamicapi.com failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.code !== 200 || !data.data?.nisab_thresholds) {
      throw new Error("Invalid response from islamicapi.com")
    }

    // Extract unit prices (price per gram in USD)
    const goldPricePerGram = data.data.nisab_thresholds.gold.unit_price
    const silverPricePerGram = data.data.nisab_thresholds.silver.unit_price

    const goldPriceChange = calculatePriceChange(
      goldPricePerGram,
      previousDayPrices?.gold
    )
    const silverPriceChange = calculatePriceChange(
      silverPricePerGram,
      previousDayPrices?.silver
    )

    console.log("Fetched from islamicapi.com")

    return {
      goldPricePerGram: Number(goldPricePerGram.toFixed(4)),
      silverPricePerGram: Number(silverPricePerGram.toFixed(4)),
      goldPriceChange,
      silverPriceChange,
      lastUpdated: data.data.updated_at || new Date().toISOString(),
      source: "islamicapi",
    }
  } catch (error) {
    console.error("islamicapi.com failed:", error)
    return null
  }
}

/**
 * Calculate percentage change from previous day
 */
function calculatePriceChange(
  currentPrice: number,
  previousPrice: number | undefined
): number {
  if (!previousPrice) return 0

  const change = ((currentPrice - previousPrice) / previousPrice) * 100
  return Number(change.toFixed(1))
}

/**
 * Store previous day prices for change calculation
 */
function updatePreviousDayPrices(cache: MetalsPriceCache) {
  previousDayPrices = {
    gold: cache.goldPricePerGram,
    silver: cache.silverPricePerGram,
  }
}

/**
 * Static fallback data (last resort)
 */
function getStaticFallback(): MetalsPriceCache {
  return {
    goldPricePerGram: 85.17, // ~$2,650/oz ÷ 31.1035 g/oz
    silverPricePerGram: 0.98, // ~$30.5/oz ÷ 31.1035 g/oz
    goldPriceChange: 0,
    silverPriceChange: 0,
    lastUpdated: new Date().toISOString(),
    source: "fallback",
  }
}
