import type { CurrencyCode } from "./currencies";

export interface Country {
  slug: string;
  name: string;
  // How the country reads mid-sentence ("Nisab in the UK"); defaults to name
  inName?: string;
  currency: CurrencyCode;
  // Gold and silver are commonly priced per tola here
  usesTola?: boolean;
}

export const TOLA_GRAMS = 11.6638;

export const COUNTRIES: Country[] = [
  { slug: "australia", name: "Australia", currency: "AUD" },
  { slug: "bangladesh", name: "Bangladesh", currency: "BDT", usesTola: true },
  { slug: "canada", name: "Canada", currency: "CAD" },
  { slug: "egypt", name: "Egypt", currency: "EGP" },
  { slug: "europe", name: "Europe (Euro)", inName: "Europe", currency: "EUR" },
  { slug: "india", name: "India", currency: "INR", usesTola: true },
  { slug: "indonesia", name: "Indonesia", currency: "IDR" },
  { slug: "jordan", name: "Jordan", currency: "JOD" },
  { slug: "kuwait", name: "Kuwait", currency: "KWD" },
  { slug: "malaysia", name: "Malaysia", currency: "MYR" },
  { slug: "morocco", name: "Morocco", currency: "MAD" },
  { slug: "nigeria", name: "Nigeria", currency: "NGN" },
  { slug: "pakistan", name: "Pakistan", currency: "PKR", usesTola: true },
  { slug: "qatar", name: "Qatar", currency: "QAR" },
  { slug: "saudi-arabia", name: "Saudi Arabia", currency: "SAR" },
  { slug: "south-africa", name: "South Africa", currency: "ZAR" },
  { slug: "turkey", name: "Turkey", currency: "TRY" },
  { slug: "uae", name: "UAE", inName: "the UAE", currency: "AED" },
  { slug: "uk", name: "United Kingdom", inName: "the UK", currency: "GBP" },
  { slug: "usa", name: "United States", inName: "the US", currency: "USD" },
];

export function getCountry(slug: string): Country | undefined {
  return COUNTRIES.find((country) => country.slug === slug);
}

export function countryInName(country: Country): string {
  return country.inName ?? country.name;
}
