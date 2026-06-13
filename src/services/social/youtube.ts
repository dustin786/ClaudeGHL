import { google } from 'googleapis';
import { config } from '../../config/config';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import { PlatformContent } from '../../types';
import https from 'https';
import { Readable } from 'stream';

function getOAuth2Client() {
  const { clientId, clientSecret, refreshToken } = config.platforms.youtube;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('YouTube credentials not configured');
  }
  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

function urlToStream(url: string): Promise<Readable> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => resolve(res)).on('error', reject);
  });
}

export async function postYouTubeVideo(
  videoUrl: string,
  content: PlatformContent
): Promise<string> {
  const auth = getOAuth2Client();
  const youtube = google.youtube({ version: 'v3', auth });

  const description = [
    content.description ?? content.caption,
    '',
    content.cta,
    '',
    content.hashtags.join(' '),
    '',
    'Connect with DustinAI: sales, leadership & AI automation coaching',
  ].join('\n');

  return withRetry(
    async () => {
      const videoStream = await urlToStream(videoUrl);

      const res = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: content.title ?? content.caption.slice(0, 70),
            description,
            tags: content.hashtags.map((h) => h.replace('#', '')),
            categoryId: '22', // People & Blogs
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          mimeType: 'video/mp4',
          body: videoStream,
        },
      });

      const videoId = res.data.id ?? '';
      logger.info('YouTube video uploaded', { videoId });
      return videoId;
    },
    { attempts: 2, baseDelayMs: 5000, label: 'YouTube video upload' }
  );
}
