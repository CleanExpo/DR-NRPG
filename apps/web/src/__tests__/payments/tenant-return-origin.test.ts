/**
 * @jest-environment node
 *
 * Review fix (round 5): white-label tenants keep their own domain on every
 * customer-facing return link. The origin comes ONLY from the signed-in user's
 * tenantId -> Tenant.domain / Tenant.subdomain in the database. Raw Host/Origin,
 * x-forwarded-host, x-tenant-* headers and client-supplied URLs for any other
 * domain fall back to the tenant/platform origin or are rejected.
 */

const mockSessionsCreate = jest.fn();
const mockPortalCreate = jest.fn();
const mockSendEmail = jest.fn();
const mockSendVerificationEmail = jest.fn();

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn(), addBreadcrumb: jest.fn() }), { virtual: true });

jest.mock('@/lib/stripe', () => ({
  __esModule: true,
  default: { checkout: { sessions: { create: (...args: unknown[]) => mockSessionsCreate(...args) } } },
}));

jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => ({
    checkout: { sessions: { create: (...args: unknown[]) => mockSessionsCreate(...args) } },
    billingPortal: { sessions: { create: (...args: unknown[]) => mockPortalCreate(...args) } },
    customers: { create: jest.fn(), search: jest.fn().mockResolvedValue({ data: [{ id: 'cus_1' }] }) },
  }))
);

const TENANTS: Record<string, { domain: string | null; subdomain: string | null; isActive: boolean }> = {
  tenant_acme: { domain: 'acme-restoration.example', subdomain: 'acme', isActive: true },
  tenant_sub: { domain: null, subdomain: 'coastal', isActive: true },
  tenant_other: { domain: 'other-tenant.example', subdomain: 'other', isActive: true },
  tenant_inactive: { domain: 'gone.example', subdomain: null, isActive: false },
  tenant_bad_domain: { domain: 'evil.example/phish', subdomain: 'bad label!', isActive: true },
};

jest.mock('@/lib/prisma', () => ({
  prisma: {
    tenant: {
      findUnique: jest.fn(({ where }: { where: { id: string } }) => Promise.resolve(TENANTS[where.id] ?? null)),
    },
    workspace: { findUnique: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
  },
}));

const mockDb = {
  serviceRequest: { findUnique: jest.fn() },
  serviceRequestCalloutPayment: { upsert: jest.fn() },
  tenant: { findUnique: jest.fn() },
};
jest.mock('@/lib/get-tenant-db', () => ({ getTenantDb: () => mockDb }));
jest.mock('@/lib/services/email.service', () => ({ sendEmail: (...args: unknown[]) => mockSendEmail(...args) }));
jest.mock('@/lib/email/resend', () => ({
  sendVerificationEmail: (...args: unknown[]) => mockSendVerificationEmail(...args),
}));

jest.mock('@/lib/auth-middleware', () => {
  const { NextResponse: MockNextResponse } = jest.requireActual('next/server');
  return {
    authenticateRequest: jest.fn(),
    requireRole: (user: { userType?: string }, roles: string[]) => roles.includes(user?.userType as string),
    unauthorizedRoleResponse: (roles: string[]) =>
      MockNextResponse.json({ error: 'FORBIDDEN', roles }, { status: 403 }),
  };
});

import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { allowedReturnUrl, getTenantReturnOrigin, getUserReturnOrigin } from '@/lib/tenant-return-origin';
import { POST as calloutCheckout } from '@/app/api/service-requests/[id]/callout/checkout/route';
import { POST as sendResumeLink } from '@/app/api/client/onboarding/send-resume-link/route';
import { POST as resendVerification } from '@/app/api/auth/resend-verification/route';

const ACME = 'https://acme-restoration.example';
const SITE = 'https://nrpg.business';

// Headers pointing at a DIFFERENT registered tenant and an attacker host.
const SPOOFED = {
  host: 'other-tenant.example',
  origin: 'https://attacker.example',
  'x-forwarded-host': 'other-tenant.example',
  'x-tenant-hostname': 'other-tenant.example',
  'x-tenant-id': 'tenant_other',
  'content-type': 'application/json',
};

const asUser = (user: Record<string, unknown>, tenantId?: string) =>
  (authenticateRequest as jest.Mock).mockResolvedValue({
    success: true,
    // context.tenantId may be header-derived; the helper must ignore it.
    context: { user, tenantId: tenantId ?? 'tenant_other' },
  });

const req = (url: string, body?: unknown) =>
  new NextRequest(url, { method: 'POST', headers: SPOOFED, body: body === undefined ? undefined : JSON.stringify(body) });

const savedEnv = { ...process.env };
beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  delete process.env.BASE_DOMAIN;
  mockSessionsCreate.mockResolvedValue({ id: 'cs_1', url: 'https://checkout.stripe.com/c/cs_1', payment_intent: null });
  mockPortalCreate.mockResolvedValue({ id: 'bps_1', url: 'https://billing.stripe.com/p/1' });
  mockSendEmail.mockResolvedValue({ success: true });
  mockSendVerificationEmail.mockResolvedValue({ success: true });
});
afterAll(() => {
  process.env = savedEnv;
});

describe('getTenantReturnOrigin (database only)', () => {
  it('uses the registered custom domain', async () => {
    expect(await getTenantReturnOrigin('tenant_acme')).toBe(ACME);
  });

  it('uses <subdomain>.<BASE_DOMAIN> for a subdomain tenant', async () => {
    process.env.BASE_DOMAIN = 'nrpg.business';
    expect(await getTenantReturnOrigin('tenant_sub')).toBe('https://coastal.nrpg.business');
  });

  it('fails closed to SITE_URL for a subdomain tenant when BASE_DOMAIN is unset or empty', async () => {
    delete process.env.BASE_DOMAIN;
    expect(await getTenantReturnOrigin('tenant_sub')).toBe(SITE);
    process.env.BASE_DOMAIN = '   ';
    expect(await getTenantReturnOrigin('tenant_sub')).toBe(SITE);
    // A custom domain does not depend on BASE_DOMAIN.
    expect(await getTenantReturnOrigin('tenant_acme')).toBe(ACME);
  });

  it('falls back to SITE_URL for no tenant, an unknown or inactive tenant, or an invalid stored host', async () => {
    expect(await getTenantReturnOrigin(null)).toBe(SITE);
    expect(await getTenantReturnOrigin('tenant_missing')).toBe(SITE);
    expect(await getTenantReturnOrigin('tenant_inactive')).toBe(SITE);
    expect(await getTenantReturnOrigin('tenant_bad_domain')).toBe(SITE);
  });

  it('reads the user’s own tenantId, nothing else', async () => {
    expect(await getUserReturnOrigin({ tenantId: 'tenant_acme' })).toBe(ACME);
    expect(await getUserReturnOrigin({ tenantId: null })).toBe(SITE);
    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { id: 'tenant_acme' },
      select: { domain: true, subdomain: true, isActive: true },
    });
  });
});

describe('allowedReturnUrl (exact-origin allow-list)', () => {
  const allowed = [ACME, SITE];
  it.each([
    'https://other-tenant.example/dashboard',
    'https://acme-restoration.example.attacker.example/x',
    'https://acme-restoration.example@attacker.example/x',
    'https://user:pw@acme-restoration.example/x',
    'http://acme-restoration.example/x',
    '//attacker.example/x',
    'javascript:alert(1)',
    'not a url',
  ])('rejects %s', (url) => {
    expect(allowedReturnUrl(url, allowed)).toBeUndefined();
  });

  it('accepts the tenant origin and SITE_URL (normalised)', () => {
    expect(allowedReturnUrl('https://acme-restoration.example/dashboard?x=1', allowed)).toBe(`${ACME}/dashboard?x=1`);
    expect(allowedReturnUrl('https://NRPG.business/pricing', allowed)).toBe(`${SITE}/pricing`);
  });
});

describe('tenant user flows stay on the registered tenant domain', () => {
  const acmeContractor = { id: 'u_acme', email: 'a@example.com', userType: 'CONTRACTOR', tenantId: 'tenant_acme' };

  async function subscribe(body: Record<string, unknown> = {}) {
    asUser(acmeContractor);
    (prisma.workspace.findUnique as jest.Mock).mockResolvedValue({
      id: 'cjld2cjxh0000qzrmn831i7rn',
      ownerId: 'u_acme',
      stripeCustomerId: 'cus_1',
      businessName: 'Acme',
    });
    // Imported after STRIPE_SECRET_KEY is set: the route builds its Stripe client at load.
    const { POST: subscriptionCheckout } = await import('@/app/api/subscription/checkout/route');
    await subscriptionCheckout(
      req('https://other-tenant.example/api/subscription/checkout', {
        workspaceId: 'cjld2cjxh0000qzrmn831i7rn',
        tier: 'PRO',
        ...body,
      })
    );
    const args = mockSessionsCreate.mock.calls[0][0];
    return [args.success_url, args.cancel_url];
  }

  it('subscription checkout defaults to the tenant domain despite spoofed headers', async () => {
    expect(await subscribe()).toEqual([
      `${ACME}/dashboard/contractor?subscription=success`,
      `${ACME}/dashboard/contractor?subscription=cancelled`,
    ]);
  });

  it('subscription checkout honours a client URL on the tenant’s own domain', async () => {
    expect(await subscribe({ successUrl: `${ACME}/done`, cancelUrl: `${ACME}/back` })).toEqual([`${ACME}/done`, `${ACME}/back`]);
  });

  it('subscription checkout rejects a client URL on a different tenant’s domain', async () => {
    const urls = await subscribe({ successUrl: 'https://other-tenant.example/done', cancelUrl: 'https://attacker.example/x' });
    expect(urls).toEqual([
      `${ACME}/dashboard/contractor?subscription=success`,
      `${ACME}/dashboard/contractor?subscription=cancelled`,
    ]);
  });

  it('callout checkout returns to the tenant domain', async () => {
    asUser({ id: 'client_acme', userType: 'CLIENT', tenantId: 'tenant_acme' });
    mockDb.serviceRequest.findUnique.mockResolvedValue({ id: 'sr_1', userId: 'client_acme', serviceTitle: 'x', status: 'PENDING' });
    await calloutCheckout(req('https://other-tenant.example/api/service-requests/sr_1/callout/checkout'), {
      params: Promise.resolve({ id: 'sr_1' }),
    });
    const args = mockSessionsCreate.mock.calls[0][0];
    expect(args.success_url.startsWith(`${ACME}/dashboard/client/callout/sr_1`)).toBe(true);
    expect(args.cancel_url.startsWith(`${ACME}/dashboard/client/callout/sr_1`)).toBe(true);
  });

  it('tenant billing portal returns to the admin’s tenant domain', async () => {
    asUser({ id: 'admin_acme', userType: 'ADMIN', tenantId: 'tenant_acme' }, 'tenant_acme');
    mockDb.tenant.findUnique.mockResolvedValue({ id: 'tenant_acme', stripeCustomerId: 'cus_acme' });
    // Imported after STRIPE_SECRET_KEY is set: tenant-subscription builds its Stripe client at load.
    const { GET: tenantPortal } = await import('@/app/api/admin/tenant-billing/portal/route');
    const res = await tenantPortal(
      new NextRequest('https://other-tenant.example/api/admin/tenant-billing/portal', { headers: SPOOFED })
    );
    expect(res.status).toBe(200);
    expect(mockPortalCreate).toHaveBeenCalledWith(expect.objectContaining({ return_url: `${ACME}/dashboard/admin/tenant-billing` }));
  });

  it('onboarding resume-link email points at the tenant domain', async () => {
    asUser({ id: 'client_acme', userType: 'CLIENT', tenantId: 'tenant_acme', name: 'C' });
    await sendResumeLink(
      req('https://other-tenant.example/api/client/onboarding/send-resume-link', { email: 'c@example.com', currentPhase: 'profile' })
    );
    const sent = JSON.stringify(mockSendEmail.mock.calls[0]);
    expect(sent).toContain(`${ACME}/dashboard/client/onboarding/profile?token=`);
    expect(sent).not.toMatch(/other-tenant\.example|attacker\.example|nrpg\.business\/dashboard/);
  });

  it('verification email link uses the tenant domain', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u_acme',
      email: 'a@example.com',
      name: 'A',
      tenantId: 'tenant_acme',
      isEmailVerified: false,
    });
    await resendVerification(req('https://other-tenant.example/api/auth/resend-verification', { email: 'a@example.com' }));
    expect(mockSendVerificationEmail).toHaveBeenCalledWith('a@example.com', expect.any(String), 'A', ACME);
  });

  describe('subdomain tenant callers with BASE_DOMAIN unset fail closed to SITE_URL', () => {
    it('Stripe: callout checkout', async () => {
      delete process.env.BASE_DOMAIN;
      asUser({ id: 'client_sub', userType: 'CLIENT', tenantId: 'tenant_sub' });
      mockDb.serviceRequest.findUnique.mockResolvedValue({ id: 'sr_3', userId: 'client_sub', serviceTitle: 'x', status: 'PENDING' });
      await calloutCheckout(req('https://other-tenant.example/api/service-requests/sr_3/callout/checkout'), {
        params: Promise.resolve({ id: 'sr_3' }),
      });
      const args = mockSessionsCreate.mock.calls[0][0];
      expect(args.success_url.startsWith(`${SITE}/dashboard/client/callout/sr_3`)).toBe(true);
      expect(args.cancel_url.startsWith(`${SITE}/dashboard/client/callout/sr_3`)).toBe(true);
      expect(JSON.stringify(args)).not.toMatch(/disasterrecovery\.com\.au/);
    });

    it('Email: verification email', async () => {
      delete process.env.BASE_DOMAIN;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'u_sub',
        email: 's@example.com',
        name: 'S',
        tenantId: 'tenant_sub',
        isEmailVerified: false,
      });
      await resendVerification(req('https://other-tenant.example/api/auth/resend-verification', { email: 's@example.com' }));
      expect(mockSendVerificationEmail).toHaveBeenCalledWith('s@example.com', expect.any(String), 'S', SITE);
    });

    it('with BASE_DOMAIN configured the same callers use the tenant subdomain', async () => {
      process.env.BASE_DOMAIN = 'nrpg.business';
      asUser({ id: 'client_sub', userType: 'CLIENT', tenantId: 'tenant_sub' });
      mockDb.serviceRequest.findUnique.mockResolvedValue({ id: 'sr_4', userId: 'client_sub', serviceTitle: 'x', status: 'PENDING' });
      await calloutCheckout(req('https://other-tenant.example/api/service-requests/sr_4/callout/checkout'), {
        params: Promise.resolve({ id: 'sr_4' }),
      });
      expect(mockSessionsCreate.mock.calls[0][0].success_url.startsWith('https://coastal.nrpg.business/')).toBe(true);
    });
  });

  it('a platform user (no tenant) gets SITE_URL even with another tenant’s headers', async () => {
    asUser({ id: 'client_p', userType: 'CLIENT', tenantId: null });
    mockDb.serviceRequest.findUnique.mockResolvedValue({ id: 'sr_2', userId: 'client_p', serviceTitle: 'x', status: 'PENDING' });
    await calloutCheckout(req('https://other-tenant.example/api/service-requests/sr_2/callout/checkout'), {
      params: Promise.resolve({ id: 'sr_2' }),
    });
    expect(mockSessionsCreate.mock.calls[0][0].success_url.startsWith(`${SITE}/dashboard/client/callout/sr_2`)).toBe(true);
  });
});
