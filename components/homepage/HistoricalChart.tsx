"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card"
import { Button } from "@/components/ui/shadcn/button"
import { Badge } from "@/components/ui/shadcn/badge"
import { useState, useEffect } from "react"
import { useCurrencyDate } from "@/contexts/CurrencyDateContext"

interface HistoricalChartProps {
  currency: string
}

interface ChartDataPoint {
  date: string
  goldNisab: number
  silverNisab: number
}

export function HistoricalChart({ currency }: HistoricalChartProps) {
  const { exchangeRates, isLoadingRates } = useCurrencyDate()
  const [timeframe, setTimeframe] = useState<"7d" | "30d">("7d")
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoadingRates) return

    async function fetchHistoricalData() {
      try {
        setIsLoading(true)
        setError(null)

        const exchangeRate =
          currency === "USD" ? 1 : exchangeRates?.[currency] ?? 1

        const response = await fetch(
          `/api/historical?timeframe=${timeframe}&currency=${currency}&rate=${exchangeRate}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch historical data")
        }

        const result = await response.json()
        setData(result.data || [])
      } catch (err) {
        console.error("Error fetching historical data:", err)
        setError("Failed to load chart data")
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistoricalData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, currency, isLoadingRates]) // ✅ Removed exchangeRates from deps

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; color: string }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-stone-200 rounded-lg shadow-lg">
          <p className="font-medium text-stone-900 mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {currency} {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-stone-200 bg-white shadow-sm">
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-stone-900 mb-2 flex items-center gap-2">
              📈 Nisab History
            </CardTitle>
          </div>
          <div className="flex bg-stone-100 rounded-xl p-1 gap-1 w-fit">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe("7d")}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                timeframe === "7d"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              Last 7 days
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe("30d")}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                timeframe === "30d"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              Last 30 days
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="h-64 sm:h-80 w-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-stone-600">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-64 sm:h-80 w-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">{error}</p>
              <p className="text-sm text-stone-600">
                Chart data temporarily unavailable
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-64 sm:h-80 w-full mb-4 sm:mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#78716c"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#78716c"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      `${currency} ${value.toLocaleString()}`
                    }
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontSize: "14px",
                      color: "#78716c",
                      paddingTop: "20px",
                    }}
                    iconType="line"
                  />
                  <Area
                    type="monotone"
                    dataKey="goldNisab"
                    stroke="#f59e0b"
                    fill="#fde68a"
                    strokeWidth={3}
                    name="Gold Nisab"
                    activeDot={{
                      r: 7,
                      stroke: "#f59e0b",
                      strokeWidth: 2,
                      fill: "#fbbf24",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="silverNisab"
                    stroke="#6b7280"
                    fill="#e5e7eb"
                    strokeWidth={3}
                    name="Silver Nisab"
                    activeDot={{
                      r: 7,
                      stroke: "#6b7280",
                      strokeWidth: 2,
                      fill: "#9ca3af",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold text-stone-900 text-sm">
                      Data Source:
                    </span>
                    <Badge variant="outline" className="text-xs">
                      MetalPriceAPI
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-600">
                    Based on international spot prices from trusted precious
                    metals data providers
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
