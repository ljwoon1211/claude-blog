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

export type ListPostsOptions = {
  category?: string;
  tag?: string;
  q?: string;
  cursor?: { createdAt: string; id: string };
  limit: number;
};

export type ListPostsResult = {
  posts: Post[];
  nextCursor: { createdAt: string; id: string } | null;
};

export interface PostRepository {
  findBySlug(slug: string): Promise<Post | null>;
  findById(id: string): Promise<Post | null>;
  list(options: ListPostsOptions): Promise<ListPostsResult>;
  create(
    input: CreatePostInput & { slug: string; authorId: string },
  ): Promise<Post>;
  update(input: UpdatePostInput): Promise<Post>;
  delete(id: string): Promise<void>;
}
