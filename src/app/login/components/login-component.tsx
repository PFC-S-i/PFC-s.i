// app/login/components/login-component.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button, Input } from "@/components";
import { PasswordInput } from "@/components/password-input/password-input";
import { getErrorMessage } from "@/services/login.service"; // só reaproveitamos o parser de erro
import { useAuth } from "@/context/auth.context";

function LoginComponent() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email.trim(), password); // <- chama o CONTEXTO (atualiza estado na hora)
      // Se tiver páginas Server Components que dependem de auth por cookie/headers,
      // você pode descomentar a linha abaixo:
      // router.refresh();

      const next = params.get("next") || "/";
      router.push(next);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full grid gap-4" noValidate>
      <div className="w-full">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          icon="email"
          required
          autoComplete="email"
          inputMode="email"
          className="w-full rounded border"
          disabled={isLoading}
        />
      </div>

      <div className="w-full">
        <PasswordInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
          autoComplete="current-password"
          className="w-full rounded border"
          disabled={isLoading}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      <Link
        href="/forgot-my-password"
        className="text-sm text-primary hover:underline"
      >
        Esqueci minha senha
      </Link>

      <Button
        variant="default"
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full px-4 py-2"
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>

      <p className="mt-4 text-center text-sm">
        Não tem conta?{" "}
        <Link
          href="/register"
          className="font-semibold hover:underline text-primary"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}

export { LoginComponent };
