'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { PostCategory } from '@/domains/post/types';
import { SearchInput } from '@/shared/ui/search-input';
import { Spinner } from '@/shared/ui/spinner';
import { TagChip, TagChips } from '@/shared/ui/tag-chips';

import { useInfinitePosts } from '../hooks/use-infinite-posts';
import { PostCard } from './post-card';

interface PostListViewProps {
  category: PostCategory;
  tags: string[];
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function PostListView({ category, tags }: PostListViewProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const observerRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfinitePosts({
      category,
      tag: activeTag ?? undefined,
      q: debouncedQuery || undefined,
    });

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="flex flex-col items-center gap-6">
      <TagChips className="w-full justify-center">
        <TagChip active={activeTag === null} onClick={() => setActiveTag(null)}>
          전체
        </TagChip>
        {tags.map((tag) => (
          <TagChip
            key={tag}
            active={activeTag === tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            {tag}
          </TagChip>
        ))}
      </TagChips>

      <SearchInput
        placeholder="검색어를 입력하세요..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        containerClassName="w-full max-w-[480px]"
      />

      {isLoading ? (
        <div className="flex w-full justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : allPosts.length > 0 ? (
        <>
          <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {allPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div ref={observerRef} className="h-10" />
          {isFetchingNextPage && (
            <div className="flex w-full justify-center py-4">
              <Spinner />
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground w-full rounded-lg border border-dashed py-10 text-center">
          검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
}
