import { startVideoWorker } from './videoWorker';
import { startContentWorker } from './contentWorker';
import { startGHLWorker } from './ghlWorker';
import { logger } from '../utils/logger';

export function startAllWorkers() {
  const workers = [
    startVideoWorker(),
    startContentWorker(),
    startGHLWorker(),
  ];

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing workers');
    await Promise.all(workers.map((w) => w.close()));
    process.exit(0);
  });

  logger.info('All workers started', { count: workers.length });
  return workers;
}
