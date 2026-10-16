/**
 * Origin of the deployment this server runs in, for server-side self-probes
 * (the health routes). Only platform configuration chooses it; the request's
 * Host / X-Forwarded-Host never does (SSRF, CodeQL js/request-forgery #150, #151).
 *
 * - Vercel preview or development deployment: https://$VERCEL_URL, the host Vercel
 *   assigns to this deployment, so a preview probes itself, not production.
 * - Local `next dev` (no VERCEL_ENV): http://localhost:$PORT (default 3000).
 * - Production, or a value that is not a bare host / port: SITE_URL.
 */
import { SITE_URL } from '@/lib/seo/site-url';

// A bare DNS host name: labels of [a-z0-9-], at least one dot, no port/path/userinfo.
const HOST_NAME = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const PORT = /^[0-9]{1,5}$/;

export function deploymentOrigin(env: NodeJS.ProcessEnv = process.env): string {
  const vercelEnv = env.VERCEL_ENV?.trim();
  if (vercelEnv && vercelEnv !== 'production') {
    const host = env.VERCEL_URL?.trim().toLowerCase();
    return host && HOST_NAME.test(host) ? `https://${host}` : SITE_URL;
  }
  if (!vercelEnv && env.NODE_ENV === 'development') {
    const port = env.PORT?.trim() || '3000';
    return PORT.test(port) ? `http://localhost:${port}` : SITE_URL;
  }
  return SITE_URL;
}
