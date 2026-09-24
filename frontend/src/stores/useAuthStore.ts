import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserRolePermission {
  _id?: string;
  name: string;
  module?: string;
}

export interface UserRole {
  _id?: string;
  name: string;
  permissions?: UserRolePermission[];
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  roles?: (UserRole | string)[];
  company?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  permissions: string[];
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

function extractPermissions(user: AuthUser | null): string[] {
  if (!user || !user.roles) return [];
  const permsSet = new Set<string>();

  user.roles.forEach((role) => {
    if (typeof role === "object" && role.permissions) {
      role.permissions.forEach((p) => {
        if (p.name) permsSet.add(p.name);
      });
    }
  });

  return Array.from(permsSet);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      permissions: [],
      isAuthenticated: false,

      setAuth: (token: string, user: AuthUser) => {
        const perms = extractPermissions(user);
        set({
          token,
          user,
          permissions: perms,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          token: null,
          user: null,
          permissions: [],
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "isaii_auth_session",
    }
  )
);
