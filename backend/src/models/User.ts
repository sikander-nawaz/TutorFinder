import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRefreshToken {
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "student" | "tutor" | "admin";
  phone?: string;
  city?: string;
  cnic?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailOtp?: string;
  emailOtpExpiry?: Date;
  phoneOtp?: string;
  phoneOtpExpiry?: Date;
  isActive: boolean;
  isBlocked: boolean;
  refreshTokens: IRefreshToken[];
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      required: true,
    },
    phone: { type: String, trim: true },
    city: { type: String, trim: true },
    cnic: { type: String, trim: true },
    avatarUrl: { type: String },
    avatarPublicId: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    emailOtp: { type: String, select: false },
    emailOtpExpiry: { type: Date, select: false },
    phoneOtp: { type: String, select: false },
    phoneOtpExpiry: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    refreshTokens: { type: [RefreshTokenSchema], default: [] },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", UserSchema);
