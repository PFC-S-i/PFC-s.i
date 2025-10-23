import { ForumPost } from "@/types/forum";
import { PostCard } from "./post-card";

export function PostList({ posts }: { posts: ForumPost[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4">
      {posts.map((p) => (
        <li key={p.id}>
          <PostCard post={p} />
        </li>
      ))}
    </ul>
  );
}
