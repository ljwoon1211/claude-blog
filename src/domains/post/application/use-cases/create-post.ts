import type { CreatePostInput, Post } from '../../domain/entities/post';
import type { PostRepository } from '../../domain/repositories/post-repository';
import { createSlug } from '../../domain/value-objects/slug';

export async function createPost(
  repo: PostRepository,
  input: CreatePostInput,
  authorId: string,
): Promise<Post> {
  const slug = createSlug(input.title);
  return repo.create({ ...input, slug, authorId });
}
