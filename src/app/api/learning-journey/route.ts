import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { learningJourneyProgress } from '@/db/schema';
import { emptyJourneyProgress, JOURNEY_LESSONS } from '@/lib/learning-journey';
import {
  mergeJourneyProgress,
  parseJourneyProgress,
  type JourneySyncOperation,
} from '@/lib/learning-journey-storage';
import { bimtekModules } from '@/lib/bimtekCatalog';
import {
  boundedEvidenceBody,
  evidenceError,
  evidenceSameOrigin,
  evidenceUser,
} from '@/server/evidenceAccess';

export const runtime = 'nodejs';
const MAX_PROGRESS_BYTES = 256 * 1024;
const noStore = { 'Cache-Control': 'private, no-store' };
const moduleIds = new Set(bimtekModules.map(module => module.id));
const blockedKeys = new Set(['__proto__', 'constructor', 'prototype']);

function parseOperation(value: unknown): JourneySyncOperation {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid operation');
  const operation = value as Record<string, unknown>;
  if (operation.type === 'module' || operation.type === 'lesson') {
    if (typeof operation.moduleId !== 'string' || !moduleIds.has(operation.moduleId) ||
      typeof operation.completed !== 'boolean') throw new Error('Invalid module operation');
    if (operation.type === 'module') {
      return { type: 'module', moduleId: operation.moduleId, completed: operation.completed };
    }
    if (typeof operation.lesson !== 'string' ||
      !JOURNEY_LESSONS.some(lesson => lesson === operation.lesson)) {
      throw new Error('Invalid lesson operation');
    }
    return {
      type: 'lesson',
      moduleId: operation.moduleId,
      lesson: operation.lesson,
      completed: operation.completed,
    };
  }
  if (operation.type === 'quiz' && Array.isArray(operation.results) &&
    operation.results.length > 0 && operation.results.length <= 100) {
    const results = operation.results.map((result: unknown) => {
      if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('Invalid quiz result');
      const item = result as Record<string, unknown>;
      if (typeof item.category !== 'string' || !item.category.trim() || item.category.length > 200 ||
        blockedKeys.has(item.category) ||
        !Number.isSafeInteger(item.total) || !Number.isSafeInteger(item.score) ||
        (item.total as number) <= 0 || (item.score as number) < 0 ||
        (item.score as number) > (item.total as number)) {
        throw new Error('Invalid quiz result');
      }
      return {
        category: item.category,
        total: item.total as number,
        score: item.score as number,
      };
    });
    return { type: 'quiz', results };
  }
  throw new Error('Invalid operation');
}

async function saveOperation(userId: string, operation: JourneySyncOperation) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await db.transaction(async tx => {
        const [row] = await tx.select().from(learningJourneyProgress)
          .where(eq(learningJourneyProgress.userId, userId)).limit(1);
        const progress = row
          ? parseJourneyProgress(JSON.parse(row.progress))
          : emptyJourneyProgress();
        const now = new Date().toISOString();

        if (operation.type === 'module') {
          const previous = progress.modules[operation.moduleId];
          progress.modules[operation.moduleId] = {
            completed: operation.completed,
            updatedAt: now,
            lessons: previous?.lessons ?? [],
          };
        } else if (operation.type === 'lesson') {
          const previous = progress.modules[operation.moduleId];
          const lessons = new Set(previous?.lessons ?? []);
          if (operation.completed) lessons.add(operation.lesson);
          else lessons.delete(operation.lesson);
          progress.modules[operation.moduleId] = {
            completed: lessons.size === JOURNEY_LESSONS.length,
            updatedAt: now,
            lessons: [...lessons],
          };
        } else {
          for (const result of operation.results) {
            progress.quizzes[result.category] = {
              completedAt: now, total: result.total, score: result.score,
            };
          }
        }

        const serialized = JSON.stringify(progress);
        if (row) {
          await tx.update(learningJourneyProgress)
            .set({ progress: serialized, updatedAt: now })
            .where(eq(learningJourneyProgress.userId, userId));
        } else {
          await tx.insert(learningJourneyProgress).values({ userId, progress: serialized, updatedAt: now });
        }
        return progress;
      });
    } catch (error) {
      const detail = error as { code?: unknown; message?: unknown };
      const busy = detail?.code === 'SQLITE_BUSY' ||
        (typeof detail?.message === 'string' && /SQLITE_BUSY|database is locked/i.test(detail.message));
      if (!busy || attempt === 3) throw error;
      await new Promise(resolve => setTimeout(resolve, 20 * (attempt + 1)));
    }
  }
  throw new Error('Progress write failed');
}

export async function GET(request: NextRequest) {
  try {
    const userId = await evidenceUser(request);
    if (!userId) return evidenceError('Silakan masuk untuk mengakses progres belajar.', 401);
    const [row] = await db.select().from(learningJourneyProgress)
      .where(eq(learningJourneyProgress.userId, userId)).limit(1);
    if (!row) {
      return NextResponse.json({
        progress: emptyJourneyProgress(), hasServerProgress: false,
      }, { headers: noStore });
    }
    const progress = parseJourneyProgress(JSON.parse(row.progress));
    return NextResponse.json({ progress, hasServerProgress: true }, { headers: noStore });
  } catch {
    return evidenceError('Progres akun belum dapat dimuat. Data browser tidak diubah; coba lagi.', 503);
  }
}

export async function PUT(request: NextRequest) {
  if (!evidenceSameOrigin(request)) return evidenceError('Permintaan lintas situs ditolak.', 403);
  try {
    const userId = await evidenceUser(request);
    if (!userId) return evidenceError('Sesi berakhir. Masuk kembali untuk menyinkronkan progres.', 401);
    if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      return evidenceError('Format data progres tidak valid.', 415);
    }

    let body: unknown;
    try {
      const bytes = await boundedEvidenceBody(request, MAX_PROGRESS_BYTES);
      body = JSON.parse(bytes.toString('utf8'));
    } catch {
      return evidenceError('Data progres tidak valid atau terlalu besar.', 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body) || !('progress' in body)) {
      return evidenceError('Data progres tidak valid.', 400);
    }

    let incoming;
    try {
      incoming = parseJourneyProgress((body as { progress: unknown }).progress);
    } catch {
      return evidenceError('Struktur progres tidak dikenali. Data akun tidak diubah.', 400);
    }

    const saved = await db.transaction(async tx => {
      const [current] = await tx.select().from(learningJourneyProgress)
        .where(eq(learningJourneyProgress.userId, userId)).limit(1);
      let merged = incoming;
      if (current) {
        merged = mergeJourneyProgress(parseJourneyProgress(JSON.parse(current.progress)), incoming);
        await tx.update(learningJourneyProgress)
          .set({ progress: JSON.stringify(merged), updatedAt: new Date().toISOString() })
          .where(eq(learningJourneyProgress.userId, userId));
      } else {
        await tx.insert(learningJourneyProgress).values({
          userId,
          progress: JSON.stringify(merged),
          updatedAt: new Date().toISOString(),
        });
      }
      return merged;
    });

    return NextResponse.json({
      progress: saved, hasServerProgress: true,
    }, { headers: noStore });
  } catch {
    return evidenceError('Progres belum tersinkron. Data browser tetap tersedia; coba lagi.', 503);
  }
}

export async function PATCH(request: NextRequest) {
  if (!evidenceSameOrigin(request)) return evidenceError('Permintaan lintas situs ditolak.', 403);
  try {
    const userId = await evidenceUser(request);
    if (!userId) return evidenceError('Sesi berakhir. Masuk kembali untuk menyimpan progres.', 401);
    if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      return evidenceError('Format perubahan progres tidak valid.', 415);
    }
    let body: unknown;
    try {
      const bytes = await boundedEvidenceBody(request, 32 * 1024);
      body = JSON.parse(bytes.toString('utf8'));
    } catch {
      return evidenceError('Perubahan progres tidak valid atau terlalu besar.', 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body) || !('operation' in body)) {
      return evidenceError('Perubahan progres tidak valid.', 400);
    }
    let operation: JourneySyncOperation;
    try {
      operation = parseOperation((body as { operation: unknown }).operation);
    } catch {
      return evidenceError('Langkah progres tidak dikenali. Data akun tidak diubah.', 400);
    }

    const progress = await saveOperation(userId, operation);
    return NextResponse.json({ progress, hasServerProgress: true }, { headers: noStore });
  } catch {
    return evidenceError('Perubahan belum tersinkron. Data browser tetap tersedia; coba lagi.', 503);
  }
}
