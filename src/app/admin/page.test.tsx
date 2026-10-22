// Run separately from AuthProvider.test.tsx: this suite supplies a synthetic actor.
import { afterAll, afterEach, beforeAll, beforeEach, expect, mock, test } from 'bun:test';
import { Window } from 'happy-dom';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

let actor = { id: 'admin-fixture', role: 'admin' };
mock.module('@/components/AuthProvider', () => ({ useAuth: () => ({ user: actor }) }));
mock.module('@/components/AnalyticsDashboard', () => ({ AnalyticsDashboard: () => null }));
mock.module('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));
const { default: AdminPage } = await import('./page');
const originalFetch = globalThis.fetch;
const keys = ['window', 'document', 'navigator', 'localStorage', 'confirm', 'IS_REACT_ACT_ENVIRONMENT'] as const;
const originals = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
let browser: Window;
let root: Root;
let container: HTMLDivElement;
let requests: { url: string; options?: RequestInit }[];
let rejectRole = false;
const users = [
  { id: 'admin-fixture', name: 'Admin Fixture', email: 'admin@example.invalid', role: 'admin', createdAt: '2026-01-01' },
  { id: 'other-admin', name: 'Other Admin', email: 'other@example.invalid', role: 'admin', createdAt: '2026-01-01' },
  { id: 'user-fixture', name: 'User Fixture', email: 'user@example.invalid', role: 'user', createdAt: '2026-01-01' },
];

beforeAll(() => {
  browser = new Window({ url: 'http://admin.test' });
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: browser },
    document: { configurable: true, value: browser.document },
    navigator: { configurable: true, value: browser.navigator },
    localStorage: { configurable: true, value: browser.localStorage },
    confirm: { configurable: true, value: () => true },
    IS_REACT_ACT_ENVIRONMENT: { configurable: true, value: true },
  });
});

beforeEach(async () => {
  actor = { id: 'admin-fixture', role: 'admin' };
  rejectRole = false;
  requests = [];
  localStorage.setItem('sessionId', 'synthetic-admin-session');
  globalThis.fetch = (async (input: string | URL | Request, options?: RequestInit) => {
    const url = String(input);
    requests.push({ url, options });
    if (url.includes('updateUserRole')) {
      return Response.json({ success: !rejectRole, message: 'Perubahan ditolak oleh server.' }, { status: rejectRole ? 403 : 200 });
    }
    if (url.includes('allUsers')) {
      const offset = new URL(url, 'http://admin.test').searchParams.get('offset') || '0';
      return Response.json({ users, total: 30, offset: Number(offset), limit: 25 });
    }
    return Response.json({ stats: {}, events: [], activities: [] });
  }) as typeof fetch;
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => { root.unmount(); });
  container.remove();
  globalThis.fetch = originalFetch;
});

afterAll(() => {
  mock.restore();
  for (const key of keys) {
    const descriptor = originals.get(key);
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
  browser.happyDOM.abort();
});

async function mount() {
  await act(async () => { root.render(<AdminPage />); });
}
async function openUsers() {
  const button = Array.from(container.querySelectorAll('button')).find(button => button.textContent?.includes('Pengguna'));
  expect(button).toBeDefined();
  await act(async () => { button!.click(); });
}

test('non-admin cannot see controls or trigger admin loading', async () => {
  actor = { id: 'user-fixture', role: 'user' };
  await mount();
  expect(container.textContent).toContain('Akses Ditolak');
  expect(container.querySelector('select')).toBeNull();
  expect(requests).toHaveLength(0);
});

test('admin requests send a session, own/admin roles and all delete buttons disabled', async () => {
  await mount();
  await openUsers();
  expect(requests.length).toBe(4);
  for (const request of requests) {
    expect(new Headers(request.options?.headers).get('x-session-id')).toBe('synthetic-admin-session');
  }
  const selects = container.querySelectorAll('select');
  expect(selects).toHaveLength(3);
  expect(selects[0].disabled).toBe(true);
  expect(selects[1].disabled).toBe(true);
  expect(selects[2].disabled).toBe(false);
  const deletes = Array.from(container.querySelectorAll('button')).filter(button => button.textContent?.includes('Hapus dinonaktifkan'));
  expect(deletes).toHaveLength(3);
  for (const button of deletes) expect(button.disabled).toBe(true);
  expect(requests.some(request => request.url.includes('deleteUser'))).toBe(false);
});

test('server rejection during role change is visible rather than reported as success', async () => {
  rejectRole = true;
  await mount();
  await openUsers();
  const select = container.querySelectorAll('select')[2];
  await act(async () => {
    select.value = 'instructor';
    select.dispatchEvent(new browser.Event('change', { bubbles: true }));
  });
  expect(container.querySelector('[role="alert"]')?.textContent).toBe('Perubahan ditolak oleh server.');
  const mutation = requests.find(request => request.url.includes('updateUserRole'));
  expect(mutation).toBeDefined();
  expect(new Headers(mutation!.options?.headers).get('x-session-id')).toBe('synthetic-admin-session');
  expect(select.value).toBe('user');
});

test('next page requests bounded server pagination', async () => {
  await mount();
  await openUsers();
  const next = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Berikutnya');
  await act(async () => { next!.click(); });
  expect(requests.some(request => request.url.includes('allUsers&limit=25&offset=25'))).toBe(true);
});
