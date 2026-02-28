import type { TagRepository, TagWithCount } from '../types';

export async function listTags(
  repo: TagRepository,
  category?: string,
): Promise<TagWithCount[]> {
  return repo.listWithCount(category);
}
