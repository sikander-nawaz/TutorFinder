import { PasswordResetToken, IPasswordResetToken } from "../models/PasswordResetToken.js";

export const passwordResetRepository = {
  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<IPasswordResetToken> {
    await PasswordResetToken.deleteMany({ userId });
    const token = new PasswordResetToken({ userId, tokenHash, expiresAt });
    return token.save();
  },

  async findValidByHash(tokenHash: string): Promise<IPasswordResetToken | null> {
    return PasswordResetToken.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    }).exec();
  },

  async markUsed(id: string): Promise<void> {
    await PasswordResetToken.findByIdAndUpdate(id, { $set: { used: true } }).exec();
  },
};
