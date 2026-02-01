import { ZakatCalculator } from "@/components/calculator/ZakatCalculator";

export default function CalculatorPage() {
  return (
    <div>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="text-lg">🧮</span>
            <span>Free Zakat Calculator</span>
          </div>
          <h1 className="text-4xl font-bold text-stone-900 mb-4 tracking-tight">
            Calculate Your Zakat
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Use our accurate calculator to determine your Zakat obligations
            based on current Nisab values
          </p>
        </div>

        <ZakatCalculator />
      </main>
    </div>
  );
}
