import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';

const s3 = config.aws.accessKeyId
  ? new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    })
  : null;

export async function uploadToStorage(
  filePath: string,
  key: string,
  contentType = 'video/mp4'
): Promise<string> {
  if (s3) {
    const body = fs.createReadStream(filePath);
    await s3.send(
      new PutObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    const url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
    logger.info('Uploaded to S3', { key, url });
    return url;
  }

  // Local fallback — return a file:// URL (only useful in dev)
  logger.warn('S3 not configured, using local file path as URL', { filePath });
  return `file://${path.resolve(filePath)}`;
}

export async function uploadVideoAndThumbnail(
  videoPath: string,
  thumbPath: string,
  jobId: string
): Promise<{ videoUrl: string; thumbnailUrl: string }> {
  const [videoUrl, thumbnailUrl] = await Promise.all([
    uploadToStorage(videoPath, `videos/${jobId}/processed.mp4`, 'video/mp4'),
    uploadToStorage(thumbPath, `videos/${jobId}/thumbnail.jpg`, 'image/jpeg'),
  ]);
  return { videoUrl, thumbnailUrl };
}
