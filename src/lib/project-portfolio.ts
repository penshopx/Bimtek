import { getJabatanById } from './skkData';

export interface ProjectPortfolioInput {
  name: string;
  clientName: string;
  location: string;
  role: string;
  targetJabatanId: string;
  startedYear: string;
  completedYear: string;
  description: string;
  outcomes: string;
  evidenceIds: string[];
}

function boundedText(value: unknown, maxLength: number, required = false): string {
  if (typeof value !== 'string') throw new Error('Format data proyek tidak valid.');
  const normalized = value.trim();
  if (normalized.length > maxLength || (required && !normalized)) {
    throw new Error('Periksa kembali isian proyek dan batas panjangnya.');
  }
  return normalized;
}

function optionalYear(value: unknown): string {
  const year = boundedText(value, 4);
  if (year && !/^\d{4}$/.test(year)) throw new Error('Tahun proyek harus berupa empat angka.');
  if (year && (Number(year) < 1900 || Number(year) > new Date().getFullYear() + 10)) {
    throw new Error('Tahun proyek di luar rentang yang wajar.');
  }
  return year;
}

export function validateProjectPortfolioInput(value: unknown): ProjectPortfolioInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Format data proyek tidak valid.');
  }
  const data = value as Record<string, unknown>;
  const name = boundedText(data.name, 120, true);
  const clientName = boundedText(data.clientName ?? '', 120);
  const location = boundedText(data.location ?? '', 120);
  const role = boundedText(data.role, 120, true);
  const targetJabatanId = boundedText(data.targetJabatanId ?? '', 100);
  if (targetJabatanId && !getJabatanById(targetJabatanId)) {
    throw new Error('Target jabatan tidak ditemukan di katalog persiapan.');
  }
  const startedYear = optionalYear(data.startedYear ?? '');
  const completedYear = optionalYear(data.completedYear ?? '');
  if (startedYear && completedYear && Number(startedYear) > Number(completedYear)) {
    throw new Error('Tahun selesai tidak boleh lebih awal dari tahun mulai.');
  }
  const description = boundedText(data.description, 3000, true);
  const outcomes = boundedText(data.outcomes ?? '', 2000);
  if (!Array.isArray(data.evidenceIds) || data.evidenceIds.length > 20 ||
    !data.evidenceIds.every(id => typeof id === 'string' && id.length > 0 && id.length <= 100)) {
    throw new Error('Daftar bukti proyek tidak valid.');
  }
  const evidenceIds = [...new Set(data.evidenceIds as string[])];
  if (evidenceIds.length !== data.evidenceIds.length) {
    throw new Error('Bukti yang sama tidak dapat ditautkan dua kali.');
  }
  return {
    name, clientName, location, role, targetJabatanId,
    startedYear, completedYear, description, outcomes, evidenceIds,
  };
}

export function parseProjectEvidenceIds(serialized: string): string[] {
  try {
    const parsed: unknown = JSON.parse(serialized);
    return Array.isArray(parsed) && parsed.every(id => typeof id === 'string') ? parsed : [];
  } catch {
    return [];
  }
}
