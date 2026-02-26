import Link from 'next/link';

import { Post } from '@/domains/post/domain/entities/post';
import { Badge } from '@/shared/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

interface PostCardProps {
  post: Post;
  className?: string;
}

export function PostCard({ post, className }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className={className}>
      <Link href={`/${post.category}/${post.slug}`} className="block h-full">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <Badge variant="secondary" className="capitalize">
              {post.category}
            </Badge>
            <span className="text-muted-foreground text-sm">
              {formattedDate}
            </span>
          </div>
          <CardTitle className="line-clamp-2 text-xl">{post.title}</CardTitle>
          <CardDescription className="mt-2 line-clamp-3 text-sm">
            {/* TODO: If there's excerpt or plain text content */}
            {post.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
