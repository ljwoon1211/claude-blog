import { ORPCError } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { DrizzleImageRepository } from '@/domains/image/repository';
import { getPublicUrl } from '@/domains/image/storage';
import { confirmUpload } from '@/domains/image/use-cases/confirm-upload';
import { deleteImage } from '@/domains/image/use-cases/delete-image';
import { presignUpload } from '@/domains/image/use-cases/presign-upload';
import * as schema from '@/shared/db/schema';

import { os } from '../base';
import { protectedProcedure } from '../middleware';

export const uploadRouter = os.router({
  /**
   * 1단계: Presigned URL 발급
   * 클라이언트가 파일명, MIME 타입, 크기를 전송하면
   * R2에 직접 업로드할 수 있는 Presigned PUT URL을 반환한다.
   */
  presign: protectedProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        contentType: z.string().min(1),
        fileSize: z.number().positive(),
      }),
    )
    .handler(async ({ input }) => {
      return presignUpload(input.filename, input.contentType, input.fileSize);
    }),

  /**
   * 2단계: 업로드 확인
   * 클라이언트가 R2에 직접 업로드 완료 후 호출한다.
   * DB에 이미지 레코드를 생성한다. (postId: null)
   * publicUrl은 key를 기반으로 서버에서 생성한다. (Stored XSS 방지)
   */
  confirm: protectedProcedure
    .input(
      z.object({
        // presign에서 발급한 key 형식만 허용 (uploads/{timestamp}-{uuid}.{ext})
        key: z
          .string()
          .regex(
            /^uploads\/\d+-[0-9a-f-]{36}\.(jpg|jpeg|png|webp|gif)$/,
            '유효하지 않은 이미지 키입니다.',
          ),
      }),
    )
    .handler(async ({ input, context }) => {
      // publicUrl을 서버에서 직접 생성 (클라이언트 입력 차단)
      const publicUrl = getPublicUrl(input.key);
      const repo = new DrizzleImageRepository(context.db);
      return confirmUpload(repo, input.key, publicUrl, context.user.id);
    }),

  /**
   * 이미지 삭제: R2 + DB에서 삭제
   * 게시글에 연결된 이미지는 해당 게시글 작성자만 삭제 가능
   */
  delete: protectedProcedure
    .input(z.object({ imageId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const repo = new DrizzleImageRepository(context.db);
      const image = await repo.findById(input.imageId);

      if (!image) {
        throw new ORPCError('NOT_FOUND', {
          message: '이미지를 찾을 수 없습니다.',
        });
      }

      // 소유권 검증: 게시글 연결 이미지는 게시글 작성자, 미연결 이미지는 업로더만 삭제 가능
      if (image.postId) {
        const post = await context.db.query.posts.findFirst({
          where: eq(schema.posts.id, image.postId),
        });
        if (post && post.authorId !== context.user.id) {
          throw new ORPCError('FORBIDDEN', {
            message: '이 이미지를 삭제할 권한이 없습니다.',
          });
        }
      } else if (image.uploadedBy && image.uploadedBy !== context.user.id) {
        throw new ORPCError('FORBIDDEN', {
          message: '이 이미지를 삭제할 권한이 없습니다.',
        });
      }

      await deleteImage(repo, input.imageId);
      return { success: true };
    }),
});
