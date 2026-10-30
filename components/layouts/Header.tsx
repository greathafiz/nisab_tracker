"use client";
import React, { useState } from "react";
import { Badge } from "../ui/shadcn/badge";
import { useCurrencyDate } from "../../contexts/CurrencyDateContext";
import { currencies, type CurrencyCode } from "@/lib/currencies";
import Link from "next/link";
import Image from "next/image";
import { trackEvent } from "@/lib/analytics";

const CurrencySelector = ({ className = "" }: { className?: string }) => {
  const { currency, setCurrency } = useCurrencyDate();

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value as CurrencyCode;
    setCurrency(code);
    trackEvent({
      name: "currency_change",
      params: { selected_currency: code },
    });
  };

  return (
    <select
      value={currency.code}
      onChange={handleCurrencyChange}
      aria-label="Currency"
      className={`text-sm text-stone-700 bg-white border border-stone-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${className}`}
    >
      {Object.values(currencies).map((curr) => (
        <option key={curr.code} value={curr.code}>
          {curr.code} ({curr.symbol})
        </option>
      ))}
    </select>
  );
};

export const Header = () => {
  const { hijriDate, gregorianDate } = useCurrencyDate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo-512.png"
                alt="Nisab Tracker"
                width={40}
                height={40}
                priority
              />
              <div>
                {/* Not a heading: each page has its own h1 */}
                <div className="text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
                  Nisab Tracker
                </div>
                <p className="text-xs text-stone-500 font-medium tracking-wide hidden md:block">
                  ISLAMIC FINANCIAL CALCULATOR
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-5 lg:space-x-8">
              <nav className="flex items-center space-x-5 lg:space-x-6">
                <Link
                  href="/zakat-calculator"
                  className="whitespace-nowrap text-stone-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                >
                  Zakat Calculator
                </Link>
                <Link
                  href="/nisab"
                  className="whitespace-nowrap text-stone-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                >
                  Nisab by Country
                </Link>
                <Link
                  href="/blog"
                  className="whitespace-nowrap text-stone-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                >
                  Blog
                </Link>
              </nav>

              <div className="w-px h-5 bg-stone-200" />

              <div className="flex items-center space-x-4">
                {/* Only where it fits on one line next to the three links */}
                <div className="hidden xl:flex items-center space-x-2 text-sm whitespace-nowrap">
                  <Badge
                    variant="outline"
                    className="text-stone-600 border-stone-300"
                  >
                    {hijriDate}
                  </Badge>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-600">{gregorianDate}</span>
                </div>

                <CurrencySelector />
              </div>
            </div>

            {/* Mobile: Currency + Hamburger */}
            <div className="flex md:hidden items-center space-x-3">
              <CurrencySelector className="text-xs px-2 py-1.5" />

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white">
            <div className="px-4 py-4 space-y-1">
              <Link
                href="/zakat-calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-3 rounded-lg text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                Zakat Calculator
              </Link>
              <Link
                href="/nisab"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-3 rounded-lg text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                Nisab by Country
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-3 rounded-lg text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-sm transition-colors"
              >
                Blog
              </Link>

              <div className="flex items-center space-x-2 px-3 py-3 text-sm text-stone-500">
                <Badge
                  variant="outline"
                  className="text-stone-500 border-stone-300 text-xs"
                >
                  {hijriDate}
                </Badge>
                <span>•</span>
                <span>{gregorianDate}</span>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
