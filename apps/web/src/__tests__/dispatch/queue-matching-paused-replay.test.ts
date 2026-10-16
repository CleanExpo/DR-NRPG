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
      const hit = rows.filter((x) =>
        Object.entries(where).every(([k, v]) => (v && typeof v === 'object' && 'in' in v ? v.in.includes(x[k]) : x[k] === v))
      );
      for (const r of hit) {
        for (const [k, v] of Object.entries(data)) {
          r[k] = v && typeof v === 'object' && 'increment' in v ? r[k] + v.increment : v;
        }
      }
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

  it('only one of two overlapping runs can claim a selected job', async () => {
    // Two overlapping cron runs both selected job_1 at attemptCount 0.
    expect(await markJobProcessing('job_1', 0)).toBe(1);
    expect(await markJobProcessing('job_1', 0)).toBeNull(); // the second run gets nothing
    expect(rows[0]).toMatchObject({ status: 'PROCESSING', attemptCount: 1 });

    expect(await deferJob('job_1', 1, 0)).toBe(true);
    expect(rows[0]).toMatchObject({ status: 'PENDING', attemptCount: 0 }); // the pause burned no attempt
  });

  it('a stale claim never re-queues a job that another worker still holds', async () => {
    // CodeRabbit ordering on #267: workers A, B and C all selected job_1 at attemptCount 0.
    // B claims after A, defers, then C claims; A's defer must not return C's job to PENDING.
    const running = new Set<string>();
    const claim = async (w: string) => {
      const n = await markJobProcessing('job_1', 0);
      if (n !== null) running.add(w);
      return n;
    };
    const defer = async (w: string, n: number | null) => {
      if (n !== null && (await deferJob('job_1', n, 0))) running.delete(w);
    };
    const ownedWhileRunning = () => {
      expect(running.size).toBeLessThanOrEqual(1);
      if (running.size > 0) expect(rows[0].status).toBe('PROCESSING');
    };

    const a = await claim('A');
    const b = await claim('B');
    ownedWhileRunning();
    await defer('B', b);
    const c = await claim('C');
    ownedWhileRunning();
    await defer('A', a);
    ownedWhileRunning();
    await defer('C', c);
    expect(rows[0]).toMatchObject({ status: 'PENDING', attemptCount: 0 });
  });

  it('repeated overlapping paused runs never exhaust the attempt budget', async () => {
    // P1-PAUSED-OVERLAP-BURNS-ATTEMPTS: two cron runs select the same PENDING job and both
    // run processJob while go-live is off, three times over (maxAttempts is 3).
    process.env.NRPG_CONTRACTOR_GO_LIVE = 'false';
    for (let cycle = 0; cycle < 3; cycle++) {
      rows[0].scheduledFor = new Date(Date.now() - 1000);
      const a = { ...(await getNextJob()) } as any;
      const b = { ...(await getNextJob()) } as any;
      await Promise.all([processJob(a), processJob(b)]);
      expect(rows[0].status).toBe('PENDING');
      expect(rows[0].attemptCount).toBe(0);
    }

    process.env.NRPG_CONTRACTOR_GO_LIVE = 'true';
    rows[0].scheduledFor = new Date(Date.now() - 1000);
    const next = await getNextJob();
    expect(next?.id).toBe('job_1');
    expect((await processJob(next as any)).status).toBe('COMPLETED');
  });
});
