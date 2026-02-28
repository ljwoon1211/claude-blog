import type { Image, ImageRepository } from '../types';

export async function confirmUpload(
  repo: ImageRepository,
  key: string,
  publicUrl: string,
): Promise<Image> {
  return repo.create({ url: publicUrl, key });
}
