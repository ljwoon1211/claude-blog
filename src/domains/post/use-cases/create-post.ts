import { createSlug } from '../slug';
import type { CreatePostInput, Post } from '../types';
import type { PostRepository } from '../types';

export async function createPost(
  repo: PostRepository,
  input: CreatePostInput,
  authorId: string,
): Promise<Post> {
  const slug = createSlug(input.title);
  return repo.create({ ...input, slug, authorId });
}
