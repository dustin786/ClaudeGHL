import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  if (!config.apiKey) {
    next();
    return;
  }

  const key = req.headers['x-api-key'] ?? req.query['api_key'];
  if (key !== config.apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
