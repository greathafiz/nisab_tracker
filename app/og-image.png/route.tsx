import { ImageResponse } from "next/og";
import { OG_COLORS, OgBrand, logoDataUrl, ogOptions } from "@/lib/og";

// The preview for pages without figures of their own (blog, calculator...), drawn at
// the size lib/site.ts declares. Built once; nothing in it changes day to day.
export const dynamic = "force-static";

const CURRENCIES = ["USD", "GBP", "EUR", "NGN", "PKR", "SAR", "AED", "MYR"];

export async function GET() {
  const [logo, options] = await Promise.all([logoDataUrl(), ogOptions()]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "64px 80px",
        background: OG_COLORS.background,
        fontFamily: "Geist",
      }}
    >
      <OgBrand logo={logo} size={96} />

      <div
        style={{
          fontSize: 44,
          lineHeight: 1.3,
          color: OG_COLORS.stone600,
          marginTop: 36,
          maxWidth: 900,
        }}
      >
        Today&apos;s Nisab in your currency, and a free Zakat calculator
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 44 }}>
        {CURRENCIES.map((code) => (
          <div
            key={code}
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: OG_COLORS.emeraldDark,
              background: "white",
              border: `2px solid ${OG_COLORS.emeraldBorder}`,
              borderRadius: 999,
              padding: "8px 20px",
            }}
          >
            {code}
          </div>
        ))}
        <div
          style={{
            fontSize: 24,
            color: OG_COLORS.stone500,
            padding: "10px 8px",
          }}
        >
          +12 more
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 80,
          bottom: 56,
          fontSize: 28,
          fontWeight: 700,
          color: OG_COLORS.emerald,
        }}
      >
        nisabtracker.com
      </div>
    </div>,
    options
  );
}
