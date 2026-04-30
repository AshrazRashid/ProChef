import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  /** Number of reverse proxies in front of this app (sets Express trust proxy). Use 0 locally, 1 behind a single load balancer. */
  TRUST_PROXY: z.coerce.number().int().min(0).max(32).default(0),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("prochef-scans"),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  /** Stripe Price IDs from Dashboard (recurring monthly / yearly). */
  STRIPE_PRICE_ID_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ID_YEARLY: z.string().optional(),
  /**
   * Mobile return URLs for Checkout. Use your app scheme, e.g.
   * prochef://billing/success?session_id={CHECKOUT_SESSION_ID}
   */
  CHECKOUT_SUCCESS_URL: z.string().min(1).optional(),
  CHECKOUT_CANCEL_URL: z.string().min(1).optional()
});

export const env = envSchema.parse(process.env);
