/**
 * @jest-environment node
 *
 * B2 — onboarding start must seed ALL 24 canonical modules. The certificate is
 * issued only when every one of NRP-001..NRP-024 is passed (set equality,
 * DR-893), and the assessment rejects a module with no progress row, so a
 * short seed made the certificate unreachable through the real UI.
 */

import { NextRequest } from 'next/server';
import { NRPG_CANONICAL_MODULE_IDS } from '@/lib/training/training-policy';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }), { virtual: true });

const mockTx = {
  contractorOnboarding: { upsert: jest.fn() },
  contractorModuleProgress: { count: jest.fn(), createMany: jest.fn() },
  contractor: { upsert: jest.fn() },
};
const mockDb = {
  contractorOnboarding: { findUnique: jest.fn() },
  $transaction: jest.fn(async (fn: (tx: typeof mockTx) => unknown) => fn(mockTx)),
};
jest.mock('@/lib/get-tenant-db', () => ({
  getTenantDb: () => mockDb,
}));

jest.mock('@/lib/auth-middleware', () => ({
  authenticateRequest: jest.fn(async () => ({
    success: true,
    context: { user: { id: 'user_1', userType: 'CONTRACTOR', role: 'CONTRACTOR' }, tenantId: 'tenant_1' },
  })),
  requireRole: () => true,
  unauthorizedRoleResponse: jest.fn(),
}));

const mockIndexModules = NRPG_CANONICAL_MODULE_IDS.map((id) => ({ moduleId: id, title: `${id}: Title` }));
jest.mock('@/lib/training/nrp-training', () => ({
  loadNrpgTrainingIndex: jest.fn(async () => ({ modules: mockIndexModules })),
  parseNrpgModuleNumber: (id: string) => {
    const m = id.match(/^NRP-(\d{3})$/i);
    return m ? Number(m[1]) : null;
  },
}));

import { POST } from '@/app/api/onboarding/start/route';

function startRequest(specialization: string) {
  return new NextRequest('http://localhost/api/onboarding/start', {
    method: 'POST',
    body: JSON.stringify({ contractorId: 'user_1', businessName: 'Acme Restorations', specialization, experience: 5 }),
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.contractorOnboarding.findUnique.mockResolvedValue(null);
  mockTx.contractorOnboarding.upsert.mockResolvedValue({ id: 'onb_1', status: 'IN_PROGRESS' });
  mockTx.contractorModuleProgress.count.mockResolvedValue(0);
  mockTx.contractorModuleProgress.createMany.mockResolvedValue({ count: 24 });
  mockTx.contractor.upsert.mockResolvedValue({});
});

describe('B2 — onboarding start seeds every canonical module', () => {
  it.each(['water', 'fire', 'mould', 'combined'])('seeds exactly NRP-001..NRP-024 for %s', async (specialization) => {
    const res = await POST(startRequest(specialization));

    expect(res.status).toBe(201);
    expect(mockTx.contractorModuleProgress.createMany).toHaveBeenCalledTimes(1);
    const seeded = mockTx.contractorModuleProgress.createMany.mock.calls[0][0].data.map(
      (row: { moduleId: string }) => row.moduleId
    );
    expect(seeded).toEqual([...NRPG_CANONICAL_MODULE_IDS]);
  });

  it('refuses to start when the index is missing a canonical module', async () => {
    mockIndexModules.splice(5, 1);
    try {
      const res = await POST(startRequest('water'));
      expect(res.status).toBe(500);
      expect(mockTx.contractorModuleProgress.createMany).not.toHaveBeenCalled();
    } finally {
      mockIndexModules.splice(5, 0, { moduleId: NRPG_CANONICAL_MODULE_IDS[5], title: 'restored' });
    }
  });
});
