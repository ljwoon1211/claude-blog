import { and, eq, inArray, isNull } from 'drizzle-orm';

import type { DB } from '@/server/db';
import * as schema from '@/shared/db/schema';

import type { Image, ImageRepository } from './types';

export class DrizzleImageRepository implements ImageRepository {
  constructor(private readonly db: DB) {}

  async findById(id: string): Promise<Image | null> {
    const row = await this.db.query.images.findFirst({
      where: eq(schema.images.id, id),
    });
    return row ?? null;
  }

  async findByPostId(postId: string): Promise<Image[]> {
    return this.db.query.images.findMany({
      where: eq(schema.images.postId, postId),
    });
  }

  async create(input: {
    url: string;
    key: string;
    postId?: string;
  }): Promise<Image> {
    const [row] = await this.db
      .insert(schema.images)
      .values({
        url: input.url,
        key: input.key,
        postId: input.postId ?? null,
      })
      .returning();
    return row!;
  }

  async linkToPost(imageId: string, postId: string): Promise<void> {
    await this.db
      .update(schema.images)
      .set({ postId })
      .where(eq(schema.images.id, imageId));
  }

  async linkUnlinkedByUrls(urls: string[], postId: string): Promise<void> {
    if (urls.length === 0) return;
    await this.db
      .update(schema.images)
      .set({ postId })
      .where(
        and(isNull(schema.images.postId), inArray(schema.images.url, urls)),
      );
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(schema.images).where(eq(schema.images.id, id));
  }

  async deleteByPostId(postId: string): Promise<Image[]> {
    const images = await this.findByPostId(postId);
    if (images.length > 0) {
      await this.db
        .delete(schema.images)
        .where(eq(schema.images.postId, postId));
    }
    return images;
  }
}
