import { count, eq, sql } from 'drizzle-orm';

import type { DB } from '@/server/db';
import * as schema from '@/shared/db/schema';

import type { TagRepository, TagWithCount } from './types';

export class DrizzleTagRepository implements TagRepository {
  constructor(private readonly db: DB) {}

  async listWithCount(category?: string): Promise<TagWithCount[]> {
    if (category) {
      // 해당 카테고리 게시글의 태그만 조회 + 게시글 수 집계
      const rows = await this.db
        .select({
          id: schema.tags.id,
          name: schema.tags.name,
          slug: schema.tags.slug,
          postCount: count(schema.postTags.postId),
        })
        .from(schema.tags)
        .innerJoin(schema.postTags, eq(schema.tags.id, schema.postTags.tagId))
        .innerJoin(schema.posts, eq(schema.postTags.postId, schema.posts.id))
        .where(
          eq(
            schema.posts.category,
            category as 'portfolio' | 'study' | 'retrospective' | 'page',
          ),
        )
        .groupBy(schema.tags.id, schema.tags.name, schema.tags.slug)
        .orderBy(sql`count(${schema.postTags.postId}) desc`);

      return rows;
    }

    // 전체 태그 + 게시글 수
    const rows = await this.db
      .select({
        id: schema.tags.id,
        name: schema.tags.name,
        slug: schema.tags.slug,
        postCount: count(schema.postTags.postId),
      })
      .from(schema.tags)
      .leftJoin(schema.postTags, eq(schema.tags.id, schema.postTags.tagId))
      .groupBy(schema.tags.id, schema.tags.name, schema.tags.slug)
      .orderBy(sql`count(${schema.postTags.postId}) desc`);

    return rows;
  }
}
