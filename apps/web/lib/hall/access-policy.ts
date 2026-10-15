/** Hall-only exclusion; never inferred from free-text questions; exact company contact names are identity. */
export interface HallBusinessIdentity {
  email?: unknown; domain?: unknown; website?: unknown;
  businessName?: unknown; tradingName?: unknown; abn?: unknown;
}
const normalise = (value: unknown) => typeof value === 'string' ? value.normalize('NFKC').replace(/\p{Cf}/gu, '').trim().toLowerCase() : '';
function blockedDomain(value: unknown, email = false) {
  const text = normalise(value);
  if (!text) return false;
  try {
    if (email && !/^[^\s@]+@[^\s@]+$/.test(text)) return false;
    const domain = email ? text.split('@')[1] : text;
    const url = new URL(domain.includes('://') ? domain : 'https://' + domain);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || (email && (url.pathname !== '/' || url.search || url.hash || url.port))) return false;
    const host = url.hostname.replace(/\.$/, '');
    return host === 'coach8.com.au' || host.endsWith('.coach8.com.au');
  } catch { return false; }
}
export function hallIdentityExcluded(identity: HallBusinessIdentity): boolean {
  const names = [identity.businessName, identity.tradingName].map(value => normalise(value).replace(/[\s\p{P}]/gu, ''));
  const abn = normalise(identity.abn);
  return names.some(name => name === 'coach8' || name === 'coach8ptyltd' || name === 'coach8ptylimited') ||
    (/^[\d\s.-]+$/.test(abn) && abn.replace(/\D/g, '') === '62664157573') ||
    blockedDomain(identity.email, true) || blockedDomain(identity.domain) || blockedDomain(identity.website);
}
