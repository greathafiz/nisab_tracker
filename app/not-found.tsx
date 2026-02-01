import Link from "next/link";
import { Button } from "@/components/ui/shadcn/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-8xl md:text-9xl font-bold text-emerald-600 mb-4">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">
          Page Not Found
        </h2>

        <p className="text-stone-600 text-lg mb-8 leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The
          page might have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 hover:cursor-pointer text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              🏠 Go to Homepage
            </Button>
          </Link>

          <Link href="/zakat-calculator">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:cursor-pointer px-8 py-6 text-lg font-medium transition-all duration-200"
            >
              🧮 Calculate Zakat
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200">
          <p className="text-stone-500 text-sm mb-4">
            You might be looking for:
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/"
              className="text-emerald-600 hover:text-emerald-700 hover:underline text-sm font-medium"
            >
              Nisab Tracker
            </Link>
            <span className="text-stone-300">•</span>
            <Link
              href="/zakat-calculator"
              className="text-emerald-600 hover:text-emerald-700 hover:underline text-sm font-medium"
            >
              Zakat Calculator
            </Link>
            <span className="text-stone-300">•</span>
            <Link
              href="/#about"
              className="text-emerald-600 hover:text-emerald-700 hover:underline text-sm font-medium"
            >
              About Nisab
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
