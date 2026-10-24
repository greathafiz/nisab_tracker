import type { Metadata } from "next";
import Link from "next/link";
import { getNisabValuesForPage, getExchangeRatesForPage } from "@/lib/nisab";
import {
  NISAB_STANDARDS,
  defaultStandardFor,
  nisabAmounts,
} from "@/lib/nisab-standards";
import { COUNTRIES } from "@/lib/countries";
import { formatMoney } from "@/lib/currencies";
import { OG_IMAGE } from "@/lib/site";
import { PricesNotice } from "@/components/ui/PricesNotice";
import { PricesUnavailable } from "@/components/ui/PricesUnavailable";

export const revalidate = 3600;

const title = "Nisab Today in Every Currency";
const description = `Today's Zakat Nisab in ${COUNTRIES.length} countries and currencies: the silver and gold Nisab at live prices, updated daily.`;

export const metadata: Metadata = {
  title: `${title} | Nisab Tracker`,
  description,
  alternates: { canonical: "/nisab" },
  openGraph: {
    title,
    description,
    url: "/nisab",
    siteName: "Nisab Tracker",
    images: [OG_IMAGE],
    locale: "en_US",
    type: "website",
  },
};

export default async function NisabByCountryPage() {
  const [nisab, rates] = await Promise.all([
    getNisabValuesForPage(),
    getExchangeRatesForPage(),
  ]);
  if (!nisab || !rates) return <PricesUnavailable />;

  const updatedOn = new Date(nisab.lastUpdated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <PricesNotice
        isStale={nisab.isStale}
        lastUpdated={updatedOn}
        checkRates={false}
      />

      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          The silver and gold Nisab for Zakat in {COUNTRIES.length} countries,
          at international prices as of {updatedOn}. Choose your country for
          local gold prices and more detail.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="text-left font-medium px-4 py-3">Country</th>
              <th className="text-right font-medium px-4 py-3">Silver Nisab</th>
              <th className="text-right font-medium px-4 py-3">Gold Nisab</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {COUNTRIES.map((country) => {
              const rate = rates[country.currency];
              const standardId = defaultStandardFor(country.currency);
              const nisabUSD = nisabAmounts(nisab, standardId);
              return (
                <tr key={country.slug} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/nisab/${country.slug}`}
                      className="font-medium text-emerald-700 hover:underline underline-offset-2"
                    >
                      {country.name}
                    </Link>
                    {standardId === "hanafi" && (
                      <span
                        className="text-stone-400"
                        title="Hanafi / tola weights"
                      >
                        {" "}
                        *
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-900 whitespace-nowrap">
                    {rate
                      ? formatMoney(nisabUSD.silver * rate, country.currency)
                      : "–"}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-900 whitespace-nowrap">
                    {rate
                      ? formatMoney(nisabUSD.gold * rate, country.currency)
                      : "–"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone-500 mt-2">
        Based on {NISAB_STANDARDS.majority.silverGrams} g of silver and{" "}
        {NISAB_STANDARDS.majority.goldGrams} g of gold (AAOIFI and most
        scholars). * Uses the Hanafi tola weights common in South Asia:{" "}
        {NISAB_STANDARDS.hanafi.silverGrams} g of silver and{" "}
        {NISAB_STANDARDS.hanafi.goldGrams} g of gold. Converted from USD spot
        prices at today&apos;s exchange rates.
      </p>
    </main>
  );
}
