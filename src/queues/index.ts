import { Queue, QueueOptions } from 'bullmq';
import { config } from '../config/config';
import { VideoJobPayload, ContentJobPayload, GHLJobPayload } from '../types';

const connection = { url: config.redis.url };

const defaultQueueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
};

export const videoQueue = new Queue<VideoJobPayload>('video-processing', defaultQueueOptions);
export const contentQueue = new Queue<ContentJobPayload>('ai-content', defaultQueueOptions);
export const ghlQueue = new Queue<GHLJobPayload>('ghl-submission', defaultQueueOptions);

export async function closeQueues(): Promise<void> {
  await Promise.all([videoQueue.close(), contentQueue.close(), ghlQueue.close()]);
}
