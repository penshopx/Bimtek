import { afterEach, beforeEach, expect, it } from 'bun:test';
import { Window } from 'happy-dom';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BookmarkProvider } from '@/components/BookmarkProvider';
import ProsedurPage from './page';

const keys = ['window', 'document', 'navigator', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT'] as const;
const originals = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
let browser: Window;
let root: Root;

beforeEach(() => {
  browser = new Window({ url: 'http://prosedur.test/prosedur' });
  for (const key of keys) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: key === 'IS_REACT_ACT_ENVIRONMENT' ? true : browser[key as keyof Window],
    });
  }
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  for (const key of keys) {
    const original = originals.get(key);
    if (original) Object.defineProperty(globalThis, key, original);
    else Reflect.deleteProperty(globalThis, key);
  }
  browser.happyDOM.abort();
});

async function mount() {
  await act(async () => root.render(<BookmarkProvider><ProsedurPage /></BookmarkProvider>));
}

function resetButton() {
  return [...document.querySelectorAll('button')].find(button => button.textContent === 'Mulai ulang');
}

async function toggleStep(index: number) {
  await act(async () => {
    (document.querySelector(`#prosedur-${currentMethod()}-${index} button`) as HTMLButtonElement).click();
  });
}

function currentMethod() {
  return document.querySelector('[id^="prosedur-"]')!.id.split('-')[1];
}

async function selectMethod(label: string) {
  const tab = [...document.querySelectorAll('button')].find(button => button.textContent?.includes(label));
  expect(tab).toBeDefined();
  await act(async () => tab!.click());
}

function expectProgress(method: string, indices: number[]) {
  expect(currentMethod()).toBe(method);
  expect(document.body.textContent).toContain(`${indices.length}/5 langkah selesai`);
  expect(document.body.textContent).toContain(`${indices.length * 20}%`);
  for (let i = 0; i < 5; i++) {
    const button = document.querySelector(`#prosedur-${method}-${i} button`);
    expect(button?.getAttribute('title')).toBe(indices.includes(i) ? 'Tandai belum selesai' : 'Tandai selesai');
  }
}

it('restores the exact two completed steps and 40% progress after a page remount', async () => {
  await mount();
  await toggleStep(0);
  await toggleStep(3);
  expectProgress('hardcopy', [0, 3]);
  expect(localStorage.getItem('prosedur-checklist-hardcopy')).toBe('[true,false,false,true,false]');

  await act(async () => root.render(null));
  await mount();
  expectProgress('hardcopy', [0, 3]);
});

it('keeps all three methods independent when switching tabs and remounting', async () => {
  await mount();
  await toggleStep(0);
  await toggleStep(3);
  await selectMethod('Paperless');
  expectProgress('paperless', []);
  await toggleStep(1);
  await selectMethod('AJJ');
  expectProgress('ajj', []);
  await toggleStep(2);
  await toggleStep(4);
  await selectMethod('Hardcopy');
  expectProgress('hardcopy', [0, 3]);
  await selectMethod('Paperless');
  expectProgress('paperless', [1]);
  await selectMethod('AJJ');
  expectProgress('ajj', [2, 4]);

  await act(async () => root.render(null));
  await mount();
  expectProgress('hardcopy', [0, 3]);
  await selectMethod('Paperless');
  expectProgress('paperless', [1]);
  await selectMethod('AJJ');
  expectProgress('ajj', [2, 4]);
});

it('recovers from invalid JSON without clearing another method’s progress', async () => {
  localStorage.setItem('prosedur-checklist-hardcopy', '{invalid json');
  localStorage.setItem('prosedur-checklist-paperless', '[false,true,false,false,true]');
  await mount();
  expectProgress('hardcopy', []);
  await toggleStep(2);
  await selectMethod('Paperless');
  expectProgress('paperless', [1, 4]);
  await selectMethod('Hardcopy');
  expectProgress('hardcopy', [2]);
});

it('shows reset only with progress and clears only the current method, including after remount', async () => {
  localStorage.setItem('prosedur-checklist-paperless', '[true,false]');
  await mount();
  expect(resetButton()).toBeUndefined();
  await act(async () => (document.querySelector('button[title="Tandai selesai"]') as HTMLButtonElement).click());
  expect(resetButton()).toBeDefined();
  await act(async () => resetButton()!.click());
  expect(resetButton()).toBeUndefined();
  expect(document.querySelectorAll('button[title="Tandai belum selesai"]').length).toBe(0);
  expect(JSON.parse(localStorage.getItem('prosedur-checklist-hardcopy')!).every((value: boolean) => value === false)).toBe(true);
  expect(localStorage.getItem('prosedur-checklist-paperless')).toBe('[true,false]');
  expect(document.querySelector('[role="status"]')?.textContent).toContain('telah direset');
  await act(async () => root.render(null));
  await mount();
  expect(resetButton()).toBeUndefined();
});

it('resets a fully completed checklist and keeps progress when saving fails', async () => {
  localStorage.setItem('prosedur-checklist-hardcopy', JSON.stringify(new Array(30).fill(true)));
  await mount();
  expect(document.body.textContent).toContain('100%');
  const storage = localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: storage.getItem.bind(storage), setItem: () => { throw new Error('Storage blocked'); } },
  });
  await act(async () => resetButton()!.click());
  expect(document.querySelector('[role="alert"]')?.textContent).toContain('belum direset');
  expect(document.body.textContent).toContain('100%');
  expect(resetButton()).toBeDefined();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  await act(async () => resetButton()!.click());
  expect(resetButton()).toBeUndefined();
  expect(document.querySelectorAll('button[title="Tandai belum selesai"]').length).toBe(0);
});
