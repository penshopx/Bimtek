import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { Window } from 'happy-dom';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AuthProvider, type User } from './AuthProvider';
import { SkkSelectionModal } from './SkkSelectionModal';

let browser: Window;
let root: Root | undefined;
let user: User;
const requests: string[] = [];
const originalFetch = globalThis.fetch;
const globalKeys = ['window', 'document', 'navigator', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT'] as const;
const originalGlobals = new Map(globalKeys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));

async function mount() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(<AuthProvider><SkkSelectionModal /></AuthProvider>);
  });
}

async function unmount() {
  if (root) await act(async () => { root!.unmount(); });
  root = undefined;
  document.body.replaceChildren();
}

async function click(label: string) {
  const button = [...document.querySelectorAll('button')].find(button => button.textContent?.trim() === label);
  expect(button).toBeDefined();
  await act(async () => { button!.click(); });
}

beforeEach(() => {
  browser = new Window({ url: 'http://skk.test' });
  const globals = {
    window: browser, document: browser.document, navigator: browser.navigator,
    localStorage: browser.localStorage, IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const key of globalKeys) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: globals[key] });
  }
  user = { id: 'participant-one', name: 'Participant', email: 'participant@example.test', role: 'user', createdAt: '2026-01-01' };
  localStorage.setItem('sessionId', 'test-session');
  requests.length = 0;
  globalThis.fetch = (async (input: string | URL | Request) => {
    requests.push(String(input));
    return Response.json({ user });
  }) as typeof fetch;
});

afterEach(async () => {
  await unmount();
  globalThis.fetch = originalFetch;
  await browser.happyDOM.close();
  for (const key of globalKeys) {
    const descriptor = originalGlobals.get(key);
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

describe('SKK setup session dismissal', () => {
  it('skips without saving a profile and remains hidden after remount', async () => {
    await mount();
    await click('Lewati untuk sekarang');
    expect(document.body.textContent).toBe('');
    expect(browser.sessionStorage.getItem(`skk-setup-dismissed:${user.id}`)).toBe('true');
    expect(requests.every(request => request.endsWith('action=verify'))).toBe(true);
    await unmount();
    await mount();
    expect(document.body.textContent).toBe('');
  });

  it('shows again when a new browser session has no dismissal flag', async () => {
    await mount();
    await click('Lewati untuk sekarang');
    await unmount();
    browser.sessionStorage.clear();
    await mount();
    expect(document.body.textContent).toContain('Pilih Bidang');
    expect(document.body.textContent).toContain('Lewati untuk sekarang');
  });

  it('does not apply one participant’s dismissal to another participant', async () => {
    await mount();
    await click('Lewati untuk sekarang');
    await unmount();
    user = { ...user, id: 'participant-two' };
    await mount();
    expect(document.body.textContent).toContain('Pilih Bidang');
  });

  it('offers skipping on steps two and three', async () => {
    await mount();
    const bidangButton = document.querySelector('button');
    await act(async () => { bidangButton!.click(); });
    await click('Lanjut →');
    expect(document.body.textContent).toContain('Lewati untuk sekarang');
    const jabatanButton = document.querySelector('button');
    await act(async () => { jabatanButton!.click(); });
    await click('Lanjut →');
    expect(document.body.textContent).toContain('Pilih Kualifikasi');
    await click('Lewati untuk sekarang');
    expect(document.body.textContent).toBe('');
  });

  it('still hides setup for completed profiles and non-participant roles', async () => {
    for (const updates of [{ jabatanSkk: 'saved-jabatan' }, { role: 'admin' as const }, { role: 'instructor' as const }]) {
      user = { ...user, jabatanSkk: undefined, role: 'user', ...updates };
      await mount();
      expect(document.body.textContent).toBe('');
      await unmount();
    }
  });
});
