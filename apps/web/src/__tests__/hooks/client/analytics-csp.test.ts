/**
 * @jest-environment node
 *
 * The security policy (Content-Security-Policy) decides which documents may
 * load the Google tag at all. These tests pin three things:
 *   1. the closed policy is today's policy, byte for byte;
 *   2. the open policy adds the Google hosts and nothing else;
 *   3. the middleware sends the open policy only for public content.
 */
import { NextRequest } from 'next/server';
import {
  ANALYTICS_PATHS,
  POLICY_OPEN_SEGMENTS,
  buildCsp,
  isPolicyOpenPath,
} from '@/lib/analytics-gate';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(async () => null),
}));

// The policy as middleware.ts sent it before this change (commit f22357c5).
// Written out here on purpose: it must not be built from the code under test.
const TODAY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://hcaptcha.com https://*.hcaptcha.com",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://*.supabase.co wss://*.supabase.co",
  "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const OPEN_SCRIPT =
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://hcaptcha.com https://*.hcaptcha.com https://www.googletagmanager.com";
const OPEN_CONNECT =
  "connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com";

function directives(policy: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const part of policy.split('; ')) {
    const name = part.split(' ')[0];
    expect(map.has(name)).toBe(false);
    map.set(name, part);
  }
  return map;
}

const GOOGLE = /google/i;

describe('buildCsp', () => {
  it('closed policy equals the policy sent before this change, byte for byte', () => {
    expect(buildCsp({ allowAnalytics: false })).toBe(TODAY);
  });

  it('closed policy names no Google host', () => {
    expect(GOOGLE.test(buildCsp({ allowAnalytics: false }))).toBe(false);
  });

  it('open policy adds the Google hosts to script-src and connect-src', () => {
    const open = directives(buildCsp({ allowAnalytics: true }));
    expect(open.get('script-src')).toBe(OPEN_SCRIPT);
    expect(open.get('connect-src')).toBe(OPEN_CONNECT);
  });

  it('open policy changes nothing else', () => {
    const open = directives(buildCsp({ allowAnalytics: true }));
    const closed = directives(TODAY);
    expect([...open.keys()]).toEqual([...closed.keys()]);
    for (const [name, value] of closed) {
      if (name === 'script-src' || name === 'connect-src') continue;
      expect(open.get(name)).toBe(value);
    }
  });

  it('anything other than exactly true gives the closed policy', () => {
    const loose = buildCsp as unknown as (options: unknown) => string;
    expect(loose({ allowAnalytics: 'true' })).toBe(TODAY);
    expect(loose({ allowAnalytics: 1 })).toBe(TODAY);
    expect(loose({})).toBe(TODAY);
    expect(loose(undefined)).toBe(TODAY);
  });
});

describe('isPolicyOpenPath', () => {
  it('every counted path is policy-open', () => {
    for (const path of ANALYTICS_PATHS) {
      expect({ path, open: isPolicyOpenPath(path) }).toEqual({ path, open: true });
    }
  });

  it.each([
    '/',
    '/guides',
    '/guides/water-damage-checklist',
    '/services/water-damage',
    '/locations/qld/brisbane',
    '/resources',
    '/tools',
    '/learn',
    '/case-studies',
    '/events',
    '/training',
    '/cyclone-alfred-queensland-2025',
    '/cyclone-maila-queensland-2026',
    '/cyclone-narelle-western-australia-2026',
    '/nsw-qld-storms-april-2026',
    '/queensland-floods-2026-recovery',
    '/victoria-bushfires-2025',
    '/victoria-bushfires-2026',
    '/about/',
  ])('open: %s', (path) => {
    expect(isPolicyOpenPath(path)).toBe(true);
  });

  it.each([
    '/dashboard',
    '/dashboard/admin',
    '/admin',
    '/auth/reset',
    '/onboarding',
    '/login',
    '/launch',
    '/launch/thank-you',
    '/portal',
    '/api/public/claims/submit',
    '/search',
    '/brisbane',
    '/contractor',
    '/hall',
    '/help-center',
    '/unknown-new-section',
  ])('closed: %s', (path) => {
    expect(isPolicyOpenPath(path)).toBe(false);
  });

  it.each([
    ['upper case', '/Services'],
    ['encoded', '/%73ervices'],
    ['parent step', '/services/../dashboard'],
    ['doubled slash', '//services'],
    ['backslash', '/services\\dashboard'],
    ['dot', '/services/file.html'],
    ['no leading slash', 'services'],
    ['empty', ''],
    ['not a string', 42],
    ['null', null],
    ['undefined', undefined],
    ['near miss', '/servicesx'],
    ['prefix only', '/service'],
  ])('fails closed on %s', (_label, path) => {
    expect(isPolicyOpenPath(path)).toBe(false);
  });

  it('the open list holds none of the private sections', () => {
    for (const closed of ['dashboard', 'admin', 'auth', 'onboarding', 'login', 'launch', 'portal', 'api', 'search']) {
      expect(POLICY_OPEN_SEGMENTS.has(closed)).toBe(false);
    }
  });
});

describe('middleware response policy', () => {
  async function policyFor(path: string): Promise<string | null> {
    const { middleware } = await import('@/middleware');
    const response = await middleware(new NextRequest(`http://localhost${path}`));
    return response.headers.get('Content-Security-Policy');
  }

  it.each(['/', '/guides', '/services/water-damage', '/claim/step-1', '/signup'])(
    'open document %s carries the Google hosts',
    async (path) => {
      const policy = await policyFor(path);
      expect(policy).toBe(buildCsp({ allowAnalytics: true }));
      expect(policy).toContain('https://www.googletagmanager.com');
      expect(policy).toContain('https://www.google-analytics.com');
    },
  );

  it.each(['/dashboard', '/launch/thank-you', '/login', '/admin', '/brisbane', '/search'])(
    'closed document %s carries no Google host',
    async (path) => {
      const policy = await policyFor(path);
      expect(policy).toBe(TODAY);
      expect(GOOGLE.test(String(policy))).toBe(false);
    },
  );

  it('a closed address is not opened by its query string', async () => {
    const policy = await policyFor('/login?next=/services');
    expect(policy).toBe(TODAY);
  });

  it('static files still carry no policy from the middleware', async () => {
    expect(await policyFor('/_next/static/chunks/main.js')).toBeNull();
  });
});
