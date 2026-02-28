import Link from 'next/link';

import { ImageIcon } from 'lucide-react';

import { Post } from '@/domains/post/domain/entities/post';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';

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
    <Card
      className={`hover:bg-accent/50 overflow-hidden transition-colors ${className ?? ''}`}
    >
      <Link
        href={`/${post.category}/${post.slug}`}
        className="flex h-full flex-col"
      >
        <div className="bg-muted flex h-[200px] w-full items-center justify-center">
          {/* TODO: Actual Image Implementation */}
          <ImageIcon className="text-muted-foreground/50 size-8" />
        </div>
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="capitalize">
              {post.category}
            </Badge>
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag.id} variant="default">
                {tag.name}
              </Badge>
            ))}
            {post.tags.length > 2 && (
              <Badge variant="default">+{post.tags.length - 2}</Badge>
            )}
          </div>
          <h3 className="text-foreground line-clamp-2 text-lg leading-[1.4] font-semibold tracking-tight">
            {post.title}
          </h3>
          <div className="text-muted-foreground flex items-center gap-2 text-[13px]">
            <span>{formattedDate}</span>
            <span>·</span>
            <span>5분 읽기</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
