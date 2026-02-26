import type { PostRepository } from '../../domain/repositories/post-repository';

export type ImageCleanup = (postId: string) => Promise<void>;

export async function deletePost(
  repo: PostRepository,
  postId: string,
  cleanupImages: ImageCleanup,
): Promise<void> {
  const post = await repo.findById(postId);
  if (!post) throw new Error('게시글을 찾을 수 없습니다.');

  await cleanupImages(postId);
  await repo.delete(postId);
}
