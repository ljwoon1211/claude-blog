import type {
  ListPostsOptions,
  ListPostsResult,
  PostRepository,
} from '../types';

export async function listPosts(
  repo: PostRepository,
  options: ListPostsOptions,
): Promise<ListPostsResult> {
  return repo.list(options);
}
