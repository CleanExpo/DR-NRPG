/**
 * Upstash REST config, read safely (DR-1011).
 *
 * The production deploy builds on a GitHub runner after `vercel pull`. That
 * command cannot read Sensitive variables and writes the literal "[SENSITIVE]"
 * in their place. `new Redis({ url: "[SENSITIVE]" })` throws a UrlError, and a
 * module that builds its client at import time then fails `next build` while
 * page data is collected.
 *
 * This returns a config only for an https URL and a real token. Anything else
 * (unset, empty, placeholder, plain http) returns null, and callers fall back to
 * their no-Redis path. At runtime on Vercel the real values are present, so the
 * modules are evaluated again with a valid config.
 */
export interface UpstashRestConfig {
  url: string;
  token: string;
}

const PLACEHOLDER = /^\[[A-Z_ ]+\]$/;

export function getUpstashRestConfig(
  env: NodeJS.ProcessEnv = process.env
): UpstashRestConfig | null {
  const url = env.UPSTASH_REDIS_REST_URL?.trim() ?? '';
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? '';
  if (!url.startsWith('https://')) return null;
  if (!token || PLACEHOLDER.test(token)) return null;
  return { url, token };
}
