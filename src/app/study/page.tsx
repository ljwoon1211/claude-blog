'use cache';

import { cacheTag } from 'next/cache';

import { Post } from '@/domains/post/types';
import { PostListView } from '@/features/post/components/post-list-view';
import { serverOrpc } from '@/shared/api/orpc.server';

export default async function StudyPage() {
  cacheTag('posts');

  const data = await serverOrpc.post.list({ category: 'study', limit: 50 });
  const posts = (data?.posts ?? []) as Post[];

  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags.map((tag) => tag.name))),
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-20">
      <PostListView posts={posts} tags={allTags} />
    </div>
  );
}
