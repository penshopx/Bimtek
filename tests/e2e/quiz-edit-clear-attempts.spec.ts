import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { expect, test } from '@playwright/test';

// Development only: real auth/actions against the workflow's local database.
// Every mutation and cleanup is scoped to this run's temporary rows.
test.describe('Admin question edit — clear attempt history', () => {
  let client: Client;
  let category: string;
  let email: string;
  let password: string;
  let questions: { id: number; text: string }[];
  const checkboxName = /Hapus juga riwayat percobaan untuk soal ini saat menyimpan/;

  test.beforeEach(async ({ page, request }) => {
    client = createClient({ url: `file:${path.resolve('.data/app.db')}` });
    const marker = randomUUID();
    category = `E2E edit clear ${marker}`;
    email = `quiz-edit-${marker}@example.invalid`;
    password = randomUUID();
    questions = [];
    // Register through the real API; only the temporary account is promoted.
    const registration = await request.post('/api/auth?action=register', {
      data: { name: category, email, password },
    });
    expect(registration.ok()).toBe(true);
    expect((await registration.json()).success).toBe(true);
    await client.execute({
      sql: "UPDATE users SET role = 'admin' WHERE email = ?",
      args: [email],
    });

    const now = new Date().toISOString();
    for (const [index, suffix] of ['with attempts', 'without attempts', 'control'].entries()) {
      const text = `${category} — ${suffix}`;
      const result = await client.execute({
        sql: `INSERT INTO quiz_questions
          (question, category, options, correct, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, 0, ?, ?, ?) RETURNING id`,
        args: [text, category, JSON.stringify(['A', 'B', 'C', 'D']), index, now, now],
      });
      questions.push({ id: Number(result.rows[0].id), text });
    }
    // Include both valid and already-invalidated attempts: clearing must delete
    // all history, not merely hide or invalidate its per-option breakdown.
    await client.batch([
      ...[null, null, now].map(invalidatedAt => ({
        sql: `INSERT INTO quiz_attempts
          (question_id, correct, selected_option, attempted_at, invalidated_at)
          VALUES (?, 1, 0, ?, ?)`,
        args: [questions[0].id, now, invalidatedAt],
      })),
      {
        sql: `INSERT INTO quiz_attempts
          (question_id, correct, selected_option, attempted_at)
          VALUES (?, 0, 1, ?)`,
        args: [questions[2].id, now],
      },
    ], 'write');

    await page.goto('/login');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto('/admin/quiz');
    await page.getByRole('button', { name: category }).click();
    await expect(page.getByRole('row').filter({ hasText: questions[0].text })).toBeVisible();
  });

  test.afterEach(async () => {
    if (!client) return;
    try {
      await client.batch([
        {
          sql: `DELETE FROM quiz_attempts WHERE question_id IN
            (SELECT id FROM quiz_questions WHERE category = ?)`,
          args: [category],
        },
        { sql: 'DELETE FROM quiz_questions WHERE category = ?', args: [category] },
        {
          sql: 'DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email = ?)',
          args: [email],
        },
        { sql: 'DELETE FROM users WHERE email = ?', args: [email] },
      ], 'write');
    } finally {
      client.close();
    }
  });

  test('saving a question edit with the checkbox deletes all attempts and survives reload', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: questions[0].text });
    const controlRow = page.getByRole('row').filter({ hasText: questions[2].text });
    await expect(row.getByText('3 percobaan', { exact: true })).toBeVisible();
    await expect(row.getByRole('button', { name: 'Reset stats', exact: true })).toBeVisible();
    await row.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Edit Soal', exact: true })).toBeVisible();
    const checkbox = page.getByRole('checkbox', { name: checkboxName });
    await expect(checkbox).not.toBeChecked();
    const editedText = `${questions[0].text} — edited`;
    await page.getByPlaceholder('Tulis pertanyaan di sini...').fill(editedText);
    await checkbox.check();
    await page.getByRole('button', { name: 'Simpan', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Edit Soal', exact: true })).toHaveCount(0);
    await expect(row.getByText(editedText, { exact: true })).toBeVisible();
    await expect(row.getByText('Belum ada data', { exact: true })).toBeVisible();
    await expect(row.getByRole('button', { name: 'Reset stats', exact: true })).toHaveCount(0);
    await expect(row.getByText(/^\d+ percobaan$/)).toHaveCount(0);

    const saved = await client.execute({
      sql: 'SELECT question FROM quiz_questions WHERE id = ?', args: [questions[0].id],
    });
    expect(saved.rows[0].question).toBe(editedText);
    const count = await client.execute({
      sql: 'SELECT count(*) AS count FROM quiz_attempts WHERE question_id = ?',
      args: [questions[0].id],
    });
    expect(Number(count.rows[0].count)).toBe(0);
    const control = await client.execute({
      sql: 'SELECT count(*) AS count FROM quiz_attempts WHERE question_id = ?',
      args: [questions[2].id],
    });
    expect(Number(control.rows[0].count)).toBe(1);
    await expect(controlRow.getByText('1 percobaan', { exact: true })).toBeVisible();

    await page.reload();
    await page.getByRole('button', { name: category }).click();
    await expect(row.getByText('Belum ada data', { exact: true })).toBeVisible();
    await expect(row.getByRole('button', { name: 'Reset stats', exact: true })).toHaveCount(0);
    await row.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(page.getByPlaceholder('Tulis pertanyaan di sini...')).toHaveValue(editedText);
    await expect(page.getByRole('checkbox', { name: checkboxName })).toHaveCount(0);
  });

  test('a question with no existing attempts hides the clear-history checkbox', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: questions[1].text });
    await expect(row.getByText('Belum ada data', { exact: true })).toBeVisible();
    await expect(row.getByRole('button', { name: 'Reset stats', exact: true })).toHaveCount(0);
    await row.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Edit Soal', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Tulis pertanyaan di sini...')).toHaveValue(questions[1].text);
    await expect(page.getByRole('checkbox', { name: checkboxName })).toHaveCount(0);
  });
});
