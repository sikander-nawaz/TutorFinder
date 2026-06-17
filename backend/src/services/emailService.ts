import { Resend } from "resend";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

const resend = new Resend(env.RESEND_API_KEY);

export const emailService = {
  async sendPasswordResetEmail(
    toEmail: string,
    toName: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to: toEmail,
        subject: "Reset Your TutorFinder Password",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #059669;">TutorFinder</h2>
            <p>Hi ${toName},</p>
            <p>You requested a password reset for your TutorFinder account.</p>
            <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetUrl}"
              style="display: inline-block; background: #059669; color: #fff;
                     padding: 12px 24px; border-radius: 8px; text-decoration: none;
                     font-weight: 600; margin: 16px 0;">
              Reset Password
            </a>
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this, please ignore this email. Your password won't change.
            </p>
            <p style="color: #6b7280; font-size: 12px;">
              Or copy this link: ${resetUrl}
            </p>
          </div>
        `,
      });
    } catch (err) {
      logger.error({ err, toEmail }, "Failed to send password reset email");
      throw new Error("Failed to send password reset email");
    }
  },

  async sendOtpEmail(
    toEmail: string,
    toName: string,
    otp: string,
    purpose: "email" | "phone",
  ): Promise<void> {
    const label =
      purpose === "email" ? "Email Verification" : "Phone Verification";
    try {
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to: toEmail,
        subject: `Your TutorFinder ${label} Code`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #059669;">TutorFinder</h2>
            <p>Hi ${toName},</p>
            <p>Your ${label.toLowerCase()} code is:</p>
            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #059669;
                        background: #f0fdf4; border: 2px dashed #059669; border-radius: 12px;
                        padding: 16px 24px; text-align: center; margin: 16px 0;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          </div>
        `,
      });
    } catch (err) {
      logger.error({ err, toEmail }, "Failed to send OTP email");
      throw new Error("Failed to send OTP email");
    }
  },

  async sendWelcomeEmail(toEmail: string, toName: string): Promise<void> {
    try {
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to: toEmail,
        subject: "Welcome to TutorFinder!",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #059669;">Welcome to TutorFinder!</h2>
            <p>Hi ${toName},</p>
            <p>Your account has been created successfully. You can now log in and start exploring tutors across Pakistan.</p>
            <a href="${env.CLIENT_URL}/login"
              style="display: inline-block; background: #059669; color: #fff;
                     padding: 12px 24px; border-radius: 8px; text-decoration: none;
                     font-weight: 600; margin: 16px 0;">
              Go to Dashboard
            </a>
          </div>
        `,
      });
    } catch (err) {
      logger.warn(
        { err, toEmail },
        "Failed to send welcome email (non-critical)",
      );
    }
  },
};
