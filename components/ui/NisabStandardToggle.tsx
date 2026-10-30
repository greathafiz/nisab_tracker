"use client";
import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrencyDate } from "@/contexts/CurrencyDateContext";
import {
  NISAB_STANDARDS,
  STANDARDS_EXPLAINER,
  type NisabStandardId,
} from "@/lib/nisab-standards";
import { cn } from "@/lib/utils";

export function NisabStandardToggle({ className }: { className?: string }) {
  const { nisabStandard, setNisabStandard } = useCurrencyDate();
  // Unique per instance, in case a page shows the toggle twice
  const name = useId();

  return (
    <div className={cn("text-sm", className)}>
      {/* Native radios, so arrow keys move between the options */}
      <div
        role="radiogroup"
        aria-label="Nisab weight standard"
        className="inline-flex flex-wrap justify-center gap-1 rounded-xl bg-stone-100 p-1"
      >
        {(Object.keys(NISAB_STANDARDS) as NisabStandardId[]).map((id) => {
          const standard = NISAB_STANDARDS[id];
          const selected = id === nisabStandard;
          return (
            <label
              key={id}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-500",
                selected
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              <input
                type="radio"
                name={name}
                value={id}
                checked={selected}
                onChange={() => setNisabStandard(id)}
                className="sr-only"
              />
              <span className="font-medium">{standard.label}</span>
              <span className="hidden sm:inline text-stone-500">
                {" "}
                · {standard.description}
              </span>
            </label>
          );
        })}
      </div>
      {/* Collapsed: most visitors keep the default, and the full explanation is long */}
      <details className="group mt-2 text-xs text-stone-500 max-w-xl mx-auto">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 hover:text-emerald-700 [&::-webkit-details-marker]:hidden">
          Which should I use?
          <ChevronDown
            className="size-3 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <p className="mt-1">{STANDARDS_EXPLAINER}</p>
      </details>
    </div>
  );
}
