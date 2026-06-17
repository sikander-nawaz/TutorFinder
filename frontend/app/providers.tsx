"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { RequestProvider } from "@/context/RequestContext";
import { ChatProvider } from "@/context/ChatContext";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <RequestProvider>
            <ChatProvider>
              {children}
              <Toaster />
            </ChatProvider>
          </RequestProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
