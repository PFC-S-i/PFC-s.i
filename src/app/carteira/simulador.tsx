// app/carteira/simulador.tsx
"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Info } from "lucide-react";

/**
 * Simulador BIP39 (educacional)
 * - Não cole sua seed real. Use exemplos fictícios.
 * - Estima entropia "humana" da frase, o tempo de quebra (assumindo atacante forte)
 *   e mostra veredito baseado no TEMPO (apenas da frase).
 */

// vídeo de apoio
const VIDEO_URL =
  "https://www.youtube.com/watch?v=PSHOlRli57k&feature=youtu.be";

// entropia base por tamanho do mnemônico
const WORDSET_TO_BITS: Record<number, number> = {
  12: 128,
  15: 160,
  18: 192,
  21: 224,
  24: 256,
};

// ==================== parâmetros de entropia/ataque ====================
const GUESSES_PER_SEC = 1e14; // atacante bem forte
const HUMAN_DISCOUNT = 0.5;
const PER_CHAR_MAX = 3.2;
const PER_CHAR_MIN = 0.9;
const CHAR_DIMINISH_FROM = 16;
const CHAR_DIMINISH_FACTOR = 0.85;
const WORD_DIMINISH_FROM = 4;
const WORD_DIMINISH_FACTOR = 0.8;
const SUFFIX_PENALTY_BITS = 3;
const SEQ_PENALTY_BITS = 3;
const REP_PER_RUN_BITS_MAX = 6;
const BONUS_ALL_CLASSES = 1;
const WORD_BITS_SHORT = 10;
const WORD_BITS_MED = 12.5;
const WORD_BITS_LONG = 14.5;
// =======================================================================

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

function getVerdictByTime(seconds: number): Verdict {
  const TEN_THOUSAND_YEARS = 10000 * 365.25 * 24 * 3600;
  if (seconds < 60 * 60 * 24) {
    return {
      level: "weak",
      text: "Fraca — menos de 1 dia por força bruta.",
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
    };
  }
  if (seconds < TEN_THOUSAND_YEARS) {
    return {
      level: "medium",
      text: "Média — pode cair com recursos de longo prazo.",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
    };
  }
  return {
    level: "strong",
    text: "Forte — resistente mesmo contra ataques potentes.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  };
}

/** BIP39 PBKDF2-HMAC-SHA512 (2048) */
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
  for (let i = 0; i < b.length; i++) {
    s += b[i].toString(16).padStart(2, "0");
  }
  return s;
}

/* ---------- heurísticas auxiliares ---------- */
const COMMON_SUFFIXES = [/!+$/, /\d+$/, /123$/, /202[0-9]$/];
const SEQUENCES = [
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
];

function isLikelyPassphrase(s: string) {
  const lettersSpaces = /^[\p{L}\s'-]+$/u.test(s.trim());
  const words = s.trim().split(/\s+/).filter(Boolean);
  return lettersSpaces && words.length >= 3;
}

function splitWords(s: string) {
  return s
    .toLowerCase()
    .split(/[^a-zá-úà-ùâ-ûãõç]+/i)
    .filter((w) => w.length >= 2);
}

function wordEntropy(word: string) {
  if (word.length <= 3) return WORD_BITS_SHORT;
  if (word.length <= 6) return WORD_BITS_MED;
  return WORD_BITS_LONG;
}

function keyboardOrLinearSequencePenalty(s: string) {
  const lower = s.toLowerCase();
  let penalty = 0;
  for (const seq of SEQUENCES) {
    for (let i = 0; i <= lower.length - 4; i++) {
      const sub = lower.slice(i, i + 4);
      if (seq.includes(sub)) penalty += SEQ_PENALTY_BITS;
    }
  }
  return penalty;
}

function repetitionPenalty(s: string) {
  let penalty = 0;
  let run = 1;
  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1]) {
      run++;
    } else {
      if (run >= 3) penalty += Math.min(run - 2, REP_PER_RUN_BITS_MAX);
      run = 1;
    }
  }
  if (run >= 3) penalty += Math.min(run - 2, REP_PER_RUN_BITS_MAX);
  return penalty;
}

function suffixPenalty(s: string) {
  let p = 0;
  for (const r of COMMON_SUFFIXES) if (r.test(s)) p += SUFFIX_PENALTY_BITS;
  return p;
}

function charClasses(s: string) {
  return {
    lower: /[a-z]/.test(s),
    upper: /[A-Z]/.test(s),
    digit: /\d/.test(s),
    symbol: /[^\p{L}\p{N}\s]/u.test(s),
    space: /\s/.test(s),
  };
}

function charClassAlphabetSize(c: ReturnType<typeof charClasses>) {
  let size = 0;
  if (c.lower) size += 26;
  if (c.upper) size += 26;
  if (c.digit) size += 10;
  if (c.symbol) size += 33;
  if (c.space) size += 1;
  return size || 1;
}

function diminishingSum(count: number, fromIndex: number, factor: number) {
  if (count <= 0) return 0;
  let sum = 0;
  for (let i = 1; i <= count; i++) {
    sum += i <= fromIndex ? 1 : Math.pow(factor, i - fromIndex);
  }
  return sum;
}

/** estimativa de entropia humana (bits) */
function estimateHumanEntropy(input: string): number {
  const s = input.trim();
  if (!s) return 0;

  // passphrase baseada em palavras
  if (isLikelyPassphrase(s)) {
    const words = splitWords(s);
    if (words.length === 0) return 0;

    const seen = new Map<string, number>();
    const bitsPerWord: number[] = [];

    for (const w of words) {
      const base = wordEntropy(w);
      const count = (seen.get(w) || 0) + 1;
      seen.set(w, count);
      const repPenalty = count > 1 ? Math.min((count - 1) * 4, 12) : 0;
      bitsPerWord.push(Math.max(base - repPenalty, 0.5));
    }

    let bits = 0;
    for (let i = 0; i < bitsPerWord.length; i++) {
      const idx = i + 1;
      const factor =
        idx <= WORD_DIMINISH_FROM
          ? 1
          : Math.pow(WORD_DIMINISH_FACTOR, idx - WORD_DIMINISH_FROM);
      bits += bitsPerWord[i] * factor;
    }

    if (/[^\p{L}\s'-]/u.test(input)) bits += 1;
    bits -= suffixPenalty(s);
    bits -= keyboardOrLinearSequencePenalty(s);
    bits = Math.max(bits - repetitionPenalty(s), 0);
    return Math.max(bits, 0);
  }

  // senha de caracteres mistos
  const classes = charClasses(s);
  const alphabet = charClassAlphabetSize(classes);
  const idealPerChar = Math.log2(alphabet);
  const biasedPerChar = idealPerChar * HUMAN_DISCOUNT;
  const perChar = Math.min(Math.max(biasedPerChar, PER_CHAR_MIN), PER_CHAR_MAX);

  const n = s.length;
  if (n <= 0) return 0;

  const dimCoeff = diminishingSum(n, CHAR_DIMINISH_FROM, CHAR_DIMINISH_FACTOR);
  let bits = perChar * dimCoeff;

  bits -= suffixPenalty(s);
  bits -= keyboardOrLinearSequencePenalty(s);
  bits -= repetitionPenalty(s);
  if (classes.lower && classes.upper && classes.digit && classes.symbol) {
    bits += BONUS_ALL_CLASSES;
  }

  return Math.max(bits, 0);
}

/* ---------- vídeo / player ---------- */
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (/youtu\.be$/i.test(u.hostname)) return u.pathname.split("/")[1] || null;
    if (/youtube\.com$/i.test(u.hostname)) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      const i = parts.indexOf("shorts");
      if (i >= 0 && parts[i + 1]) return parts[i + 1];
      const j = parts.indexOf("embed");
      if (j >= 0 && parts[j + 1]) return parts[j + 1];
    }
    return null;
  } catch {
    return null;
  }
}

function VideoPlayer({
  url,
  title = "Vídeo",
}: {
  url: string;
  title?: string;
}) {
  const ytId = getYouTubeId(url);
  if (ytId) {
    const src = `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1`;
    return (
      <div
        className="relative w-full overflow-hidden rounded-xl border border-neutral-800 bg-black"
        style={{ paddingTop: "56.25%" }}
      >
        <iframe
          className="absolute left-0 top-0 h-full w-full"
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl border border-neutral-800 bg-black">
        <video className="h-auto w-full" controls preload="metadata">
          <source src={url} />
          Seu navegador não suporta vídeo HTML5.
        </video>
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-750"
    >
      ▶ Abrir vídeo
    </a>
  );
}

/* ---------- label com tooltip ---------- */
function FieldLabel({
  children,
  info,
  htmlFor,
}: {
  children: ReactNode;
  info: string;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 inline-flex items-center gap-2 text-sm text-neutral-200"
    >
      <span>{children}</span>
      <span
        className="group relative inline-flex items-center"
        title={info}
        aria-label={info}
      >
        <button
          type="button"
          tabIndex={0}
          className="rounded p-0.5 text-neutral-400 outline-none transition hover:text-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-600"
          aria-describedby={htmlFor ? `${htmlFor}-help` : undefined}
        >
          <Info size={16} />
        </button>
        <span
          className="pointer-events-none absolute left-1/2 top-full z-10 hidden -translate-x-1/2 whitespace-pre rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 shadow-xl group-hover:block group-focus-within:block"
          role="tooltip"
        >
          {info}
        </span>
      </span>
    </label>
  );
}

/* ---------- componente principal ---------- */
export default function Simulador() {
  const [wordCount, setWordCount] = useState<12 | 15 | 18 | 21 | 24>(12);
  const [userText, setUserText] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [seedHex, setSeedHex] = useState("");

  const hasInput = userText.trim().length > 0;
  const baseBits = WORDSET_TO_BITS[wordCount];

  const humanBits = useMemo(() => estimateHumanEntropy(userText), [userText]);

  const totalBits = useMemo(() => baseBits + humanBits, [baseBits, humanBits]);

  const totalBitsForVerdict = useMemo(() => humanBits, [humanBits]);

  // tempo estimado
  const crackSeconds = useMemo(() => {
    const bits = totalBitsForVerdict;
    if (!isFinite(bits) || bits <= 0) return 0;
    const ln = bits * Math.LN2 - Math.log(GUESSES_PER_SEC);
    if (ln > 700) return Number.POSITIVE_INFINITY;
    if (ln < -30) return 0;
    return Math.exp(ln);
  }, [totalBitsForVerdict]);

  const verdictMemo = useMemo(
    () => getVerdictByTime(crackSeconds),
    [crackSeconds]
  );

  // atualiza seed quando texto/passphrase mudam
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
      {/* intro */}
      <section className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
        <h2 className="text-xl font-semibold">
          O que é a ferramenta BIP39 do Ian Coleman?
        </h2>
        <p className="mt-2 text-sm text-neutral-300">
          É uma interface de código aberto para{" "}
          <strong>gerar/inspecionar mnemônicos BIP39</strong>,{" "}
          <strong>derivar a seed</strong> e explorar{" "}
          <strong>caminhos de derivação</strong> de carteiras. O uso recomendado
          é <em>offline</em> — baixe a página, desconecte e{" "}
          <u>nunca cole sua seed real</u> em sites. Nosso simulador é
          educacional e não substitui práticas seguras de custódia.
        </p>
        <div className="mt-4">
          <VideoPlayer
            url={VIDEO_URL}
            title="Explicação rápida: BIP39 (Ian Coleman)"
          />
        </div>
      </section>

      {/* aviso */}
      <div className="mb-6 rounded-2xl border border-red-600/40 bg-red-600/10 p-6 shadow-xl">
        <p className="text-sm text-red-300">
          <strong>Aviso:</strong> não cole sua seed real — use exemplos
          fictícios. Estimamos a entropia humana e o <em>tempo de quebra</em>{" "}
          (assumindo {GUESSES_PER_SEC.toLocaleString("pt-BR")} palpites/seg) e
          mostramos a seed BIP39 derivada.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* painel esquerdo */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <h2 className="mb-4 text-lg font-semibold">Parâmetros</h2>

          <FieldLabel
            info={
              "Quantidade de palavras do mnemônico BIP39.\nQuanto mais palavras, maior a entropia base (12=128 bits … 24=256 bits)."
            }
            htmlFor="wordcount"
          >
            Tamanho do mnemônico (BIP39)
          </FieldLabel>
          <select
            id="wordcount"
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

          <FieldLabel
            info={
              "Digite um texto como se fosse uma senha/passphrase.\nA estimativa considera padrões humanos (ex.: 123 no fim, sequências de teclado, repetições) e aplica retorno decrescente após ~16 caracteres."
            }
            htmlFor="usertext"
          >
            Sua frase (qualquer caractere)
          </FieldLabel>
          <textarea
            id="usertext"
            rows={4}
            className="mb-3 w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 outline-none"
            placeholder="Ex.: Uma frase longa com letras, números e símbolos no meio!"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
          />

          <FieldLabel
            info={
              'Senha extra opcional combinada como sal: "mnemonic" + passphrase (padrão BIP39).\nAjuda a reforçar a proteção da seed.'
            }
            htmlFor="passphrase"
          >
            Passphrase (opcional)
          </FieldLabel>
          <input
            id="passphrase"
            type="text"
            className="mb-4 w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 outline-none"
            placeholder='(opcional) sal usado em "mnemonic" + passphrase'
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
          />

          {/* seed exibida */}
          <div className="mt-1 rounded-xl border border-neutral-700 bg-neutral-900 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              BIP39 Seed (hex)
              <span
                className="group relative inline-flex items-center"
                title="Resultado do PBKDF2-HMAC-SHA512 (2048 iterações) conforme o BIP39, exibido em hexadecimal."
                aria-label="Resultado do PBKDF2-HMAC-SHA512 (2048 iterações) conforme o BIP39, exibido em hexadecimal."
                id="seedhex-help"
              >
                <Info
                  size={16}
                  className="text-neutral-400 group-hover:text-neutral-200"
                />
              </span>
            </p>
            <div className="break-all rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-xs">
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
            <p className="mt-3 text-xs text-neutral-400" id="seedhex-hint">
              Seed derivada do texto informado (como “mnemonic”), normalizado
              NFKD, com sal{" "}
              <code className="mx-1">&quot;mnemonic&quot; + passphrase</code> e
              2048 iterações PBKDF2-HMAC-SHA512 (BIP39).
            </p>
          </div>
        </div>

        {/* painel direito */}
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
                    Entropia humana (estimada)
                  </dt>
                  <dd className="text-sm font-semibold">
                    {humanBits.toFixed(2)} bits
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
                    Tempo p/ quebra (1e14/s)
                  </dt>
                  <dd className="text-sm font-semibold">
                    {secondsToHuman(crackSeconds)}
                  </dd>
                </div>
              </dl>

              <p className="mt-2 text-xs text-neutral-400">
                <em>Obs.:</em> o veredito e o tempo consideram apenas a sua
                frase digitada (não somam a entropia base do mnemônico).
                Estimativa “humana” penaliza padrões previsíveis e aplica
                retorno decrescente.
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
                  <li>Frases realmente longas/complexas elevam o tempo.</li>
                  <li>Evite “123/!” no fim, sequências e repetições.</li>
                  <li>Misture classes (Aa0!) — ajuda, mas não é tudo.</li>
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
            Seed derivada via PBKDF2-HMAC-SHA512 (2048), sal ={" "}
            &quot;mnemonic&quot; + passphrase (NFKD).
          </li>
          <li>
            O cálculo é conservador e cresce devagar com entradas simples.
          </li>
        </ul>
      </div>
    </div>
  );
}
