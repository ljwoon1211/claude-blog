/**
 * Server Component에서 HTTP 왕복 없이 oRPC 프로시저를 직접 호출하기 위한 클라이언트.
 *
 * 주의: headers가 전달되지 않으므로 rate limiting이 적용되지 않는다.
 * protectedProcedure는 Supabase cookie 기반 인증으로 동작하지만,
 * 공개 엔드포인트(list, getBySlug, popular, tag.list)만 사용할 것을 권장한다.
 */
import { createRouterClient } from '@orpc/server';

import { appRouter } from '@/server/orpc';
import { createContext } from '@/server/orpc/context';

export const serverOrpc = createRouterClient(appRouter, {
  context: () => createContext(),
});
