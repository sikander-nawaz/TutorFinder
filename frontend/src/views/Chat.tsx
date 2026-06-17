import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Paperclip, Image, Lock, MessageCircle, Check, CheckCheck, Wifi, WifiOff } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { Chat as ChatType } from "@/types";

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

const MOCK_CHATS: ChatType[] = [
  { id: 1, studentId: 3, tutorId: 1, studentName: "Sara Malik", tutorName: "Dr. Imran Sheikh", lastMessage: "Yes, we can start Monday!", lastMessageAt: new Date().toISOString(), unreadCount: 2, isTrialMode: true, requestId: 1 },
  { id: 2, studentId: 3, tutorId: 2, studentName: "Sara Malik", tutorName: "Ahmed Hassan", lastMessage: "Please check the PDF I sent.", lastMessageAt: new Date(Date.now() - 86400000).toISOString(), unreadCount: 0, isTrialMode: false, requestId: 2 },
];

const MOCK_MESSAGES = [
  { id: 1, chatId: 1, senderId: 1, senderName: "Dr. Imran Sheikh", content: "Hello! I reviewed your request. I'd love to help you with Chemistry.", type: "text" as const, seen: true, createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 2, chatId: 1, senderId: 3, senderName: "Sara Malik", content: "Thank you! I'm struggling with Organic Chemistry mostly.", type: "text" as const, seen: true, createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 3, chatId: 1, senderId: 1, senderName: "Dr. Imran Sheikh", content: "Perfect, that's my specialty. We can start with reactions and mechanisms.", type: "text" as const, seen: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 4, chatId: 1, senderId: 3, senderName: "Sara Malik", content: "Yes, we can start Monday!", type: "text" as const, seen: true, createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 5, chatId: 1, senderId: 1, senderName: "Dr. Imran Sheikh", content: "Great! I'll send you the schedule and materials shortly.", type: "text" as const, seen: false, createdAt: new Date(Date.now() - 300000).toISOString() },
];

export default function ChatPage() {
  const { user } = useAuth();
  const { chats, activeChat, messages, isLoadingChats, isLoadingMessages, fetchChats, openChat, sendMessage, socketConnected } = useChat();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [localChats, setLocalChats] = useState<ChatType[]>([]);
  const [localMessages, setLocalMessages] = useState(MOCK_MESSAGES);
  const [localActiveChat, setLocalActiveChat] = useState<ChatType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const useMock = chats.length === 0 && !isLoadingChats;
  const displayChats = useMock ? MOCK_CHATS : chats;
  const displayMessages = useMock ? localMessages.filter(m => m.chatId === localActiveChat?.id) : messages;
  const displayActiveChat = useMock ? localActiveChat : activeChat;

  useEffect(() => { fetchChats(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [displayMessages]);

  const handleSelectChat = (chat: ChatType) => {
    if (useMock) {
      setLocalActiveChat(chat);
    } else {
      openChat(chat);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (useMock && localActiveChat) {
      const newMsg = {
        id: Date.now(), chatId: localActiveChat.id, senderId: user?.id || 0,
        senderName: user?.name || "", content: text.trim(), type: "text" as const,
        seen: false, createdAt: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, newMsg]);
      setText("");
      return;
    }
    setSending(true);
    await sendMessage(text.trim());
    setText("");
    setSending(false);
  };

  const getOtherPerson = (chat: ChatType) => {
    if (!user) return { name: "User", avatar: undefined };
    return user.id === chat.studentId
      ? { name: chat.tutorName, avatar: chat.tutorAvatar }
      : { name: chat.studentName, avatar: chat.studentAvatar };
  };

  return (
    <DashboardLayout title="Messages">
      <div className="h-[calc(100vh-8rem)] flex rounded-2xl border border-border/50 overflow-hidden bg-background shadow-sm">
        {/* Chat List */}
        <div className="w-80 shrink-0 border-r border-border/50 flex flex-col">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-semibold">Conversations</h2>
            <div className={cn("flex items-center gap-1.5 text-xs", socketConnected ? "text-primary" : "text-muted-foreground")}>
              {socketConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {socketConnected ? "Live" : "Offline"}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoadingChats ? (
              <div className="p-3 space-y-3">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : displayChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-medium text-sm">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your chats will appear here after a request is approved.</p>
              </div>
            ) : (
              displayChats.map(chat => {
                const other = getOtherPerson(chat);
                const isActive = displayActiveChat?.id === chat.id;
                return (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors text-left border-b border-border/30",
                      isActive && "bg-primary/5 border-r-2 border-r-primary"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={other.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {other.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {chat.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-4 min-h-4 px-1">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-medium text-sm truncate">{other.name}</p>
                        {chat.lastMessageAt && <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(chat.lastMessageAt)}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {chat.isTrialMode && <Badge className="text-[9px] bg-purple-100 text-purple-700 border-purple-200 border px-1 py-0 h-3.5">Trial</Badge>}
                        {chat.lastMessage && <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {!displayActiveChat ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 text-center p-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Select a conversation</h3>
            <p className="text-muted-foreground text-sm">Choose a chat from the left to start messaging.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                {(() => {
                  const other = getOtherPerson(displayActiveChat);
                  return (
                    <>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={other.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {other.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{other.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {displayActiveChat.isTrialMode ? "Trial Session" : "Active Session"}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              {displayActiveChat.isTrialMode && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 border gap-1.5 text-xs">
                  <Lock className="h-3 w-3" />
                  Trial Mode — Text only
                </Badge>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingMessages ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                      <Skeleton className={cn("h-12 rounded-2xl", i % 2 === 0 ? "w-48" : "w-40")} />
                    </div>
                  ))}
                </div>
              ) : displayMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-muted-foreground text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                displayMessages.map(msg => {
                  const isMine = msg.senderId === (user?.id || 0);
                  return (
                    <div key={msg.id} className={cn("flex gap-2", isMine ? "flex-row-reverse" : "flex-row")}>
                      {!isMine && (
                        <Avatar className="h-7 w-7 shrink-0 mt-auto">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                            {msg.senderName.split(" ").map(n => n[0]).join("").substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("max-w-[70%] space-y-1", isMine ? "items-end" : "items-start", "flex flex-col")}>
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                          isMine
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        )}>
                          {msg.content}
                        </div>
                        <div className={cn("flex items-center gap-1.5 text-[10px] text-muted-foreground", isMine && "flex-row-reverse")}>
                          <span>{format(new Date(msg.createdAt), "h:mm a")}</span>
                          {isMine && (
                            msg.seen
                              ? <CheckCheck className="h-3 w-3 text-primary" />
                              : <Check className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-background">
              {displayActiveChat.isTrialMode && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg px-3 py-2">
                  <Lock className="h-3 w-3 shrink-0" />
                  File and image sharing is enabled after payment. Text-only during trial.
                </div>
              )}
              <form onSubmit={handleSend} className="flex gap-2">
                {!displayActiveChat.isTrialMode && (
                  <>
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 h-11 w-11 text-muted-foreground hover:text-foreground">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 h-11 w-11 text-muted-foreground hover:text-foreground">
                      <Image className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Input
                  placeholder="Type a message..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  className="flex-1 h-11"
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                />
                <Button type="submit" size="icon" className="shrink-0 h-11 w-11" disabled={!text.trim() || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
