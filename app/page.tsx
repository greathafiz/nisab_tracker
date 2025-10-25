"use client"
import { useEffect, useState } from "react"
import { useCurrencyDate } from "@/contexts/CurrencyDateContext"
import { formatLastUpdated } from "@/lib/format-time"
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
  goldPricePerGram: number
  silverPricePerGram: number
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
          currency.code === "USD" ? 1 : exchangeRates?.[currency.code] ?? 1

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
          lastUpdated: formatLastUpdated(data.lastUpdated),
          goldPriceChange: `${
            data.goldPriceChange >= 0 ? "+" : ""
          }${data.goldPriceChange.toFixed(1)}%`,
          silverPriceChange: `${
            data.silverPriceChange >= 0 ? "+" : ""
          }${data.silverPriceChange.toFixed(1)}%`,
          goldPricePerGram: data.goldPricePerGram || 0,
          silverPricePerGram: data.silverPricePerGram || 0,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency.code, isLoadingRates]) // ✅ Only depend on currency.code, not entire objects

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
    goldPricePerGram: 0,
    silverPricePerGram: 0,
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <HeroSection
        lastUpdated={data.lastUpdated}
        goldPricePerGram={data.goldPricePerGram}
        silverPricePerGram={data.silverPricePerGram}
        currency={data.currency}
        isLoading={isLoading}
      />

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

      {/* <div className="mb-16">
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
            description="1,487.5 grams of silver"
            lastUpdated={data.lastUpdated}
            icon="💍"
            isLoading={isLoading}
          />
          <NisabCard
            title="Diyyah"
            value={data.diyyah}
            currency={data.currency}
            description="4,374 grams of gold"
            lastUpdated={data.lastUpdated}
            icon="⚖️"
            isLoading={isLoading}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lg">💍</span>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-2 text-sm">
                  About Mahr al-Fatimah
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  The reference dowry amount based on what Prophet Muhammad ﷺ
                  gave to his daughter Fatimah رضي الله عنها (500 dirhams =
                  1,487.5g of silver). This is the minimum amount recommended
                  for Mahr (dowry) in marriage. It is also the minimum amount to
                  be stolen before the Hadd (Islamic punishment) is applied to a
                  thief.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lg">⚖️</span>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-2 text-sm">
                  About Diyyah (Blood Money)
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  The financial compensation to be paid to the family of a
                  person who was killed accidentally or unintentionally.
                  Traditionally set at 1,000 dinars or 12,000 dirhams (approx.
                  4,374g of gold). This serves as a means of reconciliation and
                  support for the victim&apos;s family in Islamic law.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <ZakatSection />

      <Footer />
    </main>
  )
}
