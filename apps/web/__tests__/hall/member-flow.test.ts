/** @jest-environment node */
import { webcrypto } from 'node:crypto';
import { prepareHallReceipt } from '../../lib/hall/receiving';
import { createMemberSubmitter, hallLoginReturn, memberProfile } from '../../lib/hall/member-flow';
const env = { NRPG_HALL_RECEIVING_ENABLED: 'true', NRPG_HALL_RECIPIENT_ORGANISATION_ID: 'ccw-approved', NRPG_HALL_SOURCE_REVISION: 'a'.repeat(40), NRPG_HALL_APPROVED_PRODUCT_IDS: 'ccw-probe', NRPG_HALL_CATALOGUE_VERSION: 'approved-v1', NRPG_HALL_CONSENT_VERSION: 'consent-v1' };
const profile = memberProfile(env)!;
const draft = { name: 'Synthetic', email: 'synthetic@example.invalid', question: 'Synthetic enquiry', productId: 'ccw-probe' };
const context = () => ({ origin: 'https://nrpg.business', confirmed: true, csrfToken: 'synthetic-csrf', eventId: 'event-001', nonce: 'nonce-001', expiresAt: 10000, now: () => 1000 });
Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto });
const expectedHash = prepareHallReceipt({ eventId: 'event-001', name: draft.name, email: draft.email, question: draft.question, productIds: [draft.productId], consent: { granted: true, recipientProduct: 'ccw-erp', recipientOrganisationId: profile.recipientOrganisationId, purpose: 'supplier-enquiry', version: profile.consentVersion, reference: 'member-event-001' } }, profile).payloadHash;
const receipt = () => ({ status: 'received', eventId: 'event-001', payloadHash: expectedHash, reference: 'hall-' + 'a'.repeat(64), duplicate: false, deliveryStatus: 'held' });
const response = (value = receipt(), status = 201) => ({ status, json: async () => value }) as Response;

test('profile flags, mock database, missing source and unknown UI catalogue fail closed', () => {
 expect(memberProfile(env)).not.toBeNull();
 for (const patch of [{ NRPG_HALL_RECEIVING_ENABLED: 'false' }, { USE_MOCK_DB: 'true' }, { NRPG_HALL_SOURCE_REVISION: undefined }, { NRPG_HALL_APPROVED_PRODUCT_IDS: 'unknown' }, { NRPG_HALL_APPROVED_PRODUCT_IDS: 'toString' }, { NRPG_HALL_APPROVED_PRODUCT_IDS: '__proto__' }]) expect(memberProfile({ ...env, ...patch })).toBeNull();
 expect(hallLoginReturn('/hall/enquiry')).toBe('/hall/enquiry');
 for (const value of ['https://evil.invalid', '//evil.invalid', '/hall/enquiry?email=synthetic', '/dashboard/admin']) expect(hallLoginReturn(value)).toBeNull();
});
test('bad origin, expired window, missing consent/CSRF and owner injection never post', async () => {
 const send = jest.fn();
 for (const patch of [{ origin: 'https://cleanexpo247-hall.vercel.app' }, { expiresAt: 999 }, { confirmed: false }, { csrfToken: '' }]) expect((await createMemberSubmitter().submit(draft, profile, { ...context(), ...patch }, send)).status).toBe('draft');
 expect((await createMemberSubmitter().submit({ ...draft, ownerId: 'other' } as any, profile, context(), send)).status).toBe('draft'); expect(send).not.toHaveBeenCalled();
});
test('held source acknowledgement matches immutable event, uses only same-origin POST, and cannot replay', async () => {
 const submitter = createMemberSubmitter(), send = jest.fn(async () => response());
 expect((await submitter.submit(draft, profile, context(), send)).status).toBe('received-held');
 const [url, options] = send.mock.calls[0] as any; expect(url).toBe('/api/hall/enquiries'); expect(url).not.toContain(draft.email); expect(options.credentials).toBe('same-origin'); expect(options.headers['X-CSRF-Token']).toBe('synthetic-csrf');
 expect((await submitter.submit(draft, profile, { ...context(), nonce: 'nonce-002' }, send)).status).toBe('draft'); expect(send).toHaveBeenCalledTimes(1);
});
test('wrong event, pending ack, sensitive extra fields and absent source receipt never claim received', async () => {
 for (const value of [{ ...receipt(), eventId: 'other' }, { ...receipt(), payloadHash: 'wrong' }, { ...receipt(), deliveryStatus: 'pending' }, { ...receipt(), ownerId: 'private' }, { status: 'committed' }]) {
  const send = jest.fn(async () => response(value as any)); expect((await createMemberSubmitter().submit(draft, profile, context(), send)).status).toBe('unverified');
 }
 expect((await createMemberSubmitter().submit(draft, profile, context(), jest.fn(async () => response(undefined, 503)))).status).toBe('not_connected');
});
test('no acknowledgement before durable response and stale or expired in-flight response is rejected', async () => {
 let resolve!: (value: Response) => void; const submitter = createMemberSubmitter(); const pending = submitter.submit(draft, profile, context(), jest.fn(() => new Promise<Response>(r => { resolve = r; })));
 let settled = false; void pending.then(() => { settled = true; }); await new Promise(r => setTimeout(r, 10)); expect(settled).toBe(false);
 submitter.invalidate(); resolve(response()); expect((await pending).status).toBe('unverified');
 let now = 1000; const expired = createMemberSubmitter(); const wait = expired.submit(draft, profile, { ...context(), now: () => now }, jest.fn(() => new Promise<Response>(r => { resolve = r; })));
 await new Promise(r => setTimeout(r, 10)); now = 10000; resolve(response()); expect((await wait).status).toBe('unverified');
});

test('a used request nonce cannot post again even after disconnected response', async () => {
 const submitter = createMemberSubmitter(), send = jest.fn(async () => response(undefined, 503));
 expect((await submitter.submit(draft, profile, context(), send)).status).toBe('not_connected');
 expect((await submitter.submit(draft, profile, { ...context(), eventId: 'event-002' }, send)).status).toBe('draft'); expect(send).toHaveBeenCalledTimes(1);
});
