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

  // Estados separados p/ deixar claro o fluxo: autenticação -> eventos
  const [authLoading, setAuthLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [me, setMe] = useState<Me | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashMessage = useCallback((msg: string) => {
    setFlash(msg);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlash(null), 2500);
  }, []);

  // 1) Checa login/token
  useEffect(() => {
    let alive = true;
    (async () => {
      setAuthLoading(true);
      setError(null);
      try {
        const meData = await getMe();
        if (!alive) return;
        setMe(meData);
      } catch {
        if (!alive) return;
        setMe(null); // sem login/token
      } finally {
        if (alive) setAuthLoading(false);
      }
    })();
    return () => {
      alive = false;
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  // 2) Se logado, carrega eventos
  useEffect(() => {
    if (!me) return; // somente após autenticar
    let alive = true;
    (async () => {
      setEventsLoading(true);
      setError(null);
      try {
        const res = await listEvents({
          page: 1,
          page_size: 20,
          sort: "starts_at:desc",
        });
        if (!alive) return;
        const mapped = res.items.map((e) => {
          const base = toForumPost(e);
          base.author = getAuthorName(base.author, e.user_id, me);
          return base;
        });
        setPosts(mapped);
      } catch (err) {
        if (!alive) return;
        setError(
          err instanceof Error ? err.message : "Falha ao carregar eventos."
        );
      } finally {
        if (alive) setEventsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [me]);

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

  const isLoadingAnything = authLoading || (me && eventsLoading);

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

          {/* Desabilita o botão se não estiver logado */}
          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            disabled={!me}
            aria-disabled={!me}
            title={!me ? "Faça login para publicar" : "+ Publicar uma notícia"}
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

        {/* Estado: carregando auth ou eventos */}
        {isLoadingAnything && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#1B1B1B] p-8 text-center opacity-80">
            <Loading />
          </div>
        )}

        {/* Estado: não logado (auth resolvida e sem usuário) */}
        {!isLoadingAnything && !me && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#1B1B1B] p-8 text-center opacity-80">
            Faça login ou crie uma conta para poder acessar ao Fórum
          </div>
        )}

        {/* Estado: logado e com posts (ou vazio) */}
        {!isLoadingAnything && me && (
          <>
            {ordered.length === 0 ? (
              <EmptyState onCreate={() => setOpen(true)} />
            ) : (
              <PostList posts={ordered} />
            )}
          </>
        )}
      </div>

      <NewPostModal
        open={open && !!me}
        onClose={() => setOpen(false)}
        onConfirm={handleCreate}
      />
    </main>
  );
}
