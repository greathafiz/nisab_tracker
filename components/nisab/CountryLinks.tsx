import Link from "next/link";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface CountryLinksProps {
  exclude?: string;
  className?: string;
}

export function CountryLinks({ exclude, className }: CountryLinksProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {COUNTRIES.filter((country) => country.slug !== exclude).map(
        (country) => (
          <Link
            key={country.slug}
            href={`/nisab/${country.slug}`}
            className="text-sm px-3 py-1.5 rounded-full border border-stone-200 bg-white text-stone-700 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
          >
            {country.name}
          </Link>
        )
      )}
    </div>
  );
}
