import { expect, test } from 'bun:test';
import { createSessionToken } from './sessionTokens';

test('new tokens encode 32 cryptographically random bytes as header-safe hex', () => {
  const token = createSessionToken();
  expect(token).toMatch(/^[0-9a-f]{64}$/);
  expect(Buffer.from(token, 'hex')).toHaveLength(32);
});

test('a sample of 1000 new sessions has distinct tokens with no time/user prefix', () => {
  const tokens = Array.from({ length: 1000 }, () => createSessionToken());
  expect(new Set(tokens).size).toBe(1000);
  for (const token of tokens) expect(token).toMatch(/^[0-9a-f]{64}$/);
});
