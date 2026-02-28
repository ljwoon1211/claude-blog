import { count, eq, sql } from 'drizzle-orm';

import { createSlug } from '@/domains/post/slug';
import type { DB } from '@/server/db';
import * as schema from '@/shared/db/schema';

import type {
  CreateTagInput,
  Tag,
  TagRepository,
  TagWithCount,
  UpdateTagInput,
} from './types';

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

  async findById(id: string): Promise<Tag | null> {
    const row = await this.db.query.tags.findFirst({
      where: eq(schema.tags.id, id),
    });
    return row ?? null;
  }

  async create(input: CreateTagInput): Promise<Tag> {
    const slug = createSlug(input.name);
    const [row] = await this.db
      .insert(schema.tags)
      .values({ name: input.name, slug })
      .returning();

    if (!row) {
      throw new Error('태그 생성에 실패했습니다.');
    }

    return row;
  }

  async update(input: UpdateTagInput): Promise<Tag> {
    const slug = createSlug(input.name);
    const [row] = await this.db
      .update(schema.tags)
      .set({ name: input.name, slug })
      .where(eq(schema.tags.id, input.id))
      .returning();

    if (!row) {
      throw new Error('태그를 찾을 수 없습니다.');
    }

    return row;
  }

  async delete(id: string): Promise<{ deletedPostCount: number }> {
    const [countRow] = await this.db
      .select({ count: count(schema.postTags.postId) })
      .from(schema.postTags)
      .where(eq(schema.postTags.tagId, id));

    const deletedPostCount = Number(countRow?.count ?? 0);

    await this.db.delete(schema.tags).where(eq(schema.tags.id, id));

    return { deletedPostCount };
  }
}
