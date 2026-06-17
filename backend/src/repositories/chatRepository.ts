import { Chat, IChat } from "../models/Chat.js";
import { Message, IMessage } from "../models/Message.js";
import type { Types } from "mongoose";

export interface ChatCreateInput {
  studentId: string;
  tutorId: string;
  studentName: string;
  tutorName: string;
  studentAvatar?: string;
  tutorAvatar?: string;
  requestId: string;
  isTrialMode?: boolean;
}

export interface MessageCreateInput {
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type?: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
}

export const chatRepository = {
  async findByUserId(userId: string, role: "student" | "tutor"): Promise<IChat[]> {
    const query = role === "student" ? { studentId: userId } : { tutorId: userId };
    return Chat.find(query).sort({ updatedAt: -1 }).lean();
  },

  async findById(id: string): Promise<IChat | null> {
    return Chat.findById(id).lean();
  },

  async findByParticipants(studentId: string, tutorId: string, requestId: string): Promise<IChat | null> {
    return Chat.findOne({ studentId, tutorId, requestId }).lean();
  },

  async create(data: ChatCreateInput): Promise<IChat> {
    const chat = new Chat(data);
    await chat.save();
    return chat.toObject();
  },

  async updateLastMessage(chatId: string, message: string): Promise<void> {
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message,
      lastMessageAt: new Date(),
      $inc: { unreadCount: 1 },
    });
  },

  async markAsSeen(chatId: string): Promise<void> {
    await Chat.findByIdAndUpdate(chatId, { unreadCount: 0 });
  },

  async delete(chatId: string): Promise<void> {
    await Chat.findByIdAndDelete(chatId);
    await Message.deleteMany({ chatId });
  },
};

export const messageRepository = {
  async findByChatId(chatId: string, limit: number = 100): Promise<IMessage[]> {
    return Message.find({ chatId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  async create(data: MessageCreateInput): Promise<IMessage> {
    const message = new Message(data);
    await message.save();
    return message.toObject();
  },

  async markSeen(chatId: string, userId: string): Promise<void> {
    await Message.updateMany(
      { chatId, senderId: { $ne: userId }, seen: false },
      { seen: true }
    );
  },

  async countUnread(chatId: string, userId: string): Promise<number> {
    return Message.countDocuments({
      chatId,
      senderId: { $ne: userId },
      seen: false,
    });
  },
};
