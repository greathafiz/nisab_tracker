"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { COUNTRIES, getCountry, countryInName } from "@/lib/countries";
import { SITE_URL } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";

// Fits the widget for every currency down to 250px wide, where its footer wraps
// onto two lines; any shorter and the iframe shows a scrollbar
const WIDGET_HEIGHT = 200;

/**
 * The iframe plus a plain link under it. Search engines don't credit links inside an
 * iframe to the page around it, so the plain link is what makes it a backlink.
 */
function embedCode(slug: string): string {
  const country = getCountry(slug)!;
  const inName = countryInName(country);
  return [
    `<iframe src="${SITE_URL}/embed/${slug}" title="Today's Nisab in ${inName}" height="${WIDGET_HEIGHT}" style="width:100%;max-width:400px;border:0" loading="lazy"></iframe>`,
    `<p style="font-size:12px;margin:4px 0 0">Nisab figures from <a href="${SITE_URL}/nisab/${slug}">Nisab Tracker</a></p>`,
  ].join("\n");
}

export function EmbedCodeGenerator({ initialSlug }: { initialSlug: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const [copied, setCopied] = useState(false);
  const code = embedCode(slug);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent({ name: "embed_code_copy", params: { item_id: slug } });
    } catch {
      // Clipboard blocked; the code can still be selected by hand
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-stone-700 mb-1">
            Country
          </span>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900"
          >
            {COUNTRIES.map((country) => (
              <option key={country.slug} value={country.slug}>
                {country.name}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="block text-sm font-medium text-stone-700 mb-1">
            Code to paste into your website
          </span>
          <textarea
            readOnly
            value={code}
            rows={7}
            onFocus={(e) => e.target.select()}
            className="w-full rounded-lg border border-stone-300 bg-stone-50 p-3 font-mono text-xs text-stone-800"
          />
          <button
            type="button"
            onClick={copyCode}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 cursor-pointer"
          >
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-stone-700 mb-1">
          Preview
        </span>
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-4">
          {/* A relative src, so the preview also works before a deploy */}
          <iframe
            src={`/embed/${slug}`}
            title={`Today's Nisab in ${countryInName(getCountry(slug)!)}`}
            height={WIDGET_HEIGHT}
            className="w-full max-w-[400px] border-0"
          />
          <p className="mt-1 text-xs text-stone-600">
            Nisab figures from{" "}
            <span className="text-emerald-700 underline">Nisab Tracker</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Country pages link to /embed?country=<slug> so the visitor's country is preselected
export function EmbedCodeGeneratorFromUrl({
  fallbackSlug,
}: {
  fallbackSlug: string;
}) {
  const requested = useSearchParams().get("country");
  return (
    <EmbedCodeGenerator
      initialSlug={
        requested && getCountry(requested) ? requested : fallbackSlug
      }
    />
  );
}
