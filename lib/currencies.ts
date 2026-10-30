// Shared by server and client code (the currency context is client-only)

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

// Set by proxy.ts to the visitor's ISO country code, e.g. "NG"
export const COUNTRY_COOKIE = "country";

// Countries using the Euro (eurozone members plus states that adopted it)
const EURO_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES",
  "AD",
  "MC",
  "SM",
  "VA",
  "ME",
  "XK",
];

const COUNTRY_CURRENCIES: Record<string, CurrencyCode> = {
  US: "USD",
  GB: "GBP",
  NG: "NGN",
  SA: "SAR",
  AE: "AED",
  QA: "QAR",
  KW: "KWD",
  EG: "EGP",
  TR: "TRY",
  PK: "PKR",
  BD: "BDT",
  MY: "MYR",
  ID: "IDR",
  IN: "INR",
  CA: "CAD",
  AU: "AUD",
  ZA: "ZAR",
  JO: "JOD",
  MA: "MAD",
  ...Object.fromEntries(EURO_COUNTRIES.map((country) => [country, "EUR"])),
};

// The currency for an ISO country code, or USD for countries we don't support
export function currencyForCountry(country: string | undefined): CurrencyCode {
  return (country && COUNTRY_CURRENCIES[country.toUpperCase()]) || "USD";
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Same "NGN 1,425,625.07" style the homepage uses
export function formatMoney(amount: number, code: CurrencyCode): string {
  return `${code} ${formatAmount(amount)}`;
}

// "NGN 1,425,625": whole units, for share text and preview images where decimals are noise
export function formatMoneyRounded(amount: number, code: CurrencyCode): string {
  return `${code} ${Math.round(amount).toLocaleString("en-US")}`;
}
