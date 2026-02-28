'use cache';

import type { Metadata } from 'next';
import { cacheTag } from 'next/cache';

import { PostListView } from '@/features/post/components/post-list-view';
import { serverOrpc } from '@/shared/api/orpc.server';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: '프로젝트와 포트폴리오를 소개하는 공간',
};

export default async function PortfolioPage() {
  cacheTag('tags');

  const tagsData = await serverOrpc.tag.list({ category: 'portfolio' });
  const tagNames = tagsData.map((t) => t.name);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 lg:px-20">
      <PostListView category="portfolio" tags={tagNames} />
    </div>
  );
}
