import bcrypt from "bcryptjs";
import crypto from "crypto";
import { userRepository } from "../repositories/userRepository.js";
import { tutorProfileRepository } from "../repositories/tutorProfileRepository.js";
import { studentProfileRepository } from "../repositories/studentProfileRepository.js";
import { passwordResetRepository } from "../repositories/passwordResetRepository.js";
import { tokenService } from "./tokenService.js";
import { emailService } from "./emailService.js";
import { ConflictError, UnauthorizedError, BadRequestError, NotFoundError } from "../utils/errors.js";
import type { IUser } from "../models/User.js";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "student" | "tutor";
  phone?: string;
  city?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: Date;
}

export interface AuthResult {
  user: IUser;
  tokens: AuthTokens;
}

function serializeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    city: user.city,
    cnic: user.cnic,
    avatarUrl: user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
  };
}

export const authService = {
  serializeUser,

  async register(payload: RegisterPayload): Promise<AuthResult> {
    const exists = await userRepository.existsByEmail(payload.email);
    if (exists) throw new ConflictError("An account with this email already exists");

    const passwordHash = await bcrypt.hash(payload.password, 12);

    const user = await userRepository.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role,
      phone: payload.phone,
      city: payload.city,
    });

    if (payload.role === "tutor") {
      await tutorProfileRepository.create({ userId: user._id });
    } else {
      await studentProfileRepository.create({ userId: user._id });
    }

    emailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

    const tokens = await this._issueTokens(user._id.toString(), user.role);
    return { user, tokens };
  },

  async login(payload: LoginPayload): Promise<AuthResult> {
    const user = await userRepository.findByEmailWithPassword(payload.email);
    if (!user) throw new UnauthorizedError("Invalid email or password");
    if (user.isBlocked) throw new UnauthorizedError("Your account has been suspended");

    const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedError("Invalid email or password");

    const tokens = await this._issueTokens(user._id.toString(), user.role);
    return { user, tokens };
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const user = await userRepository.findByRefreshToken(refreshToken);
    if (!user) throw new UnauthorizedError("Invalid or expired refresh token");

    await userRepository.removeRefreshToken(user._id.toString(), refreshToken);
    return this._issueTokens(user._id.toString(), user.role);
  },

  async logout(userId: string, refreshToken: string): Promise<void> {
    await userRepository.removeRefreshToken(userId, refreshToken);
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await passwordResetRepository.create(user._id.toString(), tokenHash, expiresAt);
    await emailService.sendPasswordResetEmail(user.email, user.name, rawToken);
  },

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const record = await passwordResetRepository.findValidByHash(tokenHash);
    if (!record) throw new BadRequestError("Invalid or expired reset token");

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.updateById(record.userId.toString(), { passwordHash });
    await userRepository.removeAllRefreshTokens(record.userId.toString());
    await passwordResetRepository.markUsed(record._id.toString());
  },

  async _issueTokens(userId: string, role: string): Promise<AuthTokens> {
    const accessToken = tokenService.generateAccessToken(userId, role);
    const refreshToken = tokenService.generateRefreshToken();
    const refreshTokenExpiry = tokenService.getRefreshTokenExpiry();

    await userRepository.addRefreshToken(userId, refreshToken, refreshTokenExpiry);

    return { accessToken, refreshToken, refreshTokenExpiry };
  },
};
