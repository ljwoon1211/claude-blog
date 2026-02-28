'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import type { PostCategory } from '@/domains/post/types';
import { orpcQuery } from '@/shared/api/orpc-react';

const PAGE_SIZE = 12;

interface UseInfinitePostsOptions {
  category: PostCategory;
  tag?: string;
  q?: string;
}

export function useInfinitePosts({
  category,
  tag,
  q,
}: UseInfinitePostsOptions) {
  return useInfiniteQuery(
    orpcQuery.post.list.infiniteOptions({
      input: (pageParam: { createdAt: string; id: string } | undefined) => ({
        category,
        tag,
        q: q || undefined,
        cursor: pageParam,
        limit: PAGE_SIZE,
      }),
      initialPageParam: undefined as
        | { createdAt: string; id: string }
        | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  );
}
