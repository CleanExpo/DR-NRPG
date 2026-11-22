/**
 * The one place the app decides which client IP to believe.
 *
 * The app is deployed on Vercel (project dr-nrpg-platform, root apps/web; see
 * .github/workflows/deploy-production.yml). Cloudflare is not proxied in front
 * of it: docs/guides/CUSTOM-DOMAIN-SETUP.md requires Cloudflare DNS to be
 * "DNS only" (grey cloud). So the trust rule is:
 *
 * 1. `x-vercel-forwarded-for`: set by Vercel's edge from the TCP peer.
 * 2. Otherwise the right-most `x-forwarded-for` entry: the hop the nearest
 *    proxy appended. Vercel overwrites this header with the client IP; nginx
 *    with `$proxy_add_x_forwarded_for` appends the peer last. Earlier entries
 *    are whatever the caller sent and are never used.
 * 3. Otherwise the fixed bucket `'unknown'`.
 *
 * `cf-connecting-ip` and `x-real-ip` are deliberately ignored: with no
 * Cloudflare proxy in front, a caller can set them to any value and get a fresh
 * rate-limit bucket on every request. Values that are not shaped like an IP
 * address are treated as absent.
 */

export const UNKNOWN_CLIENT_IP = 'unknown';

type HeaderGetter = (name: string) => string | null | undefined;

/** An IPv4 or IPv6 literal (optionally with an IPv4 port), at most 45 chars. */
const IP_SHAPE = /^[0-9A-Fa-f:.]{2,45}$/;

function lastEntry(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const entries = value.split(',').map((entry) => entry.trim()).filter(Boolean);
  const last = entries[entries.length - 1];
  return last && IP_SHAPE.test(last) ? last : undefined;
}

/** Resolve the client IP from a header getter (for non-`Request` header shapes). */
export function clientIpFromHeaders(get: HeaderGetter): string {
  return (
    lastEntry(get('x-vercel-forwarded-for')) ??
    lastEntry(get('x-forwarded-for')) ??
    UNKNOWN_CLIENT_IP
  );
}

/** Resolve the client IP of a request. Use this for every limiter and IP record. */
export function getClientIp(request: { headers: Pick<Headers, 'get'> } | null | undefined): string {
  const headers = request?.headers;
  if (!headers || typeof headers.get !== 'function') return UNKNOWN_CLIENT_IP;
  return clientIpFromHeaders((name) => headers.get(name));
}

/** As `getClientIp`, but `null` instead of the `'unknown'` bucket (for stored records). */
export function getClientIpOrNull(request: { headers: Pick<Headers, 'get'> } | null | undefined): string | null {
  const ip = getClientIp(request);
  return ip === UNKNOWN_CLIENT_IP ? null : ip;
}
