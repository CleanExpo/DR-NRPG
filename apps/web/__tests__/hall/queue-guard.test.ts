/** @jest-environment node */
jest.mock('../../lib/prisma', () => ({ basePrisma: { backgroundJob: { findUnique: jest.fn(), update: jest.fn() } } }));
import { basePrisma } from '../../lib/prisma';
import { processJob, retryJob } from '../../lib/queue/background-jobs';
test('held Hall job cannot process or be retried even if marked failed', async () => {
 for (const status of ['HELD', 'FAILED', 'PENDING']) {
  const job = { id: 'synthetic-job', jobType: 'HALL_ENQUIRY_HANDOFF', status, input: {}, attemptCount: 0, maxAttempts: 3 };
  (basePrisma.backgroundJob.findUnique as jest.Mock).mockResolvedValue(job);
  expect((await retryJob(job.id)).success).toBe(false);
  expect((await processJob(job as any)).success).toBe(false);
 }
 expect(basePrisma.backgroundJob.update).not.toHaveBeenCalled();
});
