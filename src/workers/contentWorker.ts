import { Worker, Job as BullJob } from 'bullmq';
import { config } from '../config/config';
import { ghlQueue } from '../queues';
import { generatePlatformContent } from '../services/ai/contentGenerator';
import { updateJob, setJobStatus } from '../models/Job.model';
import { logger } from '../utils/logger';
import { ContentJobPayload, GHLJobPayload } from '../types';

export function startContentWorker(): Worker<ContentJobPayload> {
  const worker = new Worker<ContentJobPayload>(
    'ai-content',
    async (job: BullJob<ContentJobPayload>) => {
      const { jobId, metadata, processedVideoUrl, videoDuration } = job.data;
      logger.info('Content worker picked up job', { jobId });

      setJobStatus(jobId, 'PROCESSING_AI');

      const content = await generatePlatformContent({
        jobId,
        metadata,
        processedVideoUrl,
        videoDuration,
      });

      updateJob(jobId, { content });

      const ghlPayload: GHLJobPayload = {
        jobId,
        content,
        processedVideoUrl,
        targetPlatforms: metadata.targetPlatforms,
      };

      await ghlQueue.add('submit-to-ghl', ghlPayload);
      logger.info('Content generated, queued GHL submission', {
        jobId,
        hook: content.selectedHook,
        category: content.contentCategory,
      });
    },
    {
      connection: { url: config.redis.url },
      concurrency: 5,
    }
  );

  worker.on('failed', (job, err) => {
    if (job) {
      logger.error('Content worker job failed', { jobId: job.data.jobId, error: err.message });
      setJobStatus(job.data.jobId, 'FAILED', err.message);
    }
  });

  logger.info('Content worker started');
  return worker;
}
