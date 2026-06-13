import { Job, JobStatus, UploadMetadata, ContentPackage, Platform } from '../types';

// In-memory store — replace with a DB (Postgres/Redis) for production
const jobs = new Map<string, Job>();

export function createJob(id: string, filePath: string, metadata: UploadMetadata): Job {
  const job: Job = {
    id,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    inputFilePath: filePath,
    metadata,
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, updates: Partial<Job>): Job {
  const job = jobs.get(id);
  if (!job) throw new Error(`Job not found: ${id}`);
  const updated = { ...job, ...updates, updatedAt: new Date() };
  jobs.set(id, updated);
  return updated;
}

export function setJobStatus(id: string, status: JobStatus, error?: string): void {
  updateJob(id, { status, ...(error ? { error } : {}) });
}

export function getAllJobs(): Job[] {
  return Array.from(jobs.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}
