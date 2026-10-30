export const TELEGRAM_CHANNEL = "@nisabtracker";

/**
 * Post an HTML-formatted message to the channel. The bot must be a channel admin with
 * permission to post. Throws on failure.
 */
export async function postToTelegram(html: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL,
        text: html,
        parse_mode: "HTML",
        // The /nisab page has no figures in its preview, so it would only add clutter
        link_preview_options: { is_disabled: true },
      }),
    }
  );

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram sendMessage failed: ${data.description}`);
  }
}
