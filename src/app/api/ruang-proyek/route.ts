import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { participantEvidence, projectPortfolios } from '@/db/schema';
import {
  parseProjectEvidenceIds,
  validateProjectPortfolioInput,
} from '@/lib/project-portfolio';
import {
  boundedEvidenceBody,
  evidenceError,
  evidenceSameOrigin,
  evidenceUser,
} from '@/server/evidenceAccess';

export const runtime = 'nodejs';
const noStore = { 'Cache-Control': 'private, no-store' };

async function readInput(request: NextRequest) {
  try {
    const bytes = await boundedEvidenceBody(request, 64 * 1024);
    return validateProjectPortfolioInput(JSON.parse(bytes.toString('utf8')));
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Data proyek tidak valid.');
  }
}

async function ownsEvidence(userId: string, evidenceIds: string[]) {
  if (!evidenceIds.length) return true;
  const rows = await db.select({ id: participantEvidence.id }).from(participantEvidence)
    .where(eq(participantEvidence.userId, userId));
  const owned = new Set(rows.map(row => row.id));
  return evidenceIds.every(id => owned.has(id));
}

export async function GET(request: NextRequest) {
  try {
    const userId = await evidenceUser(request);
    if (!userId) return evidenceError('Masuk untuk membuka portofolio proyek.', 401);
    const rows = await db.select().from(projectPortfolios)
      .where(eq(projectPortfolios.userId, userId))
      .orderBy(desc(projectPortfolios.updatedAt));
    return NextResponse.json({
      projects: rows.map(({ userId: _owner, evidenceIds, ...project }) => ({
        ...project,
        evidenceIds: parseProjectEvidenceIds(evidenceIds),
      })),
    }, { headers: noStore });
  } catch {
    return evidenceError('Portofolio proyek belum dapat dimuat. Coba lagi.', 503);
  }
}

export async function POST(request: NextRequest) {
  if (!evidenceSameOrigin(request)) return evidenceError('Permintaan lintas situs ditolak.', 403);
  try {
    const userId = await evidenceUser(request);
    if (!userId) return evidenceError('Sesi berakhir. Masuk kembali untuk menyimpan proyek.', 401);
    let input;
    try { input = await readInput(request); }
    catch (error) { return evidenceError(error instanceof Error ? error.message : 'Data proyek tidak valid.', 400); }
    if (!await ownsEvidence(userId, input.evidenceIds)) {
      return evidenceError('Salah satu bukti tidak tersedia di akun Anda.', 400);
    }
    const id = randomUUID();
    const now = new Date().toISOString();
    await db.insert(projectPortfolios).values({
      id, userId, ...input, evidenceIds: JSON.stringify(input.evidenceIds),
      createdAt: now, updatedAt: now,
    });
    return NextResponse.json({ success: true, id }, { status: 201, headers: noStore });
  } catch {
    return evidenceError('Proyek belum tersimpan. Data formulir tetap tersedia; coba lagi.', 503);
  }
}
