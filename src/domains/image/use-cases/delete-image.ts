import { deleteObject } from '../storage';
import type { ImageRepository } from '../types';

export async function deleteImage(
  repo: ImageRepository,
  imageId: string,
): Promise<void> {
  const image = await repo.findById(imageId);
  if (!image) throw new Error('이미지를 찾을 수 없습니다.');

  await deleteObject(image.key);
  await repo.deleteById(imageId);
}
