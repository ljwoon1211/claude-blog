import { Ratelimit } from '@upstash/ratelimit';

import { redis } from './redis';

/**
 * 로그인 시도 제한: 1분당 5회
 */
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1m'),
  prefix: 'rl:login',
});

/**
 * 공개 API 호출 제한: 10초당 30회
 */
export const publicApiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '10s'),
  prefix: 'rl:api',
});

/**
 * 조회수 증가 제한: 1분당 30회
 */
export const viewRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1m'),
  prefix: 'rl:view',
});
