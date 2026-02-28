import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function getBucketName(): string {
  return process.env.R2_BUCKET_NAME!;
}

export function getPublicUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Presigned PUT URL을 생성한다.
 * 클라이언트가 이 URL로 직접 R2에 파일을 업로드한다.
 */
export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  maxSize: number,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ContentType: contentType,
    ContentLength: maxSize,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 }); // 10분
  const publicUrl = getPublicUrl(key);

  return { uploadUrl, publicUrl };
}

/**
 * R2에서 객체를 삭제한다.
 */
export async function deleteObject(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    }),
  );
}
