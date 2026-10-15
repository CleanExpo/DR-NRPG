/** @jest-environment node */
import { NextRequest } from 'next/server';
jest.mock('@upstash/redis', () => ({ Redis: jest.fn(() => ({ incr: jest.fn(async () => { throw Error('synthetic outage'); }), pttl: jest.fn(async () => -1) })) }));
const request = () => new NextRequest('https://nrpg.business/api/hall/enquiries');
test('Hall fail-closed limiter denies missing Redis and Redis outage', async () => {
 const savedUrl = process.env.UPSTASH_REDIS_REST_URL, savedToken = process.env.UPSTASH_REDIS_REST_TOKEN;
 try {
  delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN; jest.resetModules();
  let { createRedisRateLimiter } = await import('../../lib/api/redis-rate-limit');
  expect((await createRedisRateLimiter({ windowMs: 60000, maxRequests: 10, failClosed: true })(request()))?.status).toBe(503);
  process.env.UPSTASH_REDIS_REST_URL = 'https://synthetic.example.invalid'; process.env.UPSTASH_REDIS_REST_TOKEN = 'synthetic-not-a-credential'; jest.resetModules();
  ({ createRedisRateLimiter } = await import('../../lib/api/redis-rate-limit'));
  expect((await createRedisRateLimiter({ windowMs: 60000, maxRequests: 10, failClosed: true })(request()))?.status).toBe(503);
 } finally {
  if (savedUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL; else process.env.UPSTASH_REDIS_REST_URL = savedUrl;
  if (savedToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN; else process.env.UPSTASH_REDIS_REST_TOKEN = savedToken;
 }
});
