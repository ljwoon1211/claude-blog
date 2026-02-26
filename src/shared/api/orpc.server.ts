// Server Component에서 HTTP 왕복 없이 oRPC 프로시저를 직접 호출하기 위한 클라이언트
import { createRouterClient } from '@orpc/server';

import { appRouter } from '@/server/orpc';
import { createContext } from '@/server/orpc/context';

export const serverOrpc = createRouterClient(appRouter, {
  context: createContext,
});
