/**
 * @jest-environment node
 *
 * P1-PAUSED-MATCH-JOB-CONSUMED: a CONTRACTOR_MATCHING job processed while the
 * go-live kill switch is off must NOT be persisted COMPLETED. getNextJob only
 * selects PENDING/RETRY, so a COMPLETED job is never matched after resume.
 *
 * Drives the REAL processJob / getNextJob / processor against an in-memory
 * backgroundJob table.
 */

type Row = Record<string, any>;
const rows: Row[] = [];

const mockPrisma = {
  backgroundJob: {
    findFirst: jest.fn(async ({ where }: { where: Row }) => {
      return (
        rows.find(
          (r) =>
            where.status.in.includes(r.status) &&
            r.scheduledFor <= where.scheduledFor.lte &&
            r.attemptCount < where.attemptCount.lt &&
            r.jobType !== 'HALL_ENQUIRY_HANDOFF'
        ) ?? null
      );
    }),
    update: jest.fn(async ({ where, data }: { where: Row; data: Row }) => {
      const r = rows.find((x) => x.id === where.id)!;
      for (const [k, v] of Object.entries(data)) {
        r[k] = v && typeof v === 'object' && 'increment' in v ? r[k] + v.increment : v;
      }
      return r;
    }),
    updateMany: jest.fn(async ({ where, data }: { where: Row; data: Row }) => {
      const hit = rows.filter((x) => Object.entries(where).every(([k, v]) => x[k] === v));
      for (const r of hit) Object.assign(r, data);
      return { count: hit.length };
    }),
  },
  $queryRawUnsafe: jest.fn(() => [{ maxAttempts: 3 }]),
  publicClaim: { findUnique: jest.fn(), update: jest.fn() },
  contractor: { findMany: jest.fn(), updateMany: jest.fn() },
  contractorMatch: { create: jest.fn() },
};
jest.mock('@/lib/prisma', () => ({
  get basePrisma() {
    return mockPrisma;
  },
}));
jest.mock('@/lib/claim-wizard/cert-requirements', () => ({ getRequiredCerts: () => [] }));
jest.mock('@/lib/services/dispatch-eligibility', () => ({
  isDispatchEligible: jest.fn(),
  filterDispatchEligible: jest.fn(async (ids: string[]) => new Set(ids)),
}));
jest.mock('@/lib/queue/processors/contractor-notification-processor', () => ({
  processContractorNotificationJob: jest.fn(),
}));

import { deferJob, getNextJob, markJobProcessing, processJob } from '@/lib/queue/background-jobs';

const ORIGINAL_FLAG = process.env.NRPG_CONTRACTOR_GO_LIVE;

beforeEach(() => {
  jest.clearAllMocks();
  rows.length = 0;
  rows.push({
    id: 'job_1',
    jobType: 'CONTRACTOR_MATCHING',
    status: 'PENDING',
    priority: 5,
    attemptCount: 0,
    maxAttempts: 3,
    scheduledFor: new Date(Date.now() - 1000),
    input: {
      claimId: 'claim_1',
      criteria: { serviceType: 'water', location: { state: 'QLD', suburb: 'Brisbane', postcode: '4000' }, urgency: 'urgent' },
    },
  });
  mockPrisma.publicClaim.findUnique.mockResolvedValue({
    id: 'claim_1', status: 'PENDING', priority: 'HIGH', tenantId: 't1', clientName: 'C',
    disasterType: 'WATER', postcode: '4000', requiredIICRCCerts: [],
  });
  mockPrisma.contractor.findMany.mockResolvedValue([]);
  mockPrisma.publicClaim.update.mockResolvedValue({});
});

afterAll(() => {
  if (ORIGINAL_FLAG === undefined) delete process.env.NRPG_CONTRACTOR_GO_LIVE;
  else process.env.NRPG_CONTRACTOR_GO_LIVE = ORIGINAL_FLAG;
});

describe('paused matching job is held, not consumed', () => {
  it('does not persist COMPLETED while go-live is off, and is picked up again once go-live is on', async () => {
    process.env.NRPG_CONTRACTOR_GO_LIVE = 'false';
    const result = await processJob(rows[0] as any);

    expect(rows[0].status).not.toBe('COMPLETED');
    expect(['PENDING', 'RETRY']).toContain(rows[0].status);
    expect(rows[0].attemptCount).toBe(0); // a pause must not burn attempts
    expect(result.status).not.toBe('COMPLETED');
    expect(mockPrisma.publicClaim.findUnique).not.toHaveBeenCalled();

    // Not re-picked while still paused (no hot spin inside the cron loop).
    expect(await getNextJob()).toBeNull();

    // Go-live resumes; the hold delay elapses.
    process.env.NRPG_CONTRACTOR_GO_LIVE = 'true';
    rows[0].scheduledFor = new Date(Date.now() - 1000);
    const next = await getNextJob();
    expect(next?.id).toBe('job_1');

    const resumed = await processJob(next as any);
    expect(resumed.status).toBe('COMPLETED');
    expect(mockPrisma.publicClaim.findUnique).toHaveBeenCalled();
  });

  it('an overlapping older claim cannot re-queue a job a newer claim is processing', async () => {
    // Two overlapping cron runs both selected job_1; each claim increments attemptCount.
    const older = await markJobProcessing('job_1');
    const newer = await markJobProcessing('job_1');
    expect([older, newer]).toEqual([1, 2]);

    expect(await deferJob('job_1', older)).toBe(false);
    expect(rows[0].status).toBe('PROCESSING'); // the newer run still owns it

    expect(await deferJob('job_1', newer)).toBe(true);
    expect(rows[0].status).toBe('PENDING');
    expect(rows[0].attemptCount).toBe(1);
  });
});
