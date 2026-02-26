import type { PostRepository } from '../../domain/repositories/post-repository';
import type {
  ListPostsOptions,
  ListPostsResult,
} from '../../domain/repositories/post-repository';

export async function listPosts(
  repo: PostRepository,
  options: ListPostsOptions,
): Promise<ListPostsResult> {
  return repo.list(options);
}
