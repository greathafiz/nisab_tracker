import { updateCurrentMetalPrices } from "@/lib/redis/metals-cache";
import { updateExchangeRatesCache } from "@/lib/redis/exchange-rates-cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    metalPrices: null as unknown,
    exchangeRates: null as unknown,
    errors: [] as string[],
  };

  // Update current metal prices
  try {
    results.metalPrices = await updateCurrentMetalPrices();
  } catch (error) {
    console.error("Failed to update metal prices:", error);
  }
  if (!results.metalPrices) results.errors.push("metal prices");

  // Update exchange rates
  try {
    results.exchangeRates = await updateExchangeRatesCache();
  } catch (error) {
    console.error("Failed to update exchange rates:", error);
  }
  if (!results.exchangeRates) results.errors.push("exchange rates");

  const success = results.errors.length === 0;

  // A non-2xx status makes failed runs show up as errors in Vercel's cron logs
  return NextResponse.json(
    {
      success,
      timestamp: new Date().toISOString(),
      results,
      errors: results.errors.length > 0 ? results.errors : undefined,
    },
    { status: success ? 200 : 500 }
  );
}
