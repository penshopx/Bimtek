'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { terms, type Term } from '@/app/glosarium/page';

function matchesTerm(term: Term, query: string) {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return true;

  return [term.singkatan, term.kepanjangan, term.deskripsi].some(value =>
    value.toLowerCase().includes(normalizedQuery),
  );
}

export function GlosariumWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        setIsOpen(true);
      }

      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !selectedTerm) {
      inputRef.current?.focus();
    }
  }, [isOpen, selectedTerm]);

  const filteredTerms = useMemo(
    () => terms.filter(term => matchesTerm(term, query)),
    [query],
  );

  const openWidget = () => {
    setIsOpen(true);
    setSelectedTerm(null);
  };

  const closeWidget = () => {
    setIsOpen(false);
    setSelectedTerm(null);
    setQuery('');
  };

  const chooseTerm = (term: Term) => {
    setSelectedTerm(term);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/20 sm:bg-transparent"
          aria-hidden="true"
          onClick={closeWidget}
        />
      )}

      {isOpen && (
        <section
          aria-label="Pencarian glosarium"
          className="fixed bottom-24 left-4 right-4 z-[70] flex max-h-[min(30rem,calc(100vh-7rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:bottom-24 sm:left-auto sm:right-6 sm:w-[25rem]"
          onClick={event => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Glosarium cepat
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {terms.length} istilah SKK & konstruksi
              </p>
            </div>
            <button
              type="button"
              onClick={closeWidget}
              aria-label="Tutup glosarium"
              className="rounded-lg p-1.5 text-lg leading-none text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              ×
            </button>
          </div>

          {selectedTerm ? (
            <div className="overflow-y-auto p-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedTerm(null);
                  inputRef.current?.focus();
                }}
                className="mb-4 text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-400"
              >
                ← Kembali ke hasil
              </button>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedTerm.singkatan}
                </span>
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
                  {selectedTerm.kategori}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {selectedTerm.kepanjangan}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {selectedTerm.deskripsi}
              </p>
            </div>
          ) : (
            <>
              <div className="relative px-4 pb-3 pt-4">
                <span className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-base text-slate-400">
                  🔍
                </span>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Cari SKKNI, KUK, AJJ..."
                  aria-label="Cari istilah glosarium"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div className="overflow-y-auto px-2 pb-2">
                {filteredTerms.length > 0 ? (
                  filteredTerms.map(term => (
                    <button
                      key={term.singkatan}
                      type="button"
                      onClick={() => chooseTerm(term)}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-cyan-50 dark:hover:bg-slate-800"
                    >
                      <span className="mt-0.5 min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                          {term.singkatan}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                          {term.kepanjangan}
                        </span>
                      </span>
                      <span className="mt-1 text-slate-300 dark:text-slate-600">›</span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Tidak ada istilah yang cocok.
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={isOpen ? closeWidget : openWidget}
        aria-label={isOpen ? 'Tutup glosarium' : 'Buka glosarium'}
        aria-expanded={isOpen}
        title="Glosarium cepat (Ctrl/Cmd+G)"
        className="fixed bottom-20 right-4 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-500 text-xl shadow-lg shadow-cyan-950/20 transition-all hover:scale-105 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:border-cyan-400/30 dark:bg-cyan-600 dark:hover:bg-cyan-500 dark:focus:ring-offset-slate-900 sm:bottom-6 sm:right-6"
      >
        {isOpen ? '×' : '📖'}
      </button>
    </>
  );
}