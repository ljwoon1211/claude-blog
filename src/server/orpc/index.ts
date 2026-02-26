import { os } from './base';
import { authRouter } from './routers/auth';
import { postRouter } from './routers/post';
import { tagRouter } from './routers/tag';
import { uploadRouter } from './routers/upload';

export { os };

export const appRouter = os.router({
  auth: authRouter,
  post: postRouter,
  tag: tagRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
