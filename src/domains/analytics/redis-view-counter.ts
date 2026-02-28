import { redis } from '@/shared/lib/redis';

const VIEW_KEY_PREFIX = 'post:views';
const DEDUP_KEY_PREFIX = 'post:views:dedup';
const POPULAR_SORTED_SET = 'popular:posts';
const DEDUP_TTL_SECONDS = 86400; // 24시간

function viewKey(postId: string): string {
  return `${VIEW_KEY_PREFIX}:${postId}`;
}

function dedupKey(postId: string, fingerprint: string): string {
  return `${DEDUP_KEY_PREFIX}:${postId}:${fingerprint}`;
}

/**
 * 조회수를 증가시킨다.
 * fingerprint 기반으로 24시간 내 중복 조회를 방지한다.
 * @returns 실제로 증가했으면 true
 */
export async function incrementViewCount(
  postId: string,
  fingerprint: string,
): Promise<boolean> {
  const key = dedupKey(postId, fingerprint);

  // NX: 키가 없을 때만 설정 (중복 방지)
  const isNew = await redis.set(key, '1', { ex: DEDUP_TTL_SECONDS, nx: true });

  if (!isNew) return false;

  // 조회수 증가 + 인기글 sorted set 갱신
  await Promise.all([
    redis.incr(viewKey(postId)),
    redis.zincrby(POPULAR_SORTED_SET, 1, postId),
  ]);

  return true;
}

/**
 * 특정 게시글의 조회수를 조회한다.
 */
export async function getViewCount(postId: string): Promise<number> {
  const count = await redis.get<number>(viewKey(postId));
  return count ?? 0;
}

/**
 * 인기글 ID 목록을 조회수 내림차순으로 반환한다.
 */
export async function getPopularPostIds(limit: number): Promise<string[]> {
  const results = await redis.zrange(POPULAR_SORTED_SET, 0, limit - 1, {
    rev: true,
  });
  return results as string[];
}
