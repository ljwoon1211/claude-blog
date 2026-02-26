import type { TagWithCount } from '../entities/tag';

export interface TagRepository {
  listWithCount(category?: string): Promise<TagWithCount[]>;
}
