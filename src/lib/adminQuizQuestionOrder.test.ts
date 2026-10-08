import { describe, expect, it } from 'bun:test';
import { getDisplayedAdminQuizQuestions } from './adminQuizQuestionOrder';

// Start unanswered rows first so a broken 0% fallback cannot pass accidentally.
const questions = [
  { id: 1, category: 'K3' }, // no stat entry
  { id: 2, category: 'K3' }, // explicit zero attempts
  { id: 3, category: 'K3' }, // 100%
  { id: 4, category: 'Material' }, // 20%
  { id: 5, category: 'K3' }, // 0% with attempts
  { id: 6, category: 'K3' }, // 40%
  { id: 7, category: 'Material' }, // no stat entry
  { id: 8, category: 'Material' }, // 80%
];
const stats = new Map([
  [2, { totalAttempts: 0, successRate: 0 }],
  [3, { totalAttempts: 5, successRate: 100 }],
  [4, { totalAttempts: 5, successRate: 20 }],
  [5, { totalAttempts: 5, successRate: 0 }],
  [6, { totalAttempts: 5, successRate: 40 }],
  [8, { totalAttempts: 5, successRate: 80 }],
]);
const ids = (rows: { id: number }[]) => rows.map(row => row.id);

describe('admin quiz success-rate sorting', () => {
  it('orders real rates from 0% to 100%, then missing and zero-attempt stats', () => {
    expect(ids(getDisplayedAdminQuizQuestions(questions, stats, 'Semua', true)))
      .toEqual([5, 4, 6, 8, 3, 1, 2, 7]);
  });

  it('keeps unanswered questions last within a specific category', () => {
    expect(ids(getDisplayedAdminQuizQuestions(questions, stats, 'K3', true)))
      .toEqual([5, 6, 3, 1, 2]);
    expect(ids(getDisplayedAdminQuizQuestions(questions, stats, 'Material', true)))
      .toEqual([4, 8, 7]);
  });

  it('does not use an apparent rate when the attempt count is zero', () => {
    const misleadingStats = new Map(stats);
    misleadingStats.set(2, { totalAttempts: 0, successRate: 50 });
    expect(ids(getDisplayedAdminQuizQuestions(questions, misleadingStats, 'K3', true)))
      .toEqual([5, 6, 3, 1, 2]);
  });

  it('does not mutate questions or stats and restores saved order when disabled', () => {
    const originalQuestions = structuredClone(questions);
    const originalStats = structuredClone(stats);
    getDisplayedAdminQuizQuestions(questions, stats, 'Semua', true);
    getDisplayedAdminQuizQuestions(questions, stats, 'K3', true);
    expect(questions).toEqual(originalQuestions);
    expect(stats).toEqual(originalStats);
    expect(ids(getDisplayedAdminQuizQuestions(questions, stats, 'Semua', false)))
      .toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(ids(getDisplayedAdminQuizQuestions(questions, stats, 'K3', false)))
      .toEqual([1, 2, 3, 5, 6]);
  });

  it('preserves existing order for tied real rates', () => {
    const tiedStats = new Map(stats);
    tiedStats.set(6, { totalAttempts: 10, successRate: 100 });
    expect(ids(getDisplayedAdminQuizQuestions(questions, tiedStats, 'K3', true)))
      .toEqual([5, 3, 6, 1, 2]);
  });

  it('preserves order when every question is unanswered', () => {
    expect(getDisplayedAdminQuizQuestions(questions, new Map(), 'Semua', true))
      .toEqual(questions);
    const unanswered = questions.filter(row => [1, 2, 7].includes(row.id));
    expect(getDisplayedAdminQuizQuestions(unanswered, stats, 'Semua', true))
      .toEqual(unanswered);
  });

  it('handles empty lists and categories without matches', () => {
    expect(getDisplayedAdminQuizQuestions([], stats, 'Semua', true)).toEqual([]);
    expect(getDisplayedAdminQuizQuestions(questions, stats, 'Unknown', true)).toEqual([]);
  });
});
