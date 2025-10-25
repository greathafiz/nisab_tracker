"use client"
import { useState, useEffect, useCallback } from "react"
import { useCurrencyDate } from "@/contexts/CurrencyDateContext"
import { Button } from "@/components/ui/shadcn/button"
import {
  NisabThresholdSelector,
  type NisabType,
} from "./NisabThresholdSelector"
import { WealthInputForm, type WealthData } from "./WealthInputForm"
import { DebtInputForm } from "./DebtInputForm"
import { FutureCategoriesCard } from "./FutureCategoriesCard"
import {
  ZakatResultsDisplay,
  type CalculationResults,
} from "./ZakatResultsDisplay"

interface WealthDataWithDebts extends WealthData {
  debts: string
}

interface NisabData {
  nisabGold: number
  nisabSilver: number
  goldPricePerGram: number
  silverPricePerGram: number
  currency: string
}

export function ZakatCalculator() {
  const { currency, exchangeRates, isLoadingRates } = useCurrencyDate()
  const [wealthData, setWealthData] = useState<WealthDataWithDebts>({
    cash: "",
    goldWeight: "",
    silverWeight: "",
    investments: "",
    businessAssets: "",
    debts: "",
  })

  const [nisabType, setNisabType] = useState<NisabType>("silver")
  const [results, setResults] = useState<CalculationResults | null>(null)
  const [nisabData, setNisabData] = useState<NisabData | null>(null)
  const [isLoadingNisab, setIsLoadingNisab] = useState(true)

  // Fetch real Nisab values from API
  useEffect(() => {
    if (isLoadingRates) return

    async function fetchNisabData() {
      try {
        setIsLoadingNisab(true)

        const exchangeRate =
          currency.code === "USD" ? 1 : exchangeRates?.[currency.code] ?? 1

        const response = await fetch(
          `/api/nisab?currency=${currency.code}&rate=${exchangeRate}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch Nisab data")
        }

        const data = await response.json()

        setNisabData({
          nisabGold: data.nisabGold,
          nisabSilver: data.nisabSilver,
          goldPricePerGram: data.goldPricePerGram,
          silverPricePerGram: data.silverPricePerGram,
          currency: data.currency,
        })
      } catch (error) {
        console.error("Error fetching Nisab data:", error)
      } finally {
        setIsLoadingNisab(false)
      }
    }

    fetchNisabData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency.code, isLoadingRates])

  const handleInputChange = (
    field: keyof WealthDataWithDebts,
    value: string
  ) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, "")
    setWealthData((prev) => ({
      ...prev,
      [field]: sanitizedValue,
    }))
  }

  const handleWealthInputChange = (field: keyof WealthData, value: string) => {
    handleInputChange(field, value)
  }

  const handleDebtChange = (value: string) => {
    handleInputChange("debts", value)
  }

  const calculateZakat = useCallback(() => {
    if (!nisabData) return

    const cash = parseFloat(wealthData.cash) || 0
    const goldWeight = parseFloat(wealthData.goldWeight) || 0
    const silverWeight = parseFloat(wealthData.silverWeight) || 0
    const investments = parseFloat(wealthData.investments) || 0
    const businessAssets = parseFloat(wealthData.businessAssets) || 0
    const debts = parseFloat(wealthData.debts) || 0

    const goldValue = goldWeight * nisabData.goldPricePerGram
    const silverValue = silverWeight * nisabData.silverPricePerGram

    const totalAssets =
      cash + goldValue + silverValue + investments + businessAssets
    const totalDebts = debts
    const netWealth = totalAssets - totalDebts

    const nisabThreshold =
      nisabType === "gold" ? nisabData.nisabGold : nisabData.nisabSilver

    const isEligible = netWealth >= nisabThreshold
    const zakatDue = isEligible ? netWealth * 0.025 : 0

    setResults({
      totalAssets,
      totalDebts,
      netWealth,
      nisabThreshold,
      zakatDue,
      isEligible,
      nisabType,
    })
  }, [wealthData, nisabType, nisabData])

  // Real-time calculation as user types
  useEffect(() => {
    calculateZakat()
  }, [wealthData, nisabType, calculateZakat])

  const resetCalculator = () => {
    setWealthData({
      cash: "",
      goldWeight: "",
      silverWeight: "",
      investments: "",
      businessAssets: "",
      debts: "",
    })
    setResults(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: nisabData?.currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Show loading state while fetching Nisab data
  if (isLoadingNisab || !nisabData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="h-40 bg-stone-100 rounded-xl animate-pulse"></div>
          <div className="h-96 bg-stone-100 rounded-xl animate-pulse"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-stone-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="space-y-6">
        <NisabThresholdSelector
          nisabType={nisabType}
          onNisabTypeChange={setNisabType}
          silverNisab={nisabData.nisabSilver}
          goldNisab={nisabData.nisabGold}
          formatCurrency={formatCurrency}
        />

        <WealthInputForm
          wealthData={wealthData}
          onInputChange={handleWealthInputChange}
          goldPricePerGram={nisabData.goldPricePerGram}
          silverPricePerGram={nisabData.silverPricePerGram}
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
            className="flex-1"
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
  )
}
