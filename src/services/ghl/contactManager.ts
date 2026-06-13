import { ghlPost } from './ghlClient';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';
import { ContactData } from '../../types';

interface GHLContactResponse {
  contact: { id: string };
}

export async function upsertContact(data: ContactData): Promise<string> {
  const locationId = config.ghl.locationId;

  const payload = {
    locationId,
    firstName: data.name?.split(' ')[0] ?? 'Social',
    lastName: data.name?.split(' ').slice(1).join(' ') ?? 'Follower',
    email: data.email,
    phone: data.phone,
    tags: data.tags ?? ['social-follower', 'dustinai'],
    source: data.source ?? 'social-media',
    customFields: data.customFields
      ? Object.entries(data.customFields).map(([key, value]) => ({ key, field_value: value }))
      : [],
  };

  const result = await ghlPost<GHLContactResponse>('/contacts/upsert', payload);
  const contactId = result.contact.id;
  logger.info('GHL contact upserted', { contactId });
  return contactId;
}

export async function createCampaignContact(jobId: string, topic: string): Promise<string> {
  return upsertContact({
    name: 'Campaign Tracker',
    tags: ['content-campaign', 'dustinai', topic],
    customFields: {
      last_campaign_job_id: jobId,
      last_campaign_topic: topic,
      content_source: 'dustinai-automation',
    },
    source: 'dustinai-workflow',
  });
}
