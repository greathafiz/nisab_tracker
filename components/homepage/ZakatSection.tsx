import React from "react"
import { Button } from "../ui/shadcn/button"
import Link from "next/link"

export const ZakatSection = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-12 text-center text-white relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-3xl font-bold mb-4">Calculate Your Zakat</h3>
        <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
          Use our free, accurate calculator to determine your Zakat obligations
          based on current Nisab values
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/calculator">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 transition-all duration-200 px-8 py-4 text-lg font-semibold shadow-lg"
            >
              🧮 Calculate Zakat
            </Button>
          </Link>

          <a
            href="https://www.investopedia.com/terms/z/zakat.asp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white/80 text-white bg-white/10 hover:bg-white hover:text-emerald-700 px-8 py-4 text-lg font-medium transition-all duration-200 backdrop-blur-sm"
            >
              📚 Learn About Zakat
            </Button>
          </a>
        </div>
        <p className="text-emerald-200 text-sm mt-6">
          ✓ Free forever ✓ Privacy focused
          {/* ✓ Scholarly approved */}
        </p>
      </div>
    </div>
  )
}
