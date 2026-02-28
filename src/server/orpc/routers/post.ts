import { revalidateTag } from 'next/cache';

import { ORPCError } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { getPopularPosts } from '@/domains/analytics/use-cases/get-popular-posts';
import { incrementView } from '@/domains/analytics/use-cases/increment-view';
import { DrizzleImageRepository } from '@/domains/image/repository';
import { deleteObject } from '@/domains/image/storage';
import { syncPostImages } from '@/domains/image/use-cases/sync-post-images';
import { DrizzlePostRepository } from '@/domains/post/repository';
import { createPost } from '@/domains/post/use-cases/create-post';
import { deletePost } from '@/domains/post/use-cases/delete-post';
import { getPostBySlug } from '@/domains/post/use-cases/get-post-by-slug';
import { listPosts } from '@/domains/post/use-cases/list-posts';
import { sanitizeTiptapContent } from '@/domains/post/use-cases/sanitize-tiptap';
import { updatePost } from '@/domains/post/use-cases/update-post';
import { invalidateTagCache } from '@/domains/tag/use-cases/invalidate-tag-cache';
import * as schema from '@/shared/db/schema';
import { publicApiRateLimit, viewRateLimit } from '@/shared/lib/rate-limit';

import { os } from '../base';
import { extractClientIp } from '../context';
import { protectedProcedure } from '../middleware';

const categorySchema = z.enum(['portfolio', 'study', 'retrospective', 'page']);

const cursorSchema = z
  .object({
    createdAt: z.string(),
    id: z.string(),
  })
  .optional();

// TipTap JSON 기본 구조 검증 스키마
type TiptapNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Record<string, unknown>[];
  content?: TiptapNode[];
};

const tiptapNodeSchema: z.ZodType<TiptapNode> = z.lazy(() =>
  z.object({
    type: z.string().optional(),
    text: z.string().optional(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    marks: z.array(z.record(z.string(), z.unknown())).optional(),
    content: z.array(tiptapNodeSchema).optional(),
  }),
);

const tiptapContentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(tiptapNodeSchema).optional(),
});

/** 게시글이 현재 사용자의 소유인지 검증 */
async function verifyPostOwnership(
  repo: DrizzlePostRepository,
  postId: string,
  userId: string,
): Promise<void> {
  const post = await repo.findById(postId);
  if (!post) {
    throw new ORPCError('NOT_FOUND', {
      message: '게시글을 찾을 수 없습니다.',
    });
  }
  if (post.authorId !== userId) {
    throw new ORPCError('FORBIDDEN', {
      message: '이 게시글을 수정할 권한이 없습니다.',
    });
  }
}

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
      if (context.headers) {
        const ip = extractClientIp(context.headers);
        const { success } = await publicApiRateLimit.limit(ip);
        if (!success) {
          throw new ORPCError('TOO_MANY_REQUESTS', {
            message: '요청이 너무 많습니다.',
          });
        }
      }

      const repo = new DrizzlePostRepository(context.db);
      return listPosts(repo, { ...input, publishedOnly: true });
    }),

  getBySlug: os
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input, context }) => {
      if (context.headers) {
        const ip = extractClientIp(context.headers);
        const { success } = await publicApiRateLimit.limit(ip);
        if (!success) {
          throw new ORPCError('TOO_MANY_REQUESTS', {
            message: '요청이 너무 많습니다.',
          });
        }
      }

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

      // 미공개 게시글은 공개 API에서 접근 불가
      if (result && !result.redirect && !result.post.published) {
        return null;
      }

      return result;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: tiptapContentSchema,
        category: categorySchema,
        tags: z.array(z.string()),
        published: z.boolean(),
        thumbnail: z.url().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const sanitizedContent = sanitizeTiptapContent(
        input.content as Record<string, unknown>,
      );
      const sanitizedInput = { ...input, content: sanitizedContent };

      const repo = new DrizzlePostRepository(context.db);
      const post = await createPost(repo, sanitizedInput, context.user.id);

      const imageRepo = new DrizzleImageRepository(context.db);
      await syncPostImages(imageRepo, post.id, sanitizedContent);

      revalidateTag('posts', 'default');
      await invalidateTagCache();
      return post;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        content: tiptapContentSchema.optional(),
        slug: z.string().optional(),
        category: categorySchema.optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().optional(),
        thumbnail: z.url().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const repo = new DrizzlePostRepository(context.db);

      // 소유권 검증
      await verifyPostOwnership(repo, input.id, context.user.id);

      const saveSlugRedirect = async (oldSlug: string, postId: string) => {
        await context.db
          .insert(schema.slugRedirects)
          .values({ oldSlug, postId })
          .onConflictDoNothing({ target: schema.slugRedirects.oldSlug });
      };

      const sanitizedInput = input.content
        ? {
            ...input,
            content: sanitizeTiptapContent(
              input.content as Record<string, unknown>,
            ),
          }
        : input;

      const post = await updatePost(repo, sanitizedInput, saveSlugRedirect);

      if (sanitizedInput.content !== undefined) {
        const imageRepo = new DrizzleImageRepository(context.db);
        await syncPostImages(imageRepo, post.id, sanitizedInput.content);
      }

      revalidateTag('posts', 'default');
      await invalidateTagCache();
      return post;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const repo = new DrizzlePostRepository(context.db);

      // 소유권 검증
      await verifyPostOwnership(repo, input.id, context.user.id);

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

  incrementView: os
    .input(z.object({ postId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const ip = extractClientIp(context.headers);

      // Rate Limiting (대량 요청 방지)
      const { success } = await viewRateLimit.limit(ip);
      if (!success) {
        return { success: false };
      }

      await incrementView(input.postId, ip);
      return { success: true };
    }),

  popular: os
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(5),
      }),
    )
    .handler(async ({ input, context }) => {
      if (context.headers) {
        const ip = extractClientIp(context.headers);
        const { success } = await publicApiRateLimit.limit(ip);
        if (!success) {
          throw new ORPCError('TOO_MANY_REQUESTS', {
            message: '요청이 너무 많습니다.',
          });
        }
      }

      const repo = new DrizzlePostRepository(context.db);
      return getPopularPosts(repo, input.limit);
    }),
});
