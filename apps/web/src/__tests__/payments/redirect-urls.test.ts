/**
 * @jest-environment node
 *
 * Review fix (round 4): customer-facing Stripe URLs (success, cancel, product
 * images) are built from the fixed SITE_URL. Neither an absent nor a poisoned
 * NEXT_PUBLIC_BASE_URL / NEXT_PUBLIC_APP_URL, nor a spoofed Host/Origin, nor a
 * client-supplied off-site return URL can change them.
 */

const mockSessionsCreate = jest.fn();
const mockCustomersCreate = jest.fn();

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn(), addBreadcrumb: jest.fn() }), { virtual: true });

jest.mock('@/lib/stripe', () => ({
  __esModule: true,
  default: { checkout: { sessions: { create: (...args: unknown[]) => mockSessionsCreate(...args) } } },
}));

// app/api/subscription/checkout constructs its own Stripe client.
jest.mock('stripe', () =>
  jest.fn().mockImplementation(() => ({
    checkout: { sessions: { create: (...args: unknown[]) => mockSessionsCreate(...args) } },
    customers: { create: (...args: unknown[]) => mockCustomersCreate(...args) },
  }))
);

jest.mock('@/lib/printful/products', () => ({
  getProductById: () => ({
    id: 'tee',
    name: 'NRPG Tee',
    description: 'Cotton tee',
    basePrice: 40,
    mockupImage: '/images/store/tee.png',
    variants: [{ id: 'v1', name: 'M', inStock: true, priceAdjustment: 0, printfulVariantId: 1 }],
  }),
}));

const mockDb = {
  serviceRequest: { findUnique: jest.fn() },
  serviceRequestCalloutPayment: { upsert: jest.fn() },
};
jest.mock('@/lib/get-tenant-db', () => ({ getTenantDb: () => mockDb }));

jest.mock('@/lib/prisma', () => ({
  prisma: { workspace: { findUnique: jest.fn(), update: jest.fn() } },
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

const SITE = 'https://nrpg.business/';
const SPOOFED_HEADERS = {
  host: 'attacker.example',
  origin: 'https://attacker.example',
  'x-forwarded-host': 'attacker.example',
  'content-type': 'application/json',
};
const ENV_KEYS = ['NEXT_PUBLIC_BASE_URL', 'NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_SITE_URL', 'STRIPE_SECRET_KEY'] as const;
const saved: Record<string, string | undefined> = {};

beforeAll(() => {
  for (const key of ENV_KEYS) saved[key] = process.env[key];
});
afterAll(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  mockSessionsCreate.mockResolvedValue({ id: 'cs_1', url: 'https://checkout.stripe.com/c/cs_1', payment_intent: null });
});

/** The Stripe URLs a session was created with (redirects + product images). */
function stripeUrls(): string[] {
  const args = mockSessionsCreate.mock.calls[0][0];
  const images = (args.line_items ?? []).flatMap(
    (item: { price_data?: { product_data?: { images?: string[] } } }) => item.price_data?.product_data?.images ?? []
  );
  return [args.success_url, args.cancel_url, ...images];
}

// Each scenario re-imports the route so module-level constants see the poisoned env.
const ENV_SCENARIOS: Array<[string, string | undefined]> = [
  ['absent', undefined],
  ['www host', 'https://www.nrpg.business'],
  ['sibling host', 'https://disasterrecovery.com.au'],
  ['attacker host', 'https://attacker.example'],
];

function setEnv(value: string | undefined) {
  for (const key of ['NEXT_PUBLIC_BASE_URL', 'NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_SITE_URL'] as const) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

describe('store checkout Stripe URLs', () => {
  it.each(ENV_SCENARIOS)('stay on the canonical site with NEXT_PUBLIC_BASE_URL %s', async (_label, value) => {
    setEnv(value);
    let POST!: (req: NextRequest) => Promise<Response>;
    await jest.isolateModulesAsync(async () => {
      POST = (await import('@/app/api/store/checkout/route')).POST;
    });
    const res = await POST(
      new NextRequest('https://attacker.example/api/store/checkout', {
        method: 'POST',
        headers: SPOOFED_HEADERS,
        body: JSON.stringify({
          items: [{ productId: 'tee', variantId: 'v1', quantity: 1 }],
          recipient: { name: 'A', address: '1 St', city: 'C', state: 'QLD', postcode: '4000', country: 'AU' },
        }),
      })
    );
    expect(res.status).toBe(200);
    const urls = stripeUrls();
    expect(urls).toHaveLength(3);
    for (const url of urls) expect(url.startsWith(SITE)).toBe(true);
    expect(urls[0]).toBe('https://nrpg.business/store/order-success?session_id={CHECKOUT_SESSION_ID}');
    expect(urls[1]).toBe('https://nrpg.business/store/cart');
  });
});

describe('callout checkout Stripe URLs', () => {
  it.each(ENV_SCENARIOS)('ignore a spoofed Host/Origin (env %s)', async (_label, value) => {
    setEnv(value);
    (authenticateRequest as jest.Mock).mockResolvedValue({
      success: true,
      context: { user: { id: 'client_1', userType: 'CLIENT' } },
    });
    mockDb.serviceRequest.findUnique.mockResolvedValue({ id: 'sr_1', userId: 'client_1', serviceTitle: 'x', status: 'PENDING' });
    let POST!: (req: NextRequest, props: { params: Promise<{ id: string }> }) => Promise<Response>;
    await jest.isolateModulesAsync(async () => {
      POST = (await import('@/app/api/service-requests/[id]/callout/checkout/route')).POST;
    });
    const res = await POST(
      new NextRequest('https://attacker.example/api/service-requests/sr_1/callout/checkout', {
        method: 'POST',
        headers: SPOOFED_HEADERS,
      }),
      { params: Promise.resolve({ id: 'sr_1' }) }
    );
    expect(res.status).toBe(200);
    for (const url of stripeUrls()) expect(url.startsWith(`${SITE}dashboard/client/callout/sr_1`)).toBe(true);
  });
});

describe('subscription checkout Stripe URLs', () => {
  async function post(body: Record<string, unknown>, value: string | undefined) {
    setEnv(value);
    (authenticateRequest as jest.Mock).mockResolvedValue({
      success: true,
      context: { user: { id: 'owner_1', email: 'o@example.com', userType: 'CONTRACTOR' } },
    });
    (prisma.workspace.findUnique as jest.Mock).mockResolvedValue({
      id: 'cjld2cjxh0000qzrmn831i7rn',
      ownerId: 'owner_1',
      stripeCustomerId: 'cus_1',
      businessName: 'B',
    });
    let POST!: (req: NextRequest) => Promise<Response>;
    await jest.isolateModulesAsync(async () => {
      POST = (await import('@/app/api/subscription/checkout/route')).POST;
    });
    return POST(
      new NextRequest('https://attacker.example/api/subscription/checkout', {
        method: 'POST',
        headers: SPOOFED_HEADERS,
        body: JSON.stringify({ workspaceId: 'cjld2cjxh0000qzrmn831i7rn', tier: 'PRO', ...body }),
      })
    );
  }

  it.each(ENV_SCENARIOS)('default to the canonical site (env %s)', async (_label, value) => {
    await post({}, value);
    for (const url of stripeUrls()) expect(url.startsWith(`${SITE}dashboard/contractor`)).toBe(true);
  });

  it('rejects client-supplied off-site return URLs (open redirect)', async () => {
    await post({ successUrl: 'https://attacker.example/ok', cancelUrl: 'https://nrpg.business.attacker.example/x' }, undefined);
    for (const url of stripeUrls()) expect(url.startsWith(`${SITE}dashboard/contractor`)).toBe(true);
  });

  it('honours client-supplied return URLs on the canonical site', async () => {
    await post({ successUrl: 'https://nrpg.business/dashboard/x?ok=1', cancelUrl: 'https://nrpg.business/pricing' }, undefined);
    expect(stripeUrls()).toEqual(['https://nrpg.business/dashboard/x?ok=1', 'https://nrpg.business/pricing']);
  });
});
