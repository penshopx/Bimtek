import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { participantEvidence } from '@/db/schema';
import { boundedEvidenceBody, evidenceError, evidenceSameOrigin, evidenceUser } from '@/server/evidenceAccess';
import { evidenceStorage } from '@/server/evidenceStorage';
import { validateEvidenceMetadata } from '@/lib/evidence';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };

async function owned(request: NextRequest, context: Context) {
  const userId = await evidenceUser(request);
  if (!userId) return { error: evidenceError('Silakan masuk untuk mengakses bukti.', 401) };
  const { id } = await context.params;
  const condition = and(eq(participantEvidence.id, id), eq(participantEvidence.userId, userId));
  const rows = await db.select().from(participantEvidence).where(condition).limit(1);
  if (!rows[0]) return { error: evidenceError('Bukti tidak ditemukan.', 404) };
  return { row: rows[0], condition };
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const result = await owned(request, context);
    if (result.error) return result.error;
    const store = await evidenceStorage();
    const download = await store.downloadAsBytes(result.row.objectKey);
    if (!download.ok) return evidenceError('Berkas belum dapat diunduh. Silakan coba lagi.', 503);
    return new NextResponse(new Uint8Array(download.value[0]), { headers: {
      'Content-Type': result.row.mime,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(result.row.originalName)}`,
      'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "sandbox; default-src 'none'",
    } });
  } catch { return evidenceError('Penyimpanan belum dapat diakses.', 503); }
}

export async function PATCH(request: NextRequest, context: Context) {
  if (!evidenceSameOrigin(request)) return evidenceError('Permintaan lintas situs ditolak.', 403);
  try {
    const result = await owned(request, context);
    if (result.error) return result.error;
    let metadata;
    try { metadata = validateEvidenceMetadata(JSON.parse((await boundedEvidenceBody(request, 16384)).toString('utf8'))); }
    catch { return evidenceError('Metadata tidak valid. Periksa kategori, konteks, dan panjang catatan.', 400); }
    await db.update(participantEvidence).set({ ...metadata, contexts: JSON.stringify(metadata.contexts), updatedAt: new Date().toISOString() }).where(result.condition);
    return NextResponse.json({ success: true });
  } catch { return evidenceError('Perubahan belum tersimpan. Silakan coba lagi.', 503); }
}

export async function DELETE(request: NextRequest, context: Context) {
  if (!evidenceSameOrigin(request)) return evidenceError('Permintaan lintas situs ditolak.', 403);
  try {
    const result = await owned(request, context);
    if (result.error) return result.error;
    const store = await evidenceStorage();
    const deletion = await store.delete(result.row.objectKey, { ignoreNotFound: true });
    if (!deletion.ok) return evidenceError('Penghapusan berkas gagal. Silakan coba lagi.', 503);
    await db.delete(participantEvidence).where(result.condition);
    return NextResponse.json({ success: true });
  } catch { return evidenceError('Bukti belum dapat dihapus. Silakan coba lagi.', 503); }
}
