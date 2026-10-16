/**
 * @jest-environment node
 *
 * P1-BACKFILL-CHRONOLOGY-LOCKS-ASSESSMENT: migration 20261014010000 backfills
 * missing modules with a fixed createdAt of 2026-10-14 01:00. An onboarding
 * whose original rows were created later than that (any deploy after 01:00)
 * has its backfilled NRP-008 sorted BEFORE its NRP-001. Progression must follow
 * the canonical module number, never row chronology.
 */

import { NextRequest } from 'next/server';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }), { virtual: true });

jest.mock('@/lib/auth-middleware', () => ({
  authenticateRequest: jest.fn(),
  requireRole: (user: { userType?: string }, roles: string[]) => roles.includes(user?.userType as string),
  unauthorizedRoleResponse: jest.fn(),
}));

jest.mock('@/lib/get-tenant-db', () => ({ getTenantDb: jest.fn() }));

jest.mock('@/lib/training/nrp-training', () => ({
  ...jest.requireActual('@/lib/training/nrp-training'),
  getNrpgQuizModule: jest.fn(),
}));

import { POST } from '@/app/api/onboarding/assessment/route';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { getNrpgQuizModule } from '@/lib/training/nrp-training';

const QUIZ = {
  name: 'Module',
  description: 'd',
  questions: [
    { id: 'q1', type: 'mc', question: 'Q1', options: ['a', 'b'], reference: 'r', correct: 1, explanation: 'e' },
  ],
};

const BACKFILL_AT = new Date('2026-10-14T01:00:00Z');
const ORIGINAL_AT = new Date('2026-10-14T09:00:00Z'); // created after the fixed backfill timestamp

function row(n: number, createdAt: Date, status = 'NOT_STARTED') {
  const moduleId = `NRP-${String(n).padStart(3, '0')}`;
  return { id: `mp_${n}`, moduleId, status, progress: 0, startedAt: null, createdAt };
}

function makeDb(moduleProgress: ReturnType<typeof row>[]) {
  const tx = {
    contractorAssessment: { create: jest.fn().mockResolvedValue({ id: 'a1' }) },
    contractorModuleProgress: {
      update: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
    },
    contractorOnboarding: { update: jest.fn().mockResolvedValue({}) },
    contractorCertification: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn() },
  };
  const db = {
    contractorOnboarding: {
      findUnique: jest.fn().mockResolvedValue({ id: 'onb_1', contractorId: 'contractor_1', specialization: null, moduleProgress }),
    },
    contractorAssessment: { findMany: jest.fn().mockResolvedValue([]) },
    contractorModuleProgress: { update: jest.fn().mockResolvedValue({}) },
    $transaction: jest.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  };
  return db;
}

function submit(moduleId: string) {
  return POST(
    new NextRequest('http://localhost/api/onboarding/assessment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contractorId: 'contractor_1', moduleId, answers: { q1: 1 } }),
    })
  );
}

beforeEach(() => {
  (authenticateRequest as jest.Mock).mockResolvedValue({
    success: true,
    context: { user: { id: 'contractor_1', userType: 'CONTRACTOR' } },
  });
  (getNrpgQuizModule as jest.Mock).mockResolvedValue(QUIZ);
});

describe('assessment progression follows canonical module order, not createdAt', () => {
  // Original subset (NRP-001..007) created after the backfill timestamp;
  // backfilled NRP-008..024 carry the older fixed timestamp.
  const rows = () => [
    ...Array.from({ length: 7 }, (_, i) => row(i + 1, ORIGINAL_AT)),
    ...Array.from({ length: 17 }, (_, i) => row(i + 8, BACKFILL_AT)),
  ];

  it('accepts NRP-001 as current even though backfilled NRP-008 has an older createdAt', async () => {
    (getTenantDb as jest.Mock).mockReturnValue(makeDb(rows()));
    const res = await submit('NRP-001');
    expect(res.status).toBe(200);
  });

  it('still locks a later module (NRP-008) while NRP-001 is incomplete, and names NRP-001 as current', async () => {
    (getTenantDb as jest.Mock).mockReturnValue(makeDb(rows()));
    const res = await submit('NRP-008');
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(JSON.stringify(body)).toContain('NRP-001');
  });

  it('advances to the next module number after earlier ones complete', async () => {
    const list = rows().map((r) => (r.moduleId === 'NRP-001' ? { ...r, status: 'COMPLETED' } : r));
    (getTenantDb as jest.Mock).mockReturnValue(makeDb(list));
    expect((await submit('NRP-002')).status).toBe(200);
  });
});
