import { Platform, PlatformContent } from '../../types';
import { postInstagramReel } from './instagram';
import { postFacebookVideo } from './facebook';
import { postTikTokVideo } from './tiktok';
import { postLinkedInVideo } from './linkedin';
import { postYouTubeVideo } from './youtube';
import { logger } from '../../utils/logger';

export async function postToPlatform(
  platform: Platform,
  videoUrl: string,
  content: PlatformContent
): Promise<string> {
  switch (platform) {
    case 'instagram':
      return postInstagramReel(videoUrl, content);
    case 'facebook':
      return postFacebookVideo(videoUrl, content);
    case 'tiktok':
      return postTikTokVideo(videoUrl, content);
    case 'linkedin':
      return postLinkedInVideo(videoUrl, content);
    case 'youtube':
      return postYouTubeVideo(videoUrl, content);
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}

export async function postToAllPlatforms(
  videoUrl: string,
  platformContents: Partial<Record<Platform, PlatformContent>>
): Promise<Partial<Record<Platform, string>>> {
  const results: Partial<Record<Platform, string>> = {};

  for (const [platform, content] of Object.entries(platformContents)) {
    try {
      const postId = await postToPlatform(platform as Platform, videoUrl, content!);
      results[platform as Platform] = postId;
    } catch (err) {
      logger.error('Direct platform post failed', {
        platform,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
