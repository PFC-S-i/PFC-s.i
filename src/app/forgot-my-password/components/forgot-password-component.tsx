"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input } from "@/components";

function ForgotPasswordComponent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const emailIsValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !touched;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);

    // Sem chamada de API por enquanto — apenas estado visual.
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <div className="w-full rounded p-5 bg-card">
        <h2 className="text-lg font-semibold">Verifique seu e-mail</h2>
        <p className="mt-2 text-sm opacity-80">
          Se existir uma conta para <span className="font-medium">{email}</span>
          , enviaremos um link para redefinir a senha. Pode levar alguns
          minutos.
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
          className="w-full rounded "
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
      >
        Enviar link de recuperação
      </Button>

      <div className="mt-2 flex items-center justify-">
        <Button
          variant="outline"
          className=""
          onClick={() => router.push("/login")}
        >
          Voltar
        </Button>
      </div>
    </form>
  );
}

export { ForgotPasswordComponent };
