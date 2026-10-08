import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { Window } from 'happy-dom';
import { NextRequest } from 'next/server';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import * as schema from '@/db/schema';
import { AuthProvider, useAuth } from './AuthProvider';

// Exercise the real route and Drizzle queries without touching .data/app.db.
const client = createClient({ url: ':memory:' });
const db = drizzle(client, { schema });
mock.module('@/db', () => ({ db }));
const { POST } = await import('@/app/api/auth/route');

const skk = {
  bidang: 'Sipil',
  jabatanSkk: 'Ahli Muda Teknik Bangunan Gedung',
  kualifikasiSkk: 'Ahli Muda',
  skkCertificateLevel: '7',
  skkIssuedAt: '2026-01-15',
};
const credentials = { email: 'restore-test@example.test', password: 'test-only-password' };
const userId = 'restore-test-user';
let browser: Window;
let root: Root | undefined;
let auth: ReturnType<typeof useAuth> | undefined;
const requests: { action: string; body: Record<string, unknown> }[] = [];
const globalKeys = ['window', 'document', 'navigator', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT'] as const;
const originalGlobals = new Map(globalKeys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
const originalFetch = globalThis.fetch;

function hashPassword(value: string) {
  let hash = 0;
  for (const char of value) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash).toString(16);
}

async function request(action: string, body: Record<string, unknown>) {
  return POST(new NextRequest(`http://auth.test/api/auth?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
}

function Probe() {
  const state = useAuth();
  useEffect(() => { auth = state; }, [state]);
  return <output>{JSON.stringify({ user: state.user, isLoading: state.isLoading })}</output>;
}

async function mountProvider() {
  auth = undefined;
  const container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(<AuthProvider><Probe /></AuthProvider>);
  });
  for (let attempt = 0; attempt < 100 && auth?.isLoading; attempt++) {
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 5)); });
  }
  expect(auth?.isLoading).toBe(false);
}

async function unmountProvider() {
  if (root) await act(async () => { root!.unmount(); });
  root = undefined;
  auth = undefined;
  document.body.replaceChildren();
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
    id: userId, name: 'Restore Test', email: credentials.email,
    passwordHash: hashPassword(credentials.password),
    role: 'user', ...skk, createdAt: now, updatedAt: now,
  });
  browser = new Window({ url: 'http://auth.test' });
  const globals = {
    window: browser, document: browser.document, navigator: browser.navigator,
    localStorage: browser.localStorage, IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const key of globalKeys) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: globals[key] });
  }
  requests.length = 0;
  // Only the HTTP transport is replaced: responses come from the actual API.
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://auth.test');
    expect(url.pathname).toBe('/api/auth');
    expect(init?.method).toBe('POST');
    const action = url.searchParams.get('action')!;
    const body = JSON.parse(init!.body as string);
    requests.push({ action, body });
    return request(action, body);
  }) as typeof fetch;
});

afterEach(async () => {
  try {
    await unmountProvider();
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

describe('verify endpoint SKK contract', () => {
  it('returns all saved SKK fields for a valid session, without the password hash', async () => {
    const login = await request('login', credentials);
    expect(login.status).toBe(200);
    const { sessionId } = await login.json();
    const response = await request('verify', { sessionId });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user).toMatchObject({ id: userId, ...skk });
    expect(data.user).not.toHaveProperty('passwordHash');
  });

  it('returns explicit null SKK fields when no jabatan has been saved', async () => {
    await db.update(schema.users).set({
      bidang: null, jabatanSkk: null, kualifikasiSkk: null,
      skkCertificateLevel: null, skkIssuedAt: null,
    }).where(eq(schema.users.id, userId));
    const { sessionId } = await (await request('login', credentials)).json();
    const response = await request('verify', { sessionId });
    expect(response.status).toBe(200);
    expect((await response.json()).user).toMatchObject({
      bidang: null, jabatanSkk: null, kualifikasiSkk: null,
      skkCertificateLevel: null, skkIssuedAt: null,
    });
  });

  it('does not return user data for an unknown or expired session', async () => {
    const { sessionId } = await (await request('login', credentials)).json();
    await db.update(schema.sessions).set({ expiresAt: '2000-01-01T00:00:00.000Z' })
      .where(eq(schema.sessions.id, sessionId));
    for (const id of ['unknown-session', sessionId]) {
      const response = await request('verify', { sessionId: id });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data).not.toHaveProperty('user');
    }
  });
});

describe('fresh-device jabatan restoration through AuthProvider', () => {
  it('logs in with empty storage, then restores user and cache from session verification', async () => {
    // First device: user already has a saved server-side jabatan.
    await mountProvider();
    await act(async () => {
      expect((await auth!.login(credentials.email, credentials.password)).success).toBe(true);
    });
    expect(auth!.user).toMatchObject(skk);
    const firstSessionId = localStorage.getItem('sessionId');
    await unmountProvider();

    // New device: no session, profile, or other local data copied across.
    localStorage.clear();
    expect(localStorage.length).toBe(0);
    await mountProvider();
    expect(auth!.user).toBeNull();
    requests.length = 0;
    await act(async () => {
      expect((await auth!.login(credentials.email, credentials.password)).success).toBe(true);
    });
    expect(auth!.user).toMatchObject({ id: userId, ...skk });
    const sessionId = localStorage.getItem('sessionId');
    expect(sessionId).toBeTruthy();
    expect(sessionId).not.toBe(firstSessionId);
    expect(requests.map(entry => entry.action)).toEqual(['login']);
    await unmountProvider();

    // A session token is required to verify. Remove every cache entry and
    // retain only the token issued by the new device's own login.
    localStorage.clear();
    localStorage.setItem('sessionId', sessionId!);
    expect(localStorage.getItem('user')).toBeNull();
    requests.length = 0;
    await mountProvider();
    expect(requests).toEqual([{ action: 'verify', body: { sessionId } }]);
    expect(auth!.user).toMatchObject({ id: userId, ...skk });
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(auth!.user);
    expect(document.querySelector('output')!.textContent).toContain(skk.jabatanSkk);
  });

  it('replaces a stale device cache with the latest server-side jabatan', async () => {
    const { user, sessionId } = await (await request('login', credentials)).json();
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('user', JSON.stringify(user));
    const updatedSkk = { bidang: 'Mekanikal', jabatanSkk: 'Ahli Teknik Mekanikal', kualifikasiSkk: 'Ahli Madya' };
    await db.update(schema.users).set(updatedSkk).where(eq(schema.users.id, userId));
    await mountProvider();
    expect(auth!.user).toMatchObject(updatedSkk);
    expect(JSON.parse(localStorage.getItem('user')!)).toMatchObject(updatedSkk);
    expect(requests).toEqual([{ action: 'verify', body: { sessionId } }]);
  });
});
