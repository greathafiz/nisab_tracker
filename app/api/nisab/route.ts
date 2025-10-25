import { NextResponse } from "next/server"
import { getCachedMetalsPrices } from "@/lib/redis/metals-cache"

interface NisabValues {
  nisabGold: number
  nisabSilver: number
  dowry: number
  diyyah: number
  currency: string
  lastUpdated: string
  goldPriceChange: number
  silverPriceChange: number
  goldPricePerGram: number
  silverPricePerGram: number
}

const GOLD_NISAB_GRAMS = 87.48
const SILVER_NISAB_GRAMS = 612.36
const MAHR_AL_FATIMAH_GRAMS = 1487.5 // 500 dirhams × 2.975g
const DIYYAH_GOLD_GRAMS = 4374 // Approximately 1000 dinars

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get("currency") || "USD"
    const exchangeRate = parseFloat(searchParams.get("rate") || "1")

    const nisabData = await getNisabValues(currency, exchangeRate)

    return NextResponse.json(nisabData, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200", // ✅ 1 hour cache, 2 hours stale
      },
    })
  } catch (error) {
    console.error("Error in /api/nisab:", error)

    return NextResponse.json(null, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60",
      },
    })
  }
}

export async function getNisabValues(
  currency = "USD",
  exchangeRate = 1
): Promise<NisabValues | null> {
  try {
    const priceCache = await getCachedMetalsPrices()

    if (!priceCache) {
      console.error("Failed to get cached metals prices")
      return null
    }

    const nisabGoldUSD = priceCache.goldPricePerGram * GOLD_NISAB_GRAMS
    const nisabSilverUSD = priceCache.silverPricePerGram * SILVER_NISAB_GRAMS
    const dowryUSD = priceCache.silverPricePerGram * MAHR_AL_FATIMAH_GRAMS
    const diyyahUSD = priceCache.goldPricePerGram * DIYYAH_GOLD_GRAMS

    const nisabGold =
      currency === "USD" ? nisabGoldUSD : nisabGoldUSD * exchangeRate
    const nisabSilver =
      currency === "USD" ? nisabSilverUSD : nisabSilverUSD * exchangeRate
    const dowry = currency === "USD" ? dowryUSD : dowryUSD * exchangeRate
    const diyyah = currency === "USD" ? diyyahUSD : diyyahUSD * exchangeRate

    return {
      nisabGold: Number(nisabGold.toFixed(2)),
      nisabSilver: Number(nisabSilver.toFixed(2)),
      dowry: Number(dowry.toFixed(2)),
      diyyah: Number(diyyah.toFixed(2)),
      currency,
      lastUpdated: priceCache.lastUpdated,
      goldPriceChange: priceCache.goldPriceChange,
      silverPriceChange: priceCache.silverPriceChange,
      goldPricePerGram:
        currency === "USD"
          ? priceCache.goldPricePerGram
          : Number((priceCache.goldPricePerGram * exchangeRate).toFixed(2)),
      silverPricePerGram:
        currency === "USD"
          ? priceCache.silverPricePerGram
          : Number((priceCache.silverPricePerGram * exchangeRate).toFixed(2)),
    }
  } catch (error) {
    console.error("Error calculating Nisab values:", error)
    return null
  }
}
