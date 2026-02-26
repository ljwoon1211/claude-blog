// Post 도메인 엔티티 — 순수 TypeScript, 외부 의존 없음

export type PostCategory = 'portfolio' | 'study' | 'retrospective' | 'page';

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: unknown; // tiptap JSON
  category: PostCategory;
  thumbnail: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  tags: { id: string; name: string; slug: string }[];
};

export type CreatePostInput = {
  title: string;
  content: unknown;
  category: PostCategory;
  tags: string[];
  published: boolean;
  thumbnail?: string;
};

export type UpdatePostInput = {
  id: string;
  title?: string;
  content?: unknown;
  slug?: string;
  category?: PostCategory;
  tags?: string[];
  published?: boolean;
  thumbnail?: string;
};
