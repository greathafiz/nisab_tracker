import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Shared by the generated link-preview images (WhatsApp, X, Facebook...)

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  emerald: "#047857",
  emeraldDark: "#064e3b",
  emeraldBorder: "#a7f3d0",
  stone900: "#1c1917",
  stone600: "#57534e",
  stone500: "#78716c",
  background: "linear-gradient(135deg, #fafaf9 0%, #ecfdf5 100%)",
};

// ImageResponse can't load /public URLs at build time, so inline the logo
export async function logoDataUrl(): Promise<string> {
  const logo = await readFile(
    join(process.cwd(), "public/logo-192.png"),
    "base64"
  );
  return `data:image/png;base64,${logo}`;
}

// The site's font. ImageResponse's built-in one has no bold, so fontWeight 700 did nothing.
// Static TTFs because ImageResponse can't read woff2 or variable fonts.
export async function ogFonts() {
  const load = (weight: 400 | 700) =>
    readFile(join(process.cwd(), `assets/fonts/Geist-${weight}.ttf`));
  const [regular, bold] = await Promise.all([load(400), load(700)]);
  return [
    {
      name: "Geist",
      data: regular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: bold,
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}

// Pass to ImageResponse: the size every preview is drawn at, plus the fonts
export async function ogOptions() {
  return { ...OG_SIZE, fonts: await ogFonts() };
}

export function ogDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Logo and name, top left of every preview
export function OgBrand({ logo, size = 56 }: { logo: string; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size / 3.5 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
      <img src={logo} width={size} height={size} alt="" />
      <div
        style={{
          fontSize: size * 0.55,
          fontWeight: 700,
          color: OG_COLORS.stone900,
        }}
      >
        Nisab Tracker
      </div>
    </div>
  );
}
