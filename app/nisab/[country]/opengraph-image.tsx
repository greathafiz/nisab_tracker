import { ImageResponse } from "next/og";
import { getNisabValuesForPage, getExchangeRatesForPage } from "@/lib/nisab";
import {
  NISAB_STANDARDS,
  defaultStandardFor,
  nisabAmounts,
} from "@/lib/nisab-standards";
import { COUNTRIES, getCountry, countryInName } from "@/lib/countries";
import { formatMoneyRounded } from "@/lib/currencies";

// Same schedule as the page, so the preview never shows older figures than the page
export const revalidate = 3600;
// Like the page, only the listed countries; anything else is a 404 rather than a crash
export const dynamicParams = false;

export const alt = "Today's silver and gold Nisab";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return COUNTRIES.map((country) => ({ country: country.slug }));
}

const EMERALD = "#047857";
const STONE_900 = "#1c1917";
const STONE_500 = "#78716c";

export default async function Image({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const country = getCountry((await params).country)!;
  const inName = countryInName(country);
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
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });

  const row = (label: string, detail: string, usd: number) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "28px 40px",
        background: "white",
        borderRadius: 24,
        border: "2px solid #a7f3d0",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: "#064e3b" }}>
          {label}
        </div>
        <div style={{ fontSize: 24, color: STONE_500 }}>{detail}</div>
      </div>
      <div style={{ fontSize: 60, fontWeight: 700, color: STONE_900 }}>
        {formatMoneyRounded(usd * rate!, country.currency)}
      </div>
    </div>
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "56px 64px",
        background: "linear-gradient(135deg, #fafaf9 0%, #ecfdf5 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, color: EMERALD }}>
        Nisab Tracker
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: STONE_900,
          marginTop: 12,
          marginBottom: 36,
        }}
      >
        {`Nisab in ${inName} today`}
      </div>

      {amounts ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {row(
            "Silver Nisab",
            `${standard.silverGrams} g of silver`,
            amounts.silver
          )}
          {row("Gold Nisab", `${standard.goldGrams} g of gold`, amounts.gold)}
        </div>
      ) : (
        // Only during a build without prices; ISR replaces it on the next revalidation
        <div style={{ fontSize: 40, color: STONE_500 }}>
          Live silver and gold Nisab, updated daily
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          fontSize: 26,
          color: STONE_500,
        }}
      >
        <div>{updatedOn ? `Updated ${updatedOn}` : "Updated daily"}</div>
        <div style={{ color: EMERALD, fontWeight: 700 }}>
          {`nisabtracker.com/nisab/${country.slug}`}
        </div>
      </div>
    </div>,
    size
  );
}
