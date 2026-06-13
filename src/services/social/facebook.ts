import axios from 'axios';
import { config } from '../../config/config';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import { PlatformContent } from '../../types';

const META_GRAPH_URL = 'https://graph.facebook.com/v19.0';

export async function postFacebookVideo(
  videoUrl: string,
  content: PlatformContent
): Promise<string> {
  const { pageId, accessToken } = config.platforms.meta;
  if (!pageId || !accessToken) throw new Error('Facebook credentials not configured');

  const description = [content.caption, '', content.hashtags.join(' '), '', content.cta].join('\n');

  return withRetry(
    async () => {
      const res = await axios.post(`${META_GRAPH_URL}/${pageId}/videos`, {
        file_url: videoUrl,
        description,
        access_token: accessToken,
      });
      const postId: string = res.data.id;
      logger.info('Facebook video posted', { postId });
      return postId;
    },
    { attempts: 3, baseDelayMs: 3000, label: 'Facebook video post' }
  );
}
