export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type TagWithCount = Tag & {
  postCount: number;
};
