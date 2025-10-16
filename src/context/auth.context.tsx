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
  login as serviceLogin,
  logout as serviceLogout,
  getAuthToken,
  getAuthUser,
  type AuthUser,
} from "@/services/login.service";
import { useRouter } from "next/navigation";

export type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  refresh: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hidrata estado a partir do localStorage
  const refresh = useCallback(() => {
    const token = getAuthToken();
    const u = getAuthUser();
    setUser(token ? u ?? null : null);
  }, []);

  // Login centralizado no contexto
  const signIn = useCallback(async (email: string, password: string) => {
    const u = await serviceLogin({ email, password }); // salva token/user no storage
    setUser(u); // garante atualização imediata do contexto
    // (opcional) router.push("/dashboard");
  }, []);

  const logout = useCallback(() => {
    serviceLogout(); // limpa token e user no storage
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    // hidrata ao montar
    refresh();
    setLoading(false);

    // sincroniza quando outra aba alterar o storage
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "auth_user") refresh();
    };

    // re-hidrata ao voltar o foco na aba
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    // permite seu evento custom continuar funcionando
    const onAuthChanged = () => refresh();

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("auth:changed", onAuthChanged as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(
        "auth:changed",
        onAuthChanged as EventListener
      );
    };
  }, [refresh]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      signIn,
      refresh,
      logout,
    }),
    [user, loading, signIn, refresh, logout]
  );

  // Evita flicker enquanto hidrata o estado inicial
  if (loading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
