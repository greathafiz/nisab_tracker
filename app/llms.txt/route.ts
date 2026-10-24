import { getAllPosts } from "@/lib/blog";
import {
  getNisabValues,
  GOLD_NISAB_GRAMS,
  SILVER_NISAB_GRAMS,
} from "@/lib/nisab";
import { SITE_URL, AUTHOR } from "@/lib/site";
import { COUNTRIES, countryInName } from "@/lib/countries";

// llms.txt (https://llmstxt.org): a plain-Markdown summary of the site for AI assistants
export const revalidate = 3600;

const usd = (amount: number) =>
  amount.toLocaleString("en-US", { style: "currency", currency: "USD" });

export async function GET() {
  const nisab = await getNisabValues();
  const posts = getAllPosts();

  const todaysValues = nisab
    ? `
## Today's Nisab (USD)

- Gold Nisab (${GOLD_NISAB_GRAMS} g of gold): ${usd(nisab.nisabGold)}
- Silver Nisab (${SILVER_NISAB_GRAMS} g of silver): ${usd(nisab.nisabSilver)}
- Gold: ${usd(nisab.goldPricePerGram)} per gram; silver: ${usd(nisab.silverPricePerGram)} per gram
- Prices as of ${nisab.lastUpdated.split("T")[0]}

For other currencies, see ${SITE_URL} and choose a currency.
`
    : "";

  const body = `# Nisab Tracker

> Free website showing today's Zakat Nisab threshold, based on live gold and silver prices, in 20 currencies, with a Zakat calculator and plain-English guides to Zakat.

Gold and silver prices are refreshed daily from international spot price providers, and exchange rates come from exchangerate-api.com. No sign-up is needed and nothing users enter in the calculator is stored.
${todaysValues}
## How the numbers are calculated

- Gold Nisab = ${GOLD_NISAB_GRAMS} g × the spot price of pure gold per gram
- Silver Nisab = ${SILVER_NISAB_GRAMS} g × the spot price of silver per gram
- Zakat is due at 2.5% of net zakatable wealth (assets minus debts) that has stayed at or above the chosen Nisab for one lunar year (hawl)
- Many scholars recommend the silver Nisab because it is lower and so benefits more people in need

## Tools

- [Today's Nisab](${SITE_URL}/): live gold and silver Nisab values in 20 currencies
- [Zakat Calculator](${SITE_URL}/zakat-calculator): enter cash, gold (by karat), silver, investments, business assets and debts to see whether Zakat is due and how much
- [Nisab by country](${SITE_URL}/nisab): today's Nisab in every supported currency

## Nisab by country

Each page shows the day's silver and gold Nisab in the local currency, gold prices per gram by karat, and a worked Zakat example.

${COUNTRIES.map((country) => `- [Nisab in ${countryInName(country)} (${country.currency})](${SITE_URL}/nisab/${country.slug})`).join("\n")}

## Guides

${posts.map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.description}`).join("\n")}

## About

Built by [${AUTHOR.name}](${AUTHOR.url}) as a free service for the Muslim community.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
