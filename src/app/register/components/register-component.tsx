"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, Input } from "@/components";
import { PasswordInput } from "@/components/password-input/password-input";
import { login } from "@/services/login.service";
import { registerUser } from "@/services/register.service";

/**
 * Extrai uma mensagem legível de um erro desconhecido (fetch/axios/FastAPI).
 * Mesmo helper do login para padronizar mensagens.
 */
function getErrorMessage(err: unknown): string {
  const fallback = "Não foi possível criar sua conta. Tente novamente.";

  if (err instanceof Error && err.message) return err.message;

  if (typeof err === "object" && err !== null) {
    const maybeResponse = (err as Record<string, unknown>)["response"];
    if (typeof maybeResponse === "object" && maybeResponse !== null) {
      const data = (maybeResponse as Record<string, unknown>)["data"];
      if (typeof data === "string") return data;

      if (typeof data === "object" && data !== null) {
        const detail = (data as Record<string, unknown>)["detail"];
        if (typeof detail === "string") return detail;
        if (Array.isArray(detail) && detail[0]?.msg)
          return detail[0].msg as string;

        const message = (data as Record<string, unknown>)["message"];
        if (typeof message === "string") return message;
      }
    }

    const message = (err as Record<string, unknown>)["message"];
    if (typeof message === "string") return message;
  }

  return fallback;
}

export function RegisterComponent() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirm) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setIsLoading(true);

      // 1) cria o usuário
      await registerUser({ name, email, password });

      // 2) auto-login para já entrar na plataforma
      await login({ email, password });

      // 3) redireciona (ajuste a rota se preferir ir ao /dashboard)
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
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          icon="user"
          required
          className="w-full rounded "
        />
      </div>

      <div className="w-full">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          icon="email"
          required
          className="w-full rounded "
          autoComplete="email"
        />
      </div>

      <div className="w-full">
        <PasswordInput
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
          className="w-full rounded "
          autoComplete="new-password"
        />
      </div>

      <div className="w-full">
        <PasswordInput
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirmar senha"
          required
          className="w-full rounded "
          autoComplete="new-password"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        variant="default"
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2"
      >
        {isLoading ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="mt-4 text-center text-sm">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-semibold hover:underline text-primary"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
