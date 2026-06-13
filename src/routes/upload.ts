import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { uploadMiddleware } from '../middleware/multerUpload';
import { apiKeyAuth } from '../middleware/auth';
import { videoQueue } from '../queues';
import { createJob } from '../models/Job.model';
import { logger } from '../utils/logger';
import { ALL_PLATFORMS, Platform } from '../types';

const router = Router();

const UploadBodySchema = z.object({
  topic: z.string().min(3).max(200),
  audience: z.string().min(3).max(200),
  niche: z.enum(['sales', 'leadership', 'ai_tools', 'finance', 'mindset', 'motivation']),
  customHook: z.string().max(300).optional(),
  brandNotes: z.string().max(500).optional(),
  targetPlatforms: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return ALL_PLATFORMS as Platform[];
      return val.split(',').map((p) => p.trim()) as Platform[];
    }),
});

router.post(
  '/',
  apiKeyAuth,
  (req: Request, res: Response, next: NextFunction) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No video file uploaded. Use field name: video' });
        return;
      }

      const bodyParse = UploadBodySchema.safeParse(req.body);
      if (!bodyParse.success) {
        res.status(400).json({ error: 'Invalid request body', details: bodyParse.error.issues });
        return;
      }

      const jobId = uuidv4();
      const metadata = bodyParse.data;
      const filePath = req.file.path;

      createJob(jobId, filePath, {
        topic: metadata.topic,
        audience: metadata.audience,
        niche: metadata.niche,
        customHook: metadata.customHook,
        brandNotes: metadata.brandNotes,
        targetPlatforms: metadata.targetPlatforms as Platform[],
      });

      await videoQueue.add('process-video', {
        jobId,
        filePath,
        metadata: {
          topic: metadata.topic,
          audience: metadata.audience,
          niche: metadata.niche,
          customHook: metadata.customHook,
          brandNotes: metadata.brandNotes,
          targetPlatforms: metadata.targetPlatforms as Platform[],
        },
      });

      logger.info('Upload received, job queued', { jobId, filePath, topic: metadata.topic });

      res.status(202).json({
        jobId,
        status: 'PENDING',
        message: 'Video queued for processing. Poll /api/jobs/:jobId for status.',
      });
    } catch (err) {
      logger.error('Upload handler error', { error: err });
      res.status(500).json({ error: 'Failed to queue job' });
    }
  }
);

export default router;
