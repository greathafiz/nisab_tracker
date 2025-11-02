import { updateCurrentMetalPrices } from "@/lib/redis/metals-cache";
// import { updateHistoricalPricesCache } from "@/lib/redis/historical-cache"
import { updateExchangeRatesCache } from "@/lib/redis/exchange-rates-cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    metalPrices: null as unknown,
    historicalData: null as unknown,
    exchangeRates: null as unknown,
    errors: [] as string[],
  };

  // Update current metal prices
  try {
    results.metalPrices = await updateCurrentMetalPrices();
  } catch (error) {
    console.error("Failed to update metal prices:", error);
    results.errors.push("metal prices");
  }

  // Update historical data (7-day + 30-day)
  // try {
  //   results.historicalData = await updateHistoricalPricesCache()
  // } catch (error) {
  //   console.error("Failed to update historical data:", error)
  //   results.errors.push("historical data")
  // }

  // Update exchange rates
  try {
    results.exchangeRates = await updateExchangeRatesCache();
  } catch (error) {
    console.error("Failed to update exchange rates:", error);
    results.errors.push("exchange rates");
  }

  const success = results.errors.length === 0;

  return NextResponse.json({
    success,
    timestamp: new Date().toISOString(),
    results,
    errors: results.errors.length > 0 ? results.errors : undefined,
  });
}
