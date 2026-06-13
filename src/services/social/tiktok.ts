import axios from 'axios';
import { config } from '../../config/config';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import { PlatformContent } from '../../types';

export async function postTikTokVideo(
  videoUrl: string,
  content: PlatformContent
): Promise<string> {
  const { accessToken } = config.platforms.tiktok;
  if (!accessToken) throw new Error('TikTok credentials not configured');

  const title = content.caption.slice(0, 150) + ' ' + content.hashtags.join(' ');

  return withRetry(
    async () => {
      // TikTok Content Posting API v2
      const initRes = await axios.post(
        'https://open.tiktokapis.com/v2/post/publish/video/init/',
        {
          post_info: {
            title,
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: videoUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
          },
        }
      );

      const publishId: string = initRes.data.data?.publish_id;
      logger.info('TikTok video published', { publishId });
      return publishId;
    },
    { attempts: 3, baseDelayMs: 3000, label: 'TikTok video post' }
  );
}
