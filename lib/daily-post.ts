import { getCurrentMetalPrices } from "@/lib/redis/metals-cache";
import { getCachedExchangeRates } from "@/lib/redis/exchange-rates-cache";
import { redis } from "@/lib/redis/redis-config";
import { COUNTRIES } from "@/lib/countries";
import { formatMoneyRounded, type CurrencyCode } from "@/lib/currencies";
import {
  NISAB_STANDARDS,
  defaultStandardFor,
  nisabAmounts,
} from "@/lib/nisab-standards";
import { SITE_URL } from "@/lib/site";
import { isOlderThan } from "@/lib/utils";
import { postToTelegram } from "@/lib/social/telegram";
import { postToX, isInXPostingWindow } from "@/lib/social/x";

/**
 * The daily "today's Nisab" post to Telegram and X, run by /api/cron/daily-post a few
 * hours after the daily price update.
 */

type Prices = { goldPricePerGram: number; silverPricePerGram: number };
type Rates = Record<string, number>;

export type PostResult =
  | "posted"
  | "dry run"
  | `skipped: ${string}`
  | `failed: ${string}`;

// The price update runs at 02:00 UTC; anything older means today's update failed
const FRESH_FOR_MS = 20 * 60 * 60 * 1000;
// Long enough to cover a rerun later the same day
const POSTED_MARKER_SECONDS = 2 * 24 * 60 * 60;

// Tagged so visits from each channel show up as their own source in Google Analytics
const nisabPage = (source: "telegram" | "x") =>
  `${SITE_URL}/nisab?utm_source=${source}&utm_medium=social&utm_campaign=daily_nisab`;

// Telegram HTML mode rejects or misreads a bare <, > or & outside a tag or entity
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Each country in its own currency and usual weights, so readers can find theirs
export function telegramMessage(
  prices: Prices,
  rates: Rates,
  date: string
): string {
  const { majority, hanafi } = NISAB_STANDARDS;
  const lines = COUNTRIES.flatMap((country) => {
    const rate = country.currency === "USD" ? 1 : rates[country.currency];
    if (!rate) return [];
    const standardId = defaultStandardFor(country.currency);
    const usd = nisabAmounts(prices, standardId);
    const money = (amount: number) =>
      formatMoneyRounded(amount * rate, country.currency as CurrencyCode);
    const marker = standardId === "hanafi" ? "*" : "";
    return [
      `<b>${escapeHtml(country.name)}${marker}</b>: ${money(usd.silver)} · ${money(usd.gold)}`,
    ];
  });

  return [
    `🌙 <b>Today's Nisab, ${date}</b>`,
    "",
    "Silver Nisab · Gold Nisab",
    "",
    ...lines,
    "",
    `Based on ${majority.silverGrams} g of silver and ${majority.goldGrams} g of gold. * Hanafi tola weights: ${hanafi.silverGrams} g and ${hanafi.goldGrams} g.`,
    "",
    `Gold prices by karat and a free Zakat calculator: ${escapeHtml(nisabPage("telegram"))}`,
  ].join("\n");
}

export function xMessage(prices: Prices, date: string): string {
  const usd = nisabAmounts(prices, "majority");
  return [
    `Today's Nisab (${date}):`,
    `🥈 Silver: ${formatMoneyRounded(usd.silver, "USD")}`,
    `🥇 Gold: ${formatMoneyRounded(usd.gold, "USD")}`,
    "",
    `In your currency: ${nisabPage("x")}`,
    "",
    "#Zakat #Nisab",
  ].join("\n");
}

/**
 * Build today's posts and send them. With dryRun, returns the messages without
 * posting or marking anything as posted.
 */
export async function publishDailyPost({ dryRun }: { dryRun: boolean }) {
  const [prices, exchange] = await Promise.all([
    getCurrentMetalPrices(),
    getCachedExchangeRates(),
  ]);
  if (!prices || !exchange) {
    return { skipped: "prices or exchange rates unavailable" };
  }
  // Don't repeat yesterday's figures as today's
  if (isOlderThan(prices.fetchedAt ?? prices.lastUpdated, FRESH_FOR_MS)) {
    return {
      skipped: `prices last updated ${prices.fetchedAt ?? prices.lastUpdated}`,
    };
  }

  const now = new Date();
  // The day the post goes out: prices are checked fresh above, and providers may stamp them a day earlier
  const date = formatDate(now);
  const messages = {
    telegram: telegramMessage(prices, exchange.rates, date),
    x: xMessage(prices, date),
  };

  const results: Record<keyof typeof messages, PostResult> = {
    telegram: await publishOnce("telegram", now, dryRun, () =>
      postToTelegram(messages.telegram)
    ),
    x: isInXPostingWindow(now)
      ? await publishOnce("x", now, dryRun, () => postToX(messages.x))
      : "skipped: outside the Ramadan posting window",
  };

  return { date, results, messages: dryRun ? messages : undefined };
}

// Claims the day in Redis first, so a rerun or overlapping run never posts twice
async function publishOnce(
  channel: string,
  now: Date,
  dryRun: boolean,
  post: () => Promise<void>
): Promise<PostResult> {
  if (dryRun) return "dry run";

  const key = `social:${channel}:${now.toISOString().slice(0, 10)}`;
  const claimed = await redis.setIfAbsent(
    key,
    now.toISOString(),
    POSTED_MARKER_SECONDS
  );
  if (!claimed) return "skipped: already posted today";

  try {
    await post();
    return "posted";
  } catch (error) {
    console.error(`Daily ${channel} post failed:`, error);
    // Release the day so a manual rerun can try again
    await redis.del(key);
    return `failed: ${error instanceof Error ? error.message : String(error)}`;
  }
}
