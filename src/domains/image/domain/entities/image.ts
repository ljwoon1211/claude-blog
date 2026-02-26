export type Image = {
  id: string;
  url: string;
  key: string;
  postId: string | null;
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
