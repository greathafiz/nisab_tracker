"use client";
import { useState } from "react";
import { Check, Link2, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { XLogo } from "@/components/ui/XLogo";

interface ShareButtonsProps {
  // The message, without the link; each network gets the link its own way
  text: string;
  url: string;
  className?: string;
}

const buttonClass =
  "inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 cursor-pointer";

export function ShareButtons({ text, url, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const path = new URL(url).pathname;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  const xHref = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEvent({
        name: "share",
        params: { method: "copy_link", item_id: path },
      });
    } catch {
      // Clipboard blocked (e.g. insecure context); the other buttons still work
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-sm text-stone-500 mr-1">
        Share today&apos;s Nisab:
      </span>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        onClick={() =>
          trackEvent({
            name: "share",
            params: { method: "whatsapp", item_id: path },
          })
        }
      >
        <MessageCircle className="size-4 text-[#25D366]" aria-hidden="true" />
        WhatsApp
      </a>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
        onClick={() =>
          trackEvent({ name: "share", params: { method: "x", item_id: path } })
        }
      >
        <XLogo />
        Post
      </a>
      <button type="button" onClick={copyLink} className={buttonClass}>
        {copied ? (
          <Check className="size-4 text-emerald-600" aria-hidden="true" />
        ) : (
          <Link2 className="size-4" aria-hidden="true" />
        )}
        <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
