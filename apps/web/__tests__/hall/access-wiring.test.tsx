/** @jest-environment node */
jest.mock('../../lib/auth', () => ({ authOptions: {} }));
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('../../lib/prisma', () => ({ basePrisma: { user: { findUnique: jest.fn() }, $transaction: jest.fn() } }));
jest.mock('../../lib/middleware/csrf-middleware', () => ({ requireCSRFProtection: jest.fn(async () => null) }));
jest.mock('../../lib/api/redis-rate-limit', () => ({ createRedisRateLimiter: jest.fn(() => jest.fn(async () => null)) }));
jest.mock('../../app/hall/enquiry/MemberEnquiry', () => ({ __esModule: true, default: jest.fn(() => null) }));
import { renderToStaticMarkup } from 'react-dom/server';
import { getServerSession } from 'next-auth';
import { basePrisma } from '../../lib/prisma';
import Page from '../../app/hall/enquiry/page';
import MemberEnquiry from '../../app/hall/enquiry/MemberEnquiry';
import { POST } from '../../app/api/hall/enquiries/route';
import { NextRequest } from 'next/server';
const keys = ['NRPG_HALL_RECEIVING_ENABLED', 'NRPG_HALL_RECIPIENT_ORGANISATION_ID', 'NRPG_HALL_SOURCE_REVISION', 'NRPG_HALL_APPROVED_PRODUCT_IDS', 'NRPG_HALL_CATALOGUE_VERSION', 'NRPG_HALL_CONSENT_VERSION', 'USE_MOCK_DB'];
const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
afterAll(() => { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } });
beforeEach(() => {
 jest.clearAllMocks(); Object.assign(process.env, { NRPG_HALL_RECEIVING_ENABLED: 'true', NRPG_HALL_RECIPIENT_ORGANISATION_ID: 'ccw-approved', NRPG_HALL_SOURCE_REVISION: 'a'.repeat(40), NRPG_HALL_APPROVED_PRODUCT_IDS: 'ccw-probe', NRPG_HALL_CATALOGUE_VERSION: 'v1', NRPG_HALL_CONSENT_VERSION: 'v1', USE_MOCK_DB: 'false' });
 (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-a', tenantId: 'tenant-a', email: 'spoof@example.invalid' } });
 (basePrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-a', tenantId: 'tenant-a', email: 'member@coach8.com.au', isEmailVerified: true, isActive: true, isBlocked: false, tenant: { isActive: true, name: 'Unrelated' } });
});
test('actual Hall page denies excluded stored identity without rendering member form', async () => {
 const html = renderToStaticMarkup(await Page());
 expect(html).toContain('verified, active NRPG member account is required');
 expect(html).not.toContain('Coach8'); expect(MemberEnquiry).not.toHaveBeenCalled();
});
test('actual Hall API denies excluded stored identity before transaction or enquiry persistence', async () => {
 const response = await POST(new NextRequest('https://nrpg.business/api/hall/enquiries', { method: 'POST', headers: { origin: 'https://nrpg.business', 'content-type': 'application/json' }, body: '{}' }));
 expect(response.status).toBe(401); expect(await response.json()).toEqual({ error: 'AUTHENTICATION_REQUIRED' });
 expect(basePrisma.$transaction).not.toHaveBeenCalled();
});
test('actual Hall API rejects excluded alternate contact for an eligible stored actor', async () => {
 (basePrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-a', tenantId: 'tenant-a', email: 'member@example.invalid', isEmailVerified: true, isActive: true, isBlocked: false, tenant: { isActive: true, name: 'Unrelated' } });
 const body = { eventId: 'event-a', name: 'Unrelated', email: 'alternate@coach8.com.au', question: 'A supplier enquiry about equipment', productIds: ['ccw-probe'], consent: { granted: true, recipientProduct: 'ccw-erp', recipientOrganisationId: 'ccw-approved', purpose: 'supplier-enquiry', version: 'v1', reference: 'c-a' } };
 const response = await POST(new NextRequest('https://nrpg.business/api/hall/enquiries', { method: 'POST', headers: { origin: 'https://nrpg.business', 'content-type': 'application/json' }, body: JSON.stringify(body) }));
 expect(response.status).toBe(400); expect(await response.json()).toEqual({ error: 'INVALID_ENQUIRY' });
 expect(basePrisma.$transaction).not.toHaveBeenCalled();
});
