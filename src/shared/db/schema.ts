import { relations } from 'drizzle-orm';
import {
  boolean,
  customType,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

export const categoryEnum = pgEnum('category', [
  'portfolio',
  'study',
  'retrospective',
  'page',
]);

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: jsonb('content').notNull(),
  category: categoryEnum('category').notNull(),
  thumbnail: varchar('thumbnail', { length: 512 }),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  authorId: uuid('author_id').notNull(), // FK -> auth.users.id
  searchVector: tsvector('search_vector'),
});

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
});

export const postTags = pgTable(
  'post_tags',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);

export const images = pgTable('images', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: varchar('url', { length: 512 }).notNull(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  postId: uuid('post_id').references(() => posts.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const slugRedirects = pgTable('slug_redirects', {
  id: uuid('id').defaultRandom().primaryKey(),
  oldSlug: varchar('old_slug', { length: 255 }).notNull().unique(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ many }) => ({
  postTags: many(postTags),
  images: many(images),
  slugRedirects: many(slugRedirects),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  post: one(posts, { fields: [images.postId], references: [posts.id] }),
}));

export const slugRedirectsRelations = relations(slugRedirects, ({ one }) => ({
  post: one(posts, { fields: [slugRedirects.postId], references: [posts.id] }),
}));
