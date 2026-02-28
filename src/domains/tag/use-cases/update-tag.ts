import type { Tag, TagRepository, UpdateTagInput } from '../types';

export async function updateTag(
  repo: TagRepository,
  input: UpdateTagInput,
): Promise<Tag> {
  const existing = await repo.findById(input.id);
  if (!existing) {
    throw new Error('태그를 찾을 수 없습니다.');
  }
  return repo.update(input);
}
