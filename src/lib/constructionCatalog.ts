import catalog from '@/data/construction-catalog.json';

export interface ConstructionCatalogEntry {
  /** Stable internal ID, not an official occupation code. */
  id: string;
  classification: string;
  subclassification: string;
  jobTitle: string;
  schemeName: string;
  level: number;
  qualification: string;
  standard: string;
  notes: string;
  scope: string;
  sourcePages: number[];
}

export const constructionCatalog: ConstructionCatalogEntry[] = catalog.entries;
export const constructionClassifications = catalog.classifications;
export const constructionCatalogSource = catalog.source;

export interface CatalogFilters {
  search?: string;
  classification?: string;
  subclassification?: string;
  qualification?: string;
  level?: string;
  scope?: string;
}

export function filterConstructionCatalog(filters: CatalogFilters) {
  const terms = (filters.search ?? '').toLocaleLowerCase('id').trim().split(/\s+/).filter(Boolean);
  return constructionCatalog.filter(entry => {
    const text = [entry.jobTitle, entry.schemeName, entry.classification, entry.subclassification, entry.standard].join(' ').toLocaleLowerCase('id');
    return terms.every(term => text.includes(term))
      && (!filters.classification || entry.classification === filters.classification)
      && (!filters.subclassification || entry.subclassification === filters.subclassification)
      && (!filters.qualification || entry.qualification === filters.qualification)
      && (!filters.level || entry.level === Number(filters.level))
      && (!filters.scope || entry.scope === filters.scope);
  });
}

export function standardNeedsConfirmation(entry: ConstructionCatalogEntry) {
  return !entry.standard || /akan|proses|skema/i.test(entry.standard);
}
