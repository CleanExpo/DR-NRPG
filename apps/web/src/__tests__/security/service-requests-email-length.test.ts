/**
 * @jest-environment node
 *
 * CodeQL js/polynomial-redos (alert #153): POST /api/public/service-requests ran
 * /^[^\s@]+@[^\s@]+\.[^\s@]+$/ over an unbounded, unauthenticated email value, which
 * backtracks quadratically on inputs like "!@!." + "!.".repeat(n). The route must
 * reject over-long emails (RFC 5321 caps an address at 254 chars) before the regex.
 *
 * Every Prisma call rejects, so a request that gets past validation returns 500.
 */

import { describe, it, expect } from '@jest/globals';

jest.mock('@/lib/prisma', () => {
  const reject = () => Promise.reject(new Error('db unavailable in test'));
  const model = new Proxy({}, { get: () => reject });
  return { prisma: new Proxy({}, { get: () => model }) };
});

import { POST } from '@/app/api/public/service-requests/route';

function post(email: string) {
  const body = {
    serviceType: 'WATER_DAMAGE',
    urgency: 'standard',
    state: 'NSW',
    suburb: 'Sydney',
    postcode: '2000',
    name: 'Test Person',
    email,
  };
  return POST(
    new Request('http://localhost/api/public/service-requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }) as any
  );
}

describe('POST /api/public/service-requests email validation', () => {
  it('rejects a well-formed but over-long email before any database work', async () => {
    const res = await post(`${'a'.repeat(250)}@example.com`);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Invalid email format' });
  });

  it('rejects the backtracking payload as an invalid email', async () => {
    const res = await post(`!@!.${'!.'.repeat(5000)} `);
    expect(res.status).toBe(400);
  });

  it('lets a normal email through validation', async () => {
    const res = await post('person@example.com.au');
    expect(res.status).not.toBe(400);
  });
});
