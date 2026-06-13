import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { apiKeyAuth } from '../middleware/auth';
import { generatePlatformContent } from '../services/ai/contentGenerator';
import { ALL_PLATFORMS, Platform } from '../types';
import { logger } from '../utils/logger';

const router = Router();

const GenerateBodySchema = z.object({
  topic: z.string().min(3).max(200),
  audience: z.string().min(3).max(200),
  niche: z.enum(['sales', 'leadership', 'ai_tools', 'finance', 'mindset', 'motivation']),
  customHook: z.string().max(300).optional(),
  brandNotes: z.string().max(500).optional(),
  targetPlatforms: z.array(z.enum(['tiktok', 'instagram', 'facebook', 'linkedin', 'youtube'])).optional(),
  videoDuration: z.number().min(5).max(3600).optional(),
  processedVideoUrl: z.string().url().optional(),
});

// Generate content without uploading a video (useful for text posts or testing)
router.post('/', apiKeyAuth, async (req: Request, res: Response) => {
  const parse = GenerateBodySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid request', details: parse.error.issues });
    return;
  }

  try {
    const data = parse.data;
    const content = await generatePlatformContent({
      jobId: `preview-${Date.now()}`,
      metadata: {
        topic: data.topic,
        audience: data.audience,
        niche: data.niche,
        customHook: data.customHook,
        brandNotes: data.brandNotes,
        targetPlatforms: (data.targetPlatforms as Platform[]) ?? (ALL_PLATFORMS as Platform[]),
      },
      processedVideoUrl: data.processedVideoUrl ?? '',
      videoDuration: data.videoDuration ?? 60,
    });

    res.json(content);
  } catch (err) {
    logger.error('Content generation failed', { error: err });
    res.status(500).json({ error: 'Content generation failed' });
  }
});

export default router;
