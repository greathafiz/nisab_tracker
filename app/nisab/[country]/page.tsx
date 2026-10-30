import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNisabValuesForPage, getExchangeRatesForPage } from "@/lib/nisab";
import {
  NISAB_STANDARDS,
  defaultStandardFor,
  nisabAmounts,
} from "@/lib/nisab-standards";
import {
  COUNTRIES,
  TOLA_GRAMS,
  getCountry,
  countryInName,
} from "@/lib/countries";
import { currencies, formatMoney, formatAmount } from "@/lib/currencies";
import { generateBreadcrumbSchema, generateFAQSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/site";
import { nisabShareText } from "@/lib/share";
import { JsonLd } from "@/components/seo/JsonLd";
import { NisabCard } from "@/components/homepage/NisabCard";
import { PricesNotice } from "@/components/ui/PricesNotice";
import { PricesUnavailable } from "@/components/ui/PricesUnavailable";
import { SyncCurrency } from "@/components/nisab/SyncCurrency";
import { CountryLinks } from "@/components/nisab/CountryLinks";
import { ShareButtons } from "@/components/share/ShareButtons";
import { Button } from "@/components/ui/shadcn/button";

export const revalidate = 3600;
export const dynamicParams = false;

interface CountryPageProps {
  params: Promise<{ country: string }>;
}

export function generateStaticParams() {
  return COUNTRIES.map((country) => ({ country: country.slug }));
}

export async function generateMetadata({
  params,
}: CountryPageProps): Promise<Metadata> {
  const country = getCountry((await params).country);
  if (!country) return {};

  const inName = countryInName(country);
  const currencyName = currencies[country.currency].name;
  const title = `Nisab in ${inName} Today (${country.currency})`;
  const description = `Today's Zakat Nisab in ${inName}: the silver and gold Nisab in ${currencyName}, gold prices per gram by karat, and how much Zakat you owe. Updated daily.`;
  const path = `/nisab/${country.slug}`;

  // The preview image comes from opengraph-image.tsx, showing today's figures
  return {
    title: `${title} | Nisab Tracker`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Nisab Tracker",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: "@hafizaderemi",
      title,
      description,
    },
  };
}

const GOLD_KARATS = [24, 22, 21, 18];

// A round amount comfortably above the silver Nisab, for the worked example
function exampleAmount(silverNisab: number): number {
  const target = silverNisab * 3;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  return Math.ceil(target / magnitude) * magnitude;
}

function formatChange(change: number): string {
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
}

export default async function CountryNisabPage({ params }: CountryPageProps) {
  const country = getCountry((await params).country);
  if (!country) notFound();

  const [nisab, rates] = await Promise.all([
    getNisabValuesForPage(),
    getExchangeRatesForPage(),
  ]);
  const rate = rates?.[country.currency];
  if (!nisab || !rate) return <PricesUnavailable />;

  const code = country.currency;
  const currency = currencies[code];
  const inName = countryInName(country);
  const money = (usd: number) => formatMoney(usd * rate, code);

  const standardId = defaultStandardFor(code);
  const standard = NISAB_STANDARDS[standardId];
  const nisabUSD = nisabAmounts(nisab, standardId);
  const otherStandard =
    NISAB_STANDARDS[standardId === "majority" ? "hanafi" : "majority"];
  const otherNisabUSD = nisabAmounts(
    nisab,
    standardId === "majority" ? "hanafi" : "majority"
  );

  const silverNisab = money(nisabUSD.silver);
  const goldNisab = money(nisabUSD.gold);
  const updatedOn = new Date(nisab.lastUpdated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const example = exampleAmount(nisabUSD.silver * rate);

  const faqs = [
    {
      question: `What is the Nisab in ${inName} today?`,
      answer: `As of ${updatedOn}, the silver Nisab is ${silverNisab} and the gold Nisab is ${goldNisab}. These are the values of ${standard.silverGrams} g of silver and ${standard.goldGrams} g of gold at today's prices.`,
    },
    {
      question: `How much Zakat do I pay in ${inName}?`,
      answer: `Zakat is 2.5% of your zakatable wealth (cash, gold, silver, investments and business stock, minus debts due now), once it has stayed above the Nisab for a full lunar year. For example, on ${formatMoney(example, code)} the Zakat due is ${formatMoney(example * 0.025, code)}.`,
    },
    {
      question: "Should I use the gold or silver Nisab?",
      answer:
        "Scholars differ. Many recommend the silver Nisab because it is lower, so more people pay Zakat and more of the poor benefit. Others use the gold Nisab, especially when most of your wealth is held in gold. If you're unsure, follow a scholar you trust.",
    },
    {
      question: `Why do some sites show a different Nisab?`,
      answer: `Scholars convert the 20 dinars of gold and 200 dirhams of silver to grams using slightly different coin weights. This page uses ${standard.goldGrams} g of gold and ${standard.silverGrams} g of silver (${standard.description}). Using ${otherStandard.goldGrams} g / ${otherStandard.silverGrams} g (${otherStandard.description}) instead, the silver Nisab is ${money(otherNisabUSD.silver)} and the gold Nisab is ${money(otherNisabUSD.gold)}. Both are valid, so follow the one your scholar uses. You can switch between them in the Zakat calculator.`,
    },
    ...(country.usesTola
      ? [
          {
            question: "What is the Nisab in tola?",
            answer: `The gold Nisab is 7.5 tola (${standard.goldGrams} g), worth ${goldNisab} today, and the silver Nisab is 52.5 tola (${standard.silverGrams} g), worth ${silverNisab}.`,
          },
        ]
      : []),
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SyncCurrency code={code} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: "Nisab by country", url: `${SITE_URL}/nisab` },
          { name: country.name, url: `${SITE_URL}/nisab/${country.slug}` },
        ])}
      />
      <JsonLd data={generateFAQSchema(faqs)} />

      <PricesNotice
        isStale={nisab.isStale}
        lastUpdated={updatedOn}
        checkRates={false}
      />

      <nav className="text-sm text-stone-500 mb-6">
        <Link href="/nisab" className="hover:text-emerald-700">
          ← Nisab in other countries
        </Link>
      </nav>

      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
          Nisab in {inName} Today
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Live gold and silver Nisab in {currency.name} ({currency.symbol}),
          based on today&apos;s international gold and silver prices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <NisabCard
          title="Silver Nisab"
          value={formatAmount(nisabUSD.silver * rate)}
          currency={code}
          description={`${standard.silverGrams} grams of silver`}
          lastUpdated={updatedOn}
          featured={true}
          change={formatChange(nisab.silverPriceChange)}
          icon="🥈"
        />
        <NisabCard
          title="Gold Nisab"
          value={formatAmount(nisabUSD.gold * rate)}
          currency={code}
          description={`${standard.goldGrams} grams of gold`}
          lastUpdated={updatedOn}
          featured={true}
          change={formatChange(nisab.goldPriceChange)}
          icon="🥇"
        />
      </div>

      <ShareButtons
        text={nisabShareText({
          place: inName,
          silver: nisabUSD.silver * rate,
          gold: nisabUSD.gold * rate,
          currency: code,
          date: updatedOn,
        })}
        url={`${SITE_URL}/nisab/${country.slug}`}
        className="justify-center mb-10"
      />

      <div className="text-center mb-16">
        <Link href="/zakat-calculator">
          <Button size="lg" className="px-8 cursor-pointer">
            🧮 Calculate your Zakat in {currency.name}
          </Button>
        </Link>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">
          Gold and silver prices today in {inName}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="text-left font-medium px-4 py-3">Metal</th>
                <th className="text-right font-medium px-4 py-3">Per gram</th>
                {country.usesTola && (
                  <th className="text-right font-medium px-4 py-3">Per tola</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {GOLD_KARATS.map((karat) => {
                const perGram = nisab.goldPricePerGram * (karat / 24);
                return (
                  <tr key={karat}>
                    <td className="px-4 py-3 text-stone-800">Gold {karat}k</td>
                    <td className="px-4 py-3 text-right font-medium text-stone-900">
                      {money(perGram)}
                    </td>
                    {country.usesTola && (
                      <td className="px-4 py-3 text-right font-medium text-stone-900">
                        {money(perGram * TOLA_GRAMS)}
                      </td>
                    )}
                  </tr>
                );
              })}
              <tr>
                <td className="px-4 py-3 text-stone-800">Silver</td>
                <td className="px-4 py-3 text-right font-medium text-stone-900">
                  {money(nisab.silverPricePerGram)}
                </td>
                {country.usesTola && (
                  <td className="px-4 py-3 text-right font-medium text-stone-900">
                    {money(nisab.silverPricePerGram * TOLA_GRAMS)}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-stone-500 mt-2">
          International spot prices as of {updatedOn}, converted at 1 USD ={" "}
          {rate.toLocaleString("en-US", { maximumFractionDigits: 4 })} {code}.
          Local shop prices include making charges and may be higher.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">
          How the Nisab is calculated
        </h2>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-2 text-stone-700">
          <p>
            <span className="font-semibold">Silver Nisab</span> ={" "}
            {standard.silverGrams} g × {money(nisab.silverPricePerGram)} ={" "}
            <span className="font-semibold">{silverNisab}</span>
          </p>
          <p>
            <span className="font-semibold">Gold Nisab</span> ={" "}
            {standard.goldGrams} g × {money(nisab.goldPricePerGram)} ={" "}
            <span className="font-semibold">{goldNisab}</span>
          </p>
          <p className="text-sm text-stone-600 pt-2">
            If your zakatable wealth has stayed at or above the Nisab for a full
            lunar year, Zakat of 2.5% is due. Learn more in{" "}
            <Link
              href="/blog/what-is-nisab-in-islam"
              className="text-emerald-700 underline underline-offset-2"
            >
              What is Nisab in Islam?
            </Link>
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-semibold text-stone-900 mb-1">
                {faq.question}
              </h3>
              <p className="text-stone-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-3">
          Nisab in other countries
        </h2>
        <CountryLinks exclude={country.slug} />
      </section>
    </main>
  );
}
