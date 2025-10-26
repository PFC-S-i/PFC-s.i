"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input } from "@/components";
import { resetPassword } from "@/services/password.service";
import { useToast } from "@/hooks";

export default function ResetPasswordPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { toast } = useToast();

  const token = (search.get("token") || "").trim();

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [touched1, setTouched1] = useState(false);
  const [touched2, setTouched2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const minLenOk = p1.length >= 8;
  const matchOk = p1 === p2;
  const formValid = minLenOk && matchOk && !!token && !loading;

  const showP1Error = touched1 && !minLenOk;
  const showP2Error = touched2 && !matchOk;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched1(true);
    setTouched2(true);
    setError(null);
    if (!formValid) return;

    setLoading(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await resetPassword(token, p1, ctrl.signal);
      setDone(true);
      toast?.({
        title: "Senha redefinida",
        description: "Faça login com sua nova senha.",
      });
    } catch (err: any) {
      setError(err?.message || "Falha ao redefinir a senha.");
      toast?.({
        title: "Erro",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full rounded p-5 bg-card">
        <h2 className="text-lg font-semibold">Link inválido</h2>
        <p className="mt-2 text-sm opacity-80">
          O link de redefinição está incompleto (sem token).
        </p>
        <div className="mt-4">
          <Button onClick={() => router.push("/forgot-my-password")}>
            Solicitar novo link
          </Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full rounded p-5 bg-card">
        <h2 className="text-lg font-semibold">Senha redefinida</h2>
        <p className="mt-2 text-sm opacity-80">
          Sua senha foi alterada com sucesso. Use a nova senha para entrar.
        </p>
        <div className="mt-4 grid gap-3">
          <Button className="w-full" onClick={() => router.push("/login")}>
            Ir para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full grid gap-4" noValidate>
      <div>
        <Input
          type="password"
          value={p1}
          onChange={(e) => setP1(e.target.value)}
          onBlur={() => setTouched1(true)}
          placeholder="Nova senha"
          icon="lock"
          required
          autoComplete="new-password"
          aria-invalid={showP1Error}
          disabled={loading}
        />
        {showP1Error && (
          <p className="mt-1 text-xs text-red-500">
            A senha deve ter pelo menos 8 caracteres.
          </p>
        )}
      </div>

      <div>
        <Input
          type="password"
          value={p2}
          onChange={(e) => setP2(e.target.value)}
          onBlur={() => setTouched2(true)}
          placeholder="Confirmar nova senha"
          icon="lock"
          required
          autoComplete="new-password"
          aria-invalid={showP2Error}
          disabled={loading}
        />
        {showP2Error && (
          <p className="mt-1 text-xs text-red-500">As senhas não coincidem.</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        className="w-full"
        aria-label="Redefinir senha"
        disabled={!formValid}
      >
        {loading ? "Redefinindo..." : "Redefinir senha"}
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
