"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card"
import type { NisabType } from "./NisabThresholdSelector"
import { ZakatReminderCard } from "./ZakatReminderCard"

export interface CalculationResults {
  totalAssets: number
  totalDebts: number
  netWealth: number
  nisabThreshold: number
  zakatDue: number
  isEligible: boolean
  nisabType: NisabType
}

interface ZakatResultsDisplayProps {
  results: CalculationResults | null
  formatCurrency: (amount: number) => string
}

export function ZakatResultsDisplay({
  results,
  formatCurrency,
}: ZakatResultsDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-stone-800">
          Zakat Calculation Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results ? (
          <div className="space-y-6">
            {/* Eligibility Status */}
            <div
              className={`p-4 rounded-lg border-2 ${
                results.isEligible
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    results.isEligible ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {results.isEligible
                    ? "Zakat is Due"
                    : "Below Nisab Threshold"}
                </div>
                <div
                  className={`text-4xl font-bold mt-2 ${
                    results.isEligible ? "text-emerald-800" : "text-amber-600"
                  }`}
                >
                  {formatCurrency(results.zakatDue)}
                </div>
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold text-stone-800">
                Calculation Breakdown:
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Assets:</span>
                  <span className="font-medium">
                    {formatCurrency(results.totalAssets)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Less: Total Debts:</span>
                  <span className="font-medium">
                    -{formatCurrency(results.totalDebts)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Net Wealth:</span>
                  <span className="font-semibold">
                    {formatCurrency(results.netWealth)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Nisab Threshold ({results.nisabType}):</span>
                  <span className="font-medium">
                    {formatCurrency(results.nisabThreshold)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Zakat Due (2.5%):</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(results.zakatDue)}
                  </span>
                </div>
              </div>
            </div>

            {/* Important Reminder */}
            <ZakatReminderCard />
          </div>
        ) : (
          <div className="text-center text-stone-500 py-8">
            <div className="text-4xl mb-4">🧮</div>
            <p>Enter your wealth information to calculate Zakat</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
