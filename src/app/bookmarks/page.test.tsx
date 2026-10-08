import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { Window } from 'happy-dom';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BookmarkProvider, type BookmarkItem } from '@/components/BookmarkProvider';
import BookmarksPage from './page';
import ProsedurPage from '../prosedur/page';

let browser: Window;
let root: Root;
const keys = ['window', 'document', 'navigator', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT'] as const;
const originals = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));

beforeEach(() => {
  browser = new Window({ url: 'http://bookmarks.test/bookmarks' });
  const globals = {
    window: browser, document: browser.document, navigator: browser.navigator,
    localStorage: browser.localStorage, IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const key of keys) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value: globals[key] });
  }
  const container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  await browser.happyDOM.close();
  for (const key of keys) {
    const descriptor = originals.get(key);
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

const saved: BookmarkItem[] = [
  ...(['hardcopy', 'paperless', 'ajj'] as const).map(method => ({
    id: `prosedur-${method}-2`,
    type: 'prosedur' as const,
    title: `Langkah 3: Asesmen (${method})`,
    url: `/prosedur?method=${method}&step=2`,
    addedAt: '2026-10-08T00:00:00Z',
  })),
  { id: 'module-1', type: 'module', title: 'Modul Konstruksi', url: '/bimtek', addedAt: '2026-10-08T00:00:00Z' },
];

describe('main prosedur bookmarks', () => {
  it('shows titles, method badges, one-based step numbers and exact destination links', async () => {
    localStorage.setItem('bookmarks', JSON.stringify(saved));
    await act(async () => root.render(<BookmarkProvider><BookmarksPage /></BookmarkProvider>));
    for (const [index, label] of ['Hardcopy', 'Paperless', 'AJJ'].entries()) {
      const link = document.querySelector(`a[href="${saved[index].url}"]`);
      expect(link?.querySelector('h3')?.textContent).toBe(saved[index].title);
      expect(link?.querySelector('.rounded-full')?.textContent).toBe(label);
      expect(link?.textContent).toContain('Langkah 3');
      expect(link?.textContent).toContain('Buka langkah prosedur');
    }
    expect(document.body.textContent).toContain('Modul Konstruksi');

    const filter = Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Prosedur')!;
    await act(async () => filter.click());
    expect(document.querySelectorAll('h3').length).toBe(3);
    expect(document.body.textContent).not.toContain('Modul Konstruksi');

    const remove = document.querySelector(`button[aria-label="Hapus bookmark ${saved[0].title}"]`) as HTMLButtonElement;
    await act(async () => remove.click());
    expect(document.querySelector(`a[href="${saved[0].url}"]`)).toBeNull();
    expect(document.querySelectorAll('h3').length).toBe(2);
  });

  for (const method of ['hardcopy', 'paperless', 'ajj']) {
    it(`opens and scrolls to the linked ${method} step after rendering the correct tab`, async () => {
      browser.location.href = `http://bookmarks.test/prosedur?method=${method}&step=2`;
      const scrolled: string[] = [];
      browser.HTMLElement.prototype.scrollIntoView = function () { scrolled.push(this.id); };
      await act(async () => root.render(<BookmarkProvider><ProsedurPage /></BookmarkProvider>));
      expect(document.getElementById(`prosedur-${method}-2`)).not.toBeNull();
      expect(scrolled).toEqual([`prosedur-${method}-2`]);
    });
  }

  it('ignores an out-of-range linked step', async () => {
    browser.location.href = 'http://bookmarks.test/prosedur?method=ajj&step=999';
    const scrolled: string[] = [];
    browser.HTMLElement.prototype.scrollIntoView = function () { scrolled.push(this.id); };
    await act(async () => root.render(<BookmarkProvider><ProsedurPage /></BookmarkProvider>));
    expect(document.getElementById('prosedur-ajj-0')).not.toBeNull();
    expect(scrolled).toEqual([]);
  });
});
