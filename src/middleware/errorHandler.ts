import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });

  const status = (err as { status?: number }).status ?? 500;
  res.status(status).json({
    error: err.message ?? 'Internal server error',
  });
}
