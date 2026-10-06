/** @jest-environment node */
jest.mock('../../lib/prisma', () => ({ basePrisma: { $queryRawUnsafe: jest.fn(() => []), backgroundJob: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() } } }));
import { basePrisma } from '../../lib/prisma';
import { getNextJob, processJob, retryJob } from '../../lib/queue/background-jobs';
test('held Hall job cannot process or be retried even if marked failed', async () => {
 for (const status of ['HELD', 'FAILED', 'PENDING']) {
  const job = { id: 'synthetic-job', jobType: 'HALL_ENQUIRY_HANDOFF', status, input: {}, attemptCount: 0, maxAttempts: 3 };
  (basePrisma.backgroundJob.findUnique as jest.Mock).mockResolvedValue(job);
  expect((await retryJob(job.id)).success).toBe(false);
  expect((await processJob(job as any)).success).toBe(false);
 }
 expect(basePrisma.backgroundJob.update).not.toHaveBeenCalled();
});

test('dequeue excludes Hall before selecting eligible normal work', async () => {
 (basePrisma.backgroundJob.findFirst as jest.Mock).mockResolvedValue({ id: 'normal-job' });
 await getNextJob(); await getNextJob();
 expect(basePrisma.backgroundJob.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ jobType: { not: 'HALL_ENQUIRY_HANDOFF' }, status: { in: ['PENDING', 'RETRY'] } }) }));
});
