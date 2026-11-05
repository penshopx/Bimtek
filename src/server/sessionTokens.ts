import { randomBytes } from 'node:crypto';

/** 256 bits of cryptographic randomness, encoded for headers/cookies/storage. */
export function createSessionToken(): string {
  // Fail explicitly if the operating system's random source fails; never fall
  // back to timestamps, Math.random(), or user identifiers.
  return randomBytes(32).toString('hex');
}
