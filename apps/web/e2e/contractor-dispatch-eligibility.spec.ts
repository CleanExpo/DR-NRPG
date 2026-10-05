import { test, expect, type Page, type TestInfo } from '@playwright/test';
import {
  getPrisma,
  makeGoLiveNamespace,
  goLiveEmail,
  GOLIVE_PASSWORD,
} from './helpers/golive';
import { isDispatchEligible } from '@/lib/services/dispatch-eligibility';
import { ICA_VERSION } from '@/lib/legal/ica';
import {
  NRPG_CERTIFICATION_NAME,
  NRPG_CANONICAL_MODULE_IDS,
} from '@/lib/training/training-policy';

/**
 * Full-journey dispatch-eligibility proof (DR-928).
 *
 * The go-live proof (contractor-go-live.spec.ts) proves signup lands the
 * lifecycle rows + a live session. The DB integration test proves
 * `filterDispatchEligible` excludes a contractor who fails any single gate.
 * NEITHER proves the whole journey composes: that a real contractor, walked
 * from signup through every onboarding step, ends up `isDispatchEligible=true`
 * and is NOT eligible one gate short.
 *
 * This runs under the `golive-proof` Playwright project (retries: 0) against
 * the ephemeral CI Postgres. It drives:
 *   1. signup       — real UI journey (User + Contractor + Onboarding + session)
 *   2. verify email — real GET /api/auth/verify-email with the issued token
 *   ...then advances each remaining dispatch gate and asserts the composite
 *      `isDispatchEligible` stays FALSE until the LAST gate, then flips TRUE:
 *   3. ICA acceptance (current version)
 *   4. docs         — public-liability insurance + IICRC certification
 *   5. approval     — contractor active, not suspended
 *   6. 24 modules   — the auto-issued NRP Contractor Certification (verified)
 *   7. commitment   — real POST /api/onboarding/nrpg/commitment (session)
 *   8. Stripe       — Connect payouts + charges enabled (the final gate)
 *
 * The load-bearing assertion is monotonic: `isDispatchEligible(user.id)` is
 * FALSE after every step except the last (Stripe), where it becomes TRUE.
 * Gates 3-6 and 8 are persisted through the exact model the production
 * endpoints write (the DB integration test is the authority on that model);
 * signup, email verification, and commitment are driven through the real app.
 *
 * The row it creates are namespaced with GOLIVE_MARKER so the shared
 * `golive-cleanup` teardown also covers them; this spec additionally deletes
 * its own child rows (certs, ICA acceptance, commitment) in afterAll so it
 * leaves zero residual regardless of the teardown's table coverage.
 *
 * Per-gate evidence (DR-903): after every step `captureGate` attaches a
 * full-page screenshot and a JSON dump of the contractor's lifecycle rows
 * plus the `isDispatchEligible` value at that point. Together with the
 * always-on trace + video of the `golive-proof` project, a passing run leaves
 * one screenshot + DB snapshot per gate in test-results/ and the HTML report.
 * Gates persisted straight to the DB (3-6, 8) have no UI of their own, so
 * their screenshot shows the browser state at that gate, not a gate page.
 */

const DUMP_REPLACER = (_k: string, v: unknown) => (typeof v === 'bigint' ? v.toString() : v);

/** Lifecycle rows for one contractor. Excludes secrets (password hash, tokens). */
async function dumpLifecycleRows(
  prisma: ReturnType<typeof getPrisma>,
  userId: string,
  contractorRowId: string | undefined
) {
  return {
    user: await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, userType: true, isEmailVerified: true, tenantId: true },
    }),
    contractor: await prisma.contractor.findUnique({ where: { userId } }),
    onboarding: await prisma.contractorOnboarding.findUnique({ where: { contractorId: userId } }),
    icaAcceptances: await prisma.contractorAgreementAcceptance.findMany({
      where: { contractorId: userId },
    }),
    iicrcCertifications: contractorRowId
      ? await prisma.iICRCCertification.findMany({ where: { contractorId: contractorRowId } })
      : [],
    trainingCertifications: await prisma.contractorCertification.findMany({
      where: { contractorId: userId },
    }),
    commitments: await prisma.nRPGCommitment.findMany({ where: { contractorId: userId } }),
    contractorProfile: await prisma.contractorProfile.findUnique({ where: { userId } }),
  };
}

test.describe('Full journey — signup to isDispatchEligible=true (DR-928)', () => {
  const prisma = getPrisma();
  const future = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const past = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Populated by the journey test; consumed by afterAll cleanup.
  let userId: string | undefined;
  let contractorRowId: string | undefined;

  test.afterAll(async () => {
    if (!userId) return;
    // Children first (contractorId keys on User.id except IICRC which keys on
    // Contractor.id), then the User. Order matters — no FK cascade is assumed.
    await prisma.nRPGCommitment.deleteMany({ where: { contractorId: userId } });
    await prisma.contractorCertification.deleteMany({ where: { contractorId: userId } });
    await prisma.contractorAgreementAcceptance.deleteMany({ where: { contractorId: userId } });
    if (contractorRowId) {
      await prisma.iICRCCertification.deleteMany({ where: { contractorId: contractorRowId } });
    }
    await prisma.contractorProfile.deleteMany({ where: { userId } });
    await prisma.contractorOnboarding.deleteMany({ where: { contractorId: userId } });
    await prisma.contractor.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  test('a contractor walked through every onboarding step becomes dispatch-eligible', async ({
    page,
  }, testInfo) => {
    let gateIndex = 0;
    const captureGate = async (gate: string, eligible: boolean) => {
      const label = `gate-${String(++gateIndex).padStart(2, '0')}-${gate}`;
      await attachGateEvidence(page, testInfo, label, {
        gate,
        isDispatchEligible: eligible,
        capturedAt: new Date().toISOString(),
        rows: userId ? await dumpLifecycleRows(prisma, userId, contractorRowId) : null,
      });
    };

    const namespace = makeGoLiveNamespace();
    const email = goLiveEmail(namespace, 'dispatch');

    // ---- STEP 1: SIGNUP (real UI) -----------------------------------------
    // This spec sorts first alphabetically in the golive-proof project, so it
    // is the FIRST to touch the NextAuth catch-all (/api/auth/[...nextauth]) on
    // a cold `next dev` server. The client-side signIn that signup triggers
    // would otherwise pay that route's on-demand compilation inside the session
    // poll below and time out. Warm the route now so it compiles during the UI
    // steps, not during the assertion (sibling specs pass only because they run
    // after this route is already warm).
    await page.request.get('/api/auth/session');
    await page.goto('/signup?type=contractor');

    // First-visit cookie banner overlays the lower form — dismiss if shown.
    try {
      await page.getByRole('button', { name: 'Accept All' }).click({ timeout: 5_000 });
    } catch {
      // Banner not rendered in this context — nothing to dismiss.
    }

    await page.fill('#name', namespace);
    await page.fill('#email', email);

    // Select the account type explicitly (the ?type= preselect is not trusted;
    // see contractor-go-live.spec.ts for the Radix Select reset behaviour).
    const accountType = page.getByRole('combobox').first();
    await accountType.click();
    await page.getByRole('option', { name: 'Contractor' }).click();
    await expect(accountType).toContainText('Contractor');

    await page.fill('#password', GOLIVE_PASSWORD);
    await page.fill('#confirmPassword', GOLIVE_PASSWORD);
    await page.check('#terms');
    await page.locator('button[type="submit"]').click();

    // DB truth: registration created the User (and, below, the lifecycle rows).
    await expect
      .poll(async () => prisma.user.count({ where: { email } }), {
        timeout: 60_000,
        message: `registration never created a User row for ${email}`,
      })
      .toBe(1);

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    userId = user.id;
    expect(user.userType).toBe('CONTRACTOR');

    const contractor = await prisma.contractor.findUniqueOrThrow({
      where: { userId: user.id },
    });
    contractorRowId = contractor.id;
    expect(
      await prisma.contractorOnboarding.count({ where: { contractorId: user.id } })
    ).toBe(1);

    // Session must be live so the authenticated commitment call (step 7) works.
    await expect
      .poll(
        async () => {
          const res = await page.request.get('/api/auth/session');
          if (res.status() !== 200) return `status ${res.status()}`;
          const body = (await res.json()) as { user?: { email?: string } } | null;
          return body?.user?.email ?? 'no-session';
        },
        { timeout: 60_000, message: 'post-signup session never became active' }
      )
      .toBe(email);

    // Fresh signup satisfies zero dispatch gates.
    expect(await isDispatchEligible(user.id)).toBe(false);
    await captureGate('signup', false);

    // ---- STEP 2: VERIFY EMAIL (real endpoint, DB-issued token) ------------
    expect(user.emailVerificationToken).not.toBeNull();
    const verifyRes = await page.request.get(
      `/api/auth/verify-email?token=${user.emailVerificationToken}`
    );
    expect(verifyRes.status()).toBe(200);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).isEmailVerified
    ).toBe(true);
    // Email verification is a real journey gate but NOT a dispatch gate.
    expect(await isDispatchEligible(user.id)).toBe(false);
    await captureGate('verify-email', false);

    // ---- STEP 3: ICA ACCEPTANCE (current version) -------------------------
    await prisma.contractorAgreementAcceptance.create({
      data: {
        contractorId: user.id, // Option B: acceptance keyed on User.id
        version: ICA_VERSION,
        documentHash: `${namespace}-hash`,
        signedName: namespace,
      },
    });
    expect(await isDispatchEligible(user.id)).toBe(false);
    await captureGate('ica-acceptance', false);

    // ---- STEP 4: DOCS — public-liability insurance + IICRC certification ---
    await prisma.contractor.update({
      where: { userId: user.id },
      data: { publicLiabilityExpiryDate: future },
    });
    await prisma.iICRCCertification.create({
      data: {
        contractorId: contractor.id, // IICRC cert keys on Contractor.id
        certificationLevel: 'TECHNICIAN',
        certificationCode: `${namespace}-CERT`,
        certificationDate: past,
        expiryDate: future,
        isActive: true,
      },
    });
    expect(await isDispatchEligible(user.id)).toBe(false);
    await captureGate('documents', false);

    // ---- STEP 5: APPROVAL — contractor active, not suspended --------------
    await prisma.contractor.update({
      where: { userId: user.id },
      data: { isActive: true, isSuspended: false },
    });
    expect(await isDispatchEligible(user.id)).toBe(false);
    await captureGate('approval', false);

    // ---- STEP 6: 24 MODULES — auto-issued NRP Contractor Certification ----
    // Completion is set-equality over the canonical NRP-001..NRP-024 set.
    expect(NRPG_CANONICAL_MODULE_IDS).toHaveLength(24);
    await prisma.contractorCertification.create({
      data: {
        contractorId: user.id, // training cert keys on User.id
        certificationName: NRPG_CERTIFICATION_NAME,
        certificationLevel: 1,
        issueDate: past,
        expiryDate: future,
        specializations: ['water'],
        verified: true,
        tenantId: user.tenantId,
      },
    });
    // Still short one gate — no Stripe Connect capability yet.
    expect(await isDispatchEligible(user.id)).toBe(false);
    await captureGate('training-24-modules', false);

    // ---- STEP 7: COMMITMENT (real POST, authenticated session) ------------
    const commitmentRes = await page.request.post('/api/onboarding/nrpg/commitment', {
      data: {
        fullName: namespace,
        signature: namespace,
        agreedToEthics: true,
        agreedToQuality: true,
        agreedToCustomer: true,
        agreedToContinuousImprovement: true,
      },
    });
    expect(commitmentRes.status()).toBe(200);
    expect(
      await prisma.nRPGCommitment.count({ where: { contractorId: user.id } })
    ).toBe(1);
    // Commitment is a real journey gate but NOT a dispatch gate.
    expect(await isDispatchEligible(user.id)).toBe(false);
    await captureGate('commitment', false);

    // ---- STEP 8: STRIPE — Connect payouts + charges enabled (final gate) ---
    // Assert NOT eligible immediately before the final gate, so the flip below
    // is proven to be caused by this step and nothing else.
    expect(await isDispatchEligible(user.id)).toBe(false);
    await prisma.contractorProfile.create({
      data: {
        userId: user.id,
        businessName: `${namespace}'s Business`,
        tenantId: user.tenantId,
        // Dummy account id derived from the DB-generated user id (a cuid), not
        // the Math.random-seeded namespace, so it stays unique without routing
        // insecure randomness into a Stripe-account-id sink (CodeQL).
        stripeConnectAccountId: `acct_${user.id}`,
        stripePayoutsEnabled: true,
        stripeChargesEnabled: true,
      },
    });

    // ---- ELIGIBLE: every gate satisfied ----------------------------------
    expect(await isDispatchEligible(user.id)).toBe(true);
    await captureGate('stripe-connect-eligible', true);
  });
});

async function attachGateEvidence(
  page: Page,
  testInfo: TestInfo,
  label: string,
  snapshot: Record<string, unknown>
) {
  await testInfo.attach(`${label}.png`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await testInfo.attach(`${label}.db.json`, {
    body: JSON.stringify(snapshot, DUMP_REPLACER, 2),
    contentType: 'application/json',
  });
}
