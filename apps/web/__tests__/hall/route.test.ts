/** @jest-environment node */
jest.mock('../../lib/auth', () => ({ authOptions: {} }));
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('../../lib/prisma', () => ({ basePrisma: {} }));
jest.mock('../../lib/middleware/csrf-middleware', () => ({ requireCSRFProtection: jest.fn() }));
jest.mock('../../lib/api/redis-rate-limit', () => ({ createRedisRateLimiter: jest.fn(() => jest.fn()) }));
jest.mock('../../lib/hall/receiving', () => ({ prepareHallReceipt: jest.fn(), receiveHallEnquiry: jest.fn(), resolveHallActor: jest.fn() }));
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/hall/enquiries/route';
import { requireCSRFProtection } from '../../lib/middleware/csrf-middleware';
import { receiveHallEnquiry, resolveHallActor } from '../../lib/hall/receiving';
const keys = ['NRPG_HALL_RECEIVING_ENABLED', 'NRPG_HALL_RECIPIENT_ORGANISATION_ID', 'NRPG_HALL_SOURCE_REVISION', 'NRPG_HALL_APPROVED_PRODUCT_IDS', 'NRPG_HALL_CATALOGUE_VERSION', 'NRPG_HALL_CONSENT_VERSION', 'USE_MOCK_DB'];
const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
afterAll(() => { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } });
beforeEach(() => { for (const key of keys) delete process.env[key]; jest.clearAllMocks(); });
function enable() { Object.assign(process.env, { NRPG_HALL_RECEIVING_ENABLED: 'true', NRPG_HALL_RECIPIENT_ORGANISATION_ID: 'ccw-approved', NRPG_HALL_SOURCE_REVISION: 'a'.repeat(40), NRPG_HALL_APPROVED_PRODUCT_IDS: 'ccw-probe', NRPG_HALL_CATALOGUE_VERSION: 'approved-v1', NRPG_HALL_CONSENT_VERSION: 'consent-v1' }); }
const request = (origin = 'https://nrpg.business') => new NextRequest('https://nrpg.business/api/hall/enquiries', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: '{}' });
test('disabled, partial profile and mock database cannot access auth or persistence', async () => {
 expect((await POST(request())).status).toBe(503);
 process.env.NRPG_HALL_RECEIVING_ENABLED = 'true'; expect((await POST(request())).status).toBe(503);
 enable(); process.env.USE_MOCK_DB = 'true'; expect((await POST(request())).status).toBe(503);
 expect(requireCSRFProtection).not.toHaveBeenCalled(); expect(receiveHallEnquiry).not.toHaveBeenCalled();
});
test('Hall separate-origin request and missing current actor cannot receive', async () => {
 enable(); expect((await POST(request('https://cleanexpo247-hall.vercel.app'))).status).toBe(403);
 (requireCSRFProtection as jest.Mock).mockResolvedValue(null); (resolveHallActor as jest.Mock).mockResolvedValue(null);
 expect((await POST(request())).status).toBe(401); expect(receiveHallEnquiry).not.toHaveBeenCalled();
});
