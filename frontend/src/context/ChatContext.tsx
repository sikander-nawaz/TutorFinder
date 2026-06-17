import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { Chat, Message } from "@/types";
import { chatService } from "@/services/chatService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

interface ChatContextValue {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  fetchChats: () => Promise<void>;
  openChat: (chat: Chat) => Promise<void>;
  sendMessage: (content: string, type?: "text" | "image" | "file") => Promise<void>;
  socketConnected: boolean;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    let socket: any;
    (async () => {
      try {
        const { io } = await import("socket.io-client");
        const BASE = "";
        socket = io(BASE || window.location.origin, {
          path: `${BASE}/socket.io`,
          withCredentials: true,
          transports: ["websocket", "polling"],
        });
        socketRef.current = socket;
        socket.on("connect", () => setSocketConnected(true));
        socket.on("disconnect", () => setSocketConnected(false));
        socket.on("message:new", (msg: Message) => {
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setChats((prev) =>
            prev.map((c) =>
              c.id === msg.chatId
                ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt, unreadCount: c.unreadCount + 1 }
                : c
            )
          );
        });
      } catch {
        setSocketConnected(false);
      }
    })();
    return () => { socket?.disconnect(); };
  }, [user]);

  const fetchChats = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const data = await chatService.getChats();
      setChats(data);
    } catch {
      toast({ title: "Failed to load chats", variant: "destructive" });
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  const openChat = useCallback(async (chat: Chat) => {
    setActiveChat(chat);
    setIsLoadingMessages(true);
    try {
      const msgs = await chatService.getMessages(chat.id);
      setMessages(msgs);
      await chatService.markSeen(chat.id);
      setChats((prev) => prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c)));
      socketRef.current?.emit("chat:join", { chatId: chat.id });
    } catch {
      toast({ title: "Failed to load messages", variant: "destructive" });
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, type: "text" | "image" | "file" = "text") => {
    if (!activeChat) return;
    try {
      const msg = await chatService.sendMessage(activeChat.id, content, type);
      setMessages((prev) => [...prev, msg]);
      socketRef.current?.emit("message:send", { chatId: activeChat.id, message: msg });
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  }, [activeChat]);

  return (
    <ChatContext.Provider value={{ chats, activeChat, messages, isLoadingChats, isLoadingMessages, fetchChats, openChat, sendMessage, socketConnected }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
