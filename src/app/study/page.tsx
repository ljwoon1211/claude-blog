'use cache';

import type { Metadata } from 'next';
import { cacheTag } from 'next/cache';

import { PostListView } from '@/features/post/components/post-list-view';
import { serverOrpc } from '@/shared/api/orpc.server';

export const metadata: Metadata = {
  title: 'Study',
  description: '기술 학습과 개발 경험을 기록한 공간',
};

export default async function StudyPage() {
  cacheTag('tags');

  const tagsData = await serverOrpc.tag.list({ category: 'study' });
  const tagNames = tagsData.map((t) => t.name);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-20">
      <PostListView category="study" tags={tagNames} />
    </div>
  );
}
