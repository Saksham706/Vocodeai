import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const codeQueue = new Queue("code-execution", {
  connection: redisConnection,
});

// Suppress unhandled EventEmitter errors during disconnect/reconnect cycles
codeQueue.on("error", (err) => {
  if (err.code !== "ECONNREFUSED") {
    console.warn("⚠️ [QUEUE ERROR]:", err.message);
  }
});
