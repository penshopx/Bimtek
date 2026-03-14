'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  name: string;
  email: string;
  company: string;
  position: string;
  targetLevel: string;
}

interface UserProgress {
  bimtekCompleted: string[];
  quizBestScores: Record<string, number>;
  totalPKB: number;
  favoriteModules: string[];
}

const bimtekModules = [
  { id: 'sipil-gedung-1', title: 'Teknik Fondasi Gedung', category: 'Sipil Gedung', pkb: 10 },
  { id: 'sipil-gedung-2', title: 'Struktur Beton Bertulang', category: 'Sipil Gedung', pkb: 12 },
  { id: 'sipil-gedung-3', title: 'Struktur Baja Gedung', category: 'Sipil Gedung', pkb: 12 },
  { id: 'k3-1', title: 'K3 Konstruksi Gedung', category: 'K3', pkb: 15 },
  { id: 'k3-2', title: 'Pencegahan Kecelakaan Kerja', category: 'K3', pkb: 10 },
  { id: 'k3-3', title: 'APD dan Penangannya', category: 'K3', pkb: 6 },
  { id: 'k3-4', title: 'P3K di Tempat Kerja', category: 'K3', pkb: 8 },
  { id: 'k3-5', title: 'Keselamatan Kerja Tinggi', category: 'K3', pkb: 10 },
  { id: 'k3-6', title: 'Proteksi Kebakaran', category: 'K3', pkb: 8 },
  { id: 'jalan-1', title: 'Desain Jalan Raya', category: 'Jalan', pkb: 12 },
  { id: 'jalan-2', title: 'Perkerasan Jalan', category: 'Jalan', pkb: 10 },
  { id: 'jalan-3', title: 'Jembatan Beton', category: 'Jalan', pkb: 12 },
  { id: 'elektrikal-1', title: 'Instalasi Listrik Gedung', category: 'Elektrikal', pkb: 12 },
  { id: 'elektrikal-2', title: 'Sistem Proteksi Listrik', category: 'Elektrikal', pkb: 10 },
  { id: 'mekanikal-1', title: 'Plumbing Gedung', category: 'Mekanikal', pkb: 10 },
  { id: 'mekanikal-2', title: 'Sistem Sprinkler', category: 'Mekanikal', pkb: 8 },
  { id: 'manajemen-1', title: 'Manajemen Proyek Konstruksi', category: 'Manajemen', pkb: 15 },
  { id: 'manajemen-2', title: 'Cost Control Proyek', category: 'Manajemen', pkb: 12 },
  { id: 'rab-1', title: 'Penyusunan RAB', category: 'RAB', pkb: 12 },
  { id: 'rab-2', title: 'Analisa Harga Satuan', category: 'RAB', pkb: 10 },
  { id: 'quality-1', title: 'Quality Control Beton', category: 'Quality', pkb: 10 },
  { id: 'digital-1', title: 'Autocad untuk Konstruksi', category: 'Digital', pkb: 10 },
  { id: 'digital-2', title: 'BIM Fundamental', category: 'Digital', pkb: 15 },
];

export function ProgressExporter() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('bimtekProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    const savedCompleted = localStorage.getItem('bimtekCompleted');
    const savedQuizScores = localStorage.getItem('quizBestScores');
    const savedFavorites = localStorage.getItem('favoriteModules');

    const completed = savedCompleted ? JSON.parse(savedCompleted) : [];
    const quizScores = savedQuizScores ? JSON.parse(savedQuizScores) : {};
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

    const pkb = completed.reduce((sum: number, id: string) => {
      const mod = bimtekModules.find(m => m.id === id);
      return sum + (mod?.pkb || 0);
    }, 0);

    setProgress({
      bimtekCompleted: completed,
      quizBestScores: quizScores,
      totalPKB: pkb,
      favoriteModules: favorites,
    });
  }, []);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      window.print();
      setExporting(false);
      setIsOpen(false);
    }, 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 flex items-center justify-center gap-2"
      >
        📄 Export Progress
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            📄 Export Progress Report
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Preview dan print progress belajar Anda
          </p>
        </div>

        <div className="p-6 space-y-4 print:block">
          <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-4">
            <h1 className="text-2xl font-bold text-amber-600">BimtekKita</h1>
            <p className="text-slate-500">Laporan Progress Pelatihan</p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Data Peserta</h3>
            <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg text-sm">
              <p><strong>Nama:</strong> {profile?.name || '-'}</p>
              <p><strong>Perusahaan:</strong> {profile?.company || '-'}</p>
              <p><strong>Posisi:</strong> {profile?.position || '-'}</p>
              <p><strong>Target:</strong> {profile?.targetLevel || '-'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Ringkasan Progress</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-slate-500">Total PKB</p>
                <p className="text-xl font-bold text-amber-600">{progress?.totalPKB || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-slate-500">Modul Selesai</p>
                <p className="text-xl font-bold text-green-600">{progress?.bimtekCompleted.length || 0}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-slate-500">Quiz Taken</p>
                <p className="text-xl font-bold text-blue-600">{Object.keys(progress?.quizBestScores || {}).length}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-slate-500">Favorit</p>
                <p className="text-xl font-bold text-purple-600">{progress?.favoriteModules.length || 0}</p>
              </div>
            </div>
          </div>

          {progress?.bimtekCompleted.length ? (
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Modul yang Telah Selesai</h3>
              <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg text-sm max-h-40 overflow-y-auto">
                {progress.bimtekCompleted.map((id) => {
                  const mod = bimtekModules.find(m => m.id === id);
                  return (
                    <div key={id} className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-600 last:border-0">
                      <span>{mod?.title}</span>
                      <span className="text-amber-600">+{mod?.pkb} PKB</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
            Dicetak pada: {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-2 print:hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            Batal
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50"
          >
            {exporting ? 'Membuka...' : '🖨️ Print / Save PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
