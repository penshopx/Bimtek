// Run this suite in its own Bun process: module mocks must not affect auth suites.
import { beforeAll, afterAll, expect, test, mock } from 'bun:test';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { NextRequest } from 'next/server';
import { readFileSync } from 'node:fs';
import * as schema from '@/db/schema';

const client = createClient({ url: ':memory:' });
const database = drizzle(client, { schema });
const bytes = new Map<string, Buffer>();
let storageDown = false;
let uploadFail = false;
mock.module('@/db', () => ({ db: database }));
mock.module('@/server/evidenceStorage', () => ({
  evidenceStorage: async () => {
    if (storageDown) throw new Error('Unavailable');
    return {
      uploadFromBytes: async (key: string, data: Buffer) => {
        if (uploadFail) return { ok: false };
        bytes.set(key, data);
        return { ok: true };
      },
      downloadAsBytes: async (key: string) => bytes.has(key) ? { ok: true, value: [bytes.get(key)] } : { ok: false },
      delete: async (key: string) => { bytes.delete(key); return { ok: true }; },
    };
  },
}));
const collection = await import('@/app/api/ruang-bukti/route');
const item = await import('@/app/api/ruang-bukti/[id]/route');
const metadata = { category: 'pengalaman', contexts: ['portofolio'], note: 'Catatan uji', period: '2025' };
function request(method: string, session?: string, body?: BodyInit, extra?: Record<string, string>) {
  return new NextRequest('http://localhost/api/ruang-bukti', {
    method, headers: { ...(session ? { 'x-session-id': session } : {}), ...extra }, body,
  });
}
function upload(session = 'session-a', name = 'uji.txt', content = 'Bukti sintetis') {
  const form = new FormData();
  form.set('file', new File([content], name, { type: 'text/plain' }));
  form.set('metadata', JSON.stringify(metadata));
  return request('POST', session, form);
}
beforeAll(async () => {
  await client.executeMultiple(`
    CREATE TABLE users (id TEXT PRIMARY KEY);
    CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id TEXT, expires_at TEXT);
  `);
  await client.executeMultiple(readFileSync('src/db/migrations/0017_serious_rhodey.sql', 'utf8').replaceAll('--> statement-breakpoint', ''));
  for (const id of ['a', 'b']) {
    await client.execute({ sql: 'INSERT INTO users VALUES (?)', args: [id] });
    await client.execute({ sql: 'INSERT INTO sessions VALUES (?, ?, ?)', args: [`session-${id}`, id, '2099-01-01T00:00:00.000Z'] });
  }
  await client.execute({ sql: 'INSERT INTO sessions VALUES (?, ?, ?)', args: ['expired', 'a', '2000-01-01T00:00:00.000Z'] });
});
afterAll(() => { mock.restore(); client.close(); });

test('Privat: tamu dan sesi kedaluwarsa ditolak', async () => {
  expect((await collection.GET(request('GET'))).status).toBe(401);
  expect((await collection.GET(request('GET', 'expired'))).status).toBe(401);
  expect((await collection.POST(upload('expired'))).status).toBe(401);
  const spoofed = request('GET', undefined, undefined, { 'x-device-id': 'guest-a', 'x-user-id': 'a' });
  expect((await collection.GET(spoofed)).status).toBe(401);
});
test('Upload, reload, edit metadata, download, isolasi, dan hapus', async () => {
  const created = await collection.POST(upload());
  expect(created.status).toBe(201);
  const { id } = await created.json();
  const context = { params: Promise.resolve({ id }) };
  const list = await (await collection.GET(request('GET', 'session-a'))).json();
  expect(list.items[0].note).toBe(metadata.note);
  expect(list.items[0].contexts).toEqual(['portofolio']);
  expect(list.items[0].objectKey).toBeUndefined();
  expect(list.items[0].userId).toBeUndefined();
  expect((await (await collection.GET(request('GET', 'session-b'))).json()).items).toHaveLength(0);
  for (const method of ['GET', 'PATCH', 'DELETE'] as const) {
    expect((await item[method](request(method, 'session-b', method === 'PATCH' ? JSON.stringify(metadata) : undefined), context)).status).toBe(404);
  }
  const downloaded = await item.GET(request('GET', 'session-a'), context);
  expect(downloaded.headers.get('Content-Disposition')).toContain('attachment');
  expect(downloaded.headers.get('Cache-Control')).toContain('no-store');
  expect(await downloaded.text()).toBe('Bukti sintetis');
  expect((await item.PATCH(request('PATCH', 'session-a', JSON.stringify({ ...metadata, note: 'Diperbarui' })), context)).status).toBe(200);
  expect((await (await collection.GET(request('GET', 'session-a'))).json()).items[0].note).toBe('Diperbarui');
  expect((await item.DELETE(request('DELETE', 'session-a'), context)).status).toBe(200);
  expect(bytes.size).toBe(0);
  expect((await item.GET(request('GET', 'session-a'), context)).status).toBe(404);
});
test('Kegagalan penyimpanan bukan sukses dan tidak meninggalkan metadata', async () => {
  storageDown = true;
  expect((await collection.POST(upload())).status).toBe(503);
  const list = await (await collection.GET(request('GET', 'session-a'))).json();
  expect(list.storageAvailable).toBe(false);
  expect(list.items).toHaveLength(0);
  storageDown = false;
  uploadFail = true;
  expect((await collection.POST(upload())).status).toBe(503);
  uploadFail = false;
  expect((await (await collection.GET(request('GET', 'session-a'))).json()).items).toHaveLength(0);
});
test('Ekstensi palsu, metadata rusak, dan permintaan lintas situs ditolak', async () => {
  expect((await collection.POST(upload('session-a', 'palsu.pdf'))).status).toBe(400);
  expect((await collection.POST(request('POST', 'session-a', new FormData(), { origin: 'https://evil.example' }))).status).toBe(403);
  expect(bytes.size).toBe(0);
  expect(await database.select().from(schema.participantEvidence)).toHaveLength(0);
});
