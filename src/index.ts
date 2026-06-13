import { createApp } from './app';
import { startAllWorkers } from './workers';
import { closeQueues } from './queues';
import { config } from './config/config';
import { logger } from './utils/logger';

const app = createApp();
const workers = startAllWorkers();

const server = app.listen(config.port, () => {
  logger.info('DustinAI Social Media Automation server started', {
    port: config.port,
    env: config.nodeEnv,
  });
});

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await Promise.all(workers.map((w) => w.close()));
    await closeQueues();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});
