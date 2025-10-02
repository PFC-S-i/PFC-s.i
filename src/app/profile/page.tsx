// app/profile/page.tsx
"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/button";

// ====== Tipos ======
type Fav = {
  id: string;
  rank: number | null;
  name: string;
  symbol: string;
  image: string;
  price: number | null;
  change24h: number | null;
};

// ====== Constantes de estilo (reduz duplicação) ======
const CARD = "rounded-2xl bg-[#1B1B1B] border border-white/10";
const INPUT =
  "rounded-xl bg-[#151515] border border-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-white/20";
const GRID_COLS = "grid grid-cols-[56px_1fr_180px_140px_56px]";
const HEADER_ROW = `${GRID_COLS} items-center px-4 py-2 rounded-xl bg-[#151515] border border-white/10 text-xs uppercase tracking-wide opacity-70`;

// ====== Helpers ======
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const fmtBRL = (v: number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v);

const fmtPct = (v: number | null) =>
  v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

function getErrMsg(e: unknown) {
  return e instanceof Error ? e.message : String(e ?? "Erro desconhecido");
}

function changeClass(change: number | null) {
  if (change == null) return "";
  if (change > 0) return "text-green-400";
  if (change < 0) return "text-red-400";
  return "";
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ====== Mock de favoritos (fora do componente para não recriar a cada render) ======
const DEMO_FAVORITES: Fav[] = [
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

// ====== UI simples reutilizável ======
function Alert({
  kind,
  children,
}: {
  kind: "error" | "success";
  children: ReactNode;
}) {
  const base = "mb-4 rounded-lg px-4 py-2";
  const tone =
    kind === "error"
      ? "border border-red-500/40 bg-red-500/10 text-red-200"
      : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
  return <div className={`${base} ${tone}`}>{children}</div>;
}

function LabeledInput(props: {
  id: string;
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const { id, label, type = "text", value, placeholder, onChange } = props;
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm opacity-80" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        className={INPUT}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function FavoriteHeader() {
  return (
    <div className={HEADER_ROW}>
      <span>#</span>
      <span>Nome</span>
      <span className="text-right">Preço</span>
      <span className="text-right">24h</span>
      <span className="sr-only">Favorito</span>
    </div>
  );
}

function FavoriteRow({ fav }: { fav: Fav }) {
  return (
    <div
      className={`${GRID_COLS} items-center px-4 py-3 rounded-xl bg-[#151515] border border-white/10`}
    >
      <div className="opacity-80">{fav.rank ?? "—"}</div>

      <div className="flex items-center gap-3">
        <Image
          src={fav.image}
          alt={fav.name}
          width={24}
          height={24}
          className="rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-medium">{fav.name}</span>
          <span className="text-xs opacity-60">{fav.symbol}</span>
        </div>
      </div>

      <div className="text-right font-medium">{fmtBRL(fav.price)}</div>

      <div className={`text-right font-medium ${changeClass(fav.change24h)}`}>
        {fmtPct(fav.change24h)}
      </div>

      <div className="flex justify-end">
        {/* apenas visual: botão desabilitado com estrela preenchida */}
        <button
          className="p-2 rounded-lg opacity-80 cursor-default"
          aria-label="Favorito"
          disabled
        >
          <Star
            fill="currentColor"
            className="text-yellow-400"
            strokeWidth={1.5}
          />
        </button>
      </div>
    </div>
  );
}

// ====== Página ======
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

  async function handleSaveProfile() {
    try {
      setSaveLoading(true);
      setSuccess(null);
      setError(null);

      if (!email || !EMAIL_RE.test(email))
        throw new Error("Informe um e-mail válido.");

      await sleep(600); // DEMO
      setSuccess("Informações atualizadas (DEMO).");
    } catch (e: unknown) {
      setError(getErrMsg(e) || "Não foi possível salvar (DEMO).");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleChangePassword() {
    try {
      setPwdLoading(true);
      setPwdSuccess(null);
      setPwdError(null);

      if (!currentPassword || !newPassword)
        throw new Error("Preencha a senha atual e a nova senha.");
      if (newPassword.length < 8)
        throw new Error("A nova senha deve ter pelo menos 8 caracteres.");
      if (newPassword !== confirmPassword)
        throw new Error("A confirmação não coincide com a nova senha.");

      await sleep(600); // DEMO
      setPwdSuccess("Senha alterada (DEMO).");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: unknown) {
      setPwdError(getErrMsg(e) || "Não foi possível alterar (DEMO).");
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
      <section className={`${CARD} p-6 mb-8`}>
        <h2 className="text-xl font-medium mb-4">Informações da conta</h2>

        {error ? <Alert kind="error">{error}</Alert> : null}
        {success ? <Alert kind="success">{success}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledInput
            id="name"
            label="Nome"
            value={name}
            onChange={setName}
            placeholder="Seu nome"
          />
          <LabeledInput
            id="email"
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="voce@exemplo.com"
          />
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
      <section className={`${CARD} p-6 mb-8`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Favoritos (DEMO)</h2>
          <span className="text-xs opacity-70">
            Exibição ilustrativa — sem integração
          </span>
        </div>

        <FavoriteHeader />
        <div className="mt-2 space-y-2">
          {DEMO_FAVORITES.map((f) => (
            <FavoriteRow key={f.id} fav={f} />
          ))}
        </div>
      </section>

      {/* Alterar senha */}
      <section className={`${CARD} p-6`}>
        <h2 className="text-xl font-medium mb-4">Alterar senha</h2>

        {pwdError ? <Alert kind="error">{pwdError}</Alert> : null}
        {pwdSuccess ? <Alert kind="success">{pwdSuccess}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-3">
          <LabeledInput
            id="currentPassword"
            label="Senha atual"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <LabeledInput
            id="newPassword"
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <LabeledInput
            id="confirmPassword"
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
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
