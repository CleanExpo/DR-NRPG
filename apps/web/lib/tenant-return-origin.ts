/**
 * Trusted origin for customer-facing return/redirect links (Wave 1, review round 5).
 *
 * White-label tenants (PRO/ENTERPRISE) are served on their own registered custom
 * domain or on <subdomain>.<BASE_DOMAIN>. Links generated for a signed-in tenant
 * user must return there, not to the platform host. The origin is read ONLY from
 * the database (the user's own tenantId -> Tenant.domain / Tenant.subdomain);
 * request Host/Origin headers, x-tenant-* headers and request bodies are never
 * trusted. Anything unresolvable falls back to SITE_URL (platform flows).
 */
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo/site-url';
import { getTenantBaseDomain } from '@/lib/tenant-resolver';

// A bare DNS host name: labels of [a-z0-9-], at least one dot, no port/path/userinfo.
const HOST_NAME = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function hostOrigin(host: string | null | undefined): string | null {
  const value = host?.trim().toLowerCase();
  return value && HOST_NAME.test(value) ? `https://${value}` : null;
}

/** The registered origin of an active tenant, or SITE_URL. */
export async function getTenantReturnOrigin(tenantId: string | null | undefined): Promise<string> {
  if (!tenantId) return SITE_URL;
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { domain: true, subdomain: true, isActive: true },
  });
  if (!tenant?.isActive) return SITE_URL;

  const custom = hostOrigin(tenant.domain);
  if (custom) return custom;

  const subdomain = tenant.subdomain?.trim().toLowerCase();
  if (subdomain && LABEL.test(subdomain)) {
    const origin = hostOrigin(`${subdomain}.${getTenantBaseDomain()}`);
    if (origin) return origin;
  }
  return SITE_URL;
}

/** Trusted return origin for the signed-in user: their own tenant's domain, else SITE_URL. */
export function getUserReturnOrigin(user: { tenantId?: string | null } | null | undefined): Promise<string> {
  return getTenantReturnOrigin(user?.tenantId ?? null);
}

/**
 * A client-supplied absolute return URL is honoured only when its origin is
 * exactly one of `allowedOrigins` (https, no userinfo); otherwise undefined.
 */
export function allowedReturnUrl(url: string | undefined, allowedOrigins: string[]): string | undefined {
  if (!url) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return undefined;
  return allowedOrigins.includes(parsed.origin) ? parsed.href : undefined;
}
