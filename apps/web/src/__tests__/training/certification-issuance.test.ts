/**
 * @jest-environment node
 *
 * DR-893 — 24-module set-equality + auto-issued certification.
 *
 * Drives the REAL `app/api/onboarding/assessment/route.ts` handler with auth,
 * the tenant DB, and the quiz-bank loader mocked (grading and completion logic
 * stay REAL via jest.requireActual).
 *
 * What it proves:
 *   1. Completion is SET-EQUALITY against NRP-001..NRP-024 — 24 completed rows
 *      containing a duplicate id do NOT complete training or issue a cert.
 *   2. 23/24 canonical modules do not complete training.
 *   3. On genuine completion (all 24 canonical modules COMPLETED server-side),
 *      a ContractorCertification is auto-issued in the same transaction with
 *      verified=true, an issue date, and expiry = issue + configured validity.
 *   4. Issuance is idempotent — an existing live cert means no duplicate row.
 */
import { NextRequest } from 'next/server';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }), { virtual: true });

jest.mock('@/lib/auth-middleware', () => {
  const { NextResponse: MockNextResponse } = jest.requireActual('next/server');
  return {
    authenticateRequest: jest.fn(),
    requireRole: (user: { userType?: string }, roles: string[]) =>
      roles.includes(user?.userType as string),
    unauthorizedRoleResponse: (roles: string[]) =>
      MockNextResponse.json(
        { error: 'FORBIDDEN', message: `Access denied. Required roles: ${roles.join(', ')}` },
        { status: 403 }
      ),
  };
});

jest.mock('@/lib/get-tenant-db', () => ({
  getTenantDb: jest.fn(),
}));

// Grading + set-equality stay REAL — only the quiz-bank file loader is mocked.
jest.mock('@/lib/training/nrp-training', () => ({
  ...jest.requireActual('@/lib/training/nrp-training'),
  getNrpgQuizModule: jest.fn(),
}));

import { POST as assessmentPOST } from '@/app/api/onboarding/assessment/route';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { getNrpgQuizModule } from '@/lib/training/nrp-training';
import {
  NRPG_CANONICAL_MODULE_IDS,
  NRPG_CERTIFICATION_NAME,
  getNrpgCertificationExpiryDate,
} from '@/lib/training/training-policy';

const mockAuth = authenticateRequest as jest.Mock;
const mockGetTenantDb = getTenantDb as jest.Mock;
const mockGetModule = getNrpgQuizModule as jest.Mock;

const QUIZ_MODULE = {
  name: 'Module 24 — Members Gatherings',
  description: 'Networking',
  questions: [
    { id: 'q1', type: 'mc', question: 'Q1', options: ['a', 'b'], correct: 0, explanation: 'e1' },
    { id: 'q2', type: 'mc', question: 'Q2', options: ['a', 'b'], correct: 1, explanation: 'e2' },
  ],
};
const ALL_CORRECT = { q1: 0, q2: 1 };

const CONTRACTOR = { id: 'contractor_1', userType: 'CONTRACTOR' };

function assessmentReq(body: unknown) {
  return new NextRequest('http://localhost/api/onboarding/assessment', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Tenant-DB mock. `refreshedModules` is what the post-update completion check
 * reads back: the FULL set of module-progress rows (moduleId + status).
 */
function makeDb(opts: {
  refreshedModules: Array<{ moduleId: string; status: string }>;
  existingCert?: { id: string } | null;
}) {
  const moduleProgress = {
    id: 'mp_24',
    moduleId: 'NRP-024',
    status: 'IN_PROGRESS',
    progress: 10,
    startedAt: new Date('2026-06-01T00:00:00Z'),
    createdAt: new Date('2026-06-01T00:00:00Z'),
  };
  const onboarding = {
    id: 'onb_1',
    contractorId: 'contractor_1',
    specialization: 'water',
    moduleProgress: [moduleProgress],
  };

  const tx = {
    contractorAssessment: { create: jest.fn().mockResolvedValue({ id: 'assessment_1' }) },
    contractorModuleProgress: {
      update: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue(opts.refreshedModules),
    },
    contractorOnboarding: { update: jest.fn().mockResolvedValue({}) },
    contractorCertification: {
      findFirst: jest.fn().mockResolvedValue(opts.existingCert ?? null),
      create: jest.fn().mockResolvedValue({ id: 'cert_1' }),
    },
    // Advisory lock serializing issuance per contractor (no unique key in schema).
    $queryRaw: jest.fn().mockResolvedValue([]),
  };

  const db = {
    contractorOnboarding: { findUnique: jest.fn().mockResolvedValue(onboarding) },
    // DR-894: the route reads prior attempts for the retake policy; none here.
    contractorAssessment: { findMany: jest.fn().mockResolvedValue([]) },
    $transaction: jest.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  };

  return { db, tx };
}

const completed = (moduleId: string) => ({ moduleId, status: 'COMPLETED' });

beforeEach(() => {
  mockAuth.mockReset();
  mockGetModule.mockReset();
  mockGetTenantDb.mockReset();
  mockGetModule.mockResolvedValue(QUIZ_MODULE);
  mockAuth.mockResolvedValue({ success: true, context: { user: CONTRACTOR } });
});

async function submitPassingNrp024() {
  return assessmentPOST(
    assessmentReq({ contractorId: 'contractor_1', moduleId: 'NRP-024', answers: ALL_CORRECT })
  );
}

describe('POST /api/onboarding/assessment — 24-module set-equality (DR-893)', () => {
  it('does NOT complete training for 24 completed rows containing a duplicate id', async () => {
    // 23 unique canonical ids + a duplicated NRP-012 => 24 rows, all COMPLETED.
    const rows = [
      ...NRPG_CANONICAL_MODULE_IDS.filter((id) => id !== 'NRP-024').map(completed),
      completed('NRP-012'),
    ];
    expect(rows).toHaveLength(24); // a count>=24 check would be fooled

    const { db, tx } = makeDb({ refreshedModules: rows });
    mockGetTenantDb.mockReturnValue(db);

    const res = await submitPassingNrp024();
    expect(res.status).toBe(200);

    expect(tx.contractorOnboarding.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'IN_PROGRESS' } })
    );
    expect(tx.contractorCertification.create).not.toHaveBeenCalled();
  });

  it('does NOT complete training at 23/24 canonical modules', async () => {
    const rows = NRPG_CANONICAL_MODULE_IDS.slice(0, 23).map(completed);

    const { db, tx } = makeDb({ refreshedModules: rows });
    mockGetTenantDb.mockReturnValue(db);

    const res = await submitPassingNrp024();
    expect(res.status).toBe(200);

    expect(tx.contractorOnboarding.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'IN_PROGRESS' } })
    );
    expect(tx.contractorCertification.create).not.toHaveBeenCalled();
  });

  it('does NOT complete a short-seeded onboarding even when every seeded row is COMPLETED', async () => {
    // The 5/5-complete onboarding from the seeding path — spec: trainingComplete=false.
    const rows = ['NRP-002', 'NRP-006', 'NRP-009', 'NRP-012', 'NRP-024'].map(completed);

    const { db, tx } = makeDb({ refreshedModules: rows });
    mockGetTenantDb.mockReturnValue(db);

    const res = await submitPassingNrp024();
    expect(res.status).toBe(200);

    expect(tx.contractorOnboarding.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'IN_PROGRESS' } })
    );
    expect(tx.contractorCertification.create).not.toHaveBeenCalled();
  });

  it('a non-COMPLETED canonical row blocks completion even with 24 rows present', async () => {
    const rows = NRPG_CANONICAL_MODULE_IDS.map((id) =>
      id === 'NRP-013' ? { moduleId: id, status: 'FAILED' } : completed(id)
    );

    const { db, tx } = makeDb({ refreshedModules: rows });
    mockGetTenantDb.mockReturnValue(db);

    await submitPassingNrp024();

    expect(tx.contractorOnboarding.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'IN_PROGRESS' } })
    );
    expect(tx.contractorCertification.create).not.toHaveBeenCalled();
  });
});

describe('POST /api/onboarding/assessment — auto-issued certification (DR-893)', () => {
  it('completes training and auto-issues a verified, dated cert with config-derived expiry', async () => {
    const rows = NRPG_CANONICAL_MODULE_IDS.map(completed);
    const { db, tx } = makeDb({ refreshedModules: rows });
    mockGetTenantDb.mockReturnValue(db);

    const res = await submitPassingNrp024();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.passed).toBe(true);

    expect(tx.contractorOnboarding.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'COMPLETED' }),
      })
    );

    expect(tx.contractorCertification.create).toHaveBeenCalledTimes(1);
    const created = tx.contractorCertification.create.mock.calls[0][0].data;
    expect(created).toMatchObject({
      contractorId: 'contractor_1',
      certificationName: NRPG_CERTIFICATION_NAME,
      verified: true,
    });
    expect(created.issueDate).toBeInstanceOf(Date);
    expect(created.expiryDate).toBeInstanceOf(Date);
    // Expiry comes from the single policy source: issue + validity, exactly.
    expect(created.expiryDate.getTime()).toBe(
      getNrpgCertificationExpiryDate(created.issueDate).getTime()
    );
  });

  it('is idempotent: an existing live cert means no duplicate issuance', async () => {
    const rows = NRPG_CANONICAL_MODULE_IDS.map(completed);
    const { db, tx } = makeDb({ refreshedModules: rows, existingCert: { id: 'cert_live' } });
    mockGetTenantDb.mockReturnValue(db);

    const res = await submitPassingNrp024();
    expect(res.status).toBe(200);

    // Training still completes...
    expect(tx.contractorOnboarding.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'COMPLETED' }),
      })
    );
    // ...but no second certification row is created.
    expect(tx.contractorCertification.create).not.toHaveBeenCalled();
    // And the duplicate check is scoped to a LIVE (unexpired) VERIFIED cert of
    // this name — a legacy verified:false row must not block re-issuance.
    expect(tx.contractorCertification.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          contractorId: 'contractor_1',
          certificationName: { in: [NRPG_CERTIFICATION_NAME, 'NRP Contractor Certification'] },
          expiryDate: expect.objectContaining({ gt: expect.any(Date) }),
          verified: true,
        }),
      })
    );
  });

  it('serializes issuance with a per-contractor advisory lock BEFORE the duplicate check', async () => {
    const rows = NRPG_CANONICAL_MODULE_IDS.map(completed);
    const { db, tx } = makeDb({ refreshedModules: rows });
    mockGetTenantDb.mockReturnValue(db);

    const res = await submitPassingNrp024();
    expect(res.status).toBe(200);

    // The lock is taken inside the transaction (findFirst -> create has no
    // unique-key backstop in the schema, so the lock IS the race protection)...
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    const lockSql = (tx.$queryRaw.mock.calls[0][0] as TemplateStringsArray).join('?');
    expect(lockSql).toContain('pg_advisory_xact_lock');
    expect(tx.$queryRaw.mock.calls[0][1]).toBe('cert:contractor_1');
    // ...and strictly before the duplicate-check read.
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      tx.contractorCertification.findFirst.mock.invocationCallOrder[0]
    );
  });
});
