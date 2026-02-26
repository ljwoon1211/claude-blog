import type { ImageRepository } from '../../domain/repositories/image-repository';
import { deleteObject } from '../../infrastructure/storage/r2-storage';

/**
 * 게시글 content에서 사용 중인 이미지 URL을 추출하고,
 * DB에 저장된 이미지와 비교하여 미사용 이미지를 R2 + DB에서 삭제한다.
 */
export async function syncPostImages(
  repo: ImageRepository,
  postId: string,
  contentImageUrls: string[],
): Promise<void> {
  const dbImages = await repo.findByPostId(postId);
  const urlSet = new Set(contentImageUrls);

  // 미사용 이미지 삭제
  const unusedImages = dbImages.filter((img) => !urlSet.has(img.url));
  for (const img of unusedImages) {
    await deleteObject(img.key);
    await repo.deleteById(img.id);
  }
}

/**
 * 게시글 삭제 시 연결된 모든 이미지를 R2 + DB에서 삭제한다.
 */
export async function cleanupPostImages(
  repo: ImageRepository,
  postId: string,
): Promise<void> {
  const images = await repo.deleteByPostId(postId);
  for (const img of images) {
    await deleteObject(img.key);
  }
}
