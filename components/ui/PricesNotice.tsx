"use client";
import { useCurrencyDate } from "@/contexts/CurrencyDateContext";

interface PricesNoticeProps {
  isStale: boolean;
  lastUpdated: string;
}

/**
 * Warns when the numbers on the page might not be what the visitor expects:
 * prices that haven't refreshed recently, or values shown in USD because
 * exchange rates couldn't be loaded.
 */
export function PricesNotice({ isStale, lastUpdated }: PricesNoticeProps) {
  const { currency, ratesUnavailable } = useCurrencyDate();

  if (!isStale && !ratesUnavailable) return null;

  return (
    <div
      role="status"
      className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-1"
    >
      {isStale && (
        <p>
          ⚠️ Prices were last updated {lastUpdated} and may not reflect
          today&apos;s market. We&apos;re working on it.
        </p>
      )}
      {ratesUnavailable && (
        <p>
          ⚠️ Exchange rates are unavailable right now, so values are shown in
          USD instead of {currency.code}.
        </p>
      )}
    </div>
  );
}
