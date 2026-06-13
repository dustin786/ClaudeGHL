import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';
import uploadRouter from './routes/upload';
import jobsRouter from './routes/jobs';
import webhookRouter from './routes/webhook';
import generateRouter from './routes/generate';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('combined'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/health', healthRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/generate', generateRouter);
  app.use('/webhooks', webhookRouter);

  app.use(errorHandler);

  return app;
}
