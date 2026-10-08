export const klinikJenjangOptions = [
  { value: 7, label: 'Ahli Muda — Jenjang 7' },
  { value: 8, label: 'Ahli Madya — Jenjang 8' },
  { value: 9, label: 'Ahli Utama — Jenjang 9' },
  { value: 4, label: 'Teknisi/Analis — Jenjang 4' },
  { value: 5, label: 'Teknisi/Analis — Jenjang 5' },
  { value: 6, label: 'Teknisi/Analis — Jenjang 6' },
  { value: 1, label: 'Operator — Jenjang 1' },
  { value: 2, label: 'Operator — Jenjang 2' },
  { value: 3, label: 'Operator — Jenjang 3' },
] as const;

export interface KlinikTarget {
  jabatan: string;
  jenjang: number;
  jenjangLabel: string;
}

type TargetResult = { ok: true; target: KlinikTarget } | { ok: false; error: string };

export function matchesKlinikTarget(value: unknown, target: KlinikTarget): boolean {
  if (!value || typeof value !== 'object') return false;
  const received = value as Partial<KlinikTarget>;
  return received.jabatan === target.jabatan && received.jenjang === target.jenjang && received.jenjangLabel === target.jenjangLabel;
}

// Do not infer an official scheme or silently migrate old labels/ranges.
export function validateKlinikTarget(jabatan: unknown, jenjang: unknown): TargetResult {
  if (typeof jabatan !== 'string' || !jabatan.trim() || jabatan.trim().length > 240) {
    return { ok: false, error: 'Isi satu jabatan kerja yang dituju (maksimal 240 karakter).' };
  }
  const option = klinikJenjangOptions.find(item => item.value === jenjang);
  if (typeof jenjang !== 'number' || !Number.isInteger(jenjang) || !option) {
    return { ok: false, error: 'Pilih ulang satu angka jenjang 1–9. Label lama atau rentang jenjang tidak dapat digunakan.' };
  }
  const title = jabatan.trim();
  const rankLevels: Record<string, number> = { muda: 7, madya: 8, utama: 9 };
  const ranks = [...title.toLowerCase().matchAll(/\bahli\b[^,;\n]*?\b(muda|madya|utama)\b/g)];
  const expected = new Set(ranks.map(match => rankLevels[match[1]]));
  if (expected.size > 1) {
    return { ok: false, error: 'Tulis satu jabatan dan satu kualifikasi ahli yang dituju.' };
  }
  if (expected.size === 1 && !expected.has(jenjang)) {
    return { ok: false, error: `Jenjang tidak sesuai dengan kualifikasi pada nama jabatan. Ahli Muda = 7, Ahli Madya = 8, Ahli Utama = 9. Pilih ulang target Anda.` };
  }
  return { ok: true, target: { jabatan: title, jenjang, jenjangLabel: option.label } };
}
