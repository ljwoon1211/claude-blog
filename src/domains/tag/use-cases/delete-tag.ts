import type { TagRepository } from '../types';

export async function deleteTag(
  repo: TagRepository,
  id: string,
): Promise<{ deletedPostCount: number }> {
  const existing = await repo.findById(id);
  if (!existing) {
    throw new Error('태그를 찾을 수 없습니다.');
  }
  return repo.delete(id);
}
