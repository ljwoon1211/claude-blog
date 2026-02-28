import { revalidateTag } from 'next/cache';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { DrizzleImageRepository } from '@/domains/image/repository';
import { deleteObject } from '@/domains/image/storage';
import { syncPostImages } from '@/domains/image/use-cases/sync-post-images';
import { DrizzlePostRepository } from '@/domains/post/repository';
import { createPost } from '@/domains/post/use-cases/create-post';
import { deletePost } from '@/domains/post/use-cases/delete-post';
import { getPostBySlug } from '@/domains/post/use-cases/get-post-by-slug';
import { listPosts } from '@/domains/post/use-cases/list-posts';
import { updatePost } from '@/domains/post/use-cases/update-post';
import { invalidateTagCache } from '@/domains/tag/use-cases/invalidate-tag-cache';
import * as schema from '@/shared/db/schema';

import { os } from '../base';
import { protectedProcedure } from '../middleware';

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

      return getPostBySlug(repo, input.slug, findRedirect);
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
      const post = await createPost(repo, input, context.user.id);

      const imageRepo = new DrizzleImageRepository(context.db);
      await syncPostImages(imageRepo, post.id, input.content);

      revalidateTag('posts', 'default');
      await invalidateTagCache();
      return post;
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

      const post = await updatePost(repo, input, saveSlugRedirect);

      if (input.content !== undefined) {
        const imageRepo = new DrizzleImageRepository(context.db);
        await syncPostImages(imageRepo, post.id, input.content);
      }

      revalidateTag('posts', 'default');
      await invalidateTagCache();
      return post;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const imageRepo = new DrizzleImageRepository(context.db);

      // 1. 삭제할 이미지 목록을 먼저 조회
      const imagesToDelete = await imageRepo.findByPostId(input.id);

      // 2. DB 삭제 (트랜잭션으로 원자성 보장)
      await context.db.transaction(async (tx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const txPostRepo = new DrizzlePostRepository(tx as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const txImageRepo = new DrizzleImageRepository(tx as any);

        // 먼저 자식 레코드 이미지들을 삭제
        await txImageRepo.deleteByPostId(input.id);

        // 게시글 DB 레코드 삭제
        await deletePost(txPostRepo, input.id, async () => {
          /* R2 삭제 분리로 인한 No-op */
        });
      });

      // 3. 스토리지(R2) 객체 실제 삭제 (결과적 일관성)
      for (const img of imagesToDelete) {
        await deleteObject(img.key).catch(console.error);
      }

      revalidateTag('posts', 'default');
      await invalidateTagCache();
      return { success: true };
    }),
});
