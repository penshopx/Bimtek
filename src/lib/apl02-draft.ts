export const APL02_DRAFT_KEY = 'siapskk:apl02-draft:v1';

export interface Apl02Unit {
  kode: string;
  nama: string;
  elemen: string[];
  pengalaman: string;
}

export interface Apl02Form {
  step: number;
  selectedId: string;
  namaAsesi: string;
  pendidikan: string;
  pengalaman: string;
  units: Apl02Unit[];
}

export const EMPTY_APL02_FORM: Apl02Form = {
  step: 1,
  selectedId: '',
  namaAsesi: '',
  pendidikan: '',
  pengalaman: '',
  units: [],
};

export function hasApl02Answers(form: Apl02Form): boolean {
  return Boolean(form.selectedId || form.namaAsesi || form.pendidikan || form.pengalaman || form.units.length);
}

export function serializeApl02Draft(form: Apl02Form): string {
  // Generated output can be recreated; retain the original answers for editing.
  return JSON.stringify({ version: 1, ...form, step: form.step === 3 ? 2 : form.step });
}

export function parseApl02Draft(raw: string, positionIds: string[]): Apl02Form {
  const data = JSON.parse(raw);
  if (
    !data || data.version !== 1 ||
    ![1, 2].includes(data.step) ||
    typeof data.selectedId !== 'string' ||
    (data.selectedId !== '' && !positionIds.includes(data.selectedId)) ||
    typeof data.namaAsesi !== 'string' ||
    typeof data.pendidikan !== 'string' ||
    typeof data.pengalaman !== 'string' ||
    !Array.isArray(data.units) ||
    !data.units.every((unit: unknown) => {
      if (!unit || typeof unit !== 'object') return false;
      const u = unit as Record<string, unknown>;
      return typeof u.kode === 'string' && typeof u.nama === 'string' &&
        typeof u.pengalaman === 'string' && Array.isArray(u.elemen) &&
        u.elemen.every((element: unknown) => typeof element === 'string');
    }) ||
    (data.step === 2 && (!data.selectedId || !data.namaAsesi.trim() || !data.units.length))
  ) {
    throw new Error('Draft tidak valid');
  }
  return {
    step: data.step,
    selectedId: data.selectedId,
    namaAsesi: data.namaAsesi,
    pendidikan: data.pendidikan,
    pengalaman: data.pengalaman,
    units: data.units,
  };
}
