"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { EmptyState } from "@/app/forum/components/empty-state";
import { NewPostModal } from "@/app/forum/components/new-post-modal";
import { PostCard } from "@/app/forum/components/post-card";
import type { ForumPost } from "@/types/forum";
import { Button } from "@/components";
import {
  createEvent,
  deleteEvent,
  getMe,
  listEvents,
  toForumPost,
  updateEvent,
} from "@/services/forum.service";
import type { Me } from "@/services/forum.service";
import Loading from "@/app/loading";

/** Estende o ForumPost com campos necessários para editar/excluir */
type ForumPostEx = ForumPost & {
  user_id?: string;
  coin_id?: string | null;
};

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

/** Modal de confirmação simples com o mesmo padrão visual do NewPostModal */
function ConfirmDialog({
  open,
  title = "Confirmar ação",
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[1px]"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="fixed inset-0 z-50 grid place-items-center p-4"
        onClick={onCancel}
      >
        <div
          className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1B1B1B] p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            id="confirm-dialog-title"
            className="text-lg md:text-xl font-semibold"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm opacity-80">{description}</p>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
              className="rounded-xl px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {confirmLabel}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl px-4 py-2 border border-white/10 hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ForumClient() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<ForumPostEx | null>(null);

  const [posts, setPosts] = useState<ForumPostEx[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fluxo: autenticação -> eventos
  const [authLoading, setAuthLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Exclusão
  const [confirmDelete, setConfirmDelete] = useState<ForumPostEx | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        setMe(null);
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
    if (!me) return;
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
        const mapped: ForumPostEx[] = res.items.map((e) => {
          const base = toForumPost(e);
          return {
            ...base,
            author: getAuthorName(base.author, e.user_id, me),
            user_id: e.user_id,
            coin_id: e.coin_id ?? null,
          };
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

  // CREATE
  const handleCreate = useCallback(
    async (data: { title: string; description: string; coin_id: string }) => {
      try {
        setError(null);
        const created = await createEvent({
          title: data.title,
          description: data.description,
          coin_id: data.coin_id,
        });
        const base = toForumPost(created);
        const mapped: ForumPostEx = {
          ...base,
          author: getAuthorName(base.author, created.user_id, me),
          user_id: created.user_id,
          coin_id: created.coin_id ?? null,
        };
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

  // EDIT (abre modal com dados)
  const handleEdit = useCallback((post: ForumPostEx) => {
    setMode("edit");
    setEditing(post);
    setOpen(true);
  }, []);

  // Clique no ícone de lixeira → abre modal de confirmação
  const requestDelete = useCallback((post: ForumPostEx) => {
    setConfirmDelete(post);
  }, []);

  // Confirmar exclusão no modal
  const confirmDeleteNow = useCallback(async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await deleteEvent(confirmDelete.id);
      setPosts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      flashMessage("Publicação excluída.");
      setConfirmDelete(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao excluir o evento."
      );
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete, flashMessage]);

  // SUBMIT do modal (criar/editar)
  const handleConfirm = useCallback(
    async (data: { title: string; description: string; coin_id: string }) => {
      try {
        setError(null);
        if (mode === "edit" && editing) {
          await updateEvent(editing.id, {
            title: data.title,
            description: data.description,
            coin_id: data.coin_id,
          });
          setPosts((prev) =>
            prev.map((p) =>
              p.id === editing.id
                ? {
                    ...p,
                    title: data.title,
                    description: data.description,
                    coin_id: data.coin_id,
                  }
                : p
            )
          );
          flashMessage("Publicação atualizada com sucesso.");
        } else {
          await handleCreate(data);
          return; // handleCreate já fecha modal e exibe flash
        }
        setOpen(false);
        setEditing(null);
        setMode("create");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Falha ao salvar alterações."
        );
      }
    },
    [mode, editing, handleCreate, flashMessage]
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
            onClick={() => {
              setMode("create");
              setEditing(null);
              setOpen(true);
            }}
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

        {/* Estado: não logado */}
        {!isLoadingAnything && !me && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#1B1B1B] p-8 text-center opacity-80">
            Faça login ou crie uma conta para poder acessar ao Fórum
          </div>
        )}

        {/* Estado: logado */}
        {!isLoadingAnything && me && (
          <>
            {ordered.length === 0 ? (
              <EmptyState
                onCreate={() => {
                  setMode("create");
                  setEditing(null);
                  setOpen(true);
                }}
              />
            ) : (
              <div className="space-y-4">
                {ordered.map((post) => (
                  <PostCard
                    key={post.id}
                    meId={me.id}
                    post={post}
                    canEdit={post.user_id === me.id}
                    onEdit={handleEdit}
                    canDelete={post.user_id === me.id}
                    onDelete={requestDelete}
                    deleting={deletingId === post.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de criação/edição */}
      <NewPostModal
        open={open && !!me}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          setMode("create");
        }}
        onConfirm={handleConfirm}
        mode={mode}
        initialData={
          mode === "edit" && editing
            ? {
                title: editing.title,
                description: editing.description,
                coin_id: editing.coin_id ?? "",
              }
            : undefined
        }
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Excluir publicação"
        description="Tem certeza que deseja excluir esta publicação? Essa ação não pode ser desfeita."
        confirmLabel={deletingId ? "Excluindo..." : "Excluir"}
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteNow}
        onCancel={() => !deletingId && setConfirmDelete(null)}
        loading={!!deletingId}
      />
    </main>
  );
}
