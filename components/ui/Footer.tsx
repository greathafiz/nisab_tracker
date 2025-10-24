import React from "react"
import { Separator } from "./shadcn/separator"

export const Footer = () => {
  return (
    <footer className="border-t border-stone-200 bg-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ن</span>
              </div>
              <span className="font-bold text-stone-900">Nisab Tracker</span>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">
              Helping Muslims worldwide fulfill their Zakat obligations with
              accurate, real-time Islamic financial data.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li>What is Nisab?</li>
              <li>Zakat Calculator</li>
              <li>Islamic Calendar</li>
              <li>Historical Data</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Updates</h4>
            <div className="text-sm text-stone-600 space-y-2">
              <p>📈 Data updated every hour</p>
              <p>🌙 Hijri calendar integrated</p>
              <p>🔒 Privacy-first approach</p>
              <p>📱 Mobile optimized</p>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-stone-500 text-sm">
          <p>
            Built with love for the Muslim community • May Allah accept our
            efforts
          </p>
        </div>
      </div>
    </footer>
  )
}
