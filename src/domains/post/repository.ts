import { and, eq, ilike, inArray, lt, or, sql } from 'drizzle-orm';

import type { DB } from '@/server/db';
import * as schema from '@/shared/db/schema';

import { createSlug } from './slug';
import type {
  CreatePostInput,
  ListPostsOptions,
  ListPostsResult,
  Post,
  PostRepository,
  UpdatePostInput,
} from './types';

type PostRow = {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  category: 'portfolio' | 'study' | 'retrospective' | 'page';
  thumbnail: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  postTags?: {
    tag: { id: string; name: string; slug: string };
  }[];
};

function toDomain(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    category: row.category,
    thumbnail: row.thumbnail,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    authorId: row.authorId,
    tags: row.postTags?.map((pt) => pt.tag) ?? [],
  };
}

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
      conditions.push(
        or(
          sql`${schema.posts.searchVector} @@ websearch_to_tsquery('simple', ${q})`,
          ilike(schema.posts.title, `%${q}%`),
        ),
      );
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

      const postIdsQuery = this.db
        .select({ postId: schema.postTags.postId })
        .from(schema.postTags)
        .where(eq(schema.postTags.tagId, tagRow.id));

      conditions.push(inArray(schema.posts.id, postIdsQuery));
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
    const insertedPostId = await this.db.transaction(async (tx) => {
      const [inserted] = await tx
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
        const tagIds = await this.upsertTags(tx, input.tags);
        await tx.insert(schema.postTags).values(
          tagIds.map((tagId) => ({
            postId: insertedPost.id,
            tagId,
          })),
        );
      }

      return insertedPost.id;
    });

    const post = await this.findById(insertedPostId);
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

    await this.db.transaction(async (tx) => {
      await tx
        .update(schema.posts)
        .set(updates)
        .where(eq(schema.posts.id, input.id));

      // 태그 업데이트
      if (input.tags !== undefined) {
        await tx
          .delete(schema.postTags)
          .where(eq(schema.postTags.postId, input.id));

        if (input.tags.length > 0) {
          const tagIds = await this.upsertTags(tx, input.tags);
          await tx.insert(schema.postTags).values(
            tagIds.map((tagId) => ({
              postId: input.id,
              tagId,
            })),
          );
        }
      }
    });

    const post = await this.findById(input.id);
    return post!;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.posts).where(eq(schema.posts.id, id));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async upsertTags(tx: any, tagNames: string[]): Promise<string[]> {
    const tagIds: string[] = [];

    for (const name of tagNames) {
      const slug = createSlug(name);

      await tx
        .insert(schema.tags)
        .values({ name, slug })
        .onConflictDoNothing({ target: schema.tags.name });

      const tag = await tx.query.tags.findFirst({
        where: eq(schema.tags.name, name),
      });
      if (tag) tagIds.push(tag.id);
    }

    return tagIds;
  }
}
