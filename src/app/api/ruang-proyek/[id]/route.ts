import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { participantEvidence, projectPortfolios } from '@/db/schema';
import { validateProjectPortfolioInput } from '@/lib/project-portfolio';
import {
  boundedEvidenceBody,
  evidenceError,
  evidenceSameOrigin,
  evidenceUser,
} from '@/server/evidenceAccess';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
const noStore = { 'Cache-Control': 'private, no-store' };

async function readInput(request: NextRequest) {
  const bytes = await boundedEvidenceBody(request, 64 * 1024);
  return validateProjectPortfolioInput(JSON.parse(bytes.toString('utf8')));
}

async function ownedProject(request: NextRequest, context: Context) {
  const userId = await evidenceUser(request);
  if (!userId) return { error: evidenceError('Sesi berakhir. Masuk kembali untuk melanjutkan.', 401) };
  const { id } = await context.params;
  const condition = and(eq(projectPortfolios.id, id), eq(projectPortfolios.userId, userId));
  const [project] = await db.select().from(projectPortfolios).where(condition).limit(1);
  if (!project) return { error: evidenceError('Proyek tidak ditemukan.', 404) };
  return { project, condition, userId };
}

export async function PATCH(request: NextRequest, context: Context) {
  if (!evidenceSameOrigin(request)) return evidenceError('Permintaan lintas situs ditolak.', 403);
  try {
    const owned = await ownedProject(request, context);
    if (owned.error) return owned.error;
    let input;
    try { input = await readInput(request); }
    catch (error) { return evidenceError(error instanceof Error ? error.message : 'Data proyek tidak valid.', 400); }
    if (input.evidenceIds.length) {
      const rows = await db.select({ id: participantEvidence.id }).from(participantEvidence)
        .where(eq(participantEvidence.userId, owned.userId));
      const evidence = new Set(rows.map(row => row.id));
      if (!input.evidenceIds.every(id => evidence.has(id))) {
        return evidenceError('Salah satu bukti tidak tersedia di akun Anda.', 400);
      }
    }
    await db.update(projectPortfolios)
      .set({ ...input, evidenceIds: JSON.stringify(input.evidenceIds), updatedAt: new Date().toISOString() })
      .where(owned.condition);
    return NextResponse.json({ success: true }, { headers: noStore });
  } catch {
    return evidenceError('Perubahan proyek belum tersimpan. Coba lagi.', 503);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  if (!evidenceSameOrigin(request)) return evidenceError('Permintaan lintas situs ditolak.', 403);
  try {
    const owned = await ownedProject(request, context);
    if (owned.error) return owned.error;
    await db.delete(projectPortfolios).where(owned.condition);
    return NextResponse.json({ success: true }, { headers: noStore });
  } catch {
    return evidenceError('Proyek belum dapat dihapus. Coba lagi.', 503);
  }
}
