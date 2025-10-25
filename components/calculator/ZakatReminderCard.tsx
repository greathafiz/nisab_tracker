"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card"
import { Button } from "@/components/ui/shadcn/button"
import { Input } from "@/components/ui/shadcn/input"

export function ZakatReminderCard() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Submit to Google Sheets via Google Forms or Apps Script Web App
      // For now, we'll use a placeholder endpoint
      const response = await fetch("/api/zakat-reminder-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, timestamp: new Date().toISOString() }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit")
      }

      setIsSubmitted(true)
      setEmail("")
    } catch (err) {
      console.error("Submission error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <h4 className="font-semibold text-stone-900 mb-1">
                Thank you for your interest!
              </h4>
              <p className="text-sm text-stone-600">
                We&apos;ll email you once the Zakat reminder feature goes live.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-stone-800 flex items-center gap-2">
          📅 Important Reminder:
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-blue-900 mb-4">
          Zakat is due annually after holding this wealth for one full lunar
          year (Hawl). Would you like us to notify you when it&apos;s time to
          pay your Zakat?
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full"
              required
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="sm"
          >
            {isSubmitting ? "Submitting..." : "Notify me when it's ready"}
          </Button>

          <p className="text-xs text-stone-500 text-center">
            We&apos;re building this feature based on user interest. Your email
            will only be used to notify you once.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
