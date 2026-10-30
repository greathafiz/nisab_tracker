import { formatAmount } from "@/lib/currencies";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  lastUpdated: string;
  isStale?: boolean;
  goldPricePerGram: number;
  silverPricePerGram: number;
  currency: string;
  // Placeholder bars while the visitor's currency is being worked out
  isLoading?: boolean;
}

export const HeroSection = ({
  lastUpdated,
  isStale = false,
  goldPricePerGram,
  silverPricePerGram,
  currency,
  isLoading = false,
}: HeroSectionProps) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
        Today&apos;s Nisab
      </h1>
      <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-6">
        The minimum wealth on which Zakat is due, worked out from today&apos;s
        gold and silver prices.
      </p>

      {/* Freshness and the spot prices behind the figures, in one line */}
      <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl sm:rounded-full bg-white border border-stone-200 px-4 py-1.5 text-xs text-stone-600">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-medium",
            isStale ? "text-amber-700" : "text-emerald-700"
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              isStale ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
            )}
            aria-hidden="true"
          />
          Updated {lastUpdated}
        </span>
        <span className="text-stone-300" aria-hidden="true">
          |
        </span>
        {isLoading ? (
          <>
            <span className="h-3 w-28 rounded bg-stone-200 animate-pulse" />
            <span className="h-3 w-28 rounded bg-stone-200 animate-pulse" />
          </>
        ) : (
          <>
            <span className="whitespace-nowrap">
              Gold {currency} {formatAmount(goldPricePerGram)}/g
            </span>
            <span className="whitespace-nowrap">
              Silver {currency} {formatAmount(silverPricePerGram)}/g
            </span>
          </>
        )}
      </div>
    </div>
  );
};
