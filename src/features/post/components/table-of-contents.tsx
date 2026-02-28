'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="sticky top-24 hidden w-[200px] shrink-0 lg:block">
      <div className="flex flex-col gap-2">
        <span className="text-text-tertiary text-xs font-semibold tracking-widest uppercase">
          목차
        </span>
        <div className="bg-border h-px w-full" />
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              'text-sm leading-relaxed transition-colors',
              item.level === 3 && 'pl-3',
              activeId === item.id
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.text}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function extractTocItems(content: unknown): TocItem[] {
  if (!content || typeof content !== 'object') return [];

  const doc = content as { type?: string; content?: unknown[] };
  if (doc.type !== 'doc' || !Array.isArray(doc.content)) return [];

  const items: TocItem[] = [];
  let counter = 0;

  for (const node of doc.content) {
    const n = node as {
      type?: string;
      attrs?: { level?: number };
      content?: { text?: string }[];
    };
    if (n.type === 'heading' && n.attrs?.level) {
      const text = n.content?.map((c) => c.text ?? '').join('') ?? '';
      if (text) {
        items.push({
          id: `heading-${counter++}`,
          text,
          level: n.attrs.level,
        });
      }
    }
  }

  return items;
}
