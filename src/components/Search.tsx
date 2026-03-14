'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface SearchResult {
  type: 'module' | 'quiz' | 'article' | 'position' | 'tool';
  title: string;
  description: string;
  url: string;
}

const searchData: SearchResult[] = [
  { type: 'module', title: 'Teknik Fondasi Gedung', description: 'BIMTEK - Sipil Gedung', url: '/bimtek/sipil-gedung-1' },
  { type: 'module', title: 'Struktur Beton Bertulang', description: 'BIMTEK - Sipil Gedung', url: '/bimtek/sipil-gedung-2' },
  { type: 'module', title: 'Struktur Baja Gedung', description: 'BIMTEK - Sipil Gedung', url: '/bimtek/sipil-gedung-3' },
  { type: 'module', title: 'K3 Konstruksi Gedung', description: 'BIMTEK - K3', url: '/bimtek/k3-1' },
  { type: 'module', title: 'Desain Jalan Raya', description: 'BIMTEK - Jalan', url: '/bimtek/jalan-1' },
  { type: 'module', title: 'Instalasi Listrik Gedung', description: 'BIMTEK - Elektrikal', url: '/bimtek/elektrikal-1' },
  { type: 'module', title: 'Plumbing Gedung', description: 'BIMTEK - Mekanikal', url: '/bimtek/mekanikal-1' },
  { type: 'module', title: 'Manajemen Proyek Konstruksi', description: 'BIMTEK - Manajemen', url: '/bimtek/manajemen-1' },
  { type: 'module', title: 'Penyusunan RAB', description: 'BIMTEK - RAB', url: '/bimtek/rab-1' },
  { type: 'module', title: 'BIM Fundamental', description: 'BIMTEK - Digital', url: '/bimtek/digital-3' },
  { type: 'quiz', title: 'Simulasi Quiz Konstruksi', description: '60+ soal persiapan sertifikasi', url: '/quiz' },
  { type: 'tool', title: 'Kalkulator RAB', description: 'Tools - Rencana Anggaran Biaya', url: '/tools' },
  { type: 'tool', title: 'Mix Design Calculator', description: 'Tools - Desain Campuran Beton', url: '/tools' },
  { type: 'tool', title: 'Beam Calculator', description: 'Solver - Kalkulator Balok', url: '/solver' },
  { type: 'tool', title: 'Column Calculator', description: 'Solver - Kalkulator Kolom', url: '/solver' },
  { type: 'tool', title: 'Foundation Calculator', description: 'Solver - Kalkulator Pondasi', url: '/solver' },
  { type: 'article', title: 'Peraturan Pemerintah No. 14 Tahun 2021', description: 'Knowledge Base - Regulasi', url: '/knowledge-base' },
  { type: 'article', title: 'SNI 1726:2019 - Ketahanan Gempa', description: 'Knowledge Base - Standar', url: '/knowledge-base' },
  { type: 'article', title: 'SNI 2847:2019 - Beton', description: 'Knowledge Base - Standar', url: '/knowledge-base' },
  { type: 'article', title: 'UU No. 2/2017 - Jasa Konstruksi', description: 'Knowledge Base - Regulasi', url: '/knowledge-base' },
  { type: 'article', title: 'SKKNI Konstruksi', description: 'Knowledge Base - Sertifikasi', url: '/knowledge-base' },
  { type: 'article', title: 'ISO 9001:2015 - Manajemen Mutu', description: 'Knowledge Base - Manajemen', url: '/knowledge-base' },
  { type: 'position', title: 'Ahli Teknik Bangunan Gedung', description: 'Sertifikasi - Level Ahli', url: '/sertifikasi' },
  { type: 'position', title: 'Ahli Teknik Sipil', description: 'Sertifikasi - Level Ahli', url: '/sertifikasi' },
  { type: 'position', title: 'Ahli Elektrikal', description: 'Sertifikasi - Level Ahli', url: '/sertifikasi' },
  { type: 'position', title: 'Manager Proyek', description: 'Sertifikasi - Level Manager', url: '/sertifikasi' },
  { type: 'position', title: 'K3 Konstruksi', description: 'Sertifikasi - Level Ahli', url: '/sertifikasi' },
];

const typeIcons: Record<string, string> = {
  module: '🎓',
  quiz: '✍️',
  tool: '🔧',
  article: '📚',
  position: '📋',
};

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = searchData.filter(
      item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
    );
    setResults(filtered.slice(0, 10));
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari modul, quiz, tools, artikel..."
              className="flex-1 bg-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400"
            />
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 rounded">
              ESC
            </kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-lg mb-2">🔍</p>
              <p>Ketik minimal 2 karakter untuk mencari</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-lg mb-2">😕</p>
              <p>Tidak ada hasil untuk &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result, index) => (
                <Link
                  key={index}
                  href={result.url}
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="text-2xl">{typeIcons[result.type]}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800 dark:text-white">{result.title}</h4>
                    <p className="text-sm text-slate-500">{result.description}</p>
                  </div>
                  <span className="text-xs text-slate-400 capitalize">{result.type}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tekan <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Enter</kbd> untuk pilih</span>
            <span>{results.length} hasil</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="hidden sm:inline">Cari...</span>
      <kbd className="hidden md:inline-block px-1.5 py-0.5 text-xs bg-slate-600 rounded">⌘K</kbd>
    </button>
  );
}
