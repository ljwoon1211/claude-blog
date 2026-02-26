import { os as baseOs } from '@orpc/server';

import { type Context } from './context';
import { authRouter } from './routers/auth';
import { postRouter } from './routers/post';
import { tagRouter } from './routers/tag';
import { uploadRouter } from './routers/upload';

export const os = baseOs.$context<Context>();

export const appRouter = os.router({
  auth: authRouter,
  post: postRouter,
  tag: tagRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
