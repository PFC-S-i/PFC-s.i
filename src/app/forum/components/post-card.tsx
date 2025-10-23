"use client";

import { ThumbsUp } from "lucide-react";
import { formatRelative } from "@/app/forum/lib/utils";
import type { ForumPost } from "@/types/forum";
import { Button } from "@/components";

type Props = {
  post: ForumPost;
  /** Valor inicial vindo do back (likes_count). Opcional. */
  initialLikes?: number;
};

export function PostCard({ post, initialLikes = 0 }: Props) {
  const likes = post.likes ?? initialLikes;

  return (
    <article className="rounded-2xl border border-white/10 bg-[#1B1B1B] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg md:text-xl font-semibold leading-snug">
            {post.title}
          </h3>
          <div className="mt-1 text-xs opacity-70">
            <span>{post.author}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.createdAt}>
              {formatRelative(post.createdAt)}
            </time>
          </div>
        </div>

        {/* Likes (read-only até existir endpoint) */}
        <Button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs opacity-75"
          title="Curtidas (em breve você poderá curtir)"
          aria-label={`Curtidas: ${likes}`}
        >
          <ThumbsUp className="h-4 w-4" />
          <span className="tabular-nums">{likes}</span>
        </Button>
      </div>

      <p className="mt-3 text-sm md:text-base opacity-90 whitespace-pre-wrap">
        {post.description}
      </p>
    </article>
  );
}
