import { Avatar, AvatarFallback } from '@/shared/ui/avatar';

interface ArticleHeaderProps {
  title: string;
  category: string;
  createdAt: Date;
}

export function ArticleHeader({
  title,
  category,
  createdAt,
}: ArticleHeaderProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-8 pb-4 md:px-16 md:pt-12 lg:px-60">
      <span className="bg-primary text-text-on-accent rounded-button inline-flex items-center px-4 py-2 text-sm font-medium">
        {category}
      </span>
      <h1 className="font-display text-foreground max-w-[800px] text-center text-2xl font-normal tracking-tight md:text-[28px] md:tracking-[-0.8px] lg:text-4xl lg:tracking-[-1px]">
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <Avatar className="bg-accent-tint size-8">
          <AvatarFallback className="text-primary bg-accent-tint text-xs font-semibold">
            JW
          </AvatarFallback>
        </Avatar>
        <div className="text-text-tertiary flex items-center gap-2 text-[13px]">
          <span>{formattedDate}</span>
          <span>&middot;</span>
          <span>5분 읽기</span>
        </div>
      </div>
    </div>
  );
}
