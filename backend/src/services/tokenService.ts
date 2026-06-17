import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

const ACCESS_EXPIRES_MS = 15 * 60 * 1000;
const REFRESH_EXPIRES_MS = 30 * 24 * 60 * 60 * 1000;

export const tokenService = {
  generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  },

  generateRefreshToken(): string {
    return crypto.randomBytes(40).toString("hex");
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  },

  getRefreshTokenExpiry(): Date {
    return new Date(Date.now() + REFRESH_EXPIRES_MS);
  },

  getAccessTokenExpiry(): Date {
    return new Date(Date.now() + ACCESS_EXPIRES_MS);
  },
};
