'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
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

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const savedProfile = localStorage.getItem('bimtekProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    const savedCompleted = localStorage.getItem('bimtekCompleted');
    const savedQuizScores = localStorage.getItem('quizBestScores');
    const savedFavorites = localStorage.getItem('favoriteModules');
    const savedStreak = localStorage.getItem('learningStreak');
    const savedBookmarks = localStorage.getItem('bookmarks');

    const completed = savedCompleted ? JSON.parse(savedCompleted) : [];
    const quizScores = savedQuizScores ? JSON.parse(savedQuizScores) : {};
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    const streakData = savedStreak ? JSON.parse(savedStreak) : { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };
    const bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];

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

    setStreak(streakData);
    setBookmarksCount(bookmarks.length);
  }, []);

  if (!mounted) return null;

  const targetPKB = 150;
  const pkbPercent = progress ? Math.round((progress.totalPKB / targetPKB) * 100) : 0;
  const modulePercent = progress ? Math.round((progress.bimtekCompleted.length / bimtekModules.length) * 100) : 0;

  const recentModules = progress?.bimtekCompleted.slice(-5).reverse() || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 18) return 'Selamat siang';
    return 'Selamat malam';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            {getGreeting()}, {profile?.name || 'Learner'}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Ini adalah dashboard progress belajar Anda
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="text-3xl font-bold">{progress?.totalPKB || 0}</div>
            <div className="text-amber-100 text-sm">PKB Points</div>
            <div className="mt-2 text-xs text-amber-100">{pkbPercent}% dari target</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="text-3xl font-bold">{progress?.bimtekCompleted.length || 0}</div>
            <div className="text-green-100 text-sm">Modul Selesai</div>
            <div className="mt-2 text-xs text-green-100">{modulePercent}% dari total</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
            <div className="text-3xl font-bold">{streak?.currentStreak || 0}</div>
            <div className="text-purple-100 text-sm">🔥 Streak Hari</div>
            <div className="mt-2 text-xs text-purple-100">Rekor: {streak?.longestStreak || 0} hari</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
            <div className="text-3xl font-bold">{bookmarksCount}</div>
            <div className="text-blue-100 text-sm">🔖 Bookmarks</div>
            <div className="mt-2 text-xs text-blue-100">Tersimpan</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Progress PKB</h2>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-500">Target: {targetPKB} PKB</span>
              <span className="text-amber-600 font-medium">{progress?.totalPKB || 0} PKB</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-600 h-4 rounded-full transition-all"
                style={{ width: `${pkbPercent}%` }}
              ></div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              {targetPKB - (progress?.totalPKB || 0)} PKB lagi menuju target!
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Aktivitas Terakhir</h2>
            {recentModules.length === 0 ? (
              <p className="text-slate-500 text-sm">Belum ada aktivitas. Mulai belajar sekarang!</p>
            ) : (
              <div className="space-y-2">
                {recentModules.map((id, i) => {
                  const mod = bimtekModules.find(m => m.id === id);
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{mod?.title}</span>
                      <span className="ml-auto text-xs text-amber-600">+{mod?.pkb} PKB</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/bimtek" className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 hover:shadow-lg transition-all text-center">
            <div className="text-3xl mb-2">🎓</div>
            <div className="font-medium text-slate-800 dark:text-white">BIMTEK</div>
            <div className="text-sm text-slate-500">{progress?.bimtekCompleted.length || 0} modul</div>
          </Link>
          <Link href="/quiz" className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 hover:shadow-lg transition-all text-center">
            <div className="text-3xl mb-2">✍️</div>
            <div className="font-medium text-slate-800 dark:text-white">Quiz</div>
            <div className="text-sm text-slate-500">{Object.keys(progress?.quizBestScores || {}).length} kategori</div>
          </Link>
          <Link href="/bookmarks" className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 hover:shadow-lg transition-all text-center">
            <div className="text-3xl mb-2">🔖</div>
            <div className="font-medium text-slate-800 dark:text-white">Favorit</div>
            <div className="text-sm text-slate-500">{bookmarksCount} tersimpan</div>
          </Link>
          <Link href="/profile" className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 hover:shadow-lg transition-all text-center">
            <div className="text-3xl mb-2">👤</div>
            <div className="font-medium text-slate-800 dark:text-white">Profile</div>
            <div className="text-sm text-slate-500">Lihat profil</div>
          </Link>
        </div>

        {profile?.targetLevel && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">🎯 Target Sertifikasi Anda</h2>
            <p className="text-indigo-100">
              Anda bertujuan untuk menjadi <strong>{profile.targetLevel}</strong> di bidang konstruksi. 
              Lanjutkan belajar untuk mencapai target ini!
            </p>
            <Link href="/sertifikasi" className="inline-block mt-4 px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50">
              Lihat Persyaratan
            </Link>
          </div>
        )}

        {!profile?.name && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">👋 Hai, selamat datang!</h2>
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              Isi profile Anda untuk personalisasi pengalaman belajar.
            </p>
            <Link href="/profile" className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600">
              Isi Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
