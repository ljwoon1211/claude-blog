import Link from 'next/link';

import { Button } from '@/shared/ui/button';

export function HeroSection() {
  return (
    <section className="container mx-auto flex max-w-screen-2xl flex-col items-center justify-center px-4 py-16 text-center md:px-8 md:py-24">
      <h1 className="font-display text-foreground text-5xl tracking-tight sm:text-6xl md:text-7xl lg:text-[80px] lg:leading-[1.1] lg:tracking-[-0.04em]">
        Devlog.
      </h1>
      <p className="text-muted-foreground mt-6 max-w-[42rem] text-lg leading-relaxed sm:text-xl">
        기술을 탐구하고, 배움을 기록하고, 성장을 공유하는 공간
      </p>
      <div className="mt-10 flex justify-center">
        <Button asChild size="lg" className="rounded-full px-8 text-base">
          <Link href="/portfolio">글 둘러보기</Link>
        </Button>
      </div>
    </section>
  );
}
