// Run separately from other suites: Bun module mocks are process-global.
import { afterAll, afterEach, beforeEach, expect, mock, test } from 'bun:test';
import { Window } from 'happy-dom';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { QuizAttemptStat, QuizQuestion } from '@/app/actions/quiz';

const question: QuizQuestion = {
  id: 1, question: 'Soal dengan pilihan yang diperbarui', category: 'K3',
  options: ['Salah', 'Benar', 'Pilihan tambahan'], correct: 1,
  sortOrder: 0, createdAt: '', updatedAt: '',
};
let stats: QuizAttemptStat[];
const adminUser = { id: 'admin-test', role: 'admin' };
const getStats = mock(async (sessionId: string | null) => {
  expect(sessionId).toBe('admin-stats-test-session');
  return stats;
});
const clearStale = mock(async (_questionId: number, _sessionId: string | null): Promise<{ success: boolean; message?: string }> => ({ success: true }));
const resetAttempts = mock(async (_questionId: number, _sessionId: string | null): Promise<{ success: boolean; message?: string }> => ({ success: true }));
const updateQuestion = mock(async (): Promise<{ success: boolean; message?: string }> => ({ success: true }));
const confirmCleanup = mock(() => true);
mock.module('@/components/AuthProvider', () => ({
  useAuth: () => ({ user: adminUser }),
}));
mock.module('@/app/actions/quiz', () => ({
  getQuizQuestions: async () => [question],
  getQuizCategories: async () => ['K3'],
  getQuizAttemptStats: getStats,
  createQuizQuestion: async () => ({ success: true }),
  updateQuizQuestion: updateQuestion,
  deleteQuizQuestion: async () => ({ success: true }),
  reorderQuizQuestions: async () => ({ success: true }),
  resetQuizAttempts: resetAttempts,
  resetStaleAttempts: clearStale,
}));
const { default: AdminQuizPage } = await import('./page');

let browser: Window;
let root: Root;
let container: HTMLElement;
const keys = ['window', 'document', 'navigator', 'localStorage', 'IS_REACT_ACT_ENVIRONMENT', 'confirm'] as const;
let originals: (PropertyDescriptor | undefined)[];
const warning = 'Soal diubah setelah percobaan tercatat. Rincian per-opsi disembunyikan agar tidak menyesatkan.';

beforeEach(() => {
  browser = new Window({ url: 'http://admin.test/admin/quiz' });
  originals = keys.map(key => Object.getOwnPropertyDescriptor(globalThis, key));
  const values = [browser, browser.document, browser.navigator, browser.localStorage, true, confirmCleanup];
  keys.forEach((key, index) => Object.defineProperty(globalThis, key, {
    configurable: true, writable: true, value: values[index],
  }));
  localStorage.setItem('sessionId', 'admin-stats-test-session');
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  getStats.mockClear();
  clearStale.mockReset();
  clearStale.mockImplementation(async () => ({ success: true }));
  resetAttempts.mockReset();
  resetAttempts.mockImplementation(async () => ({ success: true }));
  updateQuestion.mockReset();
  updateQuestion.mockImplementation(async () => ({ success: true }));
  confirmCleanup.mockReset();
  confirmCleanup.mockImplementation(() => true);
});

afterEach(async () => {
  await act(async () => root.unmount());
  await browser.happyDOM.close();
  keys.forEach((key, index) => {
    if (originals[index]) Object.defineProperty(globalThis, key, originals[index]!);
    else Reflect.deleteProperty(globalThis, key);
  });
});
afterAll(() => mock.restore());

async function renderStat(stat: QuizAttemptStat) {
  stats = [stat];
  await act(async () => { root.render(<AdminQuizPage />); });
  expect(getStats).toHaveBeenCalledTimes(1);
  expect(container.textContent).toContain(question.question);
  const reset = [...container.querySelectorAll('button')]
    .find(button => button.textContent === 'Reset stats');
  expect(reset).toBeDefined();
  return reset!.closest('td')!;
}

// These are the per-option tracks, distinct from the overall success-rate bar.
const optionTracks = '.flex-1.rounded-full.h-1\\.5.overflow-hidden';

test.each([
  { label: 'only invalidated attempts', totalAttempts: 3, correctAttempts: 1, optionCounts: [0, 0, 0] },
  { label: 'invalidated and new attempts', totalAttempts: 6, correctAttempts: 2, optionCounts: [0, 1, 2] },
])('admin shows amber warning and no option bars with $label', async (fixture) => {
  const cell = await renderStat({
    questionId: question.id, totalAttempts: fixture.totalAttempts,
    correctAttempts: fixture.correctAttempts, successRate: 33,
    optionCounts: fixture.optionCounts, hasStaleAttempts: true,
  });
  const bannerText = [...cell.querySelectorAll('p')].find(p => p.textContent === warning);
  expect(bannerText).toBeDefined();
  expect(bannerText!.parentElement!.classList.contains('bg-amber-50')).toBe(true);
  expect(bannerText!.parentElement!.classList.contains('border-amber-200')).toBe(true);
  expect(cell.querySelectorAll(optionTracks)).toHaveLength(0);
  expect(cell.textContent).toContain(`${fixture.totalAttempts} percobaan`);
  expect(cell.textContent).toContain('33%');
});

test('admin still shows per-option bars when no attempts are stale', async () => {
  const cell = await renderStat({
    questionId: question.id, totalAttempts: 4, correctAttempts: 1,
    successRate: 25, optionCounts: [1, 1, 2], hasStaleAttempts: false,
  });
  expect(cell.textContent).not.toContain(warning);
  expect(cell.textContent).not.toContain('Clear stale data');
  const tracks = [...cell.querySelectorAll<HTMLElement>(optionTracks)];
  expect(tracks).toHaveLength(3);
  expect(tracks.map(track => (track.firstElementChild as HTMLElement).style.width))
    .toEqual(['25%', '25%', '50%']);
  expect(tracks.map(track => track.parentElement!.firstElementChild!.textContent))
    .toEqual(['A.', 'B.', 'C.']);
});

const staleStat: QuizAttemptStat = {
  questionId: question.id, totalAttempts: 6, correctAttempts: 2,
  successRate: 33, optionCounts: [0, 1, 2], hasStaleAttempts: true,
};

function cleanupButton() {
  return [...container.querySelectorAll('button')].find(button => button.textContent === 'Clear stale data')!;
}

test('stale cleanup refreshes stats and restores only the clean option bars', async () => {
  await renderStat(staleStat);
  stats = [{ ...staleStat, totalAttempts: 3, correctAttempts: 1, hasStaleAttempts: false }];
  await act(async () => cleanupButton().click());
  expect(confirmCleanup).toHaveBeenCalledTimes(1);
  expect(clearStale).toHaveBeenCalledWith(question.id, 'admin-stats-test-session');
  expect(getStats).toHaveBeenCalledTimes(2);
  expect(container.textContent).not.toContain(warning);
  expect(container.textContent).toContain('3 percobaan');
  expect(container.querySelectorAll(optionTracks)).toHaveLength(3);
  expect(container.textContent).toContain('Data usang berhasil dihapus.');
});

test('admin can cancel stale deletion without calling the server', async () => {
  await renderStat(staleStat);
  confirmCleanup.mockImplementation(() => false);
  await act(async () => cleanupButton().click());
  expect(clearStale).not.toHaveBeenCalled();
  expect(getStats).toHaveBeenCalledTimes(1);
  expect(container.textContent).toContain(warning);
});

test.each(['rejected', 'thrown'])('failed stale cleanup keeps the warning and allows retry: %s', async (mode) => {
  await renderStat(staleStat);
  clearStale.mockImplementation(async () => {
    if (mode === 'thrown') throw new Error('network');
    return { success: false, message: 'Penghapusan ditolak.' };
  });
  await act(async () => cleanupButton().click());
  expect(getStats).toHaveBeenCalledTimes(1);
  expect(container.textContent).toContain(warning);
  expect(cleanupButton().disabled).toBe(false);
  expect(container.textContent).toContain(mode === 'thrown'
    ? 'Terjadi kesalahan saat menghapus data usang.' : 'Penghapusan ditolak.');
});

test('cleanup with no remaining attempts shows the empty state', async () => {
  await renderStat(staleStat);
  stats = [];
  await act(async () => cleanupButton().click());
  expect(container.textContent).toContain('Belum ada data');
  expect(container.textContent).not.toContain(warning);
  expect(container.querySelectorAll(optionTracks)).toHaveLength(0);
});

const resetSuccessMessage = 'Riwayat percobaan berhasil dihapus.';

async function clickButton(text: string) {
  const button = [...container.querySelectorAll('button')]
    .find(button => button.textContent?.trim() === text);
  expect(button).toBeDefined();
  await act(async () => button!.click());
}

async function startReset(path: 'table' | 'edit') {
  await renderStat(staleStat);
  if (path === 'table') {
    await clickButton('Reset stats');
    await clickButton('Ya, Reset');
  } else {
    await clickButton('Edit');
    await act(async () => {
      container.querySelector<HTMLInputElement>('#clear-attempts-checkbox')!.click();
    });
    await clickButton('Simpan');
  }
}

test('successful edit closes the form and shows a save success notice without resetting attempts', async () => {
  await renderStat(staleStat);
  await clickButton('Edit');
  await clickButton('Simpan');
  expect(updateQuestion).toHaveBeenCalledWith(question.id, {
    question: question.question, category: question.category,
    options: question.options, correct: question.correct,
  }, 'admin-stats-test-session');
  expect(container.querySelector('[role="status"]')?.textContent).toContain('Soal berhasil diperbarui');
  expect(container.querySelector('#clear-attempts-checkbox')).toBeNull();
  expect(resetAttempts).not.toHaveBeenCalled();
  expect(getStats).toHaveBeenCalledTimes(2);
});

test.each(['rejected', 'thrown'])('failed edit keeps the form and inline error without a success toast: %s', async (mode) => {
  updateQuestion.mockImplementation(async () => {
    if (mode === 'thrown') throw new Error('network');
    return { success: false, message: 'Penyimpanan ditolak.' };
  });
  await renderStat(staleStat);
  await clickButton('Edit');
  await clickButton('Simpan');
  expect(container.querySelector('[role="status"]')).toBeNull();
  expect(container.querySelector('#clear-attempts-checkbox')).not.toBeNull();
  expect(container.textContent).toContain(mode === 'thrown' ? 'Terjadi kesalahan.' : 'Penyimpanan ditolak.');
  expect(getStats).toHaveBeenCalledTimes(1);
});

test.each(['table', 'edit'] as const)('successful %s reset shows a dismissible success notice', async (path) => {
  await startReset(path);
  expect(resetAttempts).toHaveBeenCalledWith(question.id, 'admin-stats-test-session');
  expect(container.querySelector('[role="status"]')?.textContent).toContain(resetSuccessMessage);
  if (path === 'edit') {
    expect(container.querySelector('[role="status"]')?.textContent).toContain('Soal berhasil diperbarui');
  }
  expect(container.textContent).not.toContain('Hapus juga riwayat percobaan');
  expect(getStats).toHaveBeenCalledTimes(2);
  await act(async () => {
    container.querySelector<HTMLButtonElement>('[aria-label="Tutup notifikasi"]')!.click();
  });
  expect(container.querySelector('[role="status"]')).toBeNull();
});

test.each([
  { path: 'table', mode: 'rejected' },
  { path: 'table', mode: 'thrown' },
  { path: 'edit', mode: 'rejected' },
  { path: 'edit', mode: 'thrown' },
] as const)('failed $path reset ($mode) never shows success', async ({ path, mode }) => {
  resetAttempts.mockImplementation(async () => {
    if (mode === 'thrown') throw new Error('network');
    return { success: false, message: 'Reset ditolak.' };
  });
  await startReset(path);
  expect(container.querySelector('[role="status"]')).toBeNull();
  expect(container.textContent).not.toContain(resetSuccessMessage);
  expect(container.textContent).toContain(mode === 'rejected'
    ? 'Reset ditolak.'
    : path === 'table' ? 'Terjadi kesalahan saat mereset statistik.' : 'Terjadi kesalahan.');
});

test('reset success notice disappears automatically after three seconds', async () => {
  await startReset('table');
  expect(container.querySelector('[role="status"]')).not.toBeNull();
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 3100)); });
  expect(container.querySelector('[role="status"]')).toBeNull();
});

test('saving an edit without clearing attempts does not announce a reset', async () => {
  await renderStat(staleStat);
  await clickButton('Edit');
  await clickButton('Simpan');
  expect(resetAttempts).not.toHaveBeenCalled();
  expect(container.querySelector('[role="status"]')?.textContent).toContain('Soal berhasil diperbarui');
  expect(container.querySelector('[role="status"]')?.textContent).not.toContain(resetSuccessMessage);
});
