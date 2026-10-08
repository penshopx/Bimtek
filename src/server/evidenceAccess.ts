import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '@/db';
import { sessions, users } from '@/db/schema';
import { MAX_EVIDENCE_BYTES } from '@/lib/evidence';

export async function evidenceUser(request: NextRequest) {
  const id = request.headers.get('x-session-id') || request.cookies.get('sessionId')?.value;
  if (!id || id.length > 200) return null;
  const rows = await db.select({ userId: sessions.userId }).from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date().toISOString()))).limit(1);
  return rows[0]?.userId ?? null;
}

export function evidenceError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function evidenceSameOrigin(request: NextRequest) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === (request.headers.get('host') || request.nextUrl.host); }
  catch { return false; }
}

export async function boundedEvidenceBody(request: NextRequest, limit = MAX_EVIDENCE_BYTES + 65536) {
  if (Number(request.headers.get('content-length')) > limit) throw new Error('Permintaan terlalu besar.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Berkas belum dipilih.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > limit) { await reader.cancel(); throw new Error('Permintaan terlalu besar.'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
