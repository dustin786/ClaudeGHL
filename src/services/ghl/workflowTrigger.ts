import { ghlPost } from './ghlClient';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';

export type WorkflowEvent = 'video.processed' | 'content.generated' | 'posts.scheduled';

export async function triggerWorkflow(
  event: WorkflowEvent,
  jobId: string,
  data: Record<string, unknown> = {}
): Promise<void> {
  const workflowIdMap: Record<WorkflowEvent, string | undefined> = {
    'video.processed': config.ghl.workflowIds.videoProcessed || undefined,
    'content.generated': undefined,
    'posts.scheduled': config.ghl.workflowIds.postsScheduled || undefined,
  };

  const workflowId = workflowIdMap[event];
  if (!workflowId) {
    logger.debug('No workflow configured for event, skipping', { event });
    return;
  }

  try {
    await ghlPost(`/workflows/${workflowId}/trigger`, {
      contactId: data.contactId,
      customData: { jobId, event, ...data },
    });
    logger.info('GHL workflow triggered', { event, workflowId, jobId });
  } catch (err) {
    logger.warn('Failed to trigger GHL workflow (non-fatal)', {
      event,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
