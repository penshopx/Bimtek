import { afterEach, describe, expect, test } from 'bun:test';
import {
  analyzeCertifyProfile, EMPTY_CERTIFY_PROFILE, parseCertifyResult,
  profileStepError, restoreCertifyProfile, type CertifyProfile,
} from './certify-intake';

const profile: CertifyProfile = {
  name: 'Peserta Uji', currentPosition: 'Pelaksana', education: 'S1',
  educationMajor: 'Teknik Sipil', yearsExperience: '3.5', field: 'Gedung',
  projects: 'Pengawasan struktur gedung', targetPosition: 'Ahli Muda Teknik Bangunan Gedung',
  level: '7', hasPreviousSkk: 'no', previousSkk: '',
};
const result = {
  status: 'needs_verification', summary: 'Konfirmasi skema target dengan LSP.',
  reasons: ['Pengalaman di bidang gedung.'], verification: ['Verifikasi pendidikan dan pengalaman.'],
  documents: [{ name: 'Laporan proyek', guidance: 'Siapkan bukti pengawasan struktur gedung.' }],
};
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

describe('SIAP Certify intake', () => {
  test('memvalidasi seluruh langkah, pengalaman nol/desimal dan SKK lama', () => {
    expect(profileStepError(EMPTY_CERTIFY_PROFILE, 0)).not.toBeNull();
    for (let step = 0; step < 3; step++) expect(profileStepError(profile, step)).toBeNull();
    expect(profileStepError({ ...profile, yearsExperience: '0', projects: 'Belum ada proyek' }, 1)).toBeNull();
    for (const yearsExperience of ['-1', '81', 'Infinity', 'abc']) {
      expect(profileStepError({ ...profile, yearsExperience }, 1)).not.toBeNull();
    }
    expect(profileStepError({ ...profile, level: '10' }, 2)).not.toBeNull();
    expect(profileStepError({ ...profile, hasPreviousSkk: 'yes' }, 2)).not.toBeNull();
    expect(profileStepError({ ...profile, hasPreviousSkk: 'yes', previousSkk: 'Jenjang 6, berlaku' }, 2)).toBeNull();
  });

  test('profil tersimpan hanya dipulihkan jika bentuknya aman', () => {
    expect(restoreCertifyProfile(JSON.parse(JSON.stringify(profile)))).toEqual(profile);
    for (const value of [null, [], {}, { ...profile, yearsExperience: 3 }, { ...profile, name: 'a'.repeat(2001) }]) {
      expect(restoreCertifyProfile(value)).toBeNull();
    }
  });

  test('menerima ketiga status tetapi menolak hasil kosong atau malformed', () => {
    for (const status of ['potentially_eligible', 'needs_verification', 'potentially_ineligible']) {
      expect(parseCertifyResult(JSON.stringify({ ...result, status })).status).toBe(status);
    }
    expect(parseCertifyResult('```json\n' + JSON.stringify(result) + '\n```')).toEqual(result);
    for (const value of [null, { ...result, status: 'certified' }, { ...result, documents: [] },
      { ...result, reasons: [] }, { ...result, verification: [] }, { ...result, documents: [{ name: 'KTP' }] }]) {
      expect(() => parseCertifyResult(JSON.stringify(value))).toThrow();
    }
    expect(() => parseCertifyResult('teks tanpa JSON')).toThrow();
  });

  test('menggunakan kontrak chat yang nyata tanpa mengirim nama atau SKK yang tidak relevan', async () => {
    let requestBody: Record<string, unknown> | undefined;
    globalThis.fetch = (async (url, init) => {
      expect(url).toBe('/api/ai/chat');
      requestBody = JSON.parse(String(init?.body));
      return Response.json({ choices: [{ message: { content: JSON.stringify(result) } }] });
    }) as typeof fetch;
    expect(await analyzeCertifyProfile({ ...profile, previousSkk: 'Data lama tersembunyi' })).toEqual(result);
    const messages = requestBody!.messages as { role: string; content: string }[];
    expect(messages.map(message => message.role)).toEqual(['system', 'user']);
    const context = JSON.parse(messages[1].content);
    expect(context.name).toBeUndefined();
    expect(context.targetPosition).toBe(profile.targetPosition);
    expect(context.previousSkk).toBe('');
  });

  test('gangguan AI dan hasil tidak lengkap ditolak, bukan dianggap eligible', async () => {
    globalThis.fetch = (async () => Response.json({ error: 'unavailable' }, { status: 503 })) as typeof fetch;
    await expect(analyzeCertifyProfile(profile)).rejects.toThrow('Isian Anda tetap ada');
    globalThis.fetch = (async () => Response.json({ choices: [] })) as typeof fetch;
    await expect(analyzeCertifyProfile(profile)).rejects.toThrow('AI belum memberikan hasil');
    globalThis.fetch = (async () => Response.json({ choices: [{ message: { content: '{}' } }] })) as typeof fetch;
    await expect(analyzeCertifyProfile(profile)).rejects.toThrow('belum lengkap');
  });
});
