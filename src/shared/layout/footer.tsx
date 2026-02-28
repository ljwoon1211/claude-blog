import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface w-full">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-8 md:py-6 lg:px-20">
        <p className="text-text-tertiary text-[13px] font-normal">
          &copy; 2026 devlog. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-tertiary hover:text-foreground text-[13px] transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="/rss"
            className="text-text-tertiary hover:text-foreground text-[13px] transition-colors"
          >
            RSS
          </Link>
        </div>
      </div>
    </footer>
  );
}
