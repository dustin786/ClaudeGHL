export type Platform = 'tiktok' | 'instagram' | 'facebook' | 'linkedin' | 'youtube';

export const ALL_PLATFORMS: Platform[] = ['tiktok', 'instagram', 'facebook', 'linkedin', 'youtube'];

// ─── Job ───────────────────────────────────────────────────────────────────

export type JobStatus =
  | 'PENDING'
  | 'PROCESSING_VIDEO'
  | 'PROCESSING_AI'
  | 'SUBMITTING_TO_GHL'
  | 'COMPLETED'
  | 'FAILED';

export interface Job {
  id: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  inputFilePath: string;
  processedVideoUrl?: string;
  content?: ContentPackage;
  ghlPostIds?: Partial<Record<Platform, string>>;
  error?: string;
  metadata: UploadMetadata;
}

// ─── Upload ─────────────────────────────────────────────────────────────────

export interface UploadMetadata {
  topic: string;
  audience: string;
  niche: string;
  customHook?: string;
  brandNotes?: string;
  targetPlatforms: Platform[];
}

// ─── Video ──────────────────────────────────────────────────────────────────

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  fps: number;
  fileSizeBytes: number;
}

export interface ProcessedVideo {
  outputPath: string;
  publicUrl: string;
  thumbnailUrl: string;
  metadata: VideoMetadata;
}

// ─── AI Content ─────────────────────────────────────────────────────────────

export interface PlatformContent {
  platform: Platform;
  caption: string;
  hashtags: string[];
  cta: string;
  title?: string;
  description?: string;
  thumbnailText?: string;
  articleHook?: string;
  altText?: string;
  scheduledAt: Date;
}

export interface ContentPackage {
  selectedHook: string;
  hookFormula: string;
  seoKeywords: string[];
  contentCategory: ContentCategory;
  platforms: Record<Platform, PlatformContent>;
  repurposeIdeas: string[];
}

export type ContentCategory = 'sales' | 'leadership' | 'ai_tools' | 'finance' | 'mindset' | 'motivation';

export interface ContentInput {
  jobId: string;
  metadata: UploadMetadata;
  processedVideoUrl: string;
  videoDuration: number;
}

// ─── GHL ────────────────────────────────────────────────────────────────────

export interface GHLSocialPost {
  platform: Platform;
  caption: string;
  mediaUrl: string;
  scheduledAt: Date;
  accountId: string;
}

export interface GHLMediaUploadResponse {
  id: string;
  url: string;
  name: string;
}

export interface GHLPostResponse {
  id: string;
  status: string;
  scheduledAt: string;
}

export interface ContactData {
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, string>;
  source?: string;
}

// ─── Queue Payloads ──────────────────────────────────────────────────────────

export interface VideoJobPayload {
  jobId: string;
  filePath: string;
  metadata: UploadMetadata;
}

export interface ContentJobPayload {
  jobId: string;
  metadata: UploadMetadata;
  processedVideoUrl: string;
  thumbnailUrl: string;
  videoDuration: number;
}

export interface GHLJobPayload {
  jobId: string;
  content: ContentPackage;
  processedVideoUrl: string;
  targetPlatforms: Platform[];
}

// ─── GHL Webhook ─────────────────────────────────────────────────────────────

export interface GHLWebhookEvent {
  type: string;
  locationId: string;
  data: Record<string, unknown>;
}

export interface GHLSocialPostPublishedEvent extends GHLWebhookEvent {
  type: 'social_post_published';
  data: {
    postId: string;
    platform: string;
    publishedAt: string;
    externalPostId: string;
  };
}
