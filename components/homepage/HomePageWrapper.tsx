"use client";
import { useCurrencyDate } from "@/contexts/CurrencyDateContext";
import { formatLastUpdated } from "@/lib/format-time";
import { NisabCard } from "@/components/homepage/NisabCard";
import { HeroSection } from "@/components/homepage/HeroSection";
import { ZakatSection } from "@/components/homepage/ZakatSection";
import { PricesNotice } from "@/components/ui/PricesNotice";
import { CountryLinks } from "@/components/nisab/CountryLinks";
import type { NisabValues } from "@/lib/nisab";

interface HomePageWrapperProps {
  initialData: NisabValues;
}

export function HomePageWrapper({ initialData }: HomePageWrapperProps) {
  const { displayCurrency, convertFromUSD } = useCurrencyDate();

  // Convert usd data locally using exchange rate
  const nisabGoldVal = convertFromUSD(initialData.nisabGold);
  const nisabSilverVal = convertFromUSD(initialData.nisabSilver);
  const goldPricePerGramVal = convertFromUSD(initialData.goldPricePerGram);
  const silverPricePerGramVal = convertFromUSD(initialData.silverPricePerGram);

  // Formatting strings
  const nisabGold = nisabGoldVal.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const nisabSilver = nisabSilverVal.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const lastUpdated = formatLastUpdated(initialData.lastUpdated);
  const goldPriceChange = `${initialData.goldPriceChange >= 0 ? "+" : ""}${initialData.goldPriceChange.toFixed(1)}%`;
  const silverPriceChange = `${initialData.silverPriceChange >= 0 ? "+" : ""}${initialData.silverPriceChange.toFixed(1)}%`;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <PricesNotice isStale={initialData.isStale} lastUpdated={lastUpdated} />

      <HeroSection
        lastUpdated={lastUpdated}
        isStale={initialData.isStale}
        goldPricePerGram={goldPricePerGramVal}
        silverPricePerGram={silverPricePerGramVal}
        currency={displayCurrency.code}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <NisabCard
          title="Nisab (Gold)"
          value={nisabGold}
          currency={displayCurrency.code}
          description="87.48 grams of gold"
          lastUpdated={lastUpdated}
          featured={true}
          change={goldPriceChange}
          icon="🥇"
        />
        <NisabCard
          title="Nisab (Silver)"
          value={nisabSilver}
          currency={displayCurrency.code}
          description="612.36 grams of silver"
          lastUpdated={lastUpdated}
          featured={true}
          change={silverPriceChange}
          icon="🥈"
        />
      </div>

      <section className="mb-16 text-center">
        <h2 className="text-xl font-semibold text-stone-900 mb-4">
          Nisab in your country
        </h2>
        <CountryLinks className="justify-center max-w-3xl mx-auto" />
      </section>

      <ZakatSection />
    </main>
  );
}
