import React from "react"
import { Separator } from "./shadcn/separator"
import Link from "next/link"

export const Footer = () => {
  return (
    <footer className="border-t border-stone-200 bg-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Brand */}
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ن</span>
              </div>
              <span className="font-bold text-stone-900">Nisab Tracker</span>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">
              Helping Muslims worldwide fulfill their Zakat obligations with
              accurate, real-time Islamic financial data.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Learn More</h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li>
                <Link
                  href="#understanding-nisab"
                  className="hover:text-emerald-600 transition-colors"
                >
                  Understanding Nisab
                </Link>
              </li>
              <li>
                <Link
                  href="/calculator"
                  className="hover:text-emerald-600 transition-colors"
                >
                  Calculate Your Zakat
                </Link>
              </li>
              <li>
                <Link
                  href="#data-sources"
                  className="hover:text-emerald-600 transition-colors"
                >
                  Data Sources
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="hover:text-emerald-600 transition-colors"
                >
                  Contact & Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Updates */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Features</h4>
            <div className="text-sm text-stone-600 space-y-2">
              <p>📈 Daily price updates</p>
              <p>🌙 Hijri calendar integrated</p>
              <p>🔒 Privacy-first approach</p>
              <p>🌍 20+ currencies supported</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-stone-500 text-sm">
          <p>
            Built with love for the Muslim community • May Allah accept our
            efforts
          </p>
          <p className="mt-2 text-xs">
            © {new Date().getFullYear()} Nisab Tracker. Free forever.
          </p>
        </div>
      </div>
    </footer>
  )
}
