import { createHmac, randomBytes } from 'crypto';
export const HALL_ORIGIN = 'https://cleanexpo247-hall.vercel.app';
export function signHallProof(encoded: string, secret: string) {
  if (Buffer.byteLength(secret, 'utf8') < 32) throw Error('HALL_BINDING_REQUIRED');
  return createHmac('sha256', secret).update(encoded).digest('base64url');
}
export function hallProof(method: 'GET' | 'HEAD', path: string, secret: string, now = Math.floor(Date.now() / 1000)) {
  const encoded = Buffer.from(JSON.stringify({ v: 1, method, path, aud: HALL_ORIGIN,
    exp: now + 60, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  return { 'x-nrpg-hall-proof': encoded, 'x-nrpg-hall-signature': signHallProof(encoded, secret) };
}
