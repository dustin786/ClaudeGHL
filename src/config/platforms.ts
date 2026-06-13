import { Platform } from '../types';

export interface PlatformSpec {
  maxHashtags: number;
  minHashtags: number;
  maxCaptionLength: number;
  optimalPostTimes: { hour: number; minute: number }[];
  timezone: string;
  tone: string;
  requiresTitle?: boolean;
  maxVideoDurationSeconds?: number;
  preferredAspectRatio?: string;
}

export const PLATFORM_SPECS: Record<Platform, PlatformSpec> = {
  tiktok: {
    maxHashtags: 5,
    minHashtags: 3,
    maxCaptionLength: 2200,
    optimalPostTimes: [
      { hour: 7, minute: 0 },
      { hour: 20, minute: 0 },
    ],
    timezone: 'America/New_York',
    tone: 'casual, fast-paced, relatable, hook-first, pattern-interrupt',
    maxVideoDurationSeconds: 600,
    preferredAspectRatio: '9:16',
  },
  instagram: {
    maxHashtags: 10,
    minHashtags: 5,
    maxCaptionLength: 2200,
    optimalPostTimes: [
      { hour: 11, minute: 0 },
      { hour: 19, minute: 0 },
    ],
    timezone: 'America/New_York',
    tone: 'aspirational, visual-first, motivational, educational',
    maxVideoDurationSeconds: 90,
    preferredAspectRatio: '9:16',
  },
  facebook: {
    maxHashtags: 5,
    minHashtags: 2,
    maxCaptionLength: 63206,
    optimalPostTimes: [
      { hour: 13, minute: 0 },
      { hour: 15, minute: 0 },
    ],
    timezone: 'America/New_York',
    tone: 'community-building, conversational, story-driven, shareable',
    maxVideoDurationSeconds: 240,
    preferredAspectRatio: '9:16',
  },
  linkedin: {
    maxHashtags: 5,
    minHashtags: 3,
    maxCaptionLength: 3000,
    optimalPostTimes: [
      { hour: 9, minute: 0 },
      { hour: 17, minute: 30 },
    ],
    timezone: 'America/New_York',
    tone: 'professional, insight-driven, authority-building, thought leadership',
    maxVideoDurationSeconds: 600,
    preferredAspectRatio: '16:9',
  },
  youtube: {
    maxHashtags: 10,
    minHashtags: 5,
    maxCaptionLength: 5000,
    optimalPostTimes: [{ hour: 14, minute: 0 }],
    timezone: 'America/New_York',
    tone: 'educational, structured, SEO-keyword-rich, value-dense',
    requiresTitle: true,
    maxVideoDurationSeconds: 3600,
    preferredAspectRatio: '9:16',
  },
};
