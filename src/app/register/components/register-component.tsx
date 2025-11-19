// src/app/register/components/register-component.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, Input } from "@/components";
import { PasswordInput } from "@/components/password-input/password-input";
import { login } from "@/services/login.service";
import { registerUser } from "@/services/register.service";
import { registerSchema } from "@/app/schemas/register.schema";

/** Extrai uma mensagem legível de um erro desconhecido (fetch/axios/FastAPI). */
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

  // Termos (controle manual)
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setTermsError(null);

    // 1) Validação com Zod (sem termos)
    const parsed = registerSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
      confirm,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setError(firstIssue?.message || "Revise os dados informados.");
      return;
    }

    // 2) Validação manual dos Termos
    if (!acceptTerms) {
      setTermsError(
        "Você precisa aceitar os Termos de Uso e a Política de Privacidade para criar a conta."
      );
      return;
    }

    try {
      setIsLoading(true);

      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      await login({ email: email.trim(), password });
      router.push("/");
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
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          icon="user"
          required
          className="w-full rounded"
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
          className="w-full rounded"
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
          className="w-full rounded"
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
          className="w-full rounded"
          autoComplete="new-password"
        />
      </div>

      {/* Termos de Uso — obrigatório */}
      <div className="flex items-start gap-3">
        <input
          id="accept_terms"
          type="checkbox"
          className={`mt-1 h-4 w-4 rounded border ${
            termsError ? "ring-1 ring-red-500" : ""
          }`}
          checked={acceptTerms}
          onChange={(e) => {
            setAcceptTerms(e.target.checked);
            if (e.target.checked) setTermsError(null);
          }}
          required
          aria-invalid={!!termsError}
          aria-describedby={termsError ? "terms-error" : undefined}
        />
        <label htmlFor="accept_terms" className="text-sm leading-5">
          Eu li e aceito os{" "}
          <Link href="/terms" className="underline">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacy" className="underline">
            Política de Privacidade
          </Link>
          .
        </label>
      </div>

      {termsError && (
        <p
          id="terms-error"
          className="text-xs text-red-500 -mt-2"
          aria-live="polite"
        >
          {termsError}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500" aria-live="polite">
          {error}
        </p>
      )}

      <Button
        variant="default"
        type="submit"
        disabled={isLoading || !acceptTerms}
        className="w-full px-4 py-2"
        title={
          !acceptTerms
            ? "Marque a caixa de Termos de Uso para criar a conta"
            : undefined
        }
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
