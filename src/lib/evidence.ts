export const evidenceCategories = ['administrasi', 'pendidikan', 'pengalaman', 'pkb', 'lainnya'] as const;
export const evidenceContexts = ['persiapan-skk', 'portofolio', 'pkb'] as const;
export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;

export type EvidenceMetadata = {
  category: string;
  contexts: string[];
  note: string;
  period: string;
};

export function validateEvidenceMetadata(input: unknown): EvidenceMetadata {
  if (!input || typeof input !== 'object') throw new Error('Metadata tidak valid.');
  const data = input as Record<string, unknown>;
  if (!evidenceCategories.includes(data.category as typeof evidenceCategories[number])) throw new Error('Kategori tidak valid.');
  if (!Array.isArray(data.contexts) || data.contexts.length > 3 ||
    !data.contexts.every(c => evidenceContexts.includes(c))) throw new Error('Konteks penggunaan tidak valid.');
  if (typeof data.note !== 'string' || data.note.length > 2000) throw new Error('Catatan maksimal 2.000 karakter.');
  if (typeof data.period !== 'string' || data.period.length > 100) throw new Error('Periode maksimal 100 karakter.');
  return { category: data.category as string, contexts: [...new Set(data.contexts)] as string[], note: data.note, period: data.period };
}

export function validateEvidenceFile(name: string, declaredType: string, bytes: Uint8Array) {
  if (!bytes.length || bytes.length > MAX_EVIDENCE_BYTES) throw new Error('Berkas harus berisi data dan maksimal 10 MB.');
  const extension = name.split('.').pop()?.toLowerCase();
  const starts = (signature: number[]) => signature.every((v, i) => bytes[i] === v);
  let mime: string;
  if (extension === 'pdf' && starts([37, 80, 68, 70, 45])) mime = 'application/pdf';
  else if (extension === 'png' && starts([137, 80, 78, 71, 13, 10, 26, 10])) mime = 'image/png';
  else if (['jpg', 'jpeg'].includes(extension ?? '') && starts([255, 216, 255])) mime = 'image/jpeg';
  else if (extension === 'txt') {
    let text: string;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch { throw new Error('TXT harus menggunakan UTF-8.'); }
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text)) throw new Error('Isi TXT tidak valid.');
    mime = 'text/plain';
  } else throw new Error('Format atau isi berkas tidak sesuai. Gunakan PDF, PNG, JPG, atau TXT.');
  const mediaType = declaredType.split(';')[0].trim().toLowerCase();
  if (mediaType && mediaType !== 'application/octet-stream' && mediaType !== mime) throw new Error('Tipe berkas tidak cocok dengan isinya.');
  return mime;
}

export function safeEvidenceName(name: string) {
  return name.replace(/[\\/\x00-\x1f\x7f]/g, '_').slice(0, 200) || 'bukti';
}
