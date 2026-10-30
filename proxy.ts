import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COUNTRY_COOKIE } from "@/lib/currencies";

/**
 * Hands the visitor's country (from Vercel's IP geolocation) to the client in a
 * cookie, so the currency context can pick their currency without making every
 * page dynamic. Locally there's no geo header, so the site falls back to USD.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const country = request.headers.get("x-vercel-ip-country");

  // Only send Set-Cookie when it changes, e.g. on a first visit or after travelling
  if (country && request.cookies.get(COUNTRY_COOKIE)?.value !== country) {
    response.cookies.set(COUNTRY_COOKIE, country, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export const config = {
  // Pages only: skip API routes, Next's assets, files like /logo-192.png and the
  // iframe widgets other sites embed
  matcher: ["/((?!api/|_next/|embed/|.*\\..*).*)"],
};
