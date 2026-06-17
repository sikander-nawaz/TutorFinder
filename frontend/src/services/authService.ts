import { api } from "./api";
import { User, Role } from "@/types";

export interface LoginPayload { email: string; password: string; }
export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  city?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<User> {
    const { data } = await api.post("/auth/login", payload);
    return data.data.user;
  },
  async signup(payload: SignupPayload): Promise<User> {
    const { data } = await api.post("/auth/signup", payload);
    return data.data.user;
  },
  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
  async getMe(): Promise<User | null> {
    try {
      const { data } = await api.get("/auth/me");
      return data.data.user;
    } catch {
      return null;
    }
  },
  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/auth/reset-password", { token, password });
  },
  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await api.patch("/profile", payload);
    return data.data.user;
  },
};
