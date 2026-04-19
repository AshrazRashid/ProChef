import jwt from "jsonwebtoken";
import { env } from "./config.js";

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthClaims = {
  sub: string;
  email: string;
};

export function createTokenPair(claims: AuthClaims): TokenPair {
  const accessToken = jwt.sign(claims, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });

  const refreshToken = jwt.sign(claims, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): AuthClaims {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthClaims;
}
