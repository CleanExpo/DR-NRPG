import { SITE_URL } from '@/lib/seo/site-url';

/** Resource URLs always use the canonical public origin (SITE_URL). */
export function resourceCanonical(path = '/resources'): string {
  if (!path.startsWith('/resources') || /[\\\u0000-\u0020]/.test(path)) {
    throw new Error('Invalid resource canonical path');
  }
  const canonical = new URL(path, SITE_URL);
  if (canonical.origin !== SITE_URL || (canonical.pathname !== '/resources' && !canonical.pathname.startsWith('/resources/'))) {
    throw new Error('Invalid resource canonical path');
  }
  canonical.search = '';
  canonical.hash = '';
  return canonical.toString();
}
