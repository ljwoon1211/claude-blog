import type { Image } from '../entities/image';

export interface ImageRepository {
  findById(id: string): Promise<Image | null>;
  findByPostId(postId: string): Promise<Image[]>;
  create(input: { url: string; key: string; postId?: string }): Promise<Image>;
  linkToPost(imageId: string, postId: string): Promise<void>;
  deleteById(id: string): Promise<void>;
  deleteByPostId(postId: string): Promise<Image[]>; // 삭제된 이미지 목록 반환 (R2 정리용)
}
