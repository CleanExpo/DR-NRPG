import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { basePrisma } from '@/lib/prisma';
import { resolveHallActor } from '@/lib/hall/receiving';
import { hallProof, HALL_ORIGIN } from '@/lib/hall/access-proof';
import { hallAssetPath, portalHtml } from '@/lib/hall/proxy-path';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const responseHeaders = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
const contentTypes = new Set(['text/html', 'text/css', 'text/javascript', 'application/javascript', 'application/json',
  'application/octet-stream', 'model/gltf-binary', 'model/gltf+json', 'image/png', 'image/jpeg', 'image/webp',
  'image/svg+xml', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/x-exr', 'image/vnd.radiance',
  'video/mp4', 'video/webm', 'font/woff', 'font/woff2', 'font/ttf']);
type HallContext = { params: Promise<{ path?: string[] }> };
async function view(request: NextRequest, context: HallContext, method: 'GET' | 'HEAD') {
  const path = hallAssetPath((await context.params).path);
  if (!path || request.nextUrl.search || /[%\\]/.test(request.nextUrl.pathname)) return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400, headers: responseHeaders });
  const secret = process.env.NRPG_HALL_PROXY_SECRET || '';
  if (process.env.NRPG_HALL_PRODUCER_ORIGIN !== HALL_ORIGIN || process.env.NRPG_HALL_ISSUER_ORIGIN !== 'https://nrpg.business' || Buffer.byteLength(secret, 'utf8') < 32) {
    return NextResponse.json({ error: 'HALL_UNAVAILABLE' }, { status: 503, headers: responseHeaders });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session && method === 'GET' && ['/index.html', '/coastal-expo.html'].includes(path)) {
      return new NextResponse(null, { status: 307, headers: { ...responseHeaders,
        Location: 'https://nrpg.business/login?callbackUrl=%2Fhall%2Fview%2Findex.html' } });
    }
    if (!await resolveHallActor(basePrisma, session)) return NextResponse.json({ error: 'ACCESS_UNAVAILABLE' }, { status: session ? 403 : 401, headers: responseHeaders });
    // Headers are constructed from server proof only; never forward customer credentials.
    const upstream = await fetch(HALL_ORIGIN + path, { method, headers: hallProof(method, path, secret),
      redirect: 'manual', cache: 'no-store', signal: AbortSignal.any([request.signal, AbortSignal.timeout(10000)]) });
    if (![200, 206, 404].includes(upstream.status)) throw Error('UPSTREAM_UNAVAILABLE');
    const type = upstream.headers.get('content-type') || '';
    if (!contentTypes.has(type.split(';')[0].trim().toLowerCase())) throw Error('UPSTREAM_UNAVAILABLE');
    const headers = { ...responseHeaders, 'Content-Type': type };
    const body = method === 'HEAD' ? null : upstream.body;
    return new NextResponse(body && type.split(';')[0].trim().toLowerCase() === 'text/html' ? portalHtml(body) : body, { status: upstream.status, headers });
  } catch { return NextResponse.json({ error: 'HALL_UNAVAILABLE' }, { status: 503, headers: responseHeaders }); }
}
export const GET = (request: NextRequest, context: HallContext) => view(request, context, 'GET');
export const HEAD = (request: NextRequest, context: HallContext) => view(request, context, 'HEAD');
