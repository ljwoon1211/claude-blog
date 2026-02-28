export type Image = {
  id: string;
  url: string;
  key: string;
  postId: string | null;
  uploadedBy: string | null;
  createdAt: Date;
};

export const UPLOAD_CONSTRAINTS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
} as const;

export type PresignedUploadResult = {
  uploadUrl: string;
  key: string;
  publicUrl: string;
};

export interface ImageRepository {
  findById(id: string): Promise<Image | null>;
  findByPostId(postId: string): Promise<Image[]>;
  create(input: {
    url: string;
    key: string;
    postId?: string;
    uploadedBy?: string;
  }): Promise<Image>;
  linkToPost(imageId: string, postId: string): Promise<void>;
  linkUnlinkedByUrls(urls: string[], postId: string): Promise<void>;
  deleteById(id: string): Promise<void>;
  deleteByPostId(postId: string): Promise<Image[]>;
}
