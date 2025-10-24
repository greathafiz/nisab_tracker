interface HeroSectionProps {
  lastUpdated: string
}

export const HeroSection = ({ lastUpdated }: HeroSectionProps) => {
  return (
    <div className="text-center mb-16">
      {lastUpdated && (
        <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>Live Data • Updated {lastUpdated}</span>
        </div>
      )}
      <div className="text-center mb-4">
        <p className="text-xs text-stone-500 max-w-xl mx-auto">
          Based on global gold & silver rates from London Metal Exchange & COMEX
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
