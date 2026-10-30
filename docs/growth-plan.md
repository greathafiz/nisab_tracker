# Nisab Tracker: Growth Plan

Written 24 October 2026. A reference for growing nisabtracker.com, in priority order.

## Where things stand

- **Traffic:** 64 active users in the last 28 days (+42%), 166 in the last 90 days (+19%). About 1.2 page views per user, so most visitors see one page and leave.
- **Waitlist:** 2 signups for Zakat reminders (one in June, one on 19 October 2026).
- **Done in October 2026:**
  - Reliability fixes: no wrong-currency numbers, no outage when a price API fails.
  - SEO cleanup: canonical URLs, full sitemap, www everywhere.
  - Analytics events: `calculator_start`, `zakat_due_shown`, `reminder_signup`, `currency_change`.
  - Gold karat selector and `/llms.txt`.
  - Nisab pages for 20 countries.
  - Share buttons, per-country link preview images, and a daily post to the @nisabtracker Telegram channel.
  - An embeddable Nisab widget for other sites, at `/embed`.

## The date everything works towards: Ramadan 2027

**Ramadan 1448 starts around 8 February 2027** (Umm al-Qura; local sighting may shift it a day), and Eid al-Fitr falls around 9 March. Most Muslims calculate and pay Zakat in Ramadan, so that's when people search most.

New pages take weeks to months to rank, so **aim to have everything below live by mid-January 2027.**

To size the opportunity, look at February–March 2026 in Google Analytics and see how big last Ramadan's spike was.

---

## 1. Nisab page per country (done)

**Status:** built in October 2026: `/nisab` plus 20 country pages.

**Why:** people search with their country or currency ("nisab today in naira", "nisab UK 2026", "nisab in Pakistan in tola"). The homepage converts currency in the browser, so Google only ever saw USD.

**Next:**

- Watch Google Search Console → Performance, filtered by page `/nisab/`, to see which countries get impressions.
- Add countries where you see demand. Candidates: Germany, France, Netherlands, Singapore, Sri Lanka, Kenya, Ghana, Sudan, Tanzania. A new country is one line in `lib/countries.ts`, plus its currency in `lib/currencies.ts` if it's new.
- Enrich the best performers with local detail, such as national Zakat bodies or common local karats (21k in the Gulf, 22k in South Asia).

## 2. Make the daily figure shareable (done)

**Status:** built in October 2026: share buttons, per-country preview images, and a daily post to the [@nisabtracker](https://t.me/nisabtracker) Telegram channel. X posting costs about $0.15 a post, so it only runs in Ramadan (1 Feb – 12 Mar 2027); top up X API credits in late January. No WhatsApp channel: it can't be posted to automatically. Track shares in GA → Events → `share`, by `method` and `item_id` (the shared page).

**Why:** your audience shares on WhatsApp. During Ramadan, mosque and family groups forward "today's nisab" messages, and each forward is a free visit.

**How:**

- **Share button** on the homepage and country pages: WhatsApp, X, and copy-link, with prefilled text like _"Today's silver nisab in Nigeria: ₦1,425,625 (nisabtracker.com/nisab/nigeria)"_.
- **Dynamic preview image** (`opengraph-image.tsx` in Next.js) showing today's figure for each country, so the link preview itself carries the number.
- **Daily or weekly post** of the nisab figure. WhatsApp Channels can't be posted to automatically (no public API), so either post by hand (about 30 seconds a day) or start with a Telegram channel, whose bot API can post for free from the existing daily cron.

**Effort:** share button and preview images about half a day; automated Telegram posting about a day.

## 3. Embeddable "Today's Nisab" widget (built; outreach next)

**Status:** built in October 2026. `/embed` lets a site pick its country, preview the widget and copy the code; the widget itself is `/embed/[country]`. The code is an iframe plus a plain "Nisab figures from Nisab Tracker" link under it: links inside an iframe don't count as backlinks, the plain link does. Widget pages are `noindex` and skip GA, so embeds don't inflate visitor numbers. Track it in GA with `embed_code_copy` (copies, by country), sessions with source `widget` (clicks from widgets), and Search Console → Links (sites linking to you).

**Why:** a new domain competes with Islamic Relief, National Zakat Foundation and similar sites, which have years of backlinks. A widget that mosques and Islamic societies put on their websites gives you backlinks and steady referral traffic.

**How:**

- A small page at `/embed/[country]` that sites include with an `<iframe>`. It shows today's silver and gold nisab and a "Powered by Nisab Tracker" link.
- Outreach before Ramadan to 20–50 masjids, university Islamic societies (MSAs, ISOCs), halal finance bloggers and Islamic schools. Lead with the free, always-current Nisab for their community.

**Effort:** about a day to build, then outreach.

## 4. Write about Zakat questions people actually search

**Why:** yes to writing about Islamic finance, but stick to Zakat. General Islamic finance topics (mortgages, riba, investing) are crowded and don't lead people to your tool. Specific Zakat questions have real search demand and each one can point to the calculator.

**Topics to write, roughly by demand:**

- Zakat on gold jewellery: worn vs stored, and the scholarly views
- Zakat on savings and salary
- Zakat on shares, stocks and ETFs
- Zakat on cryptocurrency
- Zakat on pensions
- Zakat on rental property and real estate
- Zakat on business stock
- Zakat on money owed to you, and on your own debts
- Who can receive Zakat (the eight categories)
- When Zakat is due: working out your hawl date

**How:**

- **Get each article reviewed by an imam or scholar and name them on the page.** Google and readers both weight trust heavily for religious money questions.
- About 2 articles a month until Ramadan, which gives 6–8 more.
- Post a short version of each on X, LinkedIn and WhatsApp, linking back.

## 5. Calendar reminder: the cheap version of the Zakat tracker

**Why:** two signups is a real signal, but a small one, and the signup box only appears after someone runs a calculation, so few visitors see it. A full account system needs login, stored data, Hijri scheduling, emails, and the responsibility of holding data about people's wealth. Validate demand first.

**How:**

- An **"Add my Zakat date to my calendar"** button. The visitor picks their hawl date and gets an `.ics` file with the next 5 years of reminders on the correct Hijri dates.
  - The Hijri year is about 11 days shorter than the Gregorian one, so a normal yearly repeat would drift. Each year's date has to be calculated separately.
- No backend and no stored data, which keeps the privacy promise.
- Track it with a `calendar_reminder` analytics event.
- Show the reminder option more prominently, not only after a calculation.

**Decision rule:** if people use the calendar reminder regularly (say 20+ a month in Ramadan), build accounts.

## 6. Zakat tracker accounts (after validating 5)

Following the plan in `.github/instructions/FEATURES.md`:

- Sign in with Google or email.
- Store the Zakat due date, not wealth amounts.
- Email reminders 30, 7, 3 and 1 days before, and on the day.
- Track yearly payment confirmations.

**Needs:** an auth provider, a small database, a scheduled job, and an email service (e.g. Resend). Email the waitlist first when it launches.

## 7. Agricultural produce and livestock

**Why:** demand is regional (northern Nigeria, Pakistan, Sudan, rural Indonesia), but there's very little competition for searches like "zakat on crops calculator".

**What it involves:**

- **Crops:** 10% for rain-fed, 5% for irrigated, above a nisab of 5 wasq (scholars give slightly different weights).
- **Livestock:** fixed tables for camels, cattle, and sheep/goats.
- Each needs its own explainer page and scholarly review.

**When:** after 2–5, since they matter more before Ramadan.

## 8. Other languages

**First**, check GA → Reports → User attributes → Demographic details, grouped by country.

**Candidates:** Urdu (Pakistan, India), Arabic (Gulf, Egypt, Jordan, Morocco), Indonesian, Turkish, Hausa (northern Nigeria).

**Start small:** translate the country pages for your biggest non-English market. These pages are mostly numbers and short text, so they're cheap to translate.

---

## What to measure

| Where                        | What                                                                    | Why                                                |
| ---------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| Search Console → Performance | Impressions and clicks for "nisab"/"zakat" queries, by page and country | Shows which pages and countries are gaining ground |
| Search Console → Links       | Sites linking to you                                                    | Tracks whether the widget and outreach are working |
| GA → Events                  | `calculator_start` ÷ active users                                       | Share of visitors who actually use the tool        |
| GA → Events                  | `zakat_due_shown`, `reminder_signup` (key event)                        | Engagement and demand for reminders                |
| GA → Events                  | `share` by `method`                                                     | Whether visitors share the figure, and where       |
| GA → Events                  | `currency_change` by `selected_currency`                                | Which currencies and countries to add next         |
| Google Sheet                 | Waitlist signups                                                        | Demand for the tracker                             |

## Timeline to Ramadan 2027

| When                         | Do                                                                                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Late Oct – Nov 2026          | Resubmit the sitemap in Search Console. Build the widget. Publish 2–3 articles.                                                                                                  |
| Dec 2026                     | Build the calendar reminder. Contact mosques and Islamic societies about the widget. Publish 2–3 articles.                                                                       |
| Early – mid Jan 2027         | Publish a "Zakat in Ramadan 2027" page (dates, today's nisab, checklist). Check everything is indexed in Search Console. Top up X API credits so X posting starts on 1 February. |
| Ramadan (8 Feb – 9 Mar 2027) | Post the nisab daily. Watch analytics. Collect feedback. Email the waitlist if reminders are ready.                                                                              |
| After Eid                    | Review the numbers. Decide on accounts, languages, and crop/livestock calculators.                                                                                               |

## Realistic expectations

- **Thousands of users a month in Ramadan** is achievable with the country pages, shareable figures and a handful of backlinks.
- **Millions** means becoming the default reference that gets shared everywhere. The widget, WhatsApp shares and other languages build towards that over time.
- **The best things to keep doing:** stay accurate and fast, stay free, and keep the daily figure easy to share.
