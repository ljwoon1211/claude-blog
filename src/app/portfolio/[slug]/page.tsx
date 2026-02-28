import { notFound, redirect } from 'next/navigation';

import { Post } from '@/domains/post/types';
import { ArticleHeader } from '@/features/post/components/article-header';
import { PostDetailBody } from '@/features/post/components/post-detail-body';
import { TagsAndShare } from '@/features/post/components/tags-and-share';
import { serverOrpc } from '@/shared/api/orpc.server';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await serverOrpc.post.getBySlug({ slug }).catch(() => null);

  if (!result) notFound();

  if ('redirect' in result) {
    const r = result as unknown as { slug: string };
    redirect(`/portfolio/${r.slug}`);
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
    </article>
  );
}
