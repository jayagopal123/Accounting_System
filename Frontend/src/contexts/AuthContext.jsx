import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const setUser = useCallback((userData) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
  }, [setUser]);

  const hasPermission = useCallback(
    (required) => {
      if (!user) return false;
      const roles = user.roles || [];
      for (const role of roles) {
        if (role.permissions && Array.isArray(role.permissions)) {
          for (const perm of role.permissions) {
            if (perm?.name === required) return true;
          }
        }
      }
      return false;
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, setUser, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
