import { afterEach, beforeEach, expect, it } from 'bun:test';
import { Window } from 'happy-dom';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { EMPTY_PROFILE, PROFESSIONAL_PROFILE_KEY, profileCompleteness, profileToolHref } from '@/lib/professional-profile';

let auth = { user: null as null | { jabatanSkk: string }, isLoading: false };
let browser = new Window({ url: 'http://profile.test/profil-skk' });
let root: Root;
const keys = ['window', 'document', 'navigator', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT'] as const;
const originals = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
// React DOM detects input-event support when loaded; provide a DOM first.
Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
Object.defineProperty(globalThis, 'document', { configurable: true, value: browser.document });
const { createRoot } = await import('react-dom/client');
const { ProfessionalProfileForm } = await import('./ProfessionalProfile');
function ProfessionalProfile() {
  return <ProfessionalProfileForm user={auth.user} authLoading={auth.isLoading} />;
}
const { default: ProfileToolContext } = await import('./ProfileToolContext');
const { default: RencanaBelajarPage } = await import('@/app/rencana-belajar/page');
const { default: SIAPIndexPage } = await import('@/app/siap-index/page');

beforeEach(() => {
  auth = { user: null, isLoading: false };
  browser = new Window({ url: 'http://profile.test/profil-skk' });
  const globals = { window: browser, document: browser.document, navigator: browser.navigator,
    localStorage: browser.localStorage, IS_REACT_ACT_ENVIRONMENT: true };
  for (const key of keys) Object.defineProperty(globalThis, key, { configurable: true, value: globals[key] });
  root = createRoot(document.body.appendChild(document.createElement('div')));
});

afterEach(async () => {
  await act(async () => root.unmount());
  await browser.happyDOM.close();
  for (const key of keys) {
    const original = originals.get(key);
    if (original) Object.defineProperty(globalThis, key, original);
    else Reflect.deleteProperty(globalThis, key);
  }
});

async function render() {
  await act(async () => root.render(<ProfessionalProfile />));
}
function input(key: string) {
  return document.querySelector(`[data-testid="input-${key}"]`) as HTMLInputElement;
}
async function change(key: string, value: string) {
  await act(async () => {
    const element = input(key);
    const setter = Object.getOwnPropertyDescriptor(browser.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(element, value);
    element.dispatchEvent(new browser.Event('input', { bubbles: true }) as unknown as Event);
  });
}
async function save() {
  await act(async () => (document.querySelector('[data-testid="button-save-profile"]') as HTMLButtonElement).click());
}

it('keeps edits stable, saves every field and restores on a new mount', async () => {
  await render();
  await change('nama', 'Profil Contoh');
  await change('pengalaman', '0');
  expect(input('nama').value).toBe('Profil Contoh');
  expect(input('pengalaman').value).toBe('0');
  await save();
  const saved = JSON.parse(localStorage.getItem(PROFESSIONAL_PROFILE_KEY)!);
  expect(saved).toEqual({ ...EMPTY_PROFILE, nama: 'Profil Contoh', pengalaman: '0' });
  await act(async () => root.unmount());
  root = createRoot(document.body.appendChild(document.createElement('div')));
  await render();
  expect(input('nama').value).toBe('Profil Contoh');
  expect(document.querySelector('[data-testid="text-profile-completeness"]')!.textContent).toBe('18%');
});

it('waits for the account then imports the saved jabatan without claiming an active SKK', async () => {
  auth.isLoading = true;
  await render();
  expect(input('nama').disabled).toBe(true);
  auth = { user: { jabatanSkk: 'MP005' }, isLoading: false };
  await render();
  expect(input('jabatan').value).toBe('Project Manager Konstruksi');
  expect(input('targetJabatan').value).toBe('Project Manager Konstruksi');
  expect(input('skkJabatan').value).toBe('');
  await change('targetJabatan', 'Target pribadi');
  expect(input('targetJabatan').value).toBe('Target pribadi');
});

it('preserves intentionally blank saved values over account defaults', async () => {
  localStorage.setItem(PROFESSIONAL_PROFILE_KEY, JSON.stringify({ ...EMPTY_PROFILE, nama: 'Tersimpan' }));
  auth.user = { jabatanSkk: 'MP005' };
  await render();
  expect(input('nama').value).toBe('Tersimpan');
  expect(input('jabatan').value).toBe('');
  expect(input('targetJabatan').value).toBe('');
});

it('offers save retry without losing edits when storage rejects writes', async () => {
  await render();
  await change('nama', 'Tidak hilang');
  const store = browser.localStorage;
  const descriptor = Object.getOwnPropertyDescriptor(browser, 'localStorage')!;
  Object.defineProperty(browser, 'localStorage', { configurable: true, value: {
    getItem: store.getItem.bind(store),
    setItem: () => { throw new Error('blocked'); },
  } });
  await save();
  expect(document.body.textContent).toContain('Penyimpanan di perangkat ini gagal');
  expect(input('nama').value).toBe('Tidak hilang');
  Object.defineProperty(browser, 'localStorage', descriptor);
  await save();
  expect(JSON.parse(localStorage.getItem(PROFESSIONAL_PROFILE_KEY)!).nama).toBe('Tidak hilang');
});

it('does not overwrite corrupt stored data and can retry reading it', async () => {
  localStorage.setItem(PROFESSIONAL_PROFILE_KEY, '{invalid');
  await render();
  expect(input('nama').disabled).toBe(true);
  await save();
  expect(localStorage.getItem(PROFESSIONAL_PROFILE_KEY)).toBe('{invalid');
  localStorage.setItem(PROFESSIONAL_PROFILE_KEY, JSON.stringify({ ...EMPTY_PROFILE, nama: 'Diperbaiki' }));
  await act(async () => (document.querySelector('[data-testid="button-retry-read"]') as HTMLButtonElement).click());
  expect(input('nama').value).toBe('Diperbaiki');
});

it('includes only target parameters, never personal or certificate details in tool URLs', async () => {
  const profile = { ...EMPTY_PROFILE, nama: 'A & B', pendidikan: 'S1 pribadi', pengalaman: '12', skkJabatan: 'SKK pribadi',
    lsp: 'LSP pribadi', terbit: '2022-01-20', berakhir: '2029-01-20',
    targetJabatan: 'Ahli K3 Konstruksi', jenjang: '7', timeline: '2027-01-20' };
  localStorage.setItem(PROFESSIONAL_PROFILE_KEY, JSON.stringify(profile));
  await render();
  for (let i = 1; i <= 3; i++) {
    const url = new URL((document.querySelector(`[data-testid="link-quick-${i}"]`) as HTMLAnchorElement).href);
    expect(Array.from(url.searchParams.keys()).sort()).toEqual(i === 1 ? ['agent', 'jabatan', 'jenjang', 'profil', 'timeline'] : ['jabatan', 'jenjang', 'profil', 'timeline']);
    expect(url.searchParams.get('jabatan')).toBe('Ahli K3 Konstruksi');
    expect(url.searchParams.get('timeline')).toBe('2027-01-20');
  }
  expect(new URL(profileToolHref('/skk-coach/chat', profile), 'http://profile.test').searchParams.get('agent')).toBe('kelayakan');
  expect(profileCompleteness({ ...EMPTY_PROFILE, pengalaman: '0' })).toBe(9);
  for (const path of ['/skk-coach/chat', '/dokumen', '/siap-index', '/rencana-belajar']) {
    const href = decodeURIComponent(profileToolHref(path, profile));
    for (const field of ['nama', 'pendidikan', 'pengalaman', 'skkJabatan', 'lsp', 'terbit', 'berakhir'] as const) {
      expect(href).not.toContain(profile[field]);
    }
  }
});

it('reads profile context locally and shares it only after an explicit button click', async () => {
  localStorage.setItem(PROFESSIONAL_PROFILE_KEY, JSON.stringify({ ...EMPTY_PROFILE, nama: 'Pribadi', pendidikan: 'S1' }));
  browser.location.href = 'http://profile.test/skk-coach/chat?profil=1';
  let chosen = '';
  await act(async () => root.render(<ProfileToolContext onUseContext={value => { chosen = value; }} />));
  expect(document.body.textContent).toContain('Nama: Pribadi');
  expect(chosen).toBe('');
  await act(async () => (document.querySelector('button') as HTMLButtonElement).click());
  expect(chosen).toContain('Nama: Pribadi');
});

it('never uses the current role as a URL fallback when the target is blank', () => {
  for (const targetJabatan of ['', '   ']) {
    const profile = { ...EMPTY_PROFILE, jabatan: 'Jabatan pribadi unik milik pengguna', targetJabatan };
    for (const path of ['/skk-coach/chat', '/dokumen', '/siap-index', '/rencana-belajar']) {
      const url = new URL(profileToolHref(path, profile), 'http://profile.test');
      expect(url.searchParams.has('jabatan')).toBe(false);
      expect(decodeURIComponent(url.href)).not.toContain(profile.jabatan);
    }
  }
});

it('prefills the learning target and date without overwriting a saved plan on arrival', async () => {
  const previous = { jabatanId: 'ahli-jalan', ujianDate: '2026-12-20', generated: true, checked: { old: true } };
  localStorage.setItem('siapskk_rencana_belajar', JSON.stringify(previous));
  browser.location.href = 'http://profile.test/rencana-belajar?jabatan=Project%20Manager%20Konstruksi&timeline=2027-02-10&context=Profil%20contoh';
  await act(async () => root.render(<RencanaBelajarPage />));
  expect((document.querySelector('select') as HTMLSelectElement).value).toBe('manager-proyek');
  expect((document.querySelector('input[type="date"]') as HTMLInputElement).value).toBe('2027-02-10');
  expect(document.body.textContent).toContain('Profil contoh');
  expect(JSON.parse(localStorage.getItem('siapskk_rencana_belajar')!)).toEqual(previous);
});

it('does not substitute another study target when a profile jabatan is unsupported', async () => {
  browser.location.href = 'http://profile.test/rencana-belajar?jabatan=Target%20lain';
  await act(async () => root.render(<RencanaBelajarPage />));
  expect((document.querySelector('select') as HTMLSelectElement).value).toBe('');
  expect(document.body.textContent).toContain('belum tersedia');
});

it('prefills the SIAP Index level group while leaving readiness answers empty', async () => {
  browser.location.href = 'http://profile.test/siap-index?jenjang=7&context=Profil%20contoh';
  await act(async () => root.render(<SIAPIndexPage />));
  const expert = Array.from(document.querySelectorAll('button')).find(button => button.textContent?.includes('Expert (Level 7–9)'));
  expect(expert?.className).toContain('bg-indigo-500/20');
  expect(document.body.textContent).toContain('Profil contoh');
  expect(document.body.textContent).not.toContain('HIGH READINESS');
});
