import { NextResponse } from "next/server";
import { publishDailyPost } from "@/lib/daily-post";

/**
 * Posts today's Nisab to Telegram (and to X around Ramadan). Scheduled in vercel.json
 * after the daily price update. Add ?dryRun=1 to see the messages without posting.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
  const outcome = await publishDailyPost({ dryRun });

  // A failed post returns 500 so it shows up as an error in Vercel's cron logs
  const failed = Object.values(outcome.results ?? {}).some((result) =>
    result.startsWith("failed")
  );

  return NextResponse.json(
    { timestamp: new Date().toISOString(), ...outcome },
    { status: failed ? 500 : 200 }
  );
}
