import type { HallProfile } from './receiving';

// Display labels for this first member slice, from the existing Hall catalogue.
const labels: Readonly<Record<string, string>> = {
  'ccw-totalcheck': 'Delmhorst TotalCheck 3 in 1',
  'ccw-techcheck': 'Delmhorst TechCheck Plus 2 in 1',
  'ccw-probe': 'Delmhorst 21-E Deep Wall Probe',
};
export function memberProfile(env: Record<string, string | undefined>): HallProfile | null {
  if (env.NRPG_HALL_RECEIVING_ENABLED !== 'true' || env.USE_MOCK_DB === 'true' ||
      !env.NRPG_HALL_RECIPIENT_ORGANISATION_ID || !env.NRPG_HALL_SOURCE_REVISION ||
      !env.NRPG_HALL_APPROVED_PRODUCT_IDS || !env.NRPG_HALL_CATALOGUE_VERSION || !env.NRPG_HALL_CONSENT_VERSION) return null;
  const ids = env.NRPG_HALL_APPROVED_PRODUCT_IDS.split(',');
  if (!/^[\w-]{1,120}$/.test(env.NRPG_HALL_RECIPIENT_ORGANISATION_ID) || !/^[a-f0-9]{40}$/.test(env.NRPG_HALL_SOURCE_REVISION) ||
      !ids.length || ids.some(id => !Object.prototype.hasOwnProperty.call(labels, id)) || new Set(ids).size !== ids.length) return null;
  return { recipientOrganisationId: env.NRPG_HALL_RECIPIENT_ORGANISATION_ID, sourceRevision: env.NRPG_HALL_SOURCE_REVISION,
    approvedProductIds: ids, catalogueVersion: env.NRPG_HALL_CATALOGUE_VERSION, consentVersion: env.NRPG_HALL_CONSENT_VERSION };
}
export const productLabel = (id: string) => Object.prototype.hasOwnProperty.call(labels, id) ? labels[id] : null;
export function hallLoginReturn(value: string | null) { return value === '/hall/enquiry' ? value : null; }
interface Draft { name: string; email: string; question: string; productId: string }
interface Context { origin: string; confirmed: boolean; csrfToken: string; eventId: string; nonce: string; expiresAt: number; now: () => number }
export function createMemberSubmitter() {
  let generation = 0; const accepted = new Set<string>(); const nonces = new Set<string>();
  return {
    invalidate() { generation++; },
    async submit(draft: Draft, profile: HallProfile, context: Context, send: typeof fetch) {
      if (context.origin !== 'https://nrpg.business' || !context.confirmed || !context.csrfToken || context.now() >= context.expiresAt ||
          context.expiresAt - context.now() > 300000 || !/^[\w-]{1,120}$/.test(context.eventId) || !/^[\w-]{1,120}$/.test(context.nonce) ||
          accepted.has(context.eventId) || nonces.has(context.nonce) || Object.keys(draft).some(k => !['name', 'email', 'question', 'productId'].includes(k)) ||
          !profile.approvedProductIds.includes(draft.productId)) return { status: 'draft' as const };
      nonces.add(context.nonce);
      const ticket = ++generation;
      const payload = { eventId: context.eventId, name: draft.name.trim(), email: draft.email.trim(), question: draft.question.trim(), productIds: [draft.productId],
        consent: { granted: true, recipientProduct: 'ccw-erp', recipientOrganisationId: profile.recipientOrganisationId,
          purpose: 'supplier-enquiry', version: profile.consentVersion, reference: 'member-' + context.eventId } };
      try {
        const fingerprint = { ...payload, sourceProduct: 'dr-nrpg', source: 'nrpg-trade-show-hall', sourceRevision: profile.sourceRevision, catalogueVersion: profile.catalogueVersion };
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(fingerprint)));
        const payloadHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
        if (ticket !== generation || context.now() >= context.expiresAt) return { status: 'unverified' as const };
        const response = await send('/api/hall/enquiries', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': context.csrfToken }, body: JSON.stringify(payload) });
        if (ticket !== generation) return { status: 'unverified' as const };
        if (response.status === 503) return { status: 'not_connected' as const };
        if (![200, 201].includes(response.status)) return { status: 'unverified' as const };
        const receipt = await response.json();
        if (ticket !== generation || context.now() >= context.expiresAt || !receipt || receipt.status !== 'received' || receipt.eventId !== context.eventId || receipt.payloadHash !== payloadHash ||
            receipt.deliveryStatus !== 'held' || typeof receipt.duplicate !== 'boolean' || !/^hall-[a-f0-9]{64}$/.test(receipt.reference || '') ||
            Object.keys(receipt).some(k => !['status', 'eventId', 'payloadHash', 'reference', 'duplicate', 'deliveryStatus'].includes(k))) return { status: 'unverified' as const };
        accepted.add(context.eventId);
        return { status: 'received-held' as const };
      } catch { return { status: 'unverified' as const }; }
    },
  };
}
