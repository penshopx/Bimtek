import { describe, expect, test } from 'bun:test';
import { MAX_EVIDENCE_BYTES, safeEvidenceName, validateEvidenceFile, validateEvidenceMetadata } from './evidence';

describe('Validasi Ruang Bukti', () => {
  test('PDF, PNG, JPEG, dan TXT diperiksa isi dan tipenya', () => {
    expect(validateEvidenceFile('bukti.pdf', 'application/pdf', Buffer.from('%PDF-1.7'))).toBe('application/pdf');
    expect(validateEvidenceFile('bukti.png', 'image/png', Uint8Array.from([137,80,78,71,13,10,26,10]))).toBe('image/png');
    expect(validateEvidenceFile('bukti.jpg', 'image/jpeg', Uint8Array.from([255,216,255]))).toBe('image/jpeg');
    expect(validateEvidenceFile('bukti.txt', 'text/plain', Buffer.from('Bukti pengalaman'))).toBe('text/plain');
    expect(validateEvidenceFile('bukti.txt', 'text/plain;charset=utf-8', Buffer.from('Bukti pengalaman'))).toBe('text/plain');
    expect(() => validateEvidenceFile('palsu.pdf', 'application/pdf', Buffer.from('<script>'))).toThrow();
    expect(() => validateEvidenceFile('bukti.exe', '', Buffer.from('MZ'))).toThrow();
    expect(() => validateEvidenceFile('bukti.txt', 'text/plain', Uint8Array.from([0,255]))).toThrow();
    expect(() => validateEvidenceFile('bukti.pdf', 'image/png', Buffer.from('%PDF-1.7'))).toThrow();
  });
  test('Berkas kosong atau terlalu besar ditolak', () => {
    expect(() => validateEvidenceFile('bukti.txt', '', new Uint8Array())).toThrow();
    expect(() => validateEvidenceFile('bukti.txt', '', new Uint8Array(MAX_EVIDENCE_BYTES + 1))).toThrow();
  });
  test('Metadata hanya menerima kategori dan konteks yang dikenal', () => {
    const valid = { category: 'pengalaman', contexts: ['portofolio', 'portofolio'], note: '', period: '2025' };
    expect(validateEvidenceMetadata(valid).contexts).toEqual(['portofolio']);
    expect(() => validateEvidenceMetadata({ ...valid, category: 'kompeten' })).toThrow();
    expect(() => validateEvidenceMetadata({ ...valid, contexts: ['resmi'] })).toThrow();
    expect(() => validateEvidenceMetadata({ ...valid, note: 'a'.repeat(2001) })).toThrow();
    expect(() => validateEvidenceMetadata({ ...valid, period: null })).toThrow();
  });
  test('Nama asli tidak digunakan sebagai path', () => {
    expect(safeEvidenceName('../../private/a\n.txt')).not.toContain('/');
    expect(safeEvidenceName('a'.repeat(500))).toHaveLength(200);
  });
});
