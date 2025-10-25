"use client"

interface MetalPricesCardProps {
  goldPricePerGram: number
  silverPricePerGram: number
  currency: string
  isLoading?: boolean
}

export function MetalPricesCard({
  goldPricePerGram,
  silverPricePerGram,
  currency,
  isLoading = false,
}: MetalPricesCardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-4 text-xs text-stone-500">
        <div className="h-3 w-24 bg-stone-200 rounded animate-pulse"></div>
        <div className="h-3 w-24 bg-stone-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
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
  )
}
