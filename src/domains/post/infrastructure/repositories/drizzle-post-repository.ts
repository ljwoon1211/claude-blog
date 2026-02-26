import { and, eq, ilike, lt, or, sql } from 'drizzle-orm';

import type { DB } from '@/server/db';
import * as schema from '@/shared/db/schema';

import type {
  CreatePostInput,
  Post,
  UpdatePostInput,
} from '../../domain/entities/post';
import type {
  ListPostsOptions,
  ListPostsResult,
  PostRepository,
} from '../../domain/repositories/post-repository';
import { createSlug } from '../../domain/value-objects/slug';
import { toDomain } from '../mappers/post-mapper';

export class DrizzlePostRepository implements PostRepository {
  constructor(private readonly db: DB) {}

  async findBySlug(slug: string): Promise<Post | null> {
    const row = await this.db.query.posts.findFirst({
      where: eq(schema.posts.slug, slug),
      with: { postTags: { with: { tag: true } } },
    });
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<Post | null> {
    const row = await this.db.query.posts.findFirst({
      where: eq(schema.posts.id, id),
      with: { postTags: { with: { tag: true } } },
    });
    return row ? toDomain(row) : null;
  }

  async list(options: ListPostsOptions): Promise<ListPostsResult> {
    const { category, tag, q, cursor, limit } = options;
    const conditions = [];

    if (category) {
      conditions.push(
        eq(
          schema.posts.category,
          category as 'portfolio' | 'study' | 'retrospective' | 'page',
        ),
      );
    }

    if (q) {
      conditions.push(ilike(schema.posts.title, `%${q}%`));
    }

    if (cursor) {
      conditions.push(
        or(
          lt(schema.posts.createdAt, new Date(cursor.createdAt)),
          and(
            eq(schema.posts.createdAt, new Date(cursor.createdAt)),
            lt(schema.posts.id, cursor.id),
          ),
        ),
      );
    }

    // 태그 필터가 있으면 해당 태그를 가진 postId를 먼저 조회
    if (tag) {
      const tagRow = await this.db.query.tags.findFirst({
        where: eq(schema.tags.slug, tag),
      });
      if (!tagRow) return { posts: [], nextCursor: null };

      const postIdRows = await this.db
        .select({ postId: schema.postTags.postId })
        .from(schema.postTags)
        .where(eq(schema.postTags.tagId, tagRow.id));

      const postIds = postIdRows.map((r) => r.postId);
      if (postIds.length === 0) return { posts: [], nextCursor: null };

      conditions.push(
        sql`${schema.posts.id} IN (${sql.join(
          postIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );
    }

    const rows = await this.db.query.posts.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { postTags: { with: { tag: true } } },
      orderBy: (posts, { desc }) => [desc(posts.createdAt), desc(posts.id)],
      limit: limit + 1,
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const posts = items.map(toDomain);

    const lastItem = items.at(-1);
    const nextCursor =
      hasMore && lastItem
        ? { createdAt: lastItem.createdAt.toISOString(), id: lastItem.id }
        : null;

    return { posts, nextCursor };
  }

  async create(
    input: CreatePostInput & { slug: string; authorId: string },
  ): Promise<Post> {
    const [inserted] = await this.db
      .insert(schema.posts)
      .values({
        title: input.title,
        slug: input.slug,
        content: input.content,
        category: input.category,
        thumbnail: input.thumbnail ?? null,
        published: input.published,
        authorId: input.authorId,
      })
      .returning();

    const insertedPost = inserted!;

    // 태그 upsert + 연결
    if (input.tags.length > 0) {
      const tagIds = await this.upsertTags(input.tags);
      await this.db.insert(schema.postTags).values(
        tagIds.map((tagId) => ({
          postId: insertedPost.id,
          tagId,
        })),
      );
    }

    const post = await this.findById(insertedPost.id);
    return post!;
  }

  async update(input: UpdatePostInput): Promise<Post> {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input.title !== undefined) updates.title = input.title;
    if (input.content !== undefined) updates.content = input.content;
    if (input.slug !== undefined) updates.slug = input.slug;
    if (input.category !== undefined) updates.category = input.category;
    if (input.published !== undefined) updates.published = input.published;
    if (input.thumbnail !== undefined) updates.thumbnail = input.thumbnail;

    await this.db
      .update(schema.posts)
      .set(updates)
      .where(eq(schema.posts.id, input.id));

    // 태그 업데이트
    if (input.tags !== undefined) {
      await this.db
        .delete(schema.postTags)
        .where(eq(schema.postTags.postId, input.id));

      if (input.tags.length > 0) {
        const tagIds = await this.upsertTags(input.tags);
        await this.db.insert(schema.postTags).values(
          tagIds.map((tagId) => ({
            postId: input.id,
            tagId,
          })),
        );
      }
    }

    const post = await this.findById(input.id);
    return post!;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.posts).where(eq(schema.posts.id, id));
  }

  private async upsertTags(tagNames: string[]): Promise<string[]> {
    const tagIds: string[] = [];

    for (const name of tagNames) {
      const slug = createSlug(name);

      await this.db
        .insert(schema.tags)
        .values({ name, slug })
        .onConflictDoNothing({ target: schema.tags.name });

      const tag = await this.db.query.tags.findFirst({
        where: eq(schema.tags.name, name),
      });
      if (tag) tagIds.push(tag.id);
    }

    return tagIds;
  }
}
