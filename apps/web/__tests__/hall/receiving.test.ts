/** @jest-environment node */
import { prepareHallReceipt, receiveHallEnquiry, resolveHallActor } from '../../lib/hall/receiving';
const profile = { recipientOrganisationId: 'ccw-approved', approvedProductIds: ['ccw-probe'], catalogueVersion: 'approved-v1', sourceRevision: 'a'.repeat(40), consentVersion: 'consent-v1' };
const input = () => ({ eventId: 'event-1', name: 'Synthetic', email: 'synthetic@example.invalid', question: 'A synthetic supplier enquiry', productIds: ['ccw-probe'], consent: { granted: true, recipientProduct: 'ccw-erp', recipientOrganisationId: 'ccw-approved', purpose: 'supplier-enquiry', version: 'consent-v1', reference: 'consent-1' } });
const session = { user: { id: 'user-a', tenantId: 'tenant-a' } };
const user = { id: 'user-a', tenantId: 'tenant-a', isEmailVerified: true, isActive: true, isBlocked: false, tenant: { isActive: true } };

test('missing actor causes no database access; current membership is mandatory', async () => {
 const findUnique = jest.fn().mockResolvedValue(user); const db = { user: { findUnique } };
 expect(await resolveHallActor(db, null)).toBeNull(); expect(findUnique).not.toHaveBeenCalled();
 expect(await resolveHallActor(db, session)).toEqual({ userId: 'user-a', tenantId: 'tenant-a' });
 for (const patch of [{ isActive: false }, { isBlocked: true }, { isEmailVerified: false }, { tenantId: 'tenant-b' }, { tenant: { isActive: false } }]) {
  findUnique.mockResolvedValue({ ...user, ...patch }); expect(await resolveHallActor(db, session)).toBeNull();
 }
});
test('strict consent and reviewed product binding reject forged fields', () => {
 expect(prepareHallReceipt(input(), profile).payload.sourceProduct).toBe('dr-nrpg');
 for (const patch of [{ recipientProduct: 'restoreassist' }, { recipientOrganisationId: 'other' }, { granted: false }, { version: 'other' }]) {
  const value = input(); Object.assign(value.consent, patch); expect(() => prepareHallReceipt(value, profile)).toThrow();
 }
 expect(() => prepareHallReceipt({ ...input(), tenantId: 'other' }, profile)).toThrow();
 expect(() => prepareHallReceipt({ ...input(), productIds: ['other'] }, profile)).toThrow();
 expect(() => prepareHallReceipt({ ...input(), productIds: ['ccw-probe', 'ccw-probe'] }, profile)).toThrow();
});
test('source transaction binds tenant and owner and holds delivery', async () => {
 let stored: any; const jobCreate = jest.fn(async ({ data }) => { stored = data; });
 const tx = { user: { findUnique: jest.fn(async () => user) }, $queryRaw: jest.fn(), backgroundJob: { findFirst: jest.fn(async () => stored), create: jobCreate }, contactEnquiry: { create: jest.fn(), findUnique: jest.fn(async () => ({ id: stored.input.reference })) } };
 const db = { $transaction: jest.fn(async callback => callback(tx)) };
 const prepared = prepareHallReceipt(input(), profile), actor = { userId: 'user-a', tenantId: 'tenant-a' };
 expect(await receiveHallEnquiry(db, actor, prepared)).toMatchObject({ duplicate: false, deliveryStatus: 'held' });
 expect(JSON.stringify(stored.input)).not.toContain('synthetic@example.invalid');
 expect(JSON.stringify(stored.input)).not.toContain('A synthetic supplier enquiry');
 expect(stored).toMatchObject({ status: 'HELD', jobType: 'HALL_ENQUIRY_HANDOFF', tenantId: 'tenant-a', initiatedBy: 'user-a' });
 expect(await receiveHallEnquiry(db, actor, prepared)).toMatchObject({ duplicate: true }); expect(jobCreate).toHaveBeenCalledTimes(1);
 await expect(receiveHallEnquiry(db, actor, { ...prepared, payloadHash: 'changed' })).rejects.toThrow('IDEMPOTENCY_CONFLICT');
 stored.input.tenantId = 'tenant-b'; await expect(receiveHallEnquiry(db, actor, prepared)).rejects.toThrow('RECEIVING_UNVERIFIED');
});

test('transaction rechecks current membership before inserting', async () => {
 const tx = { user: { findUnique: jest.fn(async () => ({ ...user, tenantId: 'tenant-b' })) }, $queryRaw: jest.fn() };
 const db = { $transaction: jest.fn(async callback => callback(tx)) };
 await expect(receiveHallEnquiry(db, { userId: 'user-a', tenantId: 'tenant-a' }, prepareHallReceipt(input(), profile))).rejects.toThrow('ACTOR_REQUIRED');
 expect(tx.$queryRaw).toHaveBeenCalledTimes(2);
});
