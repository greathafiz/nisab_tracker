"use client";

import React from "react";
import { Badge } from "../ui/shadcn/badge";
import { Button } from "../ui/shadcn/button";
import {
  useCurrencyDate,
  currencies,
  type CurrencyCode,
} from "../../contexts/CurrencyDateContext";
import Link from "next/link";

export const Header = () => {
  const { currency, setCurrency, hijriDate, gregorianDate } = useCurrencyDate();

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value as CurrencyCode);
  };

  return (
    <header className="border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">
                  ن
                </span>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
                  Nisab Tracker
                </h1>
                {/* <p className="text-xs text-stone-500 font-medium tracking-wide hidden sm:block">
                  ISLAMIC FINANCIAL CALCULATOR
                </p> */}
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-6">
            <div className="hidden lg:flex items-center space-x-2 text-sm">
              <Badge
                variant="outline"
                className="text-stone-600 border-stone-300"
              >
                {hijriDate}
              </Badge>
              <span className="text-stone-400">•</span>
              <span className="text-stone-600">{gregorianDate}</span>
            </div>
            <select
              value={currency.code}
              onChange={handleCurrencyChange}
              className="text-xs sm:text-sm text-stone-700 bg-white border border-stone-300 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            >
              {Object.values(currencies).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              className="text-stone-700 border-stone-300 hover:bg-stone-50 font-medium px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
