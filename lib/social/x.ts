import { createHmac, randomBytes } from "node:crypto";

/**
 * X charges per post (about $0.15 in October 2026), so posting only runs around Ramadan,
 * when people actually look for the Nisab. Dates are UTC and inclusive. Move the window
 * each year, and top up X API credits before it opens.
 */
export const X_POSTING_WINDOW = { from: "2027-02-01", until: "2027-03-12" };

const TWEETS_URL = "https://api.x.com/2/tweets";

export function isInXPostingWindow(date: Date): boolean {
  const day = date.toISOString().slice(0, 10);
  return day >= X_POSTING_WINDOW.from && day <= X_POSTING_WINDOW.until;
}

/**
 * Post from @nisabtracker, signed with the account's OAuth 1.0a user tokens.
 * Throws on failure.
 */
export async function postToX(text: string): Promise<void> {
  const {
    X_API_KEY: apiKey,
    X_API_SECRET: apiSecret,
    X_ACCESS_TOKEN: accessToken,
    X_ACCESS_TOKEN_SECRET: accessTokenSecret,
  } = process.env;
  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    throw new Error("X API credentials are not set");
  }

  const response = await fetch(TWEETS_URL, {
    method: "POST",
    headers: {
      Authorization: oauthHeader("POST", TWEETS_URL, {
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret,
      }),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(
      `X post failed: ${response.status} ${await response.text()}`
    );
  }
}

// RFC 3986 encoding, which OAuth 1.0a requires (encodeURIComponent leaves !'()* alone)
function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

/**
 * The OAuth 1.0a Authorization header. A JSON body isn't part of the signature, and
 * this URL has no query string, so only the oauth_* parameters are signed.
 */
function oauthHeader(
  method: string,
  url: string,
  credentials: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  }
): string {
  const params: Record<string, string> = {
    oauth_consumer_key: credentials.apiKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: credentials.accessToken,
    oauth_version: "1.0",
  };

  const paramString = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&");
  const baseString = [
    method,
    percentEncode(url),
    percentEncode(paramString),
  ].join("&");
  const signingKey = `${percentEncode(credentials.apiSecret)}&${percentEncode(credentials.accessTokenSecret)}`;
  params.oauth_signature = createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  return (
    "OAuth " +
    Object.keys(params)
      .sort()
      .map((key) => `${percentEncode(key)}="${percentEncode(params[key])}"`)
      .join(", ")
  );
}
