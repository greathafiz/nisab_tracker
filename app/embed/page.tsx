import type { Metadata } from "next";
import { Suspense } from "react";
import { OG_IMAGE } from "@/lib/site";
import { COUNTRIES } from "@/lib/countries";
import { NISAB_STANDARDS, defaultStandardFor } from "@/lib/nisab-standards";
import {
  EmbedCodeGenerator,
  EmbedCodeGeneratorFromUrl,
} from "@/components/embed/EmbedCodeGenerator";

const title = "Free Nisab Widget for Your Website";
const { majority, hanafi } = NISAB_STANDARDS;
const hanafiCountries = new Intl.ListFormat("en-GB", {
  type: "conjunction",
}).format(
  COUNTRIES.filter(
    (country) => defaultStandardFor(country.currency) === "hanafi"
  ).map((country) => country.name)
);
const description = `Show today's silver and gold Nisab on your mosque, Islamic society or school website. Free, updated daily, in ${COUNTRIES.length} currencies. Just copy and paste.`;

export const metadata: Metadata = {
  title: `${title} | Nisab Tracker`,
  description,
  alternates: { canonical: "/embed" },
  openGraph: {
    title,
    description,
    url: "/embed",
    siteName: "Nisab Tracker",
    images: [OG_IMAGE],
    locale: "en_US",
    type: "website",
  },
};

export default function EmbedInstructionsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4 tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Show your community today&apos;s silver and gold Nisab, always
          current. Free, no sign-up, and it updates itself every day.
        </p>
      </div>

      {/* The query string is only known in the browser; until then, show the default */}
      <Suspense fallback={<EmbedCodeGenerator initialSlug="uk" />}>
        <EmbedCodeGeneratorFromUrl fallbackSlug="uk" />
      </Suspense>

      <section className="mt-16 space-y-6 text-stone-700">
        <h2 className="text-2xl font-bold text-stone-900">How to add it</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Choose your country above and copy the code.</li>
          <li>
            Paste it where you want the widget to appear. On WordPress, add a
            &quot;Custom HTML&quot; block; on Squarespace or Wix, an
            &quot;Embed&quot; or &quot;Code&quot; block.
          </li>
          <li>
            That&apos;s it. The figures update daily with gold and silver
            prices.
          </li>
        </ol>
        <p className="text-sm text-stone-500">
          The widget uses {majority.goldGrams} g of gold and{" "}
          {majority.silverGrams} g of silver ({majority.description}), or{" "}
          {hanafi.goldGrams} g and {hanafi.silverGrams} g in {hanafiCountries},
          at international spot prices.
        </p>
      </section>
    </main>
  );
}
