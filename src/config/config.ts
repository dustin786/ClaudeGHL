import dotenv from 'dotenv';
import path from 'path';
import { Platform } from '../types';

dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const config = {
  port: parseInt(optional('PORT', '3000')),
  nodeEnv: optional('NODE_ENV', 'development'),
  apiKey: optional('API_KEY', ''),

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  anthropic: {
    apiKey: optional('ANTHROPIC_API_KEY'),
    model: 'claude-sonnet-4-6',
  },

  ghl: {
    apiKey: optional('GHL_API_KEY'),
    locationId: optional('GHL_LOCATION_ID'),
    webhookSecret: optional('GHL_WEBHOOK_SECRET'),
    baseUrl: 'https://services.leadconnectorhq.com',
    apiVersion: '2021-07-28',
    socialAccounts: {
      tiktok: optional('GHL_SOCIAL_ACCOUNT_TIKTOK'),
      instagram: optional('GHL_SOCIAL_ACCOUNT_INSTAGRAM'),
      facebook: optional('GHL_SOCIAL_ACCOUNT_FACEBOOK'),
      linkedin: optional('GHL_SOCIAL_ACCOUNT_LINKEDIN'),
      youtube: optional('GHL_SOCIAL_ACCOUNT_YOUTUBE'),
    } as Record<Platform, string>,
    workflowIds: {
      videoProcessed: optional('GHL_WORKFLOW_ID_VIDEO_PROCESSED'),
      postsScheduled: optional('GHL_WORKFLOW_ID_POSTS_SCHEDULED'),
    },
  },

  aws: {
    accessKeyId: optional('AWS_ACCESS_KEY_ID'),
    secretAccessKey: optional('AWS_SECRET_ACCESS_KEY'),
    region: optional('AWS_REGION', 'us-east-1'),
    s3Bucket: optional('S3_BUCKET_NAME', 'dustinai-videos'),
  },

  storage: {
    useS3: !!process.env.AWS_ACCESS_KEY_ID,
    localUploadPath: optional('LOCAL_UPLOAD_PATH', '/tmp/uploads'),
    localProcessedPath: optional('LOCAL_PROCESSED_PATH', '/tmp/processed'),
  },

  brand: {
    name: 'DustinAI',
    signatureClipPath: path.resolve(optional('SIGNATURE_CLIP_PATH', './assets/signature_ending.mp4')),
    watermarkPath: path.resolve(optional('WATERMARK_PATH', './assets/dustinai_logo.png')),
  },

  platforms: {
    meta: {
      appId: optional('META_APP_ID'),
      appSecret: optional('META_APP_SECRET'),
      accessToken: optional('META_ACCESS_TOKEN'),
      pageId: optional('META_PAGE_ID'),
      instagramAccountId: optional('META_INSTAGRAM_ACCOUNT_ID'),
    },
    tiktok: {
      clientKey: optional('TIKTOK_CLIENT_KEY'),
      clientSecret: optional('TIKTOK_CLIENT_SECRET'),
      accessToken: optional('TIKTOK_ACCESS_TOKEN'),
    },
    linkedin: {
      clientId: optional('LINKEDIN_CLIENT_ID'),
      clientSecret: optional('LINKEDIN_CLIENT_SECRET'),
      accessToken: optional('LINKEDIN_ACCESS_TOKEN'),
      personId: optional('LINKEDIN_PERSON_ID'),
    },
    youtube: {
      clientId: optional('YOUTUBE_CLIENT_ID'),
      clientSecret: optional('YOUTUBE_CLIENT_SECRET'),
      refreshToken: optional('YOUTUBE_REFRESH_TOKEN'),
      channelId: optional('YOUTUBE_CHANNEL_ID'),
    },
  },
};
