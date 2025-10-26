export type ForumPost = {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  likes?: number;
  dislikes?: number;
};
