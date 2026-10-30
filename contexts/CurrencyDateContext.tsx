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
 * - Auto-detection from the visitor's country (IP geolocation), USD otherwise
 * - Exchange rate management (updated every 24h)
 * - Hijri & Gregorian date display
 * - USD -> Target currency conversion utilities
 *
 * All metal prices are fetched in USD, then converted client-side
 * using cached exchange rates from exchangerate-api.com
 */

import {
  COUNTRY_COOKIE,
  currencies,
  currencyForCountry,
  type Currency,
  type CurrencyCode,
} from "@/lib/currencies";
import {
  NISAB_STANDARDS,
  defaultStandardFor,
  type NisabStandardId,
} from "@/lib/nisab-standards";

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

// The country cookie doesn't change during a visit, so there's nothing to subscribe to
function subscribeToNothing() {
  return () => {};
}

// The visitor's country comes from their IP (see proxy.ts), not the browser
// locale, which is often en-GB or en-US wherever they actually live
function detectUserCurrency(): CurrencyCode {
  const country = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${COUNTRY_COOKIE}=`))
    ?.slice(COUNTRY_COOKIE.length + 1);
  return currencyForCountry(country);
}

// The visitor's chosen Nisab standard, remembered in localStorage across visits
const STANDARD_STORAGE_KEY = "nisabStandard";
const standardListeners = new Set<() => void>();
// Fallback for when storage is blocked (e.g. some private modes): lasts for this visit
let memoryStandard: NisabStandardId | null = null;

function readStoredStandard(): NisabStandardId | null {
  try {
    const value = localStorage.getItem(STANDARD_STORAGE_KEY);
    return value && value in NISAB_STANDARDS
      ? (value as NisabStandardId)
      : memoryStandard;
  } catch {
    return memoryStandard;
  }
}

function storeStandard(standard: NisabStandardId) {
  memoryStandard = standard;
  try {
    localStorage.setItem(STANDARD_STORAGE_KEY, standard);
  } catch {
    // Storage blocked: memoryStandard keeps the choice for this visit
  }
  standardListeners.forEach((listener) => listener());
}

function subscribeToStandard(onChange: () => void) {
  standardListeners.add(onChange);
  // Keep other tabs in sync
  window.addEventListener("storage", onChange);
  return () => {
    standardListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
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
  // The currency the visitor picked, or the one detected from their country
  currency: Currency;
  setCurrency: (currency: CurrencyCode) => void;
  // The currency amounts are actually shown in: the selected one once its exchange
  // rate has loaded, USD until then or if the rate is unavailable
  displayCurrency: Currency;
  // Converts a USD amount into displayCurrency
  convertFromUSD: (amount: number) => number;
  // True when rates failed to load, so a non-USD selection is being shown in USD
  ratesUnavailable: boolean;
  // Gram weights for the Nisab: the visitor's choice, or the norm for their currency
  nisabStandard: NisabStandardId;
  setNisabStandard: (standard: NisabStandardId) => void;
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

  const selectedStandard = useSyncExternalStore(
    subscribeToStandard,
    readStoredStandard,
    () => null
  );
  const nisabStandard = selectedStandard ?? defaultStandardFor(currencyCode);

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
    nisabStandard,
    setNisabStandard: storeStandard,
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
