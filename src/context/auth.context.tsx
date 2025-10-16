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
import { useRouter } from "next/navigation";

import {
  login as serviceLogin,
  logout as serviceLogout,
  getAuthToken,
  getAuthUser,
  type AuthUser,
} from "@/services/login.service";

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
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Lê do storage e atualiza o estado (token + user)
  const refresh = useCallback(() => {
    const t = getAuthToken();
    const u = getAuthUser();
    setToken(t);
    setUser(t ? u ?? null : null);
  }, []);

  // Login centralizado: delega ao service, reidrata do storage e notifica
  const signIn = useCallback(
    async (email: string, password: string) => {
      await serviceLogin({ email, password }); // grava token/user no storage
      refresh(); // garante estado consistente independente do retorno do service
      window.dispatchEvent(new Event("auth:changed"));
      // Opcional, se tiver RSC dependente de auth: router.refresh();
      // Opcional navegação: router.push("/dashboard");
    },
    [refresh]
  );

  const logout = useCallback(() => {
    serviceLogout(); // limpa storage
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event("auth:changed"));
    // router.refresh(); // opcional, se usar RSC dependente de auth
    router.push("/login");
  }, [router]);

  useEffect(() => {
    // Hidrata ao montar
    refresh();
    setLoading(false);

    // Sincroniza quando outra aba alterar o storage
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "auth_user") refresh();
    };

    // Re-hidrata ao voltar o foco na aba
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    // Evento custom para atualizações na MESMA aba
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
      isAuthenticated: !!token,
      loading,
      signIn,
      refresh,
      logout,
    }),
    [user, token, loading, signIn, refresh, logout]
  );

  if (loading) return null; // evita flicker

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
