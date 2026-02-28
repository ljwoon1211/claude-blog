import { and, eq, isNull, lt } from 'drizzle-orm';

import { deleteObject } from '@/domains/image/storage';
import { db } from '@/server/db';
import * as schema from '@/shared/db/schema';

import { inngest } from '../client';

/**
 * 매일 00:00 KST (15:00 UTC)에 고아 이미지를 정리한다.
 * 조건: postId가 NULL이고 생성 후 24시간이 지난 이미지
 */
export const cleanupOrphanImages = inngest.createFunction(
  { id: 'cleanup-orphan-images' },
  { cron: '0 15 * * *' },
  async ({ logger }) => {
    const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const orphans = await db.query.images.findMany({
      where: and(
        isNull(schema.images.postId),
        lt(schema.images.createdAt, threshold),
      ),
    });

    if (orphans.length === 0) {
      logger.info('고아 이미지 없음');
      return { deleted: 0 };
    }

    let deletedCount = 0;

    for (const image of orphans) {
      try {
        await deleteObject(image.key);
        await db.delete(schema.images).where(eq(schema.images.id, image.id));
        deletedCount++;
      } catch (error) {
        logger.error(`이미지 삭제 실패: ${image.key}`, { error });
      }
    }

    logger.info(`고아 이미지 ${deletedCount}건 삭제 완료`);
    return { deleted: deletedCount };
  },
);
