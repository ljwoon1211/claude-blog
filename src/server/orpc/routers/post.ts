import { ORPCError } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { cleanupPostImages } from '@/domains/image/application/use-cases/sync-post-images';
import { DrizzleImageRepository } from '@/domains/image/infrastructure/repositories/drizzle-image-repository';
import { createPost } from '@/domains/post/application/use-cases/create-post';
import { deletePost } from '@/domains/post/application/use-cases/delete-post';
import { getPostBySlug } from '@/domains/post/application/use-cases/get-post-by-slug';
import { listPosts } from '@/domains/post/application/use-cases/list-posts';
import { updatePost } from '@/domains/post/application/use-cases/update-post';
import { DrizzlePostRepository } from '@/domains/post/infrastructure/repositories/drizzle-post-repository';
import * as schema from '@/shared/db/schema';

import { os } from '../index';
import { protectedProcedure } from '../middleware/auth';

const categorySchema = z.enum(['portfolio', 'study', 'retrospective', 'page']);

const cursorSchema = z
  .object({
    createdAt: z.string(),
    id: z.string(),
  })
  .optional();

export const postRouter = os.router({
  list: os
    .input(
      z.object({
        category: categorySchema.optional(),
        tag: z.string().optional(),
        q: z.string().optional(),
        cursor: cursorSchema,
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .handler(async ({ input, context }) => {
      const repo = new DrizzlePostRepository(context.db);
      return listPosts(repo, input);
    }),

  getBySlug: os
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input, context }) => {
      const repo = new DrizzlePostRepository(context.db);

      const findRedirect = async (oldSlug: string) => {
        const redirect = await context.db.query.slugRedirects.findFirst({
          where: eq(schema.slugRedirects.oldSlug, oldSlug),
          with: { post: true },
        });
        if (!redirect) return null;
        return { postId: redirect.postId, currentSlug: redirect.post.slug };
      };

      const result = await getPostBySlug(repo, input.slug, findRedirect);
      if (!result) {
        throw new ORPCError('NOT_FOUND', {
          message: '게시글을 찾을 수 없습니다.',
        });
      }
      return result;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.unknown(),
        category: categorySchema,
        tags: z.array(z.string()),
        published: z.boolean(),
        thumbnail: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const repo = new DrizzlePostRepository(context.db);
      return createPost(repo, input, context.user.id);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        content: z.unknown().optional(),
        slug: z.string().optional(),
        category: categorySchema.optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().optional(),
        thumbnail: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const repo = new DrizzlePostRepository(context.db);

      const saveSlugRedirect = async (oldSlug: string, postId: string) => {
        await context.db
          .insert(schema.slugRedirects)
          .values({ oldSlug, postId })
          .onConflictDoNothing({ target: schema.slugRedirects.oldSlug });
      };

      return updatePost(repo, input, saveSlugRedirect);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const postRepo = new DrizzlePostRepository(context.db);
      const imageRepo = new DrizzleImageRepository(context.db);

      await deletePost(postRepo, input.id, (postId) =>
        cleanupPostImages(imageRepo, postId),
      );

      return { success: true };
    }),
});
