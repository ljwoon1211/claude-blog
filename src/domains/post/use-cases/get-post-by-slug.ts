import type { Post } from '../types';
import type { PostRepository } from '../types';

export type SlugRedirectFinder = (
  oldSlug: string,
) => Promise<{ postId: string; currentSlug: string } | null>;

export type GetPostBySlugResult =
  | { redirect: false; post: Post }
  | { redirect: true; slug: string };

export async function getPostBySlug(
  repo: PostRepository,
  slug: string,
  findRedirect: SlugRedirectFinder,
): Promise<GetPostBySlugResult | null> {
  const post = await repo.findBySlug(slug);
  if (post) return { redirect: false, post };

  const redirectInfo = await findRedirect(slug);
  if (redirectInfo) return { redirect: true, slug: redirectInfo.currentSlug };

  return null;
}
