/**
 * Which requests the analytics browser test treats as going to Google, and
 * which one of them is the library load (spec E44).
 *
 * The host lists come from src/lib/google-hosts.json, the file the site's gate
 * and the proof scripts read, so this test can never call fewer hosts Google
 * than the site does. The parity test in
 * src/__tests__/hooks/client/analytics-host-parity.test.ts compares this rule
 * with the site's on the same addresses.
 */
import googleHosts from '../../src/lib/google-hosts.json';

const NAMED_HOSTS: readonly string[] = [...googleHosts.collectionHosts, googleHosts.tagHost];
const GOOGLE_SITE_HOST = new RegExp(googleHosts.googleSitePattern);

/** True for an http or https address on a host the site calls Google. */
export function isGoogleUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  // "example.com." and "example.com" are the same host to the browser.
  const host = parsed.hostname.toLowerCase().replace(/\.$/, '');
  return NAMED_HOSTS.some((name) => host === name || host.endsWith(`.${name}`)) || GOOGLE_SITE_HOST.test(host);
}

/**
 * The library load, in the one form the site asks for it: a script element's
 * GET of exactly https://www.googletagmanager.com/gtag/js?id=<id>. Anything
 * else to Google, the same address by another way included, is collection.
 */
export function isLibraryLoad(url: string, resourceType: string, method: string, measurementId: string): boolean {
  return (
    resourceType === 'script' &&
    method === 'GET' &&
    url === `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  );
}
