import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { expect, test, type Page } from '@playwright/test';

// Temporary rows in a unique category exercise the real Next.js read actions.
// Only this category is deleted; user questions and attempts are never changed.
test.describe('Ulangi Soal yang Salah', () => {
  let client: Client;
  let category: string;
  let questions: { id: number; text: string; correct: number }[];
  let blockedAttempts: number;

  test.beforeEach(async ({ page }) => {
    client = createClient({ url: `file:${path.resolve('.data/app.db')}` });
    category = `E2E quiz retry ${randomUUID()}`;
    questions = [];
    blockedAttempts = 0;
    const timestamp = new Date().toISOString();
    // Different answer keys prevent a test that accidentally always clicks A.
    for (const [index, correct] of [0, 2, 1, 3].entries()) {
      const text = `${category} — soal ${index + 1}`;
      const result = await client.execute({
        sql: `INSERT INTO quiz_questions
          (question, category, options, correct, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        args: [text, category, JSON.stringify(['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D']),
          correct, index, timestamp, timestamp],
      });
      questions.push({ id: Number(result.rows[0].id), text, correct });
    }

    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('quiz-random-mode', 'false');
    });
    // Recording attempts also prunes old analytics globally. Abort only the
    // fixture's recordQuizAttempt calls, leaving question/category reads real.
    await page.route('**/quiz**', async route => {
      const request = route.request();
      if (request.method() === 'POST' && request.headers()['next-action']) {
        let args: unknown;
        try { args = JSON.parse(request.postData() || 'null'); } catch { /* not a JSON action */ }
        if (Array.isArray(args) && args.length === 2 &&
            questions.some(q => q.id === args[0]) && typeof args[1] === 'number') {
          blockedAttempts++;
          await route.abort();
          return;
        }
      }
      await route.continue();
    });
    await page.goto(`/quiz?category=${encodeURIComponent(category)}`);
    await expect(page.getByRole('heading', { name: questions[0].text, exact: true })).toBeVisible();
    await expect(page.getByText('4 soal persiapan ujian sertifikasi', { exact: true })).toBeVisible();
  });

  test.afterEach(async () => {
    if (!client) return;
    try {
      // Also detects interception regressions rather than silently keeping
      // analytics produced by the test.
      const attempts = await client.execute({
        sql: `SELECT count(*) AS count FROM quiz_attempts
          WHERE question_id IN (SELECT id FROM quiz_questions WHERE category = ?)`,
        args: [category],
      });
      expect(Number(attempts.rows[0].count)).toBe(0);
    } finally {
      try {
        await client.batch([
          {
            sql: `DELETE FROM quiz_attempts WHERE question_id IN
              (SELECT id FROM quiz_questions WHERE category = ?)`,
            args: [category],
          },
          { sql: 'DELETE FROM quiz_questions WHERE category = ?', args: [category] },
        ], 'write');
      } finally {
        client.close();
      }
    }
  });

  async function answerSession(page: Page, expectedQuestions: typeof questions, missedIds: Set<number>) {
    const seen: number[] = [];
    for (const [index, question] of expectedQuestions.entries()) {
      await expect(page.getByRole('heading', { name: question.text, exact: true })).toBeVisible();
      await expect(page.getByText(`Progress: ${index + 1} / ${expectedQuestions.length}`, { exact: true })).toBeVisible();
      seen.push(question.id);
      const choice = missedIds.has(question.id) ? (question.correct + 1) % 4 : question.correct;
      const letter = String.fromCharCode(65 + choice);
      const option = page.getByRole('button', { name: `${letter}.Pilihan ${letter}`, exact: true });
      await option.click();
      await expect(option).toBeDisabled();
      await page.getByRole('button', {
        name: index === expectedQuestions.length - 1 ? 'Lihat Hasil' : 'Soal Berikutnya →',
        exact: true,
      }).click();
    }
    return seen;
  }

  test('mixed answers show the exact count and replay only missed questions', async ({ page }) => {
    const missed = [questions[1], questions[3]];
    await answerSession(page, questions, new Set(missed.map(q => q.id)));
    await expect(page.getByRole('heading', { name: 'Quiz Selesai!', exact: true })).toBeVisible();
    await expect(page.getByText('Skor Anda: 2 dari 4 (50%)', { exact: true })).toBeVisible();
    const retry = page.getByRole('button', { name: /Ulangi Soal yang Salah \(2\)$/ });
    await expect(retry).toBeVisible();
    await retry.click();
    await expect(page.getByText('2 soal persiapan ujian sertifikasi', { exact: true })).toBeVisible();
    // Exact headings + progress denominator + immediate result after question 2
    // prove neither previously correct question is included in the retry.
    expect(await answerSession(page, missed, new Set())).toEqual(missed.map(q => q.id));
    await expect(page.getByRole('heading', { name: 'Sesi Ulang Selesai!', exact: true })).toBeVisible();
    await expect(page.getByText('Skor Anda: 2 dari 2 (100%)', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: /Ulangi Soal yang Salah/ })).toHaveCount(0);
    await expect.poll(() => blockedAttempts).toBe(6);
  });

  test('a perfect first session hides the wrong-answer retry button', async ({ page }) => {
    await answerSession(page, questions, new Set());
    await expect(page.getByRole('heading', { name: 'Quiz Selesai!', exact: true })).toBeVisible();
    await expect(page.getByText('Skor Anda: 4 dari 4 (100%)', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Ulangi Soal yang Salah/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Coba Lagi/ })).toBeVisible();
    await expect.poll(() => blockedAttempts).toBe(4);
  });
});
