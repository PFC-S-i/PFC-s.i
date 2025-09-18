// src/context/auth.context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  getAuthToken,
  getAuthUser,
  logout as svcLogout,
  type AuthUser,
} from "@/services/login.service";
import { useRouter } from "next/navigation";

export type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  refresh: () => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  // deixa estável p/ não recriar a cada render
  const refresh = useCallback(() => {
    const token = getAuthToken();
    const u = getAuthUser();
    setUser(token ? u : null);
  }, []);

  const handleLogout = useCallback(() => {
    svcLogout();
    refresh();
    router.push("/login");
  }, [refresh, router]);

  useEffect(() => {
    refresh();
    setReady(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "auth_user") refresh();
    };
    const onAuthChanged = () => refresh(); // evento custom do próprio app

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:changed", onAuthChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:changed", onAuthChanged);
    };
  }, [refresh]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      refresh,
      logout: handleLogout,
    }),
    [user, refresh, handleLogout]
  );

  if (!ready) return null; // evita flicker enquanto hidrata

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
