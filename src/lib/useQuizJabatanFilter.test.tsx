import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { Window } from 'happy-dom';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useQuizJabatanFilter } from './useQuizJabatanFilter';

let browser: Window;
let root: Root;
let filter: ReturnType<typeof useQuizJabatanFilter>;
const keys = ['window', 'document', 'navigator', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT'] as const;
const originals = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));

function Probe({ userId, hasJabatan }: { userId?: string; hasJabatan: boolean }) {
  const state = useQuizJabatanFilter(userId, hasJabatan);
  useEffect(() => { filter = state; }, [state]);
  return <output>{String(state[0])}</output>;
}

async function render(userId?: string, hasJabatan = true) {
  await act(async () => { root.render(<Probe userId={userId} hasJabatan={hasJabatan} />); });
}

beforeEach(() => {
  browser = new Window({ url: 'http://quiz.test' });
  const globals = {
    window: browser, document: browser.document, navigator: browser.navigator,
    localStorage: browser.localStorage, IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const key of keys) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: globals[key] });
  }
  root = createRoot(document.createElement('div'));
});

afterEach(async () => {
  await act(async () => { root.unmount(); });
  await browser.happyDOM.close();
  for (const key of keys) {
    const descriptor = originals.get(key);
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

describe('quiz jabatan preference', () => {
  it('saves both toggle states and restores them after remounting', async () => {
    await render('first');
    expect(filter[0]).toBe(false);
    await act(async () => { filter[1](true); });
    expect(localStorage.getItem('quiz-jabatan-filter:first')).toBe('true');
    await act(async () => { root.unmount(); });
    root = createRoot(document.createElement('div'));
    await render('first');
    expect(filter[0]).toBe(true);
    await act(async () => { filter[1](false); });
    await act(async () => { root.unmount(); });
    root = createRoot(document.createElement('div'));
    await render('first');
    expect(filter[0]).toBe(false);
    expect(localStorage.getItem('quiz-jabatan-filter:first')).toBe('false');
  });

  it('waits for auth, isolates accounts and resets on logout', async () => {
    localStorage.setItem('quiz-jabatan-filter:first', 'true');
    await render(undefined);
    expect(filter[0]).toBe(false);
    await render('first');
    expect(filter[0]).toBe(true);
    await render('second');
    expect(filter[0]).toBe(false);
    await act(async () => { filter[1](false); });
    expect(localStorage.getItem('quiz-jabatan-filter:first')).toBe('true');
    await render('first');
    expect(filter[0]).toBe(true);
    await render(undefined);
    expect(filter[0]).toBe(false);
  });

  it('ignores the saved preference without a jabatan and preserves it', async () => {
    localStorage.setItem('quiz-jabatan-filter:first', 'true');
    await render('first', false);
    expect(filter[0]).toBe(false);
    await act(async () => { filter[1](false); });
    expect(localStorage.getItem('quiz-jabatan-filter:first')).toBe('true');
    await render('first', true);
    expect(filter[0]).toBe(true);
    await render('first', false);
    expect(filter[0]).toBe(false);
  });

  it('treats malformed stored values as disabled', async () => {
    localStorage.setItem('quiz-jabatan-filter:first', 'not-a-boolean');
    await render('first');
    expect(filter[0]).toBe(false);
  });
});
