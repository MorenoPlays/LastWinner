"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authApi } from "@/lib/api";
import { setAccessTokenCookie, clearAccessTokenCookie } from "@/lib/cookies";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── read stored token on mount ── */
  useEffect(() => {
    setToken(localStorage.getItem("accessToken"));
    setLoading(false);
  }, []);

  /* ── fetch /auth/me whenever a token is present ── */
  const doFetch = useCallback(async () => {
    if (!token) { setUser(null); return; }
    try {
      const full = await authApi.getMe();
      setUser(full as unknown as User);
    } catch {
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (token) void doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const refresh = useCallback(async () => {
    await doFetch();
  }, [doFetch]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem("accessToken", data.accessToken);
    setAccessTokenCookie(data.accessToken);
    setToken(data.accessToken);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const data = await authApi.register({ username, email, password });
      localStorage.setItem("accessToken", data.accessToken);
      setAccessTokenCookie(data.accessToken);
      setToken(data.accessToken);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    clearAccessTokenCookie();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
