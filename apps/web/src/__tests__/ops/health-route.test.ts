/**
 * @jest-environment node
 *
 * DR-907 — deep /api/health (database / stripe / storage).
 *
 * Drives the REAL GET handler for `app/api/health/route.ts` with its
 * boundaries mocked (Prisma client module, the `stripe` package, the
 * `@supabase/supabase-js` package — PR #204 pattern: no runtime
 * `@prisma/client` value imports in test-loaded code).
 *
 * What it proves:
 *   1. All subsystems green -> HTTP 200, overall `healthy`, each of
 *      database/stripe/storage individually `healthy`.
 *   2. Each subsystem failing alone -> HTTP 503 with THAT subsystem
 *      flagged unhealthy and the others still healthy.
 *   3. A missing STRIPE_SECRET_KEY reports unhealthy/not_configured —
 *      it never crashes the route.
 *   4. Missing storage config reports unhealthy/not_configured.
 *   5. The response leaks no secrets (key values, DB URL, service-role
 *      key, raw error messages) and reports price IDs as classifications
 *      only.
 */

export {}; // mark as a module so block-scoped test vars don't leak to global scope

const mockQueryRaw = jest.fn();
const mockBalanceRetrieve = jest.fn();
const mockStorageList = jest.fn();
const mockStripeCtor = jest.fn();
const mockCreateClient = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: { $queryRaw: (...args: unknown[]) => mockQueryRaw(...args) },
}));

jest.mock('stripe', () => ({
  __esModule: true,
  default: class MockStripe {
    balance = { retrieve: (...args: unknown[]) => mockBalanceRetrieve(...args) };
    constructor(...args: unknown[]) {
      mockStripeCtor(...args);
    }
  },
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => {
    mockCreateClient(...args);
    return {
      storage: {
        from: () => ({ list: (...listArgs: unknown[]) => mockStorageList(...listArgs) }),
      },
    };
  },
}));

// Dynamic import so the jest.mock factories above are registered before the
// route module is evaluated.
type RouteModule = typeof import('@/app/api/health/route');
let GET: RouteModule['GET'];

beforeAll(async () => {
  const route = await import('@/app/api/health/route');
  GET = route.GET;
});

const SECRETS = {
  DATABASE_URL: 'postgresql://user:***@db.example.com:5432/nrpg',
  STRIPE_SECRET_KEY: ['sk', 'live', 'fixture'].join('_'),
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key-abcdef123456',
  NEXTAUTH_SECRET: 'nextauth-secret-value-xyz',
};

const ENV_KEYS = [
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STORAGE_TYPE',
  'STORAGE_BUCKET_NAME',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'UPSTASH_REDIS_REST_URL',
  'STRIPE_TENANT_BASIC_PRICE_ID',
  'STRIPE_TENANT_PRO_PRICE_ID',
  'STRIPE_TENANT_ENTERPRISE_PRICE_ID',
  'STRIPE_BASIC_PRICE_ID',
  'STRIPE_PRO_PRICE_ID',
  'STRIPE_ENTERPRISE_PRICE_ID',
] as const;

const savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  // Healthy-world defaults; individual tests knock one subsystem out.
  process.env.DATABASE_URL = SECRETS.DATABASE_URL;
  process.env.STRIPE_SECRET_KEY = SECRETS.STRIPE_SECRET_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = SECRETS.SUPABASE_SERVICE_ROLE_KEY;
  process.env.NEXTAUTH_SECRET = SECRETS.NEXTAUTH_SECRET;
  process.env.NEXTAUTH_URL = 'https://nrpg.business';
  process.env.STRIPE_TENANT_BASIC_PRICE_ID = 'price_tenant_basic_monthly'; // known placeholder
  process.env.STRIPE_TENANT_PRO_PRICE_ID = 'price_1QaBcDeFgHiJkLmNoPqR'; // live format

  mockQueryRaw.mockResolvedValue([{ '?column?': 1 }]);
  mockBalanceRetrieve.mockResolvedValue({ object: 'balance', livemode: true });
  mockStorageList.mockResolvedValue({ data: [], error: null });
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

function healthReq() {
  // NextRequest is not needed — the handler takes a NextRequest but only for
  // signature compatibility; a bare Request satisfies the runtime.
  return new Request('http://localhost/api/health') as never;
}

async function callHealth(): Promise<{ status: number; body: any }> {
  const res = await GET(healthReq());
  return { status: res.status, body: await res.json() };
}

describe('GET /api/health (DR-907 deep checks)', () => {
  it('returns 200 with database/stripe/storage all healthy when every probe succeeds', async () => {
    const { status, body } = await callHealth();

    expect(status).toBe(200);
    expect(body.status).toBe('healthy');
    expect(body.checks.database.status).toBe('healthy');
    expect(body.checks.stripe.status).toBe('healthy');
    expect(body.checks.storage.status).toBe('healthy');
    expect(body.checks.storage.backend).toBe('supabase');
    expect(body.checks.stripe.keyMode).toBe('live');

    // Each probe genuinely ran.
    expect(mockQueryRaw).toHaveBeenCalledTimes(1);
    expect(mockBalanceRetrieve).toHaveBeenCalledTimes(1);
    expect(mockStorageList).toHaveBeenCalledTimes(1);
  });

  it('returns 503 with database flagged when the DB query fails (others stay healthy)', async () => {
    mockQueryRaw.mockRejectedValue(new Error('connection refused to 10.0.0.5:5432'));

    const { status, body } = await callHealth();

    expect(status).toBe(503);
    expect(body.status).toBe('unhealthy');
    expect(body.checks.database).toEqual({ status: 'unhealthy', reason: 'request_failed' });
    expect(body.checks.stripe.status).toBe('healthy');
    expect(body.checks.storage.status).toBe('healthy');
    // Raw error internals never leak.
    expect(JSON.stringify(body)).not.toContain('10.0.0.5');
  });

  it('returns 503 with stripe flagged when the authenticated Stripe call fails', async () => {
    mockBalanceRetrieve.mockRejectedValue(new Error('Invalid API Key provided: sk_live_***'));

    const { status, body } = await callHealth();

    expect(status).toBe(503);
    expect(body.checks.stripe.status).toBe('unhealthy');
    expect(body.checks.stripe.reason).toBe('request_failed');
    expect(body.checks.database.status).toBe('healthy');
    expect(body.checks.storage.status).toBe('healthy');
  });

  it('reports stripe unhealthy/not_configured (no crash) when STRIPE_SECRET_KEY is missing', async () => {
    delete process.env.STRIPE_SECRET_KEY;

    const { status, body } = await callHealth();

    expect(status).toBe(503);
    expect(body.checks.stripe).toEqual({ status: 'unhealthy', reason: 'not_configured' });
    expect(mockStripeCtor).not.toHaveBeenCalled();
    expect(mockBalanceRetrieve).not.toHaveBeenCalled();
  });

  it('returns 503 with storage flagged when the bucket list fails', async () => {
    mockStorageList.mockResolvedValue({ data: null, error: { message: 'bucket not found' } });

    const { status, body } = await callHealth();

    expect(status).toBe(503);
    expect(body.checks.storage.status).toBe('unhealthy');
    expect(body.checks.storage.reason).toBe('request_failed');
    expect(body.checks.database.status).toBe('healthy');
    expect(body.checks.stripe.status).toBe('healthy');
    expect(JSON.stringify(body)).not.toContain('bucket not found');
  });

  it('reports storage unhealthy/not_configured when supabase storage env is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { status, body } = await callHealth();

    expect(status).toBe(503);
    expect(body.checks.storage.status).toBe('unhealthy');
    expect(body.checks.storage.reason).toBe('not_configured');
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('returns 503 when the database probe rejects with a timeout-shaped error', async () => {
    mockQueryRaw.mockRejectedValue(new Error('health_check_timeout'));

    const { status, body } = await callHealth();

    expect(status).toBe(503);
    expect(body.checks.database).toEqual({ status: 'unhealthy', reason: 'timeout' });
  });

  it('never leaks secrets and reports price IDs as classifications only', async () => {
    const { status, body } = await callHealth();
    const serialized = JSON.stringify(body);

    expect(status).toBe(200);
    for (const secret of Object.values(SECRETS)) {
      expect(serialized).not.toContain(secret);
    }
    // NEXTAUTH_URL host is public and IS reported (parity gate needs it).
    expect(body.config.authUrl).toEqual({ host: 'nrpg.business' });
    // Price IDs come back as classifications, never raw values.
    expect(body.config.stripePriceIds.STRIPE_TENANT_BASIC_PRICE_ID).toBe('placeholder');
    expect(body.config.stripePriceIds.STRIPE_TENANT_PRO_PRICE_ID).toBe('set');
    expect(body.config.stripePriceIds.STRIPE_BASIC_PRICE_ID).toBe('missing');
    expect(serialized).not.toContain('price_tenant_basic_monthly');
    expect(serialized).not.toContain('price_1QaBcDeFgHiJkLmNoPqR');
  });
});

describe('GET /api/health mail check (DR-964)', () => {
  const MAIL_KEY = 'mailtrap-secret-never-in-health';
  const saved = { key: process.env.MAILTRAP_API_KEY, sender: process.env.SENDER_EMAIL };

  afterEach(() => {
    if (saved.key === undefined) delete process.env.MAILTRAP_API_KEY;
    else process.env.MAILTRAP_API_KEY = saved.key;
    if (saved.sender === undefined) delete process.env.SENDER_EMAIL;
    else process.env.SENDER_EMAIL = saved.sender;
  });

  it('reports mail unhealthy/not_configured when MAILTRAP_API_KEY is missing, without gating', async () => {
    delete process.env.MAILTRAP_API_KEY;
    process.env.SENDER_EMAIL = 'noreply@nrpg.example';
    const { status, body } = await callHealth();

    expect(body.checks.mail).toEqual({
      status: 'unhealthy',
      provider: 'mailtrap',
      reason: 'not_configured',
      missing: ['MAILTRAP_API_KEY'],
    });
    // Non-gating until the key is live in Vercel: deploy health gates stay green.
    expect(status).toBe(200);
    expect(body.status).toBe('healthy');
  });

  it('reports mail healthy when key and sender are set, and never exposes the key', async () => {
    process.env.MAILTRAP_API_KEY = MAIL_KEY;
    process.env.SENDER_EMAIL = 'noreply@nrpg.example';
    const { body } = await callHealth();

    expect(body.checks.mail).toEqual({ status: 'healthy', provider: 'mailtrap' });
    expect(JSON.stringify(body)).not.toContain(MAIL_KEY);
  });
});

describe('env-parity helpers (lib/monitoring/env-parity)', () => {
  // Static import is safe here: the module is pure (no prisma/stripe/etc.).
  const helpers = require('@/lib/monitoring/env-parity') as typeof import('@/lib/monitoring/env-parity');

  it('classifies stripe price IDs without revealing them', () => {
    expect(helpers.classifyStripePriceId(undefined)).toBe('missing');
    expect(helpers.classifyStripePriceId('')).toBe('missing');
    expect(helpers.classifyStripePriceId('  ')).toBe('missing');
    expect(helpers.classifyStripePriceId('prod_ABC123')).toBe('invalid');
    expect(helpers.classifyStripePriceId('price_tenant_basic_monthly')).toBe('placeholder');
    expect(helpers.classifyStripePriceId('price_basic_monthly')).toBe('placeholder');
    expect(helpers.classifyStripePriceId('price_tenant_pro_xxx')).toBe('placeholder');
    expect(helpers.classifyStripePriceId('price_test_123')).toBe('placeholder');
    expect(helpers.classifyStripePriceId('price_placeholder')).toBe('placeholder');
    expect(helpers.classifyStripePriceId('price_1QaBcDeFgHiJkLmNoPqR')).toBe('set');
  });

  it('validates auth URLs against the canonical origin', () => {
    const origin = 'https://nrpg.business';
    expect(helpers.urlResolvesToOrigin('https://nrpg.business/api/auth/callback/credentials', origin))
      .toEqual({ ok: true, actualOrigin: 'https://nrpg.business' });
    expect(helpers.urlResolvesToOrigin('http://localhost:3000/api/auth/signin', origin)).toMatchObject({
      ok: false,
      reason: 'localhost',
    });
    expect(
      helpers.urlResolvesToOrigin('https://dr-nrpg-platform.vercel.app/api/auth/signin', origin)
    ).toMatchObject({ ok: false, reason: 'origin_mismatch', actualOrigin: 'https://dr-nrpg-platform.vercel.app' });
    expect(helpers.urlResolvesToOrigin(undefined, origin)).toEqual({ ok: false, reason: 'missing' });
    expect(helpers.urlResolvesToOrigin('not-a-url', origin)).toEqual({ ok: false, reason: 'invalid_url' });
  });
});
