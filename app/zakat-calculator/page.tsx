import type { Metadata } from "next";
import { ZakatCalculator } from "@/components/calculator/ZakatCalculator";
import { PricesUnavailable } from "@/components/ui/PricesUnavailable";
import { getNisabValuesForPage } from "@/lib/nisab";
import { OG_IMAGE } from "@/lib/site";

export const revalidate = 3600;

const title = "Zakat Calculator – Calculate Zakat on Cash, Gold & Silver";
const description =
  "Work out how much Zakat you owe in your own currency. Enter your cash, gold, silver, investments and debts, and we compare your wealth with today's live Nisab and calculate the 2.5%.";

export const metadata: Metadata = {
  title: `${title} | Nisab Tracker`,
  description,
  alternates: { canonical: "/zakat-calculator" },
  openGraph: {
    title,
    description,
    url: "/zakat-calculator",
    siteName: "Nisab Tracker",
    images: [OG_IMAGE],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@hafizaderemi",
    title,
    description,
    images: [OG_IMAGE.url],
  },
};

export default async function CalculatorPage() {
  const nisab = await getNisabValuesForPage();

  if (!nisab) return <PricesUnavailable />;

  return (
    <div>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="text-lg">🧮</span>
            <span>Free Zakat Calculator</span>
          </div>
          <h1 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">
            Calculate Your Zakat
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Use our accurate calculator to determine your Zakat obligations
            based on current Nisab values
          </p>
        </div>

        <ZakatCalculator nisab={nisab} />
      </main>
    </div>
  );
}
