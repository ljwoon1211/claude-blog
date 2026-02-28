import Link from 'next/link';

import { Avatar, AvatarFallback } from '@/shared/ui/avatar';

export function AboutTeaser() {
  return (
    <section className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-4 py-6 md:flex-row md:items-center md:gap-8 md:px-8 md:py-12 lg:px-20">
      <Avatar className="bg-accent-tint size-16 shrink-0">
        <AvatarFallback className="text-primary bg-accent-tint text-lg font-semibold">
          JW
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2.5 text-center md:text-left">
        <p className="text-foreground text-lg font-semibold tracking-tight">
          안녕하세요, 개발자 JW입니다 👋
        </p>
        <p className="text-muted-foreground text-[15px] leading-relaxed">
          풀스택 개발에 관심이 많고, 배운 것을 기록하는 걸 좋아합니다.
          <br className="hidden md:block" />
          주로 Next.js, TypeScript, 인프라 관련 글을 씁니다.
        </p>
        <Link
          href="/about"
          className="text-primary text-sm font-medium hover:underline"
        >
          더 알아보기 →
        </Link>
      </div>
    </section>
  );
}
