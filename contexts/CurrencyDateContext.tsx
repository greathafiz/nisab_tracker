"use client"
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react"

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
  | "MAD"

export interface Currency {
  code: CurrencyCode
  symbol: string
  name: string
  rate?: number // Exchange rate from USD (updated from API)
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
}

function getHijriDate() {
  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  return formatter.format(new Date())
}

// Auto-detect user's currency based on locale
function detectUserCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "USD"

  try {
    const locale = navigator.language || "en-US"
    const country = locale.split("-")[1]?.toUpperCase()

    switch (country) {
      // Gulf States
      case "SA":
        return "SAR"
      case "AE":
        return "AED"
      case "QA":
        return "QAR"
      case "KW":
        return "KWD"

      // Major Muslim Countries
      case "EG":
        return "EGP"
      case "TR":
        return "TRY"
      case "PK":
        return "PKR"
      case "BD":
        return "BDT"

      // ASEAN
      case "MY":
        return "MYR"
      case "ID":
        return "IDR"
      case "IN":
        return "INR"

      // Europe
      case "GB":
        return "GBP"
      case "DE":
      case "FR":
      case "IT":
      case "ES":
      case "NL":
      case "AT":
      case "BE":
        return "EUR"

      // Others
      case "CA":
        return "CAD"
      case "AU":
        return "AUD"
      case "ZA":
        return "ZAR"
      case "JO":
        return "JOD"
      case "MA":
        return "MAD"
      case "NG":
        return "NGN"

      default:
        return "USD"
    }
  } catch {
    return "USD"
  }
}

async function fetchExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const response = await fetch("/api/exchange-rates")
    const data = await response.json()

    if (data.success && data.rates) {
      return data.rates
    }

    throw new Error("Failed to fetch exchange rates from backend")
  } catch (error) {
    console.warn("Failed to fetch exchange rates:", error)
    return null
  }
}

interface CurrencyDateContextType {
  currency: Currency
  setCurrency: (currency: CurrencyCode) => void
  hijriDate: string
  gregorianDate: string
  refreshDates: () => void
  exchangeRates: Record<string, number> | null
  convertFromUSD: (amount: number, toCurrency?: CurrencyCode) => number
  isLoadingRates: boolean
}

const CurrencyDateContext = createContext<CurrencyDateContextType | undefined>(
  undefined
)

export function CurrencyDateProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
    if (typeof window === "undefined") return "USD"
    return detectUserCurrency()
  })
  const [hijriDate, setHijriDate] = useState<string>("")
  const [gregorianDate, setGregorianDate] = useState<string>("")
  const [exchangeRates, setExchangeRates] = useState<Record<
    string,
    number
  > | null>({})
  const [isLoadingRates, setIsLoadingRates] = useState(true)

  // ✅ Stabilize exchangeRates with useMemo to prevent unnecessary re-renders
  // Using a serialized key to detect actual content changes
  const exchangeRatesKey = exchangeRates ? JSON.stringify(exchangeRates) : null
  const stableExchangeRates = useMemo(
    () => exchangeRates,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exchangeRatesKey]
  )

  useEffect(() => {
    async function loadExchangeRates() {
      setIsLoadingRates(true)
      const rates = await fetchExchangeRates()
      setExchangeRates(rates)

      setIsLoadingRates(false)
    }

    loadExchangeRates()

    // Update rates every 24 hours
    const interval = setInterval(loadExchangeRates, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const convertFromUSD = (
    amount: number,
    toCurrency?: CurrencyCode
  ): number => {
    const targetCurrency = toCurrency || currencyCode
    if (targetCurrency === "USD") return amount

    if (!stableExchangeRates) return amount // Return original if rates not loaded
    const rate = stableExchangeRates[targetCurrency]
    if (!rate) return amount // Return original if no rate available

    return amount * rate
  }

  const refreshDates = () => {
    const now = new Date()
    setHijriDate(getHijriDate())
    setGregorianDate(
      now.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    )
  }

  // Initialize dates
  useEffect(() => {
    refreshDates()

    // Update dates every 24 hours
    const interval = setInterval(refreshDates, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const currency = currencies[currencyCode]

  const value: CurrencyDateContextType = {
    currency,
    setCurrency: setCurrencyCode,
    hijriDate,
    gregorianDate,
    refreshDates,
    exchangeRates: stableExchangeRates,
    convertFromUSD,
    isLoadingRates,
  }

  return (
    <CurrencyDateContext.Provider value={value}>
      {children}
    </CurrencyDateContext.Provider>
  )
}

export function useCurrencyDate() {
  const context = useContext(CurrencyDateContext)
  if (context === undefined) {
    throw new Error(
      "useCurrencyDate must be used within a CurrencyDateProvider"
    )
  }
  return context
}
