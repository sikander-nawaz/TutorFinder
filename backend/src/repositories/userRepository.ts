import { Types } from "mongoose";
import { User, IUser } from "../models/User.js";

export const userRepository = {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  },

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).select("+passwordHash").exec();
  },

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).exec();
  },

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select("+passwordHash").exec();
  },

  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    return user.save();
  },

  async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  },

  async addRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $push: {
        refreshTokens: {
          $each: [{ token, expiresAt, createdAt: new Date() }],
          $slice: -10,
        },
      },
    }).exec();
  },

  async removeRefreshToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token } },
    }).exec();
  },

  async removeAllRefreshTokens(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    }).exec();
  },

  async findByRefreshToken(token: string): Promise<IUser | null> {
    return User.findOne({
      "refreshTokens.token": token,
      "refreshTokens.expiresAt": { $gt: new Date() },
    }).exec();
  },

  async existsByEmail(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email: email.toLowerCase() }).exec();
    return count > 0;
  },
};
