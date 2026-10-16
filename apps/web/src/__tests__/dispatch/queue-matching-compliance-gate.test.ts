/**
 * @jest-environment node
 *
 * DR-900 on the queued path (review P1-ROTATION-BYPASSES-DR900-GATE): a
 * CONTRACTOR_MATCHING job must not offer work to a contractor whose ABN is
 * cancelled or whose background check has expired.
 *
 * Drives the REAL processor and the REAL filterDispatchEligible against an
 * in-memory contractor table. The eligibility query is answered by applying the
 * two DR-900 predicates it sends (abnCancelledAt, backgroundCheckExpiresAt) to
 * that table, so the test fails if either predicate or the gate call is lost.
 */

type Row = { id: string; userId: string; abnCancelledAt: Date | null; backgroundCheckExpiresAt: Date | null };

const DAY = 24 * 60 * 60 * 1000;
const table: Row[] = [];

function passesDr900(where: any, r: Row): boolean {
  if ('abnCancelledAt' in where && where.abnCancelledAt === null && r.abnCancelledAt !== null) return false;
  if (Array.isArray(where.OR)) {
    const ok = where.OR.some((clause: any) => {
      const bg = clause.backgroundCheckExpiresAt;
      if (bg === null) return r.backgroundCheckExpiresAt === null;
      if (bg && bg.gt) return r.backgroundCheckExpiresAt !== null && r.backgroundCheckExpiresAt > bg.gt;
      return false;
    });
    if (!ok) return false;
  }
  return true;
}

const mockDb = {
  publicClaim: { findUnique: jest.fn(), update: jest.fn() },
  contractor: {
    findMany: jest.fn(async ({ where }: { where: any }) => {
      if (where?.userId?.in) {
        // filterDispatchEligible's contractor query
        return table.filter((r) => where.userId.in.includes(r.userId) && passesDr900(where, r)).map((r) => ({ userId: r.userId }));
      }
      // the processor's candidate query: every contractor, in rotation order
      return table.map((r) => ({
        id: r.id,
        businessName: `${r.id} Restorations`,
        user: { id: r.userId, name: `${r.id} Owner`, email: `${r.id}@example.com` },
        iicrcCertifications: [],
        updatedAt: new Date('2026-10-01T00:00:00Z'),
      }));
    }),
    updateMany: jest.fn(),
  },
  contractorMatch: { create: jest.fn() },
  contractorAgreementAcceptance: {
    findMany: jest.fn(async ({ where }: { where: any }) => where.contractorId.in.map((id: string) => ({ contractorId: id }))),
  },
  contractorCertification: {
    findMany: jest.fn(async ({ where }: { where: any }) => where.contractorId.in.map((id: string) => ({ contractorId: id }))),
  },
};
jest.mock('@/lib/prisma', () => ({
  get prisma() {
    return mockDb;
  },
  get basePrisma() {
    return mockDb;
  },
}));

const mockCreateJob = jest.fn();
jest.mock('@/lib/queue/background-jobs', () => ({
  createJob: (...args: unknown[]) => mockCreateJob(...args),
}));
jest.mock('@/lib/claim-wizard/cert-requirements', () => ({ getRequiredCerts: () => [] }));

import { processContractorMatchingJob } from '@/lib/queue/processors/contractor-matching-processor';

const input = {
  claimId: 'claim_1',
  criteria: { serviceType: 'water', location: { state: 'QLD', suburb: 'Brisbane', postcode: '4000' }, urgency: 'urgent' },
};

const ORIGINAL_FLAG = process.env.NRPG_CONTRACTOR_GO_LIVE;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NRPG_CONTRACTOR_GO_LIVE = 'true';
  table.length = 0;
  const now = Date.now();
  table.push(
    { id: 'c_ok', userId: 'u_ok', abnCancelledAt: null, backgroundCheckExpiresAt: new Date(now + 30 * DAY) },
    { id: 'c_abn', userId: 'u_abn', abnCancelledAt: new Date(now - DAY), backgroundCheckExpiresAt: null },
    { id: 'c_bg', userId: 'u_bg', abnCancelledAt: null, backgroundCheckExpiresAt: new Date(now - DAY) },
  );
  mockDb.publicClaim.findUnique.mockResolvedValue({
    id: 'claim_1', status: 'PENDING', priority: 'HIGH', tenantId: 'tenant_1', clientName: 'Client',
    disasterType: 'WATER', postcode: '4000', requiredIICRCCerts: [],
  });
  mockDb.contractorMatch.create.mockImplementation(async ({ data }) => ({ id: `cm_${data.contractorId}`, ...data }));
  mockDb.contractor.updateMany.mockResolvedValue({ count: 1 });
  mockDb.publicClaim.update.mockResolvedValue({});
  mockCreateJob.mockResolvedValue({ id: 'job_1' });
});

afterAll(() => {
  if (ORIGINAL_FLAG === undefined) delete process.env.NRPG_CONTRACTOR_GO_LIVE;
  else process.env.NRPG_CONTRACTOR_GO_LIVE = ORIGINAL_FLAG;
});

describe('DR-900 compliance gate on the queued matching path', () => {
  it('offers the job only to the compliant contractor, never to a cancelled ABN or an expired background check', async () => {
    const out = await processContractorMatchingJob(input);

    const matched = mockDb.contractorMatch.create.mock.calls.map(([arg]) => arg.data.contractorId);
    expect(matched).toEqual(['c_ok']);
    expect(out.matchedContractorCount).toBe(1);
    const notified = JSON.stringify(mockCreateJob.mock.calls);
    expect(notified).not.toContain('c_abn');
    expect(notified).not.toContain('c_bg');
  });
});
