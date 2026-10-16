/**
 * @jest-environment node
 *
 * CodeQL js/request-forgery #150 — the health-check cron calls
 * /api/health/deep on the fixed SITE_URL origin. A request arriving on another
 * host (spoofed Host / X-Forwarded-Host) must not choose where the server
 * fetches, even with a valid cron secret.
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cron/health-check/route';

const CRON_SECRET = 'cron-secret-fixture';
let savedSecret: string | undefined;

beforeEach(() => {
  savedSecret = process.env.CRON_SECRET;
  process.env.CRON_SECRET = CRON_SECRET;
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  if (savedSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = savedSecret;
});

describe('GET /api/cron/health-check origin', () => {
  it('calls https://nrpg.business/api/health/deep even when the request host is spoofed', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'healthy', services: {} }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const req = new NextRequest('http://attacker.example/api/cron/health-check', {
      headers: {
        authorization: `Bearer ${CRON_SECRET}`,
        'x-forwarded-host': 'attacker.example',
      },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0][0])).toBe('https://nrpg.business/api/health/deep');
  });
});
