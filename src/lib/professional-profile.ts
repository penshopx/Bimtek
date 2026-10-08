import { SKK_JABATAN } from './skkData';

export const PROFESSIONAL_PROFILE_KEY = 'siapskk_profil_profesional';
export const EMPTY_PROFILE = {
  nama: '', jabatan: '', pendidikan: '', pengalaman: '',
  skkJabatan: '', lsp: '', terbit: '', berakhir: '',
  targetJabatan: '', jenjang: '', timeline: '',
};
export type ProfessionalProfile = typeof EMPTY_PROFILE;
export type ProfileField = keyof ProfessionalProfile;

export function parseProfessionalProfile(raw: string | null): ProfessionalProfile {
  if (!raw) return { ...EMPTY_PROFILE };
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Format profil tidak valid');
  }
  const result = { ...EMPTY_PROFILE };
  for (const key of Object.keys(result) as ProfileField[]) {
    const value = (parsed as Record<string, unknown>)[key];
    if (typeof value === 'string') result[key] = value;
  }
  return result;
}

export function jabatanName(value: string): string {
  return SKK_JABATAN.find(j => j.id === value)?.name ?? value;
}

export function jabatanCode(value: string): string {
  return SKK_JABATAN.find(j => j.name === value)?.id ?? value;
}

export function profileCompleteness(profile: ProfessionalProfile): number {
  const values = Object.values(profile);
  return Math.round(values.filter(value => value.trim() !== '').length / values.length * 100);
}

export function profileContext(profile: ProfessionalProfile): string {
  return [
    profile.nama && `Nama: ${profile.nama}`,
    profile.jabatan && `Jabatan: ${profile.jabatan}`,
    profile.pendidikan && `Pendidikan: ${profile.pendidikan}`,
    profile.pengalaman && `Pengalaman: ${profile.pengalaman} tahun`,
    profile.skkJabatan && `SKK saat ini: ${profile.skkJabatan}`,
    profile.lsp && `LSP: ${profile.lsp}`,
    profile.terbit && `Terbit SKK: ${profile.terbit}`,
    profile.berakhir && `Berakhir SKK: ${profile.berakhir}`,
    profile.targetJabatan && `Target SKK: ${profile.targetJabatan}`,
    profile.jenjang && `Target jenjang: ${profile.jenjang}`,
    profile.timeline && `Target tanggal asesmen: ${profile.timeline}`,
  ].filter(Boolean).join('. ');
}

export function profileToolHref(path: string, profile: ProfessionalProfile): string {
  const params = new URLSearchParams({
    profil: '1',
    jenjang: profile.jenjang, timeline: profile.timeline,
  });
  const target = profile.targetJabatan.trim();
  if (target) params.set('jabatan', jabatanCode(target));
  if (path === '/skk-coach/chat') params.set('agent', 'kelayakan');
  return `${path}?${params.toString()}`;
}
