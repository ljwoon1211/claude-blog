import { deleteObject } from '../storage';
import type { ImageRepository } from '../types';

export function extractImageUrls(content: unknown): string[] {
  if (!content || typeof content !== 'object') return [];
  const urls: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const traverse = (node: any) => {
    if (node?.type === 'image' && typeof node?.attrs?.src === 'string') {
      urls.push(node.attrs.src);
    }
    if (Array.isArray(node?.content)) {
      node.content.forEach(traverse);
    }
  };

  traverse(content);
  return urls;
}

export async function syncPostImages(
  repo: ImageRepository,
  postId: string,
  content: unknown,
): Promise<void> {
  const contentImageUrls = extractImageUrls(content);
  const urlSet = new Set(contentImageUrls);

  // 1. 새 이미지 연결 (content 안에 있는 URL 중 postId가 null인 것들을 현재 게시글과 연결)
  if (contentImageUrls.length > 0) {
    await repo.linkUnlinkedByUrls(contentImageUrls, postId);
  }

  // 2. 삭제된 이미지 정리 (현재 게시글에 연결된 이미지 중 content에 없는 것)
  const dbImages = await repo.findByPostId(postId);
  const unusedImages = dbImages.filter((img) => !urlSet.has(img.url));

  for (const img of unusedImages) {
    await repo.deleteById(img.id); // DB 레코드 삭제 먼저 수행
    await deleteObject(img.key).catch(console.error); // R2 실제 객체 삭제는 Best-effort
  }
}

export async function cleanupPostImages(
  repo: ImageRepository,
  postId: string,
): Promise<void> {
  const images = await repo.deleteByPostId(postId);
  for (const img of images) {
    await deleteObject(img.key);
  }
}
