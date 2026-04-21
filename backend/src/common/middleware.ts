import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "./auth.js";
import { prisma } from "./db.js";

export type AuthedRequest = Request & {
  user?: {
    id: string;
    email: string;
  };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: "Missing bearer token" });
    return;
  }

  try {
    const claims = verifyAccessToken(token);
    req.user = { id: claims.sub, email: claims.email };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export async function requireProEntitlement(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user?.id) {
    res.status(401).json({ message: "Missing authenticated user" });
    return;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: req.user.id }
  });
  const activeStatuses = new Set(["active", "trialing"]);
  const hasPro =
    !!subscription &&
    activeStatuses.has(subscription.status) &&
    (!subscription.currentPeriodEnd || subscription.currentPeriodEnd.getTime() > Date.now());

  if (!hasPro) {
    res.status(402).json({ message: "Pro entitlement required" });
    return;
  }

  next();
}
