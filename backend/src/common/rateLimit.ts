import { rateLimit } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { redis } from "./redis.js";

const sendCommand = (command: string, ...args: string[]) =>
  redis.call(command, ...args) as Promise<RedisReply>;

const globalStore = new RedisStore({
  prefix: "rl:global:",
  sendCommand
});

const authStore = new RedisStore({
  prefix: "rl:auth:",
  sendCommand
});

const globalWindowMs = Number(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS ?? 15 * 60 * 1000);
const globalMax = Number(process.env.RATE_LIMIT_GLOBAL_MAX ?? 500);
const authWindowMs = Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS ?? 15 * 60 * 1000);
const authMax = Number(process.env.RATE_LIMIT_AUTH_MAX ?? 20);

function skipHealthAndStripe(req: { path: string }): boolean {
  return (
    req.path === "/health" ||
    req.path === "/health/ready" ||
    req.path === "/billing/webhooks/stripe"
  );
}

const rateHeaders = { standardHeaders: true, legacyHeaders: false } as const;

/** Broad API limit per IP (Redis-backed for multi-instance). */
export const globalApiLimiter = rateLimit({
  windowMs: globalWindowMs,
  max: globalMax,
  skip: skipHealthAndStripe,
  message: { message: "Too many requests, please try again later." },
  store: globalStore,
  ...rateHeaders
});

/** Stricter limit for auth routes (signup/login). */
export const authLimiter = rateLimit({
  windowMs: authWindowMs,
  max: authMax,
  message: { message: "Too many authentication attempts, please try again later." },
  store: authStore,
  ...rateHeaders
});
