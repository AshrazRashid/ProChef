import { randomUUID } from "node:crypto";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { pinoHttp } from "pino-http";
import { env } from "./common/config.js";
import { prisma } from "./common/db.js";
import { logger } from "./common/logger.js";
import { globalApiLimiter } from "./common/rateLimit.js";
import { redis } from "./common/redis.js";
import { authRouter } from "./modules/auth/routes.js";
import { billingRouter, handleStripeWebhook } from "./modules/billing/routes.js";
import { dashboardRouter } from "./modules/dashboard/routes.js";
import { notificationsRouter } from "./modules/notifications/routes.js";
import { pantryRouter } from "./modules/pantry/routes.js";
import { plannerRouter } from "./modules/planner/routes.js";
import { profileRouter } from "./modules/profile/routes.js";
import { recommendationsRouter } from "./modules/recommendations/routes.js";
import { recipesRouter } from "./modules/recipes/routes.js";
import { scansRouter } from "./modules/scans/routes.js";
import { shoppingRouter } from "./modules/shopping/routes.js";

const app = express();
if (env.TRUST_PROXY > 0) {
  app.set("trust proxy", env.TRUST_PROXY);
}
app.use(cors());
app.use(
  pinoHttp({
    logger,
    genReqId(req: Request, _res: Response): string {
      const h = req.headers["x-request-id"];
      if (typeof h === "string" && h.length > 0 && h.length <= 128) {
        return h;
      }
      return randomUUID();
    },
    autoLogging: {
      ignore: (req: Request) => req.url === "/health" || req.url === "/favicon.ico"
    }
  })
);
app.use((req, res, next) => {
  const id = req.id;
  if (id !== undefined && id !== null && id !== "") {
    res.setHeader("X-Request-Id", String(id));
  }
  next();
});
app.post("/billing/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const normalizedSignature = Array.isArray(signature) ? signature[0] : signature;
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body ?? "");
  const result = await handleStripeWebhook(rawBody, normalizedSignature);
  res.status(result.status).json(result.body);
});
app.use(express.json({ limit: "5mb" }));
app.use(globalApiLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "prochef-backend" });
});

app.get("/health/ready", async (_req, res) => {
  const checks: { db: boolean; redis: boolean } = { db: false, redis: false };
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = true;
  } catch (err) {
    logger.error({ err }, "readiness_db_failed");
    return res.status(503).json({ status: "not_ready", checks });
  }
  try {
    const pong = await redis.ping();
    checks.redis = pong === "PONG";
  } catch (err) {
    logger.error({ err }, "readiness_redis_failed");
    return res.status(503).json({ status: "not_ready", checks });
  }
  if (!checks.redis) {
    return res.status(503).json({ status: "not_ready", checks });
  }
  res.json({ status: "ready", checks });
});

app.use("/auth", authRouter);
app.use("/", profileRouter);
app.use("/pantry", pantryRouter);
app.use("/scans", scansRouter);
app.use("/recipes", recipesRouter);
app.use("/recommendations", recommendationsRouter);
app.use("/dashboard", dashboardRouter);
app.use("/meal-plans", plannerRouter);
app.use("/shopping-lists", shoppingRouter);
app.use("/billing", billingRouter);
app.use("/notifications", notificationsRouter);

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, "backend_listen");
});

async function shutdown(signal: string) {
  logger.info({ signal }, "shutdown_started");
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
  await prisma.$disconnect().catch(() => undefined);
  await redis.quit().catch(() => undefined);
  process.exit(0);
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
