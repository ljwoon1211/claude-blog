import { ORPCError } from '@orpc/server';
import { z } from 'zod';

import { loginRateLimit } from '@/shared/lib/rate-limit';
import { createClient } from '@/shared/lib/supabase/server';

import { os } from '../base';
import { extractClientIp } from '../context';

const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

export const authRouter = os.router({
  login: os.input(loginSchema).handler(async ({ input, context }) => {
    // IP + 이메일 기반 Rate Limiting (브루트포스 방지)
    const ip = extractClientIp(context.headers);
    const identifier = `${ip}:${input.email}`;
    const { success } = await loginRateLimit.limit(identifier);

    if (!success) {
      throw new ORPCError('TOO_MANY_REQUESTS', {
        message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
      });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      // Supabase 원본 에러 메시지를 숨겨 User Enumeration 방지
      throw new ORPCError('UNAUTHORIZED', {
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    return data;
  }),
});
