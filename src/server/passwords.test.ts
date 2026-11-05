import { expect, test } from 'bun:test';
import { hashPassword, isValidPasswordInput, verifyPassword } from './passwords';

function oldHash(password: string) {
  let value = 0;
  for (let i = 0; i < password.length; i++) value = ((value << 5) - value + password.charCodeAt(i)) | 0;
  return Math.abs(value).toString(16);
}

test('same password receives distinct random salts and versioned slow hashes', async () => {
  const first = await hashPassword('synthetic-password');
  const second = await hashPassword('synthetic-password');
  expect(first).toMatch(/^scrypt\$v1\$32768\$8\$3\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
  expect(first).not.toBe(second);
  expect(first).not.toContain('synthetic-password');
  expect(await verifyPassword('synthetic-password', first)).toEqual({ valid: true, needsRehash: false });
  expect(await verifyPassword('wrong-password', first)).toEqual({ valid: false, needsRehash: false });
});

test('Unicode, spaces and the exact password are preserved rather than normalized', async () => {
  const password = '  Konstruksi-🏗️-é  ';
  const hash = await hashPassword(password);
  expect((await verifyPassword(password, hash)).valid).toBe(true);
  expect((await verifyPassword(password.trim(), hash)).valid).toBe(false);
  expect((await verifyPassword(password.normalize('NFD'), hash)).valid).toBe(false);
});

test('legacy compatibility preserves the original UTF-16 algorithm including emoji', async () => {
  for (const password of ['old-password', '  legacy  ', 'lama-🏗️-uji', 'x']) {
    expect(await verifyPassword(password, oldHash(password))).toEqual({ valid: true, needsRehash: true });
    expect(await verifyPassword(`${password}!`, oldHash(password))).toEqual({ valid: false, needsRehash: false });
  }
});

test('malformed data, unknown versions and cost injection never fall back to legacy', async () => {
  const valid = await hashPassword('synthetic-password');
  for (const stored of [
    null, undefined, '', ' ', '0000', 'ffffffff', '80000001', 'xyz',
    valid.replace('$v1$', '$v2$'), valid.replace('$32768$', '$1073741824$'),
    valid.replace('$8$', '$1$'), valid.replace('$3$', '$0$'),
    valid.slice(0, -1), `${valid}\n`, `${oldHash('synthetic-password')}\n`,
    valid.replace(/[a-f0-9]{32}\$/, 'bad-salt$'), valid.replace(/.$/, 'z'),
  ]) {
    expect(await verifyPassword('synthetic-password', stored)).toEqual({ valid: false, needsRehash: false });
  }
});

test('input limits bound scrypt work without imposing new minimum lengths on old logins', async () => {
  expect(isValidPasswordInput('x')).toBe(true);
  expect(isValidPasswordInput('x', 6)).toBe(false);
  expect(isValidPasswordInput('x'.repeat(1024))).toBe(true);
  expect(isValidPasswordInput('x'.repeat(1025))).toBe(false);
  expect(isValidPasswordInput('🏗'.repeat(300))).toBe(false);
  for (const value of [null, undefined, 123, {}, [], '']) expect(isValidPasswordInput(value)).toBe(false);
  await expect(hashPassword('x'.repeat(1025))).rejects.toThrow('Invalid password input');
  expect((await verifyPassword('x'.repeat(1025), oldHash('x'))).valid).toBe(false);
});
