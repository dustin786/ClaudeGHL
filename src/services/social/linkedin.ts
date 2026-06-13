import axios from 'axios';
import { config } from '../../config/config';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import { PlatformContent } from '../../types';

const LINKEDIN_API = 'https://api.linkedin.com/v2';

export async function postLinkedInVideo(
  videoUrl: string,
  content: PlatformContent
): Promise<string> {
  const { accessToken, personId } = config.platforms.linkedin;
  if (!accessToken || !personId) throw new Error('LinkedIn credentials not configured');

  const author = `urn:li:person:${personId}`;
  const text = [content.articleHook ?? content.caption, '', content.hashtags.join(' '), '', content.cta].join('\n');

  return withRetry(
    async () => {
      // Register upload
      const registerRes = await axios.post(
        `${LINKEDIN_API}/assets?action=registerUpload`,
        {
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
            owner: author,
            serviceRelationships: [
              {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent',
              },
            ],
          },
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const uploadUrl: string =
        registerRes.data.value.uploadMechanism[
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
        ].uploadUrl;
      const asset: string = registerRes.data.value.asset;

      // Upload video via URL (pull model - LinkedIn accepts URLs in some versions)
      // For production, download and re-upload as binary
      await axios.put(uploadUrl, videoUrl, {
        headers: { 'Content-Type': 'application/octet-stream' },
      });

      // Create post
      const postRes = await axios.post(
        `${LINKEDIN_API}/ugcPosts`,
        {
          author,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text },
              shareMediaCategory: 'VIDEO',
              media: [
                {
                  status: 'READY',
                  description: { text: content.caption.slice(0, 200) },
                  media: asset,
                  title: { text: (content.title ?? content.caption).slice(0, 70) },
                },
              ],
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const postId: string = postRes.headers['x-restli-id'];
      logger.info('LinkedIn post published', { postId });
      return postId;
    },
    { attempts: 3, baseDelayMs: 3000, label: 'LinkedIn video post' }
  );
}
