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

// Each test sets VERCEL_ENV itself; put back whatever the runner started with.
const initialVercelEnv = process.env.VERCEL_ENV;
afterEach(() => {
  if (initialVercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = initialVercelEnv;
});

describe('GET /api/cron/health-check origin', () => {
  it('calls https://nrpg.business/api/health/deep even when the request host is spoofed', async () => {
    process.env.VERCEL_ENV = 'production';
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

  it('calls the preview deployment itself on a Vercel preview, whatever the request host', async () => {
    const saved = { VERCEL_ENV: process.env.VERCEL_ENV, VERCEL_URL: process.env.VERCEL_URL };
    process.env.VERCEL_ENV = 'preview';
    process.env.VERCEL_URL = 'nrpg-git-fix-abc.vercel.app';
    try {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ status: 'healthy', services: {} }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );
      fetchSpy.mockClear();

      const req = new NextRequest('http://attacker.example/api/cron/health-check', {
        headers: {
          authorization: `Bearer ${CRON_SECRET}`,
          'x-forwarded-host': 'attacker.example',
        },
      });
      const res = await GET(req);

      expect(res.status).toBe(200);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(String(fetchSpy.mock.calls[0][0])).toBe('https://nrpg-git-fix-abc.vercel.app/api/health/deep');
    } finally {
      for (const [key, value] of Object.entries(saved)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });
});
