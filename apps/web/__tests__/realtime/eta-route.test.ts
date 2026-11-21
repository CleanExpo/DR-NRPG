/** @jest-environment node */
// DR-1009: the ETA route makes paid Google Geocoding and Directions calls. These tests
// prove a per-user burst is refused before Google is called, that the limiter fails
// closed, and that the job address is geocoded once per shared cache entry.
// Google is never called: global fetch is replaced by a synthetic responder.
import { NextRequest } from 'next/server';

// One in-memory stand-in for Upstash, shared across module reloads (a second server
// instance re-imports the route but talks to the same Redis).
const mockRedisState: {
  store: Map<string, unknown>;
  incrKeys: string[];
  expiredKeys: string[];
  outage: boolean;
  cacheOutage: boolean;
  pttl: number;
} = { store: new Map(), incrKeys: [], expiredKeys: [], outage: false, cacheOutage: false, pttl: 60000 };
jest.mock('@upstash/redis', () => ({
  Redis: class {
    async incr(key: string) {
      if (mockRedisState.outage) throw new Error('synthetic outage');
      mockRedisState.incrKeys.push(key);
      const next = ((mockRedisState.store.get(key) as number | undefined) ?? 0) + 1;
      mockRedisState.store.set(key, next);
      return next;
    }
    async pttl() {
      if (mockRedisState.outage) throw new Error('synthetic outage');
      return mockRedisState.pttl;
    }
    async pexpire(key: string) {
      mockRedisState.expiredKeys.push(key);
      return 1;
    }
    async get(key: string) {
      if (mockRedisState.outage || mockRedisState.cacheOutage) throw new Error('synthetic outage');
      return mockRedisState.store.has(key) ? mockRedisState.store.get(key) : null;
    }
    async set(key: string, value: unknown) {
      if (mockRedisState.outage || mockRedisState.cacheOutage) throw new Error('synthetic outage');
      mockRedisState.store.set(key, value);
      return 'OK';
    }
  },
}));

const mockAuth: { userId: string } = { userId: 'user-a' };
jest.mock('../../lib/auth-middleware', () => ({
  authenticateRequest: async () => ({ success: true, context: { user: { id: mockAuth.userId } } }),
}));

// Each ETA request sees the contractor in a new position, so the route's own
// short-lived Directions cache never hides a Google call from these counts.
const mockPosition = { step: 0 };
jest.mock('../../lib/get-tenant-db', () => ({
  getTenantDb: () => ({
    serviceRequest: {
      findFirst: async ({ where }: { where: { id: string; userId: string } }) => ({
        id: where.id,
        userId: where.userId,
        location: '1 Synthetic Street, Brisbane QLD 4000',
      }),
    },
    contractorLocationHistory: {
      findFirst: async () => {
        mockPosition.step += 1;
        return { latitude: -27.4 - mockPosition.step * 0.01, longitude: 153.0, timestamp: new Date() };
      },
    },
  }),
}));

const ENV_KEYS = ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'GOOGLE_MAPS_SERVER_KEY'] as const;
const savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
const savedFetch = global.fetch;

let googleCalls: { geocode: number; directions: number };
let geocodeStatus = 'OK';

function syntheticGoogle() {
  googleCalls = { geocode: 0, directions: 0 };
  global.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/geocode/')) {
      googleCalls.geocode += 1;
      if (geocodeStatus !== 'OK') return new Response(JSON.stringify({ status: geocodeStatus, results: [] }));
      return new Response(JSON.stringify({ status: 'OK', results: [{ geometry: { location: { lat: -27.47, lng: 153.02 } } }] }));
    }
    if (url.includes('/directions/')) {
      googleCalls.directions += 1;
      return new Response(
        JSON.stringify({
          status: 'OK',
          routes: [
            {
              legs: [{ duration: { value: 600, text: '10 mins' }, distance: { value: 5000, text: '5 km' } }],
              overview_polyline: { points: 'synthetic' },
            },
          ],
        })
      );
    }
    throw new Error(`unexpected fetch in test: ${url}`);
  }) as typeof fetch;
}

function withRedisEnv() {
  process.env.UPSTASH_REDIS_REST_URL = 'https://synthetic.example.invalid';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'synthetic-not-a-credential';
}

async function loadRoute() {
  jest.resetModules();
  return import('../../app/api/realtime/jobs/[id]/eta/route');
}

async function callEta(GET: Awaited<ReturnType<typeof loadRoute>>['GET'], userId: string, jobId = 'job-1') {
  mockAuth.userId = userId;
  const req = new NextRequest(`https://nrpg.business/api/realtime/jobs/${jobId}/eta`, {
    headers: { 'x-real-ip': '203.0.113.7' },
  });
  return GET(req, { params: Promise.resolve({ id: jobId }) });
}

const LIMIT = 20;

beforeEach(() => {
  mockRedisState.store.clear();
  mockRedisState.incrKeys = [];
  mockRedisState.expiredKeys = [];
  mockRedisState.outage = false;
  mockRedisState.cacheOutage = false;
  mockRedisState.pttl = 60000;
  geocodeStatus = 'OK';
  mockPosition.step = 0;
  process.env.GOOGLE_MAPS_SERVER_KEY = 'synthetic-not-a-credential';
  withRedisEnv();
  syntheticGoogle();
});

afterAll(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  global.fetch = savedFetch;
});

test('(a) a burst over the per-user limit is refused with 429 and makes no extra Google calls', async () => {
  const { GET } = await loadRoute();
  const statuses: number[] = [];
  for (let i = 0; i < LIMIT + 5; i++) statuses.push((await callEta(GET, 'user-a')).status);

  expect(statuses.slice(0, LIMIT).every((s) => s === 200)).toBe(true);
  expect(statuses.slice(LIMIT)).toEqual([429, 429, 429, 429, 429]);
  expect(googleCalls.directions).toBe(LIMIT);
  expect(googleCalls.geocode).toBeLessThanOrEqual(1);
});

test('(b) one user exhausting the limit does not block another user', async () => {
  const { GET } = await loadRoute();
  for (let i = 0; i < LIMIT + 1; i++) await callEta(GET, 'user-a');
  expect((await callEta(GET, 'user-a')).status).toBe(429);
  expect((await callEta(GET, 'user-b')).status).toBe(200);
});

test('(c) with Redis missing or failing the route refuses with 503 and never calls Google', async () => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  let { GET } = await loadRoute();
  expect((await callEta(GET, 'user-a')).status).toBe(503);

  withRedisEnv();
  mockRedisState.outage = true;
  ({ GET } = await loadRoute());
  expect((await callEta(GET, 'user-a')).status).toBe(503);

  expect(googleCalls).toEqual({ geocode: 0, directions: 0 });
});

test('(d) the job address is geocoded once, including from a fresh server instance', async () => {
  let { GET } = await loadRoute();
  for (let i = 0; i < 3; i++) expect((await callEta(GET, 'user-a')).status).toBe(200);

  // A second server instance: new module state, same shared Redis.
  ({ GET } = await loadRoute());
  for (let i = 0; i < 3; i++) expect((await callEta(GET, 'user-b')).status).toBe(200);

  expect(googleCalls.geocode).toBe(1);
  expect(googleCalls.directions).toBe(6);
});

test('(e) the shared limiter keeps rate-limit:<ip> by default and uses prefix plus identifier when given', async () => {
  jest.resetModules();
  const { createRedisRateLimiter } = await import('../../lib/api/redis-rate-limit');
  const req = new NextRequest('https://nrpg.business/api/anything', { headers: { 'x-real-ip': '203.0.113.9' } });

  await createRedisRateLimiter({ windowMs: 60000, maxRequests: 10 })(req);
  await createRedisRateLimiter({ windowMs: 60000, maxRequests: 10, keyPrefix: 'rate-limit:eta' })(req, 'user-a');

  expect(mockRedisState.incrKeys).toEqual(['rate-limit:203.0.113.9', 'rate-limit:eta:user-a']);
});

test('(f) a limiter key left without an expiry is given one, so a user is not refused forever', async () => {
  jest.resetModules();
  const { createRedisRateLimiter } = await import('../../lib/api/redis-rate-limit');
  const req = new NextRequest('https://nrpg.business/api/anything');
  const limiter = createRedisRateLimiter({ windowMs: 60000, maxRequests: 10, keyPrefix: 'rate-limit:eta' });
  await limiter(req, 'user-a'); // first request sets the expiry
  mockRedisState.expiredKeys = [];
  mockRedisState.pttl = -1; // as if that pexpire had failed
  await limiter(req, 'user-a');
  expect(mockRedisState.expiredKeys).toEqual(['rate-limit:eta:user-a']);
});

test('(g) a geocode cache failure after the limiter passes falls through to Google, not a 500', async () => {
  const { GET } = await loadRoute();
  mockRedisState.cacheOutage = true;
  expect((await callEta(GET, 'user-a')).status).toBe(200);
  expect(googleCalls.geocode).toBe(1);
});

test('(h) an address Google cannot find is not geocoded again on every poll', async () => {
  geocodeStatus = 'ZERO_RESULTS';
  const { GET } = await loadRoute();
  for (let i = 0; i < 3; i++) {
    const body = await (await callEta(GET, 'user-a')).json();
    expect(body.eta).toBeNull();
  }
  expect(googleCalls.geocode).toBe(1);
  expect(googleCalls.directions).toBe(0);
});
