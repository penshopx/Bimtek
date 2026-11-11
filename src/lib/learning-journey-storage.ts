import { bimtekModules } from './bimtekCatalog';
import { emptyJourneyProgress, JOURNEY_LESSONS, type JourneyProgress } from './learning-journey';

export const JOURNEY_PROGRESS_EVENT = 'siap-learning-journey-updated';
export const journeyStorageKey = (userId: string) => `siap-learning-journey:v1:${encodeURIComponent(userId)}`;
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
type ReadResult = { progress: JourneyProgress; warning: string | null };
const moduleIds = new Set(bimtekModules.map(module => module.id));
const validDate = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function parseJourneyProgress(value: unknown): JourneyProgress {
  if (!object(value) || value.version !== 1 || !object(value.modules) || !object(value.quizzes)) {
    throw new Error('Invalid progress');
  }
  const progress = emptyJourneyProgress();
  for (const [id, item] of Object.entries(value.modules)) {
    if (!moduleIds.has(id) || !object(item) || typeof item.completed !== 'boolean' ||
      !validDate(item.updatedAt) || !Array.isArray(item.lessons) ||
      !item.lessons.every(lesson => JOURNEY_LESSONS.includes(lesson))) {
      throw new Error('Invalid module progress');
    }
    progress.modules[id] = {
      completed: item.completed, updatedAt: item.updatedAt, lessons: [...new Set(item.lessons)],
    };
  }
  for (const [category, item] of Object.entries(value.quizzes)) {
    if (!category.trim() || category.length > 200 || ['__proto__', 'constructor', 'prototype'].includes(category) ||
      !object(item) || !validDate(item.completedAt) ||
      !Number.isSafeInteger(item.total) || !Number.isSafeInteger(item.score) ||
      (item.total as number) <= 0 || (item.score as number) < 0 || (item.score as number) > (item.total as number)) {
      throw new Error('Invalid quiz progress');
    }
    progress.quizzes[category] = {
      completedAt: item.completedAt, total: item.total as number, score: item.score as number,
    };
  }
  return progress;
}

function parseProgress(raw: string | null): JourneyProgress {
  return raw ? parseJourneyProgress(JSON.parse(raw)) : emptyJourneyProgress();
}

export function readJourneyProgress(userId: string, storage?: StoragePort): ReadResult {
  try {
    const port = storage ?? window.localStorage;
    return { progress: parseProgress(port.getItem(journeyStorageKey(userId))), warning: null };
  } catch {
    return {
      progress: emptyJourneyProgress(),
      warning: 'Progres alur belajar tidak dapat dibaca. Penyimpanan mungkin diblokir atau datanya rusak; data lama tidak ditimpa.',
    };
  }
}

export function writeJourneyProgress(
  userId: string,
  progress: JourneyProgress,
  storage?: StoragePort,
): { ok: boolean; error: string | null } {
  if (!userId) return { ok: false, error: 'Masuk terlebih dahulu untuk menyimpan progres.' };
  try {
    const validated = parseJourneyProgress(progress);
    (storage ?? window.localStorage).setItem(journeyStorageKey(userId), JSON.stringify(validated));
    if (!storage && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(JOURNEY_PROGRESS_EVENT, { detail: userId }));
    }
    return { ok: true, error: null };
  } catch {
    return {
      ok: false,
      error: 'Progres akun sudah tersinkron, tetapi salinan browser belum diperbarui. Muat ulang untuk mengambilnya kembali.',
    };
  }
}

export function hasJourneyActivity(progress: JourneyProgress): boolean {
  return Object.keys(progress.modules).length > 0 || Object.keys(progress.quizzes).length > 0;
}

/** Merge account and browser copies by the most recent step/category update. */
export function mergeJourneyProgress(
  first: JourneyProgress,
  second: JourneyProgress,
): JourneyProgress {
  const merged = emptyJourneyProgress();
  for (const id of new Set([...Object.keys(first.modules), ...Object.keys(second.modules)])) {
    const left = first.modules[id];
    const right = second.modules[id];
    const selected = !left ? right : !right ? left
      : Date.parse(left.updatedAt) > Date.parse(right.updatedAt) ? left : right;
    if (selected) merged.modules[id] = { ...selected, lessons: [...selected.lessons] };
  }
  for (const category of new Set([...Object.keys(first.quizzes), ...Object.keys(second.quizzes)])) {
    const left = first.quizzes[category];
    const right = second.quizzes[category];
    const selected = !left ? right : !right ? left
      : Date.parse(left.completedAt) > Date.parse(right.completedAt) ? left : right;
    if (selected) merged.quizzes[category] = { ...selected };
  }
  return merged;
}

export function journeyProgressEqual(first: JourneyProgress, second: JourneyProgress): boolean {
  const canonical = (progress: JourneyProgress) => JSON.stringify({
    version: 1,
    modules: Object.fromEntries(Object.entries(progress.modules).sort(([a], [b]) => a.localeCompare(b))),
    quizzes: Object.fromEntries(Object.entries(progress.quizzes).sort(([a], [b]) => a.localeCompare(b))),
  });
  return canonical(first) === canonical(second);
}

function updateProgress(
  userId: string,
  change: (progress: JourneyProgress) => void,
  storage?: StoragePort,
): { ok: boolean; error: string | null; progress: JourneyProgress | null } {
  if (!userId) return {
    ok: false, error: 'Masuk terlebih dahulu untuk mencatat progres alur belajar.', progress: null,
  };
  const current = readJourneyProgress(userId, storage);
  if (current.warning) return { ok: false, error: current.warning, progress: null };
  try {
    change(current.progress);
    (storage ?? window.localStorage).setItem(journeyStorageKey(userId), JSON.stringify(current.progress));
    if (!storage && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(JOURNEY_PROGRESS_EVENT, { detail: userId }));
    }
    return { ok: true, error: null, progress: current.progress };
  } catch {
    return {
      ok: false,
      error: 'Progres alur belajar belum tersimpan. Izinkan penyimpanan browser, lalu coba lagi.',
      progress: null,
    };
  }
}

export function saveJourneyModule(userId: string, moduleId: string, completed: boolean, storage?: StoragePort) {
  return updateProgress(userId, progress => {
    if (!moduleIds.has(moduleId)) throw new Error('Unknown module');
    progress.modules[moduleId] = {
      completed, updatedAt: new Date().toISOString(), lessons: progress.modules[moduleId]?.lessons ?? [],
    };
  }, storage);
}

export function saveJourneyLesson(userId: string, moduleId: string, lesson: string, storage?: StoragePort) {
  return updateProgress(userId, progress => {
    if (!moduleIds.has(moduleId) || !JOURNEY_LESSONS.some(item => item === lesson)) {
      throw new Error('Unknown lesson');
    }
    const lessons = new Set(progress.modules[moduleId]?.lessons ?? []);
    if (lessons.has(lesson)) lessons.delete(lesson); else lessons.add(lesson);
    progress.modules[moduleId] = {
      completed: lessons.size === JOURNEY_LESSONS.length,
      updatedAt: new Date().toISOString(), lessons: [...lessons],
    };
  }, storage);
}

export function saveJourneyQuiz(
  userId: string,
  results: Array<{ category: string; total: number; score: number }>,
  storage?: StoragePort,
) {
  return updateProgress(userId, progress => {
    for (const result of results) {
      if (!result.category.trim() || result.category.length > 200 ||
        ['__proto__', 'constructor', 'prototype'].includes(result.category) ||
        !Number.isSafeInteger(result.total) || !Number.isSafeInteger(result.score) ||
        result.total <= 0 || result.score < 0 || result.score > result.total) {
        throw new Error('Invalid result');
      }
      progress.quizzes[result.category] = {
        completedAt: new Date().toISOString(), total: result.total, score: result.score,
      };
    }
  }, storage);
}
