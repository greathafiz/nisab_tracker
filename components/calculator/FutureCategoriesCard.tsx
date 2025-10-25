"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card"

export function FutureCategoriesCard() {
  return (
    <Card className="border-dashed border-2 border-stone-300 bg-stone-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-stone-600 flex items-center gap-2">
          🚀 Coming Soon
        </CardTitle>
        <p className="text-sm text-stone-500">
          Additional Zakat categories we&apos;re working on
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-white border border-stone-200 opacity-75">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🌾</span>
              <span className="font-medium text-stone-700">
                Agricultural Produce
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Crops, fruits, and agricultural yields
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white border border-stone-200 opacity-75">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🐄</span>
              <span className="font-medium text-stone-700">Livestock</span>
            </div>
            <p className="text-xs text-stone-500">
              Cattle, sheep, goats, and camels
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
