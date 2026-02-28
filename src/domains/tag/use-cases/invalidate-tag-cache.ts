import { redis } from '@/shared/lib/redis';

// 태그 캐시에 사용되는 모든 고정 키 목록
// redis.keys() 대신 사용하여 Redis 블로킹 방지
const TAG_CACHE_KEYS = [
  'tags:all',
  'tags:portfolio',
  'tags:study',
  'tags:retrospective',
  'tags:page',
];

export async function invalidateTagCache(): Promise<void> {
  await redis.del(...TAG_CACHE_KEYS).catch(() => {});
}
