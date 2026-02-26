import type { CreatePostInput, Post, UpdatePostInput } from '../entities/post';

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
