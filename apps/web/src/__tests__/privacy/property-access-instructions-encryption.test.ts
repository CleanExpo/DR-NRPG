/**
 * @jest-environment node
 *
 * DR-945 — property access instructions are never stored as plain text.
 *
 * Drives the REAL POST /api/client/onboarding/property handler with auth,
 * the tenant DB, onboarding phase service and email mocked, and inspects
 * what the handler hands to `clientProperty.create`.
 *
 * What it proves:
 *   1. With PROPERTY_ACCESS_ENCRYPTION_KEY set, the stored value is an
 *      AES-256-GCM sealed string, the plain text appears nowhere in it, and
 *      accessKeyId carries the key fingerprint (not null).
 *   2. The sealed value opens back to the original text for the same client
 *      profile only, and not with a different key.
 *   3. With no key (or a malformed key) the instructions are withheld (null),
 *      never stored in the clear, and the response says they were not kept.
 *   4. Blank instructions store nothing and report nothing withheld.
 */
import { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';

jest.mock('@sentry/nextjs', () => ({ captureException: jest.fn() }), { virtual: true });

jest.mock('@/lib/auth-middleware', () => {
  const { NextResponse: MockNextResponse } = jest.requireActual('next/server');
  return {
    authenticateRequest: jest.fn(),
    requireRole: (user: { userType?: string }, roles: string[]) =>
      roles.includes(user?.userType as string),
    unauthorizedRoleResponse: (roles: string[]) =>
      MockNextResponse.json({ error: 'FORBIDDEN', roles }, { status: 403 }),
  };
});

jest.mock('@/lib/get-tenant-db', () => ({ getTenantDb: jest.fn() }));

jest.mock('@/lib/services/client-onboarding.service', () => ({
  completePhase: jest.fn(),
  detectRiskZones: jest.fn(),
}));

jest.mock('@/lib/services/client-email.service', () => ({
  sendPhaseCompletionEmail: jest.fn(),
}));

jest.mock('@/lib/tenant-return-origin', () => ({
  getUserReturnOrigin: jest.fn(async () => 'https://nrpg.business'),
}));

import { POST } from '@/app/api/client/onboarding/property/route';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getTenantDb } from '@/lib/get-tenant-db';
import { completePhase, detectRiskZones } from '@/lib/services/client-onboarding.service';
import { sendPhaseCompletionEmail } from '@/lib/services/client-email.service';
import {
  ACCESS_INSTRUCTIONS_KEY_ENV,
  accessKeyFingerprint,
  loadAccessInstructionsKey,
  openAccessInstructions,
  sealAccessInstructions,
} from '@/lib/privacy/access-instructions-crypto';

const SECRET = 'Gate code 4821#, key under the third pot plant';
const PROFILE_ID = 'cprof_test_0001';

const mockAuth = authenticateRequest as jest.Mock;
const mockGetTenantDb = getTenantDb as jest.Mock;
const mockCompletePhase = completePhase as jest.Mock;
const mockDetectRiskZones = detectRiskZones as jest.Mock;
const mockSendEmail = sendPhaseCompletionEmail as jest.Mock;

function buildDb() {
  return {
    clientProfile: {
      upsert: jest.fn(async () => ({ id: PROFILE_ID })),
      update: jest.fn(async () => ({ id: PROFILE_ID })),
    },
    clientProperty: {
      create: jest.fn(async () => ({ id: 'prop_1' })),
    },
  };
}

function body(overrides: Record<string, unknown> = {}) {
  return {
    streetAddress: '12 Example Street',
    suburb: 'Southport',
    postcode: '4215',
    state: 'QLD',
    country: 'AU',
    propertyType: 'residential_house',
    accessInstructions: SECRET,
    parkingAvailable: true,
    securityAccess: false,
    petOnPremises: false,
    ...overrides,
  };
}

function request(payload: unknown) {
  return new NextRequest('https://nrpg.business/api/client/onboarding/property', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

type CreatedData = { accessInstructions: string | null; accessKeyId: string | null };
function createdData(): CreatedData {
  const calls = db.clientProperty.create.mock.calls as unknown as Array<[{ data: CreatedData }]>;
  return calls[0][0].data;
}

const ORIGINAL_KEY = process.env[ACCESS_INSTRUCTIONS_KEY_ENV];
let db: ReturnType<typeof buildDb>;

beforeEach(() => {
  jest.clearAllMocks();
  db = buildDb();
  mockGetTenantDb.mockReturnValue(db);
  mockAuth.mockResolvedValue({
    success: true,
    context: { user: { id: 'user_1', userType: 'CLIENT', email: 'c@example.com', name: 'C' } },
  });
  mockDetectRiskZones.mockResolvedValue({ zones: [], recommendedServices: [] });
  mockCompletePhase.mockResolvedValue({ completionPercentage: 42.8, nextPhase: 'insurance', message: 'ok' });
  mockSendEmail.mockResolvedValue(undefined);
});

afterAll(() => {
  if (ORIGINAL_KEY === undefined) delete process.env[ACCESS_INSTRUCTIONS_KEY_ENV];
  else process.env[ACCESS_INSTRUCTIONS_KEY_ENV] = ORIGINAL_KEY;
});

describe('POST /api/client/onboarding/property — access instructions (DR-945)', () => {
  it('stores a sealed value, never the plain text, when the key is set', async () => {
    const keyHex = randomBytes(32).toString('hex');
    process.env[ACCESS_INSTRUCTIONS_KEY_ENV] = keyHex;

    const res = await POST(request(body()));
    expect(res.status).toBe(200);

    const data = createdData();
    expect(data.accessInstructions).toMatch(/^enc:v1:/);
    expect(data.accessInstructions).not.toContain('4821');
    expect(data.accessInstructions).not.toContain(SECRET);
    expect(data.accessKeyId).toBe(accessKeyFingerprint(Buffer.from(keyHex, 'hex')));

    expect(openAccessInstructions(data.accessInstructions, PROFILE_ID)).toBe(SECRET);

    const json = await res.json();
    expect(json.accessInstructionsSaved).toBe(true);
    expect(JSON.stringify(json)).not.toContain('4821');
  });

  it.each([
    ['missing', undefined],
    ['blank', '   '],
    ['too short', 'abcd'],
    ['31-byte base64', randomBytes(31).toString('base64')],
  ])('withholds the instructions when the key is %s', async (_label, value) => {
    if (value === undefined) delete process.env[ACCESS_INSTRUCTIONS_KEY_ENV];
    else process.env[ACCESS_INSTRUCTIONS_KEY_ENV] = value;

    const res = await POST(request(body()));
    expect(res.status).toBe(200);

    const data = createdData();
    expect(data.accessInstructions).toBeNull();
    expect(data.accessKeyId).toBeNull();
    expect(JSON.stringify(db.clientProperty.create.mock.calls)).not.toContain('4821');

    const json = await res.json();
    expect(json.accessInstructionsSaved).toBe(false);
  });

  it('stores nothing and withholds nothing when instructions are blank', async () => {
    process.env[ACCESS_INSTRUCTIONS_KEY_ENV] = randomBytes(32).toString('base64');

    const res = await POST(request(body({ accessInstructions: '  ' })));
    const data = createdData();
    expect(data.accessInstructions).toBeNull();
    expect(data.accessKeyId).toBeNull();
    expect((await res.json()).accessInstructionsSaved).toBe(true);
  });
});

describe('access-instructions-crypto', () => {
  const keyA = randomBytes(32).toString('base64');
  const keyB = randomBytes(32).toString('hex');
  const envA = { [ACCESS_INSTRUCTIONS_KEY_ENV]: keyA };
  const envB = { [ACCESS_INSTRUCTIONS_KEY_ENV]: keyB };

  it('accepts 32-byte base64 and 64-char hex keys only', () => {
    expect(loadAccessInstructionsKey(envA)?.length).toBe(32);
    expect(loadAccessInstructionsKey(envB)?.length).toBe(32);
    expect(loadAccessInstructionsKey({ [ACCESS_INSTRUCTIONS_KEY_ENV]: 'not-a-key' })).toBeNull();
    expect(loadAccessInstructionsKey({})).toBeNull();
  });

  it('uses a fresh IV each time', () => {
    const one = sealAccessInstructions(SECRET, PROFILE_ID, envA);
    const two = sealAccessInstructions(SECRET, PROFILE_ID, envA);
    expect(one.accessInstructions).not.toBe(two.accessInstructions);
  });

  it('will not open with another key, another profile, or after tampering', () => {
    const sealed = sealAccessInstructions(SECRET, PROFILE_ID, envA).accessInstructions as string;
    expect(openAccessInstructions(sealed, PROFILE_ID, envA)).toBe(SECRET);
    expect(openAccessInstructions(sealed, PROFILE_ID, envB)).toBeNull();
    expect(openAccessInstructions(sealed, 'cprof_other', envA)).toBeNull();

    const parts = sealed.split(':');
    const ct = Buffer.from(parts[4], 'base64');
    ct[0] ^= 0x01;
    parts[4] = ct.toString('base64');
    expect(openAccessInstructions(parts.join(':'), PROFILE_ID, envA)).toBeNull();
  });

  it('never returns a legacy plain-text value as decrypted', () => {
    expect(openAccessInstructions(SECRET, PROFILE_ID, envA)).toBeNull();
    expect(openAccessInstructions(null, PROFILE_ID, envA)).toBeNull();
  });
});
