import { createClient } from "redis";
import { isOlderThan } from "../utils";

const redisClient = createClient({
  url: process.env.STORAGE_REDIS_URL,
  socket: {
    connectTimeout: 5000,
    // Give up after a few attempts so callers fail fast instead of hanging until the request times out
    reconnectStrategy: (retries) =>
      retries >= 3 ? false : Math.min(retries * 200, 1000),
  },
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

let connecting: Promise<unknown> | null = null;

async function ensureConnected() {
  if (!process.env.STORAGE_REDIS_URL) {
    throw new Error("STORAGE_REDIS_URL is not set");
  }
  if (redisClient.isOpen) return;

  // Share one connection attempt between concurrent callers
  connecting ??= redisClient.connect().finally(() => {
    connecting = null;
  });
  await connecting;
}

export const redis = {
  async get<T>(key: string): Promise<T | null> {
    await ensureConnected();
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  },

  async set(key: string, value: unknown): Promise<void> {
    await ensureConnected();
    await redisClient.set(key, JSON.stringify(value));
  },

  /**
   * Set a key that expires after `ttlSeconds`, only if it doesn't already exist.
   * Returns true if the key was set.
   */
  async setIfAbsent(
    key: string,
    value: unknown,
    ttlSeconds: number
  ): Promise<boolean> {
    await ensureConnected();
    const result = await redisClient.set(key, JSON.stringify(value), {
      condition: "NX",
      expiration: { type: "EX", value: ttlSeconds },
    });
    return result === "OK";
  },

  async del(key: string): Promise<void> {
    await ensureConnected();
    await redisClient.del(key);
  },
};

export interface DailyCacheEntry {
  lastUpdated: string;
  // When we fetched the data (lastUpdated is the provider's timestamp). Missing on entries cached before it was added.
  fetchedAt?: string;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_SECONDS = 60 * 60;

/**
 * Read a cached entry, refreshing it if it's more than a day old.
 *
 * The daily cron normally keeps entries fresh, so refreshing here is a fallback: it's
 * attempted at most once an hour so failing APIs don't burn their quotas on every request,
 * and if it fails the stale entry is returned rather than nothing.
 */
export async function getWithDailyRefresh<T extends DailyCacheEntry>(
  key: string,
  refresh: () => Promise<T | null>
): Promise<T | null> {
  const cached = await redis.get<T>(key);
  if (
    cached &&
    !isOlderThan(cached.fetchedAt ?? cached.lastUpdated, ONE_DAY_MS)
  ) {
    return cached;
  }

  const mayRefresh = await redis.setIfAbsent(
    `${key}:refresh-attempt`,
    new Date().toISOString(),
    ONE_HOUR_SECONDS
  );
  if (!mayRefresh) return cached;

  return (await refresh()) ?? cached;
}

export default redisClient;
