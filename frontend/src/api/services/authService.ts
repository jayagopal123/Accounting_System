import { authClient } from "../client";
import { unwrap } from "../normalize";
import { type AuthUser } from "@/stores/useAuthStore";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const res = await authClient.post("/login", credentials);
    return unwrap<LoginResponse>(res);
  },

  logout: async (): Promise<void> => {
    await authClient.post("/logout");
  },
};
