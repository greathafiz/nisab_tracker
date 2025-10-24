import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { CurrencyDateProvider } from "@/contexts/CurrencyDateContext"
import { Header } from "@/components/ui/Header"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Nisab Tracker",
  description: "Nisab Tracker and Zakat Calculator",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CurrencyDateProvider>
          <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
            <Header />
            {children}
          </div>
        </CurrencyDateProvider>
      </body>
    </html>
  )
}
