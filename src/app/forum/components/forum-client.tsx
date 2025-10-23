"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { EmptyState } from "@/app/forum/components/empty-state";
import { PostList } from "@/app/forum/components/post-list";
import { NewPostModal } from "@/app/forum/components/new-post-modal";
import type { ForumPost } from "@/types/forum";
import { Button } from "@/components";
import {
  createEvent,
  getMe,
  listEvents,
  toForumPost,
} from "@/services/forum.service";
import type { Me } from "@/services/forum.service";
import Loading from "@/app/loading";

function getAuthorName(
  baseAuthor: string | undefined,
  eUserId: string,
  me: Me | null
) {
  if (me && eUserId === me.id) return me.name?.trim() || me.email || "Você";
  if (!baseAuthor || baseAuthor === "—") return "Usuário";
  return baseAuthor;
}

function byCreatedDesc(a: ForumPost, b: ForumPost) {
  return b.createdAt.localeCompare(a.createdAt);
}

export default function ForumClient() {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);

  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashMessage = useCallback((msg: string) => {
    setFlash(msg);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlash(null), 2500);
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const [meRes, eventsRes] = await Promise.allSettled([
          getMe(),
          listEvents({ page: 1, page_size: 20, sort: "starts_at:desc" }),
        ]);

        if (!alive) return;

        const meData = meRes.status === "fulfilled" ? meRes.value : null;
        setMe(meData);

        if (eventsRes.status === "fulfilled") {
          const mapped = eventsRes.value.items.map((e) => {
            const base = toForumPost(e);
            base.author = getAuthorName(base.author, e.user_id, meData);
            return base;
          });
          setPosts(mapped);
        } else {
          setError("Falha ao carregar eventos.");
        }
      } catch (err) {
        if (!alive) return;
        setError(
          err instanceof Error ? err.message : "Falha ao carregar eventos."
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const handleCreate = useCallback(
    async (data: { title: string; description: string; coin_id: string }) => {
      try {
        setError(null);
        const created = await createEvent({
          title: data.title,
          description: data.description,
          coin_id: data.coin_id,
        });

        const mapped = toForumPost(created);
        mapped.author = getAuthorName(mapped.author, created.user_id, me);

        setPosts((prev) => [mapped, ...prev]);
        setOpen(false);
        flashMessage("Publicação criada com sucesso.");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Falha ao publicar o evento."
        );
      }
    },
    [me, flashMessage]
  );

  const ordered = useMemo(() => [...posts].sort(byCreatedDesc), [posts]);

  return (
    <main className="relative py-10 md:py-14 text-foreground">
      <div className="fixed inset-0 -z-10 bg-[#151515]" aria-hidden />

      <div className="mx-auto w-full max-w-5xl px-4">
        <header className="mb-8 md:mb-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Fórum</h1>
            <p className="opacity-80 text-sm md:text-base mt-1">
              Compartilhe e discuta notícias de cripto com a comunidade.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            + Publicar uma notícia
          </Button>
        </header>

        {flash && (
          <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-emerald-300">
            {flash}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {loading && ordered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#1B1B1B] p-8 text-center opacity-80">
            <Loading />
          </div>
        ) : ordered.length === 0 ? (
          <EmptyState onCreate={() => setOpen(true)} />
        ) : (
          <PostList posts={ordered} />
        )}
      </div>

      <NewPostModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleCreate}
      />
    </main>
  );
}
