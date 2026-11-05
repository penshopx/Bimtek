import { describe, expect, test } from 'bun:test';
import { buildLearningJourney, emptyJourneyProgress, JOURNEY_LESSONS } from './learning-journey';
import {
  journeyStorageKey, readJourneyProgress, saveJourneyLesson, saveJourneyModule, saveJourneyQuiz,
} from './learning-journey-storage';

function storageFixture() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

const userA = 'journey-fixture-a';
const userB = 'journey-fixture-b';
const moduleId = 'sipil-gedung-1';
const availableCategories = ['Sipil', 'Struktur', 'Material', 'K3', 'Manajemen'];

describe('editorial learning journey', () => {
  test('no target or unknown target does not silently create a generic certification path', () => {
    for (const id of [undefined, 'unknown-target']) {
      const plan = buildLearningJourney(id, availableCategories, emptyJourneyProgress());
      expect(plan.targetName).toBeNull();
      expect(plan.steps).toEqual([]);
      expect(plan.progressPercent).toBe(0);
      expect(plan.nextStep).toBeNull();
    }
  });
  test('builds a stable bounded introduction from real module IDs and available quizzes', () => {
    const first = buildLearningJourney('C002', availableCategories, emptyJourneyProgress());
    const second = buildLearningJourney('C002', availableCategories, emptyJourneyProgress());
    expect(first.targetName).toBeTruthy();
    expect(first.steps).toEqual(second.steps);
    expect(first.steps.length).toBeGreaterThan(0);
    expect(first.steps.length).toBeLessThanOrEqual(9);
    expect(new Set(first.steps.map(step => step.id)).size).toBe(first.steps.length);
    expect(first.nextStep?.href).toBe(`/bimtek/${moduleId}`);
    expect(first.steps.filter(step => step.type === 'quiz').every(step =>
      availableCategories.includes(step.category))).toBe(true);
  });
  test('does not invent questions for an unavailable category', () => {
    const plan = buildLearningJourney('C002', [], emptyJourneyProgress());
    expect(plan.steps.some(step => step.type === 'quiz')).toBe(false);
    expect(plan.steps.some(step => step.type === 'module')).toBe(true);
  });
  test('opening/building a route never writes completion', () => {
    const progress = emptyJourneyProgress();
    const before = JSON.stringify(progress);
    const plan = buildLearningJourney('C002', availableCategories, progress);
    expect(JSON.stringify(progress)).toBe(before);
    expect(plan.completedCount).toBe(0);
    expect(plan.steps.every(step => step.status === 'not-started')).toBe(true);
  });
  test('next action skips completed modules and completed practice', () => {
    const storage = storageFixture();
    const initial = buildLearningJourney('C002', availableCategories, emptyJourneyProgress());
    for (const step of initial.steps) {
      if (step.type === 'module') saveJourneyModule(userA, step.id.slice('module:'.length), true, storage);
      else saveJourneyQuiz(userA, [{ category: step.category, total: 2, score: 0 }], storage);
    }
    const done = buildLearningJourney('C002', availableCategories, readJourneyProgress(userA, storage).progress);
    expect(done.progressPercent).toBe(100);
    expect(done.nextStep).toBeNull();
    expect(done.completedCount).toBe(initial.steps.length);
    // Completion is participation, not a minimum passing grade.
    expect(done.steps.find(step => step.type === 'quiz')?.description).toContain('0/2');
    saveJourneyModule(userA, moduleId, false, storage);
    const undone = buildLearningJourney('C002', availableCategories, readJourneyProgress(userA, storage).progress);
    expect(undone.nextStep?.id).toBe(`module:${moduleId}`);
    expect(undone.progressPercent).toBeLessThan(100);
  });
  test('changing target changes the plan without deleting underlying activity', () => {
    const storage = storageFixture();
    saveJourneyModule(userA, moduleId, true, storage);
    const progress = readJourneyProgress(userA, storage).progress;
    const original = buildLearningJourney('C002', availableCategories, progress);
    const electrical = buildLearningJourney('E001', availableCategories, progress);
    expect(electrical.targetName).not.toBe(original.targetName);
    expect(electrical.steps[0].href).toContain('/bimtek/elektrikal-');
    expect(buildLearningJourney('C002', availableCategories, progress).completedCount).toBe(1);
  });
});

describe('account-separated browser progress', () => {
  test('fresh empty state and no automatic adoption of old shared-browser progress', () => {
    const storage = storageFixture();
    storage.setItem('bimtekCompleted', JSON.stringify([moduleId]));
    storage.setItem(`bimtek-lessons-${moduleId}`, JSON.stringify(JOURNEY_LESSONS));
    expect(readJourneyProgress(userA, storage).progress).toEqual(emptyJourneyProgress());
  });
  test('explicit completion persists after reading again; other account remains empty', () => {
    const storage = storageFixture();
    expect(saveJourneyModule(userA, moduleId, true, storage).ok).toBe(true);
    expect(readJourneyProgress(userA, storage).progress.modules[moduleId].completed).toBe(true);
    expect(readJourneyProgress(userB, storage).progress.modules).toEqual({});
    expect(journeyStorageKey(userA)).not.toBe(journeyStorageKey(userB));
  });
  test('lesson checks are partial until all six are deliberately checked; undo is reflected', () => {
    const storage = storageFixture();
    saveJourneyLesson(userA, moduleId, JOURNEY_LESSONS[0], storage);
    const partial = readJourneyProgress(userA, storage).progress;
    expect(partial.modules[moduleId].completed).toBe(false);
    expect(buildLearningJourney('C002', [], partial).steps[0].status).toBe('in-progress');
    for (const lesson of JOURNEY_LESSONS.slice(1)) saveJourneyLesson(userA, moduleId, lesson, storage);
    expect(readJourneyProgress(userA, storage).progress.modules[moduleId].completed).toBe(true);
    saveJourneyLesson(userA, moduleId, JOURNEY_LESSONS[0], storage);
    expect(readJourneyProgress(userA, storage).progress.modules[moduleId].completed).toBe(false);
  });
  test('module and quiz records do not overwrite each other', () => {
    const storage = storageFixture();
    saveJourneyModule(userA, moduleId, true, storage);
    saveJourneyQuiz(userA, [{ category: 'K3', total: 3, score: 2 }], storage);
    const progress = readJourneyProgress(userA, storage).progress;
    expect(progress.modules[moduleId].completed).toBe(true);
    expect(progress.quizzes.K3.score).toBe(2);
    expect(progress.quizzes.K3.total).toBe(3);
  });
  test('unknown modules and lessons do not create records', () => {
    const storage = storageFixture();
    expect(saveJourneyModule(userA, 'nonexistent', true, storage).ok).toBe(false);
    expect(saveJourneyLesson(userA, moduleId, 'invented lesson', storage).ok).toBe(false);
    expect(storage.values.size).toBe(0);
  });
  test('invalid counts and prototype keys are rejected without saving', () => {
    const storage = storageFixture();
    for (const result of [
      { category: 'K3', total: 0, score: 0 }, { category: 'K3', total: 2, score: 3 },
      { category: 'K3', total: 2, score: -1 }, { category: 'K3', total: 2.2, score: 1 },
      { category: '__proto__', total: 1, score: 1 },
    ]) expect(saveJourneyQuiz(userA, [result], storage).ok).toBe(false);
    expect(storage.values.size).toBe(0);
  });
  test('corrupt or unexpected versions remain untouched and are reported', () => {
    for (const raw of ['bad JSON', '{"version":2,"modules":{},"quizzes":{}}', '[]',
      '{"version":1,"modules":{"bad":{}},"quizzes":{}}']) {
      const storage = storageFixture();
      storage.setItem(journeyStorageKey(userA), raw);
      expect(readJourneyProgress(userA, storage).warning).toBeTruthy();
      expect(saveJourneyModule(userA, moduleId, true, storage).ok).toBe(false);
      expect(storage.getItem(journeyStorageKey(userA))).toBe(raw);
    }
  });
  test('blocked reads report a warning; blocked writes report failure', () => {
    const readBlocked = {
      getItem: () => { throw new Error('Blocked'); }, setItem: () => {},
    };
    expect(readJourneyProgress(userA, readBlocked).warning).toBeTruthy();
    expect(saveJourneyModule(userA, moduleId, true, readBlocked).ok).toBe(false);
    const writeBlocked = {
      getItem: () => null, setItem: () => { throw new Error('Quota'); },
    };
    expect(saveJourneyModule(userA, moduleId, true, writeBlocked).ok).toBe(false);
    expect(saveJourneyModule('', moduleId, true, storageFixture()).ok).toBe(false);
  });
});
