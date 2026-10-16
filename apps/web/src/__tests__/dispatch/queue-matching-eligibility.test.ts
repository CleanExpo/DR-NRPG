/**
 * @jest-environment node
 *
 * B4 — the CONTRACTOR_MATCHING queue processor (public claim submit, lead
 * capture) must use the same canonical dispatch gate as claim intake, and the
 * go-live kill switch must stop it before any query.
 *
 * Proves, against the REAL processor:
 *   1. filterDispatchEligible is consulted with every candidate's User.id, and
 *      an ineligible candidate gets no ContractorMatch row;
 *   2. with NRPG_CONTRACTOR_GO_LIVE=false nothing is read or written.
 */

const mockPrisma = {
  publicClaim: { findUnique: jest.fn(), update: jest.fn() },
  contractor: { findMany: jest.fn(), updateMany: jest.fn() },
  contractorMatch: { create: jest.fn() },
};
jest.mock('@/lib/prisma', () => ({
  get basePrisma() {
    return mockPrisma;
  },
}));

const mockCreateJob = jest.fn();
jest.mock('@/lib/queue/background-jobs', () => ({
  createJob: (...args: unknown[]) => mockCreateJob(...args),
}));

jest.mock('@/lib/claim-wizard/cert-requirements', () => ({
  getRequiredCerts: () => [],
}));

const mockFilterDispatchEligible = jest.fn();
jest.mock('@/lib/services/dispatch-eligibility', () => ({
  isDispatchEligible: jest.fn(),
  filterDispatchEligible: (...args: unknown[]) => mockFilterDispatchEligible(...args),
}));

import { processContractorMatchingJob } from '@/lib/queue/processors/contractor-matching-processor';

function candidate(id: string, userId: string) {
  return {
    id,
    businessName: `${id} Restorations`,
    user: { id: userId, name: `${id} Owner`, email: `${id}@example.com` },
    iicrcCertifications: [],
    updatedAt: new Date('2026-10-01T00:00:00Z'),
  };
}

const input = {
  claimId: 'claim_1',
  criteria: {
    serviceType: 'water',
    location: { state: 'QLD', suburb: 'Brisbane', postcode: '4000' },
    urgency: 'urgent',
  },
};

const ORIGINAL_FLAG = process.env.NRPG_CONTRACTOR_GO_LIVE;

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.NRPG_CONTRACTOR_GO_LIVE;
  mockPrisma.publicClaim.findUnique.mockResolvedValue({
    id: 'claim_1',
    status: 'PENDING',
    priority: 'HIGH',
    tenantId: 'tenant_1',
    clientName: 'Client',
    disasterType: 'WATER',
    postcode: '4000',
    requiredIICRCCerts: [],
  });
  mockPrisma.contractorMatch.create.mockImplementation(async ({ data }) => ({ id: `cm_${data.contractorId}`, ...data }));
  mockPrisma.contractor.updateMany.mockResolvedValue({ count: 1 });
  mockPrisma.publicClaim.update.mockResolvedValue({});
  mockCreateJob.mockResolvedValue({ id: 'job_1' });
});

afterAll(() => {
  if (ORIGINAL_FLAG === undefined) delete process.env.NRPG_CONTRACTOR_GO_LIVE;
  else process.env.NRPG_CONTRACTOR_GO_LIVE = ORIGINAL_FLAG;
});

describe('B4 — queue matching uses the canonical dispatch gate', () => {
  it('drops a candidate that fails filterDispatchEligible and matches only the eligible one', async () => {
    mockPrisma.contractor.findMany.mockResolvedValue([
      candidate('c_ok', 'user_ok'),
      candidate('c_blocked', 'user_blocked'),
    ]);
    mockFilterDispatchEligible.mockResolvedValue(new Set(['user_ok']));

    const out = await processContractorMatchingJob(input);

    expect(mockFilterDispatchEligible).toHaveBeenCalledWith(['user_ok', 'user_blocked']);
    const matched = mockPrisma.contractorMatch.create.mock.calls.map(([arg]) => arg.data.contractorId);
    expect(matched).toEqual(['c_ok']);
    expect(out.matchedContractorCount).toBe(1);
  });

  it('matches no one when the go-live kill switch is off, without touching the database', async () => {
    process.env.NRPG_CONTRACTOR_GO_LIVE = 'false';

    const out = await processContractorMatchingJob(input);

    expect(out.matchedContractorCount).toBe(0);
    expect(mockPrisma.publicClaim.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.contractor.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.contractorMatch.create).not.toHaveBeenCalled();
    expect(mockCreateJob).not.toHaveBeenCalled();
  });
});
