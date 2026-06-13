import { Worker, Job as BullJob } from 'bullmq';
import { config } from '../config/config';
import { videoQueue, contentQueue } from '../queues';
import { probeVideo, processVideo, extractThumbnail } from '../services/video/videoProcessor';
import { uploadVideoAndThumbnail } from '../services/video/storageService';
import { updateJob, setJobStatus } from '../models/Job.model';
import { logger } from '../utils/logger';
import { VideoJobPayload, ContentJobPayload } from '../types';

export function startVideoWorker(): Worker<VideoJobPayload> {
  const worker = new Worker<VideoJobPayload>(
    'video-processing',
    async (job: BullJob<VideoJobPayload>) => {
      const { jobId, filePath, metadata } = job.data;
      logger.info('Video worker picked up job', { jobId });

      setJobStatus(jobId, 'PROCESSING_VIDEO');

      const probeData = await probeVideo(filePath);
      logger.debug('Video probed', { jobId, ...probeData });

      const processedPath = await processVideo(filePath, jobId);
      const thumbnailPath = await extractThumbnail(processedPath, jobId);

      const { videoUrl, thumbnailUrl } = await uploadVideoAndThumbnail(
        processedPath,
        thumbnailPath,
        jobId
      );

      updateJob(jobId, { processedVideoUrl: videoUrl });

      const contentPayload: ContentJobPayload = {
        jobId,
        metadata,
        processedVideoUrl: videoUrl,
        thumbnailUrl,
        videoDuration: probeData.duration,
      };

      await contentQueue.add('generate-content', contentPayload);
      logger.info('Video processed, queued content generation', { jobId, videoUrl });
    },
    {
      connection: { url: config.redis.url },
      concurrency: 2,
    }
  );

  worker.on('failed', (job, err) => {
    if (job) {
      logger.error('Video worker job failed', { jobId: job.data.jobId, error: err.message });
      setJobStatus(job.data.jobId, 'FAILED', err.message);
    }
  });

  logger.info('Video worker started');
  return worker;
}
