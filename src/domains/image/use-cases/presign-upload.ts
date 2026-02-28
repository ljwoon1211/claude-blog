import { createPresignedUploadUrl } from '../storage';
import { type PresignedUploadResult, UPLOAD_CONSTRAINTS } from '../types';

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

  const ext = filename.split('.').pop() ?? 'bin';
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { uploadUrl, publicUrl } = await createPresignedUploadUrl(
    key,
    contentType,
    fileSize,
  );

  return { uploadUrl, key, publicUrl };
}
