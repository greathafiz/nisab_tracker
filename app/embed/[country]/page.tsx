import type { Metadata } from "next";
import { getNisabValuesForPage, getExchangeRatesForPage } from "@/lib/nisab";
import {
  NISAB_STANDARDS,
  defaultStandardFor,
  nisabAmounts,
} from "@/lib/nisab-standards";
import { COUNTRIES, getCountry, countryInName } from "@/lib/countries";
import { formatMoneyRounded } from "@/lib/currencies";
import { SITE_URL } from "@/lib/site";

// The widget other sites put in an iframe; /embed has the code to copy
export const revalidate = 3600;
export const dynamicParams = false;

interface EmbedPageProps {
  params: Promise<{ country: string }>;
}

export function generateStaticParams() {
  return COUNTRIES.map((country) => ({ country: country.slug }));
}

export async function generateMetadata({
  params,
}: EmbedPageProps): Promise<Metadata> {
  const country = getCountry((await params).country);
  if (!country) return {};

  return {
    title: `Today's Nisab in ${countryInName(country)} | Nisab Tracker`,
    // The country page has the same figures; this one only exists to be framed
    robots: { index: false, follow: true },
    alternates: { canonical: `/nisab/${country.slug}` },
  };
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const country = getCountry((await params).country)!;
  const [nisab, rates] = await Promise.all([
    getNisabValuesForPage(),
    getExchangeRatesForPage(),
  ]);
  const rate = rates?.[country.currency];

  const standardId = defaultStandardFor(country.currency);
  const standard = NISAB_STANDARDS[standardId];
  const amounts = nisab && rate ? nisabAmounts(nisab, standardId) : null;
  const updatedOn =
    nisab &&
    new Date(nisab.lastUpdated).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  // Tagged so GA shows visits from widgets separately from other referrals
  const countryUrl = `${SITE_URL}/nisab/${country.slug}?utm_source=widget&utm_medium=embed`;

  const row = (icon: string, label: string, detail: string, usd: number) => (
    // One line at any width, so the embed code can give the iframe a fixed height
    <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50/60 px-3 py-1.5">
      <div className="leading-tight">
        <div className="font-semibold text-emerald-900 whitespace-nowrap">
          {icon} {label}
        </div>
        <div className="text-xs text-stone-500">{detail}</div>
      </div>
      <div className="whitespace-nowrap text-base min-[340px]:text-lg font-bold text-stone-900 tabular-nums">
        {formatMoneyRounded(usd * rate!, country.currency)}
      </div>
    </div>
  );

  return (
    // Links open in a new tab: inside an iframe they would replace the widget
    <main className="flex min-h-screen flex-col gap-2 border border-emerald-200 bg-white p-3 font-sans text-sm">
      <a
        href={countryUrl}
        target="_blank"
        rel="noopener"
        className="font-bold text-stone-900 hover:text-emerald-700"
      >
        Today&apos;s Nisab in {countryInName(country)}
      </a>

      {amounts ? (
        <>
          {row("🥈", "Silver", `${standard.silverGrams} g`, amounts.silver)}
          {row("🥇", "Gold", `${standard.goldGrams} g`, amounts.gold)}
        </>
      ) : (
        // Only during a build without prices; ISR replaces it on the next revalidation
        <p className="text-stone-600">
          Live silver and gold Nisab, updated daily.
        </p>
      )}

      <div className="mt-auto flex flex-wrap justify-between gap-x-3 text-xs text-stone-500">
        <span>{updatedOn ? `Updated ${updatedOn}` : "Updated daily"}</span>
        <a
          href={countryUrl}
          target="_blank"
          rel="noopener"
          className="font-medium text-emerald-700 hover:underline"
        >
          Powered by Nisab Tracker
        </a>
      </div>
    </main>
  );
}
