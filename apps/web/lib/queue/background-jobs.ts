// @ts-nocheck

/**
 * Background Job Queue Service
 *
 * Provides a Prisma-based job queue for long-running tasks like contractor matching.
 * Uses BackgroundJob model with priority queue, retry logic, and error tracking.
 *
 * Future: Can be migrated to BullMQ + Redis when scaling beyond 1000 jobs/day.
 */

import { basePrisma } from '@/lib/prisma';
import { BackgroundJob } from '@prisma/client';
import { processContractorMatchingJob as executeContractorMatching } from './processors/contractor-matching-processor';
import { processContractorNotificationJob as executeContractorNotification } from './processors/contractor-notification-processor';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type JobType =
  | 'CONTRACTOR_MATCHING'
  | 'CONTRACTOR_NOTIFICATION'
  | 'EMAIL_BATCH_SEND'
  | 'REPORT_GENERATION'
  | 'DATA_EXPORT';

export type JobStatus = 'HELD' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRY';

export interface CreateJobOptions {
  priority?: number; // 1 = critical, 5 = normal, 10 = low
  scheduledFor?: Date;
  maxAttempts?: number;
  claimId?: string;
  tenantId?: string;
  initiatedBy?: string;
}

export interface JobResult {
  success: boolean;
  jobId: string;
  status: JobStatus;
  output?: Record<string, unknown>;
  error?: string;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  retry: number;
  avgProcessingTimeMs: number;
  oldestPendingJob?: Date;
}

// ============================================================================
// Configuration
// ============================================================================

const JOB_CONFIG = {
  defaultMaxAttempts: 3,
  defaultPriority: 5,
  retryDelayMs: {
    1: 60000, // 1 minute
    2: 300000, // 5 minutes
    3: 900000, // 15 minutes
  },
  processingTimeout: 300000, // 5 minutes
};

// ============================================================================
// Job Creation
// ============================================================================

/**
 * Create a new background job
 */
export async function createJob(
  jobType: JobType,
  input: Record<string, unknown>,
  options: CreateJobOptions = {}
): Promise<JobResult> {
  try {
    const {
      priority = JOB_CONFIG.defaultPriority,
      scheduledFor = new Date(),
      maxAttempts = JOB_CONFIG.defaultMaxAttempts,
      claimId,
      tenantId,
      initiatedBy,
    } = options;

    const job = await basePrisma.backgroundJob.create({
      data: {
        jobType,
        status: 'PENDING',
        priority,
        input,
        scheduledFor,
        maxAttempts,
        claimId,
        tenantId,
        initiatedBy,
      },
    });

    console.log(`[Job Queue] Created job ${job.id} (${jobType}, priority: ${priority})`);

    return {
      success: true,
      jobId: job.id,
      status: 'PENDING' as JobStatus,
    };
  } catch (error) {
    console.error('[Job Queue] Failed to create job:', error);
    return {
      success: false,
      jobId: '',
      status: 'FAILED' as JobStatus,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Job Processing
// ============================================================================

/**
 * Get the next job to process (highest priority, oldest first)
 */
export async function getNextJob(): Promise<BackgroundJob | null> {
  const now = new Date();

  // Find jobs that are:
  // 1. PENDING or RETRY status
  // 2. Scheduled for now or earlier
  // 3. Not exceeded max attempts
  // Order by priority (ascending = highest priority first), then by creation date

  const job = await basePrisma.backgroundJob.findFirst({
    where: {
      // Unsupported Hall delivery must never occupy an eligible worker slot.
      jobType: { not: 'HALL_ENQUIRY_HANDOFF' },
      status: { in: ['PENDING', 'RETRY'] },
      scheduledFor: { lte: now },
      attemptCount: { lt: basePrisma.$queryRawUnsafe<{ maxAttempts: number }[]>('SELECT "maxAttempts" FROM "background_jobs"')[0]?.maxAttempts || 3 },
    },
    orderBy: [
      { priority: 'asc' }, // Lower number = higher priority
      { createdAt: 'asc' }, // Older jobs first
    ],
  });

  return job;
}

/**
 * Mark job as processing
 */
export async function markJobProcessing(jobId: string): Promise<void> {
  await basePrisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'PROCESSING',
      startedAt: new Date(),
      attemptCount: { increment: 1 },
    },
  });

  console.log(`[Job Queue] Processing job ${jobId}`);
}

/**
 * Complete a job successfully
 */
export async function completeJob(
  jobId: string,
  output: Record<string, unknown>
): Promise<void> {
  await basePrisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'COMPLETED',
      output,
      completedAt: new Date(),
      lastError: null,
      errorStack: null,
    },
  });

  console.log(`[Job Queue] Completed job ${jobId}`);
}

/**
 * Fail a job with retry logic
 */
export async function failJob(
  jobId: string,
  error: Error,
  currentAttempt: number,
  maxAttempts: number
): Promise<void> {
  const shouldRetry = currentAttempt < maxAttempts;
  const nextRetryAt = shouldRetry
    ? new Date(Date.now() + (JOB_CONFIG.retryDelayMs[currentAttempt as keyof typeof JOB_CONFIG.retryDelayMs] || 900000))
    : null;

  await basePrisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: shouldRetry ? 'RETRY' : 'FAILED',
      lastError: error.message,
      errorStack: error.stack || null,
      nextRetryAt,
    },
  });

  if (shouldRetry) {
    console.log(`[Job Queue] Job ${jobId} failed (attempt ${currentAttempt}/${maxAttempts}), will retry at ${nextRetryAt?.toISOString()}`);
  } else {
    console.error(`[Job Queue] Job ${jobId} permanently failed after ${currentAttempt} attempts:`, error.message);
  }
}

/**
 * Process a single job
 */
export async function processJob(job: BackgroundJob): Promise<JobResult> {
  const { id, jobType, input, attemptCount, maxAttempts } = job;

  if (jobType === 'HALL_ENQUIRY_HANDOFF' || job.status === 'HELD') {
    return { success: false, jobId: id, status: job.status as JobStatus, error: 'Hall delivery is held pending reviewed receiver activation' };
  }

  try {
    await markJobProcessing(id);

    // Execute the job based on type
    let output: Record<string, unknown>;

    switch (jobType) {
      case 'CONTRACTOR_MATCHING':
        output = await processContractorMatchingJob(input);
        break;

      case 'CONTRACTOR_NOTIFICATION':
        output = await processContractorNotificationJob(input);
        break;

      case 'EMAIL_BATCH_SEND':
        output = await processEmailBatchJob(input);
        break;

      case 'REPORT_GENERATION':
        output = await processReportGenerationJob(input);
        break;

      case 'DATA_EXPORT':
        output = await processDataExportJob(input);
        break;

      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }

    await completeJob(id, output);

    return {
      success: true,
      jobId: id,
      status: 'COMPLETED',
      output,
    };
  } catch (error) {
    await failJob(id, error as Error, attemptCount + 1, maxAttempts);

    return {
      success: false,
      jobId: id,
      status: attemptCount + 1 < maxAttempts ? 'RETRY' : 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Job Type Processors (Placeholders - to be implemented)
// ============================================================================

async function processContractorMatchingJob(input: any): Promise<Record<string, unknown>> {
  return executeContractorMatching(input);
}

async function processContractorNotificationJob(input: any): Promise<Record<string, unknown>> {
  return executeContractorNotification(input);
}

async function processEmailBatchJob(input: any): Promise<Record<string, unknown>> {
  // TODO: Implement email batch sending
  throw new Error('Email batch processor not yet implemented');
}

async function processReportGenerationJob(input: any): Promise<Record<string, unknown>> {
  // TODO: Implement report generation
  throw new Error('Report generation processor not yet implemented');
}

async function processDataExportJob(input: any): Promise<Record<string, unknown>> {
  // TODO: Implement data export
  throw new Error('Data export processor not yet implemented');
}

// ============================================================================
// Job Monitoring
// ============================================================================

/**
 * Get job status by ID
 */
export async function getJobStatus(jobId: string): Promise<BackgroundJob | null> {
  return basePrisma.backgroundJob.findUnique({
    where: { id: jobId },
  });
}

/**
 * Get queue statistics
 */
export async function getQueueStats(tenantId?: string): Promise<QueueStats> {
  const where = tenantId ? { tenantId } : {};

  const [pending, processing, completed, failed, retry, jobs] = await Promise.all([
    basePrisma.backgroundJob.count({ where: { ...where, status: 'PENDING' } }),
    basePrisma.backgroundJob.count({ where: { ...where, status: 'PROCESSING' } }),
    basePrisma.backgroundJob.count({ where: { ...where, status: 'COMPLETED' } }),
    basePrisma.backgroundJob.count({ where: { ...where, status: 'FAILED' } }),
    basePrisma.backgroundJob.count({ where: { ...where, status: 'RETRY' } }),
    basePrisma.backgroundJob.findMany({
      where: { ...where, status: 'COMPLETED', startedAt: { not: null }, completedAt: { not: null } },
      select: { startedAt: true, completedAt: true },
      take: 100,
    }),
  ]);

  // Calculate average processing time
  const processingTimes = jobs
    .filter((j) => j.startedAt && j.completedAt)
    .map((j) => j.completedAt!.getTime() - j.startedAt!.getTime());

  const avgProcessingTimeMs =
    processingTimes.length > 0
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      : 0;

  // Get oldest pending job
  const oldestPending = await basePrisma.backgroundJob.findFirst({
    where: { ...where, status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
  });

  return {
    pending,
    processing,
    completed,
    failed,
    retry,
    avgProcessingTimeMs,
    oldestPendingJob: oldestPending?.createdAt,
  };
}

/**
 * Get failed jobs for manual intervention
 */
export async function getFailedJobs(options?: {
  limit?: number;
  offset?: number;
  tenantId?: string;
}): Promise<BackgroundJob[]> {
  const { limit = 20, offset = 0, tenantId } = options || {};

  return basePrisma.backgroundJob.findMany({
    where: {
      status: 'FAILED',
      ...(tenantId ? { tenantId } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Retry a failed job
 */
export async function retryJob(jobId: string): Promise<JobResult> {
  const job = await basePrisma.backgroundJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    return {
      success: false,
      jobId,
      status: 'FAILED',
      error: 'Job not found',
    };
  }

  if (job.jobType === 'HALL_ENQUIRY_HANDOFF') {
    return { success: false, jobId, status: job.status as JobStatus, error: 'Hall delivery cannot enter the generic retry queue' };
  }

  if (job.status !== 'FAILED') {
    return {
      success: false,
      jobId,
      status: job.status as JobStatus,
      error: 'Job is not in FAILED status',
    };
  }

  // Reset job to PENDING
  await basePrisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'PENDING',
      attemptCount: 0,
      scheduledFor: new Date(),
      lastError: null,
      errorStack: null,
      nextRetryAt: null,
    },
  });

  console.log(`[Job Queue] Manually retrying job ${jobId}`);

  return {
    success: true,
    jobId,
    status: 'PENDING',
  };
}

/**
 * Clean up old completed jobs (run this periodically)
 */
export async function cleanupOldJobs(daysToKeep: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.setDate(-daysToKeep));

  const result = await basePrisma.backgroundJob.deleteMany({
    where: {
      status: 'COMPLETED',
      completedAt: { lt: cutoffDate },
    },
  });

  console.log(`[Job Queue] Cleaned up ${result.count} old completed jobs`);

  return result.count;
}

// ============================================================================
// Exports
// ============================================================================

export { JobType, JobStatus, CreateJobOptions, JobResult, QueueStats };
