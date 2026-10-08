// Run in its own Bun process so the database mock cannot affect other suites.
import { afterAll, beforeAll, beforeEach, expect, mock, test } from 'bun:test';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '@/db/schema';

const client = createClient({ url: ':memory:' });
const database = drizzle(client, { schema });
mock.module('@/db', () => ({ db: database }));
const {
  createQuizQuestion, getQuizQuestions, recordQuizAttempt,
  updateQuizQuestion, getQuizAttemptStats, resetStaleAttempts, resetQuizAttempts,
} = await import('./quiz');

const sessionId = 'quiz-sort-test-session';
const category = 'K3';
const otherCategory = 'Manajemen';
const now = new Date().toISOString();

beforeAll(async () => {
  await client.executeMultiple(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, role TEXT DEFAULT 'user', avatar TEXT,
      phone TEXT, company TEXT, position TEXT, bidang TEXT, jabatan_skk TEXT,
      kualifikasi_skk TEXT, skk_certificate_level TEXT, skk_issued_at TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT NOT NULL,
      category TEXT NOT NULL, options TEXT NOT NULL, correct INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, question_id INTEGER NOT NULL,
      correct INTEGER NOT NULL, selected_option INTEGER,
      attempted_at TEXT NOT NULL, invalidated_at TEXT
    );
    CREATE TABLE settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT NOT NULL UNIQUE, value TEXT NOT NULL
    );
  `);
  await database.insert(schema.users).values({
    id: 'quiz-sort-admin',
    name: 'Quiz Test Admin',
    email: 'quiz-sort@example.test',
    passwordHash: 'unused-test-hash',
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  });
  await database.insert(schema.sessions).values({
    id: sessionId,
    userId: 'quiz-sort-admin',
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    createdAt: now,
  });
});

beforeEach(async () => {
  await database.delete(schema.quizAttempts);
  await database.delete(schema.quizQuestions);
  // Seed distinct category-local and global maxima; do not mock query results.
  await database.insert(schema.quizQuestions).values(
    [
      ...[1, 2, 3, 4, 5].map(sortOrder => ({ category, sortOrder })),
      ...[100, 101].map(sortOrder => ({ category: otherCategory, sortOrder })),
    ].map(row => ({
      ...row,
      question: `${row.category} ${row.sortOrder}`,
      options: JSON.stringify(['Benar', 'Salah']),
      correct: 0,
      createdAt: now,
      updatedAt: now,
    }))
  );
});

test('editing invalidates old option indices while counting only new attempts in the breakdown', async () => {
  const [question, untouched] = await getQuizQuestions(category);
  await recordQuizAttempt(question.id, 0);
  await recordQuizAttempt(question.id, 1);
  await recordQuizAttempt(question.id, 1);
  await recordQuizAttempt(untouched.id, 0);

  const statsFor = async (id: number) =>
    (await getQuizAttemptStats(sessionId)).find(stat => stat.questionId === id);
  expect(await statsFor(question.id)).toEqual({
    questionId: question.id, totalAttempts: 3, correctAttempts: 1,
    successRate: 33, optionCounts: [1, 2], hasStaleAttempts: false,
  });
  const untouchedBefore = await statsFor(untouched.id);

  expect(await updateQuizQuestion(question.id, {
    question: 'Soal diubah dengan pilihan baru',
    category,
    options: ['Salah', 'Benar', 'Pilihan tambahan'],
    correct: 1,
  }, sessionId)).toEqual({ success: true });

  expect((await getQuizQuestions(category)).find(row => row.id === question.id)?.options)
    .toEqual(['Salah', 'Benar', 'Pilihan tambahan']);
  expect(await statsFor(question.id)).toEqual({
    questionId: question.id, totalAttempts: 3, correctAttempts: 1,
    successRate: 33, optionCounts: [0, 0, 0], hasStaleAttempts: true,
  });
  const oldAttempts = await database.select().from(schema.quizAttempts)
    .where(eq(schema.quizAttempts.questionId, question.id));
  expect(oldAttempts).toHaveLength(3);
  expect(oldAttempts.every(attempt => Boolean(attempt.invalidatedAt))).toBe(true);

  // Positive new counts must not accidentally bring the hidden chart back.
  await recordQuizAttempt(question.id, 1);
  await recordQuizAttempt(question.id, 2);
  await recordQuizAttempt(question.id, 2);
  expect(await statsFor(question.id)).toEqual({
    questionId: question.id, totalAttempts: 6, correctAttempts: 2,
    successRate: 33, optionCounts: [0, 1, 2], hasStaleAttempts: true,
  });
  expect(await statsFor(untouched.id)).toEqual(untouchedBefore);
});

test('clearing stale attempts preserves valid rows and all attempts on other questions', async () => {
  const [question, other] = await getQuizQuestions(category);
  await recordQuizAttempt(question.id, 0);
  await recordQuizAttempt(question.id, 1);
  await recordQuizAttempt(other.id, 0);
  for (const row of [question, other]) {
    await updateQuizQuestion(row.id, {
      question: `${row.question} edited`, category, options: ['Benar', 'Salah'], correct: 0,
    }, sessionId);
  }
  await recordQuizAttempt(question.id, 0);
  await recordQuizAttempt(question.id, 1);
  await recordQuizAttempt(other.id, 1);
  const before = await database.select().from(schema.quizAttempts);
  const validBefore = before.filter(row => row.questionId === question.id && row.invalidatedAt === null);
  const otherBefore = before.filter(row => row.questionId === other.id);

  expect(await resetStaleAttempts(question.id, sessionId)).toEqual({ success: true });
  const after = await database.select().from(schema.quizAttempts);
  expect(after.filter(row => row.questionId === question.id)).toEqual(validBefore);
  expect(after.filter(row => row.questionId === other.id)).toEqual(otherBefore);
  expect((await getQuizAttemptStats(sessionId)).find(row => row.questionId === question.id)).toEqual({
    questionId: question.id, totalAttempts: 2, correctAttempts: 1,
    successRate: 50, optionCounts: [1, 1], hasStaleAttempts: false,
  });
  // Repeated cleanup is safe and does not delete clean data.
  expect(await resetStaleAttempts(question.id, sessionId)).toEqual({ success: true });
  expect(await database.select().from(schema.quizAttempts)).toEqual(after);
});

test('clearing an entirely stale history leaves no stats for that question', async () => {
  const [question] = await getQuizQuestions(category);
  await recordQuizAttempt(question.id, 0);
  await updateQuizQuestion(question.id, {
    question: 'Edited', category, options: ['Benar', 'Salah'], correct: 0,
  }, sessionId);
  expect(await resetStaleAttempts(question.id, sessionId)).toEqual({ success: true });
  expect(await getQuizAttemptStats(sessionId)).toEqual([]);
});

test('stale cleanup rejects missing, invalid, expired and non-admin sessions without deleting rows', async () => {
  const [question] = await getQuizQuestions(category);
  await database.insert(schema.quizAttempts).values({
    questionId: question.id, correct: true, selectedOption: 0, attemptedAt: now, invalidatedAt: now,
  });
  await database.insert(schema.users).values({
    id: 'quiz-regular-user', name: 'Test User', email: 'quiz-user@example.test',
    passwordHash: 'unused', role: 'user', createdAt: now, updatedAt: now,
  });
  await database.insert(schema.sessions).values([
    { id: 'quiz-user-session', userId: 'quiz-regular-user', expiresAt: new Date(Date.now() + 86_400_000).toISOString(), createdAt: now },
    { id: 'quiz-expired-session', userId: 'quiz-sort-admin', expiresAt: '2000-01-01T00:00:00.000Z', createdAt: now },
  ]);
  const before = await database.select().from(schema.quizAttempts);
  for (const session of [null, '', 'missing-session', 'quiz-expired-session', 'quiz-user-session']) {
    expect((await resetStaleAttempts(question.id, session)).success).toBe(false);
    expect(await database.select().from(schema.quizAttempts)).toEqual(before);
  }
  for (const id of [0, -1, 1.5, NaN]) {
    expect(await resetStaleAttempts(id, sessionId)).toEqual({ success: false, message: 'Invalid question id' });
    expect(await database.select().from(schema.quizAttempts)).toEqual(before);
  }
});

test('stats reset rejects missing, invalid, expired and non-admin sessions without deleting attempts', async () => {
  const [question] = await getQuizQuestions(category);
  await recordQuizAttempt(question.id, 0);
  await recordQuizAttempt(question.id, 1);
  await database.insert(schema.users).values({
    id: 'reset-regular-user', name: 'Reset Test User', email: 'reset-user@example.test',
    passwordHash: 'unused', role: 'user', createdAt: now, updatedAt: now,
  });
  await database.insert(schema.sessions).values([
    { id: 'reset-user-session', userId: 'reset-regular-user', expiresAt: new Date(Date.now() + 86_400_000).toISOString(), createdAt: now },
    { id: 'reset-expired-session', userId: 'quiz-sort-admin', expiresAt: '2000-01-01T00:00:00.000Z', createdAt: now },
  ]);
  const before = await database.select().from(schema.quizAttempts);
  expect(before).toHaveLength(2);
  for (const session of [null, '', 'reset-invalid-session', 'reset-expired-session', 'reset-user-session']) {
    expect(await resetQuizAttempts(question.id, session)).toEqual({
      success: false, message: session === 'reset-user-session' ? 'Forbidden' : 'Unauthorized',
    });
    expect(await database.select().from(schema.quizAttempts)).toEqual(before);
  }
});

test('authorized stats reset deletes only the selected question attempts', async () => {
  const [question, untouched] = await getQuizQuestions(category);
  await recordQuizAttempt(question.id, 0);
  await recordQuizAttempt(question.id, 1);
  await recordQuizAttempt(untouched.id, 0);
  const preserved = await database.select().from(schema.quizAttempts)
    .where(eq(schema.quizAttempts.questionId, untouched.id));
  expect(await resetQuizAttempts(question.id, sessionId)).toEqual({ success: true });
  expect(await database.select().from(schema.quizAttempts)).toEqual(preserved);
});

afterAll(() => {
  mock.restore();
  client.close();
});

test.each([
  { label: 'internal gaps', removedOrders: [2, 4], expectedNextOrder: 6 },
  { label: 'internal gaps and deleted tail', removedOrders: [2, 4, 5], expectedNextOrder: 4 },
])('new questions append using the actual category maximum after $label', async ({
  removedOrders,
  expectedNextOrder,
}) => {
  const originalCategory = await getQuizQuestions(category);
  const otherBefore = await getQuizQuestions(otherCategory);
  const removedIds = originalCategory
    .filter(row => removedOrders.includes(row.sortOrder))
    .map(row => row.id);
  expect(removedIds).toHaveLength(removedOrders.length);

  // Delete at the storage layer to preserve the gaps under test:
  // deleteQuizQuestion currently compacts all categories' orders.
  await database.delete(schema.quizQuestions).where(inArray(schema.quizQuestions.id, removedIds));
  const remaining = await getQuizQuestions(category);
  const categoryMax = Math.max(...remaining.map(row => row.sortOrder));
  const globalMax = Math.max(...(await getQuizQuestions()).map(row => row.sortOrder));
  expect(remaining.map(row => row.sortOrder)).toEqual(
    originalCategory.map(row => row.sortOrder).filter(order => !removedOrders.includes(order))
  );
  expect(globalMax).toBeGreaterThan(categoryMax + 1);
  expect(categoryMax + 1).toBe(expectedNextOrder);

  const result = await createQuizQuestion({
    question: 'Soal baru setelah penghapusan',
    category,
    options: ['Pilihan A', 'Pilihan B'],
    correct: 0,
  }, sessionId);
  expect(result).toEqual({ success: true });

  const rows = await database.select().from(schema.quizQuestions)
    .where(eq(schema.quizQuestions.category, category));
  const created = rows.find(row => row.question === 'Soal baru setelah penghapusan');
  expect(created).toBeDefined();
  expect(created!.sortOrder).toBe(categoryMax + 1);
  expect(created!.sortOrder).not.toBe(globalMax + 1);
  expect(created!.sortOrder).not.toBe(remaining.length + 1);

  const ordered = await getQuizQuestions(category);
  expect(ordered.map(row => row.id)).toEqual([...remaining.map(row => row.id), created!.id]);
  expect(await getQuizQuestions(otherCategory)).toEqual(otherBefore);
});
