import Link from 'next/link';

import { PenLine } from 'lucide-react';

import { Post } from '@/domains/post/types';
import { PostCard } from '@/features/post/components/post-card';

interface RecentPostsSectionProps {
  posts: Post[];
}

export function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  if (posts.length === 0) {
    return (
      <section className="bg-muted/30 px-4 py-16 md:px-8 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="font-display text-foreground mb-8 text-2xl font-medium tracking-tight">
            최근 글
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-background/60 flex flex-col gap-3 rounded-lg p-5"
              >
                <div className="bg-muted h-32 rounded-md" />
                <div className="bg-muted h-4 w-3/4 rounded" />
                <div className="bg-muted h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center pt-8">
            <PenLine className="text-muted-foreground/50 mb-2 size-5" />
            <p className="text-muted-foreground text-sm">
              아직 작성된 글이 없습니다
            </p>
          </div>
        </div>
      </section>
    );
  }

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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
