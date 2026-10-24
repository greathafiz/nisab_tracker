"use client";
import { useCurrencyDate } from "@/contexts/CurrencyDateContext";
import {
  NISAB_STANDARDS,
  STANDARDS_EXPLAINER,
  type NisabStandardId,
} from "@/lib/nisab-standards";
import { cn } from "@/lib/utils";

export function NisabStandardToggle({ className }: { className?: string }) {
  const { nisabStandard, setNisabStandard } = useCurrencyDate();

  return (
    <div className={cn("text-sm", className)}>
      <div
        role="radiogroup"
        aria-label="Nisab weight standard"
        className="inline-flex flex-wrap justify-center gap-1 rounded-xl bg-stone-100 p-1"
      >
        {(Object.keys(NISAB_STANDARDS) as NisabStandardId[]).map((id) => {
          const standard = NISAB_STANDARDS[id];
          const selected = id === nisabStandard;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setNisabStandard(id)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 transition-all",
                selected
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              <span className="font-medium">{standard.label}</span>
              <span className="hidden sm:inline text-stone-500">
                {" "}
                · {standard.description}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-stone-500 max-w-xl mx-auto">
        {STANDARDS_EXPLAINER}
      </p>
    </div>
  );
}
