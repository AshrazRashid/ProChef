import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "./auth.js";

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
