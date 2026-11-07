import IORedis from "ioredis";

export const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: false,
  retryStrategy(times) {
    // Exponential backoff between 1s and 10s to avoid hammering and CPU spin
    return Math.min(times * 1000, 10000);
  },
};

export let isRedisConnected = false;
let hasLoggedOfflineWarning = false;

export const redisConnection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: redisOptions.retryStrategy,
    })
  : new IORedis(redisOptions);

redisConnection.on("connect", () => {
  isRedisConnected = true;
  hasLoggedOfflineWarning = false;
  const destination = process.env.REDIS_URL
    ? process.env.REDIS_URL.replace(/:\/\/[^@]+@/, "://***@") // hide password
    : `${redisOptions.host}:${redisOptions.port}`;
  console.log(`✅ Redis connected → ${destination}`);
});

redisConnection.on("ready", async () => {
  isRedisConnected = true;
  // BullMQ requires noeviction policy — set it automatically if Redis allows
  try {
    await redisConnection.config("SET", "maxmemory-policy", "noeviction");
  } catch {
    // Redis Cloud managed instances may not allow CONFIG SET — warning is cosmetic only
  }
});

redisConnection.on("close", () => {
  isRedisConnected = false;
});

redisConnection.on("error", (err) => {
  isRedisConnected = false;
  if (err.code === "ECONNREFUSED") {
    if (!hasLoggedOfflineWarning) {
      console.warn(
        `⚠️ Redis warning: Redis server is offline (${redisOptions.host}:${redisOptions.port}). Background BullMQ workers will wait until Redis is started.`
      );
      hasLoggedOfflineWarning = true;
    }
  } else {
    console.warn("⚠️ Redis warning/error:", err.message);
  }
});
