import { afterAll, beforeAll, expect, mock, test } from 'bun:test';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import * as schema from '@/db/schema';

// libsql opens a new connection after each transaction; shared cache keeps the
// in-memory fixture available without using the application's file database.
const client = createClient({ url: 'file::memory:?cache=shared' });
const db = drizzle(client, { schema });
mock.module('@/db', () => ({ db }));
const authPath = '../app/api/auth/route.ts?admin-authorization-regression';
const adminPath = '../app/api/admin/route.ts?admin-authorization-regression';
const userPath = '../app/api/user/route.ts?admin-audit-privacy-regression';
const auth = await import(authPath);
const admin = await import(adminPath);
const userRoute = await import(userPath);
const now = new Date().toISOString();

async function invoke(action: string, session?: string, body: Record<string, unknown> = {}, cookie = false, query = '') {
  const legacy = ['getAllUsers', 'updateUserRole', 'deleteUser'].includes(action);
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-device-id': 'guest-spoof', 'x-user-id': 'admin' };
  if (session) {
    if (cookie) headers.cookie = `sessionId=${session}`;
    else headers['x-session-id'] = session;
  }
  const request = new NextRequest(`http://admin.test/api/${legacy ? 'auth' : 'admin'}?action=${action}${query}`, {
    method: legacy ? 'POST' : 'GET', headers,
    ...(legacy ? { body: JSON.stringify({ userId: 'target', role: 'admin', isAdmin: true, ...body }) } : {}),
  });
  return legacy ? auth.POST(request) : admin.GET(request);
}

async function snapshot() {
  const result = [];
  for (const table of ['users', 'sessions', 'activities', 'document_checklist', 'quiz_scores']) {
    result.push((await client.execute(`SELECT * FROM ${table} ORDER BY id`)).rows);
  }
  return result;
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
    CREATE TABLE activities (id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, timestamp INTEGER, metadata TEXT);
    CREATE TABLE document_checklist (id TEXT PRIMARY KEY, note TEXT);
    CREATE TABLE quiz_scores (id TEXT PRIMARY KEY, score INTEGER);
    INSERT INTO document_checklist VALUES ('sentinel', 'private-fixture');
    INSERT INTO quiz_scores VALUES ('sentinel', 42);
  `);
  const users = [
    { id: 'admin', role: 'admin' }, { id: 'admin2', role: 'admin' },
    { id: 'user', role: 'user' }, { id: 'instructor', role: 'instructor' },
    { id: 'guest', role: 'guest' }, { id: 'target', role: 'user' },
    ...Array.from({ length: 105 }, (_, index) => ({ id: `fixture-${String(index).padStart(3, '0')}`, role: 'user' })),
  ];
  await db.insert(schema.users).values(users.map(user => ({
    ...user, name: `Synthetic ${user.id}`, email: `${user.id}@example.invalid`,
    passwordHash: 'fixture-secret-not-for-response', phone: 'private-fixture',
    createdAt: now, updatedAt: now,
  })));
  for (const id of ['admin', 'admin2', 'user', 'guest', 'instructor', 'orphan']) {
    await db.insert(schema.sessions).values({ id, userId: id, expiresAt: '2099-01-01T00:00:00.000Z', createdAt: now });
  }
  for (const [id, expiresAt] of [['expired', '2000-01-01T00:00:00.000Z'], ['malformed', 'bad-date'], ['boundary', now]]) {
    await db.insert(schema.sessions).values({ id, userId: 'admin', expiresAt, createdAt: now });
  }
  // Prime each route's own lazy database cache while this mock is active.
  await invoke('getAllUsers');
  await invoke('allUsers');
  await userRoute.POST(new NextRequest('http://admin.test/api/user?action=getActivities', { method: 'POST', body: '{}' }));
});

afterAll(() => { mock.restore(); client.close(); });

const principals: [string, string | undefined, number][] = [
  ['absent', undefined, 401], ['unknown', 'unknown', 401],
  ['expired', 'expired', 401], ['malformed date', 'malformed', 401],
  ['boundary', 'boundary', 401], ['deleted account', 'orphan', 401],
  ['guest session', 'guest', 403], ['user', 'user', 403], ['instructor', 'instructor', 403],
];
for (const action of ['getAllUsers', 'allUsers', 'searchUsers', 'updateUserRole', 'deleteUser']) {
  for (const [label, session, status] of principals) {
    test(`${action}: ${label} rejected ${status}, no data/statistic effects`, async () => {
      const before = await snapshot();
      const response = await invoke(action, session);
      expect(response.status).toBe(status);
      expect(await snapshot()).toEqual(before);
      expect(await response.text()).not.toContain('fixture-secret');
    });
  }
}

test('admin via header and cookie gets bounded safe user lists on every alias', async () => {
  for (const action of ['getAllUsers', 'allUsers', 'searchUsers']) {
    for (const cookie of [false, true]) {
      const response = await invoke(action, 'admin', { limit: 1000 }, cookie, '&limit=1000');
      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      const result = await response.json();
      expect(result.limit).toBe(100);
      expect(result.users).toHaveLength(100);
      expect(result.total).toBe(111);
      expect(result.recentUsers).toBe(111);
      for (const user of result.users) {
        expect(Object.keys(user).sort()).toEqual(['id', 'name', 'email', 'role', 'company', 'position', 'createdAt'].sort());
      }
    }
  }
});

test('expired and malformed cookies cannot fall back to a guest or a valid header impersonation', async () => {
  for (const action of ['getAllUsers', 'allUsers', 'searchUsers', 'updateUserRole', 'deleteUser']) {
    for (const session of ['expired', 'malformed', 'unknown']) {
      const before = await snapshot();
      expect((await invoke(action, session, {}, true)).status).toBe(401);
      expect(await snapshot()).toEqual(before);
    }
  }
});

test('pagination and filters work on server; invalid/oversized query is rejected', async () => {
  const first = await (await invoke('allUsers', 'admin', {}, false, '&limit=2&offset=0')).json();
  const second = await (await invoke('allUsers', 'admin', {}, false, '&limit=2&offset=2')).json();
  expect(first.users).toHaveLength(2);
  expect(second.users.some((user: { id: string }) => first.users.some((other: { id: string }) => other.id === user.id))).toBe(false);
  const filtered = await (await invoke('searchUsers', 'admin', {}, false, '&q=fixture-042')).json();
  expect(filtered.users).toHaveLength(1);
  expect(filtered.users[0].id).toBe('fixture-042');
  const wildcard = await (await invoke('searchUsers', 'admin', {}, false, '&q=%25')).json();
  expect(wildcard.total).toBe(0);
  for (const query of ['&limit=-1', '&offset=-1', '&limit=no', '&offset=100001', `&q=${'a'.repeat(201)}`]) {
    const before = await snapshot();
    expect((await invoke('allUsers', 'admin', {}, false, query)).status).toBe(400);
    expect(await snapshot()).toEqual(before);
  }
});

test('admin role policy: own and other admin accounts protected; invalid targets rejected without effects', async () => {
  for (const [body, status] of [
    [{ userId: 'admin', role: 'user' }, 403], [{ userId: 'admin2', role: 'user' }, 403],
    [{ userId: 'target', role: 'root' }, 400], [{ userId: 'target', role: { admin: true } }, 400],
    [{ userId: '', role: 'user' }, 400], [{ userId: 'absent', role: 'user' }, 404],
  ] as const) {
    const before = await snapshot();
    expect((await invoke('updateUserRole', 'admin', body)).status).toBe(status);
    expect(await snapshot()).toEqual(before);
  }
});

test('authorized role changes are atomic, audited and preserve sessions; new privileges use current DB role', async () => {
  const sessions = await db.select().from(schema.sessions);
  expect((await invoke('updateUserRole', 'admin', { userId: 'target', role: 'instructor' }, true)).status).toBe(200);
  let [target] = await db.select().from(schema.users).where(eq(schema.users.id, 'target'));
  expect(target.role).toBe('instructor');
  const logs = await db.select().from(schema.activities).where(eq(schema.activities.title, 'users.role.change'));
  expect(JSON.parse(logs[0].metadata!)).toEqual({
    actor: 'admin', action: 'users.role.change', target: 'target', from: 'user', to: 'instructor',
  });
  expect(logs[0].timestamp).toBeInstanceOf(Date);
  expect(await db.select().from(schema.sessions)).toEqual(sessions);
  expect((await invoke('updateUserRole', 'admin', { userId: 'user', role: 'admin' })).status).toBe(200);
  expect((await invoke('allUsers', 'user')).status).toBe(200);
  // Simulate external revocation using fixtures only; an already issued session must not retain admin rights.
  await db.update(schema.users).set({ role: 'user' }).where(eq(schema.users.id, 'user'));
  const before = await snapshot();
  expect((await invoke('allUsers', 'user')).status).toBe(403);
  expect(await snapshot()).toEqual(before);
});

test('even a valid admin cannot delete any account; repeated requests leave every table unchanged', async () => {
  for (const userId of ['target', 'admin', 'admin2', 'absent', undefined]) {
    const before = await snapshot();
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await invoke('deleteUser', 'admin', { userId }, attempt === 1);
      expect(response.status).toBe(403);
      expect((await response.json()).message).toContain('dinonaktifkan');
      expect(await snapshot()).toEqual(before);
    }
  }
});

test('all other admin route actions also reject non-admin callers before querying or mutating data', async () => {
  const before = await snapshot();
  for (const action of ['stats', 'allEvents', 'allCertificates', 'allProgress', 'allQuizScores', 'allActivities']) {
    expect((await invoke(action, 'user')).status).toBe(403);
  }
  for (const action of ['deleteEvent', 'deleteCertificate', 'resetUserProgress', 'createEvent', 'updateEvent']) {
    const response = await admin.POST(new NextRequest(`http://admin.test/api/admin?action=${action}`, {
      method: 'POST', headers: { 'x-session-id': 'user' }, body: '{}',
    }));
    expect(response.status).toBe(403);
  }
  expect(await snapshot()).toEqual(before);
});

test('role mutation rolls back if its audit write fails', async () => {
  const before = await snapshot();
  await client.execute("CREATE TRIGGER reject_audit BEFORE INSERT ON activities BEGIN SELECT RAISE(ABORT, 'test audit unavailable'); END;");
  try {
    await expect(invoke('updateUserRole', 'admin', { userId: 'target', role: 'user' })).rejects.toThrow();
    expect(await snapshot()).toEqual(before);
  } finally {
    await client.execute('DROP TRIGGER reject_audit');
  }
});

test('audit entries are not exposed or forgeable through the regular activity API', async () => {
  const before = await snapshot();
  const read = await userRoute.POST(new NextRequest('http://admin.test/api/user?action=getActivities', {
    method: 'POST', body: '{}',
  }));
  expect(read.status).toBe(200);
  expect((await read.json()).activities).toEqual([]);
  const forged = await userRoute.POST(new NextRequest('http://admin.test/api/user?action=addActivity', {
    method: 'POST', body: JSON.stringify({ type: 'admin-audit', title: 'fake', description: 'fake' }),
  }));
  expect(forged.status).toBe(403);
  expect(await snapshot()).toEqual(before);
});
