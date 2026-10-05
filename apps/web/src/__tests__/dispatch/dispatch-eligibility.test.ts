/**
 * Phase-5 e2e — Dispatch eligibility gate (DR-858 N-04, PR #177)
 *
 * Exercises the REAL `filterDispatchEligible` / `isDispatchEligible` with Prisma
 * mocked. The five new gates (insurance currency, IICRC cert currency, active +
 * non-suspended contractor, active + non-blocked user) are applied inside the
 * Prisma `where` clause, so a mock cannot prove the database physically excludes
 * a bad row. What it CAN prove — and what guards against regressing back to the
 * pre-N-04 "ICA-only" gate — is:
 *
 *   1. ICA gates first: with no current-version acceptance, the contractor query
 *      never runs and nobody is eligible.
 *   2. The ICA query is pinned to the live ICA_VERSION and non-superseded rows.
 *   3. The contractor query is CONSTRUCTED with every N-04 gate (insurance, cert,
 *      status). Removing any gate fails this test.
 *   4. Passing ICA alone is insufficient — the result is the contractor-query
 *      intersection, not the ICA set.
 *   5. DR-893: the NRP training-certification gate is CONSTRUCTED from the
 *      single training-policy source (certification name; verified=true;
 *      unexpired) — no literal — and a contractor without a live verified cert
 *      is excluded.
 *
 * The behavioural proof (seed an expired-insurance contractor against real
 * Postgres and confirm exclusion) lives in
 * `src/__tests__/integration/dispatch-eligibility.integration.test.ts` and only
 * runs with a test database (npm run test:integration).
 */
export {}; // mark as a module so block-scoped test vars don't leak to global scope

const mockPrisma = {
  contractorAgreementAcceptance: { findMany: jest.fn() },
  contractor: { findMany: jest.fn() },
  contractorCertification: { findMany: jest.fn() },
};

jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

// Imported dynamically in beforeAll so the @/lib/prisma mock factory runs after
// `mockPrisma` is initialized (a static import is hoisted above it -> TDZ).
let ICA_VERSION: string;
let NRPG_CERTIFICATION_NAME: string;
let filterDispatchEligible: typeof import('@/lib/services/dispatch-eligibility').filterDispatchEligible;
let isDispatchEligible: typeof import('@/lib/services/dispatch-eligibility').isDispatchEligible;

beforeAll(async () => {
  ({ ICA_VERSION } = await import('@/lib/legal/ica'));
  ({ NRPG_CERTIFICATION_NAME } = await import('@/lib/training/training-policy'));
  ({ filterDispatchEligible, isDispatchEligible } = await import(
    '@/lib/services/dispatch-eligibility'
  ));
});

beforeEach(() => {
  mockPrisma.contractorAgreementAcceptance.findMany.mockReset();
  mockPrisma.contractor.findMany.mockReset();
  mockPrisma.contractorCertification.findMany.mockReset();
  // Default: the queried users hold a live verified NRP training cert. Tests
  // that exercise the DR-893 gate override this per-case.
  mockPrisma.contractorCertification.findMany.mockImplementation(
    async (args: { where: { contractorId: { in: string[] } } }) =>
      args.where.contractorId.in.map((contractorId: string) => ({ contractorId }))
  );
});

describe('filterDispatchEligible', () => {
  it('returns empty for empty input and queries nothing', async () => {
    const result = await filterDispatchEligible([]);
    expect(result.size).toBe(0);
    expect(mockPrisma.contractorAgreementAcceptance.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.contractor.findMany).not.toHaveBeenCalled();
  });

  it('gates on ICA first: no acceptance => excluded, contractor query never runs', async () => {
    mockPrisma.contractorAgreementAcceptance.findMany.mockResolvedValue([]);

    const result = await filterDispatchEligible(['user_1']);

    expect(result.size).toBe(0);
    expect(mockPrisma.contractor.findMany).not.toHaveBeenCalled();
  });

  it('pins the ICA query to the live version and non-superseded acceptances', async () => {
    mockPrisma.contractorAgreementAcceptance.findMany.mockResolvedValue([
      { contractorId: 'user_1' },
    ]);
    mockPrisma.contractor.findMany.mockResolvedValue([{ userId: 'user_1' }]);

    await filterDispatchEligible(['user_1']);

    expect(mockPrisma.contractorAgreementAcceptance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          contractorId: { in: ['user_1'] },
          version: ICA_VERSION,
          supersededAt: null,
        }),
      })
    );
  });

  it('constructs the contractor query with ALL N-04 gates (regression guard)', async () => {
    mockPrisma.contractorAgreementAcceptance.findMany.mockResolvedValue([
      { contractorId: 'user_1' },
    ]);
    mockPrisma.contractor.findMany.mockResolvedValue([{ userId: 'user_1' }]);

    await filterDispatchEligible(['user_1']);

    expect(mockPrisma.contractor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: { in: ['user_1'] },
          isActive: true,
          isSuspended: false,
          publicLiabilityExpiryDate: expect.objectContaining({ gt: expect.any(Date) }),
          abnCancelledAt: null,
          OR: [
            { backgroundCheckExpiresAt: null },
            { backgroundCheckExpiresAt: { gt: expect.any(Date) } },
          ],
          user: {
            isActive: true,
            isBlocked: false,
            contractorProfile: {
              stripePayoutsEnabled: true,
              stripeChargesEnabled: true,
            },
          },
          iicrcCertifications: {
            some: expect.objectContaining({
              isActive: true,
              expiryDate: expect.objectContaining({ gt: expect.any(Date) }),
            }),
          },
        }),
      })
    );
  });

  it('constructs the training-cert gate from the single policy source (DR-893)', async () => {
    mockPrisma.contractorAgreementAcceptance.findMany.mockResolvedValue([
      { contractorId: 'user_1' },
    ]);
    mockPrisma.contractor.findMany.mockResolvedValue([{ userId: 'user_1' }]);

    await filterDispatchEligible(['user_1']);

    expect(mockPrisma.contractorCertification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          contractorId: { in: ['user_1'] },
          certificationName: NRPG_CERTIFICATION_NAME,
          verified: true,
          expiryDate: expect.objectContaining({ gt: expect.any(Date) }),
        }),
      })
    );
  });

  it('excludes a contractor with no live verified NRP training cert (DR-893)', async () => {
    mockPrisma.contractorAgreementAcceptance.findMany.mockResolvedValue([
      { contractorId: 'user_1' },
      { contractorId: 'user_2' },
    ]);
    mockPrisma.contractor.findMany.mockResolvedValue([
      { userId: 'user_1' },
      { userId: 'user_2' },
    ]);
    // Only user_1 holds a verified, unexpired NRP Contractor Certification.
    mockPrisma.contractorCertification.findMany.mockResolvedValue([
      { contractorId: 'user_1' },
    ]);

    const result = await filterDispatchEligible(['user_1', 'user_2']);

    expect(result.has('user_1')).toBe(true);
    expect(result.has('user_2')).toBe(false);
    expect(result.size).toBe(1);
  });

  it('skips the cert query when the contractor query already excluded everyone', async () => {
    mockPrisma.contractorAgreementAcceptance.findMany.mockResolvedValue([
      { contractorId: 'user_1' },
    ]);
    mockPrisma.contractor.findMany.mockResolvedValue([]);

    const result = await filterDispatchEligible(['user_1']);

    expect(result.size).toBe(0);
    expect(mockPrisma.contractorCertification.findMany).not.toHaveBeenCalled();
  });

  it('passing ICA alone is not enough: result is the contractor-query intersection', async () => {
    // Both accepted the ICA...
    mockPrisma.contractorAgreementAcceptance.findMany.mockResolvedValue([
      { contractorId: 'user_1' },
      { contractorId: 'user_2' },
    ]);
    // ...but only user_1 clears the insurance/cert/status gates in the DB.
    mockPrisma.contractor.findMany.mockResolvedValue([{ userId: 'user_1' }]);

    const result = await filterDispatchEligible(['user_1', 'user_2']);

    expect(result.has('user_1')).toBe(true);
    expect(result.has('user_2')).toBe(false);
    expect(result.size).toBe(1);
  });
});

describe('isDispatchEligible', () => {
  it('is true only when the user survives both gates', async () => {
    mockPrisma.contractorAgreementAcceptance.findMany.mockResolvedValue([
      { contractorId: 'user_1' },
    ]);
    mockPrisma.contractor.findMany.mockResolvedValue([{ userId: 'user_1' }]);
    await expect(isDispatchEligible('user_1')).resolves.toBe(true);
  });

  it('is false when the contractor query drops the user (e.g. expired insurance)', async () => {
    mockPrisma.contractorAgreementAcceptance.findMany.mockResolvedValue([
      { contractorId: 'user_1' },
    ]);
    mockPrisma.contractor.findMany.mockResolvedValue([]); // dropped by a DB gate
    await expect(isDispatchEligible('user_1')).resolves.toBe(false);
  });
});
