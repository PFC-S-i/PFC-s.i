// app/login/components/session.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { LoginComponent } from "./login-component";

export function Session() {
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const next = params.get("next") || "/";
      router.replace(next);
    }
  }, [isAuthenticated, loading, params, router]);

  // Evita flicker inicial e não mostra o form se já estiver logado
  if (loading || isAuthenticated) return null;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5">
      <LoginComponent />
    </div>
  );
}
