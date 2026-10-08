import { describe, expect, it } from 'bun:test';
import { SIAP_DIMENSION_IDS, appendSiapHistory, mergeSiapHistory, parseSiapHistory, type SiapHistoryEntry } from './siap-index-history';

function entry(index: number): SiapHistoryEntry {
  return {
    timestamp: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
    dimensionScores: Object.fromEntries(SIAP_DIMENSION_IDS.map(id => [id, 50])) as SiapHistoryEntry['dimensionScores'],
    overallScore: index,
  };
}

describe('SIAP history storage contract', () => {
  it('loads an empty history and round-trips all eight scores', () => {
    expect(parseSiapHistory(null)).toEqual([]);
    expect(parseSiapHistory(JSON.stringify([entry(0)]))).toEqual([entry(0)]);
  });

  it('rejects invalid timestamps, scores, incomplete dimensions and corrupt JSON', () => {
    for (const value of [
      '{', 'null', '{}',
      JSON.stringify([{ ...entry(0), timestamp: 'invalid' }]),
      JSON.stringify([{ ...entry(0), overallScore: 101 }]),
      JSON.stringify([{ ...entry(0), dimensionScores: { knowledge: 50 } }]),
      JSON.stringify([{ ...entry(0), dimensionScores: { ...entry(0).dimensionScores, evidence: -1 } }]),
    ]) expect(() => parseSiapHistory(value)).toThrow();
  });

  it('sorts chronologically and keeps only the latest ten results', () => {
    const entries = Array.from({ length: 12 }, (_, i) => entry(i));
    expect(parseSiapHistory(JSON.stringify([...entries].reverse()))).toEqual(entries.slice(2));
    expect(appendSiapHistory(entries.slice(0, 10), entries[10])).toEqual(entries.slice(1, 11));
  });

  it('merges browser and unsaved session results without duplicate retry entries', () => {
    expect(mergeSiapHistory([entry(0), entry(2)], [entry(0), entry(1), entry(2)]))
      .toEqual([entry(0), entry(1), entry(2)]);
  });
});
