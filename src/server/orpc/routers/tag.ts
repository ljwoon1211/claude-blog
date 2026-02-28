import { revalidateTag } from 'next/cache';

import { z } from 'zod';

import { DrizzleTagRepository } from '@/domains/tag/repository';
import { createTag } from '@/domains/tag/use-cases/create-tag';
import { deleteTag } from '@/domains/tag/use-cases/delete-tag';
import { invalidateTagCache } from '@/domains/tag/use-cases/invalidate-tag-cache';
import { listTags } from '@/domains/tag/use-cases/list-tags';
import { updateTag } from '@/domains/tag/use-cases/update-tag';

import { os } from '../base';
import { protectedProcedure } from '../middleware';

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

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .handler(async ({ input, context }) => {
      const repo = new DrizzleTagRepository(context.db);
      const tag = await createTag(repo, input);
      revalidateTag('posts', 'default');
      await invalidateTagCache();
      return tag;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100),
      }),
    )
    .handler(async ({ input, context }) => {
      const repo = new DrizzleTagRepository(context.db);
      const tag = await updateTag(repo, input);
      revalidateTag('posts', 'default');
      await invalidateTagCache();
      return tag;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const repo = new DrizzleTagRepository(context.db);
      const result = await deleteTag(repo, input.id);
      revalidateTag('posts', 'default');
      await invalidateTagCache();
      return result;
    }),
});
