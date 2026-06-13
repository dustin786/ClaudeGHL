import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config/config';
import { logger } from '../../utils/logger';
import { withRetry, sleep } from '../../utils/retry';

export function createGHLClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: config.ghl.baseUrl,
    headers: {
      Authorization: `Bearer ${config.ghl.apiKey}`,
      Version: config.ghl.apiVersion,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const status = error.response?.status;
      if (status === 429) {
        const retryAfter = Number(error.response?.headers['retry-after'] ?? 5);
        logger.warn('GHL rate limited, waiting', { retryAfter });
        await sleep(retryAfter * 1000);
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const ghlClient = createGHLClient();

export async function ghlPost<T = unknown>(endpoint: string, data: unknown): Promise<T> {
  return withRetry(
    async () => {
      const res = await ghlClient.post<T>(endpoint, data);
      return res.data;
    },
    { attempts: 3, baseDelayMs: 2000, label: `GHL POST ${endpoint}` }
  );
}

export async function ghlGet<T = unknown>(endpoint: string): Promise<T> {
  return withRetry(
    async () => {
      const res = await ghlClient.get<T>(endpoint);
      return res.data;
    },
    { attempts: 3, baseDelayMs: 2000, label: `GHL GET ${endpoint}` }
  );
}
