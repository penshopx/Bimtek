'use server';

import { db } from '@/db';
import { quizQuestions, quizAttempts, sessions, settings, users } from '@/db/schema';
import { eq, asc, lt, sql, and, isNotNull } from 'drizzle-orm';
import {
  DEFAULT_QUIZ_ATTEMPT_RETENTION_DAYS,
  MAX_QUIZ_ATTEMPT_RETENTION_DAYS,
  MIN_QUIZ_ATTEMPT_RETENTION_DAYS,
  QUIZ_ATTEMPT_RETENTION_SETTING_KEY,
} from '@/lib/quizSettings';

/**
 * Attempts older than this many days are purged on each insert.
 * Keeps the quiz_attempts table bounded regardless of activity volume.
 */
function parseRetentionDays(value: string | null | undefined): number {
  const parsed = Number(value);
  if (
    Number.isInteger(parsed) &&
    parsed >= MIN_QUIZ_ATTEMPT_RETENTION_DAYS &&
    parsed <= MAX_QUIZ_ATTEMPT_RETENTION_DAYS
  ) {
    return parsed;
  }
  return DEFAULT_QUIZ_ATTEMPT_RETENTION_DAYS;
}

export interface QuizQuestion {
  id: number;
  question: string;
  category: string;
  options: string[];
  correct: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

type RawRow = {
  id: number;
  question: string;
  category: string;
  options: string;
  correct: number;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
};

function parseRow(row: RawRow): QuizQuestion {
  return { ...row, options: JSON.parse(row.options), sortOrder: row.sortOrder ?? 0 };
}

// ---------------------------------------------------------------------------
// Server-side admin session guard
// ---------------------------------------------------------------------------

async function requireAdmin(sessionId: string | null | undefined): Promise<void> {
  if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
    throw new Error('Unauthorized');
  }
  const sessionRows = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  const session = sessionRows[0];
  if (!session) throw new Error('Unauthorized');

  // Check expiry
  if (new Date(session.expiresAt) < new Date()) throw new Error('Unauthorized');

  const userRows = await db.select().from(users).where(eq(users.id, session.userId));
  const user = userRows[0];
  if (!user || user.role !== 'admin') throw new Error('Forbidden');
}

async function readQuizAttemptRetentionDays(): Promise<number> {
  const rows = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, QUIZ_ATTEMPT_RETENTION_SETTING_KEY));
  return parseRetentionDays(rows[0]?.value);
}

export async function getQuizAttemptRetentionDays(
  sessionId: string | null | undefined
): Promise<number> {
  await requireAdmin(sessionId);
  return readQuizAttemptRetentionDays();
}

export async function updateQuizAttemptRetentionDays(
  value: unknown,
  sessionId: string | null | undefined
): Promise<{ success: boolean; message?: string; days?: number }> {
  try {
    await requireAdmin(sessionId);
    const days = Number(value);
    if (
      !Number.isInteger(days) ||
      days < MIN_QUIZ_ATTEMPT_RETENTION_DAYS ||
      days > MAX_QUIZ_ATTEMPT_RETENTION_DAYS
    ) {
      throw new Error(
        `Retensi harus berupa bilangan bulat antara ${MIN_QUIZ_ATTEMPT_RETENTION_DAYS} dan ${MAX_QUIZ_ATTEMPT_RETENTION_DAYS} hari`
      );
    }

    await db
      .insert(settings)
      .values({ key: QUIZ_ATTEMPT_RETENTION_SETTING_KEY, value: String(days) })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: String(days) },
      });

    return { success: true, days };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

function validateQuestionInput(data: {
  question: unknown;
  category: unknown;
  options: unknown;
  correct: unknown;
}): { question: string; category: string; options: string[]; correct: number } {
  const question = typeof data.question === 'string' ? data.question.trim() : '';
  const category = typeof data.category === 'string' ? data.category.trim() : '';

  if (!question) throw new Error('Question text is required');
  if (!category) throw new Error('Category is required');

  if (!Array.isArray(data.options)) throw new Error('Options must be an array');
  if (data.options.length < 2 || data.options.length > 6) {
    throw new Error('Options must have between 2 and 6 items');
  }
  const options = data.options.map((o: unknown, i: number) => {
    const s = typeof o === 'string' ? o.trim() : '';
    if (!s) throw new Error(`Option ${i + 1} cannot be empty`);
    return s;
  });

  const correct = Number(data.correct);
  if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) {
    throw new Error('correct must be a valid option index');
  }

  return { question, category, options, correct };
}

// ---------------------------------------------------------------------------
// Public read actions (no auth required)
// ---------------------------------------------------------------------------

export async function getQuizQuestions(category?: string): Promise<QuizQuestion[]> {
  const rows = category && category !== 'Semua'
    ? await db.select().from(quizQuestions).where(eq(quizQuestions.category, category)).orderBy(asc(quizQuestions.sortOrder), asc(quizQuestions.id))
    : await db.select().from(quizQuestions).orderBy(asc(quizQuestions.sortOrder), asc(quizQuestions.id));
  return rows.map(parseRow);
}

export async function getQuizCategories(): Promise<string[]> {
  const rows = await db.select({ category: quizQuestions.category }).from(quizQuestions);
  return ['Semua', ...Array.from(new Set(rows.map((r) => r.category)))];
}

// ---------------------------------------------------------------------------
// Admin write actions (require admin session)
// ---------------------------------------------------------------------------

export async function createQuizQuestion(
  data: { question: unknown; category: unknown; options: unknown; correct: unknown },
  sessionId: string | null | undefined
): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin(sessionId);
    const validated = validateQuestionInput(data);
    const now = new Date().toISOString();

    // Prefer categoryMax + 1 so new questions append compactly within their
    // category rather than inheriting an inflated global maximum. The delete path
    // runs a global compaction (0..N-1) that can interleave sort_order values
    // across categories, so a naïve category-local value might collide with a
    // value already owned by a different category. If that happens, fall back to
    // globalMax + 1, which is always unique.
    const allRows = await db
      .select({ sortOrder: quizQuestions.sortOrder, category: quizQuestions.category })
      .from(quizQuestions);
    const categoryMax = allRows
      .filter((r) => r.category === validated.category)
      .reduce((m, r) => Math.max(m, r.sortOrder ?? 0), 0);
    const globalMax = allRows.reduce((m, r) => Math.max(m, r.sortOrder ?? 0), 0);
    const proposed = categoryMax + 1;
    const takenOrders = new Set(allRows.map((r) => r.sortOrder ?? 0));
    const nextSortOrder = takenOrders.has(proposed) ? globalMax + 1 : proposed;

    await db.insert(quizQuestions).values({
      question: validated.question,
      category: validated.category,
      options: JSON.stringify(validated.options),
      correct: validated.correct,
      sortOrder: nextSortOrder,
      createdAt: now,
      updatedAt: now,
    });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg === 'Unauthorized' || msg === 'Forbidden') {
      return { success: false, message: msg };
    }
    return { success: false, message: msg };
  }
}

export async function updateQuizQuestion(
  id: number,
  data: { question: unknown; category: unknown; options: unknown; correct: unknown },
  sessionId: string | null | undefined
): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin(sessionId);
    if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid question id');
    const validated = validateQuestionInput(data);
    const now = new Date().toISOString();
    await db.update(quizQuestions).set({
      question: validated.question,
      category: validated.category,
      options: JSON.stringify(validated.options),
      correct: validated.correct,
      updatedAt: now,
    }).where(eq(quizQuestions.id, id));

    // Soft-invalidate any recorded attempts for this question so that
    // historical per-option indices are not silently compared against the
    // (possibly reordered or replaced) new option list.
    await db.update(quizAttempts)
      .set({ invalidatedAt: now } as never)
      .where(eq(quizAttempts.questionId, id));

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: msg };
  }
}

export async function deleteQuizQuestion(
  id: number,
  sessionId: string | null | undefined
): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin(sessionId);
    if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid question id');

    await db.delete(quizQuestions).where(eq(quizQuestions.id, id));

    // Compact sort_order globally so values remain sequential (0..N-1).
    // sort_order is a global ordering used across all categories, so we must
    // renumber all remaining questions together to avoid gaps or duplicates.
    const remaining = await db
      .select({ id: quizQuestions.id })
      .from(quizQuestions)
      .orderBy(asc(quizQuestions.sortOrder), asc(quizQuestions.id));

    if (remaining.length > 0) {
      const now = new Date().toISOString();
      await Promise.all(
        remaining.map((row, index) =>
          db
            .update(quizQuestions)
            .set({ sortOrder: index, updatedAt: now })
            .where(eq(quizQuestions.id, row.id))
        )
      );
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: msg };
  }
}

// ---------------------------------------------------------------------------
// Quiz attempt tracking (public — no auth required)
// ---------------------------------------------------------------------------

/**
 * Record a user's answer for a specific question.
 * Accepts the selected option index; correctness is derived server-side from
 * the stored question record so the client cannot fabricate results.
 */
export async function recordQuizAttempt(
  questionId: number,
  selectedOption: number
): Promise<void> {
  if (!Number.isInteger(questionId) || questionId <= 0) return;
  if (!Number.isInteger(selectedOption) || selectedOption < 0) return;

  // Fetch the question to validate it exists and derive correctness server-side
  const questionRows = await db
    .select({ correct: quizQuestions.correct, options: quizQuestions.options })
    .from(quizQuestions)
    .where(eq(quizQuestions.id, questionId));
  const question = questionRows[0];
  if (!question) return; // unknown question id — ignore silently

  const optionCount = (JSON.parse(question.options) as unknown[]).length;
  if (selectedOption >= optionCount) return; // out-of-range index — ignore

  const isCorrect = selectedOption === question.correct;

  await db.insert(quizAttempts).values({
    questionId,
    correct: isCorrect ? 1 : 0,
    selectedOption,
    attemptedAt: new Date().toISOString(),
  } as never);

  // Trim attempts older than the retention window to keep the table bounded.
  const retentionDays = await readQuizAttemptRetentionDays();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  await db.delete(quizAttempts).where(lt(quizAttempts.attemptedAt, cutoff.toISOString()));
}

export interface QuizAttemptStat {
  questionId: number;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number; // 0-100
  /** optionCounts[i] = number of times option index i was selected (only from non-invalidated attempts) */
  optionCounts: number[];
  /**
   * True when one or more attempts were invalidated because the question was
   * edited after those attempts were recorded. The per-option breakdown is
   * hidden for invalidated attempts to avoid misleading stats.
   */
  hasStaleAttempts: boolean;
}

/**
 * Return per-question attempt stats for all questions that have at least one attempt.
 * Includes a per-option breakdown showing how many times each answer was chosen.
 * Requires a valid admin session.
 */
export async function getQuizAttemptStats(
  sessionId: string | null | undefined
): Promise<QuizAttemptStat[]> {
  await requireAdmin(sessionId);

  // Aggregate total/correct per question (all attempts, including invalidated ones).
  // The `correct` boolean was derived server-side at attempt time and remains
  // meaningful even after a question edit.
  const summaryRows = await db
    .select({
      questionId: quizAttempts.questionId,
      totalAttempts: sql<number>`count(*)`,
      correctAttempts: sql<number>`sum(${quizAttempts.correct})`,
      staleAttempts: sql<number>`sum(case when ${quizAttempts.invalidatedAt} is not null then 1 else 0 end)`,
    })
    .from(quizAttempts)
    .groupBy(quizAttempts.questionId);

  // Aggregate per-option counts only for non-invalidated attempts so the
  // breakdown remains accurate against the current option list.
  const optionRows = await db
    .select({
      questionId: quizAttempts.questionId,
      selectedOption: quizAttempts.selectedOption,
      count: sql<number>`count(*)`,
    })
    .from(quizAttempts)
    .where(sql`${quizAttempts.selectedOption} IS NOT NULL AND ${quizAttempts.invalidatedAt} IS NULL`)
    .groupBy(quizAttempts.questionId, quizAttempts.selectedOption);

  // Build a map: questionId -> { optionIndex -> count }
  const optionMap = new Map<number, Map<number, number>>();
  for (const row of optionRows) {
    if (row.selectedOption === null || row.selectedOption === undefined) continue;
    if (!optionMap.has(row.questionId)) {
      optionMap.set(row.questionId, new Map());
    }
    optionMap.get(row.questionId)!.set(row.selectedOption, Number(row.count) || 0);
  }

  // Fetch option counts per question to know how many options each question has
  const questionRows = await db
    .select({ id: quizQuestions.id, options: quizQuestions.options })
    .from(quizQuestions);
  const optionCountMap = new Map<number, number>();
  for (const q of questionRows) {
    try {
      optionCountMap.set(q.id, (JSON.parse(q.options) as unknown[]).length);
    } catch {
      optionCountMap.set(q.id, 4);
    }
  }

  return summaryRows.map((r) => {
    const total = Number(r.totalAttempts) || 0;
    const correct = Number(r.correctAttempts) || 0;
    const stale = Number(r.staleAttempts) || 0;
    const numOptions = optionCountMap.get(r.questionId) ?? 4;
    const byOption = optionMap.get(r.questionId) ?? new Map();
    const optionCounts = Array.from({ length: numOptions }, (_, i) => byOption.get(i) ?? 0);
    return {
      questionId: r.questionId,
      totalAttempts: total,
      correctAttempts: correct,
      successRate: total > 0 ? Math.round((correct / total) * 100) : 0,
      optionCounts,
      hasStaleAttempts: stale > 0,
    };
  });
}

/**
 * Delete all attempt history for a specific question.
 * Admin-only. Useful after significantly editing a question so stale stats
 * no longer skew the success-rate display.
 */
export async function resetQuizAttempts(
  questionId: number,
  sessionId: string | null | undefined
): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin(sessionId);
    if (!Number.isInteger(questionId) || questionId <= 0) {
      throw new Error('Invalid question id');
    }
    await db.delete(quizAttempts).where(eq(quizAttempts.questionId, questionId));
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: msg };
  }
}

/**
 * Delete only invalidated attempts for one question, preserving valid attempts.
 * Admin-only; totals and success rate are recalculated from the remaining rows.
 */
export async function resetStaleAttempts(
  questionId: number,
  sessionId: string | null | undefined
): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin(sessionId);
    if (!Number.isInteger(questionId) || questionId <= 0) {
      throw new Error('Invalid question id');
    }
    await db.delete(quizAttempts).where(and(
      eq(quizAttempts.questionId, questionId),
      isNotNull(quizAttempts.invalidatedAt),
    ));
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: msg };
  }
}

/**
 * Reorder quiz questions by saving a new sort_order for each id in the given order.
 * `orderedIds` is the full list of question IDs in the desired display order.
 */
export async function reorderQuizQuestions(
  orderedIds: number[],
  sessionId: string | null | undefined
): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin(sessionId);
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw new Error('orderedIds must be a non-empty array');
    }

    // Update each row's sort_order in sequence
    await Promise.all(
      orderedIds.map((id, index) =>
        db.update(quizQuestions)
          .set({ sortOrder: index, updatedAt: new Date().toISOString() })
          .where(eq(quizQuestions.id, id))
      )
    );
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: msg };
  }
}
