import type { Metadata } from 'next';
import { cacheTag } from 'next/cache';
import { notFound, redirect } from 'next/navigation';

import { Post } from '@/domains/post/types';
import { GiscusComments } from '@/features/comment';
import { ArticleHeader } from '@/features/post/components/article-header';
import { PostDetailBody } from '@/features/post/components/post-detail-body';
import { TagsAndShare } from '@/features/post/components/tags-and-share';
import { serverOrpc } from '@/shared/api/orpc.server';
import { extractTextFromTiptap } from '@/shared/lib/tiptap-utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await serverOrpc.post.getBySlug({ slug });

  if (!result || 'redirect' in result) {
    return { title: '게시글을 찾을 수 없습니다' };
  }

  const post = result as unknown as Post;
  const description = extractTextFromTiptap(post.content, 160);

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      ...(post.thumbnail && { images: [{ url: post.thumbnail }] }),
    },
    twitter: {
      title: post.title,
      description,
      ...(post.thumbnail && { images: [post.thumbnail] }),
    },
  };
}

export default async function RetrospectiveDetailPage({ params }: Props) {
  'use cache';
  cacheTag('posts');

  const { slug } = await params;
  const result = await serverOrpc.post.getBySlug({ slug });

  if (!result) notFound();

  if ('redirect' in result) {
    const r = result as unknown as { slug: string };
    redirect(`/retrospective/${r.slug}`);
  }

  const post = result as unknown as Post;

  return (
    <article>
      <ArticleHeader
        title={post.title}
        category={post.category}
        createdAt={post.createdAt}
      />
      <PostDetailBody content={post.content} />
      <TagsAndShare tags={post.tags} />
      <div className="border-border mx-4 border-t md:mx-16 lg:mx-60" />
      <GiscusComments />
    </article>
  );
}
