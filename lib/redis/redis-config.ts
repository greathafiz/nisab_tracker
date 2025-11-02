import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.STORAGE_REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

async function ensureConnected() {
  if (!redisClient.isOpen) await redisClient.connect();
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

  async del(key: string): Promise<void> {
    await ensureConnected();
    await redisClient.del(key);
  },
};

export default redisClient;
