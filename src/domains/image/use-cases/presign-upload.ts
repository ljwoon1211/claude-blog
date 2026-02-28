import { createPresignedUploadUrl } from '../storage';
import { type PresignedUploadResult, UPLOAD_CONSTRAINTS } from '../types';

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

export async function presignUpload(
  filename: string,
  contentType: string,
  fileSize: number,
): Promise<PresignedUploadResult> {
  if (!UPLOAD_CONSTRAINTS.allowedTypes.includes(contentType as never)) {
    throw new Error(
      `허용되지 않는 파일 형식입니다. (${UPLOAD_CONSTRAINTS.allowedTypes.join(', ')})`,
    );
  }
  if (fileSize > UPLOAD_CONSTRAINTS.maxFileSize) {
    throw new Error('파일 크기는 10MB를 초과할 수 없습니다.');
  }

  // 확장자 화이트리스트 검증 (Path Traversal 방지)
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(
      `허용되지 않는 확장자입니다. (${[...ALLOWED_EXTENSIONS].join(', ')})`,
    );
  }

  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { uploadUrl, publicUrl } = await createPresignedUploadUrl(
    key,
    contentType,
    fileSize,
  );

  return { uploadUrl, key, publicUrl };
}
