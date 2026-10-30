"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CurrencyDateProvider } from "@/contexts/CurrencyDateContext";
import { getCountry } from "@/lib/countries";

/**
 * The header, footer, analytics and currency context around every page, except the
 * widgets other sites put in an iframe. Those render bare, so a mosque's page views
 * don't count as our visitors or fetch exchange rates on every load.
 */
export function SiteChrome({
  header,
  footer,
  analytics,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  analytics: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Only real widgets: a mistyped /embed/... URL gets the normal 404 with navigation
  const isWidget =
    pathname.startsWith("/embed/") &&
    getCountry(pathname.slice("/embed/".length)) !== undefined;
  if (isWidget) return children;

  return (
    <CurrencyDateProvider>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
        {header}
        {children}
        {footer}
      </div>
      {analytics}
    </CurrencyDateProvider>
  );
}
