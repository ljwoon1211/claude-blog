import type { Image } from '../../domain/entities/image';
import type { ImageRepository } from '../../domain/repositories/image-repository';

/**
 * 클라이언트가 R2에 직접 업로드 완료 후 호출한다.
 * DB에 이미지 레코드를 생성한다. (postId: null → 게시글 저장 시 연결)
 */
export async function confirmUpload(
  repo: ImageRepository,
  key: string,
  publicUrl: string,
): Promise<Image> {
  return repo.create({ url: publicUrl, key });
}
