import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card"
import { Badge } from "@/components/ui/shadcn/badge"

interface NisabCardProps {
  title: string
  value: string
  currency: string
  description?: string
  lastUpdated?: string
  isLoading?: boolean
  featured?: boolean
  change?: string
  icon?: string
}

export function NisabCard({
  title,
  value,
  currency,
  description,
  lastUpdated,
  isLoading = false,
  featured = false,
  change,
  icon,
}: NisabCardProps) {
  const isPositive = change?.startsWith("+")

  return (
    <Card
      className={`
      transition-all duration-300 hover:shadow-xl hover:-translate-y-1 
      ${
        featured
          ? "border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 ring-1 ring-emerald-100"
          : "border-stone-200 bg-white hover:border-stone-300"
      }
    `}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div
                className={`
                w-12 h-12 rounded-xl flex items-center justify-center text-xl
                ${featured ? "bg-emerald-100" : "bg-stone-100"}
              `}
              >
                {icon}
              </div>
            )}
            <div>
              <CardTitle
                className={`
                text-lg font-semibold mb-1
                ${featured ? "text-emerald-900" : "text-stone-800"}
              `}
              >
                {title}
              </CardTitle>
              {description && (
                <p className="text-stone-600 text-sm font-medium">
                  {description}
                </p>
              )}
            </div>
          </div>
          {change && (
            <Badge
              className={`
                ${
                  isPositive
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }
              `}
            >
              {change}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-stone-200 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-stone-100 rounded w-2/6"></div>
          </div>
        ) : (
          <>
            <div
              className={`
              font-bold mb-2 tracking-tight
              ${
                featured
                  ? "text-4xl text-emerald-900"
                  : "text-3xl text-stone-900"
              }
            `}
            >
              <span className="text-lg font-medium opacity-70">{currency}</span>{" "}
              <span>{value}</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center space-x-2 text-xs text-stone-500">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Updated {lastUpdated}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
