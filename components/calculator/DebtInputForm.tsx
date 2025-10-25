"use client"

import { Input } from "@/components/ui/shadcn/input"
import { Label } from "@/components/ui/shadcn/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card"

interface DebtInputFormProps {
  debts: string
  onDebtChange: (value: string) => void
  totalDebts: number
  formatCurrency: (amount: number) => string
}

export function DebtInputForm({
  debts,
  onDebtChange,
  totalDebts,
  formatCurrency,
}: DebtInputFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-red-700">What You Owe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="debts">Outstanding Debts & Loans</Label>
          <Input
            id="debts"
            placeholder="0.00"
            value={debts}
            onChange={(e) => onDebtChange(e.target.value)}
          />
          <p className="text-xs text-stone-500">
            Include credit cards, loans, and immediate obligations
          </p>
        </div>

        <div className="pt-2 border-t border-stone-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-stone-700">Total Debts:</span>
            <span className="text-lg font-semibold text-red-600">
              {formatCurrency(totalDebts)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
