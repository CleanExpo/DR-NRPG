/**
 * @jest-environment node
 *
 * PR #270 review (CodeRabbit, health-check origin): the health routes must probe
 * the deployment they run in. A fixed https://nrpg.business made a preview or
 * local server report production's health instead of its own. The origin still
 * comes only from platform configuration, never from the request.
 */

import { deploymentOrigin } from '@/lib/deployment-origin';

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

describe('deploymentOrigin', () => {
  it('is the apex in production, even when Vercel sets a deployment host', () => {
    expect(
      deploymentOrigin(env({ VERCEL_ENV: 'production', VERCEL_URL: 'nrpg-abc123.vercel.app', NODE_ENV: 'production' }))
    ).toBe('https://nrpg.business');
  });

  it('is the preview deployment itself on a Vercel preview', () => {
    expect(
      deploymentOrigin(env({ VERCEL_ENV: 'preview', VERCEL_URL: 'nrpg-git-fix-abc.vercel.app', NODE_ENV: 'production' }))
    ).toBe('https://nrpg-git-fix-abc.vercel.app');
  });

  it('falls back to the apex when a preview host is not a bare host name', () => {
    for (const VERCEL_URL of ['evil.example/path', 'user@evil.example', 'evil.example:8080', '']) {
      expect(deploymentOrigin(env({ VERCEL_ENV: 'preview', VERCEL_URL, NODE_ENV: 'production' }))).toBe(
        'https://nrpg.business'
      );
    }
  });

  it('is localhost under next dev, on PORT when it is set', () => {
    expect(deploymentOrigin(env({ NODE_ENV: 'development' }))).toBe('http://localhost:3000');
    expect(deploymentOrigin(env({ NODE_ENV: 'development', PORT: '3100' }))).toBe('http://localhost:3100');
    expect(deploymentOrigin(env({ NODE_ENV: 'development', PORT: '3100/evil' }))).toBe('https://nrpg.business');
  });

  it('is the apex when nothing names a deployment', () => {
    expect(deploymentOrigin(env({ NODE_ENV: 'production' }))).toBe('https://nrpg.business');
    expect(deploymentOrigin(env({}))).toBe('https://nrpg.business');
  });
});
