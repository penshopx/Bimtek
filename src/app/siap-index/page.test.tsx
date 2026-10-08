import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { Window } from 'happy-dom';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SIAPIndexPage from './page';
import {
  SIAP_HISTORY_KEY, SIAP_DIMENSION_IDS, parseSiapHistory,
  type SiapHistoryEntry,
} from '@/lib/siap-index-history';

let browser: Window;
let root: Root | undefined;
const keys = ['window', 'document', 'navigator', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT'] as const;
const originals = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));

beforeEach(() => {
  browser = new Window({ url: 'http://siap.test' });
  const values = {
    window: browser, document: browser.document, navigator: browser.navigator,
    localStorage: browser.localStorage, IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const key of keys) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: values[key] });
  }
});

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  await browser.happyDOM.close();
  for (const key of keys) {
    const descriptor = originals.get(key);
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

async function mount() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root!.render(<SIAPIndexPage />));
}

async function click(label: string) {
  const button = [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === label);
  expect(button).toBeDefined();
  await act(async () => button!.click());
}

async function assess(rating: number) {
  const options = [...document.querySelectorAll<HTMLButtonElement>('button[title]')];
  const selected = options.filter(b => b.querySelector('span')?.textContent === String(rating));
  expect(selected.length).toBe(8);
  await act(async () => selected.forEach(b => b.click()));
  await click('📊 Lihat SIAP Index Saya');
}

function fixture(score: number, index: number): SiapHistoryEntry {
  return {
    timestamp: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
    overallScore: score,
    dimensionScores: Object.fromEntries(SIAP_DIMENSION_IDS.map(id => [id, score])) as SiapHistoryEntry['dimensionScores'],
  };
}

describe('SIAP Index readiness history', () => {
  it('only saves completed results; persists all dimensions and survives remount', async () => {
    await mount();
    expect(localStorage.getItem(SIAP_HISTORY_KEY)).toBeNull();
    await click('Riwayat (0)');
    expect(document.body.textContent).toContain('Belum ada riwayat asesmen');
    await click('Ambil Ulang Asesmen');
    await assess(3);
    const entries = parseSiapHistory(localStorage.getItem(SIAP_HISTORY_KEY));
    expect(entries.length).toBe(1);
    expect(entries[0].overallScore).toBe(50);
    expect(Object.values(entries[0].dimensionScores)).toEqual(Array(8).fill(50));
    await act(async () => root!.unmount());
    await mount();
    await click('Riwayat (1)');
    expect(document.body.textContent).toContain('Readiness Delta');
    expect(document.body.textContent).toContain('0 poin');
  });

  it('retakes without clearing history, shows positive and negative deltas, prunes oldest', async () => {
    localStorage.setItem(SIAP_HISTORY_KEY, JSON.stringify(Array.from({ length: 10 }, (_, i) => fixture(i * 10, i))));
    await mount();
    await assess(3);
    const entries = parseSiapHistory(localStorage.getItem(SIAP_HISTORY_KEY));
    expect(entries.length).toBe(10);
    expect(entries[0].overallScore).toBe(10);
    await click('Riwayat (10)');
    const panel = document.querySelector('#siap-panel-history')!;
    expect(panel.textContent).toContain('+40 poin');
    expect(panel.textContent).toContain('Dibanding hasil sebelumnya: -40 poin');
    expect(panel.querySelector('[role="img"]')?.getAttribute('aria-label')).toContain('50 dari 100');
    await click('Ambil Ulang Asesmen');
    expect(document.querySelector('#siap-panel-assessment')?.hasAttribute('hidden')).toBe(false);
    expect(document.body.textContent).toContain('0 / 8');
    expect(parseSiapHistory(localStorage.getItem(SIAP_HISTORY_KEY)).length).toBe(10);
  });

  it('does not duplicate a result on a double submission', async () => {
    await mount();
    const choices = [...document.querySelectorAll<HTMLButtonElement>('button[title]')].filter(b => b.querySelector('span')?.textContent === '5');
    await act(async () => choices.forEach(b => b.click()));
    const submit = [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === '📊 Lihat SIAP Index Saya')!;
    await act(async () => { submit.click(); submit.click(); });
    expect(parseSiapHistory(localStorage.getItem(SIAP_HISTORY_KEY)).length).toBe(1);
  });

  it('keeps results visible when storage is blocked and retries without duplicates', async () => {
    await mount();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: browser.localStorage.getItem.bind(browser.localStorage),
        setItem: () => { throw new Error('blocked'); },
      },
    });
    await assess(5);
    expect(document.querySelector('[role="alert"]')?.textContent).toContain('belum tersimpan');
    await click('Riwayat (1)');
    expect(document.body.textContent).toContain('Readiness Delta');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: browser.localStorage });
    await click('Coba Simpan Lagi');
    expect(document.querySelector('[role="alert"]')).toBeNull();
    expect(parseSiapHistory(localStorage.getItem(SIAP_HISTORY_KEY)).length).toBe(1);
  });

  it('handles corrupt history explicitly without deleting stored data', async () => {
    localStorage.setItem(SIAP_HISTORY_KEY, '{broken');
    await mount();
    expect(document.querySelector('[role="alert"]')?.textContent).toContain('tidak dapat dibaca');
    await assess(1);
    expect(localStorage.getItem(SIAP_HISTORY_KEY)).toBe('{broken');
    await click('Riwayat (1)');
    expect(document.body.textContent).toContain('Readiness Delta');
  });
});
