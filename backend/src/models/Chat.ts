import mongoose, { Document, Schema, Types } from "mongoose";

export interface IChat extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  tutorId: Types.ObjectId;
  studentName: string;
  tutorName: string;
  studentAvatar?: string;
  tutorAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  isTrialMode: boolean;
  requestId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tutorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true },
    tutorName: { type: String, required: true },
    studentAvatar: { type: String },
    tutorAvatar: { type: String },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    unreadCount: { type: Number, default: 0 },
    isTrialMode: { type: Boolean, default: false },
    requestId: { type: Schema.Types.ObjectId, ref: "TutorRequest", required: true },
  },
  { timestamps: true }
);

ChatSchema.index({ studentId: 1, updatedAt: -1 });
ChatSchema.index({ tutorId: 1, updatedAt: -1 });

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
