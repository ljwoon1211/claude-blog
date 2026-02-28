import type { CreateTagInput, Tag, TagRepository } from '../types';

export async function createTag(
  repo: TagRepository,
  input: CreateTagInput,
): Promise<Tag> {
  return repo.create(input);
}
