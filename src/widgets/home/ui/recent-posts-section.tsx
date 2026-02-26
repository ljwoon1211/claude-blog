import Link from 'next/link';

import { ArrowRight } from 'lucide-react';

import { Post } from '@/domains/post/domain/entities/post';
import { PostCard } from '@/entities/post';

interface RecentPostsSectionProps {
  title: string;
  viewAllHref: string;
  posts: Post[];
  emptyMessage: string;
}

export function RecentPostsSection({
  title,
  viewAllHref,
  posts,
  emptyMessage,
}: RecentPostsSectionProps) {
  return (
    <section className="container mx-auto max-w-screen-2xl px-4 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <Link
          href={viewAllHref}
          className="text-muted-foreground hover:text-foreground flex items-center text-sm font-medium"
        >
          View all <ArrowRight className="ml-1 h-4 w-4" />
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
          {emptyMessage}
        </p>
      )}
    </section>
  );
}
