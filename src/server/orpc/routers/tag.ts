import { z } from 'zod';

import { listTags } from '@/domains/tag/application/use-cases/list-tags';
import { DrizzleTagRepository } from '@/domains/tag/infrastructure/repositories/drizzle-tag-repository';

import { os } from '../index';

export const tagRouter = os.router({
  list: os
    .input(
      z.object({
        category: z
          .enum(['portfolio', 'study', 'retrospective', 'page'])
          .optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const repo = new DrizzleTagRepository(context.db);
      return listTags(repo, input.category);
    }),
});
