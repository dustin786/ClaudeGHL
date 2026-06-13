import { Worker, Job as BullJob } from 'bullmq';
import { config } from '../config/config';
import { uploadMediaToGHL, scheduleAllPlatforms } from '../services/ghl/socialPlanner';
import { createCampaignContact } from '../services/ghl/contactManager';
import { triggerWorkflow } from '../services/ghl/workflowTrigger';
import { updateJob, setJobStatus } from '../models/Job.model';
import { logger } from '../utils/logger';
import { GHLJobPayload } from '../types';

export function startGHLWorker(): Worker<GHLJobPayload> {
  const worker = new Worker<GHLJobPayload>(
    'ghl-submission',
    async (job: BullJob<GHLJobPayload>) => {
      const { jobId, content, processedVideoUrl, targetPlatforms } = job.data;
      logger.info('GHL worker picked up job', { jobId });

      setJobStatus(jobId, 'SUBMITTING_TO_GHL');

      let ghlMediaId: string;
      try {
        const media = await uploadMediaToGHL(processedVideoUrl, jobId);
        ghlMediaId = media.id;
      } catch (err) {
        logger.warn('GHL media upload failed, using video URL directly', { jobId });
        ghlMediaId = 'direct-url';
      }

      const postIds = await scheduleAllPlatforms(
        content,
        ghlMediaId,
        processedVideoUrl,
        targetPlatforms
      );

      const contactId = await createCampaignContact(jobId, content.contentCategory);

      await triggerWorkflow('posts.scheduled', jobId, {
        contactId,
        postIds,
        platforms: targetPlatforms,
        hook: content.selectedHook,
      });

      updateJob(jobId, { status: 'COMPLETED', ghlPostIds: postIds });

      logger.info('GHL submission complete', {
        jobId,
        scheduledPlatforms: Object.keys(postIds),
        contactId,
      });
    },
    {
      connection: { url: config.redis.url },
      concurrency: 3,
    }
  );

  worker.on('failed', (job, err) => {
    if (job) {
      logger.error('GHL worker job failed', { jobId: job.data.jobId, error: err.message });
      setJobStatus(job.data.jobId, 'FAILED', err.message);
    }
  });

  logger.info('GHL worker started');
  return worker;
}
