import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { authService, LoginPayload, SignupPayload } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    authService.getMe().then((u) => {
      setUser(u);
      setIsLoading(false);
    });
    const onUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  const login = async (payload: LoginPayload) => {
    const u = await authService.login(payload);
    setUser(u);
  };

  const signup = async (payload: SignupPayload) => {
    const u = await authService.signup(payload);
    setUser(u);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (payload: Partial<User>) => {
    const u = await authService.updateProfile(payload);
    setUser(u);
    toast({ title: "Profile updated successfully" });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
