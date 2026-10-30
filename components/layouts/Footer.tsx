import React from "react";
import { Separator } from "../ui/shadcn/separator";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";
import { Send } from "lucide-react";
import { AUTHOR, SOCIAL } from "@/lib/site";
import { XLogo } from "@/components/ui/XLogo";

const linkClassName = "hover:text-emerald-600 transition-colors";

export const Footer = () => {
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <footer className="border-t border-stone-200 bg-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Brand */}
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <Image src="/logo-192.png" alt="Logo" width={40} height={40} />
              <span className="font-bold text-stone-900">Nisab Tracker</span>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">
              Helping Muslims worldwide fulfill their Zakat obligations with
              accurate, real-time Islamic financial data.
            </p>
            <div className="flex justify-center md:justify-start gap-2 mt-4">
              <a
                href={SOCIAL.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nisab Tracker on Telegram"
                className="flex size-9 items-center justify-center rounded-full border border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
              >
                <Send className="size-4" aria-hidden="true" />
              </a>
              <a
                href={SOCIAL.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nisab Tracker on X"
                className="flex size-9 items-center justify-center rounded-full border border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
              >
                <XLogo />
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Tools</h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li>
                <Link href="/" className={linkClassName}>
                  Today&apos;s Nisab
                </Link>
              </li>
              <li>
                <Link href="/zakat-calculator" className={linkClassName}>
                  Zakat Calculator
                </Link>
              </li>
              <li>
                <Link href="/nisab" className={linkClassName}>
                  Nisab by Country
                </Link>
              </li>
            </ul>
          </div>

          {/* Guides */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Guides</h4>
            <ul className="space-y-2 text-sm text-stone-600">
              {latestPosts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className={linkClassName}>
                    {/* Titles carry SEO suffixes like ": Complete Guide 2026" that are too long here */}
                    {post.title.split(":")[0].replace(/\?.*$/, "?")}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/blog" className={`${linkClassName} font-medium`}>
                  All articles →
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-stone-900 mb-4">Features</h4>
            <div className="text-sm text-stone-600 space-y-2">
              <p>📈 Daily price updates</p>
              <p>🌙 Hijri calendar integrated</p>
              <p>🔒 Privacy-first approach</p>
              <p>🌍 20+ currencies supported</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-stone-500 text-sm">
          <p>
            Built with love for the Muslim community by{" "}
            <a
              href={AUTHOR.url}
              target="_blank"
              rel="author noopener"
              className="whitespace-nowrap font-medium text-stone-700 underline decoration-stone-300 underline-offset-4 hover:text-emerald-700 hover:decoration-emerald-600 transition-colors"
            >
              {AUTHOR.name}
            </a>{" "}
            • May Allah accept our efforts
          </p>
          <p className="mt-2 text-xs">
            © {new Date().getFullYear()} Nisab Tracker. Free forever.
          </p>
        </div>
      </div>
    </footer>
  );
};
