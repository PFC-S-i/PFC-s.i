"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components";
import { requestPasswordReset } from "@/services/password.service";
// import { useToast } from "@/hooks"; // se você tiver toasts

function ForgotPasswordComponent() {
  const router = useRouter();
  // const { toast } = useToast(); // se você tiver toasts

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const emailValidNow = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const emailIsValid = emailValidNow || !touched;

  useEffect(() => {
    return () => abortRef.current?.abort(); // cleanup ao desmontar
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    if (!emailValidNow || loading) return;

    setLoading(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await requestPasswordReset(email, ctrl.signal);

      // Se chegou aqui, consideramos "sucesso" (sem vazar enumeração de e-mails)
      setSubmitted(true);

      // Se quiser toast:
      // toast({ title: "Verifique seu e-mail", description: "Se existir uma conta, enviaremos o link de redefinição." });
    } catch (err: any) {
      // Em erro de rede/servidor, mantemos o formulário para nova tentativa
      // toast?.({ title: "Falha ao enviar", description: err?.message ?? "Tente novamente.", variant: "destructive" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="w-full rounded p-5 bg-card">
        <h2 className="text-lg font-semibold">Verifique seu e-mail</h2>
        <p className="mt-2 text-sm opacity-80">
          Enviaremos o link de redefinição de senha para{" "}
          <span className="font-medium">{email}</span>
        </p>

        <div className="mt-5 grid gap-3">
          <Button
            variant="default"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Voltar ao login
          </Button>

          <p className="text-center text-xs opacity-70">
            Não recebeu? Confira a caixa de spam ou{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setSubmitted(false)}
            >
              tentar novamente
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full grid gap-4" noValidate>
      <div className="w-full">
        <Input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (!touched) setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          placeholder="Seu e-mail"
          icon="email"
          required
          autoComplete="email"
          inputMode="email"
          aria-invalid={!emailIsValid}
          className="w-full rounded"
          disabled={loading}
        />
        {!emailIsValid && (
          <p className="mt-1 text-xs text-red-500">Informe um e-mail válido.</p>
        )}
      </div>

      <Button
        variant="default"
        type="submit"
        className="w-full px-4 py-2"
        aria-label="Enviar instruções de recuperação"
        disabled={loading || !emailValidNow}
      >
        {loading ? "Enviando..." : "Enviar link de recuperação"}
      </Button>

      <div className="mt-2 flex items-center justify-start">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/login")}
          disabled={loading}
        >
          Voltar
        </Button>
      </div>
    </form>
  );
}

export { ForgotPasswordComponent };
