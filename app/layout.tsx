import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { SiteChrome } from "@/components/layouts/SiteChrome";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generateWebApplicationSchema,
  generateOrganizationSchema,
} from "@/lib/schema";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { SITE_URL, OG_IMAGE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nisab Tracker | Free Zakat Calculator",
  description:
    "Calculate your Zakat accurately with real-time Nisab values based on daily gold and silver prices. Free Islamic Zakat calculator for Muslims worldwide.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Nisab Tracker | Free Zakat Calculator",
    description:
      "Calculate your Zakat accurately with real-time Nisab values based on daily gold and silver prices. Free Islamic Zakat calculator for Muslims worldwide.",
    siteName: "Nisab Tracker",
    images: [OG_IMAGE],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@nisabtracker",
    creator: "@hafizaderemi",
    title: "Nisab Tracker | Free Zakat Calculator",
    // No images: X falls back to og:image, i.e. app/opengraph-image.tsx on the homepage
    description: "Nisab Tracker and Zakat Calculator",
  },
  verification: { google: "UJhuIAMThdxkuHPVaUkmeN_c1QHDgtpqR2zMa7tAq1U" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <JsonLd data={generateWebApplicationSchema()} />
        <JsonLd data={generateOrganizationSchema()} />

        <SiteChrome
          header={<Header />}
          footer={<Footer />}
          analytics={
            <>
              <SpeedInsights />
              <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-S08RYTFS3W"
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-S08RYTFS3W');`}
              </Script>
            </>
          }
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
