/**
 * @jest-environment node
 *
 * DR-1011: the production deploy runs `vercel pull` then `vercel build` on a
 * GitHub runner. `vercel pull` cannot read Sensitive variables, so it writes the
 * literal "[SENSITIVE]" for them. Once UPSTASH_REDIS_REST_URL/TOKEN were stored
 * as Sensitive, every module that built an Upstash client at import time threw
 * `UrlError: ... Received: "[SENSITIVE]"` while Next.js collected page data for
 * /api/auth/register, and the build failed.
 *
 * A placeholder or non-https URL must leave Redis unconfigured (in-memory
 * fallback) instead of throwing at import.
 */
import { getUpstashRestConfig } from '@/lib/redis/upstash-config';

const PLACEHOLDER = '[SENSITIVE]';

const MODULES = [
  '@/lib/api/redis-rate-limit',
  '@/lib/api/rate-limit',
  '@/lib/security/rate-limit',
  '@/lib/analytics/event-processor',
] as const;

describe('Upstash config with build-time placeholders (DR-1011)', () => {
  const saved = {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  };

  afterEach(() => {
    if (saved.url === undefined) delete process.env.UPSTASH_REDIS_REST_URL;
    else process.env.UPSTASH_REDIS_REST_URL = saved.url;
    if (saved.token === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = saved.token;
    jest.resetModules();
  });

  it.each(MODULES)('%s imports without throwing when the env holds "[SENSITIVE]"', (mod) => {
    process.env.UPSTASH_REDIS_REST_URL = PLACEHOLDER;
    process.env.UPSTASH_REDIS_REST_TOKEN = PLACEHOLDER;
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.isolateModules(() => {
      expect(() => require(mod)).not.toThrow();
    });
    // The analytics processor swallows the throw but logs it; that log is the
    // first line of the failing deploy, so it must not happen either.
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('Failed to initialize Redis'),
      expect.anything()
    );
  });

  it('rate limiting reports Redis as not configured for a placeholder URL', () => {
    process.env.UPSTASH_REDIS_REST_URL = PLACEHOLDER;
    process.env.UPSTASH_REDIS_REST_TOKEN = PLACEHOLDER;
    jest.isolateModules(() => {
      expect(require('@/lib/api/redis-rate-limit').isRedisConfigured()).toBe(false);
      expect(require('@/lib/security/rate-limit').isRateLimitingEnabled()).toBe(false);
    });
  });

  describe('getUpstashRestConfig', () => {
    const cases: Array<[Record<string, string>, string]> = [
      [{}, 'unset'],
      [{ UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: 't' }, 'empty url'],
      [{ UPSTASH_REDIS_REST_URL: PLACEHOLDER, UPSTASH_REDIS_REST_TOKEN: PLACEHOLDER }, 'placeholder'],
      [{ UPSTASH_REDIS_REST_URL: 'http://x.upstash.io', UPSTASH_REDIS_REST_TOKEN: 't' }, 'http url'],
      [{ UPSTASH_REDIS_REST_URL: 'https://x.upstash.io', UPSTASH_REDIS_REST_TOKEN: '' }, 'no token'],
      [{ UPSTASH_REDIS_REST_URL: 'https://x.upstash.io', UPSTASH_REDIS_REST_TOKEN: PLACEHOLDER }, 'placeholder token'],
    ];
    it.each(cases)('returns null when %j (%s)', (env) => {
      expect(getUpstashRestConfig(env as unknown as NodeJS.ProcessEnv)).toBeNull();
    });

    it('returns the trimmed config for a real https URL and token', () => {
      expect(
        getUpstashRestConfig({
          UPSTASH_REDIS_REST_URL: ' https://x.upstash.io ',
          UPSTASH_REDIS_REST_TOKEN: 'tok',
        } as unknown as NodeJS.ProcessEnv)
      ).toEqual({ url: 'https://x.upstash.io', token: 'tok' });
    });
  });
});
