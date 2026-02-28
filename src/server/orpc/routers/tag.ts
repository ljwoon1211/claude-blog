import { z } from 'zod';

import { DrizzleTagRepository } from '@/domains/tag/repository';
import { listTags } from '@/domains/tag/use-cases/list-tags';

import { os } from '../base';

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
