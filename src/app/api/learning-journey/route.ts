import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { learningJourneyProgress } from '@/db/schema';
import { emptyJourneyProgress } from '@/lib/learning-journey';
import {
  mergeJourneyProgress,
  parseJourneyProgress,
} from '@/lib/learning-journey-storage';
import {
  boundedEvidenceBody,
  evidenceError,
  evidenceSameOrigin,
  evidenceUser,
} from '@/server/evidenceAccess';

export const runtime = 'nodejs';
const MAX_PROGRESS_BYTES = 256 * 1024;
const noStore = { 'Cache-Control': 'private, no-store' };

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
