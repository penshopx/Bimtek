import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { Window } from 'happy-dom';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import KlinikPage from './page';
import { createKlinikHandler } from '@/lib/klinik-service';

const globals = ['window', 'document', 'navigator', 'IS_REACT_ACT_ENVIRONMENT', 'fetch'] as const;
const originals = new Map(globals.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
let browser: Window;
let root: Root;
let container: HTMLDivElement;
let requests: Record<string, unknown>[];
let failExam: boolean;
let wrongTarget: boolean;

beforeEach(async () => {
  browser = new Window({ url: 'http://klinik.test' });
  Object.defineProperty(browser.document, 'oninput', { configurable: true, value: null });
  browser.HTMLElement.prototype.scrollIntoView = () => {};
  const values = { window: browser, document: browser.document, navigator: browser.navigator, IS_REACT_ACT_ENVIRONMENT: true };
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  requests = []; failExam = false; wrongTarget = false;
  const handler = createKlinikHandler(async input => {
    if (!input.json) return 'Latihan sesuai target Anda.';
    if (input.maxTokens === 2500) {
      if (failExam) throw new Error('AI_UNAVAILABLE');
      return JSON.stringify({ questions: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1, type: i < 3 ? 'knowledge' : 'scenario', question: `Latihan ${i + 1}`,
        options: { A: 'Pilihan A', B: 'Pilihan B', C: 'Pilihan C', D: 'Pilihan D' }, correct: 'A', explanation: 'Penjelasan.',
      })) });
    }
    return JSON.stringify({
      skorKesiapan: 72, label: 'Cukup Siap', ringkasan: 'Estimasi belajar.',
      kekuatan: [], gap: [], unitKompetensiPrioritas: [], rencanaBelajar: [], rekomendasiDokumen: [], pesanMotivasi: '',
    });
  });
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true, writable: true,
    value: async (_url: unknown, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      requests.push(body);
      const response = await handler(new Request('http://klinik.test/api/klinik', { method: 'POST', body: String(init.body) }));
      if (wrongTarget && response.ok) {
        const data = await response.json();
        return Response.json({ ...data, target: { ...data.target, jenjang: 5 } });
      }
      return response;
    },
  });
  container = document.createElement('div');
  document.body.append(container);
  const { createRoot } = await import('react-dom/client');
  root = createRoot(container);
  await act(async () => { root.render(<KlinikPage />); });
});

afterEach(async () => {
  await act(async () => { root.unmount(); });
  await browser.happyDOM.close();
  for (const key of globals) {
    const original = originals.get(key);
    if (original) Object.defineProperty(globalThis, key, original);
    else Reflect.deleteProperty(globalThis, key);
  }
});

function button(text: string) {
  const found = [...container.querySelectorAll('button')].find(item => item.textContent?.includes(text));
  if (!found) throw new Error(`Button missing: ${text}`);
  return found;
}
async function click(text: string) {
  await act(async () => { button(text).click(); });
}
async function type(input: HTMLInputElement, text: string) {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(browser.HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, text);
    input.dispatchEvent(new browser.Event('input', { bubbles: true }));
  });
}
async function fill(rank = 'Muda', level = 7) {
  await type(container.querySelector('#klinik-jabatan')!, `Ahli ${rank} Teknik Bangunan Gedung`);
  await click(`Jenjang ${level}`);
  await click('S1 (Sarjana)');
  await click('3–5 tahun');
}

describe('Klinik UI to API numeric target', () => {
  for (const [rank, level] of [['Muda', 7], ['Madya', 8], ['Utama', 9]] as const) {
    it(`preserves ${rank}/${level} through blueprint, chat, exam and result`, async () => {
      await fill(rank, level);
      expect(button('Susun Blueprint').disabled).toBe(false);
      await click('Susun Blueprint');
      expect(container.textContent).toContain(`Ahli ${rank} — Jenjang ${level}`);
      await click('Lanjut ke Chatbot');
      await type(container.querySelector('input[placeholder^="Tanyakan sesuatu"]')!, 'Bantu saya berlatih');
      await click('↑');
      expect(container.textContent).toContain('Latihan sesuai target Anda.');
      await click('Siap ke Ruang Ujian');
      expect(requests.map(item => item.action)).toEqual(['blueprint', 'chat', 'ujian']);
      expect(requests.every(item => typeof item.jenjang === 'number' && item.jenjang === level)).toBe(true);
      expect(requests.every(item => item.jabatan === `Ahli ${rank} Teknik Bangunan Gedung`)).toBe(true);
      for (let i = 0; i < 5; i++) {
        await click('Pilihan A');
        await click(i === 4 ? 'Lihat Keputusan' : 'Soal Berikutnya');
      }
      expect(container.textContent).toContain('Skor Gabungan');
      expect(container.textContent).toContain(`Ahli ${rank} — Jenjang ${level}`);
      expect(container.textContent).toContain('bukan keputusan sertifikasi resmi');
    });
  }
  it('blocks an incompatible rank/level before submitting', async () => {
    await fill('Muda', 5);
    expect(button('Susun Blueprint').disabled).toBe(true);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Jenjang tidak sesuai');
    expect(requests).toHaveLength(0);
  });
  it('keeps the form usable instead of displaying a wrong-target response', async () => {
    await fill();
    wrongTarget = true;
    await click('Susun Blueprint');
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Target hasil AI tidak sesuai');
    expect(container.querySelector('#klinik-jabatan')).not.toBeNull();
  });
  it('shows an exam outage and preserves the blueprint target for retry', async () => {
    await fill();
    await click('Susun Blueprint');
    await click('Lanjut ke Chatbot');
    failExam = true;
    await click('Siap ke Ruang Ujian');
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('AI tidak tersedia');
    expect(container.textContent).toContain('Chatbot Teman Belajar');
    expect(container.textContent).toContain('Ahli Muda — Jenjang 7');
    failExam = false;
    await click('Siap ke Ruang Ujian');
    expect(container.textContent).toContain('Soal 1/5');
  });
});
