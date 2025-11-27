// src/app/forum/components/post-card.tsx
"use client";

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
  onEdit?: (post: ForumPost) => void;
  onDelete?: (post: ForumPost) => void;
  deleting?: boolean;
};

type Vote = -1 | 0 | 1;

// mesmos labels da IA
type AILabel = "crypto" | "offtopic" | "uncertain";
type Decision = "allow" | "warn" | "block";

// o que salvamos no localStorage
type StoredAIBadge = {
  label: AILabel;
  decision?: Decision;
  ui_label?: string;
  at: number;
};

type ForumPostWithMeta = ForumPost & {
  coinId?: string | null;
  coin_id?: string | null;
  user_id?: string | null;
  userId?: string | null;
  owner_id?: string | null;
};

const DEBUG = (process.env.NEXT_PUBLIC_AI_DEBUG ?? "1") !== "0";
const TAG = "[AI-BADGE]";
const d = (...args: unknown[]) => {
  if (DEBUG) console.debug(TAG, ...args);
};

function toMessage(err: unknown): string {
  return err instanceof Error
    ? err.message
    : typeof err === "string"
    ? err
    : "Erro ao processar ação.";
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

function readBadgeFromStorage(key: string): StoredAIBadge | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAIBadge;
    if (
      parsed &&
      (parsed.label === "crypto" ||
        parsed.label === "offtopic" ||
        parsed.label === "uncertain")
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveBadgeToStorage(key: string, badge: StoredAIBadge) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(badge));
  } catch {
    // ignore
  }
}

export function PostCard({
  post,
  meId = null,
  initialLikes = 0,
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

  // Ler mais / ler menos
  const [expanded, setExpanded] = useState(false);

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

  const meta = post as ForumPostWithMeta;

  const coinId = (() => {
    const cid = meta.coinId ?? meta.coin_id;
    return typeof cid === "string" && cid.trim() ? cid : null;
  })();
  const coinLabel = coinId ?? "—";

  const descriptionText = post.description ?? "";
  const isLongDescription = descriptionText.length > 600;

  // ==== ESTADO DA IA PARA O BADGE ====
  const [aiBadge, setAiBadge] = useState<{
    label: AILabel | null;
    decision: Decision | null;
    ui_label: string | null;
    loading: boolean;
  }>({
    label: null,
    decision: null,
    ui_label: null,
    loading: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const title = post.title ?? "";
    const desc = post.description ?? "";

    if (!title.trim() && !desc.trim()) {
      setAiBadge((prev) => ({ ...prev, loading: false }));
      return;
    }

    const lsKey = makeAiKey(post.id ?? null, title, desc);
    d("AI badge check for post", post.id, "key:", lsKey);

    // 1) Tenta ler do localStorage primeiro
    const cached = readBadgeFromStorage(lsKey);
    if (cached) {
      d("AI badge from cache:", cached);
      setAiBadge({
        label: cached.label,
        decision: cached.decision ?? null,
        ui_label: cached.ui_label ?? null,
        loading: false,
      });
      return;
    }

    // 2) Se não tiver cache, classifica agora
    let cancelled = false;
    setAiBadge((prev) => ({ ...prev, loading: true }));

    (async () => {
      try {
        const res = await classifyEventLocalAPI(title, desc);
        if (cancelled) return;

        const anyRes = res as {
          decision?: "allow" | "warn" | "block";
          ui_label?: string;
        };
        
        const stored: StoredAIBadge = {
          label: res.label as AILabel,
          decision:
            anyRes.decision === "allow" ||
            anyRes.decision === "warn" ||
            anyRes.decision === "block"
              ? anyRes.decision
              : undefined,
          ui_label:
            typeof anyRes.ui_label === "string" ? anyRes.ui_label : undefined,
          at: Date.now(),
        };

        d("AI badge fresh result:", stored);
        saveBadgeToStorage(lsKey, stored);

        setAiBadge({
          label: stored.label,
          decision: stored.decision ?? null,
          ui_label: stored.ui_label ?? null,
          loading: false,
        });
      } catch (e) {
        if (DEBUG) console.error(TAG, "classify error", e);
        if (!cancelled) {
          setAiBadge((prev) => ({ ...prev, loading: false }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [post.id, post.title, post.description]);

  // ==== CÁLCULO FINAL DO BADGE (cor + texto) ====
  const isWarn = aiBadge.decision === "warn";
  const isOfftopic = aiBadge.label === "offtopic";
  const isCrypto = aiBadge.label === "crypto";

  let badgeColor = "bg-amber-500/10 text-amber-400";
  let badgeText = "Em análise";
  let badgeTitle = "Aguardando validação automática por IA.";

  if (!aiBadge.loading && (isCrypto || isOfftopic || isWarn)) {
    if (isWarn) {
      // 🔴 Fake news / sátira / duvidoso
      badgeColor = "bg-red-500/10 text-red-400";
      badgeText =
        aiBadge.ui_label || "Conteúdo marcado como possível fake news / sátira";
      badgeTitle =
        aiBadge.ui_label ||
        "A IA marcou este conteúdo como potencialmente não confiável (fake news, sátira ou informação duvidosa).";
    } else if (isOfftopic) {
      // 🔴 Fora do escopo
      badgeColor = "bg-red-500/10 text-red-400";
      badgeText = "Conteúdo considerado fora do escopo";
      badgeTitle =
        "A IA entendeu que este post não está relacionado ao ecossistema de criptomoedas.";
    } else if (isCrypto) {
      // 🟢 Conteúdo normal sobre cripto
      badgeColor = "bg-green-500/10 text-green-400";
      badgeText = "Informação validada por IA";
      badgeTitle =
        "A IA classificou este conteúdo como relacionado ao ecossistema de criptomoedas.";
    }
  }

  const iconBtn =
    "p-0 m-0 bg-transparent border-0 outline-none hover:opacity-80 active:opacity-90 focus-visible:outline-none disabled:opacity-60";
  const likeIcon = `h-5 w-5 ${vote === 1 ? "text-sky-500" : "text-white/70"}`;
  const dislikeIcon = `h-5 w-5 ${
    vote === -1 ? "text-red-500" : "text-white/70"
  }`;
  const countClass = "ml-1 tabular-nums text-white/70 min-w-[2ch] text-center";

  // --------- só o autor pode editar/excluir ---------
  const ownerId =
    meta.user_id ?? meta.userId ?? meta.owner_id ?? null;

  const isOwner =
    typeof meId === "string" &&
    meId.trim() !== "" &&
    typeof ownerId === "string" &&
    ownerId.trim() !== "" &&
    meId === ownerId;

  const canEditFinal = isOwner;
  const canDeleteFinal = isOwner;
  // ---------------------------------------------------

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
                title={badgeTitle}
              >
                {badgeText}
              </span>
            </div>
          </div>

          {(canEditFinal || canDeleteFinal) && (
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

                {canEditFinal && (
                  <DropdownMenuItem
                    onClick={() => onEdit?.(post)}
                    className="flex cursor-pointer items-center gap-2 focus:bg-white/10 focus:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}

                {canEditFinal && canDeleteFinal && <DropdownMenuSeparator />}

                {canDeleteFinal && (
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

        {/* descrição com Ler mais / Ler menos */}
        {descriptionText && (
          <div className="mt-2">
            <div
              className={
                "relative text-[15px] leading-6 whitespace-pre-wrap" +
                (!expanded && isLongDescription
                  ? " max-h-40 overflow-hidden pr-1"
                  : "")
              }
            >
              {descriptionText}
              {!expanded && isLongDescription && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#1B1B1B] to-transparent" />
              )}
            </div>

            {isLongDescription && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 text-xs font-medium text-sky-400 hover:text-sky-300"
              >
                {expanded ? "Ler menos..." : "Ler mais..."}
              </button>
            )}
          </div>
        )}

        {/* ações */}
        <div className="mt-3 flex items-center gap-5">
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
