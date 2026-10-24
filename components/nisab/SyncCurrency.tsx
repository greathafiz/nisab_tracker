"use client";
import { useEffect } from "react";
import { useCurrencyDate } from "@/contexts/CurrencyDateContext";
import type { CurrencyCode } from "@/lib/currencies";

/**
 * Selects a page's currency in the header, so the rest of the site (e.g. the
 * calculator) carries on in the currency the visitor came to see.
 */
export function SyncCurrency({ code }: { code: CurrencyCode }) {
  const { setCurrency } = useCurrencyDate();

  useEffect(() => {
    setCurrency(code);
  }, [code, setCurrency]);

  return null;
}
