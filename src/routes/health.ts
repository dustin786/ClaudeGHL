import { Router } from 'express';
import { videoQueue, contentQueue, ghlQueue } from '../queues';

const router = Router();

router.get('/', async (_req, res) => {
  const [videoCounts, contentCounts, ghlCounts] = await Promise.all([
    videoQueue.getJobCounts(),
    contentQueue.getJobCounts(),
    ghlQueue.getJobCounts(),
  ]).catch(() => [{}, {}, {}]);

  res.json({
    status: 'ok',
    service: 'DustinAI Social Media Automation',
    queues: {
      videoProcessing: videoCounts,
      aiContent: contentCounts,
      ghlSubmission: ghlCounts,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
