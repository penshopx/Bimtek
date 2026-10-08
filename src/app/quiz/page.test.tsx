import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { Window } from 'happy-dom';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { QuizQuestion } from '@/app/actions/quiz';

const questions: QuizQuestion[] = [
  { id: 1, question: 'Soal pertama', category: 'Uji', options: ['Satu', 'Dua', 'Tiga'], correct: 2, sortOrder: 0, createdAt: '', updatedAt: '' },
  { id: 2, question: 'Soal kedua', category: 'Uji', options: ['Empat', 'Lima', 'Enam'], correct: 1, sortOrder: 1, createdAt: '', updatedAt: '' },
  { id: 3, question: 'Soal ketiga', category: 'Uji', options: ['Tujuh', 'Delapan', 'Sembilan'], correct: 0, sortOrder: 2, createdAt: '', updatedAt: '' },
];
mock.module('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
mock.module('@/components/AuthProvider', () => ({ useAuth: () => ({ user: null }) }));
mock.module('@/app/actions/quiz', () => ({
  getQuizQuestions: async () => questions,
  getQuizCategories: async () => ['Semua', 'Uji'],
  recordQuizAttempt: async () => {},
}));
const { default: QuizPage } = await import('./page');

let browser: Window;
let root: Root;
let container: HTMLElement;
const keys = ['window', 'document', 'navigator', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT'] as const;
let descriptors: (PropertyDescriptor | undefined)[];

beforeEach(async () => {
  browser = new Window({ url: 'http://quiz.test/quiz' });
  descriptors = keys.map(key => Object.getOwnPropertyDescriptor(globalThis, key));
  const values = [browser, browser.document, browser.navigator, browser.localStorage, true];
  keys.forEach((key, index) => Object.defineProperty(globalThis, key, {
    configurable: true, writable: true, value: values[index],
  }));
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => { root.render(<QuizPage />); });
});

afterEach(async () => {
  await act(async () => root.unmount());
  browser.close();
  keys.forEach((key, index) => {
    if (descriptors[index]) Object.defineProperty(globalThis, key, descriptors[index]!);
    else Reflect.deleteProperty(globalThis, key);
  });
});

async function click(text: string) {
  const button = [...container.querySelectorAll('button')].find(button => button.textContent?.includes(text));
  expect(button).toBeDefined();
  await act(async () => button!.click());
}

async function finish(answers: string[]) {
  for (const [index, answer] of answers.entries()) {
    await click(answer);
    await click(index < answers.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil');
  }
}

describe('Tinjauan jawaban salah', () => {
  it('lists only incorrect questions, preserving each selected option and correct answer', async () => {
    await finish(['Satu', 'Lima', 'Sembilan']);
    expect(container.textContent).toContain('Skor Anda: 1 dari 3');
    const details = container.querySelector('details')!;
    expect(details).not.toBeNull();
    expect(details.open).toBe(false);
    expect(details.querySelector('summary')?.textContent).toContain('(2)');
    const articles = [...details.querySelectorAll('article')];
    expect(articles.length).toBe(2);
    expect(articles[0].textContent).toContain('Soal 1');
    expect(articles[0].textContent).toContain('Soal pertama');
    expect(articles[0].querySelector('.text-red-800')?.textContent).toContain('Satu');
    expect(articles[0].querySelector('.text-green-800')?.textContent).toContain('Tiga');
    expect(articles[1].textContent).toContain('Soal 3');
    expect(articles[1].querySelector('.text-red-800')?.textContent).toContain('Sembilan');
    expect(articles[1].querySelector('.text-green-800')?.textContent).toContain('Tujuh');
    expect(details.textContent).not.toContain('Soal kedua');
    await act(async () => details.querySelector('summary')!.click());
    expect(details.open).toBe(true);
    await act(async () => details.querySelector('summary')!.click());
    expect(details.open).toBe(false);
  });

  it('uses the new choices on retry and starts each review collapsed', async () => {
    await finish(['Satu', 'Empat', 'Tujuh']);
    await act(async () => container.querySelector('summary')!.click());
    await click('Ulangi Soal yang Salah');
    expect(container.querySelector('details')).toBeNull();
    await finish(['Dua', 'Lima']);
    const details = container.querySelector('details')!;
    expect(details.open).toBe(false);
    expect(details.querySelectorAll('article').length).toBe(1);
    expect(details.querySelector('.text-red-800')?.textContent).toContain('Dua');
    expect(details.querySelector('.text-red-800')?.textContent).not.toContain('Satu');
    await click('Coba Lagi');
    await finish(['Tiga', 'Lima', 'Tujuh']);
    expect(container.textContent).toContain('Skor Anda: 3 dari 3');
    expect(container.querySelector('details')).toBeNull();
    expect(container.textContent).not.toContain('Ulangi Soal yang Salah');
  });
});
