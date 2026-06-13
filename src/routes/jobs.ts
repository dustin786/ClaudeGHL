import { Router } from 'express';
import { getJob, getAllJobs } from '../models/Job.model';

const router = Router();

router.get('/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
});

router.get('/', (_req, res) => {
  res.json(getAllJobs().slice(0, 50));
});

export default router;
