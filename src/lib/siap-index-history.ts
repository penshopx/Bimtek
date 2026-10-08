export const SIAP_HISTORY_KEY = 'siapskk_siap_index_history';
export const SIAP_HISTORY_LIMIT = 10;
export const SIAP_DIMENSION_IDS = [
  'knowledge', 'application', 'evidence', 'communication',
  'simulation', 'consistency', 'evidence_prep', 'learning_progress',
] as const;

export type DimensionId = typeof SIAP_DIMENSION_IDS[number];
export interface SiapHistoryEntry {
  timestamp: string;
  dimensionScores: Record<DimensionId, number>;
  overallScore: number;
}

// Saved dimension scores use the same 0–100 scale as the result view.
export function parseSiapHistory(raw: string | null): SiapHistoryEntry[] {
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('Format riwayat tidak valid');
  const valid = parsed.filter((entry): entry is SiapHistoryEntry => {
    if (!entry || typeof entry !== 'object') return false;
    const value = entry as Partial<SiapHistoryEntry>;
    const isScore = (score: unknown) =>
      typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100;
    return typeof value.timestamp === 'string' &&
      Number.isFinite(Date.parse(value.timestamp)) &&
      isScore(value.overallScore) &&
      !!value.dimensionScores &&
      SIAP_DIMENSION_IDS.every(id => isScore(value.dimensionScores?.[id]));
  });
  if (valid.length !== parsed.length) throw new Error('Data riwayat tidak lengkap atau rusak');
  return valid.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)).slice(-SIAP_HISTORY_LIMIT);
}

export function appendSiapHistory(
  history: SiapHistoryEntry[],
  entry: SiapHistoryEntry,
): SiapHistoryEntry[] {
  return [...history, entry].slice(-SIAP_HISTORY_LIMIT);
}

export function mergeSiapHistory(
  stored: SiapHistoryEntry[],
  session: SiapHistoryEntry[],
): SiapHistoryEntry[] {
  const entries = new Map(stored.map(entry => [entry.timestamp, entry]));
  for (const entry of session) entries.set(entry.timestamp, entry);
  return [...entries.values()]
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
    .slice(-SIAP_HISTORY_LIMIT);
}
