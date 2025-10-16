// app/carteira/simulador.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Simulador BIP39 (educacional)
 * - Não cole sua seed real. Use exemplos fictícios.
 * - Tudo roda no cliente.
 * - Mostra entropia base BIP39, entropia extra do texto, tempo estimado p/ quebra
 *   (assumindo 1e9 palpites/seg) e veredito colorido baseado no TEMPO.
 */

const WORDSET_TO_BITS: Record<number, number> = {
  12: 128,
  15: 160,
  18: 192,
  21: 224,
  24: 256,
};

// 🔧 Baseline do atacante: 1e9 palpites/seg (~GPU moderna)
const GUESSES_PER_SEC = 1e9;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function estimateAlphabetSize(s: string) {
  const hasLower = /[a-z]/.test(s);
  const hasUpper = /[A-Z]/.test(s);
  const hasDigit = /\d/.test(s);
  const hasSpace = /\s/.test(s);
  const hasSymbol = /[^\p{L}\p{N}\s]/u.test(s); // unicode symbols/punct

  let size = 0;
  if (hasLower) size += 26;
  if (hasUpper) size += 26;
  if (hasDigit) size += 10;
  if (hasSymbol) size += 33;
  if (hasSpace) size += 1;

  return size > 0 ? size : 1;
}

function visibleLength(s: string) {
  return (s ?? "").length;
}

function secondsToHuman(seconds: number) {
  if (!isFinite(seconds) || seconds <= 0) return "instantâneo";
  const MINUTE = 60;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const YEAR = 365.25 * DAY;
  const MILLENNIUM = 1000 * YEAR;
  const BILLION_YEARS = 1e9 * YEAR;

  if (seconds < MINUTE) return `${seconds.toFixed(2)} s`;
  if (seconds < HOUR) return `${(seconds / MINUTE).toFixed(2)} min`;
  if (seconds < DAY) return `${(seconds / HOUR).toFixed(2)} h`;
  if (seconds < YEAR) return `${(seconds / DAY).toFixed(2)} dias`;
  if (seconds < MILLENNIUM) return `${(seconds / YEAR).toFixed(2)} anos`;
  if (seconds < BILLION_YEARS)
    return `${(seconds / MILLENNIUM).toFixed(2)} milênios`;
  return `${(seconds / BILLION_YEARS).toFixed(3)} bilhões de anos`;
}

type VerdictLevel = "weak" | "medium" | "strong";
type Verdict = {
  level: VerdictLevel;
  text: string;
  color: string;
  bg: string;
  border: string;
};

/**
 * Veredito baseado em TEMPO para varrer o espaço (só a frase digitada):
 * - < 1 dia  → Fraca (vermelho)
 * - < 100 anos → Média (amarelo)
 * - ≥ 100 anos → Forte (verde)
 */
function getVerdictByTime(seconds: number): Verdict {
  if (seconds < 60 * 60 * 24) {
    return {
      level: "weak",
      text: "Fraca — pode ser descoberta rapidamente (menos de 1 dia).",
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
    };
  }
  if (seconds < 100 * 365.25 * 24 * 3600) {
    return {
      level: "medium",
      text: "Média — levaria muito tempo, mas ainda é prudente reforçar.",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
    };
  }
  return {
    level: "strong",
    text: "Forte — praticamente impossível por força bruta nesse cenário.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  };
}

/** PBKDF2-HMAC-SHA512 (2048 iterações), BIP39 */
async function deriveBip39SeedHex(mnemonic: string, passphrase: string) {
  const normMnemonic = mnemonic.normalize("NFKD");
  const normPass = passphrase.normalize("NFKD");
  const salt = "mnemonic" + normPass;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(normMnemonic),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-512",
      salt: enc.encode(salt),
      iterations: 2048,
    },
    key,
    512
  );

  return bufferToHex(bits);
}

function bufferToHex(buf: ArrayBuffer) {
  const b = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return s;
}

export default function Simulador() {
  const [wordCount, setWordCount] = useState<12 | 15 | 18 | 21 | 24>(12);
  const [userText, setUserText] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [seedHex, setSeedHex] = useState<string>("");

  const hasInput = userText.trim().length > 0;

  const baseBits = WORDSET_TO_BITS[wordCount];
  const alphabetSize = useMemo(
    () => estimateAlphabetSize(userText),
    [userText]
  );

  const extraBits = useMemo(() => {
    const len = visibleLength(userText);
    const perSymbol = Math.log2(alphabetSize);
    return clamp(len * perSymbol, 0, 4096);
  }, [userText, alphabetSize]);

  // 👇 Total apenas para exibição (informativo)
  const totalBits = useMemo(() => baseBits + extraBits, [baseBits, extraBits]);

  // 👇 Para veredito/tempo: considerar SÓ a frase digitada
  const totalBitsForVerdict = useMemo(() => extraBits, [extraBits]);

  // Tempo estimado = 2^(bits) / guesses_per_sec (log-safe)
  const crackSeconds = useMemo(() => {
    const log10Space = totalBitsForVerdict * Math.LOG10E * Math.log(2); // log10(2^bits)
    const log10Time = log10Space - Math.log10(GUESSES_PER_SEC);
    if (log10Time > 308) return Number.POSITIVE_INFINITY;
    if (log10Time < -6) return 0;
    return Math.pow(10, log10Time);
  }, [totalBitsForVerdict]);

  // Veredito com base no TEMPO (dinâmico)
  const verdictMemo = useMemo(
    () => getVerdictByTime(crackSeconds),
    [crackSeconds]
  );

  // Seed atualiza apenas se houver entrada
  useEffect(() => {
    let cancelled = false;

    if (!hasInput) {
      setSeedHex("");
      return;
    }

    (async () => {
      try {
        const hex = await deriveBip39SeedHex(userText, passphrase);
        if (!cancelled) setSeedHex(hex);
      } catch {
        if (!cancelled) setSeedHex("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userText, passphrase, hasInput]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copiado!");
    } catch {
      alert("Não foi possível copiar automaticamente.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header / Aviso */}
      <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold">Simulador de Segurança BIP39</h1>
        <p className="mt-2 text-sm text-neutral-300">
          <strong>Aviso:</strong> não cole sua seed real — use exemplos
          fictícios. Digite qualquer frase; estimamos a entropia, o{" "}
          <em>tempo de quebra</em> (assumindo{" "}
          {GUESSES_PER_SEC.toLocaleString("pt-BR")} palpites/seg) e mostramos a
          seed BIP39 derivada.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Parâmetros + Seed */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-4 text-lg font-semibold">Parâmetros</h2>

          <label className="mb-2 block text-sm">
            Tamanho do mnemônico (BIP39)
          </label>
          <select
            className="mb-4 w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 outline-none"
            value={wordCount}
            onChange={(e) =>
              setWordCount(Number(e.target.value) as 12 | 15 | 18 | 21 | 24)
            }
          >
            {[12, 15, 18, 21, 24].map((n) => (
              <option key={n} value={n}>
                {n} palavras ({WORDSET_TO_BITS[n]} bits)
              </option>
            ))}
          </select>

          <label className="mb-2 block text-sm">
            Sua frase (qualquer caractere)
          </label>
          <textarea
            rows={4}
            className="mb-3 w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 outline-none"
            placeholder="Digite aqui…"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
          />

          <label className="mb-2 block text-sm">Passphrase (opcional)</label>
          <input
            type="text"
            className="mb-4 w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 outline-none"
            placeholder='(opcional) sal usado em "mnemonic" + passphrase'
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />

          {/* Seed */}
          <div className="mt-1 rounded-xl border border-neutral-700 bg-neutral-900 p-4">
            <p className="mb-2 text-sm font-semibold">BIP39 Seed (hex)</p>
            <div className="rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-xs break-all">
              {seedHex || "—"}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15 disabled:opacity-50"
                onClick={() => copy(seedHex)}
                disabled={!seedHex}
              >
                Copiar
              </button>
              <button
                className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                onClick={() => setSeedHex("")}
              >
                Limpar seed
              </button>
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              Seed derivada do texto informado (como “mnemonic”), normalizado
              NFKD, com sal
              <code className="mx-1">&quot;mnemonic&quot; + passphrase</code> e
              2048 iterações PBKDF2-HMAC-SHA512 (BIP39).
            </p>
          </div>
        </div>

        {/* Resultado + Veredito por TEMPO (só aparece após digitar) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-4 text-lg font-semibold">Resultado</h2>

          {!hasInput ? (
            <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900 p-6 text-sm text-neutral-400">
              Digite sua frase no painel ao lado para ver a estimativa de força
              e o veredito.
            </div>
          ) : (
            <>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-neutral-300">
                    Entropia base (mnemônico)
                  </dt>
                  <dd className="text-sm font-semibold">
                    {WORDSET_TO_BITS[wordCount]} bits
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-neutral-300">
                    Alfabeto detectado
                  </dt>
                  <dd className="text-sm font-semibold">
                    ~{alphabetSize} símbolos
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-neutral-300">
                    Comprimento do texto
                  </dt>
                  <dd className="text-sm font-semibold">
                    {visibleLength(userText).toLocaleString("pt-BR")} caracteres
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-neutral-300">
                    Entropia extra (estimada)
                  </dt>
                  <dd className="text-sm font-semibold">
                    {extraBits.toFixed(2)} bits
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-neutral-300">
                    Total estimado (informativo)
                  </dt>
                  <dd className="text-sm font-semibold">
                    {totalBits.toFixed(2)} bits
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-neutral-300">
                    Tempo p/ quebra (1e9/s)
                  </dt>
                  <dd className="text-sm font-semibold">
                    {secondsToHuman(crackSeconds)}
                  </dd>
                </div>
              </dl>

              <p className="mt-2 text-xs text-neutral-400">
                <em>Obs.:</em> o veredito e o tempo consideram apenas a sua
                frase digitada (não somam a entropia base do mnemônico).
              </p>

              <div
                className={`mt-4 rounded-xl border p-4 ${verdictMemo.bg} ${verdictMemo.border}`}
              >
                <p className={`text-sm font-medium ${verdictMemo.color}`}>
                  Veredito
                </p>
                <p className="mt-1 text-sm text-neutral-200">
                  {verdictMemo.text}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-neutral-300">
                  <li>Mais palavras (18–24) ↑ entropia base (informativo).</li>
                  <li>
                    Textos humanos têm padrões → entropia real pode ser menor.
                  </li>
                  <li>
                    Mudar {`GUESSES_PER_SEC`} altera o tempo base assumido.
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-300">
        <h3 className="mb-2 text-base font-semibold">Notas rápidas</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            BIP39 (entropia base): 12→128, 15→160, 18→192, 21→224, 24→256 bits.
          </li>
          <li>
            Seed derivada via PBKDF2-HMAC-SHA512 (2048), sal = “mnemonic” +
            passphrase (NFKD).
          </li>
          <li>
            Ferramenta educacional; não valida mnemônico com wordlist/checksum.
          </li>
        </ul>
      </div>
    </div>
  );
}
