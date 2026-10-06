/** @jest-environment node */
jest.mock('../../lib/auth', () => ({ authOptions: {} }));
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('../../lib/prisma', () => ({ basePrisma: { user: { findUnique: jest.fn() } } }));
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { basePrisma } from '../../lib/prisma';
import { GET, HEAD } from '../../app/hall/view/[[...path]]/route';
import { hallProof, signHallProof } from '../../lib/hall/access-proof';
import { hallAssetPath, portalHtml } from '../../lib/hall/proxy-path';
import { hallLoginReturn } from '../../lib/hall/member-flow';
import vector from './fixtures/hall-proxy-vector.json';
const keys = ['NRPG_HALL_PROXY_SECRET', 'NRPG_HALL_PRODUCER_ORIGIN', 'NRPG_HALL_ISSUER_ORIGIN'];
const previous = Object.fromEntries(keys.map(key => [key, process.env[key]])); const originalFetch = global.fetch;
afterAll(() => { global.fetch = originalFetch; for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } });
const network = jest.fn();
beforeEach(() => {
 jest.clearAllMocks(); global.fetch = network;
 Object.assign(process.env, { NRPG_HALL_PROXY_SECRET: vector.secret, NRPG_HALL_PRODUCER_ORIGIN: vector.proof.aud, NRPG_HALL_ISSUER_ORIGIN: 'https://nrpg.business' });
 (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-a', tenantId: 'tenant-a' } });
 (basePrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-a', tenantId: 'tenant-a', email: 'eligible@example.invalid', isEmailVerified: true, isActive: true, isBlocked: false, tenant: { isActive: true } });
 network.mockResolvedValue(new Response('<base href="/trade-hall/">Hello', { headers: { 'content-type': 'text/html', 'set-cookie': 'not-forwarded' } }));
});
const request = (path = '/hall/view/index.html') => new NextRequest('https://nrpg.business' + path, { headers: { cookie: 'private-member-cookie', authorization: 'private-member-authorization' } });
const context = { params: { path: ['index.html'] } };
test('real producer HMAC fixture agrees byte for byte and proofs are short-lived distinct', () => {
 expect(Buffer.from(JSON.stringify(vector.proof)).toString('base64url')).toBe(vector.encoded); expect(signHallProof(vector.encoded, vector.secret)).toBe(vector.signature);
 const first = hallProof('GET', '/index.html', vector.secret, vector.now); const body = JSON.parse(Buffer.from(first['x-nrpg-hall-proof'], 'base64url').toString());
 expect(body).toMatchObject({ method: 'GET', path: '/index.html', aud: vector.proof.aud, exp: vector.now + 60 }); expect(body.nonce).toMatch(/^[a-f0-9]{32}$/);
 expect(Object.keys(body)).toEqual(['v', 'method', 'path', 'aud', 'exp', 'nonce']); expect(first['x-nrpg-hall-signature']).toBe(signHallProof(first['x-nrpg-hall-proof'], vector.secret));
 expect(hallProof('GET', '/index.html', vector.secret, vector.now)['x-nrpg-hall-proof']).not.toBe(first['x-nrpg-hall-proof']); expect(() => hallProof('GET', '/index.html', 'short')).toThrow();
});
test('blocked current actor denies every HTML and asset request without fetch or sign-in loop', async () => {
 (basePrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-a', tenantId: 'tenant-a', email: 'm@coach8.com.au', isEmailVerified: true, isActive: true, isBlocked: false, tenant: { isActive: true } });
 expect((await GET(request(), context)).status).toBe(403); expect((await HEAD(request(), { params: { path: ['logos', 'logo.png'] } })).status).toBe(403); expect(network).not.toHaveBeenCalled();
});
test('unauthenticated HTML entry uses narrow existing login callback; assets stay denied', async () => {
 (getServerSession as jest.Mock).mockResolvedValue(null); const response = await GET(request(), context); expect(response.status).toBe(307);
 expect(response.headers.get('location')).toBe('https://nrpg.business/login?callbackUrl=%2Fhall%2Fview%2Findex.html'); expect((await HEAD(request(), context)).status).toBe(401); expect(network).not.toHaveBeenCalled();
 expect(hallLoginReturn('/hall/view/index.html')).toBe('/hall/view/index.html'); expect(hallLoginReturn('//evil.invalid')).toBeNull(); expect(hallLoginReturn('/hall/view/evil')).toBeNull();
});
test('eligible member receives streamed content with proof only and no upstream cookies', async () => {
 const response = await GET(request(), context); expect(response.status).toBe(200); expect(await response.text()).toBe('<base href="/hall/view/">Hello');
 expect(response.headers.get('cache-control')).toBe('private, no-store'); expect(response.headers.has('set-cookie')).toBe(false); expect(response.headers.has('x-nrpg-hall-proof')).toBe(false);
 const [url, options] = network.mock.calls[0]; expect(url).toBe(vector.proof.aud + '/index.html'); expect(options.redirect).toBe('manual'); expect(Object.keys(options.headers)).toEqual(['x-nrpg-hall-proof', 'x-nrpg-hall-signature']);
 expect(JSON.stringify(options)).not.toContain('private-member'); expect(JSON.stringify(options)).not.toContain(vector.secret);
});
test.each(keys)('missing binding %s fails closed before fetch', async key => { delete process.env[key]; expect((await GET(request(), context)).status).toBe(503); expect(network).not.toHaveBeenCalled(); });
test('unapproved origin and upstream redirect fail closed', async () => {
 process.env.NRPG_HALL_PRODUCER_ORIGIN = 'https://example.invalid'; expect((await GET(request(), context)).status).toBe(503); expect(network).not.toHaveBeenCalled();
 process.env.NRPG_HALL_PRODUCER_ORIGIN = vector.proof.aud; network.mockResolvedValue(new Response(null, { status: 302, headers: { location: 'https://example.invalid' } })); expect((await GET(request(), context)).status).toBe(503);
});
test('HEAD signs its own method and forwards no body', async () => {
 expect(await (await HEAD(request(), context)).text()).toBe(''); expect(JSON.parse(Buffer.from(network.mock.calls[0][1].headers['x-nrpg-hall-proof'], 'base64url').toString()).method).toBe('HEAD');
});
test.each([['..', 'index.html'], ['.env'], ['api', 'enquiries'], ['https:', 'example.invalid'], ['models', 'coastal', '..', 'private.json'], ['models', 'coastal', 'file%2ejs'], ['logos', 'a\\b.png']])('unsafe path %j never fetches', async (...parts) => {
 expect(hallAssetPath(parts)).toBeNull(); expect((await GET(request(), { params: { path: parts } })).status).toBe(400); expect(network).not.toHaveBeenCalled();
});
test('query claims cannot become proxy authority or upstream parameters', async () => { expect((await GET(request('/hall/view/index.html?business=eligible'), context)).status).toBe(400); expect(network).not.toHaveBeenCalled(); });
test('streaming rewrite handles tokens and UTF-8 across every chunk boundary', async () => {
 const text = '<base href="/trade-hall/">Colour café /trade-hall/tools/drying.html'; const bytes = new TextEncoder().encode(text);
 for (let split = 0; split < bytes.length; split++) { const stream = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(bytes.slice(0, split)); c.enqueue(bytes.slice(split)); c.close(); } }); expect(await new Response(portalHtml(stream)).text()).toBe(text.replace(/\/trade-hall\//g, '/hall/view/')); }
});
test('reviewed static asset paths are admitted, response types outside contract denied', async () => {
 for (const parts of [['models', 'dehu.json'], ['models', 'coastal', 'coastal-pavilion.glb'], ['tools', 'coastal', 'expo-population.mjs'], ['tools', 'purchases', 'source-format.mjs'], ['media', 'drying.mp4']]) expect(hallAssetPath(parts)).toBe('/' + parts.join('/'));
 network.mockResolvedValue(new Response('unsupported', { headers: { 'content-type': 'application/x-executable' } })); expect((await GET(request(), context)).status).toBe(503);
});
