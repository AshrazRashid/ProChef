import { PrismaClient } from "@prisma/client";

/**
 * Reuse one client in dev to avoid extra DB connections on hot reload.
 * Pair DATABASE_URL with Neon/pooler settings (e.g. `connection_limit=5`) so the pool
 * matches your provider’s cap — exhausting it crashes the process and the app shows “Network request failed”.
 */
const globalForPrisma = globalThis as typeof globalThis & { __prisma?: PrismaClient };

export const prisma = globalForPrisma.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
