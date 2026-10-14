/**
 * @jest-environment node
 *
 * Wave 1 NRPG certification checkout:
 * - POST /api/training/certification/checkout: auth, role, fail-closed when
 *   Stripe/price env is unset, already-paid guard, session + pending row.
 * - GET same path: configured/paid status.
 * - Stripe webhook: a paid NRPG_CERTIFICATION session marks the payment paid.
 * - Training access gate: unchanged while unconfigured; paywalled once configured.
 */

const mockSessionsCreate = jest.fn();
const mockListLineItems = jest.fn();
const mockConstructWebhookEvent = jest.fn();

jest.mock('@/lib/stripe', () => ({
  __esModule: true,
  default: {
    checkout: {
      sessions: {
        create: (...args: unknown[]) => mockSessionsCreate(...args),
        listLineItems: (...args: unknown[]) => mockListLineItems(...args),
      },
    },
  },
  constructWebhookEvent: (...args: unknown[]) => mockConstructWebhookEvent(...args),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    onboardingPayment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    nRPGTrainingProgress: { findFirst: jest.fn() },
    contractorCertification: { findFirst: jest.fn() },
  },
}));

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn(), addBreadcrumb: jest.fn() }), { virtual: true });

jest.mock('@/lib/auth-middleware', () => {
  const { NextResponse: MockNextResponse } = jest.requireActual('next/server');
  return {
    authenticateRequest: jest.fn(),
    // Real role semantics, minus the prisma/next-auth import chain.
    requireRole: (user: { userType?: string }, roles: string[]) =>
      roles.includes(user?.userType as string),
    unauthorizedRoleResponse: (roles: string[]) =>
      MockNextResponse.json(
        { error: 'FORBIDDEN', message: `Access denied. Required roles: ${roles.join(', ')}` },
        { status: 403 }
      ),
  };
});

jest.mock('@/src/lib/stripe/webhook-idempotency');
jest.mock('@/lib/printful/sync', () => ({ createPrintfulOrder: jest.fn() }));
jest.mock('@/lib/printful/products', () => ({ getProductById: jest.fn() }));

import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/training/certification/checkout/route';
import { POST as webhookPOST } from '@/app/api/stripe/webhook/route';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import * as webhookIdempotency from '@/src/lib/stripe/webhook-idempotency';
import { certificationAccessDenied } from '@/lib/training/certification-payment';

const mockAuth = authenticateRequest as jest.Mock;
const payments = prisma.onboardingPayment as unknown as Record<'findFirst' | 'create' | 'updateMany', jest.Mock>;

const contractor = { id: 'user_contractor_1', userType: 'CONTRACTOR' };
const asUser = (user: Record<string, unknown>) =>
  mockAuth.mockResolvedValue({ success: true, context: { user } });

const checkoutRequest = (method: 'GET' | 'POST', query = '') =>
  new NextRequest(`https://nrpg.business/api/training/certification/checkout${query}`, { method });

const progress = prisma.nRPGTrainingProgress as unknown as Record<'findFirst', jest.Mock>;
const certifications = prisma.contractorCertification as unknown as Record<'findFirst', jest.Mock>;

const ENV_KEYS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_NRPG_CERTIFICATION_PRICE_ID',
  'STRIPE_WEBHOOK_SECRET',
  'NRPG_CERTIFICATION_PAYWALL_ACTIVATED_AT',
] as const;
const ACTIVATED_AT = '2026-11-01T00:00:00.000Z';
const savedEnv: Record<string, string | undefined> = {};

function configureCheckout() {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  process.env.STRIPE_NRPG_CERTIFICATION_PRICE_ID = 'price_test_cert';
}

beforeAll(() => {
  for (const key of ENV_KEYS) savedEnv[key] = process.env[key];
});

afterAll(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

beforeEach(() => {
  jest.clearAllMocks();
  for (const key of ENV_KEYS) delete process.env[key];
  payments.findFirst.mockResolvedValue(null);
  payments.create.mockResolvedValue({});
  payments.updateMany.mockResolvedValue({ count: 1 });
  progress.findFirst.mockResolvedValue(null);
  certifications.findFirst.mockResolvedValue(null);
  mockListLineItems.mockResolvedValue({ data: [{ price: { id: 'price_test_cert' } }] });
  (webhookIdempotency.isEventProcessed as jest.Mock).mockResolvedValue(false);
  (webhookIdempotency.recordWebhookEvent as jest.Mock).mockResolvedValue(undefined);
});

describe('POST /api/training/certification/checkout', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValue({
      success: false,
      response: NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }),
    });
    const res = await POST(checkoutRequest('POST'));
    expect(res.status).toBe(401);
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it('returns 403 for a non-contractor', async () => {
    configureCheckout();
    asUser({ id: 'user_client_1', userType: 'CLIENT' });
    const res = await POST(checkoutRequest('POST'));
    expect(res.status).toBe(403);
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it('fails closed with 503 when the price ID is unset', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    asUser(contractor);
    const res = await POST(checkoutRequest('POST'));
    expect(res.status).toBe(503);
    expect((await res.json()).message).toMatch(/not available/i);
    expect(mockSessionsCreate).not.toHaveBeenCalled();
    expect(payments.create).not.toHaveBeenCalled();
  });

  it('fails closed with 503 when the Stripe key is unset', async () => {
    process.env.STRIPE_NRPG_CERTIFICATION_PRICE_ID = 'price_test_cert';
    asUser(contractor);
    const res = await POST(checkoutRequest('POST'));
    expect(res.status).toBe(503);
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it('returns 409 when the certification is already paid', async () => {
    configureCheckout();
    asUser(contractor);
    payments.findFirst.mockResolvedValue({ id: 'pay_1' });
    const res = await POST(checkoutRequest('POST'));
    expect(res.status).toBe(409);
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it('creates a Checkout session from the env price and records a pending payment', async () => {
    configureCheckout();
    asUser(contractor);
    mockSessionsCreate.mockResolvedValue({
      id: 'cs_test_1',
      url: 'https://checkout.stripe.com/c/pay/cs_test_1',
      amount_total: 12345,
      currency: 'aud',
      payment_intent: null,
    });

    const res = await POST(checkoutRequest('POST'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, url: 'https://checkout.stripe.com/c/pay/cs_test_1', sessionId: 'cs_test_1' });
    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        line_items: [{ price: 'price_test_cert', quantity: 1 }],
        metadata: { type: 'NRPG_CERTIFICATION', contractorId: contractor.id },
      })
    );
    expect(payments.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        contractorId: contractor.id,
        stripeSessionId: 'cs_test_1',
        amount: 12345,
        status: 'pending',
      }),
    });
  });
});

describe('GET /api/training/certification/checkout', () => {
  it('reports not configured and unpaid when env is unset', async () => {
    asUser(contractor);
    const res = await GET(checkoutRequest('GET'));
    expect(await res.json()).toEqual({ success: true, configured: false, paid: false, sessionPaid: false });
  });

  it('reports configured and paid', async () => {
    configureCheckout();
    asUser(contractor);
    payments.findFirst.mockResolvedValue({ id: 'pay_1' });
    const res = await GET(checkoutRequest('GET'));
    expect(await res.json()).toMatchObject({ success: true, configured: true, paid: true });
  });

  it('confirms a returned session only if it is this contractor’s paid session', async () => {
    configureCheckout();
    asUser(contractor);
    payments.findFirst.mockImplementation(({ where }: { where: Record<string, unknown> }) =>
      Promise.resolve(where.stripeSessionId === 'cs_mine' || !where.stripeSessionId ? { id: 'pay_1' } : null)
    );

    const mine = await (await GET(checkoutRequest('GET', '?session_id=cs_mine'))).json();
    expect(mine.sessionPaid).toBe(true);

    const other = await (await GET(checkoutRequest('GET', '?session_id=cs_invented'))).json();
    expect(other).toMatchObject({ paid: true, sessionPaid: false });
    expect(payments.findFirst).toHaveBeenCalledWith({
      where: { contractorId: contractor.id, stripeSessionId: 'cs_invented', status: 'paid' },
      select: { id: true },
    });
  });
});

describe('Stripe webhook: certification session', () => {
  const webhookRequest = () =>
    new NextRequest('https://nrpg.business/api/stripe/webhook', {
      method: 'POST',
      body: '{}',
      headers: { 'stripe-signature': 'sig_test' },
    });

  const completed = (session: Record<string, unknown>, id = 'evt_cert_1') => ({
    id,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_1',
        mode: 'payment',
        payment_status: 'paid',
        amount_total: 12345,
        currency: 'aud',
        payment_intent: 'pi_test_1',
        client_reference_id: contractor.id,
        metadata: { type: 'NRPG_CERTIFICATION', contractorId: contractor.id },
        ...session,
      },
    },
  });

  const pendingRow = (overrides: Record<string, unknown> = {}) => ({
    id: 'pay_pending_1',
    contractorId: contractor.id,
    status: 'pending',
    amount: 12345,
    currency: 'aud',
    ...overrides,
  });

  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    configureCheckout();
    payments.findFirst.mockResolvedValue(pendingRow());
  });

  function expectNoEntitlement() {
    expect(payments.updateMany).not.toHaveBeenCalled();
    expect(payments.create).not.toHaveBeenCalled();
  }

  it('rejects an invalid signature without touching payments', async () => {
    mockConstructWebhookEvent.mockImplementation(() => {
      throw new Error('bad signature');
    });
    const res = await webhookPOST(webhookRequest());
    expect(res.status).toBe(400);
    expectNoEntitlement();
  });

  it('marks the server-created pending payment paid', async () => {
    mockConstructWebhookEvent.mockReturnValue(completed({}));
    const res = await webhookPOST(webhookRequest());
    expect(res.status).toBe(200);
    expect(mockListLineItems).toHaveBeenCalledWith('cs_test_1', { limit: 10 });
    expect(payments.updateMany).toHaveBeenCalledWith({
      where: { id: 'pay_pending_1', status: { not: 'paid' } },
      data: expect.objectContaining({ status: 'paid', stripePaymentIntentId: 'pi_test_1' }),
    });
    expect(payments.create).not.toHaveBeenCalled();
  });

  it('ignores an unknown session (no server-created row) and grants nothing', async () => {
    mockConstructWebhookEvent.mockReturnValue(completed({}));
    payments.findFirst.mockResolvedValue(null);
    const res = await webhookPOST(webhookRequest());
    expect(res.status).toBe(200);
    expectNoEntitlement();
  });

  it('ignores a session whose line item is not the certification price', async () => {
    mockConstructWebhookEvent.mockReturnValue(completed({}));
    mockListLineItems.mockResolvedValue({ data: [{ price: { id: 'price_something_else' } }] });
    await webhookPOST(webhookRequest());
    expectNoEntitlement();
  });

  it('ignores a session with extra line items', async () => {
    mockConstructWebhookEvent.mockReturnValue(completed({}));
    mockListLineItems.mockResolvedValue({
      data: [{ price: { id: 'price_test_cert' } }, { price: { id: 'price_other' } }],
    });
    await webhookPOST(webhookRequest());
    expectNoEntitlement();
  });

  it('ignores an amount or currency that differs from the server-created session', async () => {
    mockConstructWebhookEvent.mockReturnValue(completed({ amount_total: 1 }));
    await webhookPOST(webhookRequest());
    mockConstructWebhookEvent.mockReturnValue(completed({ currency: 'usd' }, 'evt_cert_2'));
    await webhookPOST(webhookRequest());
    expectNoEntitlement();
  });

  it('ignores an unpaid session', async () => {
    mockConstructWebhookEvent.mockReturnValue(completed({ payment_status: 'unpaid' }));
    await webhookPOST(webhookRequest());
    expectNoEntitlement();
  });

  it('ignores a non-payment mode session', async () => {
    mockConstructWebhookEvent.mockReturnValue(completed({ mode: 'subscription' }));
    await webhookPOST(webhookRequest());
    expectNoEntitlement();
  });

  it('ignores a session whose metadata names a different contractor than the row', async () => {
    mockConstructWebhookEvent.mockReturnValue(
      completed({
        client_reference_id: 'user_attacker',
        metadata: { type: 'NRPG_CERTIFICATION', contractorId: 'user_attacker' },
      })
    );
    await webhookPOST(webhookRequest());
    expectNoEntitlement();
  });

  it('ignores a client_reference_id that differs from metadata', async () => {
    mockConstructWebhookEvent.mockReturnValue(completed({ client_reference_id: 'user_other' }));
    await webhookPOST(webhookRequest());
    expectNoEntitlement();
  });

  it('is a no-op when the session is already paid (replay with a new event id)', async () => {
    mockConstructWebhookEvent.mockReturnValue(completed({}, 'evt_cert_replay'));
    payments.findFirst.mockResolvedValue(pendingRow({ status: 'paid' }));
    await webhookPOST(webhookRequest());
    expectNoEntitlement();
  });

  it('skips an already-processed event id', async () => {
    mockConstructWebhookEvent.mockReturnValue(completed({}));
    (webhookIdempotency.isEventProcessed as jest.Mock).mockResolvedValue(true);
    await webhookPOST(webhookRequest());
    expectNoEntitlement();
  });

  it('logs ignored sessions without personal information', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockConstructWebhookEvent.mockReturnValue(completed({ customer_details: { email: 'pat@example.com', name: 'Pat' } }));
    payments.findFirst.mockResolvedValue(null);
    await webhookPOST(webhookRequest());
    expect(warn).toHaveBeenCalledWith('[certification:webhook] ignored session', 'cs_test_1', 'unknown session');
    expect(JSON.stringify(warn.mock.calls)).not.toMatch(/pat@example\.com|Pat/);
  });
});

describe('certificationAccessDenied (training gate)', () => {
  function activatePaywall() {
    configureCheckout();
    process.env.NRPG_CERTIFICATION_PAYWALL_ACTIVATED_AT = ACTIVATED_AT;
  }

  it('leaves access unchanged while checkout is unconfigured', async () => {
    process.env.NRPG_CERTIFICATION_PAYWALL_ACTIVATED_AT = ACTIVATED_AT;
    expect(await certificationAccessDenied(contractor as never)).toBeNull();
    expect(payments.findFirst).not.toHaveBeenCalled();
  });

  it('does not enforce the paywall without a recorded cut-off', async () => {
    configureCheckout();
    expect(await certificationAccessDenied(contractor as never)).toBeNull();
    process.env.NRPG_CERTIFICATION_PAYWALL_ACTIVATED_AT = 'not-a-date';
    expect(await certificationAccessDenied(contractor as never)).toBeNull();
  });

  it('returns 402 for a new contractor with no pre-cut-off training', async () => {
    activatePaywall();
    const res = await certificationAccessDenied(contractor as never);
    expect(res?.status).toBe(402);
    expect(progress.findFirst).toHaveBeenCalledWith({
      where: { contractorId: contractor.id, createdAt: { lt: new Date(ACTIVATED_AT) } },
      select: { id: true },
    });
  });

  it('grandfathers a contractor with in-progress training from before the cut-off', async () => {
    activatePaywall();
    progress.findFirst.mockResolvedValue({ id: 'progress_1' });
    expect(await certificationAccessDenied(contractor as never)).toBeNull();
  });

  it('grandfathers a contractor who completed certification before the cut-off', async () => {
    activatePaywall();
    certifications.findFirst.mockResolvedValue({ id: 'cert_1' });
    expect(await certificationAccessDenied(contractor as never)).toBeNull();
    expect(certifications.findFirst).toHaveBeenCalledWith({
      where: {
        contractorId: contractor.id,
        certificationName: 'NRP Contractor Certification',
        createdAt: { lt: new Date(ACTIVATED_AT) },
      },
      select: { id: true },
    });
  });

  it('allows a paid contractor', async () => {
    activatePaywall();
    payments.findFirst.mockResolvedValue({ id: 'pay_1' });
    expect(await certificationAccessDenied(contractor as never)).toBeNull();
  });

  it('allows admins without payment', async () => {
    activatePaywall();
    expect(await certificationAccessDenied({ id: 'admin_1', userType: 'ADMIN' } as never)).toBeNull();
  });
});
