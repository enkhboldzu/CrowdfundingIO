"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type UserRole = "user" | "admin";

export interface AuthUser {
  name: string;
  email?: string | null;
  avatar?: string | null;
}

const ROLE_COOKIE   = "cfmn_auth";
const USER_LS_KEY   = "cfmn_user";     // localStorage key for user data

type SessionResponse =
  | { authenticated: false }
  | { authenticated: true; role: UserRole; user: AuthUser };

/* ── Cookie helpers ─────────────────────────────────────────────────── */

function readAuthCookie(): UserRole | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )cfmn_auth=([^;]+)/);
  return m ? (m[1] as UserRole) : null;
}

function writeAuthCookie(role: UserRole) {
  document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=86400; SameSite=Lax`;
}

function clearAuthCookie() {
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`;
}

/* ── localStorage helpers ───────────────────────────────────────────── */

function loadStoredUser(): AuthUser | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_LS_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function saveStoredUser(u: AuthUser) {
  try { localStorage.setItem(USER_LS_KEY, JSON.stringify(u)); } catch { /* ignore */ }
}

function clearStoredUser() {
  try { localStorage.removeItem(USER_LS_KEY); } catch { /* ignore */ }
}

/* ── Context ────────────────────────────────────────────────────────── */

interface AuthContextType {
  isLoading:  boolean;
  isLoggedIn: boolean;
  role:  UserRole | null;
  user:  AuthUser | null;
  login:  (role?: UserRole, user?: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoading:  true,
  isLoggedIn: false,
  role:  null,
  user:  null,
  login:  () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading,  setIsLoading]  = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const clearClientAuth = useCallback(() => {
    clearAuthCookie();
    clearStoredUser();
    setIsLoggedIn(false);
    setRole(null);
    setUser(null);
  }, []);

  // Hydrate auth state from the server session so UI auth cannot drift from API auth.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json().catch(() => null) as SessionResponse | null;

        if (cancelled) return;

        if (res.ok && data?.authenticated) {
          writeAuthCookie(data.role);
          saveStoredUser(data.user);
          setIsLoggedIn(true);
          setRole(data.role);
          setUser(data.user);
        } else {
          clearClientAuth();
        }
      } catch {
        if (!cancelled) {
          const r = readAuthCookie();
          const stored = loadStoredUser();
          setIsLoggedIn(Boolean(r));
          setRole(r);
          setUser(stored);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    hydrate();
    return () => { cancelled = true; };
  }, [clearClientAuth]);

  const login = useCallback((r: UserRole = "user", userData?: AuthUser) => {
    writeAuthCookie(r);
    setIsLoggedIn(true);
    setRole(r);
    if (userData) {
      setUser(userData);
      saveStoredUser(userData);
    }
  }, []);

  const logout = useCallback(() => {
    clearClientAuth();
  }, [clearClientAuth]);

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
