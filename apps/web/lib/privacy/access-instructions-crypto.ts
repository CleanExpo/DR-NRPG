/**
 * Field-level encryption for property access instructions (DR-945).
 *
 * Access instructions hold gate codes, intercom codes, alarm codes and where
 * a key is hidden. They were written to `ClientProperty.accessInstructions`
 * as plain text. This module seals them with AES-256-GCM before they reach
 * the database.
 *
 * Fail closed: when `PROPERTY_ACCESS_ENCRYPTION_KEY` is missing or malformed,
 * the instructions are NOT stored at all (never stored as plain text). The
 * caller tells the client they were not kept.
 *
 * Stored value:   enc:v1:<iv b64>:<tag b64>:<ciphertext b64>
 * accessKeyId:    aes-256-gcm:<first 16 hex chars of sha256(key)>
 *
 * The ciphertext is bound (as GCM additional authenticated data) to the
 * client profile ID, so a sealed value copied onto another client's property
 * will not decrypt.
 *
 * Server-only. No new database column: the existing `accessInstructions` and
 * `accessKeyId` text columns carry the sealed value and the key fingerprint.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

export const ACCESS_INSTRUCTIONS_KEY_ENV = 'PROPERTY_ACCESS_ENCRYPTION_KEY';

const ALGORITHM = 'aes-256-gcm';
const PREFIX = 'enc:v1:';
const KEY_ID_PREFIX = 'aes-256-gcm:';
const IV_BYTES = 12;

type Env = Record<string, string | undefined>;

export type SealResult =
  | { status: 'empty'; accessInstructions: null; accessKeyId: null }
  | { status: 'encrypted'; accessInstructions: string; accessKeyId: string }
  | { status: 'withheld'; accessInstructions: null; accessKeyId: null };

/**
 * Reads the key from the environment. Accepts 64 hex characters or base64
 * that decodes to exactly 32 bytes. Anything else counts as not configured.
 */
export function loadAccessInstructionsKey(
  env: Env = process.env
): Buffer | null {
  const raw = env[ACCESS_INSTRUCTIONS_KEY_ENV]?.trim();
  if (!raw) return null;

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }

  if (/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) {
    const decoded = Buffer.from(raw, 'base64');
    if (decoded.length === 32) return decoded;
  }

  return null;
}

export function accessKeyFingerprint(key: Buffer): string {
  return KEY_ID_PREFIX + createHash('sha256').update(key).digest('hex').slice(0, 16);
}

export function isSealedAccessInstructions(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

/**
 * Seals access instructions for storage. Blank input stores nothing.
 * A missing or malformed key withholds the value rather than storing it in
 * the clear.
 */
export function sealAccessInstructions(
  plaintext: string | null | undefined,
  clientProfileId: string,
  env: Env = process.env
): SealResult {
  if (typeof plaintext !== 'string' || plaintext.trim() === '') {
    return { status: 'empty', accessInstructions: null, accessKeyId: null };
  }

  const key = loadAccessInstructionsKey(env);
  if (!key) {
    return { status: 'withheld', accessInstructions: null, accessKeyId: null };
  }

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from(clientProfileId, 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    status: 'encrypted',
    accessInstructions:
      PREFIX + [iv, tag, ciphertext].map((part) => part.toString('base64')).join(':'),
    accessKeyId: accessKeyFingerprint(key),
  };
}

/**
 * Opens a sealed value. Returns null when the value is not sealed, the key is
 * missing or different, or the value was tampered with or belongs to another
 * client profile. Never returns a legacy plain-text value as if it were
 * decrypted.
 */
export function openAccessInstructions(
  stored: string | null | undefined,
  clientProfileId: string,
  env: Env = process.env
): string | null {
  if (!isSealedAccessInstructions(stored)) return null;

  const key = loadAccessInstructionsKey(env);
  if (!key) return null;

  const parts = (stored as string).slice(PREFIX.length).split(':');
  if (parts.length !== 3) return null;

  try {
    const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, 'base64'));
    if (iv.length !== IV_BYTES || tag.length !== 16) return null;

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from(clientProfileId, 'utf8'));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}
