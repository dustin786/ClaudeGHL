import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { updateJob } from '../models/Job.model';
import { GHLWebhookEvent, GHLSocialPostPublishedEvent } from '../types';

const router = Router();

function verifyGHLSignature(req: Request): boolean {
  if (!config.ghl.webhookSecret) return true;
  const signature = req.headers['x-ghl-signature'] as string;
  if (!signature) return false;
  const expected = crypto
    .createHmac('sha256', config.ghl.webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

router.post('/ghl', (req: Request, res: Response) => {
  if (!verifyGHLSignature(req)) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  const event = req.body as GHLWebhookEvent;
  logger.info('GHL webhook received', { type: event.type, locationId: event.locationId });

  switch (event.type) {
    case 'social_post_published': {
      const e = event as GHLSocialPostPublishedEvent;
      logger.info('Social post published', {
        postId: e.data.postId,
        platform: e.data.platform,
        externalPostId: e.data.externalPostId,
      });
      break;
    }
    case 'contact_created': {
      logger.info('New GHL contact', { contactId: event.data.contactId });
      break;
    }
    default:
      logger.debug('Unhandled GHL webhook type', { type: event.type });
  }

  res.json({ received: true });
});

export default router;
