import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService.js";
import { userRepository } from "../repositories/userRepository.js";
import { emailService } from "../services/emailService.js";
import { User } from "../models/User.js";
import { sendSuccess } from "../utils/response.js";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors.js";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60 * 1000,
};

function setRefreshCookieOpts(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

function clearCookieOpts() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export const authController = {
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, email, password, role, phone, city } = req.body as {
        name: string;
        email: string;
        password: string;
        role: "student" | "tutor";
        phone?: string;
        city?: string;
      };

      if (!name || !email || !password || !role) {
        throw new BadRequestError(
          "name, email, password, and role are required",
        );
      }
      if (!["student", "tutor"].includes(role)) {
        throw new BadRequestError("role must be 'student' or 'tutor'");
      }
      if (password.length < 8) {
        throw new BadRequestError("Password must be at least 8 characters");
      }

      const { user, tokens } = await authService.register({
        name,
        email,
        password,
        role,
        phone,
        city,
      });

      res.cookie("accessToken", tokens.accessToken, ACCESS_COOKIE_OPTS);
      res.cookie(
        "refreshToken",
        tokens.refreshToken,
        setRefreshCookieOpts(tokens.refreshTokenExpiry),
      );

      sendSuccess({
        res,
        statusCode: 201,
        message: "Account created successfully",
        data: { user: authService.serializeUser(user) },
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      if (!email || !password) {
        throw new BadRequestError("email and password are required");
      }

      const { user, tokens } = await authService.login({ email, password });

      res.cookie("accessToken", tokens.accessToken, ACCESS_COOKIE_OPTS);
      res.cookie(
        "refreshToken",
        tokens.refreshToken,
        setRefreshCookieOpts(tokens.refreshTokenExpiry),
      );

      sendSuccess({
        res,
        message: "Logged in successfully",
        data: { user: authService.serializeUser(user) },
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      const userId = req.userId;

      if (userId && refreshToken) {
        await authService.logout(userId, refreshToken);
      }

      res.clearCookie("accessToken", clearCookieOpts());
      res.clearCookie("refreshToken", clearCookieOpts());

      sendSuccess({ res, message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  },

  async refresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      if (!refreshToken) throw new UnauthorizedError("Refresh token missing");

      const tokens = await authService.refresh(refreshToken);

      res.cookie("accessToken", tokens.accessToken, ACCESS_COOKIE_OPTS);
      res.cookie(
        "refreshToken",
        tokens.refreshToken,
        setRefreshCookieOpts(tokens.refreshTokenExpiry),
      );

      sendSuccess({ res, message: "Token refreshed" });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userRepository.findById(req.userId!);
      if (!user) throw new UnauthorizedError("User not found");

      sendSuccess({ res, data: { user: authService.serializeUser(user) } });
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email } = req.body as { email: string };
      if (!email) throw new BadRequestError("email is required");

      await authService.forgotPassword(email);

      sendSuccess({
        res,
        message:
          "If an account with that email exists, a reset link has been sent",
      });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { token, password } = req.body as {
        token: string;
        password: string;
      };
      if (!token || !password)
        throw new BadRequestError("token and password are required");
      if (password.length < 8)
        throw new BadRequestError("Password must be at least 8 characters");

      await authService.resetPassword(token, password);

      res.clearCookie("accessToken", clearCookieOpts());
      res.clearCookie("refreshToken", clearCookieOpts());

      sendSuccess({
        res,
        message: "Password reset successfully. Please log in.",
      });
    } catch (err) {
      next(err);
    }
  },

  async sendEmailOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await User.findById(req.userId).select(
        "+emailOtp +emailOtpExpiry",
      );
      if (!user) throw new UnauthorizedError("User not found");
      if (user.isEmailVerified) {
        sendSuccess({ res, message: "Email already verified" });
        return;
      }
      const otp = generateOtp();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      user.emailOtp = otp;
      user.emailOtpExpiry = expiry;
      await user.save();
      logger.info({ userId: req.userId }, "Email OTP generated");
      await emailService.sendOtpEmail(user.email, user.name, otp, "email");
      sendSuccess({ res, message: "OTP sent to your email" });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmailOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { code } = req.body as { code: string };
      if (!code) throw new BadRequestError("code is required");
      const user = await User.findById(req.userId).select(
        "+emailOtp +emailOtpExpiry",
      );
      if (!user) throw new UnauthorizedError("User not found");
      if (user.isEmailVerified) {
        sendSuccess({ res, message: "Email already verified" });
        return;
      }
      if (!user.emailOtp || !user.emailOtpExpiry)
        throw new BadRequestError("No OTP sent yet. Request a new one.");
      if (new Date() > user.emailOtpExpiry)
        throw new BadRequestError("OTP has expired. Request a new one.");
      if (user.emailOtp !== code.trim())
        throw new BadRequestError("Incorrect OTP");
      user.isEmailVerified = true;
      user.emailOtp = undefined;
      user.emailOtpExpiry = undefined;
      await user.save();
      sendSuccess({ res, message: "Email verified successfully" });
    } catch (err) {
      next(err);
    }
  },

  async sendPhoneOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { phone } = req.body as { phone?: string };
      const user = await User.findById(req.userId).select(
        "+phoneOtp +phoneOtpExpiry",
      );
      if (!user) throw new UnauthorizedError("User not found");
      const otp = generateOtp();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      user.phoneOtp = otp;
      user.phoneOtpExpiry = expiry;
      if (phone) user.phone = phone;
      await user.save();
      logger.info(
        { userId: req.userId, otp },
        "Phone OTP generated (sent via email)",
      );
      await emailService.sendOtpEmail(user.email, user.name, otp, "phone");
      sendSuccess({
        res,
        message: "OTP sent to your email (phone verification)",
      });
    } catch (err) {
      next(err);
    }
  },

  async verifyPhoneOtp(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { phone, code } = req.body as { phone?: string; code: string };
      if (!code) throw new BadRequestError("code is required");
      const user = await User.findById(req.userId).select(
        "+phoneOtp +phoneOtpExpiry",
      );
      if (!user) throw new UnauthorizedError("User not found");
      if (!user.phoneOtp || !user.phoneOtpExpiry)
        throw new BadRequestError("No OTP sent yet. Request a new one.");
      if (new Date() > user.phoneOtpExpiry)
        throw new BadRequestError("OTP has expired. Request a new one.");
      if (user.phoneOtp !== code.trim())
        throw new BadRequestError("Incorrect OTP");
      user.isPhoneVerified = true;
      user.phoneOtp = undefined;
      user.phoneOtpExpiry = undefined;
      if (phone) user.phone = phone;
      await user.save();
      sendSuccess({ res, message: "Phone verified successfully" });
    } catch (err) {
      next(err);
    }
  },
};
