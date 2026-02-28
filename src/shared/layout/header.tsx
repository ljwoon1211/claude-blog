import Link from 'next/link';

import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

import { MobileNav } from './mobile-nav';

const navItems = [
  { href: '/about', label: '자기소개' },
  { href: '/portfolio', label: '포트폴리오' },
  { href: '/study', label: '공부' },
  { href: '/retrospective', label: '회고' },
];

export function Header() {
  return (
    <header className="bg-card border-border sticky top-0 z-50 w-full border-b">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 md:px-8 lg:px-20">
        <div className="flex items-center">
          <div className="md:hidden">
            <MobileNav items={navItems} />
          </div>

          <Link href="/" className="flex items-center">
            <span className="font-display text-foreground text-lg font-semibold tracking-tight">
              Devlog.
            </span>
          </Link>

          <nav className="ml-12 hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-text-tertiary hover:text-foreground text-sm transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Avatar className="bg-accent-tint size-10">
            <AvatarFallback className="text-primary bg-accent-tint text-sm font-semibold">
              JW
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
