import { createSlug, isValidSlug } from '../slug';
import type { Post, UpdatePostInput } from '../types';
import type { PostRepository } from '../types';

export type SlugRedirectSaver = (
  oldSlug: string,
  postId: string,
) => Promise<void>;

export async function updatePost(
  repo: PostRepository,
  input: UpdatePostInput,
  saveSlugRedirect: SlugRedirectSaver,
): Promise<Post> {
  const existing = await repo.findById(input.id);
  if (!existing) throw new Error('게시글을 찾을 수 없습니다.');

  // 슬러그 변경 감지
  let newSlug = input.slug;
  if (input.title && input.title !== existing.title && !input.slug) {
    newSlug = createSlug(input.title);
  }
  if (newSlug && !isValidSlug(newSlug)) {
    throw new Error('유효하지 않은 슬러그입니다.');
  }

  // 슬러그가 실제로 변경되었으면 리다이렉트 저장
  if (newSlug && newSlug !== existing.slug) {
    await saveSlugRedirect(existing.slug, existing.id);
  }

  return repo.update({ ...input, slug: newSlug ?? input.slug });
}
