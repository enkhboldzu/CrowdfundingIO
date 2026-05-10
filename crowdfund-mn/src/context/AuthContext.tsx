"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type UserRole = "user" | "admin";

export interface AuthUser {
  name: string;
}

const ROLE_COOKIE = "cfmn_auth";

function readAuthCookie(): UserRole | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )cfmn_auth=([^;]+)/);
  return m ? (m[1] as UserRole) : null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  role: UserRole | null;
  user: AuthUser | null;
  login: (role?: UserRole, user?: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  role: null,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const r = readAuthCookie();
    if (r) {
      setIsLoggedIn(true);
      setRole(r);
    }
  }, []);

  const login = useCallback((r: UserRole = "user", userData?: AuthUser) => {
    document.cookie = `${ROLE_COOKIE}=${r}; path=/; max-age=86400; SameSite=Lax`;
    setIsLoggedIn(true);
    setRole(r);
    if (userData) setUser(userData);
  }, []);

  const logout = useCallback(() => {
    document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`;
    setIsLoggedIn(false);
    setRole(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
