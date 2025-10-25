"use client"

import { Input } from "@/components/ui/shadcn/input"
import { Label } from "@/components/ui/shadcn/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card"

export interface WealthData {
  cash: string
  goldWeight: string
  silverWeight: string
  investments: string
  businessAssets: string
}

interface WealthInputFormProps {
  wealthData: WealthData
  onInputChange: (field: keyof WealthData, value: string) => void
  goldPricePerGram: number
  silverPricePerGram: number
  formatCurrency: (amount: number) => string
  totalAssets: number
}

export function WealthInputForm({
  wealthData,
  onInputChange,
  goldPricePerGram,
  silverPricePerGram,
  formatCurrency,
  totalAssets,
}: WealthInputFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-emerald-700">What You Own</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="cash">Cash & Bank Accounts</Label>
            <Input
              id="cash"
              placeholder="0.00"
              value={wealthData.cash}
              onChange={(e) => onInputChange("cash", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investments">Investments & Shares</Label>
            <Input
              id="investments"
              placeholder="0.00"
              value={wealthData.investments}
              onChange={(e) => onInputChange("investments", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goldWeight">Gold (grams)</Label>
            <Input
              id="goldWeight"
              placeholder="0.00"
              value={wealthData.goldWeight}
              onChange={(e) => onInputChange("goldWeight", e.target.value)}
            />
            {wealthData.goldWeight && (
              <p className="text-xs text-stone-500 mt-1">
                ≈{" "}
                {formatCurrency(
                  parseFloat(wealthData.goldWeight) * goldPricePerGram
                )}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="silverWeight">Silver (grams)</Label>
            <Input
              id="silverWeight"
              placeholder="0.00"
              value={wealthData.silverWeight}
              onChange={(e) => onInputChange("silverWeight", e.target.value)}
            />
            {wealthData.silverWeight && (
              <p className="text-xs text-stone-500 mt-1">
                ≈{" "}
                {formatCurrency(
                  parseFloat(wealthData.silverWeight) * silverPricePerGram
                )}
              </p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="businessAssets">Business Assets & Inventory</Label>
            <Input
              id="businessAssets"
              placeholder="0.00"
              value={wealthData.businessAssets}
              onChange={(e) => onInputChange("businessAssets", e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-stone-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-stone-700">Total Assets:</span>
            <span className="text-lg font-semibold text-emerald-600">
              {formatCurrency(totalAssets)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
