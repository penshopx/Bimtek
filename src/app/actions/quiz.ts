'use server';

import { db } from '@/db';
import { quizQuestions, sessions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface QuizQuestion {
  id: number;
  question: string;
  category: string;
  options: string[];
  correct: number;
  createdAt: string;
  updatedAt: string;
}

type RawRow = {
  id: number;
  question: string;
  category: string;
  options: string;
  correct: number;
  createdAt: string;
  updatedAt: string;
};

function parseRow(row: RawRow): QuizQuestion {
  return { ...row, options: JSON.parse(row.options) };
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
    ? await db.select().from(quizQuestions).where(eq(quizQuestions.category, category))
    : await db.select().from(quizQuestions);
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
    await db.insert(quizQuestions).values({
      question: validated.question,
      category: validated.category,
      options: JSON.stringify(validated.options),
      correct: validated.correct,
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
    await db.update(quizQuestions).set({
      question: validated.question,
      category: validated.category,
      options: JSON.stringify(validated.options),
      correct: validated.correct,
      updatedAt: new Date().toISOString(),
    }).where(eq(quizQuestions.id, id));
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
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: msg };
  }
}
