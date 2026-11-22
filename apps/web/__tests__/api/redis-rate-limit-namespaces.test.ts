/** @jest-environment node */
// DR-1010: each Redis rate limiter must count in its own namespace.
// Before this fix every limiter wrote to `rate-limit:<ip>`, so one limiter's
// traffic used up another limiter's allowance for the same IP.
import { NextRequest } from 'next/server';

const store = new Map<string, number>();
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(() => ({
    incr: jest.fn(async (key: string) => {
      const next = (store.get(key) ?? 0) + 1;
      store.set(key, next);
      return next;
    }),
    pttl: jest.fn(async () => 60000),
    pexpire: jest.fn(async () => 1),
  })),
}));

const IP = '203.0.113.7';
const request = () =>
  new NextRequest('https://nrpg.business/api/test', { headers: { 'x-vercel-forwarded-for': IP } });

type Limiter = (req: NextRequest) => Promise<{ status: number } | null>;
type Factory = (config: Record<string, unknown>) => Limiter;
type RedisRateLimit = (config: Record<string, unknown>) => Promise<{ status: number } | null>;

let createRedisRateLimiter: Factory;
let redisRateLimit: RedisRateLimit;
const savedUrl = process.env.UPSTASH_REDIS_REST_URL;
const savedToken = process.env.UPSTASH_REDIS_REST_TOKEN;

beforeAll(async () => {
  process.env.UPSTASH_REDIS_REST_URL = 'https://synthetic.example.invalid';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'synthetic-not-a-credential';
  jest.resetModules();
  ({ createRedisRateLimiter } = (await import('../../lib/api/redis-rate-limit')) as unknown as {
    createRedisRateLimiter: Factory;
  });
  ({ redisRateLimit } = (await import('../../lib/api/rate-limit')) as unknown as {
    redisRateLimit: RedisRateLimit;
  });
});

afterAll(() => {
  if (savedUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
  else process.env.UPSTASH_REDIS_REST_URL = savedUrl;
  if (savedToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
  else process.env.UPSTASH_REDIS_REST_TOKEN = savedToken;
});

beforeEach(() => store.clear());

describe('createRedisRateLimiter namespaces (DR-1010)', () => {
  test('two limiters with the same IP do not share a counter', async () => {
    const login = createRedisRateLimiter({ name: 'login', windowMs: 60000, maxRequests: 2 });
    const form = createRedisRateLimiter({ name: 'form', windowMs: 60000, maxRequests: 2 });

    // Use up the login allowance and go past it.
    expect(await login(request())).toBeNull();
    expect(await login(request())).toBeNull();
    expect((await login(request()))?.status).toBe(429);

    // The form limiter is untouched by the login traffic.
    expect(await form(request())).toBeNull();
    expect(await form(request())).toBeNull();
    expect([...store.keys()].sort()).toEqual([`rate-limit:form:${IP}`, `rate-limit:login:${IP}`]);
  });

  test('the same limiter still counts across requests', async () => {
    const login = createRedisRateLimiter({ name: 'login', windowMs: 60000, maxRequests: 2 });
    expect(await login(request())).toBeNull();
    expect(await login(request())).toBeNull();
    expect((await login(request()))?.status).toBe(429);
    expect(store.get(`rate-limit:login:${IP}`)).toBe(3);
  });

  test('the shared pre-configured limiters each use their own key', async () => {
    const mod = (await import('../../lib/api/redis-rate-limit')) as unknown as Record<string, Limiter>;
    for (const exported of [
      'authRateLimiter',
      'apiRateLimiter',
      'paymentRateLimiter',
      'publicReadRateLimiter',
      'formSubmissionRateLimiter',
    ]) {
      await mod[exported](request());
    }
    expect(store.size).toBe(5);
    for (const count of store.values()) expect(count).toBe(1);
  });
});

describe('redisRateLimit namespaces (DR-1010)', () => {
  test('two names with the same identifier do not share a counter, and the same name counts', async () => {
    const cfg = { windowMs: 60000, maxRequests: 1, identifier: IP };
    expect(await redisRateLimit({ ...cfg, name: 'a' })).toBeNull();
    expect((await redisRateLimit({ ...cfg, name: 'a' }))?.status).toBe(429);
    expect(await redisRateLimit({ ...cfg, name: 'b' })).toBeNull();
    expect(store.get(`rate-limit:a:${IP}`)).toBe(2);
    expect(store.get(`rate-limit:b:${IP}`)).toBe(1);
  });
});
