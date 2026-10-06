/** @jest-environment node */
import { hallIdentityExcluded } from '../../lib/hall/access-policy';
import { prepareHallReceipt, receiveHallEnquiry, resolveHallActor } from '../../lib/hall/receiving';
const user = { id: 'user-a', tenantId: 'tenant-a', email: 'member@example.invalid', isEmailVerified: true, isActive: true, isBlocked: false, tenant: { isActive: true, name: 'Unrelated organisation' } };
const session = { user: { id: 'user-a', tenantId: 'tenant-a', email: 'spoof@example.invalid' } };
test.each([
 { businessName: 'Coach8' }, { businessName: 'Coach\u200b8' }, { businessName: 'Coach8 Pty Limited' }, { businessName: ' Coach 8 Pty. Ltd ' }, { tradingName: 'Ｃｏａｃｈ８' },
 { email: 'Member@Coach8.com.au' }, { email: 'member@sub.coach8.com.au' }, { domain: 'coach8.com.au.' },
 { website: 'https://sub.coach8.com.au/path' }, { abn: '62 664 157 573' },
])('fixed policy excludes identified alias %j', value => expect(hallIdentityExcluded(value)).toBe(true));
test.each([
 { businessName: 'Coach81' }, { businessName: 'Enquiry about Coach8' }, { domain: 'coach8.com.au.example.invalid' },
 { email: 'coach8@other.example' }, { email: 'member@notcoach8.com.au' }, { website: 'https://example.invalid/coach8.com.au' },
 { website: 'https://coach8.com.au@example.invalid' }, { abn: '62664157574' },
])('unrelated identity remains eligible %j', value => expect(hallIdentityExcluded(value)).toBe(false));
test('trusted identity defeats session spoofing across every stored identity source', async () => {
 const findUnique = jest.fn().mockResolvedValue(user); const db = { user: { findUnique } };
 expect(await resolveHallActor(db, session)).toEqual({ userId: 'user-a', tenantId: 'tenant-a' });
 for (const patch of [ { email: 'member@coach8.com.au' }, { tenant: { ...user.tenant, name: 'Coach8 Pty Ltd' } },
   { tenant: { ...user.tenant, domain: 'coach8.com.au' } }, { contractor: { businessName: 'Coach8' } },
   { contractor: { abnNumber: '62664157573' } }, { contractorProfile: { businessName: 'Coach8' } },
   ...['companyName', 'tradingName', 'abn', 'website', 'companyEmail'].map(key => ({ contractorProfile: { ContractorCompany: {
     [key]: ({ companyName: 'Coach8', tradingName: 'Coach8', abn: '62664157573', website: 'https://coach8.com.au', companyEmail: 'm@coach8.com.au' } as any)[key],
   } } })) ]) {
   findUnique.mockResolvedValue({ ...user, ...patch }); expect(await resolveHallActor(db, session)).toBeNull();
 }
});
const profile = { recipientOrganisationId: 'ccw-approved', approvedProductIds: ['ccw-probe'], catalogueVersion: 'v1', sourceRevision: 'a'.repeat(40), consentVersion: 'v1' };
const input = { eventId: 'event-a', name: 'Unrelated', email: 'member@example.invalid', question: 'A supplier enquiry about equipment', productIds: ['ccw-probe'], consent: { granted: true, recipientProduct: 'ccw-erp', recipientOrganisationId: 'ccw-approved', purpose: 'supplier-enquiry', version: 'v1', reference: 'c-a' } };
test('otherwise eligible member cannot submit an excluded alternate contact', () => {
 expect(() => prepareHallReceipt({ ...input, email: 'alternate@coach8.com.au' }, profile)).toThrow('INVALID_ENQUIRY');
 expect(() => prepareHallReceipt({ ...input, name: ' Coach 8 Pty. Ltd ' }, profile)).toThrow('INVALID_ENQUIRY');
 expect(prepareHallReceipt({ ...input, question: 'An unrelated enquiry mentioning Coach8' }, profile)).toBeDefined();
});
test('identity changed after initial access denies transaction before persistence', async () => {
 const create = jest.fn(); const tx = { user: { findUnique: jest.fn(async () => ({ ...user, email: 'm@coach8.com.au' })) },
   $queryRaw: jest.fn(), backgroundJob: { create }, contactEnquiry: { create } };
 const db = { $transaction: jest.fn(async callback => callback(tx)) };
 await expect(receiveHallEnquiry(db, { userId: 'user-a', tenantId: 'tenant-a' }, prepareHallReceipt(input, profile))).rejects.toThrow('ACTOR_REQUIRED');
 expect(create).not.toHaveBeenCalled(); expect(tx.$queryRaw).toHaveBeenCalledTimes(2);
});
