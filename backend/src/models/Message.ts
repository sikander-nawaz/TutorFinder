import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
  seen: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    fileUrl: { type: String },
    fileName: { type: String },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ chatId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
