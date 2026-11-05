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

function parseProgress(raw: string | null): JourneyProgress {
  if (!raw) return emptyJourneyProgress();
  const value: unknown = JSON.parse(raw);
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

function updateProgress(
  userId: string,
  change: (progress: JourneyProgress) => void,
  storage?: StoragePort,
): { ok: boolean; error: string | null } {
  if (!userId) return { ok: false, error: 'Masuk terlebih dahulu untuk mencatat progres alur belajar.' };
  const current = readJourneyProgress(userId, storage);
  if (current.warning) return { ok: false, error: current.warning };
  try {
    change(current.progress);
    (storage ?? window.localStorage).setItem(journeyStorageKey(userId), JSON.stringify(current.progress));
    if (!storage && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(JOURNEY_PROGRESS_EVENT, { detail: userId }));
    }
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: 'Progres alur belajar belum tersimpan. Izinkan penyimpanan browser, lalu coba lagi.' };
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
