/**
 * @jest-environment node
 *
 * DR-904 — Single-missing-gate matrix against the REAL dispatch-eligibility
 * handler (`apps/web/lib/services/dispatch-eligibility.ts`).
 *
 * Spec (openspec/changes/nrpg-contractor-go-live/specs/dispatch-eligibility/spec.md):
 *   "WHEN any single precondition is removed THEN isDispatchEligible flips to
 *    false (asserted by test over each gate)."
 *   "WHEN isDispatchEligible is false THEN the contractor does not appear in
 *    the dispatch/matching pool for any job."
 *
 * How it works — NO reimplemented gate logic:
 *   The real handler expresses its gates as Prisma `where` clauses, so a plain
 *   canned-return mock cannot prove a gate blocks. Instead this suite mocks
 *   only the DATABASE ENGINE: an in-memory evaluator applies the exact `where`
 *   object the real handler passes to fixture rows. The handler's own query is
 *   what includes/excludes a contractor. Consequences:
 *     - Break one fixture field → the handler's own where-clause must exclude
 *       the row → eligibility flips false (each matrix row proves one gate).
 *     - WEAKEN a gate in the handler (delete a condition from the where
 *       clause) → the broken fixture passes again → that matrix row FAILS.
 *     - The baseline row (nothing broken → eligible) fails if a gate is
 *       accidentally tightened or the fixture rots.
 *
 * The matrix is TABLE-DRIVEN (GATE_MATRIX): one row per gate. Adding a gate to
 * the handler must extend the table — the "gate inventory canary" test pins
 * the exact where-clause key sets and fails on any new/removed condition.
 *
 * Each row is also driven through the REAL pool handler
 * (`findAvailableContractors` in src/lib/services/dispatch.service.ts — the
 * one production path that delegates to filterDispatchEligible) to prove the
 * contractor drops out of the dispatch pool, not just the predicate.
 *
 * NOTE (DR-904 finding, not fixed here): the contractor-facing bid/accept
 * routes do NOT consult isDispatchEligible at all — see
 * src/__tests__/dispatch/bid-route-eligibility-gap.test.ts.
 */
export {}; // module scope so block-scoped vars don't leak to global

// ---------------------------------------------------------------------------
// In-memory query engine: evaluates the REAL handler's `where` clauses.
// Supports exactly the operators the handler uses; anything else throws so a
// future query change fails LOUD instead of passing vacuously.
// ---------------------------------------------------------------------------

const KNOWN_OPERATORS = new Set(['in', 'gt', 'lt', 'gte', 'lte', 'some']);
const REJECTED_OPERATORS = new Set([
  'equals', 'not', 'notIn', 'contains', 'startsWith', 'endsWith', 'mode',
  'AND', 'NOT', 'none', 'every', 'is', 'isNot', 'has', 'hasSome',
]);

function isOperatorObject(cond: Record<string, unknown>): boolean {
  const keys = Object.keys(cond);
  if (keys.some((k) => KNOWN_OPERATORS.has(k))) return true;
  const rejected = keys.filter((k) => REJECTED_OPERATORS.has(k));
  if (rejected.length > 0) {
    throw new Error(
      `single-missing-gate-matrix: unsupported Prisma operator(s) [${rejected.join(', ')}] ` +
        'in a where clause — the real handler changed its query shape; extend the in-memory engine.'
    );
  }
  return false;
}

function matchesCondition(value: unknown, cond: unknown): boolean {
  // Prisma treats `{ field: undefined }` as "no filter" (fails open in prod),
  // so a where clause containing undefined must fail LOUD here (DR-900).
  if (cond === undefined) {
    throw new Error('single-missing-gate-matrix: where clause contains `undefined` — Prisma would drop the filter.');
  }
  if (cond === null) return value === null;
  if (cond instanceof Date) {
    return value instanceof Date && value.getTime() === cond.getTime();
  }
  if (typeof cond !== 'object') return value === cond; // scalar equality
  const c = cond as Record<string, unknown>;
  if (isOperatorObject(c)) {
    return Object.entries(c).every(([op, operand]) => {
      switch (op) {
        case 'in':
          return Array.isArray(operand) && operand.includes(value);
        case 'gt':
          return value instanceof Date && operand instanceof Date && value.getTime() > operand.getTime();
        case 'lt':
          return value instanceof Date && operand instanceof Date && value.getTime() < operand.getTime();
        case 'gte':
          return value instanceof Date && operand instanceof Date && value.getTime() >= operand.getTime();
        case 'lte':
          return value instanceof Date && operand instanceof Date && value.getTime() <= operand.getTime();
        case 'some':
          return (
            Array.isArray(value) &&
            value.some((item) => matchesWhere(item as Record<string, unknown>, operand as Record<string, unknown>))
          );
        default:
          throw new Error(`single-missing-gate-matrix: unhandled operator "${op}"`);
      }
    });
  }
  // Operators this engine does not implement must fail loud, not fall through
  // to the relation branch and quietly return false (DR-900).
  const unknownOps = Object.keys(c).filter((k) =>
    /^(isEmpty|set|increment|decrement|multiply|divide|push|search|path|string_contains|array_contains)$/.test(k)
  );
  if (unknownOps.length > 0) {
    throw new Error(`single-missing-gate-matrix: unsupported operator(s) [${unknownOps.join(', ')}]`);
  }
  // Nested to-one relation filter (e.g. user: {...}, contractorProfile: {...}).
  // Prisma excludes rows whose relation is null when filtered with conditions.
  if (value === null || value === undefined) return false;
  return matchesWhere(value as Record<string, unknown>, c);
}

function matchesWhere(row: Record<string, unknown>, where: Record<string, unknown>): boolean {
  return Object.entries(where).every(([field, cond]) =>
    field === 'OR'
      ? (cond as Record<string, unknown>[]).some((branch) => matchesWhere(row, branch))
      : matchesCondition(row[field], cond)
  );
}

// ---------------------------------------------------------------------------
// Fixture store — one row-set per test, filtered by the handler's own queries.
// ---------------------------------------------------------------------------

interface AcceptanceRow {
  contractorId: string;
  version: string;
  supersededAt: Date | null;
}
interface ProfileRow {
  stripePayoutsEnabled: boolean;
  stripeChargesEnabled: boolean;
}
interface IicrcRow {
  isActive: boolean;
  expiryDate: Date;
}
interface UserRow {
  isActive: boolean;
  isBlocked: boolean;
  contractorProfile: ProfileRow | null;
}
interface ContractorRow {
  userId: string;
  isActive: boolean;
  isSuspended: boolean;
  publicLiabilityExpiryDate: Date;
  abnCancelledAt: Date | null;
  backgroundCheckExpiresAt: Date | null;
  // Writer-facing fields (DR-900 round trip); not read by the gate.
  id?: string;
  tenantId?: string | null;
  abnNumber?: string | null;
  verificationStatus?: string;
  backgroundCheckStatus?: string | null;
  lastBackgroundCheckDate?: Date | null;
  user: UserRow;
  iicrcCertifications: IicrcRow[];
}
interface TrainingCertRow {
  contractorId: string;
  certificationName: string;
  verified: boolean;
  expiryDate: Date;
}
interface Store {
  acceptances: AcceptanceRow[];
  contractors: ContractorRow[];
  trainingCerts: TrainingCertRow[];
}

/** Handles to one contractor's rows so a matrix row can break exactly one gate. */
interface Fixture {
  userId: string;
  acceptance: AcceptanceRow;
  contractor: ContractorRow;
  profile: ProfileRow;
  iicrc: IicrcRow;
  trainingCert: TrainingCertRow;
}

const FUTURE = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
const PAST = new Date(Date.now() - 24 * 60 * 60 * 1000);

let store: Store;

const mockPrisma = {
  contractorAgreementAcceptance: { findMany: jest.fn() },
  contractor: { findMany: jest.fn() },
  contractorCertification: { findMany: jest.fn() },
  contractorRotation: { findMany: jest.fn() },
  // dispatch.service references prisma.workspace.fields.monthlyJobLimit when
  // BUILDING its rotation query (never evaluated here — rotation is stubbed).
  workspace: { fields: { monthlyJobLimit: { model: 'workspace', field: 'monthlyJobLimit' } } },
};

jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

// DR-900 round trip: the REAL admin compliance writer runs against this suite's
// in-memory store. Only auth and the tenant-db transaction wrapper are mocked.
jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }), { virtual: true });
jest.mock('@/lib/auth-middleware', () => ({
  authenticateRequest: jest.fn(),
  requireRole: (user: { userType?: string }, roles: string[]) => roles.includes(user?.userType as string),
  unauthorizedRoleResponse: jest.fn(),
}));
const mockTenantDb: { current: unknown } = { current: null };
jest.mock('@/lib/get-tenant-db', () => ({ getTenantDb: () => mockTenantDb.current }));

// Imported dynamically in beforeAll so the @/lib/prisma mock factory runs after
// `mockPrisma` is initialized (repo pattern — see dispatch-eligibility.test.ts).
let ICA_VERSION: string;
let NRPG_CERTIFICATION_NAME: string;
let isDispatchEligible: typeof import('@/lib/services/dispatch-eligibility').isDispatchEligible;
let filterDispatchEligible: typeof import('@/lib/services/dispatch-eligibility').filterDispatchEligible;
let findAvailableContractors: typeof import('@/src/lib/services/dispatch.service').findAvailableContractors;

beforeAll(async () => {
  ({ ICA_VERSION } = await import('@/lib/legal/ica'));
  ({ NRPG_CERTIFICATION_NAME } = await import('@/lib/training/training-policy'));
  ({ isDispatchEligible, filterDispatchEligible } = await import(
    '@/lib/services/dispatch-eligibility'
  ));
  ({ findAvailableContractors } = await import('@/src/lib/services/dispatch.service'));
});

beforeEach(() => {
  store = { acceptances: [], contractors: [], trainingCerts: [] };
  mockPrisma.contractorAgreementAcceptance.findMany.mockImplementation(
    async ({ where }: { where: Record<string, unknown> }) =>
      store.acceptances.filter((r) => matchesWhere(r as unknown as Record<string, unknown>, where))
  );
  mockPrisma.contractor.findMany.mockImplementation(
    async ({ where }: { where: Record<string, unknown> }) =>
      store.contractors.filter((r) => matchesWhere(r as unknown as Record<string, unknown>, where))
  );
  mockPrisma.contractorCertification.findMany.mockImplementation(
    async ({ where }: { where: Record<string, unknown> }) =>
      store.trainingCerts.filter((r) => matchesWhere(r as unknown as Record<string, unknown>, where))
  );
  mockPrisma.contractorRotation.findMany.mockResolvedValue([]);
});

/** Seed a FULLY ELIGIBLE contractor (every N-04 gate passing) and return handles. */
function seedEligible(userId: string): Fixture {
  const acceptance: AcceptanceRow = { contractorId: userId, version: ICA_VERSION, supersededAt: null };
  const profile: ProfileRow = { stripePayoutsEnabled: true, stripeChargesEnabled: true };
  const iicrc: IicrcRow = { isActive: true, expiryDate: FUTURE };
  const contractor: ContractorRow = {
    userId,
    isActive: true,
    isSuspended: false,
    publicLiabilityExpiryDate: FUTURE,
    abnCancelledAt: null,
    backgroundCheckExpiresAt: null,
    user: { isActive: true, isBlocked: false, contractorProfile: profile },
    iicrcCertifications: [iicrc],
  };
  const trainingCert: TrainingCertRow = {
    contractorId: userId,
    certificationName: NRPG_CERTIFICATION_NAME,
    verified: true,
    expiryDate: FUTURE,
  };
  store.acceptances.push(acceptance);
  store.contractors.push(contractor);
  store.trainingCerts.push(trainingCert);
  return { userId, acceptance, contractor, profile, iicrc, trainingCert };
}

function removeRow<T>(rows: T[], row: T): void {
  const i = rows.indexOf(row);
  if (i === -1) throw new Error('matrix fixture row not found — fixture wiring bug');
  rows.splice(i, 1);
}

/** Rotation-queue row for the REAL pool handler (dispatch.service). */
function rotationRow(ownerId: string, workspaceId: string) {
  return {
    availabilityStatus: 'available',
    lastJobReceivedAt: null,
    workspace: {
      id: workspaceId,
      ownerId,
      businessName: workspaceId,
      currentMonthJobs: 0,
      monthlyJobLimit: 999,
      serviceRadiusKm: 1000, // internal distance stub is 0-50km, always within
      completionRate: 100,
      averageRating: 4.9,
    },
  };
}

const CRITERIA = {
  latitude: -27.47,
  longitude: 153.02,
  postcode: '4000',
  disasterType: 'WATER_DAMAGE',
  priority: 'high' as const,
};

// ---------------------------------------------------------------------------
// THE MATRIX — one row per gate. A future gate addition adds a row here (the
// gate-inventory canary below forces that). `breakGate` invalidates EXACTLY
// one gate on an otherwise fully-eligible fixture.
// ---------------------------------------------------------------------------

const GATE_MATRIX: Array<{ gate: string; breakGate: (fx: Fixture, s: Store) => void }> = [
  // Gate 1 — ICA: current-version, non-superseded acceptance
  { gate: 'ICA: no acceptance row at all', breakGate: (fx, s) => removeRow(s.acceptances, fx.acceptance) },
  { gate: 'ICA: acceptance superseded (re-gate on version bump)', breakGate: (fx) => { fx.acceptance.supersededAt = new Date(); } },
  { gate: 'ICA: acceptance of an outdated version', breakGate: (fx) => { fx.acceptance.version = '2000-01-01'; } },
  // Gate 2 — Contractor record active, not suspended
  { gate: 'Contractor record inactive (isActive=false)', breakGate: (fx) => { fx.contractor.isActive = false; } },
  { gate: 'Contractor suspended (isSuspended=true)', breakGate: (fx) => { fx.contractor.isSuspended = true; } },
  // Gate 3 — Public liability insurance unexpired
  { gate: 'Public liability insurance expired', breakGate: (fx) => { fx.contractor.publicLiabilityExpiryDate = PAST; } },
  // Gate 4 — IICRC certification: at least one active + unexpired
  { gate: 'IICRC certification expired', breakGate: (fx) => { fx.iicrc.expiryDate = PAST; } },
  { gate: 'IICRC certification inactive', breakGate: (fx) => { fx.iicrc.isActive = false; } },
  { gate: 'IICRC certification absent', breakGate: (fx) => { fx.contractor.iicrcCertifications = []; } },
  // Gate 5 — Owning user account active, not blocked
  { gate: 'User account inactive (user.isActive=false)', breakGate: (fx) => { fx.contractor.user.isActive = false; } },
  { gate: 'User account blocked (user.isBlocked=true)', breakGate: (fx) => { fx.contractor.user.isBlocked = true; } },
  // Gate 6 — Stripe Connect capabilities (DR-898, webhook-synced)
  { gate: 'Stripe payouts capability disabled', breakGate: (fx) => { fx.profile.stripePayoutsEnabled = false; } },
  { gate: 'Stripe charges capability disabled', breakGate: (fx) => { fx.profile.stripeChargesEnabled = false; } },
  { gate: 'ContractorProfile missing (Stripe capabilities never synced)', breakGate: (fx) => { fx.contractor.user.contractorProfile = null; } },
  // Gate 7 — NRP training certification (DR-893, config-sourced name)
  { gate: 'Training certification missing', breakGate: (fx, s) => removeRow(s.trainingCerts, fx.trainingCert) },
  { gate: 'Training certification unverified', breakGate: (fx) => { fx.trainingCert.verified = false; } },
  { gate: 'Training certification expired', breakGate: (fx) => { fx.trainingCert.expiryDate = PAST; } },
  {
    gate: 'Training certification is a different credential (not the policy-sourced NRP cert)',
    breakGate: (fx) => { fx.trainingCert.certificationName = 'IICRC WRT'; },
  },
  // Gate 8 — ABN cancellation re-gates a LIVE contractor (DR-900)
  { gate: 'ABN cancelled', breakGate: (fx) => { fx.contractor.abnCancelledAt = PAST; } },
  // Gate 9 — Background-check expiry re-gates a LIVE contractor (DR-900)
  { gate: 'Background check expired', breakGate: (fx) => { fx.contractor.backgroundCheckExpiresAt = PAST; } },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DR-904 single-missing-gate matrix — real handler, real where-clauses', () => {
  it('BASELINE (minus nothing): fully-eligible contractor IS eligible and IS in the dispatch pool', async () => {
    seedEligible('user_target');

    await expect(isDispatchEligible('user_target')).resolves.toBe(true);

    // DR-900: a recorded background-check expiry still in the future does not block.
    store.contractors[0].backgroundCheckExpiresAt = FUTURE;
    await expect(isDispatchEligible('user_target')).resolves.toBe(true);

    mockPrisma.contractorRotation.findMany.mockResolvedValue([rotationRow('user_target', 'ws_target')]);
    const pool = await findAvailableContractors(CRITERIA);
    expect(pool.map((c) => c.workspaceId)).toEqual(['ws_target']);
  });

  it.each(GATE_MATRIX)(
    'MISSING GATE — $gate → isDispatchEligible=false AND absent from the dispatch pool',
    async ({ breakGate }) => {
      const target = seedEligible('user_target');
      seedEligible('user_control'); // untouched control proves the run is not vacuous
      breakGate(target, store);

      // Real predicate flips false for the target only.
      await expect(isDispatchEligible('user_target')).resolves.toBe(false);
      const eligible = await filterDispatchEligible(['user_target', 'user_control']);
      expect(eligible.has('user_control')).toBe(true);
      expect(eligible.has('user_target')).toBe(false);

      // Real pool handler (dispatch.service) drops the target, keeps the control.
      mockPrisma.contractorRotation.findMany.mockResolvedValue([
        rotationRow('user_target', 'ws_target'),
        rotationRow('user_control', 'ws_control'),
      ]);
      const pool = await findAvailableContractors(CRITERIA);
      expect(pool.map((c) => c.workspaceId)).toEqual(['ws_control']);
    }
  );

  it('gate-inventory canary: the handler where-clauses contain EXACTLY the known gates (extend GATE_MATRIX when this fails)', async () => {
    seedEligible('user_target');
    await filterDispatchEligible(['user_target']);

    // Query 1 — ICA acceptance gate.
    const icaWhere = mockPrisma.contractorAgreementAcceptance.findMany.mock.calls[0][0].where;
    expect(Object.keys(icaWhere).sort()).toEqual(['contractorId', 'supersededAt', 'version']);
    expect(icaWhere.version).toBe(ICA_VERSION);
    expect(icaWhere.supersededAt).toBeNull();

    // Query 2 — contractor / insurance / IICRC / account / Stripe gates.
    const cWhere = mockPrisma.contractor.findMany.mock.calls[0][0].where;
    expect(Object.keys(cWhere).sort()).toEqual([
      'OR',
      'abnCancelledAt',
      'iicrcCertifications',
      'isActive',
      'isSuspended',
      'publicLiabilityExpiryDate',
      'user',
      'userId',
    ]);
    expect(cWhere.isActive).toBe(true);
    expect(cWhere.isSuspended).toBe(false);
    expect(cWhere.abnCancelledAt).toBeNull();
    expect(cWhere.OR).toEqual([
      { backgroundCheckExpiresAt: null },
      { backgroundCheckExpiresAt: { gt: expect.any(Date) } },
    ]);
    expect(Object.keys(cWhere.user).sort()).toEqual(['contractorProfile', 'isActive', 'isBlocked']);
    expect(cWhere.user.isActive).toBe(true);
    expect(cWhere.user.isBlocked).toBe(false);
    expect(Object.keys(cWhere.user.contractorProfile).sort()).toEqual([
      'stripeChargesEnabled',
      'stripePayoutsEnabled',
    ]);
    expect(cWhere.user.contractorProfile.stripePayoutsEnabled).toBe(true);
    expect(cWhere.user.contractorProfile.stripeChargesEnabled).toBe(true);
    expect(Object.keys(cWhere.iicrcCertifications).sort()).toEqual(['some']);
    expect(Object.keys(cWhere.iicrcCertifications.some).sort()).toEqual(['expiryDate', 'isActive']);

    // Query 3 — NRP training-certification gate (config-sourced name).
    const certWhere = mockPrisma.contractorCertification.findMany.mock.calls[0][0].where;
    expect(Object.keys(certWhere).sort()).toEqual([
      'certificationName',
      'contractorId',
      'expiryDate',
      'verified',
    ]);
    expect(certWhere.certificationName).toBe(NRPG_CERTIFICATION_NAME);
    expect(certWhere.verified).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// DR-900 boundaries: strict `gt` against a frozen clock.
// ---------------------------------------------------------------------------

describe('DR-900 background-check expiry boundary (frozen clock)', () => {
  const T = new Date('2026-10-15T00:00:00.000Z');
  beforeEach(() => jest.useFakeTimers({ now: T }));
  afterEach(() => jest.useRealTimers());

  it.each([
    ['expiry exactly now blocks (gt is strict)', 0, false],
    ['expiry 1ms in the future passes', 1, true],
    ['expiry 1ms in the past blocks', -1, false],
  ])('%s', async (_n, offsetMs, expected) => {
    const fx = seedEligible('user_b');
    fx.contractor.backgroundCheckExpiresAt = new Date(T.getTime() + offsetMs);
    await expect(isDispatchEligible('user_b')).resolves.toBe(expected);
  });

  it('NULL expiry (nothing recorded) passes; any abnCancelledAt, even a future date, blocks', async () => {
    const fx = seedEligible('user_b');
    await expect(isDispatchEligible('user_b')).resolves.toBe(true);
    fx.contractor.abnCancelledAt = new Date(T.getTime() + 365 * 86400000);
    await expect(isDispatchEligible('user_b')).resolves.toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DR-900 writer -> gate round trip. The data the REAL route hands to Prisma is
// applied to the fixture by literal key (unknown keys and operator objects
// throw, undefined is dropped like Prisma does), then the REAL gate reads it.
// Each case starts in the OPPOSITE state so a no-op writer cannot pass.
// ---------------------------------------------------------------------------

describe('DR-900 writer -> gate round trip', () => {
  const DAY = 86400000;
  const REASON = 'Confirmed on ABR lookup 15/10/2026';
  let POST: typeof import('@/app/api/admin/contractors/[contractorId]/compliance/route').POST;
  let authenticateRequest: jest.Mock;

  beforeAll(async () => {
    ({ POST } = await import('@/app/api/admin/contractors/[contractorId]/compliance/route'));
    authenticateRequest = (await import('@/lib/auth-middleware')).authenticateRequest as jest.Mock;
  });

  function wireDb(row: ContractorRow) {
    const tx = {
      contractor: {
        findFirst: async () => row,
        updateMany: async ({ data }: { data: Record<string, unknown> }) => {
          for (const [k, v] of Object.entries(data)) {
            if (v === undefined) continue; // Prisma: undefined = no-op
            if (v !== null && typeof v === 'object' && !(v instanceof Date)) {
              throw new Error(`round trip: operator object for ${k}`);
            }
            if (!(k in row)) throw new Error(`round trip: writer set unknown column ${k}`);
            (row as unknown as Record<string, unknown>)[k] = v;
          }
          return { count: 1 };
        },
      },
      contractorVerificationHistory: { create: async () => ({}) },
    };
    mockTenantDb.current = { $transaction: async (fn: (t: typeof tx) => unknown) => fn(tx) };
  }

  async function post(body: unknown) {
    authenticateRequest.mockResolvedValue({
      success: true,
      context: { user: { id: 'adm', userType: 'ADMIN', name: 'A', email: 'a@x.test' }, tenantId: 't1' },
    });
    const { NextRequest } = await import('next/server');
    return POST(new NextRequest('http://localhost/x', { method: 'POST', body: JSON.stringify(body) }), {
      params: Promise.resolve({ contractorId: 'ctr_rt' }),
    });
  }

  function seedRow(over: Partial<ContractorRow>): ContractorRow {
    const fx = seedEligible('user_rt');
    Object.assign(fx.contractor, {
      id: 'ctr_rt',
      tenantId: 't1',
      abnNumber: '51 824 753 556',
      verificationStatus: 'APPROVED',
      backgroundCheckStatus: null,
      lastBackgroundCheckDate: null,
      ...over,
    });
    return fx.contractor;
  }

  it('ABN_CANCELLED: eligible -> blocked', async () => {
    const row = seedRow({});
    await expect(isDispatchEligible('user_rt')).resolves.toBe(true);
    wireDb(row);
    expect((await post({ event: 'ABN_CANCELLED', reason: REASON })).status).toBe(200);
    await expect(isDispatchEligible('user_rt')).resolves.toBe(false);
  });

  it('ABN_REINSTATED: blocked -> eligible', async () => {
    const row = seedRow({ abnCancelledAt: new Date(Date.now() - DAY) });
    await expect(isDispatchEligible('user_rt')).resolves.toBe(false);
    wireDb(row);
    expect((await post({ event: 'ABN_REINSTATED', reason: REASON, abnChecked: '51824753556' })).status).toBe(200);
    await expect(isDispatchEligible('user_rt')).resolves.toBe(true);
  });

  it.each(['BACKGROUND_FAILED', 'BACKGROUND_EXPIRED'])('%s: valid check -> blocked', async (event) => {
    const row = seedRow({ backgroundCheckExpiresAt: new Date(Date.now() + 300 * DAY) });
    await expect(isDispatchEligible('user_rt')).resolves.toBe(true);
    wireDb(row);
    const res = await post({ event, reason: REASON, checkedAt: new Date(Date.now() - DAY).toISOString() });
    expect(res.status).toBe(200);
    await expect(isDispatchEligible('user_rt')).resolves.toBe(false);
  });

  it('BACKGROUND_CLEARED: expired -> eligible', async () => {
    const row = seedRow({ backgroundCheckExpiresAt: new Date(Date.now() - DAY) });
    await expect(isDispatchEligible('user_rt')).resolves.toBe(false);
    wireDb(row);
    const res = await post({
      event: 'BACKGROUND_CLEARED',
      reason: REASON,
      checkedAt: new Date(Date.now() - DAY).toISOString(),
      expiresAt: new Date(Date.now() + 365 * DAY).toISOString(),
    });
    expect(res.status).toBe(200);
    await expect(isDispatchEligible('user_rt')).resolves.toBe(true);
  });
});
