import { Send } from "lucide-react";
import { SOCIAL } from "@/lib/site";
import { XLogo } from "@/components/ui/XLogo";
import { cn } from "@/lib/utils";

const linkClass =
  "inline-flex items-center gap-1 font-medium text-stone-700 underline decoration-stone-300 underline-offset-4 hover:text-emerald-700 hover:decoration-emerald-600 transition-colors";

// Shown under the share buttons: the channels post the same daily figure
export function FollowLinks({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm text-stone-500", className)}>
      Get today&apos;s Nisab every day on{" "}
      <a
        href={SOCIAL.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        <Send className="size-3.5 text-[#229ED9]" aria-hidden="true" />
        Telegram
      </a>{" "}
      or{" "}
      <a
        href={SOCIAL.x}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        <XLogo />X
      </a>
    </p>
  );
}
