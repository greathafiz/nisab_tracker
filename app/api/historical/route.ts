import { NextResponse } from "next/server"
import { getCachedHistoricalData } from "@/lib/redis/historical-cache"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "7d" // "7d" or "30d"
    const currency = searchParams.get("currency") || "USD"
    const exchangeRate = parseFloat(searchParams.get("rate") || "1")

    const historicalData = await getCachedHistoricalData()

    if (!historicalData) {
      return NextResponse.json(
        { error: "Failed to fetch historical data" },
        { status: 500 }
      )
    }

    // Select appropriate dataset based on timeframe
    const rawData =
      timeframe === "30d" ? historicalData.thirtyDay : historicalData.sevenDay

    // Transform data: calculate Nisab values in the requested currency
    const GOLD_NISAB_GRAMS = 87.48
    const SILVER_NISAB_GRAMS = 612.36

    const transformedData = rawData.map((point) => {
      const goldNisabUSD = point.goldPrice * GOLD_NISAB_GRAMS
      const silverNisabUSD = point.silverPrice * SILVER_NISAB_GRAMS

      return {
        date: new Date(point.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        goldNisab:
          currency === "USD"
            ? Number(goldNisabUSD.toFixed(2))
            : Number((goldNisabUSD * exchangeRate).toFixed(2)),
        silverNisab:
          currency === "USD"
            ? Number(silverNisabUSD.toFixed(2))
            : Number((silverNisabUSD * exchangeRate).toFixed(2)),
      }
    })

    return NextResponse.json(
      {
        data: transformedData,
        currency,
        lastUpdated: historicalData.lastUpdated,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    )
  } catch (error) {
    console.error("Error in /api/historical:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
