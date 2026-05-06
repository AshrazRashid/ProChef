import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { z } from "zod";
import { createTokenPair, type AuthClaims } from "../../common/auth.js";
import { env } from "../../common/config.js";
import { prisma } from "../../common/db.js";
import { logger } from "../../common/logger.js";
import { AuthedRequest, requireAuth } from "../../common/middleware.js";
import { authLimiter, forgotPasswordLimiter } from "../../common/rateLimit.js";
import { redis } from "../../common/redis.js";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = signupSchema;

const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

const forgotPasswordRequestSchema = z.object({
  email: z.string().email()
});

const forgotPasswordVerifySchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .regex(/^\d{4}$/, "Code must be 4 digits")
});

const forgotPasswordResetSchema = forgotPasswordVerifySchema.extend({
  newPassword: z.string().min(8)
});

export const authRouter = Router();

const RESET_CODE_TTL_SECONDS = 10 * 60;

function resetCodeKey(email: string): string {
  return `auth:pwd-reset:${email.toLowerCase()}`;
}

function create4DigitCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function issueResetCode(email: string): Promise<string | null> {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return null;
  }
  const code = create4DigitCode();
  const payload = JSON.stringify({ code, userId: user.id, issuedAt: Date.now() });
  await redis.set(resetCodeKey(normalizedEmail), payload, "EX", RESET_CODE_TTL_SECONDS);
  return code;
}

authRouter.post("/refresh", authLimiter, async (req, res) => {
  const parse = refreshSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }
  try {
    const claims = jwt.verify(parse.data.refreshToken, env.JWT_REFRESH_SECRET) as AuthClaims;
    const tokens = createTokenPair({ sub: claims.sub, email: claims.email });
    res.json(tokens);
  } catch {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

authRouter.post("/signup", authLimiter, async (req, res) => {
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const email = parse.data.email.trim().toLowerCase();
  const { password } = parse.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash
    }
  });

  const tokens = createTokenPair({ sub: user.id, email: user.email });
  res.status(201).json({
    user: { id: user.id, email: user.email },
    ...tokens
  });
});

authRouter.post("/login", authLimiter, async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const email = parse.data.email.trim().toLowerCase();
  const { password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const tokens = createTokenPair({ sub: user.id, email: user.email });
  res.json({
    user: { id: user.id, email: user.email },
    ...tokens
  });
});

authRouter.post("/logout", authLimiter, requireAuth, async (req: AuthedRequest, res) => {
  logger.info({ userId: req.user?.id }, "auth_logout");
  res.status(204).send();
});

authRouter.post("/forgot-password/request", forgotPasswordLimiter, async (req, res) => {
  const parse = forgotPasswordRequestSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const email = parse.data.email.trim().toLowerCase();
  const code = await issueResetCode(email);
  if (code) {
    logger.info({ email, code }, "password_reset_code_issued");
  }

  res.json({
    message: "If an account exists for this email, a verification code has been sent.",
    ...(env.NODE_ENV !== "production" && code ? { debugCode: code } : {})
  });
});

authRouter.post("/forgot-password/resend", forgotPasswordLimiter, async (req, res) => {
  const parse = forgotPasswordRequestSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const email = parse.data.email.trim().toLowerCase();
  const code = await issueResetCode(email);
  if (code) {
    logger.info({ email, code }, "password_reset_code_resent");
  }

  res.json({
    message: "If an account exists for this email, a new verification code has been sent.",
    ...(env.NODE_ENV !== "production" && code ? { debugCode: code } : {})
  });
});

authRouter.post("/forgot-password/verify", forgotPasswordLimiter, async (req, res) => {
  const parse = forgotPasswordVerifySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const email = parse.data.email.trim().toLowerCase();
  const raw = await redis.get(resetCodeKey(email));
  if (!raw) {
    res.status(400).json({ message: "Code expired or invalid. Request a new code." });
    return;
  }

  const parsed = JSON.parse(raw) as { code?: string; userId?: string };
  if (parsed.code !== parse.data.code) {
    res.status(400).json({ message: "Incorrect verification code." });
    return;
  }

  res.json({ message: "Code verified." });
});

authRouter.post("/forgot-password/reset", forgotPasswordLimiter, async (req, res) => {
  const parse = forgotPasswordResetSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const email = parse.data.email.trim().toLowerCase();
  const raw = await redis.get(resetCodeKey(email));
  if (!raw) {
    res.status(400).json({ message: "Code expired or invalid. Request a new code." });
    return;
  }

  const parsed = JSON.parse(raw) as { code?: string; userId?: string };
  if (parsed.code !== parse.data.code || !parsed.userId) {
    res.status(400).json({ message: "Incorrect verification code." });
    return;
  }

  const passwordHash = await bcrypt.hash(parse.data.newPassword, 10);
  await prisma.user.update({
    where: { id: parsed.userId },
    data: { passwordHash }
  });
  await redis.del(resetCodeKey(email));

  res.json({ message: "Password reset successful." });
});
