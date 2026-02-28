import { redis } from '@/shared/lib/redis';

export async function invalidateTagCache(): Promise<void> {
  const keys = await redis.keys('tags:*').catch(() => [] as string[]);
  if (keys.length > 0) {
    await redis.del(...keys).catch(() => {});
  }
}
