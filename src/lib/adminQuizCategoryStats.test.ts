import { describe, expect, it } from 'bun:test';
import { getAdminQuizCategoryRates } from './adminQuizCategoryStats';

const questions = [
  { id: 1, category: 'Sipil' },
  { id: 2, category: 'Sipil' },
  { id: 3, category: 'Sipil' },
  { id: 4, category: 'K3' },
  { id: 5, category: 'Material' },
];

describe('admin quiz category averages', () => {
  it('averages attempted questions equally, without counting missing stats', () => {
    const stats = new Map([
      [1, { totalAttempts: 100, successRate: 20 }],
      [2, { totalAttempts: 1, successRate: 55 }],
      [4, { totalAttempts: 3, successRate: 100 }],
      [99, { totalAttempts: 5, successRate: 0 }],
    ]);
    expect([...getAdminQuizCategoryRates(questions, stats)])
      .toEqual([['Sipil', 38], ['K3', 100]]);
  });

  it('keeps a real 0% rate but omits categories with no attempts', () => {
    const stats = new Map([
      [1, { totalAttempts: 2, successRate: 0 }],
      [2, { totalAttempts: 0, successRate: 100 }],
      [5, { totalAttempts: 0, successRate: 0 }],
    ]);
    expect([...getAdminQuizCategoryRates(questions, stats)])
      .toEqual([['Sipil', 0]]);
    expect(getAdminQuizCategoryRates(questions, new Map()).size).toBe(0);
  });

  it('recalculates after a reset or a question moves categories, without mutating inputs', () => {
    const stats = new Map([
      [1, { totalAttempts: 2, successRate: 0 }],
      [2, { totalAttempts: 2, successRate: 100 }],
    ]);
    expect(getAdminQuizCategoryRates(questions, stats).get('Sipil')).toBe(50);
    const moved = questions.map(q => q.id === 2 ? { ...q, category: 'K3' } : q);
    expect([...getAdminQuizCategoryRates(moved, stats)])
      .toEqual([['Sipil', 0], ['K3', 100]]);
    const resetStats = new Map(stats);
    resetStats.delete(1);
    expect([...getAdminQuizCategoryRates(moved, resetStats)]).toEqual([['K3', 100]]);
    expect(stats.size).toBe(2);
    expect(questions[1].category).toBe('Sipil');
  });
});
