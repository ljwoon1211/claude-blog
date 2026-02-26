import type { Post } from '../../domain/entities/post';

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

export function toDomain(row: PostRow): Post {
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
