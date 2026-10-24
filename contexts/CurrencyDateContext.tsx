"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from "react";

/**
 * Currency & Date Context
 *
 * Provides:
 * - Multi-currency support (20+ currencies)
 * - Auto-detection based on browser locale e.g. en-GB, ar-SA, etc.
 * - Exchange rate management (updated every 24h)
 * - Hijri & Gregorian date display
 * - USD -> Target currency conversion utilities
 *
 * All metal prices are fetched in USD, then converted client-side
 * using cached exchange rates from exchangerate-api.com
 */

export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "NGN"
  | "SAR"
  | "AED"
  | "QAR"
  | "KWD"
  | "EGP"
  | "TRY"
  | "PKR"
  | "BDT"
  | "MYR"
  | "IDR"
  | "INR"
  | "CAD"
  | "AUD"
  | "ZAR"
  | "JOD"
  | "MAD";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate?: number; // Exchange rate from USD (updated from API)
}

export const currencies: Record<CurrencyCode, Currency> = {
  // Major International
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },

  // Gulf States
  SAR: { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  QAR: { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal" },
  KWD: { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },

  // Major Muslim Countries
  EGP: { code: "EGP", symbol: "ج.م", name: "Egyptian Pound" },
  TRY: { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  PKR: { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  BDT: { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },

  // ASEAN & Others
  MYR: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  IDR: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },

  // Additional
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand" },
  JOD: { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar" },
  MAD: { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
  NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
};

function getHijriDate() {
  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return formatter.format(new Date());
}

function getGregorianDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Re-read the dates every minute so they roll over at midnight
function subscribeToClock(onChange: () => void) {
  const interval = setInterval(onChange, 60 * 1000);
  return () => clearInterval(interval);
}

// The browser locale doesn't change during a visit, so there's nothing to subscribe to
function subscribeToNothing() {
  return () => {};
}

function detectUserCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "USD";

  try {
    const locale = navigator.language || "en-US";
    const country = locale.split("-")[1]?.toUpperCase();

    switch (country) {
      // Gulf States
      case "SA":
        return "SAR";
      case "AE":
        return "AED";
      case "QA":
        return "QAR";
      case "KW":
        return "KWD";

      // Major Muslim Countries
      case "EG":
        return "EGP";
      case "TR":
        return "TRY";
      case "PK":
        return "PKR";
      case "BD":
        return "BDT";

      // ASEAN
      case "MY":
        return "MYR";
      case "ID":
        return "IDR";
      case "IN":
        return "INR";

      // Europe
      case "GB":
        return "GBP";
      case "DE":
      case "FR":
      case "IT":
      case "ES":
      case "NL":
      case "AT":
      case "BE":
        return "EUR";

      // Others
      case "CA":
        return "CAD";
      case "AU":
        return "AUD";
      case "ZA":
        return "ZAR";
      case "JO":
        return "JOD";
      case "MA":
        return "MAD";
      case "NG":
        return "NGN";

      default:
        return "USD";
    }
  } catch {
    return "USD";
  }
}

async function fetchExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const url = `${baseUrl}/api/exchange-rates`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.success && data.rates) {
      return data.rates;
    }

    throw new Error("Failed to fetch exchange rates from backend");
  } catch (error) {
    console.error(error);
    return null;
  }
}

interface CurrencyDateContextType {
  // The currency the visitor picked, or the one detected from their locale
  currency: Currency;
  setCurrency: (currency: CurrencyCode) => void;
  // The currency amounts are actually shown in: the selected one once its exchange
  // rate has loaded, USD until then or if the rate is unavailable
  displayCurrency: Currency;
  // Converts a USD amount into displayCurrency
  convertFromUSD: (amount: number) => number;
  // True when rates failed to load, so a non-USD selection is being shown in USD
  ratesUnavailable: boolean;
  hijriDate: string;
  gregorianDate: string;
}

const CurrencyDateContext = createContext<CurrencyDateContextType | undefined>(
  undefined
);

export function CurrencyDateProvider({ children }: { children: ReactNode }) {
  const [selectedCode, setSelectedCode] = useState<CurrencyCode | null>(null);
  const detectedCode = useSyncExternalStore<CurrencyCode>(
    subscribeToNothing,
    detectUserCurrency,
    () => "USD"
  );
  const currencyCode = selectedCode ?? detectedCode;

  const hijriDate = useSyncExternalStore(
    subscribeToClock,
    getHijriDate,
    () => ""
  );
  const gregorianDate = useSyncExternalStore(
    subscribeToClock,
    getGregorianDate,
    () => ""
  );

  const [exchangeRates, setExchangeRates] = useState<Record<
    string,
    number
  > | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  useEffect(() => {
    async function loadExchangeRates() {
      const rates = await fetchExchangeRates();
      // Keep the rates we already have if a later refresh fails
      if (rates) setExchangeRates(rates);
      setIsLoadingRates(false);
    }

    loadExchangeRates();

    // Update rates every 24 hours
    const interval = setInterval(loadExchangeRates, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const rate = currencyCode === "USD" ? 1 : exchangeRates?.[currencyCode];

  const value: CurrencyDateContextType = {
    currency: currencies[currencyCode],
    setCurrency: setSelectedCode,
    displayCurrency: rate ? currencies[currencyCode] : currencies.USD,
    convertFromUSD: (amount) => amount * (rate ?? 1),
    ratesUnavailable: !rate && !isLoadingRates,
    hijriDate,
    gregorianDate,
  };

  return (
    <CurrencyDateContext.Provider value={value}>
      {children}
    </CurrencyDateContext.Provider>
  );
}

export function useCurrencyDate() {
  const context = useContext(CurrencyDateContext);
  if (context === undefined) {
    throw new Error(
      "useCurrencyDate must be used within a CurrencyDateProvider"
    );
  }
  return context;
}
