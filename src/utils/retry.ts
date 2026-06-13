import { logger } from './logger';

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; baseDelayMs?: number; label?: string } = {}
): Promise<T> {
  const { attempts = 3, baseDelayMs = 1000, label = 'operation' } = options;

  let lastError: Error = new Error('Unknown error');
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === attempts) break;

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      logger.warn(`${label} failed (attempt ${attempt}/${attempts}), retrying in ${delay}ms`, {
        error: lastError.message,
      });
      await sleep(delay);
    }
  }
  throw lastError;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
