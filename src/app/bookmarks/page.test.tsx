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
  it('keeps a bookmarked Paperless step 2 through navigation and reload, then restores its tab and scroll target', async () => {
    const id = 'prosedur-paperless-1'; // UI step 2 uses zero-based URL index 1.
    const url = '/prosedur?method=paperless&step=1';
    const title = 'Langkah 2: Verifikasi Digital (Paperless)';
    const scrolls: { id: string; options?: ScrollIntoViewOptions; heading: string | null }[] = [];
    // Happy DOM has no layout engine. Check the real page's viewport-scroll
    // request, including that the correct card is connected when it happens.
    browser.HTMLElement.prototype.scrollIntoView = function (options) {
      expect(this.isConnected).toBe(true);
      expect(this.querySelector('h3')?.textContent).toBe('Verifikasi Digital');
      scrolls.push({
        id: this.id,
        options: options as ScrollIntoViewOptions,
        heading: document.querySelector('h2')?.textContent ?? null,
      });
    };

    async function remount(path: string, page: 'prosedur' | 'bookmarks') {
      // Discard the entire React tree, including provider state and mount refs.
      // Like a same-origin reload, only browser localStorage and the URL survive.
      await act(async () => root.unmount());
      document.body.replaceChildren();
      browser.location.href = new URL(path, 'http://bookmarks.test').href;
      const container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);
      await act(async () => root.render(
        <BookmarkProvider>
          {page === 'prosedur' ? <ProsedurPage /> : <BookmarksPage />}
        </BookmarkProvider>,
      ));
    }

    function expectSavedBookmark() {
      const stored = JSON.parse(localStorage.getItem('bookmarks') ?? '[]') as BookmarkItem[];
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject({ id, type: 'prosedur', title, url });
      expect(Number.isNaN(Date.parse(stored[0].addedAt))).toBe(false);
    }

    function expectRestoredStep() {
      const activeTabs = Array.from(document.querySelectorAll('button'))
        .filter(button => button.classList.contains('bg-amber-500/15'));
      expect(activeTabs).toHaveLength(1);
      expect(activeTabs[0].textContent).toContain('Paperless');
      expect(document.querySelector('h2')?.textContent).toBe('Alur Asesmen — Paperless');
      const card = document.getElementById(id);
      expect(card?.querySelector('h3')?.textContent).toBe('Verifikasi Digital');
      expect(card?.textContent).toContain('2/5');
      expect(card?.querySelector('button[title="Hapus bookmark langkah ini"]')).not.toBeNull();
      expect(document.getElementById('prosedur-hardcopy-1')).toBeNull();
      expect(document.getElementById('prosedur-ajj-1')).toBeNull();
      expect(scrolls).toEqual([{
        id,
        options: { behavior: 'smooth', block: 'center' },
        heading: 'Alur Asesmen — Paperless',
      }]);
      expectSavedBookmark();
    }

    await remount('/prosedur', 'prosedur');
    const paperlessTab = Array.from(document.querySelectorAll('button'))
      .find(button => button.textContent?.includes('Paperless'))!;
    await act(async () => paperlessTab.click());
    const save = document.getElementById(id)!
      .querySelector('button[title="Bookmark langkah ini"]') as HTMLButtonElement;
    expect(save).not.toBeNull();
    await act(async () => save.click());
    expectSavedBookmark();
    expect(scrolls).toEqual([]);

    // Navigate away and reload the bookmark list with a fresh provider.
    await remount('/bookmarks', 'bookmarks');
    await remount('/bookmarks', 'bookmarks');
    expectSavedBookmark();
    const link = document.querySelector(`a[href="${url}"]`) as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.querySelector('h3')?.textContent).toBe(title);
    let destination: string | undefined;
    // Supply only the browser/router navigation boundary: derive the destination
    // from an actual click on the real bookmark link, not a seeded fixture URL.
    link.addEventListener('click', event => {
      event.preventDefault();
      destination = link.href;
    });
    await act(async () => link.click());
    expect(destination).toBe(`http://bookmarks.test${url}`);
    await remount(destination!, 'prosedur');
    expectRestoredStep();

    scrolls.length = 0;
    await remount(browser.location.href, 'prosedur');
    expect(browser.location.search).toBe('?method=paperless&step=1');
    expectRestoredStep();
  });

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
