/**
 * @jest-environment node
 *
 * DR-900 follow-up — every path that assigns (or takes on) a contractor for a
 * job consults the canonical dispatch gate, so a contractor whose ABN is
 * cancelled or whose background check failed/expired gets no jobs at all.
 *
 * Per path: ineligible -> 403 with the shared DR-925 payload and NO write;
 * eligible -> the write happens (the green control that proves the 403 is the
 * gate and not an unrelated failure). Boundaries are mocked, the REAL route
 * handlers are driven.
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
      MockNextResponse.json({ error: 'FORBIDDEN', message: roles.join(',') }, { status: 403 }),
  };
});

const mockDb: Record<string, any> = {
  booking: { findUnique: jest.fn(), update: jest.fn() },
  job: { findUnique: jest.fn(), update: jest.fn() },
  serviceRequest: { findUnique: jest.fn(), update: jest.fn() },
  contractor: { findUnique: jest.fn() },
  contractorProfile: { findUnique: jest.fn() },
  contractorMatch: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn(), create: jest.fn() },
  auditLog: { create: jest.fn() },
  message: { create: jest.fn() },
  $transaction: jest.fn(),
};
jest.mock('@/lib/get-tenant-db', () => ({ getTenantDb: () => mockDb }));

jest.mock('@/lib/prisma', () => {
  const base = {
    contractor: { findUnique: jest.fn() },
    contractorMatch: { findFirst: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    publicClaim: { update: jest.fn() },
    contractorRotation: { updateMany: jest.fn() },
  };
  return { basePrisma: base, prisma: base };
});

jest.mock('@/lib/email/contractor-notifications', () => ({
  sendContractorAssignmentConfirmationEmail: jest.fn(async () => undefined),
}));
jest.mock('@/lib/email/client-notifications', () => ({
  sendClaimContractorAssignedEmail: jest.fn(async () => undefined),
  sendBookingConfirmationEmail: jest.fn(async () => undefined),
}));
jest.mock('@/lib/notifications/job-notifications', () => ({
  notifyContractorAssigned: jest.fn(async () => undefined),
}));
jest.mock('@/lib/jobs', () => ({
  assignContractorSchema: {
    safeParse: (b: { contractorId?: string }) =>
      b?.contractorId ? { success: true, data: { contractorId: b.contractorId } } : { success: false, error: { errors: [] } },
  },
}));
jest.mock('@/lib/services/audit.service', () => ({ logClaimAction: jest.fn(async () => undefined) }));
const mockSend = jest.fn(async () => undefined);
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ channel: () => ({ send: mockSend }) }),
}));

const mockIsDispatchEligible = jest.fn();
jest.mock('@/lib/services/dispatch-eligibility', () => ({
  isDispatchEligible: (...a: unknown[]) => mockIsDispatchEligible(...a),
  filterDispatchEligible: jest.fn(),
}));

import { POST as acceptBid } from '@/app/api/client/claims/[id]/accept-bid/route';
import { POST as claimsRespond } from '@/app/api/contractor/claims/[claimId]/respond/route';
import { POST as offersAccept } from '@/app/api/client/offers/[id]/accept/route';
import { POST as jobsAssign } from '@/app/api/jobs/[id]/assign/route';
import { POST as adminReassign } from '@/app/api/admin/jobs/[id]/reassign/route';
import { POST as bookingsAssign } from '@/app/api/bookings/[id]/assign/route';
import { POST as bidsSubmit } from '@/app/api/contractor/bids/route';
import { authenticateRequest } from '@/lib/auth-middleware';
import { basePrisma } from '@/lib/prisma';
import { DISPATCH_INELIGIBLE_ERROR } from '@/lib/services/dispatch-eligibility-error';

const mockAuth = authenticateRequest as jest.Mock;
const mockBase = basePrisma as unknown as Record<string, any>;

function as(user: Record<string, unknown>) {
  mockAuth.mockResolvedValue({ success: true, context: { user, tenantId: 't1' } });
}
const req = (body: unknown) =>
  new NextRequest('http://localhost/x', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
const p = <T,>(v: T) => ({ params: Promise.resolve(v) });

async function expectBlocked(res: Response, writes: jest.Mock[]) {
  expect(res.status).toBe(403);
  expect(await res.json()).toMatchObject({
    error: 'FORBIDDEN',
    message: DISPATCH_INELIGIBLE_ERROR.message,
    details: { reason: DISPATCH_INELIGIBLE_ERROR.reason, link: DISPATCH_INELIGIBLE_ERROR.link },
  });
  for (const w of writes) expect(w).not.toHaveBeenCalled();
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  mockDb.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === 'function' ? (arg as (t: unknown) => unknown)(mockDb) : arg
  );
});

describe('client accept-bid', () => {
  function seed() {
    as({ id: 'client_1', userType: 'CLIENT' });
    mockDb.booking.findUnique.mockResolvedValue({ id: 'b1', clientId: 'client_1', contractorId: null, status: 'PENDING' });
    mockDb.contractorMatch.findUnique.mockResolvedValue({
      id: 'm1', serviceRequestId: 'b1', status: 'PENDING', budget: '100',
      contractor: { id: 'cp1', userId: 'user_c', businessName: 'Biz' },
    });
    mockDb.contractor.findUnique.mockResolvedValue({ id: 'c1' });
  }
  it('403 and no assignment for an ineligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(false);
    await expectBlocked(await acceptBid(req({ matchId: 'm1' }), p({ id: 'b1' })), [mockDb.$transaction, mockDb.booking.update]);
    expect(mockIsDispatchEligible).toHaveBeenCalledWith('user_c');
  });
  it('assigns an eligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(true);
    expect((await acceptBid(req({ matchId: 'm1' }), p({ id: 'b1' }))).status).toBe(200);
    expect(mockDb.$transaction).toHaveBeenCalled();
  });
});

describe('contractor claims respond', () => {
  function seed() {
    as({ id: 'user_c', userType: 'CONTRACTOR' });
    mockBase.contractor.findUnique.mockResolvedValue({ id: 'c1', businessName: 'Biz', user: { name: 'N', email: 'e@x.test' } });
    mockBase.contractorMatch.findFirst.mockResolvedValue({
      id: 'm1', contractorRespondedAt: null, responseDeadline: null,
      claim: { id: 'cl1', clientName: 'C', clientEmail: 'c@x.test', clientPhone: '1', propertyAddress: 'a', postcode: '3000', disasterType: 'FLOOD', damageDescription: 'd', hasInsurance: false, priority: 'high' },
    });
  }
  it('403 and nothing persisted when an ineligible contractor ACCEPTS', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(false);
    await expectBlocked(await claimsRespond(req({ response: 'ACCEPTED' }), p({ claimId: 'cl1' })), [mockBase.contractorMatch.update, mockBase.publicClaim.update]);
    expect(mockIsDispatchEligible).toHaveBeenCalledWith('user_c');
  });
  it('an eligible contractor ACCEPTS and the claim is assigned', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(true);
    expect((await claimsRespond(req({ response: 'ACCEPTED' }), p({ claimId: 'cl1' }))).status).toBe(200);
    expect(mockBase.publicClaim.update).toHaveBeenCalled();
  });
  it('DECLINED stays exempt (grants nothing)', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(false);
    const res = await claimsRespond(req({ response: 'DECLINED' }), p({ claimId: 'cl1' }));
    expect(res.status).not.toBe(403); // decline-branch persistence is out of scope here
    expect(mockIsDispatchEligible).not.toHaveBeenCalled();
  });
});

describe('admin offers accept', () => {
  function seed() {
    as({ id: 'adm', userType: 'ADMIN' });
    mockDb.contractorMatch.findUnique.mockResolvedValue({
      id: 'o1', serviceRequestId: 'sr1',
      contractor: { userId: 'user_c' },
      serviceRequest: { serviceTitle: 'T' },
    });
  }
  it('403 and offer stays unaccepted for an ineligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(false);
    await expectBlocked(await offersAccept(req({}), p({ id: 'o1' })), [mockDb.contractorMatch.update, mockDb.serviceRequest.update]);
    expect(mockIsDispatchEligible).toHaveBeenCalledWith('user_c');
  });
  it('accepts for an eligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(true);
    expect((await offersAccept(req({}), p({ id: 'o1' }))).status).toBe(200);
    expect(mockDb.contractorMatch.update).toHaveBeenCalled();
  });
});

describe('jobs assign', () => {
  function seed() {
    as({ id: 'adm', userType: 'ADMIN' });
    mockDb.job.findUnique.mockResolvedValue({ id: 'j1', status: 'PENDING', jobNumber: 'J-1' });
    mockDb.contractor.findUnique.mockResolvedValue({
      id: 'c1', userId: 'user_c', businessName: 'Biz', isVerified: true, isActive: true, isSuspended: false,
      user: { name: 'N', email: 'e@x.test' },
    });
    mockDb.job.update.mockResolvedValue({ id: 'j1', type: 'X', clientId: 'cl', property: null });
  }
  it('403 and no assignment for an ineligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(false);
    await expectBlocked(await jobsAssign(req({ contractorId: 'c1' }), p({ id: 'j1' })), [mockDb.job.update]);
    expect(mockIsDispatchEligible).toHaveBeenCalledWith('user_c');
  });
  it('assigns an eligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(true);
    expect((await jobsAssign(req({ contractorId: 'c1' }), p({ id: 'j1' }))).status).toBe(200);
    expect(mockDb.job.update).toHaveBeenCalled();
  });
  it.each(['CLIENT', 'CONTRACTOR'])('403 and no assignment when a %s calls it, even for an eligible contractor', async (userType) => {
    seed(); as({ id: 'u1', userType }); mockIsDispatchEligible.mockResolvedValue(true);
    expect((await jobsAssign(req({ contractorId: 'c1' }), p({ id: 'j1' }))).status).toBe(403);
    expect(mockDb.job.update).not.toHaveBeenCalled();
  });
  it('SUPER_ADMIN can assign', async () => {
    seed(); as({ id: 'sa', userType: 'SUPER_ADMIN' }); mockIsDispatchEligible.mockResolvedValue(true);
    expect((await jobsAssign(req({ contractorId: 'c1' }), p({ id: 'j1' }))).status).toBe(200);
    expect(mockDb.job.update).toHaveBeenCalled();
  });
});

describe('admin job reassign', () => {
  function seed() {
    as({ id: 'adm', userType: 'ADMIN' });
    mockDb.serviceRequest.findUnique.mockResolvedValue({ id: 'sr1', status: 'MATCHED', userId: 'u', matches: [] });
    mockDb.contractorProfile.findUnique.mockResolvedValue({ id: 'cp2', userId: 'user_c', user: { id: 'user_c', name: 'N' } });
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'k';
  }
  it('403 and no new match for an ineligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(false);
    await expectBlocked(await adminReassign(req({ newContractorId: 'cp2', reason: 'r' }), p({ id: 'sr1' })), [mockDb.$transaction, mockDb.contractorMatch.create]);
    expect(mockIsDispatchEligible).toHaveBeenCalledWith('user_c');
  });
  it('creates the match for an eligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(true);
    expect((await adminReassign(req({ newContractorId: 'cp2', reason: 'r' }), p({ id: 'sr1' }))).status).toBe(200);
    expect(mockDb.contractorMatch.create).toHaveBeenCalled();
  });
});

describe('bookings assign', () => {
  function seed() {
    as({ id: 'adm', userType: 'ADMIN' });
    mockDb.booking.findUnique.mockResolvedValue({ id: 'b1', serviceState: 'VIC' });
    mockDb.contractor.findUnique.mockResolvedValue({
      id: 'c1', userId: 'user_c', isVerified: true, operatingStates: ['VIC'], iicrcCertifications: [{ id: 'i' }],
    });
    mockDb.booking.update.mockResolvedValue({ id: 'b1' });
  }
  it('403 and no assignment for an ineligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(false);
    await expectBlocked(await bookingsAssign(req({ contractorId: 'c1' }), p({ id: 'b1' })), [mockDb.booking.update]);
    expect(mockIsDispatchEligible).toHaveBeenCalledWith('user_c');
  });
  it('assigns an eligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(true);
    expect((await bookingsAssign(req({ contractorId: 'c1' }), p({ id: 'b1' }))).status).toBe(200);
    expect(mockDb.booking.update).toHaveBeenCalled();
  });
});

describe('contractor bids submit', () => {
  function seed() {
    as({ id: 'user_c', userType: 'CONTRACTOR' });
    mockDb.contractorProfile.findUnique.mockResolvedValue({ id: 'cp1' });
    mockDb.contractorMatch.findUnique.mockResolvedValue({ id: 'm1', contractorId: 'cp1', contractor: { id: 'cp1' } });
    mockDb.contractorMatch.update.mockResolvedValue({ id: 'm1', serviceRequest: null });
  }
  const body = { matchId: 'm1', proposedBudget: 100 };
  it('403 and no bid persisted for an ineligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(false);
    await expectBlocked(await bidsSubmit(req(body)), [mockDb.contractorMatch.update]);
    expect(mockIsDispatchEligible).toHaveBeenCalledWith('user_c');
  });
  it('persists the bid for an eligible contractor', async () => {
    seed(); mockIsDispatchEligible.mockResolvedValue(true);
    await bidsSubmit(req(body));
    expect(mockDb.contractorMatch.update).toHaveBeenCalled();
  });
});
