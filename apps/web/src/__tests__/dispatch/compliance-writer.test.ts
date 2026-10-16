/**
 * @jest-environment node
 *
 * DR-900 — the WRITER for the dispatch gate's ABN / background-check columns.
 * POST /api/admin/contractors/[contractorId]/compliance
 *
 * The gate (lib/services/dispatch-eligibility.ts) reads Contractor.abnCancelledAt
 * and Contractor.backgroundCheckExpiresAt. Before this route nothing wrote them.
 * Auth, tenant-db and the transaction are mocked at the boundary; the real
 * route handler runs. The writer -> gate round trip is in
 * single-missing-gate-matrix.test.ts ("DR-900 writer -> gate round trip").
 */
import { NextRequest, NextResponse } from 'next/server';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }), { virtual: true });

jest.mock('@/lib/auth-middleware', () => {
  const { NextResponse: MockNextResponse } = jest.requireActual('next/server');
  return {
    authenticateRequest: jest.fn(),
    requireRole: (user: { userType?: string }, roles: string[]) =>
      roles.includes(user?.userType as string),
    unauthorizedRoleResponse: (roles: string[]) =>
      MockNextResponse.json({ error: 'FORBIDDEN', roles }, { status: 403 }),
  };
});

const tx = {
  contractor: { findFirst: jest.fn(), updateMany: jest.fn() },
  contractorVerificationHistory: { create: jest.fn() },
};
const mockDb = {
  contractor: { findFirst: jest.fn(), updateMany: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
  contractorVerificationHistory: { create: jest.fn() },
  $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
};
const mockGetTenantDb = jest.fn<typeof mockDb, [unknown]>(() => mockDb);
jest.mock('@/lib/get-tenant-db', () => ({ getTenantDb: (ctx: unknown) => mockGetTenantDb(ctx) }));

// The unscoped client must never be used by this route.
jest.mock('@/lib/prisma', () => ({
  prisma: new Proxy({}, { get: () => { throw new Error('route used the unscoped prisma client'); } }),
}));

import { authenticateRequest } from '@/lib/auth-middleware';
import { POST } from '@/app/api/admin/contractors/[contractorId]/compliance/route';

const mockAuth = authenticateRequest as jest.Mock;
const NOW = new Date('2026-10-15T00:00:00.000Z');
const ISO = (ms: number) => new Date(NOW.getTime() + ms).toISOString();
const DAY = 24 * 60 * 60 * 1000;

// `tenantId` is the RESOLVED context tenant (may come from a client header when
// the user has none); `userTenantId` is the User.tenantId database column.
function asUser(userType: string, tenantId: string | null = 'tenant_a', userTenantId: string | null = tenantId) {
  mockAuth.mockResolvedValue({
    success: true,
    context: { user: { id: 'admin_1', name: 'Admin', email: 'a@x.test', userType, tenantId: userTenantId }, tenantId },
  });
}

function call(body: unknown, contractorId = 'ctr_1', headers: Record<string, string> = {}) {
  const req = new NextRequest('http://localhost/api/admin/contractors/x/compliance', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  return POST(req, { params: Promise.resolve({ contractorId }) });
}

const REASON = 'Confirmed on ABR lookup 15/10/2026';

function contractorRow(over: Record<string, unknown> = {}) {
  return {
    id: 'ctr_1',
    tenantId: 'tenant_a',
    abnNumber: '51 824 753 556',
    abnCancelledAt: null,
    backgroundCheckExpiresAt: null,
    backgroundCheckStatus: null,
    verificationStatus: 'APPROVED',
    ...over,
  };
}

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
  jest.clearAllMocks();
  asUser('ADMIN');
  tx.contractor.findFirst.mockResolvedValue(contractorRow());
  tx.contractor.updateMany.mockResolvedValue({ count: 1 });
  tx.contractorVerificationHistory.create.mockResolvedValue({ id: 'h1' });
  mockDb.$transaction.mockImplementation(async (fn: (t: typeof tx) => unknown) => fn(tx));
});
afterEach(() => jest.useRealTimers());

const updateData = () => tx.contractor.updateMany.mock.calls[0][0].data;
const updateWhere = () => tx.contractor.updateMany.mock.calls[0][0].where;

describe('access control', () => {
  it('401 when unauthenticated, nothing touched', async () => {
    mockAuth.mockResolvedValue({ success: false, response: NextResponse.json({}, { status: 401 }) });
    expect((await call({ event: 'ABN_CANCELLED', reason: REASON })).status).toBe(401);
    expect(mockDb.$transaction).not.toHaveBeenCalled();
  });

  it.each(['CONTRACTOR', 'CLIENT'])('403 for %s, nothing touched', async (role) => {
    asUser(role);
    expect((await call({ event: 'ABN_CANCELLED', reason: REASON })).status).toBe(403);
    expect(mockDb.$transaction).not.toHaveBeenCalled();
  });

  it('403 for an ADMIN with no tenant (header-chosen tenant is not trusted)', async () => {
    asUser('ADMIN', null);
    expect((await call({ event: 'ABN_CANCELLED', reason: REASON })).status).toBe(403);
    expect(mockDb.$transaction).not.toHaveBeenCalled();
  });

  it('403 for an ADMIN whose User.tenantId is null even when a tenant was resolved from an x-tenant-id header', async () => {
    asUser('ADMIN', 'tenant_victim', null);
    expect((await call({ event: 'ABN_CANCELLED', reason: REASON }, 'ctr_1', { 'x-tenant-id': 'tenant_victim' })).status).toBe(403);
    expect(mockDb.$transaction).not.toHaveBeenCalled();
  });

  it('SUPER_ADMIN with no tenant may write (unscoped where)', async () => {
    asUser('SUPER_ADMIN', null);
    expect((await call({ event: 'ABN_CANCELLED', reason: REASON })).status).toBe(200);
    expect(updateWhere()).toEqual({ id: 'ctr_1', abnCancelledAt: null });
  });

  it('scopes load and write to the acting tenant, via the tenant db', async () => {
    await call({ event: 'ABN_CANCELLED', reason: REASON });
    expect(mockGetTenantDb).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tenant_a' }));
    expect(tx.contractor.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ctr_1', tenantId: 'tenant_a' } })
    );
    expect(updateWhere()).toEqual({ id: 'ctr_1', tenantId: 'tenant_a', abnCancelledAt: null });
  });

  it('404 and no write for a contractor outside the tenant', async () => {
    tx.contractor.findFirst.mockResolvedValue(null);
    expect((await call({ event: 'ABN_CANCELLED', reason: REASON })).status).toBe(404);
    expect(tx.contractor.updateMany).not.toHaveBeenCalled();
    expect(tx.contractorVerificationHistory.create).not.toHaveBeenCalled();
  });

  it('409 and no history when updateMany matches 0 rows (row changed after the read)', async () => {
    tx.contractor.updateMany.mockResolvedValue({ count: 0 });
    expect((await call({ event: 'ABN_CANCELLED', reason: REASON })).status).toBe(409);
    expect(tx.contractorVerificationHistory.create).not.toHaveBeenCalled();
  });
});

describe('input validation (400, never reaches the database)', () => {
  it.each([
    ['unknown event', { event: 'NOPE', reason: REASON }],
    ['missing reason', { event: 'ABN_CANCELLED' }],
    ['short reason', { event: 'ABN_CANCELLED', reason: 'short' }],
    ['extra key (strict)', { event: 'ABN_CANCELLED', reason: REASON, isActive: true }],
    ['cleared without expiresAt', { event: 'BACKGROUND_CLEARED', reason: REASON, checkedAt: ISO(-DAY) }],
    ['cleared with expiresAt in the past', { event: 'BACKGROUND_CLEARED', reason: REASON, checkedAt: ISO(-2 * DAY), expiresAt: ISO(-DAY) }],
    ['cleared with naive (no offset) date', { event: 'BACKGROUND_CLEARED', reason: REASON, checkedAt: '2026-10-14T00:00:00', expiresAt: ISO(DAY) }],
    ['cleared with garbage date', { event: 'BACKGROUND_CLEARED', reason: REASON, checkedAt: 'x', expiresAt: 'y' }],
    ['cleared with checkedAt in the future', { event: 'BACKGROUND_CLEARED', reason: REASON, checkedAt: ISO(DAY), expiresAt: ISO(2 * DAY) }],
    ['failed with checkedAt a year+ ago', { event: 'BACKGROUND_FAILED', reason: REASON, checkedAt: ISO(-400 * DAY) }],
    ['reinstated without abnChecked', { event: 'ABN_REINSTATED', reason: REASON }],
    ['reinstated with malformed abn', { event: 'ABN_REINSTATED', reason: REASON, abnChecked: '123' }],
  ])('%s', async (_n, body) => {
    expect((await call(body)).status).toBe(400);
    expect(mockDb.$transaction).not.toHaveBeenCalled();
  });

  it('400 on a non-JSON body', async () => {
    expect((await call('not json')).status).toBe(400);
    expect(mockDb.$transaction).not.toHaveBeenCalled();
  });
});

describe('ABN events', () => {
  it('ABN_CANCELLED stamps abnCancelledAt = server now (a Date) and nothing else', async () => {
    const res = await call({ event: 'ABN_CANCELLED', reason: REASON });
    expect(res.status).toBe(200);
    expect(updateData()).toEqual({ abnCancelledAt: NOW });
    expect(updateData().abnCancelledAt).toBeInstanceOf(Date);
  });

  it('ABN_CANCELLED on an already-cancelled contractor is a no-op: changed:false, no write, no history', async () => {
    const was = new Date('2026-10-01T00:00:00Z');
    tx.contractor.findFirst.mockResolvedValue(contractorRow({ abnCancelledAt: was }));
    const res = await call({ event: 'ABN_CANCELLED', reason: REASON });
    expect(res.status).toBe(200);
    expect((await res.json()).changed).toBe(false);
    expect(tx.contractor.updateMany).not.toHaveBeenCalled();
    expect(tx.contractorVerificationHistory.create).not.toHaveBeenCalled();
  });

  it('ABN_REINSTATED clears abnCancelledAt with explicit null (undefined would silently skip)', async () => {
    tx.contractor.findFirst.mockResolvedValue(contractorRow({ abnCancelledAt: new Date('2026-10-01T00:00:00Z') }));
    const res = await call({ event: 'ABN_REINSTATED', reason: REASON, abnChecked: '51824753556' });
    expect(res.status).toBe(200);
    expect(Object.prototype.hasOwnProperty.call(updateData(), 'abnCancelledAt')).toBe(true);
    expect(updateData().abnCancelledAt).toBeNull();
  });

  it('ABN_REINSTATED writes only if abnCancelledAt still holds the value it read (stale reinstatement cannot erase a newer cancellation)', async () => {
    const readAt = new Date('2026-10-01T00:00:00Z');
    tx.contractor.findFirst.mockResolvedValue(contractorRow({ abnCancelledAt: readAt }));
    await call({ event: 'ABN_REINSTATED', reason: REASON, abnChecked: '51824753556' });
    expect(updateWhere()).toEqual({ id: 'ctr_1', tenantId: 'tenant_a', abnCancelledAt: readAt });
  });

  it('ABN_CANCELLED writes only while abnCancelledAt is still null', async () => {
    await call({ event: 'ABN_CANCELLED', reason: REASON });
    expect(updateWhere()).toEqual({ id: 'ctr_1', tenantId: 'tenant_a', abnCancelledAt: null });
  });

  it('ABN_REINSTATED for a different ABN than the one on file is 409 and writes nothing', async () => {
    tx.contractor.findFirst.mockResolvedValue(contractorRow({ abnCancelledAt: new Date('2026-10-01T00:00:00Z') }));
    const res = await call({ event: 'ABN_REINSTATED', reason: REASON, abnChecked: '53004085616' });
    expect(res.status).toBe(409);
    expect(tx.contractor.updateMany).not.toHaveBeenCalled();
  });

  it('ABN_REINSTATED on a contractor that is not cancelled is a no-op', async () => {
    const res = await call({ event: 'ABN_REINSTATED', reason: REASON, abnChecked: '51824753556' });
    expect((await res.json()).changed).toBe(false);
    expect(tx.contractor.updateMany).not.toHaveBeenCalled();
  });
});

describe('background-check events', () => {
  it('BACKGROUND_CLEARED stores the future expiry as a Date plus status and check date', async () => {
    const res = await call({
      event: 'BACKGROUND_CLEARED', reason: REASON, checkedAt: ISO(-DAY), expiresAt: ISO(365 * DAY),
    });
    expect(res.status).toBe(200);
    const d = updateData();
    expect(d.backgroundCheckExpiresAt).toBeInstanceOf(Date);
    expect(d.backgroundCheckExpiresAt.toISOString()).toBe(ISO(365 * DAY));
    expect(d.backgroundCheckStatus).toBe('CLEARED');
    expect(d.lastBackgroundCheckDate.toISOString()).toBe(ISO(-DAY));
  });

  it.each([['BACKGROUND_FAILED', 'FAILED'], ['BACKGROUND_EXPIRED', 'EXPIRED']])(
    '%s forces expiry into the past (fail closed) and keeps the real expiry only in history',
    async (event, status) => {
      tx.contractor.findFirst.mockResolvedValue(
        contractorRow({ backgroundCheckExpiresAt: new Date(NOW.getTime() + 100 * DAY) })
      );
      const res = await call({ event, reason: REASON, checkedAt: ISO(-DAY) });
      expect(res.status).toBe(200);
      const d = updateData();
      expect(d.backgroundCheckExpiresAt.getTime()).toBeLessThan(NOW.getTime());
      expect(d.backgroundCheckStatus).toBe(status);
      const meta = tx.contractorVerificationHistory.create.mock.calls[0][0].data.metadata;
      expect(meta.from).toBe(new Date(NOW.getTime() + 100 * DAY).toISOString());
    }
  );

  it('background writes only if backgroundCheckExpiresAt still holds the value it read', async () => {
    const readExpiry = new Date(NOW.getTime() + 100 * DAY);
    tx.contractor.findFirst.mockResolvedValue(contractorRow({ backgroundCheckExpiresAt: readExpiry }));
    await call({ event: 'BACKGROUND_EXPIRED', reason: REASON, checkedAt: ISO(-DAY) });
    expect(updateWhere()).toEqual({ id: 'ctr_1', tenantId: 'tenant_a', backgroundCheckExpiresAt: readExpiry });
  });
});

describe('audit trail', () => {
  it('writes one STATUS_CHANGED history row in the SAME transaction with the actor and unchanged status', async () => {
    await call({ event: 'ABN_CANCELLED', reason: REASON }, 'ctr_1', {
      'user-agent': 'jest-ua', 'x-forwarded-for': '203.0.113.9, 10.0.0.1',
    });
    expect(mockDb.$transaction).toHaveBeenCalledTimes(1);
    expect(mockDb.contractor.updateMany).not.toHaveBeenCalled();
    expect(mockDb.contractorVerificationHistory.create).not.toHaveBeenCalled();
    const data = tx.contractorVerificationHistory.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      contractorId: 'ctr_1',
      action: 'STATUS_CHANGED',
      previousStatus: 'APPROVED',
      newStatus: 'APPROVED',
      performedBy: 'admin_1',
      isSystemAction: false,
      reason: REASON,
      userAgent: 'jest-ua',
      ipAddress: '203.0.113.9',
    });
    expect(data.metadata).toMatchObject({ event: 'ABN_CANCELLED', field: 'abnCancelledAt', tenantId: 'tenant_a' });
  });

  it('a failing history insert surfaces as non-2xx (transaction aborts the column write)', async () => {
    tx.contractorVerificationHistory.create.mockRejectedValue(new Error('db down'));
    mockDb.$transaction.mockImplementation(async (fn: (t: typeof tx) => unknown) => fn(tx));
    const res = await call({ event: 'ABN_CANCELLED', reason: REASON });
    expect(res.status).toBeGreaterThanOrEqual(500);
  });
});
