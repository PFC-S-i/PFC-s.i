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

// Auxiliar para pegar mensagem de erro de forma segura
function toMessage(err: unknown): string {
  return err instanceof Error
    ? err.message
    : typeof err === "string"
    ? err
    : "Erro ao processar ação.";
}

// Auxiliar para aceitar coinId (camel) ou coin_id (snake) sem usar any
type ForumPostWithCoin = ForumPost & {
  coinId?: string | null;
  coin_id?: string | null;
};

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
    Number.isFinite(post.likes) ? post.likes! : initialLikes
  );
  const [dislikes, setDislikes] = useState(
    Number.isFinite(post.dislikes) ? post.dislikes! : 0
  );
  const [vote, setVote] = useState<Vote>(0);
  const [pending, setPending] = useState(false);

  const key = meId ? `forum:vote:${meId}:${post.id}` : null;

  useEffect(() => {
    if (!key || typeof window === "undefined") return setVote(0);
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

  // Aceita tanto coinId (camel) quanto coin_id (snake), sem usar any
  const coinId = (() => {
    const p = post as ForumPostWithCoin;
    const cid = p.coinId ?? p.coin_id;
    return typeof cid === "string" && cid.trim() ? cid : null;
  })();
  const coinLabel = coinId ?? "—";

  const iconBtn =
    "p-0 m-0 bg-transparent border-0 outline-none hover:opacity-80 active:opacity-90 focus-visible:outline-none disabled:opacity-60";
  const likeIcon = `h-5 w-5 ${vote === 1 ? "text-sky-500" : "text-white/70"}`;
  const dislikeIcon = `h-5 w-5 ${
    vote === -1 ? "text-red-500" : "text-white/70"
  }`;
  const countClass = "ml-1 tabular-nums text-white/70 min-w-[2ch] text-center";

  return (
    <article className="flex gap-3 px-4 py-3 border-b border-white/10">
      <div className="mt-0.5">
        <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-sm font-semibold">
          {avatarInitial}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-semibold truncate">{author}</span>
              <span className="text-white/40">·</span>
              <time className="text-white/50" dateTime={post.createdAt}>
                {createdLabel}
              </time>
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
                    className="flex items-center gap-2 focus:bg-white/10 focus:text-white cursor-pointer"
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
                    className="flex items-center gap-2 text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer data-[disabled]:opacity-60 data-[disabled]:pointer-events-none"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Moeda relacionada */}
        <div className="mt-1 text-xs text-white/60">
          <span className="opacity-70">Moeda relacionada:</span>{" "}
          <span className="font-medium text-white">{coinLabel}</span>
        </div>

        {/* Descrição */}
        <p className="mt-2 text-[15px] leading-6 whitespace-pre-wrap">
          {post.description}
        </p>

        {/* Ações */}
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
