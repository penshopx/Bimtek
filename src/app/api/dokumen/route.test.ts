import { afterAll, beforeAll, expect, mock, test } from 'bun:test';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { NextRequest } from 'next/server';
import * as schema from '@/db/schema';

// Only in-memory fixtures: never connect this suite to the application's database.
const client = createClient({ url: ':memory:' });
const database = drizzle(client, { schema });
mock.module('@/db', () => ({ db: database }));
// Separate the lazy DB cache from route instances imported by other suites.
const routePath = './route.ts?checklist-session-regression';
const route = await import(routePath);
const now = new Date().toISOString();

function request(method: 'GET' | 'POST', headers: Record<string, string> = {}, body = {}) {
  return new NextRequest('http://localhost/api/dokumen?jabatan=pelaks-gedung&userId=b', {
    method,
    headers,
    ...(method === 'POST' ? {
      body: JSON.stringify({ jabatanId: 'pelaks-gedung', documentId: 'ktp', ...body }),
    } : {}),
  });
}

beforeAll(async () => {
  await client.executeMultiple(`
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE document_checklist (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, jabatan_id TEXT NOT NULL,
      document_id TEXT NOT NULL, checked INTEGER DEFAULT 0, checked_at TEXT,
      na INTEGER DEFAULT 0, note TEXT, created_at TEXT NOT NULL
    );
  `);
  await database.insert(schema.sessions).values([
    { id: 'active-a', userId: 'a', expiresAt: '2099-01-01T00:00:00.000Z', createdAt: now },
    { id: 'active-b', userId: 'b', expiresAt: '2099-01-01T00:00:00.000Z', createdAt: now },
    { id: 'expired', userId: 'a', expiresAt: '2000-01-01T00:00:00.000Z', createdAt: now },
    { id: 'invalid-date', userId: 'a', expiresAt: 'not-a-date', createdAt: now },
    { id: 'boundary', userId: 'a', expiresAt: now, createdAt: now },
  ]);
  for (const userId of ['a', 'b']) {
    await database.insert(schema.documentChecklist).values({
      id: `dc-${userId}-pelaks-gedung-ktp`, userId, jabatanId: 'pelaks-gedung',
      documentId: 'ktp', checked: true, note: `private-${userId}`, createdAt: now,
    });
  }
  // Initialize the handler's lazy connection while this suite's mock is active.
  await route.GET(request('GET'));
});

afterAll(() => {
  mock.restore();
  client.close();
});

for (const session of ['expired', 'missing-session', 'invalid-date', 'boundary']) {
  for (const transport of ['header', 'cookie']) {
    test(`${session} via ${transport}: GET/POST return 401 without modifying rows`, async () => {
      const headers = transport === 'header'
        ? { 'x-session-id': session }
        : { cookie: `sessionId=${session}` };
      const before = await database.select().from(schema.documentChecklist);
      expect((await route.GET(request('GET', headers))).status).toBe(401);
      expect((await route.POST(request('POST', headers, { note: 'unauthorized-edit' }))).status).toBe(401);
      expect((await route.POST(request('POST', headers, { documentId: 'new-document', checked: true }))).status).toBe(401);
      expect(await database.select().from(schema.documentChecklist)).toEqual(before);
    });
  }
}

test('invalid sessions cannot fall back to a guest identity on read or save', async () => {
  for (const session of ['expired', 'missing-session', 'invalid-date']) {
    const headers = { 'x-session-id': session, 'x-device-id': 'guest-fallback' };
    expect((await route.GET(request('GET', headers))).status).toBe(401);
    expect((await route.POST(request('POST', headers, { note: 'blocked' }))).status).toBe(401);
  }
  expect((await database.select().from(schema.documentChecklist)).some(row => row.userId === 'guest-fallback')).toBe(false);
});

test('active header/cookie sessions read and update only their own checklist', async () => {
  for (const [userId, headers] of [
    ['a', { 'x-session-id': 'active-a', 'x-device-id': 'guest-ignored' }],
    ['b', { cookie: 'sessionId=active-b' }],
  ] as const) {
    const read = await route.GET(request('GET', headers));
    expect(read.status).toBe(200);
    const { items } = await read.json();
    expect(items).toHaveLength(1);
    expect(items[0].note).toBe(`private-${userId}`);
    expect(items[0].userId).toBe(userId);
    expect((await route.POST(request('POST', headers, {
      userId: userId === 'a' ? 'b' : 'a', note: `updated-${userId}`,
    }))).status).toBe(200);
  }
  const rows = await database.select().from(schema.documentChecklist);
  expect(rows.find(row => row.userId === 'a')?.note).toBe('updated-a');
  expect(rows.find(row => row.userId === 'b')?.note).toBe('updated-b');
});

test('session-free guests retain device-scoped save/read behavior', async () => {
  const headers = { 'x-device-id': 'guest-checklist-test' };
  expect((await route.POST(request('POST', headers, { checked: true, note: 'guest-only' }))).status).toBe(200);
  const read = await route.GET(request('GET', headers));
  expect(read.status).toBe(200);
  expect((await read.json()).items[0].note).toBe('guest-only');
  const other = await route.GET(request('GET', { 'x-device-id': 'guest-other' }));
  expect((await other.json()).items).toHaveLength(0);
});

test('missing credentials and non-guest device IDs remain unauthorized', async () => {
  for (const headers of [{}, { 'x-device-id': 'a' }]) {
    expect((await route.GET(request('GET', headers))).status).toBe(401);
    expect((await route.POST(request('POST', headers, { checked: true }))).status).toBe(401);
  }
});
