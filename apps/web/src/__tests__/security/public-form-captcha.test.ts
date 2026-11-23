/**
 * @jest-environment node
 *
 * DR-955: public form routes must refuse a submission that carries no CAPTCHA
 * token (they used to skip the check entirely), and the hCaptcha secret is read
 * from one canonical env var (HCAPTCHA_SECRET) with HCAPTCHA_SECRET_KEY as a
 * deprecated fallback.
 *
 * hCaptcha's siteverify endpoint is mocked through global fetch. Every Prisma
 * call rejects, so a request that gets past the CAPTCHA check ends in a 500 from
 * the database step, which is how "passes the CAPTCHA" is observed here.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => {
  const reject = () => Promise.reject(new Error('db unavailable in test'));
  const model = new Proxy({}, { get: () => reject });
  const client = new Proxy({}, { get: () => model });
  return { prisma: client, basePrisma: client };
});

jest.mock('@prisma/client', () => {
  const reject = () => Promise.reject(new Error('db unavailable in test'));
  const model = new Proxy({}, { get: () => reject });
  return {
    Prisma: { PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {} },
    PrismaClient: function PrismaClient() {
      return new Proxy({}, { get: () => model });
    },
  };
});

jest.mock('@/lib/api/rate-limit', () => ({
  rateLimit: () => async () => null,
  strictRateLimit: async () => null,
}));

jest.mock('@/lib/email/resend', () => ({
  sendLeadConfirmationEmail: async () => undefined,
  sendNewsletterWelcomeEmail: async () => undefined,
}));

jest.mock('@/lib/crm/lead-bridge', () => ({ bridgeLeadToCrm: async () => undefined }));

import { POST as leadCapture } from '@/app/api/public/lead-capture/route';
import { POST as contractorInquiry } from '@/app/api/public/contractor-inquiry/route';
import { POST as newsletter } from '@/app/api/public/newsletter/route';
import { POST as triage } from '@/app/api/public/triage/route';
import { POST as claimSubmit } from '@/app/api/public/claims/submit/route';
import { checkCaptcha, getHCaptchaSecret } from '@/lib/services/captcha.service';

const FAKE_SECRET = '0x0000000000000000000000000000000000000000'; // not a real secret
const GOOD_TOKEN = 'good-token-0123456789';
const BAD_TOKEN = 'bad-token-0123456789';

const ENV_KEYS = ['HCAPTCHA_SECRET', 'HCAPTCHA_SECRET_KEY', 'VERCEL_ENV', 'REQUIRE_CAPTCHA'] as const;
const savedEnv: Record<string, string | undefined> = {};

let fetchMock: jest.Mock<typeof fetch>;

function mockHCaptcha() {
  fetchMock = jest.fn(async (url: unknown, init?: RequestInit) => {
    const body = new URLSearchParams(String(init?.body ?? ''));
    const ok = String(url).startsWith('https://hcaptcha.com/siteverify') &&
      body.get('secret') === FAKE_SECRET &&
      body.get('response') === GOOD_TOKEN;
    return new Response(
      JSON.stringify(
        ok
          ? { success: true, challenge_ts: new Date().toISOString(), hostname: 'localhost' }
          : { success: false, 'error-codes': ['invalid-input-response'] }
      ),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  }) as unknown as jest.Mock<typeof fetch>;
  global.fetch = fetchMock as unknown as typeof fetch;
}

beforeEach(() => {
  for (const k of ENV_KEYS) {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  }
  process.env.HCAPTCHA_SECRET = FAKE_SECRET;
  mockHCaptcha();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  jest.restoreAllMocks();
});

// honeypot: '' because isHoneypotTriggered(undefined) is true, which would
// short-circuit to a fake 200 before the CAPTCHA step.
function req(path: string, body: Record<string, unknown>) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0 (jest)' },
    body: JSON.stringify({ honeypot: '', ...body }),
  });
}

const routes: Array<{
  name: string;
  handler: (r: NextRequest) => Promise<Response>;
  path: string;
  body: Record<string, unknown>;
}> = [
  {
    name: 'lead-capture',
    handler: leadCapture as any,
    path: '/api/public/lead-capture',
    body: {
      firstName: 'Jane',
      lastName: 'Citizen',
      email: 'jane@example.com.au',
      phone: '0412345678',
      propertyAddress: '1 Test Street',
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      damageType: 'WATER_DAMAGE',
      damageDescription: 'Burst pipe flooded the kitchen floor',
      hasInsurance: false,
      urgency: 'STANDARD',
    },
  },
  {
    name: 'contractor-inquiry',
    handler: contractorInquiry as any,
    path: '/api/public/contractor-inquiry',
    body: {
      businessName: 'Test Restorations',
      abn: '51824753556',
      businessType: 'COMPANY',
      contactFirstName: 'Sam',
      contactLastName: 'Builder',
      contactEmail: 'sam@example.com.au',
      contactPhone: '0412345678',
      businessAddress: '2 Trade Road',
      suburb: 'Parramatta',
      state: 'NSW',
      postcode: '2150',
      servicesOffered: ['WATER_DAMAGE'],
      serviceAreas: ['NSW'],
      hasPublicLiability: true,
      hasWorkersCompensation: true,
      yearsInBusiness: 5,
      numberOfEmployees: 3,
      termsAccepted: true,
      backgroundCheckConsent: true,
    },
  },
  {
    name: 'newsletter',
    handler: newsletter as any,
    path: '/api/public/newsletter',
    body: { email: 'reader@example.com.au', marketingConsent: true },
  },
  {
    name: 'triage',
    handler: triage as any,
    path: '/api/public/triage',
    body: { responses: [{ questionId: 'damage_type', answer: 'water' }] },
  },
];

async function message(res: Response): Promise<string> {
  const json: any = await res.json();
  return typeof json.error === 'string' ? json.error : json.error?.message;
}

describe.each(routes)('POST $path CAPTCHA (DR-955)', ({ handler, path, body }) => {
  it('refuses a submission with no CAPTCHA token', async () => {
    const res = await handler(req(path, body));
    expect(res.status).toBe(400);
    expect(await message(res)).toMatch(/CAPTCHA token is required/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses a token hCaptcha rejects', async () => {
    const res = await handler(req(path, { ...body, captchaToken: BAD_TOKEN }));
    expect(res.status).toBe(400);
    expect(await message(res)).toMatch(/CAPTCHA verification failed/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('hcaptcha.com/siteverify');
  });

  it('lets a token hCaptcha accepts through the CAPTCHA check', async () => {
    const res = await handler(req(path, { ...body, captchaToken: GOOD_TOKEN }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res.status).not.toBe(400);
  });

  it('works when only the legacy HCAPTCHA_SECRET_KEY is set', async () => {
    delete process.env.HCAPTCHA_SECRET;
    process.env.HCAPTCHA_SECRET_KEY = FAKE_SECRET;
    const missing = await handler(req(path, body));
    expect(missing.status).toBe(400);
    const good = await handler(req(path, { ...body, captchaToken: GOOD_TOKEN }));
    expect(good.status).not.toBe(400);
  });

  it('refuses in production when no secret is configured', async () => {
    delete process.env.HCAPTCHA_SECRET;
    process.env.VERCEL_ENV = 'production';
    const res = await handler(req(path, { ...body, captchaToken: GOOD_TOKEN }));
    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('POST /api/public/claims/submit CAPTCHA', () => {
  it('refuses a claim with no CAPTCHA token', async () => {
    const res = await claimSubmit(
      new NextRequest('http://localhost/api/public/claims/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ step1: {}, step2: {}, step3: {} }),
      })
    );
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('captcha.service secret name and no-secret policy', () => {
  it('reads HCAPTCHA_SECRET first', () => {
    process.env.HCAPTCHA_SECRET_KEY = 'other';
    expect(getHCaptchaSecret()).toBe(FAKE_SECRET);
  });

  it('falls back to HCAPTCHA_SECRET_KEY and warns once without printing the value', () => {
    delete process.env.HCAPTCHA_SECRET;
    process.env.HCAPTCHA_SECRET_KEY = FAKE_SECRET;
    const warn = console.warn as jest.Mock;
    expect(getHCaptchaSecret()).toBe(FAKE_SECRET);
    expect(getHCaptchaSecret()).toBe(FAKE_SECRET);
    const deprecations = warn.mock.calls.filter((c) => String(c[0]).includes('deprecated'));
    expect(deprecations.length).toBeLessThanOrEqual(1);
    for (const call of warn.mock.calls) expect(String(call)).not.toContain(FAKE_SECRET);
  });

  it('allows (with a warning) when no secret is set outside production', async () => {
    delete process.env.HCAPTCHA_SECRET;
    await expect(checkCaptcha(undefined)).resolves.toEqual({ ok: true, skipped: true });
  });

  it('refuses when no secret is set and REQUIRE_CAPTCHA=true', async () => {
    delete process.env.HCAPTCHA_SECRET;
    process.env.REQUIRE_CAPTCHA = 'true';
    await expect(checkCaptcha(GOOD_TOKEN)).resolves.toMatchObject({ ok: false, reason: 'not-configured' });
  });

  it('refuses an empty-string token', async () => {
    await expect(checkCaptcha('  ')).resolves.toMatchObject({ ok: false, reason: 'missing-token' });
  });
});
