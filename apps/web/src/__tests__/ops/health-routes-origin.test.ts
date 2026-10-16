/**
 * @jest-environment node
 *
 * CodeQL js/request-forgery #151 — GET /api/health/routes probes its critical
 * routes on the fixed SITE_URL origin. A request arriving on another host
 * (spoofed Host / X-Forwarded-Host) must not choose where the server fetches.
 */

import { NextRequest } from 'next/server';

type RouteGet = (request: NextRequest) => Promise<Response>;
let GET: RouteGet;

beforeAll(async () => {
  const route = await import('@/app/api/health/routes/route');
  GET = route.GET as unknown as RouteGet;
});

describe('GET /api/health/routes origin', () => {
  it('fetches only https://nrpg.business even when the request host is spoofed', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

    const req = new NextRequest('http://attacker.example/api/health/routes', {
      headers: { 'x-forwarded-host': 'attacker.example' },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalled();
    const urls = fetchSpy.mock.calls.map(([url]) => String(url));
    for (const url of urls) {
      expect(url.startsWith('https://nrpg.business/api/')).toBe(true);
    }
    expect(urls).toContain('https://nrpg.business/api/health/deep');
  });
});
