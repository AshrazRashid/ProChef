import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { z } from "zod";
import { createTokenPair, type AuthClaims } from "../../common/auth.js";
import { env } from "../../common/config.js";
import { prisma } from "../../common/db.js";
import { authLimiter } from "../../common/rateLimit.js";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = signupSchema;

const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

export const authRouter = Router();

authRouter.use(authLimiter);

authRouter.post("/refresh", async (req, res) => {
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

authRouter.post("/signup", async (req, res) => {
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const { email, password } = parse.data;
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

authRouter.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ message: "Invalid payload", errors: parse.error.flatten() });
    return;
  }

  const { email, password } = parse.data;
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
