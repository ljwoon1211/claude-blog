import Link from 'next/link';

import { Button } from '@/shared/ui/button';

export function HeroSection() {
  return (
    <section className="container mx-auto flex max-w-screen-2xl flex-col items-center px-4 text-center md:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
        Hi, I&apos;m ljwoon 👋
      </h1>
      <p className="text-muted-foreground mt-6 max-w-[42rem] leading-normal sm:text-xl sm:leading-8">
        Welcome to my personal tech blog and portfolio. I write about studying,
        web development, and my technical journey.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild size="lg">
          <Link href="/about">About Me</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link
            href="https://github.com/ljwoon1211"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Profile
          </Link>
        </Button>
      </div>
    </section>
  );
}
