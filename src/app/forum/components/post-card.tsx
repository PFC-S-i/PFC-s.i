// src/app/forum/components/post-card.tsx
"use client";

import { useAIBadge } from "@/app/forum/hooks/useAIBadge";
import { useEffect, useState } from "react";
import {
  MoreVertical,
  Pencil,
  Trash,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatRelative } from "@/app/forum/lib/utils";
import type { ForumPost } from "@/types/forum";
import {
  dislikeEvent,
  likeEvent,
  type VoteResponse,
} from "@/services/forum.service";
import { useToast } from "@/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { classifyEventLocalAPI } from "@/services/ai.service";

type Props = {
  post: ForumPost;
  meId?: string | null;
  initialLikes?: number;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (post: ForumPost) => void;
  onDelete?: (post: ForumPost) => void;
  deleting?: boolean;
};

type Vote = -1 | 0 | 1;
type AILabel = "crypto" | "offtopic" | "uncertain";

/* ====== DEBUG LOGGING ====== */
const DEBUG = (process.env.NEXT_PUBLIC_AI_DEBUG ?? "1") !== "0";
const TAG = "[AI-BADGE]";
const d = (...args: unknown[]) => {
  if (DEBUG) console.debug(TAG, ...args);
};

/* ====== FILA GLOBAL + CONTROLES ====== */
const CONCURRENCY = 1;
let running = 0;
const queue: Array<() => Promise<void>> = [];
const inflightKeys = new Set<string>();

function runNext() {
  d("runNext() called | running:", running, "queue:", queue.length);
  while (running < CONCURRENCY && queue.length) {
    const task = queue.shift()!;
    running++;
    d("→ start task | running:", running, "queue:", queue.length);
    task()
      .catch((e) => {
        d("task error (ignored):", e);
      })
      .finally(() => {
        running--;
        d("← task finished | running:", running, "queue:", queue.length);
        runNext();
      });
  }
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  d("enqueue task (before) | queue:", queue.length + 1);
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const r = await fn();
        resolve(r);
      } catch (e) {
        reject(e);
      }
    });
    runNext();
  });
}

function toMessage(err: unknown): string {
  return err instanceof Error
    ? err.message
    : typeof err === "string"
    ? err
    : "Erro ao processar ação.";
}

type ForumPostWithCoin = ForumPost & {
  coinId?: string | null;
  coin_id?: string | null;
};

/* ====== RETRY COM BACKOFF + PERSISTÊNCIA DE TENTATIVAS ====== */
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1500;

type ClassifyResult = {
  label?: AILabel;
  [key: string]: unknown;
};

async function classifyWithRetry(
  title: string,
  description: string,
  max = 3
): Promise<ClassifyResult> {
  let attempt = 0;
  let delay = 1000;
  while (attempt < max) {
    try {
      d("classify attempt", attempt + 1, "/", max, "title:", title);
      const res = await classifyEventLocalAPI(title, description);
      d("classify success →", res?.label);
      return res;
    } catch (e) {
      attempt++;
      d("classify error on attempt", attempt, e);
      if (attempt >= max) throw new Error("Falha ao classificar");
      const jitter = Math.floor(Math.random() * 300);
      const wait = Math.min(delay, 6000) + jitter;
      d("retrying in", wait, "ms");
      await sleep(wait);
      delay *= 2;
    }
  }
  throw new Error("Falha ao classificar");
}

function attemptsKey(lsKey: string) {
  return `event_ai_attempts:${lsKey}`;
}
function getAttempts(lsKey: string) {
  try {
    if (typeof window === "undefined") return 0;
    const v = localStorage.getItem(attemptsKey(lsKey));
    const n = v ? parseInt(v, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function incAttempts(lsKey: string) {
  try {
    if (typeof window === "undefined") return 1;
    const n = getAttempts(lsKey) + 1;
    localStorage.setItem(attemptsKey(lsKey), String(n));
    d("incAttempts", lsKey, "→", n);
    return n;
  } catch {
    return 1;
  }
}
function clearAttempts(lsKey: string) {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(attemptsKey(lsKey));
    d("clearAttempts", lsKey);
  } catch {
    // ignore
  }
}
function scheduleRetry(
  lsKey: string,
  title: string,
  desc: string,
  postId: string | null
) {
  const attempt = incAttempts(lsKey);
  if (attempt > MAX_RETRIES) {
    d("max retries reached for", lsKey);
    return;
  }
  const delay =
    BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 600);
  d("scheduleRetry", { lsKey, attempt, delay });
  setTimeout(() => {
    tryClassify(lsKey, title, desc, postId);
  }, delay);
}

/* ====== LS helpers ====== */
function saveAiBadge(key: string, label: AILabel) {
  try {
    localStorage.setItem(key, JSON.stringify({ label, at: Date.now() }));
    d("saved badge to LS:", key, "→", label);
  } catch {
    // ignore
  }
}
function safeReadLS<T = unknown>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null;
    const txt = localStorage.getItem(key);
    if (!txt) return null;
    const val = JSON.parse(txt) as T;
    d("read LS:", key, "→", val);
    return val;
  } catch {
    return null;
  }
}
function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
function makeAiKey(id: string | null, title: string, description: string) {
  return `event_ai_${id ?? simpleHash(`${title}::${description}`)}`;
}
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function tryClassify(
  lsKey: string,
  title: string,
  desc: string,
  postId: string | null
) {
  if (inflightKeys.has(lsKey)) {
    d("skip tryClassify (inflight)", lsKey);
    return;
  }
  inflightKeys.add(lsKey);
  d("tryClassify START", { lsKey, postId, title });

  enqueue(async () => {
    // pequena espera aleatória pra não bater tudo junto
    await sleep(120 + Math.floor(Math.random() * 180));

    let res: ClassifyResult | null = null;
    try {
      res = await classifyWithRetry(title, desc, 4);
    } catch (e) {
      d("classifyWithRetry failed", e);
      res = null;
    }

    if (res?.label) {
      const lbl = res.label as AILabel;
      saveAiBadge(lsKey, lbl);
      clearAttempts(lsKey);
      d("dispatch event-ai-updated", { id: postId, label: lbl });
      window.dispatchEvent(
        new CustomEvent("event-ai-updated", {
          detail: { id: postId, key: lsKey, ai: res },
        })
      );
    } else {
      d("no result, schedule global retry");
      scheduleRetry(lsKey, title, desc, postId);
    }
  }).finally(() => {
    inflightKeys.delete(lsKey);
    d("tryClassify END", lsKey);
  });
}

/* ========================= Componente ========================= */

export function PostCard({
  post,
  meId = null,
  initialLikes = 0,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  deleting = false,
}: Props) {
  const { toast } = useToast();

  const [likes, setLikes] = useState(
    Number.isFinite(post.likes) ? (post.likes as number) : initialLikes
  );
  const [dislikes, setDislikes] = useState(
    Number.isFinite(post.dislikes) ? (post.dislikes as number) : 0
  );
  const [vote, setVote] = useState<Vote>(0);
  const [pending, setPending] = useState(false);

  const key = meId ? `forum:vote:${meId}:${post.id}` : null;

  useEffect(() => {
    if (!key || typeof window === "undefined") {
      setVote(0);
      return;
    }
    const n = Number(localStorage.getItem(key));
    setVote(n === 1 || n === -1 || n === 0 ? (n as Vote) : 0);
  }, [key]);

  const persistVote = (v: Vote) => {
    if (!key || typeof window === "undefined") return;
    localStorage.setItem(key, String(v));
  };

  const applyServer = (resp: VoteResponse) => {
    setLikes(resp.likes_count);
    setDislikes(resp.dislikes_count);
    const v: Vote =
      resp.value === 1 || resp.value === -1 || resp.value === 0
        ? resp.value
        : 0;
    setVote(v);
    persistVote(v);
  };

  const handleVote = async (dir: "like" | "dislike") => {
    if (pending) return;

    const target: Vote = dir === "like" ? 1 : -1;
    const next: Vote = vote === target ? 0 : target;

    const snapshot = { likes, dislikes, vote };
    const dLikes = (next === 1 ? 1 : 0) - (vote === 1 ? 1 : 0);
    const dDislikes = (next === -1 ? 1 : 0) - (vote === -1 ? 1 : 0);

    setLikes((v) => Math.max(0, v + dLikes));
    setDislikes((v) => Math.max(0, v + dDislikes));
    setVote(next);
    setPending(true);

    try {
      const resp =
        dir === "like" ? await likeEvent(post.id) : await dislikeEvent(post.id);
      applyServer(resp);
    } catch (e: unknown) {
      setLikes(snapshot.likes);
      setDislikes(snapshot.dislikes);
      setVote(snapshot.vote);
      persistVote(snapshot.vote);
      toast({
        title:
          dir === "like"
            ? "Não foi possível curtir"
            : "Não foi possível dar dislike",
        description: toMessage(e),
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  const author = post.author?.trim() || "Usuário";
  const avatarInitial = author.charAt(0).toUpperCase();
  const createdLabel = (() => {
    try {
      return formatRelative(post.createdAt);
    } catch {
      return "";
    }
  })();

  const coinId = (() => {
    const p = post as ForumPostWithCoin;
    const cid = p.coinId ?? p.coin_id;
    return typeof cid === "string" && cid.trim() ? cid : null;
  })();
  const coinLabel = coinId ?? "—";

  const ai = useAIBadge({
    id: post.id ?? null,
    title: post.title ?? "",
    description: post.description ?? "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const title = post.title ?? "";
    const desc = post.description ?? "";

    if (ai) {
      d("skip auto-classify: label already present", { id: post.id, ai });
      return;
    }
    if (!title.trim() && !desc.trim()) {
      d("skip auto-classify: empty content", { id: post.id });
      return;
    }

    const lsKey = makeAiKey(post.id ?? null, title, desc);
    d("auto-classify check", { id: post.id, lsKey });

    const existing = safeReadLS<{ label?: AILabel }>(lsKey);
    if (existing?.label) {
      d("localStorage already has label → dispatch", {
        id: post.id,
        label: existing.label,
      });
      window.dispatchEvent(
        new CustomEvent("event-ai-updated", {
          detail: {
            id: post.id ?? null,
            key: lsKey,
            ai: { label: existing.label },
          },
        })
      );
      return;
    }

    tryClassify(lsKey, title, desc, post.id ?? null);
  }, [ai, post.id, post.title, post.description]);

  const iconBtn =
    "p-0 m-0 bg-transparent border-0 outline-none hover:opacity-80 active:opacity-90 focus-visible:outline-none disabled:opacity-60";
  const likeIcon = `h-5 w-5 ${vote === 1 ? "text-sky-500" : "text-white/70"}`;
  const dislikeIcon = `h-5 w-5 ${
    vote === -1 ? "text-red-500" : "text-white/70"
  }`;
  const countClass = "ml-1 tabular-nums text-white/70 min-w-[2ch] text-center";

  const badgeColor =
    ai === "crypto"
      ? "bg-green-500/10 text-green-400"
      : ai === "offtopic"
      ? "bg-red-500/10 text-red-400"
      : "bg-amber-500/10 text-amber-400";
  const badgeText =
    ai === "crypto"
      ? "Informação validada"
      : ai === "offtopic"
      ? "Informação considerada inválida"
      : "Em análise";

  return (
    <article className="flex gap-3 border-b border-white/10 px-4 py-3">
      <div className="mt-0.5">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm font-semibold">
          {avatarInitial}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="truncate font-semibold">{author}</span>
              <span className="text-white/40">·</span>
              <time className="text-white/50" dateTime={post.createdAt}>
                {createdLabel}
              </time>
            </div>

            {/* Badge da IA */}
            <div className="mt-1">
              <span
                className={
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium " +
                  badgeColor
                }
                title={
                  ai === "crypto"
                    ? "Classificado como relacionado a cripto"
                    : ai === "offtopic"
                    ? "Classificado como fora do escopo"
                    : "Classificação em andamento"
                }
              >
                {badgeText}
              </span>
            </div>
          </div>

          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={iconBtn}
                  aria-label="Mais opções"
                  title="Mais opções"
                >
                  <MoreVertical className="h-4 w-4 text-white/70" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="min-w-[180px] rounded-xl border border-white/10 bg-[#1B1B1B] text-foreground"
              >
                <DropdownMenuLabel className="text-xs opacity-70">
                  Opções
                </DropdownMenuLabel>

                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit?.(post)}
                    className="flex cursor-pointer items-center gap-2 focus:bg-white/10 focus:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}

                {canEdit && canDelete && <DropdownMenuSeparator />}

                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete?.(post)}
                    disabled={deleting}
                    className="flex cursor-pointer items-center gap-2 text-red-400 data-[disabled]:pointer-events-none data-[disabled]:opacity-60 focus:bg-red-400/10 focus:text-red-400"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* título */}
        {post.title ? (
          <h2 className="mt-2 break-words text-base font-semibold leading-6 text-white">
            {post.title}
          </h2>
        ) : null}

        {/* Moeda relacionada */}
        <div className="mt-1 text-xs text-white/60">
          <span className="opacity-70">Moeda relacionada:</span>{" "}
          <span className="font-medium text-white">{coinLabel}</span>
        </div>

        {/* descrição */}
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-6">
          {post.description}
        </p>

        {/* ações */}
        <div className="mt-2 flex items-center gap-5">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleVote("like")}
              className={`${iconBtn} ${pending ? "pointer-events-none" : ""}`}
              aria-pressed={vote === 1}
              aria-label={`Curtir. Total: ${likes}`}
              title={vote === 1 ? "Remover like" : "Curtir"}
            >
              <ThumbsUp className={likeIcon} />
            </button>
            <span className={countClass}>{likes}</span>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleVote("dislike")}
              className={`${iconBtn} ${pending ? "pointer-events-none" : ""}`}
              aria-pressed={vote === -1}
              aria-label={`Dar dislike. Total: ${dislikes}`}
              title={vote === -1 ? "Remover dislike" : "Dar dislike"}
            >
              <ThumbsDown className={dislikeIcon} />
            </button>
            <span className={countClass}>{dislikes}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
