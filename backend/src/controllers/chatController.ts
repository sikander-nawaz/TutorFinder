import type { Request, Response, NextFunction } from "express";
import { chatRepository, messageRepository } from "../repositories/chatRepository.js";
import { sendSuccess } from "../utils/response.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors.js";

export const chatController = {
  async getMyChats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId || !req.userRole) throw new BadRequestError("User info required");
      if (req.userRole === "admin") throw new ForbiddenError("Admins cannot access chats");
      
      const chats = await chatRepository.findByUserId(req.userId, req.userRole as "student" | "tutor");
      sendSuccess({ res, data: { chats } });
    } catch (err) {
      next(err);
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      const { chatId } = req.params;
      
      const chat = await chatRepository.findById(chatId as string);
      if (!chat) throw new NotFoundError("Chat not found");
      
      // Verify user is part of this chat
      if (chat.studentId.toString() !== req.userId && chat.tutorId.toString() !== req.userId) {
        throw new ForbiddenError("Not authorized to view this chat");
      }
      
      const messages = await messageRepository.findByChatId(chatId as string);
      sendSuccess({ res, data: { messages: messages.reverse() } });
    } catch (err) {
      next(err);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId || !req.userRole) throw new BadRequestError("User info required");
      const { chatId } = req.params;
      const { content, type = "text", fileUrl, fileName } = req.body;
      
      if (!content) throw new BadRequestError("Message content required");
      
      const chat = await chatRepository.findById(chatId as string);
      if (!chat) throw new NotFoundError("Chat not found");
      
      // Verify user is part of this chat
      const isStudent = chat.studentId.toString() === req.userId;
      const isTutor = chat.tutorId.toString() === req.userId;
      if (!isStudent && !isTutor) {
        throw new ForbiddenError("Not authorized to send messages in this chat");
      }
      
      const senderName = isStudent ? chat.studentName : chat.tutorName;
      const senderAvatar = isStudent ? chat.studentAvatar : chat.tutorAvatar;
      
      const message = await messageRepository.create({
        chatId: chatId as string,
        senderId: req.userId,
        senderName,
        senderAvatar,
        content,
        type,
        fileUrl,
        fileName,
      });
      
      // Update chat's last message
      await chatRepository.updateLastMessage(chatId as string, content);
      
      sendSuccess({ res, statusCode: 201, message: "Message sent", data: { message } });
    } catch (err) {
      next(err);
    }
  },

  async markSeen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      const { chatId } = req.params;
      
      const chat = await chatRepository.findById(chatId as string);
      if (!chat) throw new NotFoundError("Chat not found");
      
      // Verify user is part of this chat
      if (chat.studentId.toString() !== req.userId && chat.tutorId.toString() !== req.userId) {
        throw new ForbiddenError("Not authorized");
      }
      
      await messageRepository.markSeen(chatId as string, req.userId);
      await chatRepository.markAsSeen(chatId as string);
      
      sendSuccess({ res, message: "Marked as seen" });
    } catch (err) {
      next(err);
    }
  },
};
