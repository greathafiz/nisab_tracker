import { ImageResponse } from "next/og";
import { getNisabValuesForPage } from "@/lib/nisab";
import { NISAB_STANDARDS, nisabAmounts } from "@/lib/nisab-standards";
import { formatMoneyRounded } from "@/lib/currencies";
import {
  OG_COLORS,
  OG_SIZE,
  OgBrand,
  logoDataUrl,
  ogDate,
  ogOptions,
} from "@/lib/og";

// The homepage's preview: today's figures in USD, so a shared link is worth opening.
// Same schedule as the page, so it never shows older figures than the page.
export const revalidate = 3600;

export const alt = "Today's silver and gold Nisab";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [nisab, logo, options] = await Promise.all([
    getNisabValuesForPage(),
    logoDataUrl(),
    ogOptions(),
  ]);
  const standard = NISAB_STANDARDS.majority;
  const amounts = nisab && nisabAmounts(nisab, "majority");

  const card = (label: string, grams: string, usd: number) => (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "32px 40px",
        background: "white",
        borderRadius: 28,
        border: `2px solid ${OG_COLORS.emeraldBorder}`,
      }}
    >
      <div
        style={{ fontSize: 32, fontWeight: 700, color: OG_COLORS.emeraldDark }}
      >
        {label}
      </div>
      <div style={{ fontSize: 24, color: OG_COLORS.stone500, marginTop: 4 }}>
        {grams}
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: OG_COLORS.stone900,
          marginTop: 28,
        }}
      >
        {formatMoneyRounded(usd, "USD")}
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
        padding: "52px 64px",
        background: OG_COLORS.background,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <OgBrand logo={logo} />
        {nisab && (
          <div style={{ fontSize: 26, color: OG_COLORS.stone500 }}>
            {ogDate(nisab.lastUpdated)}
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: OG_COLORS.stone900,
          marginTop: 36,
          marginBottom: 32,
        }}
      >
        Today&apos;s Nisab
      </div>

      {amounts ? (
        <div style={{ display: "flex", gap: 24 }}>
          {card(
            "Silver Nisab",
            `${standard.silverGrams} g of silver`,
            amounts.silver
          )}
          {card("Gold Nisab", `${standard.goldGrams} g of gold`, amounts.gold)}
        </div>
      ) : (
        // Only during a build without prices; ISR replaces it on the next revalidation
        <div style={{ fontSize: 40, color: OG_COLORS.stone500 }}>
          Live silver and gold Nisab, updated daily
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          fontSize: 26,
          color: OG_COLORS.stone500,
        }}
      >
        <div>In your currency, plus a free Zakat calculator</div>
        <div style={{ color: OG_COLORS.emerald, fontWeight: 700 }}>
          nisabtracker.com
        </div>
      </div>
    </div>,
    options
  );
}
