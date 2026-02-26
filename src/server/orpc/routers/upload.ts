import { z } from 'zod';

import { confirmUpload } from '@/domains/image/application/use-cases/confirm-upload';
import { deleteImage } from '@/domains/image/application/use-cases/delete-image';
import { presignUpload } from '@/domains/image/application/use-cases/presign-upload';
import { DrizzleImageRepository } from '@/domains/image/infrastructure/repositories/drizzle-image-repository';

import { os } from '../base';
import { protectedProcedure } from '../middleware/auth';

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
   */
  confirm: protectedProcedure
    .input(
      z.object({
        key: z.string().min(1),
        publicUrl: z.string().url(),
      }),
    )
    .handler(async ({ input, context }) => {
      const repo = new DrizzleImageRepository(context.db);
      return confirmUpload(repo, input.key, input.publicUrl);
    }),

  /**
   * 이미지 삭제: R2 + DB에서 삭제
   */
  delete: protectedProcedure
    .input(z.object({ imageId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const repo = new DrizzleImageRepository(context.db);
      await deleteImage(repo, input.imageId);
      return { success: true };
    }),
});
