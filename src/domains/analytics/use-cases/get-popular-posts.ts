import type { Post, PostRepository } from '@/domains/post/types';

import { getPopularPostIds, getViewCount } from '../redis-view-counter';

export type PopularPost = Post & { viewCount: number };

export async function getPopularPosts(
  repo: PostRepository,
  limit: number,
): Promise<PopularPost[]> {
  const postIds = await getPopularPostIds(limit);

  if (postIds.length === 0) return [];

  const posts: PopularPost[] = [];

  for (const postId of postIds) {
    const post = await repo.findById(postId);
    if (post && post.published) {
      const viewCount = await getViewCount(postId);
      posts.push({ ...post, viewCount });
    }
  }

  return posts;
}
