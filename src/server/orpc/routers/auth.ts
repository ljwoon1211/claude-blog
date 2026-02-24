import { ORPCError } from '@orpc/server';
import { z } from 'zod';

import { createClient } from '@/shared/lib/supabase/server';

import { os } from '../index';

const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

export const authRouter = os.router({
  login: os.input(loginSchema).handler(async ({ input }) => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new ORPCError('UNAUTHORIZED', {
        message: error.message || '로그인에 실패했습니다.',
      });
    }

    return data;
  }),
});
