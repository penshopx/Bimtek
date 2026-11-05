import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

// Fixed, versioned work factors: never accept arbitrary cost parameters from a stored hash.
// N=2^15, r=8, p=3; 16-byte random salt and 64-byte derived key.
const PREFIX = 'scrypt$v1$32768$8$3$';
const MAX_PASSWORD_BYTES = 1024;
const FORMAT = /^scrypt\$v1\$32768\$8\$3\$([0-9a-f]{32})\$([0-9a-f]{128})$/;
const LEGACY_FORMAT = /^(?:0|[1-9a-f][0-9a-f]{0,7})$/;

export function isValidPasswordInput(value: unknown, minimumLength = 1): value is string {
  return typeof value === 'string' && value.length >= minimumLength &&
    Buffer.byteLength(value, 'utf8') <= MAX_PASSWORD_BYTES;
}

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  if (!isValidPasswordInput(password)) throw new Error('Invalid password input');
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `${PREFIX}${salt.toString('hex')}$${key.toString('hex')}`;
}

/** Compatibility only: never use this value for a new account or to reset a password. */
function legacyHash(password: string): string {
  let hash = 0;
  // Preserve the original UTF-16 code-unit algorithm, including surrogate pairs.
  for (let index = 0; index < password.length; index++) {
    hash = ((hash << 5) - hash + password.charCodeAt(index)) | 0;
  }
  return Math.abs(hash).toString(16);
}

export async function verifyPassword(password: string, storedHash: unknown): Promise<{
  valid: boolean;
  needsRehash: boolean;
}> {
  const invalid = { valid: false, needsRehash: false };
  if (!isValidPasswordInput(password) || typeof storedHash !== 'string') return invalid;
  const parts = FORMAT.exec(storedHash);
  if (parts && parts[0] === storedHash) {
    const actual = await derive(password, Buffer.from(parts[1], 'hex'));
    return { valid: timingSafeEqual(actual, Buffer.from(parts[2], 'hex')), needsRehash: false };
  }
  // Unknown versions, malformed scrypt data and non-canonical legacy values fail closed.
  if (storedHash.trim() !== storedHash || !LEGACY_FORMAT.test(storedHash) ||
      parseInt(storedHash, 16) > 0x80000000) return invalid;
  const actual = Buffer.from(legacyHash(password).padStart(8, '0'));
  const expected = Buffer.from(storedHash.padStart(8, '0'));
  const valid = timingSafeEqual(actual, expected);
  return { valid, needsRehash: valid };
}
