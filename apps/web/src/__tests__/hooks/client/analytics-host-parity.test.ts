/**
 * One Google host rule (spec E44): the proof scripts must call Google every
 * host the site calls Google, so a request the site screens is never one the
 * proof lets go unchecked. The proof's own rule is run in a separate Node
 * process, exactly as the proof scripts load it.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isGoogleAddress } from '@/lib/analytics-gate';

const WEB = path.resolve(__dirname, '../../../..');
const CHECKER = pathToFileURL(path.join(WEB, 'scripts/analytics-proof/lib/checker.mjs')).href;
const HOST_RULE = path.join(WEB, 'src/lib/google-hosts.json');

const HOSTS = [
  'www.google-analytics.com',
  'region1.google-analytics.com',
  'analytics.google.com',
  'www.googletagmanager.com',
  'googletagmanager.com',
  'stats.g.doubleclick.net',
  'www.googleadservices.com',
  'pagead2.googlesyndication.com',
  'google.com',
  'www.google.com',
  'www.google.com.au',
  'google.co.uk',
  'www.google.co.uk',
  'WWW.GOOGLE.CO.UK',
  'www.google.co.uk.',
  'www.google.de',
  'www.google.co.jp',
  'www.google.com.br',
  'adservice.google.co.nz',
  'example.com',
  'notgoogle.com',
  'google.example.com',
  'googletagmanager.com.example.test',
];

/** The proof's answer for each address, from checker.mjs loaded by Node itself. */
function proofReads(urls: string[]): boolean[] {
  const code =
    'const { isGoogleUrl } = await import(process.argv[1]);' +
    'process.stdout.write(JSON.stringify(JSON.parse(process.argv[2]).map((u) => isGoogleUrl(u))));';
  const out = execFileSync(process.execPath, ['--input-type=module', '-e', code, CHECKER, JSON.stringify(urls)], {
    encoding: 'utf8',
  });
  return JSON.parse(out);
}

describe('one Google host rule for the site and the proof (spec E44)', () => {
  it('[AC-K1g] the proof calls Google every host the site calls Google', () => {
    const urls = HOSTS.map((host) => `https://${host}/g/collect?v=2&tid=G-RK33F1ZD1H`);
    const site = urls.map((url) => isGoogleAddress(url));
    const proof = proofReads(urls);
    expect(proof).toHaveLength(urls.length);
    expect(urls.filter((url, i) => site[i] && !proof[i])).toEqual([]);
    // Positive controls: the list holds hosts the site calls Google and hosts it does not.
    expect(site.filter(Boolean).length).toBeGreaterThanOrEqual(18);
    expect(site.filter((v) => !v).length).toBeGreaterThanOrEqual(3);
  });

  it('[AC-K1g] the site and the proof read the host rule from one file', () => {
    expect(existsSync(HOST_RULE)).toBe(true);
    const rule = JSON.parse(readFileSync(HOST_RULE, 'utf8')) as { collectionHosts: string[]; tagHost: string };
    const named = [...rule.collectionHosts, rule.tagHost].map((host) => `https://www.${host}/x`);
    expect(named.length).toBeGreaterThanOrEqual(6);
    expect(named.every((url) => isGoogleAddress(url))).toBe(true);
    expect(proofReads(named).every(Boolean)).toBe(true);
    const checkerSource = readFileSync(path.join(WEB, 'scripts/analytics-proof/lib/checker.mjs'), 'utf8');
    expect(checkerSource).toMatch(/google-hosts\.json/);
  });
});
