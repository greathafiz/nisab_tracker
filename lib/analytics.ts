declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type AnalyticsEvent =
  // First time a visitor types into the calculator
  | { name: "calculator_start" }
  // First time the calculator shows that Zakat is due
  | {
      name: "zakat_due_shown";
      params: { nisab_type: string; selected_currency: string };
    }
  // Joined the Zakat reminder waitlist; mark this as a key event in GA
  | { name: "reminder_signup" }
  | { name: "currency_change"; params: { selected_currency: string } }
  // GA's recommended share event; item_id is the shared page's path
  | {
      name: "share";
      params: { method: "whatsapp" | "x" | "copy_link"; item_id: string };
    }
  // Copied the widget code from /embed; item_id is the country slug
  | { name: "embed_code_copy"; params: { item_id: string } };

/**
 * Send a Google Analytics event. A no-op if gtag hasn't loaded (e.g. blocked by an ad blocker).
 */
export function trackEvent(event: AnalyticsEvent) {
  window.gtag?.("event", event.name, "params" in event ? event.params : {});
}
