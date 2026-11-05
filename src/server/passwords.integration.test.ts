import { afterAll, beforeAll, expect, mock, test } from 'bun:test';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import * as schema from '@/db/schema';
import { hashPassword, verifyPassword } from './passwords';

const client = createClient({ url: ':memory:' });
const db = drizzle(client, { schema });
mock.module('@/db', () => ({ db }));
const routePath = '../app/api/auth/route.ts?password-upgrade-regression';
const { POST } = await import(routePath);
const now = new Date().toISOString();
const password = 'synthetic-test-password';
const oldHash = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  return Math.abs(hash).toString(16);
};
async function request(action: string, body: unknown) {
  return POST(new NextRequest(`http://auth.test/api/auth?action=${action}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));
}
async function snapshot() {
  return {
    users: (await client.execute('SELECT * FROM users ORDER BY id')).rows,
    sessions: (await client.execute('SELECT * FROM sessions ORDER BY id')).rows,
  };
}
async function user(id: string) {
  return (await db.select().from(schema.users).where(eq(schema.users.id, id)))[0];
}
async function seedUser(id: string, passwordHash: string) {
  await db.insert(schema.users).values({
    id, name: `Synthetic ${id}`, email: `${id}@example.invalid`, passwordHash,
    role: 'user', company: 'Synthetic', jabatanSkk: 'Target fixture', createdAt: now, updatedAt: now,
  });
}
beforeAll(async () => {
  await client.executeMultiple(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user', avatar TEXT, phone TEXT, company TEXT, position TEXT, bidang TEXT,
      jabatan_skk TEXT, kualifikasi_skk TEXT, skk_certificate_level TEXT, skk_issued_at TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL);
  `);
  await seedUser('legacy', oldHash(password));
  await seedUser('modern', await hashPassword(password));
  await seedUser('broken', 'scrypt$v1$malformed');
  await seedUser('racing', oldHash(password));
  await seedUser('audit-failure-fixture', oldHash(password));
  await db.insert(schema.sessions).values({ id: 'existing-session', userId: 'legacy', expiresAt: '2099-01-01T00:00:00.000Z', createdAt: now });
  // Initialize the route cache before other suites can replace the module mock.
  await request('login', { email: 'absent@example.invalid', password });
});
afterAll(() => { mock.restore(); client.close(); });

test('new registration stores scrypt, ignores supplied role and does not expose hash/password', async () => {
  const response = await request('register', { name: 'New Fixture', email: 'new@example.invalid', password, role: 'admin' });
  expect(response.status).toBe(200);
  const body = await response.json();
  expect(body.user.role).toBe('user');
  expect(body.user.passwordHash).toBeUndefined();
  expect(body.user.password).toBeUndefined();
  const created = await user(body.user.id);
  expect(created.passwordHash).toStartWith('scrypt$v1$');
  expect((await verifyPassword(password, created.passwordHash)).valid).toBe(true);
  expect((await request('verify', { sessionId: body.sessionId })).status).toBe(200);
});

test('wrong password for a legacy account never upgrades its hash or creates a session', async () => {
  const before = await snapshot();
  expect((await request('login', { email: 'legacy@example.invalid', password: 'wrong-test-password' })).status).toBe(401);
  expect(await snapshot()).toEqual(before);
});

test('successful legacy login rehashes only that account and preserves profile and existing sessions', async () => {
  const before = await user('legacy');
  const other = await user('modern');
  const response = await request('login', { email: before.email, password });
  expect(response.status).toBe(200);
  const body = await response.json();
  const after = await user('legacy');
  expect(after.passwordHash).toStartWith('scrypt$v1$');
  expect((await verifyPassword(password, after.passwordHash)).valid).toBe(true);
  expect({ ...after, passwordHash: before.passwordHash }).toEqual(before);
  expect(await user('modern')).toEqual(other);
  expect(body.user.passwordHash).toBeUndefined();
  expect((await request('verify', { sessionId: 'existing-session' })).status).toBe(200);
  expect((await request('verify', { sessionId: body.sessionId })).status).toBe(200);
  await request('logout', { sessionId: body.sessionId });
  expect((await request('verify', { sessionId: body.sessionId })).status).toBe(401);
});

test('subsequent modern logins do not rehash again, and wrong passwords still fail', async () => {
  const before = await user('legacy');
  expect((await request('login', { email: before.email, password })).status).toBe(200);
  expect(await user('legacy')).toEqual(before);
  const snapshotBefore = await snapshot();
  expect((await request('login', { email: before.email, password: 'wrong-test-password' })).status).toBe(401);
  expect(await snapshot()).toEqual(snapshotBefore);
});

test('malformed stored hash and absent account fail with the same generic response and no writes', async () => {
  for (const email of ['broken@example.invalid', 'absent@example.invalid']) {
    const before = await snapshot();
    const response = await request('login', { email, password });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ success: false, message: 'Email atau password salah' });
    expect(await snapshot()).toEqual(before);
  }
});

test('invalid credentials and oversized input return 400 without database changes', async () => {
  const before = await snapshot();
  for (const invalid of [undefined, '', 42, {}, 'x'.repeat(1025), '🏗'.repeat(300)]) {
    expect((await request('login', { email: 'legacy@example.invalid', password: invalid })).status).toBe(400);
    expect((await request('register', { name: 'Fixture', email: 'invalid@example.invalid', password: invalid })).status).toBe(400);
  }
  for (const body of [null, [], 'text']) expect((await request('login', body)).status).toBe(400);
  expect((await request('register', { name: 'Fixture', email: 'invalid@example.invalid', password: 'short' })).status).toBe(400);
  expect(await snapshot()).toEqual(before);
});

test('two legacy logins cannot overwrite each other; losing request is explicit and retry works', async () => {
  const results = await Promise.all([
    request('login', { email: 'racing@example.invalid', password }),
    request('login', { email: 'racing@example.invalid', password }),
  ]);
  expect(results.map(result => result.status).sort()).toEqual([200, 409]);
  const winner = await user('racing');
  expect((await verifyPassword(password, winner.passwordHash)).valid).toBe(true);
  const sessions = await db.select().from(schema.sessions).where(eq(schema.sessions.userId, 'racing'));
  expect(sessions).toHaveLength(1);
  expect((await request('login', { email: 'racing@example.invalid', password })).status).toBe(200);
  expect((await user('racing')).passwordHash).toBe(winner.passwordHash);
});

test('rehash write failure cannot issue a session or alter the legacy password', async () => {
  const before = await snapshot();
  await client.execute("CREATE TRIGGER reject_rehash BEFORE UPDATE OF password_hash ON users WHEN OLD.id = 'audit-failure-fixture' BEGIN SELECT RAISE(ABORT, 'test write unavailable'); END;");
  try {
    await expect(request('login', { email: 'audit-failure-fixture@example.invalid', password })).rejects.toThrow();
    expect(await snapshot()).toEqual(before);
  } finally {
    await client.execute('DROP TRIGGER reject_rehash');
  }
});
