"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/button";

// Página de perfil em modo DEMO (sem backend / sem auth)
type Fav = {
  id: string;
  rank: number | null;
  name: string;
  symbol: string;
  image: string;
  price: number | null;
  change24h: number | null;
};

const fmtBRL = (v: number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v);

const fmtPct = (v: number | null) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

export default function ProfilePageDemo() {
  // estado "mockado" para visualizar o front
  const [name, setName] = useState("Satoshi Nakamoto");
  const [email, setEmail] = useState("satoshi@infocrypto.dev");

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // favoritos "somente visual"
  const demoFavorites: Fav[] = [
    {
      id: "bitcoin",
      rank: 1,
      name: "Bitcoin",
      symbol: "BTC",
      image:
        "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
      price: 352345.12,
      change24h: 1.23,
    },
    {
      id: "ethereum",
      rank: 2,
      name: "Ethereum",
      symbol: "ETH",
      image:
        "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
      price: 17654.89,
      change24h: -0.84,
    },
    {
      id: "solana",
      rank: 5,
      name: "Solana",
      symbol: "SOL",
      image:
        "https://assets.coingecko.com/coins/images/4128/large/solana.png?1696504756",
      price: 689.45,
      change24h: 4.7,
    },
  ];

  async function handleSaveProfile() {
    try {
      setSaveLoading(true);
      setSuccess(null);
      setError(null);

      // validação leve só para UX (ainda demo)
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error("Informe um e-mail válido.");
      }

      await new Promise((r) => setTimeout(r, 600));
      setSuccess("Informações atualizadas (DEMO).");
    } catch (e: any) {
      setError(e?.message || "Não foi possível salvar (DEMO).");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleChangePassword() {
    try {
      setPwdLoading(true);
      setPwdSuccess(null);
      setPwdError(null);

      if (!currentPassword || !newPassword) {
        throw new Error("Preencha a senha atual e a nova senha.");
      }
      if (newPassword.length < 8) {
        throw new Error("A nova senha deve ter pelo menos 8 caracteres.");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("A confirmação não coincide com a nova senha.");
      }

      await new Promise((r) => setTimeout(r, 600));
      setPwdSuccess("Senha alterada (DEMO).");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setPwdError(e?.message || "Não foi possível alterar (DEMO).");
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <main className="px-4 md:px-10 lg:px-20 xl:px-32 py-10 text-gray-200">
      <h1 className="text-3xl font-semibold mb-2">Meu perfil</h1>
      <p className="mb-6 text-sm opacity-70">
        Modo demonstração — sem autenticação nem chamadas ao servidor.
      </p>

      {/* Dados do usuário */}
      <section className="rounded-2xl bg-[#1B1B1B] border border-white/10 p-6 mb-8">
        <h2 className="text-xl font-medium mb-4">Informações da conta</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-emerald-200">
            {success}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm opacity-80" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="rounded-xl bg-[#151515] border border-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm opacity-80" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="rounded-xl bg-[#151515] border border-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            className="px-5"
            onClick={handleSaveProfile}
            disabled={saveLoading}
          >
            {saveLoading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </section>

      {/* Favoritos (somente visual) */}
      <section className="rounded-2xl bg-[#1B1B1B] border border-white/10 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Favoritos (DEMO)</h2>
          <span className="text-xs opacity-70">
            Exibição ilustrativa — sem integração
          </span>
        </div>

        {/* Cabeçalho */}
        <div className="grid grid-cols-[56px_1fr_180px_140px_56px] items-center px-4 py-2 rounded-xl bg-[#151515] border border-white/10 text-xs uppercase tracking-wide opacity-70">
          <span>#</span>
          <span>Nome</span>
          <span className="text-right">Preço</span>
          <span className="text-right">24h</span>
          <span className="sr-only">Favorito</span>
        </div>

        {/* Linhas mockadas */}
        <div className="mt-2 space-y-2">
          {demoFavorites.map((c) => {
            const pct = c.change24h ?? 0;
            const positive = pct > 0;
            const negative = pct < 0;
            return (
              <div
                key={c.id}
                className="grid grid-cols-[56px_1fr_180px_140px_56px] items-center px-4 py-3 rounded-xl bg-[#151515] border border-white/10"
              >
                <div className="opacity-80">{c.rank ?? "—"}</div>

                <div className="flex items-center gap-3">
                  <img src={c.image} alt={c.name} className="size-6 rounded-full" />
                  <div className="flex flex-col">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs opacity-60">{c.symbol}</span>
                  </div>
                </div>

                <div className="text-right font-medium">{fmtBRL(c.price)}</div>

                <div
                  className={[
                    "text-right font-medium",
                    positive ? "text-green-400" : "",
                    negative ? "text-red-400" : "",
                  ].join(" ")}
                >
                  {fmtPct(c.change24h)}
                </div>

                <div className="flex justify-end">
                  {/* apenas visual: botão desabilitado com estrela preenchida */}
                  <button
                    className="p-2 rounded-lg opacity-80 cursor-default"
                    aria-label="Favorito"
                    disabled
                  >
                    <Star fill="currentColor" className="text-yellow-400" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Alterar senha */}
      <section className="rounded-2xl bg-[#1B1B1B] border border-white/10 p-6">
        <h2 className="text-xl font-medium mb-4">Alterar senha</h2>

        {pwdError && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-red-200">
            {pwdError}
          </div>
        )}
        {pwdSuccess && (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-emerald-200">
            {pwdSuccess}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm opacity-80" htmlFor="currentPassword">
              Senha atual
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-xl bg-[#151515] border border-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm opacity-80" htmlFor="newPassword">
              Nova senha
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-xl bg-[#151515] border border-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm opacity-80" htmlFor="confirmPassword">
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl bg-[#151515] border border-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            className="px-5"
            onClick={handleChangePassword}
            disabled={pwdLoading}
          >
            {pwdLoading ? "Alterando..." : "Alterar senha"}
          </Button>
        </div>
      </section>
    </main>
  );
}
