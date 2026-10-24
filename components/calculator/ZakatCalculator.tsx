"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useCurrencyDate } from "@/contexts/CurrencyDateContext";
import { formatLastUpdated } from "@/lib/format-time";
import { trackEvent } from "@/lib/analytics";
import type { NisabValues } from "@/lib/nisab";
import { nisabAmounts } from "@/lib/nisab-standards";
import { Button } from "@/components/ui/shadcn/button";
import { PricesNotice } from "@/components/ui/PricesNotice";
import {
  NisabThresholdSelector,
  type NisabType,
} from "./NisabThresholdSelector";
import {
  WealthInputForm,
  type WealthData,
  type GoldKarat,
} from "./WealthInputForm";
import { DebtInputForm } from "./DebtInputForm";
import { FutureCategoriesCard } from "./FutureCategoriesCard";
import {
  ZakatResultsDisplay,
  type CalculationResults,
} from "./ZakatResultsDisplay";

interface WealthDataWithDebts extends WealthData {
  debts: string;
}

const EMPTY_WEALTH_DATA: WealthDataWithDebts = {
  cash: "",
  goldWeight: "",
  silverWeight: "",
  investments: "",
  businessAssets: "",
  debts: "",
};

interface ZakatCalculatorProps {
  nisab: NisabValues;
}

export function ZakatCalculator({ nisab }: ZakatCalculatorProps) {
  const { displayCurrency, convertFromUSD, nisabStandard } = useCurrencyDate();
  const nisabUSD = nisabAmounts(nisab, nisabStandard);
  const [wealthData, setWealthData] =
    useState<WealthDataWithDebts>(EMPTY_WEALTH_DATA);
  const [nisabType, setNisabType] = useState<NisabType>("silver");
  const [goldKarat, setGoldKarat] = useState<GoldKarat>(24);

  const nisabGold = convertFromUSD(nisabUSD.gold);
  const nisabSilver = convertFromUSD(nisabUSD.silver);
  const goldPricePerGram = convertFromUSD(
    nisab.goldPricePerGram * (goldKarat / 24)
  );
  const silverPricePerGram = convertFromUSD(nisab.silverPricePerGram);

  // Each analytics event is sent at most once per visit to the page
  const hasTrackedStart = useRef(false);
  const hasTrackedZakatDue = useRef(false);

  const handleInputChange = (
    field: keyof WealthDataWithDebts,
    value: string
  ) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, "");
    if (sanitizedValue && !hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackEvent({ name: "calculator_start" });
    }
    setWealthData((prev) => ({
      ...prev,
      [field]: sanitizedValue,
    }));
  };

  const handleWealthInputChange = (field: keyof WealthData, value: string) => {
    handleInputChange(field, value);
  };

  const handleDebtChange = (value: string) => {
    handleInputChange("debts", value);
  };

  // Recalculated as the user types; null until something has been entered
  const results = useMemo((): CalculationResults | null => {
    if (Object.values(wealthData).every((value) => value === "")) return null;

    const cash = parseFloat(wealthData.cash) || 0;
    const goldWeight = parseFloat(wealthData.goldWeight) || 0;
    const silverWeight = parseFloat(wealthData.silverWeight) || 0;
    const investments = parseFloat(wealthData.investments) || 0;
    const businessAssets = parseFloat(wealthData.businessAssets) || 0;
    const debts = parseFloat(wealthData.debts) || 0;

    const goldValue = goldWeight * goldPricePerGram;
    const silverValue = silverWeight * silverPricePerGram;

    const totalAssets =
      cash + goldValue + silverValue + investments + businessAssets;
    const totalDebts = debts;
    const netWealth = totalAssets - totalDebts;

    const nisabThreshold = nisabType === "gold" ? nisabGold : nisabSilver;

    const isEligible = netWealth >= nisabThreshold;
    const zakatDue = isEligible ? netWealth * 0.025 : 0;

    return {
      totalAssets,
      totalDebts,
      netWealth,
      nisabThreshold,
      zakatDue,
      isEligible,
      nisabType,
    };
  }, [
    wealthData,
    nisabType,
    nisabGold,
    nisabSilver,
    goldPricePerGram,
    silverPricePerGram,
  ]);

  const isZakatDue = results?.isEligible ?? false;
  useEffect(() => {
    if (!isZakatDue || hasTrackedZakatDue.current) return;
    hasTrackedZakatDue.current = true;
    trackEvent({
      name: "zakat_due_shown",
      params: {
        nisab_type: nisabType,
        selected_currency: displayCurrency.code,
      },
    });
  }, [isZakatDue, nisabType, displayCurrency.code]);

  const resetCalculator = () => {
    setWealthData(EMPTY_WEALTH_DATA);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: displayCurrency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      <PricesNotice
        isStale={nisab.isStale}
        lastUpdated={formatLastUpdated(nisab.lastUpdated)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <NisabThresholdSelector
            nisabType={nisabType}
            onNisabTypeChange={setNisabType}
            silverNisab={nisabSilver}
            goldNisab={nisabGold}
            formatCurrency={formatCurrency}
          />

          <WealthInputForm
            wealthData={wealthData}
            onInputChange={handleWealthInputChange}
            goldKarat={goldKarat}
            onGoldKaratChange={setGoldKarat}
            goldPricePerGram={goldPricePerGram}
            silverPricePerGram={silverPricePerGram}
            formatCurrency={formatCurrency}
            totalAssets={results?.totalAssets || 0}
          />

          <DebtInputForm
            debts={wealthData.debts}
            onDebtChange={handleDebtChange}
            totalDebts={results?.totalDebts || 0}
            formatCurrency={formatCurrency}
          />

          <FutureCategoriesCard />

          <div className="flex gap-3">
            <Button
              onClick={resetCalculator}
              variant="outline"
              className="flex-1 cursor-pointer"
            >
              Reset Calculator
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <ZakatResultsDisplay
            results={results}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </>
  );
}
