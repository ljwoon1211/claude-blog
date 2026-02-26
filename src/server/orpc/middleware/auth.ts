// 인증된 사용자만 접근 가능한 프로시저를 만들기 위한 미들웨어
import { ORPCError } from '@orpc/server';

import { createClient } from '@/shared/lib/supabase/server';

import { os } from '../base';

export const authMiddleware = os.middleware(async ({ context, next }) => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ORPCError('UNAUTHORIZED', {
      message: '인증이 필요합니다.',
    });
  }

  return next({
    context: { ...context, user },
  });
});

export const protectedProcedure = os.use(authMiddleware);
