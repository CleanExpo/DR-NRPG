/**
 * @jest-environment node
 *
 * DR-894 — Certificate-expiry sweep cron.
 *
 * Drives the REAL `runCertExpirySweep` service and the REAL
 * `app/api/cron/cert-expiry-sweep/route.ts` handler with prisma, the
 * dispatch-eligibility service, and the email queue mocked.
 *
 * What it proves:
 *   1. The cron route is gated on CRON_SECRET (401 without/with wrong secret,
 *      200 with the right Bearer secret) and never touches the DB when unauthorized.
 *   2. A newly-expired NRP cert triggers an eligibility recompute via the real
 *      dispatch-eligibility service surface, an audit row, and an at-expiry email.
 *   3. T-30 and T-7 windows queue the right renewal notices.
 *   4. A contractor who already RENEWED (newer live cert) is neither notified
 *      nor revoked off the stale expired row.
 */
import { NextRequest } from 'next/server';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }), { virtual: true });

jest.mock('@/lib/prisma', () => ({
  prisma: {
    contractorCertification: { findMany: jest.fn() },
    user: { findMany: jest.fn() },
    auditLog: { create: jest.fn() },
  },
}));

jest.mock('@/lib/services/dispatch-eligibility', () => ({
  filterDispatchEligible: jest.fn(),
  isDispatchEligible: jest.fn(),
}));

jest.mock('@/lib/email/email-queue', () => ({
  queueEmail: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { filterDispatchEligible } from '@/lib/services/dispatch-eligibility';
import { queueEmail } from '@/lib/email/email-queue';
import { runCertExpirySweep } from '@/lib/training/cert-expiry-sweep';
import { GET as cronGET } from '@/app/api/cron/cert-expiry-sweep/route';
import { NRPG_CERTIFICATION_NAME } from '@/lib/training/training-policy';

const mockCertFindMany = prisma.contractorCertification.findMany as jest.Mock;
const mockUserFindMany = prisma.user.findMany as jest.Mock;
const mockAuditCreate = prisma.auditLog.create as jest.Mock;
const mockFilterEligible = filterDispatchEligible as jest.Mock;
const mockQueueEmail = queueEmail as jest.Mock;

const NOW = new Date('2026-07-02T05:30:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;
const daysOut = (d: number) => new Date(NOW.getTime() + d * DAY_MS);

function cert(contractorId: string, expiryDate: Date) {
  return { contractorId, expiryDate };
}

/** First findMany call = horizon query; second = all-certs-for-ids query. */
function seedCerts(horizonCerts: ReturnType<typeof cert>[], allCerts?: ReturnType<typeof cert>[]) {
  mockCertFindMany.mockReset();
  mockCertFindMany
    .mockResolvedValueOnce(horizonCerts)
    .mockResolvedValueOnce(allCerts ?? horizonCerts);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCertFindMany.mockResolvedValue([]);
  mockUserFindMany.mockResolvedValue([]);
  mockAuditCreate.mockResolvedValue({ id: 'audit_1' });
  mockFilterEligible.mockResolvedValue(new Set());
  mockQueueEmail.mockResolvedValue({ success: true, queueId: 'q1' });
});

describe('GET /api/cron/cert-expiry-sweep — CRON_SECRET gate', () => {
  const OLD_SECRET = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = 'test-cron-secret';
  });

  afterAll(() => {
    if (OLD_SECRET === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = OLD_SECRET;
  });

  it('rejects a request with no secret and never touches the DB', async () => {
    const res = await cronGET(new NextRequest('http://localhost/api/cron/cert-expiry-sweep'));
    expect(res.status).toBe(401);
    expect(mockCertFindMany).not.toHaveBeenCalled();
  });

  it('rejects a wrong secret', async () => {
    const res = await cronGET(
      new NextRequest('http://localhost/api/cron/cert-expiry-sweep', {
        headers: { authorization: 'Bearer wrong-secret' },
      })
    );
    expect(res.status).toBe(401);
    expect(mockCertFindMany).not.toHaveBeenCalled();
  });

  it('accepts the configured secret and runs the sweep', async () => {
    const res = await cronGET(
      new NextRequest('http://localhost/api/cron/cert-expiry-sweep', {
        headers: { authorization: 'Bearer test-cron-secret' },
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.result).toBeDefined();
    expect(mockCertFindMany).toHaveBeenCalled();
  });
});

describe('runCertExpirySweep — expiry re-gates dispatch eligibility', () => {
  it('recomputes eligibility for a newly-expired cert, audits the revocation, and emails at-expiry', async () => {
    const expiredAt = daysOut(-0.25); // expired 6h ago -> inside the daily EXPIRED window
    seedCerts([cert('user_expired', expiredAt)]);
    mockUserFindMany.mockResolvedValue([{ id: 'user_expired', email: 'c@example.com', name: 'Casey' }]);
    mockFilterEligible.mockResolvedValue(new Set()); // real service: expired cert -> ineligible

    const result = await runCertExpirySweep(NOW);

    // Eligibility recomputed through the existing dispatch-eligibility service.
    expect(mockFilterEligible).toHaveBeenCalledWith(['user_expired']);
    expect(result.revoked).toEqual(['user_expired']);
    expect(result.anomaliesStillEligible).toEqual([]);

    // Audit row for the revocation.
    expect(mockAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'DISPATCH_ELIGIBILITY_REVOKED_CERT_EXPIRED',
          entityType: 'ContractorCertification',
          newValues: expect.objectContaining({
            contractorId: 'user_expired',
            dispatchEligibleAfterRecompute: false,
          }),
        }),
      })
    );

    // At-expiry notification through the existing email machinery.
    expect(mockQueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'c@example.com', subject: expect.stringMatching(/expired/i) })
    );
    expect(result.notices.EXPIRED).toBe(1);
  });

  it('flags (but does not hide) a contractor the eligibility service still reports eligible', async () => {
    seedCerts([cert('user_anomaly', daysOut(-0.5))]);
    mockUserFindMany.mockResolvedValue([{ id: 'user_anomaly', email: 'a@example.com', name: null }]);
    mockFilterEligible.mockResolvedValue(new Set(['user_anomaly']));

    const result = await runCertExpirySweep(NOW);

    expect(result.anomaliesStillEligible).toEqual(['user_anomaly']);
    expect(mockAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          newValues: expect.objectContaining({ dispatchEligibleAfterRecompute: true }),
        }),
      })
    );
  });

  it('queues a T-30 notice for a cert expiring in 30 days and a T-7 for one in 7 days', async () => {
    seedCerts([cert('user_t30', daysOut(29.5)), cert('user_t7', daysOut(6.5))]);
    mockUserFindMany.mockResolvedValue([
      { id: 'user_t30', email: 't30@example.com', name: 'Tia' },
      { id: 'user_t7', email: 't7@example.com', name: 'Sev' },
    ]);

    const result = await runCertExpirySweep(NOW);

    expect(result.notices).toMatchObject({ T30: 1, T7: 1, EXPIRED: 0 });
    expect(mockQueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 't30@example.com', subject: expect.stringContaining('30 days') })
    );
    expect(mockQueueEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 't7@example.com', subject: expect.stringContaining('7 days') })
    );
    // Nobody expired -> no revocations, no eligibility recompute needed.
    expect(result.revoked).toEqual([]);
    expect(mockFilterEligible).not.toHaveBeenCalled();
  });

  it('a 29-days-out cert gets NO notice and is NOT flipped (spec boundary)', async () => {
    seedCerts([cert('user_29', daysOut(29))]);

    const result = await runCertExpirySweep(NOW);

    expect(result.notices).toMatchObject({ T30: 0, T7: 0, EXPIRED: 0 });
    expect(mockQueueEmail).not.toHaveBeenCalled();
    expect(result.revoked).toEqual([]);
  });

  it('a renewed contractor (newer live cert) is neither notified nor revoked off the stale row', async () => {
    const staleExpired = cert('user_renewed', daysOut(-0.5));
    const freshCert = cert('user_renewed', daysOut(340));
    // Horizon query only sees the stale row; the all-certs query reveals the renewal.
    seedCerts([staleExpired], [staleExpired, freshCert]);

    const result = await runCertExpirySweep(NOW);

    expect(result.notices).toMatchObject({ T30: 0, T7: 0, EXPIRED: 0 });
    expect(result.revoked).toEqual([]);
    expect(mockQueueEmail).not.toHaveBeenCalled();
    expect(mockAuditCreate).not.toHaveBeenCalled();
  });

  it('scopes the horizon query to verified certs of the policy certification name', async () => {
    await runCertExpirySweep(NOW);

    expect(mockCertFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          certificationName: { in: [NRPG_CERTIFICATION_NAME, 'NRP Contractor Certification'] },
          verified: true,
        }),
      })
    );
  });

  it('counts an email failure without aborting the sweep', async () => {
    seedCerts([cert('user_t7', daysOut(6.5))]);
    mockUserFindMany.mockResolvedValue([{ id: 'user_t7', email: 't7@example.com', name: null }]);
    mockQueueEmail.mockResolvedValue({ success: false, error: 'smtp down' });

    const result = await runCertExpirySweep(NOW);

    expect(result.notices.T7).toBe(1);
    expect(result.emailsQueued).toBe(0);
    expect(result.emailFailures).toBe(1);
  });
});
