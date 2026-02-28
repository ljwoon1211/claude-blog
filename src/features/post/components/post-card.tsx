import Link from 'next/link';

import { ImageIcon } from 'lucide-react';

import { Post } from '@/domains/post/types';
import { Badge } from '@/shared/ui/badge';

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div
      className={`border-border bg-card hover:bg-accent/50 overflow-hidden rounded-xl border transition-colors ${className ?? ''}`}
    >
      <Link
        href={`/${post.category}/${post.slug}`}
        className="flex h-full flex-col"
      >
        <div className="bg-muted flex h-[200px] w-full items-center justify-center">
          <ImageIcon className="text-text-disabled size-8" />
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag.id}
                className="bg-accent-tint text-primary rounded-lg border-transparent px-3 py-1.5 text-xs font-medium"
              >
                {tag.name}
              </Badge>
            ))}
            {post.tags.length > 2 && (
              <Badge className="bg-accent-tint text-primary rounded-lg border-transparent px-3 py-1.5 text-xs font-medium">
                +{post.tags.length - 2}
              </Badge>
            )}
          </div>
          <h3 className="text-foreground line-clamp-2 text-lg leading-[1.4] font-semibold tracking-tight">
            {post.title}
          </h3>
          <div className="text-text-tertiary flex items-center gap-2 text-[13px]">
            <span>{formattedDate}</span>
            <span>&middot;</span>
            <span>5분 읽기</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
