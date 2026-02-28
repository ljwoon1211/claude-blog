import Link from 'next/link';

import { Post } from '@/domains/post/types';
import { PostCard } from '@/features/post/components/post-card';

interface RecentPostsSectionProps {
  posts: Post[];
}

export function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-20">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-display text-foreground text-2xl font-medium tracking-tight">
          최근 글
        </h2>
        <Link
          href="/study"
          className="text-text-tertiary hover:text-foreground text-sm font-medium transition-colors"
        >
          전체 보기 →
        </Link>
      </div>
      {posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground rounded-lg border border-dashed py-10 text-center">
          아직 작성된 글이 없습니다.
        </p>
      )}
    </section>
  );
}
