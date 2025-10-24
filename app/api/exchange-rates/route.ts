import { NextResponse } from "next/server"
import { getCachedExchangeRates } from "@/lib/redis/exchange-rates-cache"

export async function GET() {
  try {
    const ratesCache = await getCachedExchangeRates()

    if (!ratesCache) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch exchange rates" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        rates: ratesCache.rates,
        lastUpdated: ratesCache.lastUpdated,
        source: ratesCache.source,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    )
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error)

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
