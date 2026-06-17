import { api } from "./api";
import { Chat, Message } from "@/types";

export const chatService = {
  async getChats(): Promise<Chat[]> {
    const { data } = await api.get("/chats");
    return data.chats;
  },
  async getMessages(chatId: number): Promise<Message[]> {
    const { data } = await api.get(`/chats/${chatId}/messages`);
    return data.messages;
  },
  async sendMessage(chatId: number, content: string, type: "text" | "image" | "file" = "text"): Promise<Message> {
    const { data } = await api.post(`/chats/${chatId}/messages`, { content, type });
    return data.message;
  },
  async markSeen(chatId: number): Promise<void> {
    await api.patch(`/chats/${chatId}/seen`);
  },
};
