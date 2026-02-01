import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CurrencyDateProvider } from "@/contexts/CurrencyDateContext";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generateWebApplicationSchema,
  generateOrganizationSchema,
} from "@/lib/schema";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { WebVitals } from "@/components/web-vitals";
import Script from "next/script";

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
  description: "Calculate your Zakat accurately with real-time Nisab values based on daily gold and silver prices. Free Islamic Zakat calculator for Muslims worldwide.",
  metadataBase: new URL("https://nisabtracker.com"),
  openGraph: {
    title: "Nisab Tracker | Free Zakat Calculator",
    description: "Calculate your Zakat accurately with real-time Nisab values based on daily gold and silver prices. Free Islamic Zakat calculator for Muslims worldwide.",
    url: "https://nisabtracker.com",
    siteName: "Nisab Tracker",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nisab Tracker and Free Zakat Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@hafizaderemi",
    title: "Nisab Tracker | Free Zakat Calculator",
    description: "Nisab Tracker and Zakat Calculator",
    images: ["/og-image.png"],
  },
  alternates: { languages: { en: "/en", ar: "/ar" } },
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
        <WebVitals />
        <JsonLd data={generateWebApplicationSchema()} />
        <JsonLd data={generateOrganizationSchema()} />

        <CurrencyDateProvider>
          <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
            <Header />
            {children}
            <Footer />
          </div>
        </CurrencyDateProvider>
        <SpeedInsights />

        <Script src="https://www.googletagmanager.com/gtag/js?id=G-S08RYTFS3W" strategy="afterInteractive" />

        <Script id="google-analytics" strategy="afterInteractive"> {` window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-S08RYTFS3W');`} </Script>
      </body>
    </html>
  );
}
