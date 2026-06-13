import axios from 'axios';
import { config } from '../../config/config';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import { PlatformContent } from '../../types';

const META_GRAPH_URL = 'https://graph.facebook.com/v19.0';

export async function postInstagramReel(
  videoUrl: string,
  content: PlatformContent
): Promise<string> {
  const { instagramAccountId, accessToken } = config.platforms.meta;
  if (!instagramAccountId || !accessToken) {
    throw new Error('Instagram credentials not configured');
  }

  const caption = [content.caption, '', content.hashtags.join(' '), '', content.cta].join('\n');

  return withRetry(
    async () => {
      // Step 1: Create media container
      const containerRes = await axios.post(
        `${META_GRAPH_URL}/${instagramAccountId}/reels`,
        {
          video_url: videoUrl,
          caption,
          access_token: accessToken,
        }
      );
      const containerId: string = containerRes.data.id;
      logger.info('Instagram reel container created', { containerId });

      // Step 2: Poll for container to be ready
      await waitForInstagramContainer(containerId, accessToken);

      // Step 3: Publish
      const publishRes = await axios.post(
        `${META_GRAPH_URL}/${instagramAccountId}/media_publish`,
        { creation_id: containerId, access_token: accessToken }
      );

      const postId: string = publishRes.data.id;
      logger.info('Instagram reel published', { postId });
      return postId;
    },
    { attempts: 3, baseDelayMs: 5000, label: 'Instagram reel post' }
  );
}

async function waitForInstagramContainer(
  containerId: string,
  accessToken: string,
  maxAttempts = 12
): Promise<void> {
  const { sleep } = await import('../../utils/retry');
  for (let i = 0; i < maxAttempts; i++) {
    const res = await axios.get(`${META_GRAPH_URL}/${containerId}`, {
      params: { fields: 'status_code', access_token: accessToken },
    });
    if (res.data.status_code === 'FINISHED') return;
    if (res.data.status_code === 'ERROR') throw new Error('Instagram container processing failed');
    await sleep(10000);
  }
  throw new Error('Instagram container timed out');
}
