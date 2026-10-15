/**
 * @jest-environment node
 *
 * Email-verification route negatives (DR-906 — qa-test spec delta
 * "Email verification end-to-end enforced", route level).
 *
 * Drives the REAL `app/api/auth/verify-email/route.ts` handlers (GET link,
 * POST programmatic, PUT resend) with prisma mocked at the boundary.
 *
 * NOTE: the legacy suite `tests/integration/api/auth/verify-email.test.ts`
 * targets a retired token mechanism (a `verificationToken` table + JWT
 * verifyToken) and is excluded from CI by the root jest config
 * (`tests/integration/api/.*` ignore) — it proves nothing. This suite runs in
 * CI against the real single-token-on-User mechanism.
 *
 * Proven:
 *   - tampered/unknown token -> 400, emailVerified NEVER set
 *   - expired token -> 400, emailVerified NEVER set
 *   - valid token -> verified once, token cleared (single-use)
 *   - already-verified -> idempotent success, no second write
 *   - resend path is non-enumerating and issues a fresh single-use token
 */

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }), { virtual: true });

// Created inside the factory: imports are hoisted above module-scope consts.
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Rate limiter: pass-through (its own gate is covered by redis-rate-limit tests).
jest.mock('@/lib/api/redis-rate-limit', () => ({
  authRateLimiter: jest.fn().mockResolvedValue(null),
}));

// Tenant table behind the real tenant-return-origin helper.
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tenant: {
      findUnique: jest.fn(({ where }: { where: { id: string } }) =>
        Promise.resolve(
          where.id === 'tenant_acme'
            ? { domain: 'acme-restoration.example', subdomain: 'acme', isActive: true }
            : null
        )
      ),
    },
  },
}));

const mockSendVerificationEmail = jest.fn();
jest.mock('@/lib/email/resend', () => ({
  sendVerificationEmail: (...args: unknown[]) => mockSendVerificationEmail(...args),
}));

import { NextRequest } from 'next/server';
import { GET, POST, PUT } from '@/app/api/auth/verify-email/route';
import { prisma } from '@/lib/db';

type MockedPrisma = {
  user: { findFirst: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
};
const mockPrisma = prisma as unknown as MockedPrisma;

function getReq(token?: string): NextRequest {
  const url = token
    ? `http://localhost/api/auth/verify-email?token=${token}`
    : 'http://localhost/api/auth/verify-email';
  return new NextRequest(url, { method: 'GET' });
}

function jsonReq(method: 'POST' | 'PUT', body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/auth/verify-email', {
    method,
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.user.update.mockResolvedValue({});
  mockSendVerificationEmail.mockResolvedValue({ success: true });
});

describe('GET /api/auth/verify-email (link click)', () => {
  it('missing token -> 400, no mutation', async () => {
    const res = await GET(getReq());

    expect(res.status).toBe(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('tampered/unknown token -> 400, emailVerified never set', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const res = await GET(getReq('tampered-token'));

    expect(res.status).toBe(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('expired token -> 400, emailVerified never set', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user_1',
      email: 'c@example.com',
      name: 'C',
      isEmailVerified: false,
      emailVerificationTokenExpiry: new Date(Date.now() - 60 * 1000),
      tenant: null,
    });

    const res = await GET(getReq('expired-token'));

    expect(res.status).toBe(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('valid token -> verifies and clears the token (single-use)', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user_1',
      email: 'c@example.com',
      name: 'C',
      isEmailVerified: false,
      emailVerificationTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      tenant: null,
    });

    const res = await GET(getReq('valid-token'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user_1' },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      },
    });
  });

  it('already-verified user -> idempotent success without a second write', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user_1',
      email: 'c@example.com',
      name: 'C',
      isEmailVerified: true,
      emailVerificationTokenExpiry: null,
      tenant: null,
    });

    const res = await GET(getReq('reused-token'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.alreadyVerified).toBe(true);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/verify-email (programmatic)', () => {
  it('tampered/unknown token -> 400, no mutation', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const res = await POST(jsonReq('POST', { token: 'tampered' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('expired token -> 400, no mutation', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user_1',
      isEmailVerified: false,
      emailVerificationTokenExpiry: new Date(Date.now() - 1000),
    });

    const res = await POST(jsonReq('POST', { token: 'expired' }));

    expect(res.status).toBe(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('valid token -> 200 and single-use consumption', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user_1',
      isEmailVerified: false,
      emailVerificationTokenExpiry: new Date(Date.now() + 1000 * 60),
    });

    const res = await POST(jsonReq('POST', { token: 'valid' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isEmailVerified: true,
          emailVerificationToken: null,
        }),
      })
    );
  });

  it('empty token fails validation with 400', async () => {
    const res = await POST(jsonReq('POST', { token: '' }));

    expect(res.status).toBe(400);
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
  });
});

describe('PUT /api/auth/verify-email (resend)', () => {
  it('unknown email -> generic success, no token issued (non-enumerating)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await PUT(jsonReq('PUT', { email: 'ghost@example.com' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockSendVerificationEmail).not.toHaveBeenCalled();
  });

  it('already-verified email -> identical generic success, no token issued', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      email: 'c@example.com',
      name: 'C',
      isEmailVerified: true,
    });

    const res = await PUT(jsonReq('PUT', { email: 'c@example.com' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe('If the email exists, a verification email has been sent');
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('unverified user -> fresh single-use token stored and emailed', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      email: 'c@example.com',
      name: 'C',
      isEmailVerified: false,
    });

    const res = await PUT(jsonReq('PUT', { email: 'c@example.com' }));

    expect(res.status).toBe(200);
    const updateArg = mockPrisma.user.update.mock.calls[0][0];
    expect(updateArg.where).toEqual({ id: 'user_1' });
    expect(typeof updateArg.data.emailVerificationToken).toBe('string');
    expect(updateArg.data.emailVerificationToken.length).toBeGreaterThanOrEqual(64);
    expect(updateArg.data.emailVerificationTokenExpiry.getTime()).toBeGreaterThan(Date.now());
    expect(mockSendVerificationEmail).toHaveBeenCalledWith(
      'c@example.com',
      updateArg.data.emailVerificationToken,
      'C',
      'https://nrpg.business'
    );
  });

  it('custom-domain tenant user -> verification link base is the tenant domain', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_acme',
      email: 'a@example.com',
      name: 'A',
      isEmailVerified: false,
      tenantId: 'tenant_acme',
    });

    const res = await PUT(jsonReq('PUT', { email: 'a@example.com' }));

    expect(res.status).toBe(200);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ select: expect.objectContaining({ tenantId: true }) })
    );
    expect(mockSendVerificationEmail).toHaveBeenCalledWith(
      'a@example.com',
      expect.any(String),
      'A',
      'https://acme-restoration.example'
    );
  });
});
