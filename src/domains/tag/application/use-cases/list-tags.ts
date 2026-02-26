import type { TagWithCount } from '../../domain/entities/tag';
import type { TagRepository } from '../../domain/repositories/tag-repository';

export async function listTags(
  repo: TagRepository,
  category?: string,
): Promise<TagWithCount[]> {
  return repo.listWithCount(category);
}
