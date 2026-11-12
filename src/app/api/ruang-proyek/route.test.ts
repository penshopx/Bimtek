import { afterAll, beforeAll, beforeEach, expect, mock, test } from 'bun:test';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { NextRequest } from 'next/server';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as schema from '@/db/schema';

const tempDir = mkdtempSync(join(tmpdir(), 'project-portfolio-test-'));
const client = createClient({ url: `file:${join(tempDir, 'test.db')}` });
const database = drizzle(client, { schema });
mock.module('@/db', () => ({ db: database }));
const collection = await import('./route.ts?project-portfolio');
const item = await import('./[id]/route.ts?project-portfolio');

const sample = {
  name: 'Renovasi gedung layanan',
  clientName: 'Pemberi kerja',
  location: 'Bandung',
  role: 'Site Engineer',
  targetJabatanId: 'MP003',
  startedYear: '2023',
  completedYear: '2024',
  description: 'Mengawasi pelaksanaan pekerjaan struktur dan koordinasi lapangan.',
  outcomes: 'Pekerjaan terdokumentasi sesuai rencana proyek.',
  evidenceIds: ['evidence-a'],
};

function request(
  method: string,
  session?: string,
  body?: unknown,
  origin?: string,
) {
  return new NextRequest('http://localhost/api/ruang-proyek', {
    method,
    headers: {
      ...(session ? { 'x-session-id': session } : {}),
      ...(method !== 'GET' ? { 'content-type': 'application/json' } : {}),
      ...(origin ? { origin } : {}),
    },
    ...(method !== 'GET' ? { body: JSON.stringify(body) } : {}),
  });
}

const context = (id: string) => ({ params: Promise.resolve({ id }) });

beforeAll(async () => {
  await client.executeMultiple(`
    CREATE TABLE users (id TEXT PRIMARY KEY);
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE participant_evidence (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, object_key TEXT NOT NULL,
      original_name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL,
      category TEXT NOT NULL, contexts TEXT NOT NULL, note TEXT NOT NULL,
      period TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE project_portfolios (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL,
      client_name TEXT NOT NULL, location TEXT NOT NULL, role TEXT NOT NULL,
      target_jabatan_id TEXT NOT NULL, started_year TEXT NOT NULL,
      completed_year TEXT NOT NULL, description TEXT NOT NULL, outcomes TEXT NOT NULL,
      evidence_ids TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    INSERT INTO users VALUES ('a'), ('b');
    INSERT INTO sessions VALUES
      ('active-a', 'a', '2099-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('active-b', 'b', '2099-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('expired', 'a', '2000-01-01T00:00:00.000Z', '1999-01-01T00:00:00.000Z');
    INSERT INTO participant_evidence VALUES
      ('evidence-a', 'a', 'key-a', 'laporan.pdf', 'application/pdf', 10,
       'pengalaman', '["portofolio"]', 'Bukti proyek A', '2023', '2026-01-01', '2026-01-01'),
      ('evidence-b', 'b', 'key-b', 'bukti.pdf', 'application/pdf', 10,
       'pengalaman', '["portofolio"]', 'Bukti proyek B', '2023', '2026-01-01', '2026-01-01');
  `);
});

beforeEach(async () => {
  await database.delete(schema.projectPortfolios);
});

afterAll(() => {
  mock.restore();
  client.close();
  rmSync(tempDir, { recursive: true, force: true });
});

test('mensyaratkan sesi aktif dan menolak permintaan lintas situs', async () => {
  expect((await collection.GET(request('GET'))).status).toBe(401);
  expect((await collection.GET(request('GET', 'expired'))).status).toBe(401);
  expect((await collection.POST(request('POST', 'expired', sample))).status).toBe(401);
  expect((await collection.POST(request('POST', 'active-a', sample, 'https://evil.example'))).status).toBe(403);
  expect(await database.select().from(schema.projectPortfolios)).toHaveLength(0);
});

test('menyimpan proyek untuk pemilik sesi dan memisahkannya antar akun', async () => {
  const created = await collection.POST(request('POST', 'active-a', {
    ...sample,
    userId: 'b',
  }));
  expect(created.status).toBe(201);
  const { id } = await created.json();

  const responseA = await collection.GET(request('GET', 'active-a'));
  const projectsA = (await responseA.json()).projects;
  expect(projectsA).toHaveLength(1);
  expect(projectsA[0]).toMatchObject({
    id,
    name: sample.name,
    targetJabatanId: 'MP003',
    evidenceIds: ['evidence-a'],
  });
  expect(projectsA[0].userId).toBeUndefined();

  const projectsB = (await (await collection.GET(request('GET', 'active-b'))).json()).projects;
  expect(projectsB).toEqual([]);
  expect((await database.select().from(schema.projectPortfolios))[0].userId).toBe('a');
});

test('menolak bukti milik akun lain dan data proyek yang tidak valid', async () => {
  expect((await collection.POST(request('POST', 'active-a', {
    ...sample, evidenceIds: ['evidence-b'],
  }))).status).toBe(400);
  expect((await collection.POST(request('POST', 'active-a', {
    ...sample, targetJabatanId: 'unknown',
  }))).status).toBe(400);
  expect((await collection.POST(request('POST', 'active-a', {
    ...sample, startedYear: '2025', completedYear: '2024',
  }))).status).toBe(400);
  expect(await database.select().from(schema.projectPortfolios)).toHaveLength(0);
});

test('hanya pemilik dapat mengubah atau menghapus proyek', async () => {
  const created = await collection.POST(request('POST', 'active-a', sample));
  const { id } = await created.json();
  const changed = await item.PATCH(request('PATCH', 'active-a', {
    ...sample, name: 'Proyek diperbarui', evidenceIds: [],
  }), context(id));
  expect(changed.status).toBe(200);
  const denied = await item.DELETE(request('DELETE', 'active-b'), context(id));
  expect(denied.status).toBe(404);
  expect(await database.select().from(schema.projectPortfolios)).toHaveLength(1);

  const removed = await item.DELETE(request('DELETE', 'active-a'), context(id));
  expect(removed.status).toBe(200);
  expect(await database.select().from(schema.projectPortfolios)).toHaveLength(0);
});
