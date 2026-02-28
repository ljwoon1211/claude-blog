import { incrementViewCount } from '../redis-view-counter';

export async function incrementView(
  postId: string,
  fingerprint: string,
): Promise<boolean> {
  return incrementViewCount(postId, fingerprint);
}
