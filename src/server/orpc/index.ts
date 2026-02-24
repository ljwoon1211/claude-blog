import { os as baseOs } from '@orpc/server';

import { type Context } from './context';
import { authRouter } from './routers/auth';

export const os = baseOs.$context<Context>();

export const appRouter = os.router({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
