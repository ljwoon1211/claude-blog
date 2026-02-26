import type { ImageRepository } from '../../domain/repositories/image-repository';
import { deleteObject } from '../../infrastructure/storage/r2-storage';

export async function deleteImage(
  repo: ImageRepository,
  imageId: string,
): Promise<void> {
  const image = await repo.findById(imageId);
  if (!image) throw new Error('이미지를 찾을 수 없습니다.');

  await deleteObject(image.key);
  await repo.deleteById(imageId);
}
