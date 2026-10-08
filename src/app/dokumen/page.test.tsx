import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { Window } from 'happy-dom';
import { NextRequest } from 'next/server';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import * as schema from '@/db/schema';
import DokumenPage from './page';
import { AuthProvider } from '@/components/AuthProvider';
import { getJabatanById, getJabatanByBidang, getRelatedCategories, getRelatedQuizCategories } from '@/lib/skkData';

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
const checklistRoute = await import('../api/dokumen/route.ts?dokumen-tests');
// Initialize the checklist handler's cached DB under this suite's mock too.
expect((await checklistRoute.GET(new NextRequest('http://dokumen.test/api/dokumen?jabatan=fixture-bootstrap'))).status).toBe(401);

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
let updateFailure: 'server' | 'network' | null;
let updateRequests: Record<string, unknown>[];
let checklistFailure: 'server' | 'network' | null;
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
  await act(async () => { root!.render(<AuthProvider><DokumenPage /></AuthProvider>); });
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
    CREATE TABLE document_checklist (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, jabatan_id TEXT NOT NULL,
      document_id TEXT NOT NULL, checked INTEGER DEFAULT false,
      checked_at TEXT, note TEXT, created_at TEXT NOT NULL
    );
  `);
  // Exercise the actual N/A migration rather than hand-writing its column.
  await client.executeMultiple(readFileSync(new URL('../../db/migrations/0010_document_checklist_na.sql', import.meta.url), 'utf8'));
});

beforeEach(async () => {
  await db.delete(schema.documentChecklist);
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
  updateFailure = null;
  checklistFailure = null;
  updateRequests = [];
  checklistRequests.length = 0;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://dokumen.test');
    const headers = new Headers(init?.headers);
    if (url.pathname === '/api/auth') {
      if (init?.method === 'POST') {
        const body = JSON.parse(init.body as string);
        if (url.searchParams.get('action') === 'update') {
          updateRequests.push(body);
          if (updateFailure === 'server') return Response.json({ success: false }, { status: 500 });
          if (updateFailure === 'network') throw new Error('Network unavailable');
        } else {
          expect(url.searchParams.get('action')).toBe('verify');
        }
        return POST(new NextRequest(url, { method: 'POST', headers, body: init.body }));
      }
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
    if (init?.method === 'POST') {
      if (JSON.parse(init.body as string).documentId === 'foto') {
        if (checklistFailure === 'server') return Response.json({ success: false }, { status: 500 });
        if (checklistFailure === 'network') throw new Error('Network unavailable');
      }
      return checklistRoute.POST(new NextRequest(url, { method: 'POST', headers, body: init.body }));
    }
    checklistRequests.push({
      id: url.searchParams.get('jabatan')!,
      sessionId: headers.get('x-session-id'),
    });
    return checklistRoute.GET(new NextRequest(url, { headers }));
  }) as typeof fetch;
});

const defaultLabel = 'Jadikan jabatan default saya';

function defaultButton() {
  return Array.from(document.querySelectorAll('button'))
    .find(button => button.textContent === defaultLabel);
}

async function clickButton(text: string) {
  const button = Array.from(document.querySelectorAll('button'))
    .find(button => button.textContent?.includes(text));
  expect(button).toBeDefined();
  await act(async () => { button!.click(); });
}

describe('/dokumen N/A persistence', () => {
  function documentRow(name: string) {
    const label = Array.from(document.querySelectorAll('div.font-semibold'))
      .find(element => element.textContent === name);
    expect(label).toBeDefined();
    return { label: label!, row: label!.parentElement!.parentElement! };
  }

  async function reopenPage(guest: boolean) {
    await act(async () => { root!.unmount(); });
    root = undefined;
    document.body.replaceChildren();
    meFinished = false;
    await mountPage();
    if (guest) await clickButton('Pelaksana Lapangan Pekerjaan Gedung');
  }

  function identityCategoryButton() {
    const button = document.querySelector<HTMLButtonElement>('button[aria-label$="— Identitas"]');
    expect(button).not.toBeNull();
    return button!;
  }

  for (const guest of [false, true]) {
    it(`marks an entire mixed category N/A, preserves notes and other categories, and restores unchecked after reload (${guest ? 'guest' : 'signed in'})`, async () => {
      if (!guest) await login('MP001');
      await mountPage();
      if (guest) await clickButton('Pelaksana Lapangan Pekerjaan Gedung');
      const progressText = () => Array.from(document.querySelectorAll('p'))
        .find(element => /^\d+ \/ \d+ dokumen$/.test(element.textContent ?? ''))!.textContent!;
      const total = Number(progressText().match(/\/ (\d+)/)![1]);
      const categoryButtons = document.querySelectorAll('button[aria-label^="N/A Semua —"]');
      expect(categoryButtons.length).toBe(6);
      await act(async () => { documentRow('KTP / Kartu Identitas').row.click(); });
      await act(async () => { documentRow('Ijazah Pendidikan Terakhir').row.click(); });
      // Give the first item a persisted note; category writes must not erase it.
      const saved = (await db.select().from(schema.documentChecklist)).find(item => item.documentId === 'ktp')!;
      await db.update(schema.documentChecklist).set({ note: 'Folder identitas' })
        .where(eq(schema.documentChecklist.id, saved.id));
      await act(async () => { documentRow('Pas Foto 3×4').row.querySelector('button')!.click(); });
      await reopenPage(guest);
      await act(async () => { identityCategoryButton().click(); });
      expect(identityCategoryButton().getAttribute('aria-pressed')).toBe('true');
      expect(progressText()).toBe(`1 / ${total - 2} dokumen`);
      let items = await db.select().from(schema.documentChecklist);
      for (const id of ['ktp', 'foto']) {
        expect(items.find(item => item.documentId === id)?.na).toBe(true);
        expect(items.find(item => item.documentId === id)?.checked).toBe(false);
      }
      expect(items.find(item => item.documentId === 'ktp')?.note).toBe('Folder identitas');
      expect(items.find(item => item.documentId === 'ijazah')?.checked).toBe(true);
      await reopenPage(guest);
      expect(identityCategoryButton().getAttribute('aria-pressed')).toBe('true');
      expect(progressText()).toBe(`1 / ${total - 2} dokumen`);
      await act(async () => { identityCategoryButton().click(); });
      expect(identityCategoryButton().getAttribute('aria-pressed')).toBe('false');
      expect(progressText()).toBe(`1 / ${total} dokumen`);
      await reopenPage(guest);
      items = await db.select().from(schema.documentChecklist);
      for (const id of ['ktp', 'foto']) {
        expect(items.find(item => item.documentId === id)?.na).toBe(false);
        expect(items.find(item => item.documentId === id)?.checked).toBe(false);
      }
      expect((documentRow('KTP / Kartu Identitas').row.querySelector('input') as HTMLInputElement).value)
        .toBe('Folder identitas');
      expect(progressText()).toBe(`1 / ${total} dokumen`);
    });
  }

  for (const failure of ['server', 'network'] as const) {
    it(`keeps successful category writes visible and lets users retry after a partial ${failure} failure`, async () => {
      await login('MP001');
      await mountPage();
      await act(async () => { documentRow('Pas Foto 3×4').row.click(); });
      checklistFailure = failure;
      await act(async () => { identityCategoryButton().click(); });
      expect(document.querySelector('[role="alert"]')?.textContent).toContain('Gagal menyimpan 1 dokumen');
      expect(documentRow('KTP / Kartu Identitas').label.classList.contains('text-slate-500')).toBe(true);
      expect(documentRow('Pas Foto 3×4').label.classList.contains('text-green-300')).toBe(true);
      expect(identityCategoryButton().disabled).toBe(false);
      checklistFailure = null;
      await act(async () => { identityCategoryButton().click(); });
      expect(document.querySelector('[role="alert"]')).toBeNull();
      await reopenPage(false);
      expect(identityCategoryButton().getAttribute('aria-pressed')).toBe('true');
    });
  }

  for (const guest of [false, true]) {
    for (const initiallyChecked of [false, true]) {
      it(`retains N/A styling and progress after reload, then restores unchecked (${guest ? 'guest' : 'signed in'}, initially ${initiallyChecked ? 'checked' : 'new'})`, async () => {
        if (!guest) await login('MP001');
        await mountPage();
        if (guest) await clickButton('Pelaksana Lapangan Pekerjaan Gedung');

        const targetName = 'KTP / Kartu Identitas';
        const otherName = 'Pas Foto 3×4';
        const progressText = () => Array.from(document.querySelectorAll('p'))
          .find(element => /^\d+ \/ \d+ dokumen$/.test(element.textContent ?? ''))!.textContent!;
        const originalTotal = Number(progressText().match(/\/ (\d+)/)![1]);
        await act(async () => { documentRow(otherName).row.click(); });
        if (initiallyChecked) {
          await act(async () => { documentRow(targetName).row.click(); });
        }
        await act(async () => { documentRow(targetName).row.querySelector('button')!.click(); });

        async function expectPersistedNA(na: boolean) {
          const [saved] = (await db.select().from(schema.documentChecklist))
            .filter(item => item.documentId === 'ktp');
          expect(saved.na).toBe(na);
          expect(saved.checked).toBe(false);
          expect(saved.checkedAt).toBeNull();
          const { label, row } = documentRow(targetName);
          expect(label.classList.contains('line-through')).toBe(na);
          expect(label.classList.contains(na ? 'text-slate-500' : 'text-white')).toBe(true);
          expect(row.classList.contains('opacity-60')).toBe(na);
          expect(row.querySelector('svg')).toBeNull();
          expect(row.querySelector('button')!.title).toBe(na
            ? 'Batalkan N/A — dokumen ini berlaku'
            : 'Tandai sebagai Tidak Berlaku (N/A)');
          const total = originalTotal - (na ? 1 : 0);
          expect(progressText()).toBe(`1 / ${total} dokumen`);
          const bar = document.querySelector('div.h-2\\.5.transition-all') as HTMLElement;
          expect(bar.style.width).toBe(`${Math.round(100 / total)}%`);
        }

        await expectPersistedNA(true);
        await reopenPage(guest);
        await expectPersistedNA(true);

        await act(async () => { documentRow(targetName).row.querySelector('button')!.click(); });
        await expectPersistedNA(false);
        await reopenPage(guest);
        await expectPersistedNA(false);
        // The restored document can be checked normally again.
        await act(async () => { documentRow(targetName).row.click(); });
        expect(documentRow(targetName).row.querySelector('svg')).not.toBeNull();
        expect(progressText()).toBe(`2 / ${originalTotal} dokumen`);
      });
    }
  }
});

describe('/dokumen save default jabatan', () => {
  it('only offers saving a different manually selected role, and keeps the new default after remount', async () => {
    await login('MP001');
    await mountPage();
    expect(defaultButton()).toBeUndefined();
    await clickButton('Pelaksana Lapangan Pekerjaan Jalan');
    expect(defaultButton()).toBeDefined();
    await clickButton(defaultLabel);
    expect(updateRequests).toEqual([{ userId, updates: { jabatanSkk: 'MP002' } }]);
    expect(document.querySelector('[role="status"]')?.textContent).toContain('berhasil disimpan');
    expect(defaultButton()).toBeUndefined();
    expect(JSON.parse(localStorage.getItem('user')!).jabatanSkk).toBe('MP002');
    const [saved] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    expect(saved.jabatanSkk).toBe('MP002');

    await act(async () => { root!.unmount(); });
    root = undefined;
    meFinished = false;
    await mountPage();
    expect(highlightedJabatan()).toEqual(['Pelaksana Lapangan Pekerjaan Jalan']);
    expect(defaultButton()).toBeUndefined();
  });

  it('hides the action when returning to the saved role, without saving on selection', async () => {
    await login('MP001');
    await mountPage();
    await clickButton('Pelaksana Lapangan Pekerjaan Jalan');
    expect(defaultButton()).toBeDefined();
    await clickButton('Pelaksana Lapangan Pekerjaan Gedung');
    expect(defaultButton()).toBeUndefined();
    expect(updateRequests).toEqual([]);
  });

  it('never offers profile saving to guests', async () => {
    await mountPage();
    await clickButton('Pelaksana Lapangan Pekerjaan Gedung');
    expect(defaultButton()).toBeUndefined();
  });

  for (const failure of ['server', 'network'] as const) {
    it(`keeps the old default and permits retry after a ${failure} failure`, async () => {
      await login('MP001');
      await mountPage();
      await clickButton('Pelaksana Lapangan Pekerjaan Jalan');
      updateFailure = failure;
      await clickButton(defaultLabel);
      expect(document.querySelector('[role="alert"]')?.textContent).toContain('Silakan coba lagi');
      expect(document.querySelector('[role="status"]')).toBeNull();
      expect(defaultButton()).toBeDefined();
      expect(JSON.parse(localStorage.getItem('user')!).jabatanSkk).toBe('MP001');
      const [saved] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
      expect(saved.jabatanSkk).toBe('MP001');
      updateFailure = null;
      await clickButton(defaultLabel);
      expect(defaultButton()).toBeUndefined();
      expect(document.querySelector('[role="alert"]')).toBeNull();
    });
  }

  for (const name of [
    'Pelaksana Lapangan Pekerjaan Jembatan',
    'Teknisi Survey Pemetaan',
    'Drafter / Juru Gambar Sipil',
    'Ahli K3 Konstruksi',
  ]) {
    it(`preserves the exact unmapped role ${name} rather than guessing a catalog ID`, async () => {
      await login('MP001');
      await mountPage();
      if (name === 'Ahli K3 Konstruksi') await clickButton('Manajemen Pelaksanaan');
      await clickButton(name);
      expect(defaultButton()).toBeDefined();
      await clickButton(defaultLabel);
      expect(updateRequests[0]).toEqual({ userId, updates: { jabatanSkk: name } });
      // These are the same resolvers used by profile, dashboard, BIMTEK and
      // quiz; a saved target must remain visible and retain learning filters.
      expect(getJabatanById(name)?.name).toBe(name);
      expect(getRelatedCategories(name).length).toBeGreaterThan(0);
      expect(getRelatedQuizCategories(name).length).toBeGreaterThan(0);
      expect(getJabatanByBidang(getJabatanById(name)!.bidang).some(j => j.id === name)).toBe(true);
      await act(async () => { root!.unmount(); });
      root = undefined;
      meFinished = false;
      await mountPage();
      expect(highlightedJabatan()).toEqual([name]);
    });
  }
});

describe('profile update ownership', () => {
  async function update(body: Record<string, unknown>, sessionId?: string) {
    return POST(new NextRequest('http://dokumen.test/api/auth?action=update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'x-session-id': sessionId } : {}) },
      body: JSON.stringify(body),
    }));
  }

  it('requires a valid session, even when a real user ID is supplied', async () => {
    const sessionId = await login('MP001');
    for (const token of [undefined, 'invalid-session']) {
      expect((await update({ userId, updates: { jabatanSkk: 'MP002' } }, token)).status).toBe(401);
    }
    await db.update(schema.sessions).set({ expiresAt: '2000-01-01T00:00:00.000Z' })
      .where(eq(schema.sessions.id, sessionId));
    expect((await update({ userId, updates: { jabatanSkk: 'MP002' } }, sessionId)).status).toBe(401);
    const [saved] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    expect(saved.jabatanSkk).toBe('MP001');
  });

  it('rejects a request to change a different user and leaves both profiles unchanged', async () => {
    const sessionId = await login('MP001');
    const now = new Date().toISOString();
    await db.insert(schema.users).values({
      id: 'other-user', name: 'Other Test', email: 'other@example.test',
      passwordHash: 'unused', jabatanSkk: 'MP003', createdAt: now, updatedAt: now,
    });
    expect((await update({ userId: 'other-user', updates: { jabatanSkk: 'MP002' } }, sessionId)).status).toBe(403);
    const users = await db.select().from(schema.users);
    expect(users.find(u => u.id === userId)!.jabatanSkk).toBe('MP001');
    expect(users.find(u => u.id === 'other-user')!.jabatanSkk).toBe('MP003');
  });

  it('derives ownership from the session when no user ID is supplied and rejects protected fields', async () => {
    const sessionId = await login('MP001');
    expect((await update({ updates: { jabatanSkk: 'MP002' } }, sessionId)).status).toBe(200);
    for (const updates of [{ role: 'admin' }, { passwordHash: 'changed' }, { id: 'changed' }, { jabatanSkk: {} }, { name: null }]) {
      expect((await update({ updates }, sessionId)).status).toBe(400);
    }
    const [saved] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
    expect(saved.jabatanSkk).toBe('MP002');
    expect(saved.role).toBe('user');
  });
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
  it('uses the profile-link target instead of the saved account default', async () => {
    await login('MP001');
    browser.location.href = 'http://dokumen.test/dokumen?jabatan=Project%20Manager%20Konstruksi&context=Data%20profil';
    await mountPage();
    expect(highlightedJabatan()).toEqual(['Manajer Proyek']);
    expect(checklistRequests.map(request => request.id)).toEqual(['manajer-proyek']);
    expect(document.body.textContent).toContain('Data dari Profil SKK');
  });

  it('shows unsupported profile-link targets without falling back to another jabatan', async () => {
    await login('MP001');
    browser.location.href = 'http://dokumen.test/dokumen?jabatan=Target%20lain';
    await mountPage();
    expect(highlightedJabatan()).toEqual([]);
    expect(checklistRequests).toEqual([]);
    expect(document.body.textContent).toContain('belum tersedia pada checklist ini');
  });

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
