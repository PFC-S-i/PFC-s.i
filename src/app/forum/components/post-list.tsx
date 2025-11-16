// src/app/forum/components/post-list.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import type { ForumPost } from "@/types/forum";
import { PostCard } from "./post-card";
import { Button } from "@/components";

const PAGE_SIZE = 10;

type PostListProps = {
  posts: ForumPost[];
};

export function PostList({ posts }: PostListProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));

  // Se o número de posts mudar (ex.: criou ou deletou), volta pra página 1
  useEffect(() => {
    setPage(1);
  }, [posts.length]);

  // Garante que a página atual nunca passe do total (ex.: deletou vários)
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visiblePosts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return posts.slice(start, end);
  }, [page, posts]);

  if (!posts.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-1 gap-4">
        {visiblePosts.map((p) => (
          <li key={p.id}>
            <PostCard post={p} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-col items-center gap-3 md:flex-row md:justify-between">
          <span className="text-xs md:text-sm opacity-70">
            Página {page} de {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => (p > 1 ? p - 1 : p))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p) => (p < totalPages ? p + 1 : p))
              }
              disabled={page === totalPages}
            >
              Próxima
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              {">>"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
