import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { Window } from 'happy-dom';
import { NextRequest } from 'next/server';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import * as schema from '@/db/schema';
import DokumenPage from './page';

// Use the real login and me handlers, with an isolated database, not .data/app.db.
const client = createClient({ url: ':memory:' });
const db = drizzle(client, { schema });
mock.module('@/db', () => ({ db }));
// Bun shares imported modules between test files. A distinct route instance
// prevents its cached DB from leaking into AuthProvider's independent fixture.
const { GET, POST } = await import('../api/auth/route.ts?dokumen-tests');
// Resolve this instance's lazy DB while our mock is active, before another
// test file can replace it. Unknown actions do not query or mutate tables.
const bootstrap = await POST(new NextRequest('http://dokumen.test/api/auth?action=fixture-bootstrap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}',
}));
expect(bootstrap.status).toBe(400);

const credentials = { email: 'dokumen-test@example.test', password: 'test-only-password' };
const userId = 'dokumen-test-user';
const emptyMessage = 'Pilih jabatan di sebelah kiri untuk memulai';
const mappings = [
  { profile: 'MP001', id: 'pelaks-gedung', name: 'Pelaksana Lapangan Pekerjaan Gedung', bidang: 'Sipil' },
  { profile: 'MP002', id: 'pelaks-jalan', name: 'Pelaksana Lapangan Pekerjaan Jalan', bidang: 'Sipil' },
  { profile: 'MP003', id: 'site-engineer', name: 'Site Engineer', bidang: 'Manajemen Pelaksanaan' },
  { profile: 'MP004', id: 'manajer-lapangan', name: 'Manajer Lapangan Pekerjaan Gedung', bidang: 'Manajemen Pelaksanaan' },
  { profile: 'MP005', id: 'manajer-proyek', name: 'Manajer Proyek', bidang: 'Manajemen Pelaksanaan' },
  { profile: 'MP006', id: 'qc', name: 'Quality Control (QC) Konstruksi', bidang: 'Manajemen Pelaksanaan' },
  { profile: 'MP007', id: 'qs', name: 'Quantity Surveyor', bidang: 'Manajemen Pelaksanaan' },
  { profile: 'F001', id: 'ahli-sipil-madya', name: 'Ahli Teknik Jalan – Madya', bidang: 'Sipil' },
];

let browser: Window;
let root: Root | undefined;
let meFinished: boolean;
const checklistRequests: { id: string; sessionId: string | null }[] = [];
const globalKeys = ['window', 'document', 'navigator', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT'] as const;
const originalGlobals = new Map(globalKeys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const originalFetch = globalThis.fetch;

function hashPassword(value: string) {
  let hash = 0;
  for (const char of value) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash).toString(16);
}

async function login(jabatanSkk: string | null) {
  // A deliberately stale bidang proves selection derives from the matched
  // checklist entry, not the profile's independent bidang field.
  await db.update(schema.users).set({ jabatanSkk, bidang: 'Mekanikal' })
    .where(eq(schema.users.id, userId));
  const response = await POST(new NextRequest('http://dokumen.test/api/auth?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }));
  expect(response.status).toBe(200);
  const { sessionId, user } = await response.json();
  expect(user.jabatanSkk).toBe(jabatanSkk);
  // Only the login token is carried to /dokumen, never a cached user profile.
  localStorage.setItem('sessionId', sessionId);
  return sessionId as string;
}

async function mountPage() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root!.render(<DokumenPage />); });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (meFinished && !document.body.textContent?.includes('Memuat checklist...')) break;
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 5)); });
  }
  expect(meFinished).toBe(true);
  expect(document.querySelector('h1')?.textContent).toContain('Dokumen');
  expect(document.body.textContent).not.toContain('Memuat checklist...');
}

function activeTabNames() {
  return Array.from(document.querySelectorAll('button'))
    .filter(button => button.classList.contains('bg-amber-500/20'))
    .map(button => button.textContent?.trim().replace(/^[^\p{L}]+/u, ''));
}

function highlightedJabatan() {
  return Array.from(document.querySelectorAll('button'))
    .filter(button => button.classList.contains('bg-amber-500/15'))
    .map(button => button.querySelector('div')?.textContent);
}

function expectEmptyState() {
  expect(activeTabNames()).toEqual(['Sipil']);
  expect(highlightedJabatan()).toEqual([]);
  expect(document.body.textContent).toContain(emptyMessage);
  expect(checklistRequests).toEqual([]);
}

beforeAll(async () => {
  await client.executeMultiple(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, role TEXT DEFAULT 'user', avatar TEXT,
      phone TEXT, company TEXT, position TEXT, bidang TEXT, jabatan_skk TEXT,
      kualifikasi_skk TEXT, skk_certificate_level TEXT, skk_issued_at TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL, created_at TEXT NOT NULL
    );
  `);
});

beforeEach(async () => {
  await db.delete(schema.sessions);
  await db.delete(schema.users);
  const now = new Date().toISOString();
  await db.insert(schema.users).values({
    id: userId, name: 'Dokumen Test', email: credentials.email,
    passwordHash: hashPassword(credentials.password), role: 'user',
    createdAt: now, updatedAt: now,
  });
  browser = new Window({ url: 'http://dokumen.test/dokumen' });
  const globals = {
    window: browser, document: browser.document, navigator: browser.navigator,
    localStorage: browser.localStorage, IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const key of globalKeys) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: globals[key] });
  }
  meFinished = false;
  checklistRequests.length = 0;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://dokumen.test');
    const headers = new Headers(init?.headers);
    if (url.pathname === '/api/auth') {
      expect(url.searchParams.get('action')).toBe('me');
      expect(headers.get('x-session-id')).toBe(localStorage.getItem('sessionId'));
      try {
        // HTTP transport only: the nested { user: { jabatanSkk } } response
        // comes from the real route and real session lookup.
        return await GET(new NextRequest(url, { headers }));
      } finally {
        meFinished = true;
      }
    }
    expect(url.pathname).toBe('/api/dokumen');
    checklistRequests.push({
      id: url.searchParams.get('jabatan')!,
      sessionId: headers.get('x-session-id'),
    });
    // Checklist persistence is outside these pre-selection tests.
    return Response.json({ items: [] });
  }) as typeof fetch;
});

afterEach(async () => {
  try {
    if (root) await act(async () => { root!.unmount(); });
    root = undefined;
  } finally {
    globalThis.fetch = originalFetch;
    await browser.happyDOM.close();
    for (const key of globalKeys) {
      const descriptor = originalGlobals.get(key);
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});

afterAll(() => {
  mock.restore();
  client.close();
});

describe('/dokumen saved profile pre-selection', () => {
  for (const mapping of mappings) {
    it(`logs in with ${mapping.profile}, activates ${mapping.bidang} and highlights ${mapping.name} without clicks`, async () => {
      const sessionId = await login(mapping.profile);
      await mountPage();
      expect(activeTabNames()).toEqual([mapping.bidang]);
      expect(highlightedJabatan()).toEqual([mapping.name]);
      expect(document.body.textContent).not.toContain(emptyMessage);
      expect(Array.from(document.querySelectorAll('h2')).some(h => h.textContent === mapping.name)).toBe(true);
      expect(checklistRequests).toEqual([{ id: mapping.id, sessionId }]);
    });
  }

  it('trims whitespace around a saved profile ID before matching', async () => {
    await login('  MP005  ');
    await mountPage();
    expect(activeTabNames()).toEqual(['Manajemen Pelaksanaan']);
    expect(highlightedJabatan()).toEqual(['Manajer Proyek']);
    expect(checklistRequests.map(request => request.id)).toEqual(['manajer-proyek']);
  });

  it('keeps the default empty state for an unauthenticated visitor', async () => {
    await mountPage();
    expectEmptyState();
  });

  for (const value of [null, '', '   ']) {
    it(`keeps the default empty state when saved jabatan is ${JSON.stringify(value)}`, async () => {
      await login(value);
      await mountPage();
      expectEmptyState();
    });
  }

  // The current contract intentionally uses validated profile IDs only.
  // Legacy exact IDs/names, case-insensitive names and substring matches must
  // not silently select a different certification checklist.
  for (const value of ['UNKNOWN', 'manajer-proyek', 'Manajer Proyek', 'manajer proyek', 'Proyek']) {
    it(`does not guess a checklist for an unmapped value: ${value}`, async () => {
      await login(value);
      await mountPage();
      expectEmptyState();
    });
  }

  it('keeps the default empty state for an expired login session', async () => {
    const sessionId = await login('MP005');
    await db.update(schema.sessions).set({ expiresAt: '2000-01-01T00:00:00.000Z' })
      .where(eq(schema.sessions.id, sessionId));
    await mountPage();
    expectEmptyState();
  });
});
