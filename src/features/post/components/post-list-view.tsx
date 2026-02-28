'use client';

import { useState } from 'react';

import { Post } from '@/domains/post/types';
import { SearchInput } from '@/shared/ui/search-input';
import { TagChip, TagChips } from '@/shared/ui/tag-chips';

import { PostCard } from './post-card';

interface PostListViewProps {
  posts: Post[];
  tags: string[];
}

export function PostListView({ posts, tags }: PostListViewProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter((post) => {
    const matchesTag =
      !activeTag || post.tags.some((tag) => tag.name === activeTag);
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

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

      {filteredPosts.length > 0 ? (
        <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground w-full rounded-lg border border-dashed py-10 text-center">
          검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
}
