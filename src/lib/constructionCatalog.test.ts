import { describe, expect, test } from 'bun:test';
import {
  constructionCatalog,
  constructionCatalogSource,
  constructionClassifications,
  filterConstructionCatalog,
  standardNeedsConfirmation,
} from './constructionCatalog';

describe('SK DJBK 114/2024 source catalog', () => {
  test('snapshot contains unique internal records and eight classifications', () => {
    expect(constructionCatalog).toHaveLength(478);
    expect(new Set(constructionCatalog.map(entry => entry.id)).size).toBe(478);
    expect(constructionClassifications).toHaveLength(8);
    expect(constructionClassifications.reduce((sum, item) => sum + item.subclassifications.length, 0)).toBe(51);
  });

  test('every entry belongs to its taxonomy and has a valid source page', () => {
    for (const entry of constructionCatalog) {
      const parent = constructionClassifications.find(item => item.name === entry.classification);
      expect(parent?.subclassifications).toContain(entry.subclassification);
      expect(entry.level).toBeGreaterThanOrEqual(1);
      expect(entry.level).toBeLessThanOrEqual(9);
      expect(entry.sourcePages.length).toBeGreaterThan(0);
      expect(entry.sourcePages.every(page => page >= 7 && page <= 130)).toBe(true);
      expect(entry.id.startsWith('djbk114-')).toBe(true);
      expect(entry.jobTitle).not.toBe('-');
      expect(entry.schemeName).not.toBe('-');
    }
  });

  test('Gedung expert ranks use new nomenclature and levels 7/8/9', () => {
    const entries = filterConstructionCatalog({classification: 'Sipil', subclassification: 'Gedung', search: 'Ahli Teknik Bangunan Gedung'});
    expect(entries.map(entry => entry.level)).toEqual([7, 8, 9]);
    expect(entries.map(entry => entry.schemeName)).toEqual([
      'Ahli Muda Teknik Bangunan Gedung', 'Ahli Madya Teknik Bangunan Gedung', 'Ahli Utama Teknik Bangunan Gedung',
    ]);
    expect(entries.every(entry => entry.sourcePages.includes(10))).toBe(true);
  });

  test('general and ASN scopes remain distinct', () => {
    expect(filterConstructionCatalog({scope: 'umum'})).toHaveLength(465);
    expect(filterConstructionCatalog({scope: 'asn'})).toHaveLength(13);
    expect(filterConstructionCatalog({scope: ''})).toHaveLength(478);
  });

  test('classification, subclassification, qualification and numeric level intersect', () => {
    const entries = filterConstructionCatalog({classification: 'Sipil', subclassification: 'Gedung', qualification: 'Ahli', level: '7', scope: 'umum'});
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every(entry => entry.level === 7 && entry.qualification === 'Ahli' && entry.subclassification === 'Gedung')).toBe(true);
    expect(filterConstructionCatalog({classification: 'Arsitektur', subclassification: 'Gedung'})).toHaveLength(0);
  });

  test('search is case-insensitive, handles whitespace and standard references', () => {
    expect(filterConstructionCatalog({search: '  aHLI   GEDUNG   '})).toEqual(filterConstructionCatalog({search: 'ahli gedung'}));
    expect(filterConstructionCatalog({search: '192-2016'}).some(entry => entry.jobTitle === 'Ahli Teknik Bangunan Gedung')).toBe(true);
    expect(filterConstructionCatalog({search: 'unmatched-nonexistent-role'})).toHaveLength(0);
  });

  test('taxonomies with no occupation do not invent placeholder jobs', () => {
    expect(filterConstructionCatalog({classification: 'Sains Dan Rekayasa Teknik', subclassification: 'Peledakan'})).toHaveLength(0);
  });

  test('pending or absent standards get an explicit confirmation flag', () => {
    expect(standardNeedsConfirmation({...constructionCatalog[0], standard: ''})).toBe(true);
    expect(standardNeedsConfirmation({...constructionCatalog[0], standard: 'Akan disusun SKKNI'})).toBe(true);
    expect(standardNeedsConfirmation({...constructionCatalog[0], standard: 'SKKNI 192-2016'})).toBe(false);
    expect(constructionCatalogSource.coverage).toContain('Lampiran III');
  });
});
