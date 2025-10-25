interface HeroSectionProps {
  lastUpdated: string
  goldPricePerGram?: number
  silverPricePerGram?: number
  currency?: string
  isLoading?: boolean
}

export const HeroSection = ({
  lastUpdated,
  goldPricePerGram,
  silverPricePerGram,
  currency,
  isLoading = false,
}: HeroSectionProps) => {
  return (
    <div className="text-center mb-16">
      {lastUpdated && (
        <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>Live Data • Updated {lastUpdated}</span>
        </div>
      )}

      {/* Current spot prices - small and subtle */}
      {goldPricePerGram && silverPricePerGram && currency && (
        <div className="mb-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-4 text-xs text-stone-500">
              <div className="h-3 w-24 bg-stone-200 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-stone-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-500">🥇</span>
                <span className="font-medium">
                  {currency} {goldPricePerGram.toLocaleString()}/g
                </span>
              </div>
              <div className="w-px h-4 bg-stone-300"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400">🥈</span>
                <span className="font-medium">
                  {currency} {silverPricePerGram.toLocaleString()}/g
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-center mb-4">
        <p className="text-xs text-stone-500 max-w-xl mx-auto">
          Based on international spot prices from trusted precious metals data
          providers
          <span className="mx-2">•</span>
          Data refreshed every day for accuracy
        </p>
      </div>
      <h2 className="text-5xl font-bold text-stone-900 mb-6 tracking-tight">
        Islamic Financial Values
      </h2>
      <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
        Track real-time Nisab thresholds and calculate your Zakat obligations
        with
        <span className="font-semibold text-stone-700">
          {" "}
          accurate, up-to-date
        </span>{" "}
        Islamic financial data.
      </p>
      <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-stone-500">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
          <span>Gold Nisab</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-stone-400 rounded-full"></div>
          <span>Silver Nisab</span>
        </div>
      </div>
    </div>
  )
}
