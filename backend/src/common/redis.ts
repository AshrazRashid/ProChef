import { Redis } from "ioredis";
import { env } from "./config.js";

/** Shared Redis connection for rate limiting and readiness checks (not BullMQ workers). */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null
});

redis.on("error", (err: Error) => {
  console.error(JSON.stringify({ msg: "redis_client_error", error: err.message }));
});
