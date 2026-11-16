import { test, expect } from '@playwright/test';
import {
  getPrisma,
  makeGoLiveNamespace,
  goLiveEmail,
  GOLIVE_PASSWORD,
} from './helpers/golive';

/**
 * Contractor Go-Live proof (DR-905).
 *
 * Runs under the dedicated `golive-proof` Playwright project:
 *   - retries: 0 — a retried pass never counts as GREEN
 *   - required blocking CI check (test-all.yml `go-live-proof` job) and a
 *     `needs:` gate on the production deploy (deploy-production.yml)
 *   - teardown project `golive-cleanup` deletes every namespaced row and
 *     asserts zero residual rows
 *
 * Every test asserts REAL outcomes: rows in the database, exact HTTP status
 * codes, exact redirect targets. No tautological asserts, no accept-any-status
 * lists, no fixed-sleep waits (enforced by a CI grep in the go-live-proof job).
 *
 * Each test seeds its own uniquely-namespaced data (per-test isolation — no
 * shared serial Page state).
 */

test.describe('Contractor go-live proof (DR-905)', () => {
  test('signup?type=contractor creates User + Contractor + ContractorOnboarding and a live session', async ({
    page,
  }) => {
    const prisma = getPrisma();
    const namespace = makeGoLiveNamespace();
    const email = goLiveEmail(namespace, 'contractor');

    await page.goto('/signup?type=contractor');

    // First-visit cookie banner overlays the lower form — dismiss it if shown.
    try {
      await page.getByRole('button', { name: 'Accept All' }).click({ timeout: 5_000 });
    } catch {
      // Banner not rendered in this context — nothing to dismiss.
    }

    await page.fill('#name', namespace);
    await page.fill('#email', email);

    // Select the account type explicitly, as a real user may. The page's Radix
    // Select used to reset its value to '' (CI run 28590168764), so the param
    // alone submitted userType '' and the API rejected it. DR-1004 fixed that
    // (src/__tests__/auth/signup-account-type.test.tsx covers the untouched
    // dropdown); this test keeps the explicit-choice path.
    // .first(): Radix renders a visually-hidden native <select> alongside the
    // trigger; the trigger comes first in the DOM.
    const accountType = page.getByRole('combobox').first();
    await accountType.click();
    await page.getByRole('option', { name: 'Contractor' }).click();
    await expect(accountType).toContainText('Contractor');

    await page.fill('#password', GOLIVE_PASSWORD);
    await page.fill('#confirmPassword', GOLIVE_PASSWORD);
    await page.check('#terms');
    await page.locator('button[type="submit"]').click();

    // DB truth, not UI text: registration must land the full NRPG lifecycle.
    await expect
      .poll(async () => prisma.user.count({ where: { email } }), {
        timeout: 60_000,
        message: `registration never created a User row for ${email}`,
      })
      .toBe(1);

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(user.userType).toBe('CONTRACTOR');
    // Password is stored hashed, never in the clear.
    expect(user.password).not.toBeNull();
    expect(user.password).not.toBe(GOLIVE_PASSWORD);
    // A single-use email-verification token was issued at signup (DR-881/DR-879).
    expect(user.emailVerificationToken).not.toBeNull();
    expect(user.isEmailVerified).toBe(false);
    // Consent is server-stamped.
    expect(user.consentAcceptedAt).not.toBeNull();
    expect(user.consentVersion).not.toBeNull();

    // Exactly one Contractor and one ContractorOnboarding row, keyed on
    // User.id (DR-879 Option B) — not just a legacy ContractorProfile.
    expect(await prisma.contractor.count({ where: { userId: user.id } })).toBe(1);
    const onboarding = await prisma.contractorOnboarding.findMany({
      where: { contractorId: user.id },
    });
    expect(onboarding).toHaveLength(1);
    expect(onboarding[0].specialization).toBe('PENDING');
    expect(onboarding[0].status).toBe('PENDING_START');

    // Signup auto-signs-in (AuthContext.register -> signIn credentials).
    // The session cookie must be live: /api/auth/session returns this user.
    await expect
      .poll(
        async () => {
          const res = await page.request.get('/api/auth/session');
          if (res.status() !== 200) return `status ${res.status()}`;
          const body = (await res.json()) as { user?: { email?: string } } | null;
          return body?.user?.email ?? 'no-session';
        },
        { timeout: 30_000, message: 'post-signup session never became active' }
      )
      .toBe(email);

    // RBAC negative, live: a signed-in CONTRACTOR calling an admin API is
    // rejected with exactly 403 by the centralized middleware gate.
    const adminRes = await page.request.get('/api/admin/contractor-verification/pending');
    expect(adminRes.status()).toBe(403);
    const adminBody = (await adminRes.json()) as { error?: string };
    expect(adminBody.error).toBe('FORBIDDEN');
  });

  test('duplicate email registration returns 400 and creates no extra lifecycle rows', async ({
    request,
  }) => {
    const prisma = getPrisma();
    const namespace = makeGoLiveNamespace();
    const email = goLiveEmail(namespace, 'dupe');
    const payload = {
      email,
      password: GOLIVE_PASSWORD,
      name: `${namespace} dupe`,
      userType: 'CONTRACTOR',
      consentAccepted: true,
    };

    const first = await request.post('/api/auth/register', { data: payload });
    expect(first.status()).toBe(201);

    const second = await request.post('/api/auth/register', { data: payload });
    expect(second.status()).toBe(400);

    const users = await prisma.user.findMany({ where: { email } });
    expect(users).toHaveLength(1);
    expect(await prisma.contractor.count({ where: { userId: users[0].id } })).toBe(1);
    expect(
      await prisma.contractorOnboarding.count({ where: { contractorId: users[0].id } })
    ).toBe(1);
  });

  test('CLIENT signup succeeds and creates no contractor lifecycle rows', async ({
    request,
  }) => {
    const prisma = getPrisma();
    const namespace = makeGoLiveNamespace();
    const email = goLiveEmail(namespace, 'client');

    const res = await request.post('/api/auth/register', {
      data: {
        email,
        password: GOLIVE_PASSWORD,
        name: `${namespace} client`,
        userType: 'CLIENT',
        consentAccepted: true,
      },
    });
    expect(res.status()).toBe(201);

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(user.userType).toBe('CLIENT');
    // The contractor gate must not catch CLIENT signups: zero lifecycle rows.
    expect(await prisma.contractor.count({ where: { userId: user.id } })).toBe(0);
    expect(
      await prisma.contractorOnboarding.count({ where: { contractorId: user.id } })
    ).toBe(0);
  });

  test('client-supplied ADMIN role is never honoured at public registration', async ({
    request,
  }) => {
    const prisma = getPrisma();
    const namespace = makeGoLiveNamespace();
    const email = goLiveEmail(namespace, 'escalate');

    const res = await request.post('/api/auth/register', {
      data: {
        email,
        password: GOLIVE_PASSWORD,
        name: `${namespace} escalate`,
        userType: 'ADMIN',
        consentAccepted: true,
      },
    });
    expect(res.status()).toBe(201);

    // Privileged roles collapse to CLIENT (see /api/auth/register safeUserType).
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    expect(user.userType).toBe('CLIENT');
  });
});
