/**
 * Canonical public origin for this app (Wave 1 SEO host fix).
 *
 * The NRPG platform is served at https://nrpg.business. disasterrecovery.com.au
 * belongs to the sibling consumer repo, and www.nrpg.business 301s to the apex
 * (next.config.mjs). metadataBase, canonicals, robots and sitemaps read this
 * constant rather than NEXT_PUBLIC_BASE_URL so a stale env value cannot point
 * search engines at another host.
 */
export const SITE_URL = 'https://nrpg.business';
