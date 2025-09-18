"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, Input } from "@/components";
import { PasswordInput } from "@/components/password-input/password-input";

// 👇 importa o service
import { login } from "@/services/login.service";

/**
 * Extrai uma mensagem legível de um erro desconhecido (fetch/axios/FastAPI).
 * Evita o uso de `any` e respeita o ESLint.
 */
function getErrorMessage(err: unknown): string {
  const fallback = "Não foi possível entrar. Tente novamente.";

  // Erros padrão do JS
  if (err instanceof Error && err.message) return err.message;

  // Objetos genéricos (ex.: axios error, Response JSON do backend)
  if (typeof err === "object" && err !== null) {
    // axios: err.response?.data
    const maybeResponse = (err as Record<string, unknown>)["response"];
    if (typeof maybeResponse === "object" && maybeResponse !== null) {
      const data = (maybeResponse as Record<string, unknown>)["data"];

      if (typeof data === "string") return data;

      if (typeof data === "object" && data !== null) {
        // FastAPI costuma enviar { detail: string | { msg: string }[] }
        const detail = (data as Record<string, unknown>)["detail"];
        if (typeof detail === "string") return detail;

        if (Array.isArray(detail) && detail.length > 0) {
          const first = detail[0];
          if (first && typeof first === "object") {
            const msg = (first as Record<string, unknown>)["msg"];
            if (typeof msg === "string") return msg;
          }
        }

        const message = (data as Record<string, unknown>)["message"];
        if (typeof message === "string") return message;
      }
    }

    // Alguns backends enviam { message: "..." }
    const message = (err as Record<string, unknown>)["message"];
    if (typeof message === "string") return message;
  }

  // Fallback
  return fallback;
}

function LoginComponent() {
  const router = useRouter();

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

      // Chama o service de login
      await login({ email, password });

      // Redireciona para a home "/" após logar
      router.push("/");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full grid gap-4">
      <div className="w-full">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          icon="email"
          required
          className="w-full rounded border"
        />
      </div>

      <div className="w-full">
        <PasswordInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
          className="w-full rounded border"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

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
