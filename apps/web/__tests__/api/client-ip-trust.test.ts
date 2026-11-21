/** @jest-environment node */
// Client-IP trust: a caller must not be able to choose its own rate-limit key.
// Before this fix every limiter read `cf-connecting-ip`, `x-real-ip` or the
// first `x-forwarded-for` entry, all of which the caller controls. The app runs
// on Vercel with no Cloudflare proxy, so only `x-vercel-forwarded-for` and the
// right-most (platform-appended) `x-forwarded-for` hop are trusted.
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@upstash/redis', () => ({ Redis: jest.fn(() => ({})) }));
jest.mock('@upstash/ratelimit', () => {
  const Ratelimit = jest.fn(() => ({ limit: jest.fn() })) as unknown as Record<string, unknown>;
  Ratelimit.slidingWindow = jest.fn();
  return { Ratelimit };
});

const PLATFORM_IP = '203.0.113.7';
const SPOOF = '198.51.100.99';

const req = (headers: Record<string, string>) =>
  new NextRequest('https://nrpg.business/api/test', { headers });

type IpReader = (request: NextRequest) => string;

const readers: Array<[string, () => Promise<IpReader>]> = [
  ['lib/net/client-ip getClientIp', async () => (await import('../../lib/net/client-ip')).getClientIp],
  ['lib/api/rate-limit getClientIp', async () => (await import('../../lib/api/rate-limit')).getClientIp],
  [
    'lib/api/redis-rate-limit getClientIdentifier',
    async () => (await import('../../lib/api/redis-rate-limit')).getClientIdentifier,
  ],
  [
    'src/lib/security/rate-limit getClientIp',
    async () => (await import('../../src/lib/security/rate-limit')).getClientIp,
  ],
  ['src/lib/rate-limit getClientIp', async () => (await import('../../src/lib/rate-limit')).getClientIp],
  [
    'lib/services/audit.service getIpFromRequest',
    async () => (await import('../../lib/services/audit.service')).getIpFromRequest,
  ],
];

describe.each(readers)('%s', (_label, load) => {
  let read: IpReader;
  beforeAll(async () => {
    read = await load();
  });

  test('uses the Vercel platform value', () => {
    expect(read(req({ 'x-vercel-forwarded-for': PLATFORM_IP }))).toBe(PLATFORM_IP);
  });

  test('a spoofed cf-connecting-ip does not change the key', () => {
    expect(
      read(req({ 'x-vercel-forwarded-for': PLATFORM_IP, 'cf-connecting-ip': SPOOF })),
    ).toBe(PLATFORM_IP);
  });

  test('a spoofed x-real-ip does not change the key', () => {
    expect(read(req({ 'x-vercel-forwarded-for': PLATFORM_IP, 'x-real-ip': SPOOF }))).toBe(
      PLATFORM_IP,
    );
  });

  test('a spoofed leading x-forwarded-for entry does not change the key', () => {
    // The caller sent "x-forwarded-for: SPOOF"; the platform appended the real hop.
    expect(read(req({ 'x-forwarded-for': `${SPOOF}, ${PLATFORM_IP}` }))).toBe(PLATFORM_IP);
  });

  test('client-only headers fall back to the fixed bucket, not a caller-chosen value', () => {
    expect(read(req({ 'cf-connecting-ip': SPOOF, 'x-real-ip': SPOOF }))).toBe('unknown');
  });
});

describe('in-memory rateLimit() namespaces', () => {
  test('requires a name', async () => {
    const { rateLimit } = (await import('../../lib/api/rate-limit')) as unknown as {
      rateLimit: (config: Record<string, unknown>) => unknown;
    };
    expect(() => rateLimit({ windowMs: 60000, maxRequests: 1 })).toThrow(/name/i);
  });

  test('two limiters with the same IP do not share a counter', async () => {
    const { rateLimit } = (await import('../../lib/api/rate-limit')) as unknown as {
      rateLimit: (
        config: Record<string, unknown>,
      ) => (request: NextRequest) => Promise<{ status: number } | null>;
    };
    const ip = { 'x-vercel-forwarded-for': '203.0.113.50' };
    const triage = rateLimit({ name: 'test-triage', windowMs: 60000, maxRequests: 1 });
    const newsletter = rateLimit({ name: 'test-newsletter', windowMs: 60000, maxRequests: 1 });

    expect(await triage(req(ip))).toBeNull();
    expect((await triage(req(ip)))?.status).toBe(429);
    // The newsletter allowance is untouched by the triage traffic.
    expect(await newsletter(req(ip))).toBeNull();
  });
});
