'use client';

import { useMemo, useState } from 'react';
import {
  constructionCatalog,
  constructionCatalogSource,
  constructionClassifications,
  filterConstructionCatalog,
  standardNeedsConfirmation,
} from '@/lib/constructionCatalog';

const PAGE_SIZE = 24;

type CatalogFilters = {
  search: string;
  classification: string;
  subclassification: string;
  qualification: string;
  level: string;
  scope: string;
};

const initialFilters: CatalogFilters = {
  search: '',
  classification: '',
  subclassification: '',
  qualification: '',
  level: '',
  scope: 'umum',
};

const controlClass =
  'h-11 w-full rounded-md border border-[#bac9d9] bg-white px-3 text-sm text-[#10253d] outline-none transition focus:border-[#0876c9] focus:ring-2 focus:ring-[#0876c9]/20';

export default function ConstructionCatalog() {
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selectedClassification = constructionClassifications.find(
    (item) => item.name === filters.classification,
  );
  const subclassifications = selectedClassification?.subclassifications ?? [];

  const qualifications = useMemo(
    () => [...new Set(constructionCatalog.map((entry) => entry.qualification).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id')),
    [],
  );

  const filteredEntries = useMemo(
    () => filterConstructionCatalog(filters),
    [filters],
  );
  const pageCount = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleEntries = filteredEntries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeFilterCount = [
    filters.search,
    filters.classification,
    filters.subclassification,
    filters.qualification,
    filters.level,
    filters.scope !== 'umum' ? filters.scope : '',
  ].filter(Boolean).length;

  const updateFilter = (key: keyof CatalogFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === 'classification' ? { subclassification: '' } : {}),
    }));
    setPage(1);
    setExpandedId(null);
  };

  const clearFilters = () => {
    setFilters({ ...initialFilters });
    setPage(1);
    setExpandedId(null);
  };

  const sourceUrl = constructionCatalogSource.url;

  return (
    <main className="min-h-[100dvh] bg-[#edf4fa] text-[#10253d]">
      <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-7 sm:py-10 lg:px-10">
        <header className="relative overflow-hidden rounded-xl bg-[#102a46] px-6 py-7 text-white shadow-[0_14px_36px_rgba(20,48,76,0.14)] sm:px-9 sm:py-9">
          <div aria-hidden="true" className="absolute -right-12 -top-20 h-72 w-72 rounded-full border-[1px] border-[#4b83b1]/30" />
          <div aria-hidden="true" className="absolute -right-1 top-0 h-56 w-56 rounded-full border-[1px] border-[#4b83b1]/20" />
          <div className="relative max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-[#59b8f4] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#09243e]">
                SIAP SKK · Ruang belajar
              </span>
              <span className="text-xs font-medium text-[#c3d7e8]">Katalog referensi jabatan kerja</span>
            </div>
            <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-[42px]">
              Kenali jabatan dan skema sertifikasi konstruksi.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#d3e2ee] sm:text-base">
              Gunakan katalog ini untuk belajar dan menemukan rujukan awal. SIAP SKK bukan asesor resmi dan katalog ini bukan penetapan kelayakan sertifikasi.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 pt-5 text-xs text-[#c3d7e8]">
              <span className="font-semibold text-white">{constructionCatalog.length} entri</span>
              <span>{constructionClassifications.length} klasifikasi</span>
              <span>Snapshot {constructionCatalogSource.document}</span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-semibold text-[#7bc9ff] underline decoration-[#7bc9ff]/50 underline-offset-4 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7bc9ff]"
              >
                Buka dokumen sumber <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </header>

        <section aria-labelledby="filter-heading" className="mt-6 rounded-xl border border-[#c9d8e5] bg-[#f8fbfe] p-5 shadow-[0_5px_18px_rgba(26,59,89,0.05)] sm:p-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#d9e4ed] pb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1476b8]">Pencarian katalog</p>
              <h2 id="filter-heading" className="mt-1 text-xl font-semibold tracking-[-0.02em]">Saring jabatan kerja</h2>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md px-3 py-2 text-sm font-semibold text-[#176da8] underline decoration-[#83b9dc] underline-offset-4 transition hover:bg-[#e8f4fc] focus:outline-none focus:ring-2 focus:ring-[#0876c9]"
            >
              Atur ulang{activeFilterCount > 0 ? ` · ${activeFilterCount} filter` : ''}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 xl:grid-cols-12">
            <label className="block xl:col-span-4">
              <span className="mb-1.5 block text-xs font-bold text-[#314c67]">Cari jabatan, skema, standar</span>
              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Contoh: manajer konstruksi"
                className={controlClass}
              />
            </label>
            <label className="block xl:col-span-3">
              <span className="mb-1.5 block text-xs font-bold text-[#314c67]">Klasifikasi</span>
              <select value={filters.classification} onChange={(event) => updateFilter('classification', event.target.value)} className={controlClass}>
                <option value="">Semua klasifikasi</option>
                {constructionClassifications.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
            </label>
            <label className="block xl:col-span-3">
              <span className="mb-1.5 block text-xs font-bold text-[#314c67]">Subklasifikasi</span>
              <select
                value={filters.subclassification}
                onChange={(event) => updateFilter('subclassification', event.target.value)}
                className={controlClass}
                disabled={!filters.classification}
              >
                <option value="">{filters.classification ? 'Semua subklasifikasi' : 'Pilih klasifikasi dahulu'}</option>
                {subclassifications.map((subclassification) => <option key={subclassification} value={subclassification}>{subclassification}</option>)}
              </select>
            </label>
            <label className="block xl:col-span-2">
              <span className="mb-1.5 block text-xs font-bold text-[#314c67]">Jenjang KKNI</span>
              <select value={filters.level} onChange={(event) => updateFilter('level', event.target.value)} className={controlClass}>
                <option value="">Semua jenjang</option>
                {[...new Set(constructionCatalog.map((entry) => entry.level))].sort((a, b) => a - b).map((level) => (
                  <option key={level} value={String(level)}>Level {level}</option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-1 xl:col-span-4">
              <span className="mb-1.5 block text-xs font-bold text-[#314c67]">Kualifikasi</span>
              <select value={filters.qualification} onChange={(event) => updateFilter('qualification', event.target.value)} className={controlClass}>
                <option value="">Semua kualifikasi</option>
                {qualifications.map((qualification) => <option key={qualification} value={qualification}>{qualification}</option>)}
              </select>
            </label>
            <fieldset className="md:col-span-1 xl:col-span-8">
              <legend className="mb-1.5 text-xs font-bold text-[#314c67]">Ruang lingkup katalog</legend>
              <div className="flex h-11 flex-wrap items-center gap-x-5 gap-y-1 rounded-md border border-[#bac9d9] bg-white px-3 sm:gap-x-7">
                {[
                  { value: 'umum', label: 'Umum', hint: 'dipilih' },
                  { value: 'asn', label: 'ASN', hint: 'khusus' },
                  { value: '', label: 'Semua', hint: 'umum + ASN' },
                ].map((scope) => (
                  <label key={scope.value || 'all'} className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#213c57]">
                    <input
                      type="radio"
                      name="catalog-scope"
                      value={scope.value}
                      checked={filters.scope === scope.value}
                      onChange={() => updateFilter('scope', scope.value)}
                      className="h-4 w-4 accent-[#0876c9]"
                    />
                    <span className="font-semibold">{scope.label}</span>
                    <span className="hidden text-xs text-[#6a7e91] sm:inline">{scope.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section aria-labelledby="results-heading" className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1476b8]">Hasil pencarian</p>
              <h2 id="results-heading" className="mt-1 text-2xl font-semibold tracking-[-0.03em]">Jabatan kerja &amp; skema</h2>
            </div>
            <p className="text-sm font-medium text-[#4e6479]">
              {filteredEntries.length === 0
                ? 'Tidak ada entri yang cocok'
                : `Menampilkan ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredEntries.length)} dari ${filteredEntries.length} entri`}
            </p>
          </div>

          {visibleEntries.length > 0 ? (
            <div className="space-y-3">
              {visibleEntries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                const needsConfirmation = standardNeedsConfirmation(entry);
                return (
                  <article key={entry.id} className="overflow-hidden rounded-lg border border-[#c8d7e4] bg-[#f9fcff] shadow-[0_3px_12px_rgba(26,59,89,0.045)]">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`entry-details-${entry.id}`}
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="group flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition hover:bg-[#f1f8fd] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0876c9] sm:items-center sm:px-6"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-sm bg-[#dceeff] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.09em] text-[#105d94]">KKNI {entry.level}</span>
                          <span className="text-xs font-medium text-[#597188]">{entry.classification} <span aria-hidden="true">/</span> {entry.subclassification}</span>
                        </span>
                        <span className="block text-lg font-semibold leading-snug tracking-[-0.02em] text-[#10253d]">{entry.jobTitle}</span>
                        <span className="mt-1 block text-sm leading-5 text-[#4e6479]">
                          <span className="font-semibold text-[#304c66]">Skema:</span> {entry.schemeName}
                        </span>
                      </span>
                      <span aria-hidden="true" className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#c4d8e8] text-sm font-bold text-[#176da8] transition-transform ${isExpanded ? 'rotate-180 bg-[#e7f4fd]' : 'bg-white group-hover:bg-[#e7f4fd]'}`}>
                        ↓
                      </span>
                    </button>

                    {isExpanded && (
                      <div id={`entry-details-${entry.id}`} className="border-t border-[#d9e5ee] bg-[#f3f8fc] px-5 py-5 sm:px-6">
                        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#61778c]">Kualifikasi</dt>
                            <dd className="mt-1 text-sm font-semibold leading-5 text-[#193651]">{entry.qualification || 'Tidak tercantum'}</dd>
                          </div>
                          <div>
                            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#61778c]">Jenjang</dt>
                            <dd className="mt-1 text-sm font-semibold text-[#193651]">KKNI Level {entry.level}</dd>
                          </div>
                          <div>
                            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#61778c]">Ruang lingkup</dt>
                            <dd className="mt-1 text-sm font-semibold text-[#193651]">{entry.scope === 'asn' ? 'ASN (khusus)' : 'Umum'}</dd>
                          </div>
                          <div>
                            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#61778c]">Identitas</dt>
                            <dd className="mt-1 break-all font-mono text-xs font-semibold text-[#193651]">ID internal katalog: {entry.id}</dd>
                          </div>
                        </dl>

                        <div className="mt-5 border-t border-[#d6e2ec] pt-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#61778c]">Standar rujukan</p>
                          <p className="mt-1 text-sm leading-6 text-[#193651]">{entry.standard || 'Belum tercantum pada transkripsi sumber.'}</p>
                          {needsConfirmation && (
                            <p className="mt-2 inline-flex rounded-sm border border-[#e4c886] bg-[#fff7df] px-2.5 py-1.5 text-xs font-semibold leading-5 text-[#674b11]">
                              Standar perlu dikonfirmasi pada skema LSP terkini.
                            </p>
                          )}
                        </div>

                        {entry.notes && (
                          <div className="mt-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#61778c]">Catatan sumber</p>
                            <p className="mt-1 text-sm leading-6 text-[#304c66]">{entry.notes}</p>
                          </div>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#d6e2ec] pt-4">
                          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#61778c]">Halaman sumber</span>
                          {entry.sourcePages.length > 0 ? entry.sourcePages.map((pdfPage) => (
                            <a
                              key={pdfPage}
                              href={`${sourceUrl}#page=${pdfPage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-[#096daf] underline decoration-[#8cb9d8] underline-offset-4 hover:text-[#084d7c] focus:outline-none focus:ring-2 focus:ring-[#0876c9]"
                            >
                              PDF hlm. {pdfPage} <span className="font-normal text-[#5d7184]">(lampiran hlm. {pdfPage - 6})</span>
                            </a>
                          )) : <span className="text-sm text-[#61778c]">Halaman tidak tercatat.</span>}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#9fb9ce] bg-[#f8fbfe] px-6 py-12 text-center">
              <span aria-hidden="true" className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dceeff] text-xl font-semibold text-[#176da8]">?</span>
              <h3 className="mt-4 text-lg font-semibold text-[#10253d]">Belum ada entri untuk pilihan ini</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#526a80]">
                Sebagian subklasifikasi belum memiliki jabatan pada transkripsi katalog ini. Coba ubah filter atau tampilkan kembali semua hasil.
              </p>
              <button type="button" onClick={clearFilters} className="mt-5 rounded-md bg-[#0876c9] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#075e9f] focus:outline-none focus:ring-2 focus:ring-[#0876c9] focus:ring-offset-2">
                Tampilkan hasil umum
              </button>
            </div>
          )}

          {filteredEntries.length > PAGE_SIZE && (
            <nav aria-label="Navigasi halaman katalog" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#c8d7e4] bg-[#f9fcff] px-4 py-3">
              <p className="text-sm text-[#526a80]">Halaman <span className="font-bold text-[#10253d]">{currentPage}</span> dari {pageCount}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setPage((current) => Math.max(1, current - 1)); setExpandedId(null); }}
                  disabled={currentPage === 1}
                  className="rounded-md border border-[#bac9d9] bg-white px-3 py-2 text-sm font-semibold text-[#24445f] transition hover:bg-[#edf6fc] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={() => { setPage((current) => Math.min(pageCount, current + 1)); setExpandedId(null); }}
                  disabled={currentPage === pageCount}
                  className="rounded-md border border-[#bac9d9] bg-white px-3 py-2 text-sm font-semibold text-[#24445f] transition hover:bg-[#edf6fc] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Berikutnya
                </button>
              </div>
            </nav>
          )}
        </section>

        <aside aria-label="Catatan penggunaan katalog" className="mt-8 rounded-xl border border-[#b9cede] bg-[#e2eff8] px-5 py-5 sm:px-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#12669e]">Baca sebelum menggunakan</p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#10253d]">Referensi belajar, bukan keputusan asesmen</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#294761]">
                <li>• Ini adalah snapshot dari {constructionCatalogSource.document}, tanggal 4 Desember 2024; transkripsi lampiran belum memverifikasi skema LSP terkini.</li>
                <li>• Pendidikan, pengalaman kerja, serta UK/KUK tidak disimpulkan dari entri. Periksa persyaratan pada skema dan LSP terkait.</li>
                <li>• Entri ASN ditampilkan terpisah; gunakan filter ruang lingkup untuk membandingkannya.</li>
                <li>• Lampiran III tentang program akselerasi fresh graduate belum diimpor ke katalog.</li>
              </ul>
            </div>
            <div className="flex flex-col justify-between gap-4 border-t border-[#bfd3e2] pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#526c83]">Cakupan sumber</p>
                <p className="mt-2 text-sm leading-6 text-[#294761]">{constructionCatalogSource.coverage}</p>
              </div>
              <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-md border border-[#719bb8] bg-[#f8fbfe] px-3.5 py-2.5 text-sm font-bold text-[#125f91] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0876c9]">
                Lihat SK DJBK No. 114 <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
