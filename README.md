# Nisab Tracker

Live gold and silver Nisab values in 20 currencies, plus a free Zakat calculator and a small blog. Live at [nisabtracker.com](https://www.nisabtracker.com).

Next.js (App Router) on Vercel, with Redis as a cache for prices and exchange rates.

## How the data flows

1. **Daily cron** (`vercel.json`, 02:00 UTC) calls `/api/cron/daily-update`, which fetches:
   - metal prices: metalpriceapi.com, falling back to goldapi.io, then islamicapi.com
   - USD exchange rates: exchangerate-api.com
2. Both are stored in Redis. A failed fetch never overwrites the last good data.
3. Pages read from Redis. If an entry is more than a day old (the cron failed), a page request retries the fetch, **at most once an hour**, so free-tier API quotas aren't burned. Otherwise the stale data is served, and the UI shows a warning once prices are over 48h old.
4. Everything is stored in USD. The browser converts to the visitor's currency using `/api/exchange-rates`; if rates are unavailable, values are shown in USD with a notice.

The homepage and calculator use ISR (`revalidate = 3600`). If data is unavailable during a revalidation, the page throws so Vercel keeps serving the last good version.

## Environment variables

Set these in Vercel (and in `.env` or `.env.local` in the project root to run locally):

| Variable                                  | Used for                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| `STORAGE_REDIS_URL`                       | Redis connection string                                                        |
| `METALPRICEAPI_API_KEY`                   | Primary metal price source (free tier: 100 req/month)                          |
| `GOLDAPI_IO_API_KEY`                      | Fallback metal price source                                                    |
| `ISLAMICAPI_API_KEY`                      | Second fallback metal price source                                             |
| `EXCHANGERATEAPI_API_KEY`                 | Exchange rates                                                                 |
| `CRON_SECRET`                             | Vercel sends it as a Bearer token to authorize the cron route                  |
| `GOOGLE_SHEETS_WEB_APP_URL`               | Apps Script endpoint that stores Zakat reminder waitlist emails                |
| `TELEGRAM_BOT_TOKEN`                      | Bot that posts the daily Nisab to the @nisabtracker channel (must be an admin) |
| `X_API_KEY`, `X_API_SECRET`               | X app's Consumer Key and Secret, for the daily post to @nisabtracker           |
| `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` | @nisabtracker's OAuth 1.0a access token (Read and write)                       |
| `NEXT_PUBLIC_APP_URL`                     | Optional; base URL for client-side API calls (defaults to the current origin)  |

With the Vercel CLI linked to the project, `vercel env pull .env.local` fetches them.

## Development

```bash
npm install
npm run dev     # needs STORAGE_REDIS_URL for real data
npm run lint
npm run build
```

Without `STORAGE_REDIS_URL`, the build still succeeds but prerenders the "failed to load" state; that's expected locally, since Vercel builds with the real variables.

The pre-commit hook (Husky + lint-staged) runs ESLint and Prettier on staged files, then a full build.

## Country pages

`/nisab` and `/nisab/[country]` show the Nisab in each local currency, rendered on the server so search engines see local values. Countries are listed in `lib/countries.ts`; to add one, add an entry there (its currency must be in `lib/currencies.ts`). The sitemap, llms.txt and the country links pick it up automatically.

## Daily social posts

A second cron (05:00 UTC) calls `/api/cron/daily-post`, which posts today's Nisab to the [@nisabtracker](https://t.me/nisabtracker) Telegram channel, and to [@nisabtracker](https://x.com/nisabtracker) on X. The code is in `lib/daily-post.ts` and `lib/social/`.

- It skips the day if the 02:00 price update failed, rather than repeating old figures.
- Each post is marked in Redis, so rerunning the cron never posts twice.
- X charges per post (about $0.15), so it only posts inside `X_POSTING_WINDOW` in `lib/social/x.ts` (Ramadan). Before each Ramadan, move the window and top up X API credits.
- To see the messages without posting: `curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/daily-post?dryRun=1"`

## Blog

Posts are Markdown files in `app/blog/_content/` with frontmatter (title, description, dates, keywords, FAQs). New posts appear on `/blog` and in the sitemap automatically.

## Monitoring

- Failed cron runs return HTTP 500 and show up as errors under the project's **Cron Jobs** tab in Vercel.
- Google Analytics: `G-S08RYTFS3W`. Vercel Speed Insights is enabled.
