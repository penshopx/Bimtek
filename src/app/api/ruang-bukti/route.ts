import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { db } from '@/db';
import { participantEvidence } from '@/db/schema';
import { boundedEvidenceBody, evidenceError, evidenceSameOrigin, evidenceUser } from '@/server/evidenceAccess';
import { evidenceStorage } from '@/server/evidenceStorage';
import { safeEvidenceName, validateEvidenceFile, validateEvidenceMetadata } from '@/lib/evidence';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const userId = await evidenceUser(request);
    if (!userId) return evidenceError('Silakan masuk untuk mengakses Ruang Bukti.', 401);
    const rows = await db.select().from(participantEvidence).where(eq(participantEvidence.userId, userId)).orderBy(desc(participantEvidence.createdAt));
    let storageAvailable = false;
    try { await evidenceStorage(); storageAvailable = true; } catch { /* Report dependency explicitly. */ }
    return NextResponse.json({
      items: rows.map(({ objectKey: _key, userId: _owner, ...row }) => ({ ...row, contexts: JSON.parse(row.contexts), status: 'tersimpan' })),
      storageAvailable,
      storageMessage: storageAvailable ? null : 'Penyimpanan berkas belum tersedia. Unggah dan unduh belum dapat digunakan.',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return evidenceError('Ruang Bukti belum dapat dimuat. Silakan coba lagi.', 503); }
}

export async function POST(request: NextRequest) {
  if (!evidenceSameOrigin(request)) return evidenceError('Permintaan lintas situs ditolak.', 403);
  let objectKey: string | undefined;
  let store: Awaited<ReturnType<typeof evidenceStorage>> | undefined;
  try {
    const userId = await evidenceUser(request);
    if (!userId) return evidenceError('Silakan masuk untuk mengunggah bukti.', 401);
    let form: FormData;
    try {
      const body = await boundedEvidenceBody(request);
      form = await new Request('http://internal/upload', { method: 'POST', headers: { 'content-type': request.headers.get('content-type') || '' }, body }).formData();
    } catch { return evidenceError('Unggahan tidak valid atau melebihi batas 10 MB.', 413); }
    const file = form.get('file');
    if (!file || typeof file === 'string') return evidenceError('Pilih berkas terlebih dahulu.', 400);
    let metadata, mime, bytes: Uint8Array;
    try {
      metadata = validateEvidenceMetadata(JSON.parse(String(form.get('metadata'))));
      bytes = new Uint8Array(await file.arrayBuffer());
      mime = validateEvidenceFile(file.name, file.type, bytes);
    } catch (error) { return evidenceError(error instanceof Error ? error.message : 'Data tidak valid.', 400); }
    try { store = await evidenceStorage(); }
    catch { return evidenceError('Penyimpanan belum tersedia. Berkas belum diunggah; coba lagi setelah penyimpanan diaktifkan.', 503); }
    const id = randomUUID();
    objectKey = `participant-evidence/${id}`;
    const upload = await store.uploadFromBytes(objectKey, Buffer.from(bytes));
    if (!upload.ok) return evidenceError('Unggah gagal. Berkas belum tercatat; silakan coba lagi.', 503);
    const now = new Date().toISOString();
    await db.insert(participantEvidence).values({
      id, userId, objectKey, originalName: safeEvidenceName(file.name), mime, size: bytes.length,
      ...metadata, contexts: JSON.stringify(metadata.contexts), createdAt: now, updatedAt: now,
    });
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch {
    if (store && objectKey) { try { await store.delete(objectKey, { ignoreNotFound: true }); } catch { /* No private data in logs. */ } }
    return evidenceError('Bukti gagal disimpan. Silakan coba lagi.', 503);
  }
}
