export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type TagWithCount = Tag & {
  postCount: number;
};

export interface TagRepository {
  listWithCount(category?: string): Promise<TagWithCount[]>;
}
