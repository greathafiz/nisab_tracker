"use client";

import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";

export interface WealthData {
  cash: string;
  goldWeight: string;
  silverWeight: string;
  investments: string;
  businessAssets: string;
}

// Prices are for pure (24k) gold; a karat-K item is K/24 gold by weight
export const GOLD_KARATS = [24, 22, 21, 18, 14] as const;

export type GoldKarat = (typeof GOLD_KARATS)[number];

interface WealthInputFormProps {
  wealthData: WealthData;
  onInputChange: (field: keyof WealthData, value: string) => void;
  goldKarat: GoldKarat;
  onGoldKaratChange: (karat: GoldKarat) => void;
  // Price per gram of gold at the selected karat
  goldPricePerGram: number;
  silverPricePerGram: number;
  formatCurrency: (amount: number) => string;
  totalAssets: number;
}

export function WealthInputForm({
  wealthData,
  onInputChange,
  goldKarat,
  onGoldKaratChange,
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
            <div className="flex gap-2">
              <Input
                id="goldWeight"
                placeholder="0.00"
                value={wealthData.goldWeight}
                onChange={(e) => onInputChange("goldWeight", e.target.value)}
              />
              <select
                aria-label="Gold purity"
                value={goldKarat}
                onChange={(e) =>
                  onGoldKaratChange(Number(e.target.value) as GoldKarat)
                }
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                {GOLD_KARATS.map((karat) => (
                  <option key={karat} value={karat}>
                    {karat}k
                  </option>
                ))}
              </select>
            </div>
            {wealthData.goldWeight ? (
              <p className="text-xs text-stone-500 mt-1">
                ≈{" "}
                {formatCurrency(
                  parseFloat(wealthData.goldWeight) * goldPricePerGram
                )}
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-1">
                Most jewellery is 18k–22k. Check the stamp if unsure.
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
  );
}
