import { afterAll, beforeAll, expect, mock, test } from 'bun:test';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { NextRequest } from 'next/server';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as schema from '@/db/schema';
import { emptyJourneyProgress } from '@/lib/learning-journey';

const tempDir = mkdtempSync(join(tmpdir(), 'learning-journey-test-'));
const databasePath = join(tempDir, 'test.db');
const client = createClient({ url: `file:${databasePath}` });
const database = drizzle(client, { schema });
mock.module('@/db', () => ({ db: database }));
const route = await import('./route.ts?learning-journey-account-sync');

const at = (minute: number) => new Date(Date.UTC(2026, 10, 11, 0, minute)).toISOString();
function request(
  method: 'GET' | 'PUT',
  session?: string,
  body?: unknown,
  headers: Record<string, string> = {},
) {
  return new NextRequest('http://localhost/api/learning-journey', {
    method,
    headers: {
      ...(session ? { 'x-session-id': session } : {}),
      ...(method === 'PUT' ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    ...(method === 'PUT' ? { body: JSON.stringify(body) } : {}),
  });
}

function progress(moduleId: string, completed: boolean, updatedAt: string) {
  return {
    version: 1,
    modules: { [moduleId]: { completed, updatedAt, lessons: [] } },
    quizzes: {},
  };
}

beforeAll(async () => {
  await client.executeMultiple(`
    CREATE TABLE users (id TEXT PRIMARY KEY);
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE learning_journey_progress (
      user_id TEXT PRIMARY KEY, progress TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);
  await client.executeMultiple(`
    INSERT INTO users VALUES ('a');
    INSERT INTO users VALUES ('b');
    INSERT INTO sessions VALUES ('active-a', 'a', '2099-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
    INSERT INTO sessions VALUES ('active-b', 'b', '2099-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
    INSERT INTO sessions VALUES ('expired', 'a', '2000-01-01T00:00:00.000Z', '1999-01-01T00:00:00.000Z');
  `);
});

afterAll(() => {
  mock.restore();
  client.close();
  rmSync(tempDir, { recursive: true, force: true });
});

test('progres akun mensyaratkan sesi aktif dan menolak lintas situs', async () => {
  expect((await route.GET(request('GET'))).status).toBe(401);
  expect((await route.GET(request('GET', 'expired'))).status).toBe(401);
  expect((await route.PUT(request('PUT', 'expired', { progress: emptyJourneyProgress() }))).status).toBe(401);
  expect((await route.PUT(request(
    'PUT', 'active-a', { progress: emptyJourneyProgress() }, { origin: 'https://evil.example' },
  ))).status).toBe(403);
  expect(await database.select().from(schema.learningJourneyProgress)).toHaveLength(0);
});

test('server derives owner from session and separates two accounts', async () => {
  const saved = await route.PUT(request('PUT', 'active-a', {
    userId: 'b',
    progress: progress('sipil-gedung-1', true, at(1)),
  }));
  expect(saved.status).toBe(200);
  const a = await route.GET(request('GET', 'active-a'));
  expect(a.status).toBe(200);
  expect((await a.json()).progress.modules['sipil-gedung-1'].completed).toBe(true);

  const b = await route.GET(request('GET', 'active-b'));
  expect(b.status).toBe(200);
  expect((await b.json()).hasServerProgress).toBe(false);
  expect(await database.select().from(schema.learningJourneyProgress)).toHaveLength(1);
  expect((await database.select().from(schema.learningJourneyProgress))[0].userId).toBe('a');
});

test('stale browser snapshots do not replace newer steps and preserve unrelated steps', async () => {
  await route.PUT(request('PUT', 'active-a', {
    progress: progress('sipil-gedung-1', true, at(20)),
  }));
  const older = progress('sipil-gedung-1', false, at(10));
  older.modules['sipil-gedung-2'] = {
    completed: true, updatedAt: at(12), lessons: [],
  };
  const saved = await route.PUT(request('PUT', 'active-a', { progress: older }));
  const response = await saved.json();
  expect(response.progress.modules['sipil-gedung-1'].completed).toBe(true);
  expect(response.progress.modules['sipil-gedung-2'].completed).toBe(true);
});

test('unknown module records are rejected without changing saved progress', async () => {
  const before = await database.select().from(schema.learningJourneyProgress);
  const invalid = progress('not-a-catalog-module', true, at(30));
  expect((await route.PUT(request('PUT', 'active-a', { progress: invalid }))).status).toBe(400);
  expect(await database.select().from(schema.learningJourneyProgress)).toEqual(before);
});
