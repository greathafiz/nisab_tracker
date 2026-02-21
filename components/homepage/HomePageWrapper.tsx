"use client";
import { useCurrencyDate } from "@/contexts/CurrencyDateContext";
import { formatLastUpdated } from "@/lib/format-time";
import { NisabCard } from "@/components/homepage/NisabCard";
import { HeroSection } from "@/components/homepage/HeroSection";
import { ZakatSection } from "@/components/homepage/ZakatSection";
import type { NisabValues } from "@/app/api/nisab/route";

interface HomePageWrapperProps {
    initialData: NisabValues;
}

export function HomePageWrapper({ initialData }: HomePageWrapperProps) {
    const { currency, exchangeRates, isLoadingRates } = useCurrencyDate();

    // Determine exchange rate relative to USD
    const exchangeRate = currency.code === "USD" ? 1 : (exchangeRates?.[currency.code] ?? 1);

    // Convert usd data locally using exchange rate
    const nisabGoldVal = initialData.nisabGold * exchangeRate;
    const nisabSilverVal = initialData.nisabSilver * exchangeRate;
    const goldPricePerGramVal = initialData.goldPricePerGram * exchangeRate;
    const silverPricePerGramVal = initialData.silverPricePerGram * exchangeRate;

    // Formatting strings
    const nisabGold = nisabGoldVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const nisabSilver = nisabSilverVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const lastUpdated = formatLastUpdated(initialData.lastUpdated);
    const goldPriceChange = `${initialData.goldPriceChange >= 0 ? "+" : ""}${initialData.goldPriceChange.toFixed(1)}%`;
    const silverPriceChange = `${initialData.silverPriceChange >= 0 ? "+" : ""}${initialData.silverPriceChange.toFixed(1)}%`;

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <HeroSection
                lastUpdated={lastUpdated}
                goldPricePerGram={goldPricePerGramVal}
                silverPricePerGram={silverPricePerGramVal}
                currency={currency.code}
                isLoading={isLoadingRates}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                <NisabCard
                    title="Nisab (Gold)"
                    value={nisabGold}
                    currency={currency.code}
                    description="87.48 grams of gold"
                    lastUpdated={lastUpdated}
                    featured={true}
                    change={goldPriceChange}
                    icon="🥇"
                    isLoading={isLoadingRates}
                />
                <NisabCard
                    title="Nisab (Silver)"
                    value={nisabSilver}
                    currency={currency.code}
                    description="612.36 grams of silver"
                    lastUpdated={lastUpdated}
                    featured={true}
                    change={silverPriceChange}
                    icon="🥈"
                    isLoading={isLoadingRates}
                />
            </div>
            <ZakatSection />
        </main>
    );
}
