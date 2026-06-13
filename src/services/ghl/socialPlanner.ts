import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import { config } from '../../config/config';
import { ghlPost, ghlGet } from './ghlClient';
import { logger } from '../../utils/logger';
import {
  ContentPackage,
  Platform,
  GHLMediaUploadResponse,
  GHLPostResponse,
} from '../../types';

const PLATFORM_POST_TYPE: Record<Platform, string> = {
  tiktok: 'video',
  instagram: 'reel',
  facebook: 'video',
  linkedin: 'video',
  youtube: 'video',
};

export async function uploadMediaToGHL(
  videoUrl: string,
  jobId: string
): Promise<GHLMediaUploadResponse> {
  const locationId = config.ghl.locationId;
  logger.info('Uploading media to GHL media library', { jobId, videoUrl });

  const payload = {
    name: `dustinai-video-${jobId}.mp4`,
    url: videoUrl,
    type: 'video/mp4',
  };

  const result = await ghlPost<GHLMediaUploadResponse>(
    `/medias/${locationId}/upload`,
    payload
  );

  logger.info('Media uploaded to GHL', { mediaId: result.id });
  return result;
}

export async function scheduleGHLPost(
  platform: Platform,
  content: ContentPackage,
  ghlMediaId: string,
  videoUrl: string
): Promise<GHLPostResponse> {
  const locationId = config.ghl.locationId;
  const platformContent = content.platforms[platform];
  const accountId = config.ghl.socialAccounts[platform];

  if (!accountId) {
    throw new Error(`No GHL social account configured for ${platform}`);
  }

  const fullCaption = [
    platformContent.caption,
    '',
    platformContent.hashtags.join(' '),
    '',
    platformContent.cta,
  ]
    .filter(Boolean)
    .join('\n');

  const payload: Record<string, unknown> = {
    type: PLATFORM_POST_TYPE[platform],
    status: 'scheduled',
    scheduledAt: platformContent.scheduledAt.toISOString(),
    summary: fullCaption,
    media: [{ id: ghlMediaId, type: 'video', url: videoUrl }],
    accountIds: [accountId],
    ogTags: {
      title: platformContent.title ?? platformContent.caption.slice(0, 70),
      description: platformContent.description ?? platformContent.caption,
    },
  };

  logger.info('Scheduling GHL social post', { platform, scheduledAt: platformContent.scheduledAt });
  const result = await ghlPost<GHLPostResponse>(
    `/social-media-posting/${locationId}/posts`,
    payload
  );

  logger.info('GHL post scheduled', { platform, postId: result.id });
  return result;
}

export async function scheduleAllPlatforms(
  content: ContentPackage,
  ghlMediaId: string,
  videoUrl: string,
  targetPlatforms: Platform[]
): Promise<Partial<Record<Platform, string>>> {
  const results: Partial<Record<Platform, string>> = {};

  for (const platform of targetPlatforms) {
    try {
      const result = await scheduleGHLPost(platform, content, ghlMediaId, videoUrl);
      results[platform] = result.id;
    } catch (err) {
      logger.error('Failed to schedule post for platform', {
        platform,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

export async function getConnectedAccounts(platform: string): Promise<unknown[]> {
  const locationId = config.ghl.locationId;
  const result = await ghlGet<{ accounts: unknown[] }>(
    `/social-media-posting/${locationId}/oauth/${platform}/accounts`
  );
  return result.accounts ?? [];
}
