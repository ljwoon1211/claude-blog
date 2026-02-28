'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/shared/ui/badge';

interface TagsAndShareProps {
  tags: { id: string; name: string; slug: string }[];
}

export function TagsAndShare({ tags }: TagsAndShareProps) {
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 복사되었습니다.');
    } catch {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-4 md:px-16 lg:px-60">
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            className="bg-accent-tint text-primary rounded-lg border-transparent px-3 py-1.5 text-xs font-medium"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
      <button
        onClick={handleShare}
        className="bg-surface hover:bg-muted flex size-8 items-center justify-center rounded-sm transition-colors"
        aria-label="공유"
      >
        <Share2 className="text-muted-foreground size-4" />
      </button>
    </div>
  );
}
