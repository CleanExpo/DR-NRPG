import { TenantService, TenantConfig } from './tenant-service';

export interface TenantResolution {
  tenantId: string;
  tenant: TenantConfig;
}

/**
 * Resolve tenant from request context following priority order:
 * 1. x-tenant-id header (explicit tenant ID from client)
 * 2. Subdomain extraction (e.g., acme.disasterrecovery.com.au → "acme")
 * 3. Custom domain lookup (e.g., acmerestoration.com → tenant with domain="acmerestoration.com")
 * 4. null (no tenant resolved - treated as public/unauthenticated request)
 *
 * Used in auth-middleware.ts to populate AuthContext.tenantId when user.tenantId is null.
 */
export async function resolveTenant(
  hostname: string | null,
  tenantIdHeader: string | null
): Promise<TenantResolution | null> {
  // Priority 1: Explicit tenant ID from header (e.g., API clients, testing, admin impersonation)
  if (tenantIdHeader) {
    const tenant = await TenantService.getTenantById(tenantIdHeader);
    if (tenant) {
      return {
        tenantId: tenant.id,
        tenant,
      };
    }
  }

  // Priority 2 & 3: Domain-based resolution (subdomain or custom domain)
  if (hostname) {
    const baseDomain = process.env.BASE_DOMAIN || 'disasterrecovery.com.au';

    // Check if this is a subdomain of the base domain
    if (hostname.endsWith(`.${baseDomain}`)) {
      // Extract subdomain (e.g., "acme.disasterrecovery.com.au" → "acme")
      const subdomain = hostname.replace(`.${baseDomain}`, '');

      // Exclude www and other reserved subdomains
      if (subdomain && subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'admin') {
        const tenant = await TenantService.getTenantByDomain(subdomain);
        if (tenant) {
          return {
            tenantId: tenant.id,
            tenant,
          };
        }
      }
    } else if (hostname !== baseDomain && hostname !== `www.${baseDomain}`) {
      // This is a custom domain - look it up in tenant table
      const tenant = await TenantService.getTenantByDomain(hostname);
      if (tenant) {
        return {
          tenantId: tenant.id,
          tenant,
        };
      }
    }
  }

  // No tenant resolved
  return null;
}

/**
 * Extract hostname from Next.js request headers.
 * Used in middleware to forward hostname to API routes.
 */
export function extractHostname(request: Request): string | null {
  // Check standard headers in priority order
  const hostname =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    null;

  return hostname;
}
