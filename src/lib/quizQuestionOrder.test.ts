import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { orderQuizQuestions } from './quizQuestionOrder';

const questions = [
  { id: 1, category: 'Kontrak' },
  { id: 2, category: 'K3' },
  { id: 3, category: 'Material' },
  { id: 4, category: 'Struktur' },
  { id: 5, category: 'K3' },
];
const options = {
  relatedCategories: ['K3', 'Struktur'],
  jabatanFilterActive: false,
  prioritizeRelevant: true,
  randomMode: false,
};

describe('jabatan question priority', () => {
  it('puts relevant questions first without hiding or mutating anything', () => {
    const original = [...questions];
    const result = orderQuizQuestions(questions, options);
    assert.deepEqual(result.map(q => q.id), [2, 4, 5, 1, 3]);
    assert.deepEqual(questions, original);
  });

  it('keeps the hard filter limited to related categories', () => {
    assert.deepEqual(
      orderQuizQuestions(questions, { ...options, jabatanFilterActive: true }).map(q => q.id),
      [2, 4, 5],
    );
  });

  it('leaves specific category ordering unchanged', () => {
    assert.deepEqual(orderQuizQuestions(questions, { ...options, prioritizeRelevant: false }), questions);
  });

  it('leaves ordering unchanged without a jabatan mapping', () => {
    assert.deepEqual(orderQuizQuestions(questions, { ...options, relatedCategories: [] }), questions);
  });

  it('handles no matches, all matches and empty lists', () => {
    assert.deepEqual(orderQuizQuestions(questions, { ...options, relatedCategories: ['Unknown'] }), questions);
    const relevant = questions.filter(q => options.relatedCategories.includes(q.category));
    assert.deepEqual(orderQuizQuestions(relevant, options), relevant);
    assert.deepEqual(orderQuizQuestions([], options), []);
    assert.deepEqual(orderQuizQuestions(questions, {
      ...options, relatedCategories: ['Unknown'], jabatanFilterActive: true,
    }), []);
  });

  it('keeps random mode within relevance groups without losing questions', () => {
    const originalRandom = Math.random;
    Math.random = () => 0;
    try {
      const result = orderQuizQuestions(questions, { ...options, randomMode: true });
      assert.deepEqual(result.map(q => q.id), [2, 4, 5, 3, 1]);
      assert.deepEqual(result.map(q => q.id).sort(), [1, 2, 3, 4, 5]);
      const filtered = orderQuizQuestions(questions, {
        ...options, randomMode: true, jabatanFilterActive: true,
      });
      assert.deepEqual(filtered.map(q => q.id), [4, 5, 2]);
    } finally {
      Math.random = originalRandom;
    }
  });
});
