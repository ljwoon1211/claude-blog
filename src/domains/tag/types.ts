export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type TagWithCount = Tag & {
  postCount: number;
};

export type CreateTagInput = {
  name: string;
};

export type UpdateTagInput = {
  id: string;
  name: string;
};

export interface TagRepository {
  listWithCount(category?: string): Promise<TagWithCount[]>;
  findById(id: string): Promise<Tag | null>;
  create(input: CreateTagInput): Promise<Tag>;
  update(input: UpdateTagInput): Promise<Tag>;
  delete(id: string): Promise<{ deletedPostCount: number }>;
}
