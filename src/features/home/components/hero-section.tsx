import Link from 'next/link';

import { Button } from '@/shared/ui/button';

export function HeroSection() {
  return (
    <section className="mx-auto flex max-w-[1440px] flex-col items-center justify-center px-4 py-12 text-center md:px-8 md:py-16 lg:px-20 lg:py-20">
      <h1 className="font-display text-foreground text-[32px] font-normal tracking-tight sm:text-[40px] md:text-[56px] md:tracking-[-2px]">
        Devlog.
      </h1>
      <p className="text-muted-foreground mt-5 max-w-[42rem] text-[15px] leading-relaxed tracking-tight md:text-lg md:tracking-[-0.3px]">
        기술을 탐구하고, 배움을 기록하고, 성장을 공유하는 공간
      </p>
      <div className="mt-6 flex justify-center pt-4">
        <Button asChild className="rounded-full px-6 py-3">
          <Link href="/study">글 둘러보기</Link>
        </Button>
      </div>
    </section>
  );
}
