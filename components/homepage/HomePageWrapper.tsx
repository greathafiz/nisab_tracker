"use client";
import { useCurrencyDate } from "@/contexts/CurrencyDateContext";
import { useLastUpdated } from "@/lib/format-time";
import { NisabCard } from "@/components/homepage/NisabCard";
import { HeroSection } from "@/components/homepage/HeroSection";
import { ZakatSection } from "@/components/homepage/ZakatSection";
import { PricesNotice } from "@/components/ui/PricesNotice";
import { CountryLinks } from "@/components/nisab/CountryLinks";
import { NisabStandardToggle } from "@/components/ui/NisabStandardToggle";
import type { NisabValues } from "@/lib/nisab";
import { NISAB_STANDARDS, nisabAmounts } from "@/lib/nisab-standards";
import { nisabShareText, nisabShareTarget } from "@/lib/share";
import { ShareButtons } from "@/components/share/ShareButtons";
import { FollowLinks } from "@/components/share/FollowLinks";

interface HomePageWrapperProps {
  initialData: NisabValues;
}

export function HomePageWrapper({ initialData }: HomePageWrapperProps) {
  const { displayCurrency, convertFromUSD, nisabStandard, isConverting } =
    useCurrencyDate();
  const standard = NISAB_STANDARDS[nisabStandard];
  const nisab = nisabAmounts(initialData, nisabStandard);

  // Convert usd data locally using exchange rate
  const nisabGoldVal = convertFromUSD(nisab.gold);
  const nisabSilverVal = convertFromUSD(nisab.silver);
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
  const lastUpdated = useLastUpdated(initialData.lastUpdated);
  const goldPriceChange = `${initialData.goldPriceChange >= 0 ? "+" : ""}${initialData.goldPriceChange.toFixed(1)}%`;
  // Link to the currency's country page, whose preview image carries the figures
  const shareTarget = nisabShareTarget(displayCurrency.code);
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
        isLoading={isConverting}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <NisabCard
          title="Nisab (Gold)"
          value={nisabGold}
          currency={displayCurrency.code}
          description={`${standard.goldGrams} grams of gold`}
          lastUpdated={lastUpdated}
          featured={true}
          isLoading={isConverting}
          change={goldPriceChange}
          icon="🥇"
        />
        <NisabCard
          title="Nisab (Silver)"
          value={nisabSilver}
          currency={displayCurrency.code}
          description={`${standard.silverGrams} grams of silver`}
          lastUpdated={lastUpdated}
          featured={true}
          isLoading={isConverting}
          change={silverPriceChange}
          icon="🥈"
        />
      </div>

      <NisabStandardToggle className="-mt-10 mb-10 text-center" />

      {/* Sharing and following in one bar, rather than two loose lines */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 max-w-4xl mx-auto mb-16 rounded-2xl border border-stone-200 bg-white px-5 py-4">
        <ShareButtons
          text={nisabShareText({
            place: shareTarget.place,
            silver: nisabSilverVal,
            gold: nisabGoldVal,
            currency: displayCurrency.code,
            // Absolute, since forwards are read days later
            date: new Date(initialData.lastUpdated).toLocaleDateString(
              "en-GB",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }
            ),
          })}
          url={shareTarget.url}
          className="justify-center"
        />
        <FollowLinks className="text-center" />
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
