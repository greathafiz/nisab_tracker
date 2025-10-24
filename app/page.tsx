"use client"
import { useEffect, useState } from "react"
import { useCurrencyDate } from "@/contexts/CurrencyDateContext"
import { Button } from "@/components/ui/shadcn/button"
import { NisabCard } from "@/components/homepage/NisabCard"
import { HeroSection } from "@/components/homepage/HeroSection"
import { ZakatSection } from "@/components/homepage/ZakatSection"
import { Footer } from "@/components/ui/Footer"
// import { HistoricalChart } from "@/components/homepage/HistoricalChart"
// import { Separator } from "@/components/ui/shadcn/separator"

interface NisabData {
  nisabGold: string
  nisabSilver: string
  dowry: string
  diyyah: string
  currency: string
  lastUpdated: string
  goldPriceChange: string
  silverPriceChange: string
}

export default function Home() {
  const { currency, exchangeRates, isLoadingRates } = useCurrencyDate()
  const [nisabData, setNisabData] = useState<NisabData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoadingRates) return

    async function fetchNisabData() {
      try {
        setIsLoading(true)
        setError(null)

        // Get exchange rate for current currency
        const exchangeRate =
          currency.code === "USD" ? 1 : exchangeRates[currency.code]

        // Fetch with currency and exchange rate parameters
        const response = await fetch(
          `/api/nisab?currency=${currency.code}&rate=${exchangeRate}`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch Nisab data")
        }
        const data = await response.json()

        const formattedData: NisabData = {
          nisabGold: data.nisabGold.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          nisabSilver: data.nisabSilver.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          dowry: data.dowry.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          diyyah: data.diyyah.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          currency: currency.code,
          lastUpdated: new Date(data.lastUpdated).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          goldPriceChange: `${
            data.goldPriceChange >= 0 ? "+" : ""
          }${data.goldPriceChange.toFixed(1)}%`,
          silverPriceChange: `${
            data.silverPriceChange >= 0 ? "+" : ""
          }${data.silverPriceChange.toFixed(1)}%`,
        }

        setNisabData(formattedData)
        setError(null)
      } catch (err) {
        console.error("Error fetching Nisab data:", err)
        setError("Failed to load current data. Please try again.")
        setNisabData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNisabData()
  }, [currency, exchangeRates, isLoadingRates])

  if (error && !nisabData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-xl">!</span>
          </div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const data = nisabData || {
    nisabGold: "",
    nisabSilver: "",
    dowry: "",
    diyyah: "",
    currency: currency.code,
    lastUpdated: "",
    goldPriceChange: "",
    silverPriceChange: "",
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <HeroSection lastUpdated={data.lastUpdated} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <NisabCard
          title="Nisab (Gold)"
          value={data.nisabGold}
          currency={data.currency}
          description="87.48 grams of gold"
          lastUpdated={data.lastUpdated}
          featured={true}
          change={data.goldPriceChange}
          icon="🥇"
          isLoading={isLoading}
        />
        <NisabCard
          title="Nisab (Silver)"
          value={data.nisabSilver}
          currency={data.currency}
          description="612.36 grams of silver"
          lastUpdated={data.lastUpdated}
          featured={true}
          change={data.silverPriceChange}
          icon="🥈"
          isLoading={isLoading}
        />
      </div>

      {/* <Separator className="my-12" />

      <div className="mb-16">
        <HistoricalChart currency={data.currency} />
      </div>

      <Separator className="my-12" /> */}

      <div className="mb-16">
        <h3 className="text-2xl font-bold text-stone-900 mb-2 text-center">
          Other Islamic Financial Values
        </h3>
        <p className="text-stone-600 text-center mb-8">
          Additional important thresholds in Islamic jurisprudence
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NisabCard
            title="Mahr al-Fatimah"
            value={data.dowry}
            currency={data.currency}
            description="Reference dowry amount"
            lastUpdated={data.lastUpdated}
            icon="💍"
            isLoading={isLoading}
          />
          <NisabCard
            title="Diyyah"
            value={data.diyyah}
            currency={data.currency}
            description="Blood money compensation"
            lastUpdated={data.lastUpdated}
            icon="⚖️"
            isLoading={isLoading}
          />
        </div>
      </div>

      <ZakatSection />

      <Footer />
    </main>
  )
}
