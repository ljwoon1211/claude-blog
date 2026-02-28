import { redis } from '@/shared/lib/redis';

import type { TagRepository, TagWithCount } from '../types';

const CACHE_TTL_SECONDS = 600; // 10분

function cacheKey(category?: string): string {
  return category ? `tags:${category}` : 'tags:all';
}

export async function listTags(
  repo: TagRepository,
  category?: string,
): Promise<TagWithCount[]> {
  const key = cacheKey(category);

  const cached = await redis.get<TagWithCount[]>(key).catch(() => null);
  if (cached) return cached;

  const tags = await repo.listWithCount(category);
  await redis.set(key, tags, { ex: CACHE_TTL_SECONDS }).catch(() => {});

  return tags;
}
