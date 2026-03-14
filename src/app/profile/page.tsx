'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NotificationManager } from '@/components/NotificationManager';
import { ProgressExporter } from '@/components/ProgressExporter';

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

const levels = ['Semua', 'Pelaksana', 'Teknisi', 'Ahli', 'Ahli Madya', 'Manager'];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    company: '',
    position: '',
    targetLevel: '',
  });
  const [progress, setProgress] = useState<UserProgress>({
    bimtekCompleted: [],
    quizBestScores: {},
    totalPKB: 0,
    favoriteModules: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

  const saveProfile = () => {
    localStorage.setItem('bimtekProfile', JSON.stringify(profile));
    setIsEditing(false);
  };

  const toggleFavorite = (moduleId: string) => {
    const newFavorites = progress.favoriteModules.includes(moduleId)
      ? progress.favoriteModules.filter(id => id !== moduleId)
      : [...progress.favoriteModules, moduleId];
    
    const newProgress = { ...progress, favoriteModules: newFavorites };
    setProgress(newProgress);
    localStorage.setItem('favoriteModules', JSON.stringify(newFavorites));
  };

  const totalQuizScore = Object.values(progress.quizBestScores).reduce((a, b) => a + b, 0);
  const targetPKB = 150;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">👤 Profile</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Kelola profile dan lihat progress belajar Anda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-4xl text-white mx-auto mb-4">
                  {profile.name ? profile.name[0].toUpperCase() : '👤'}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Nama Anda"
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-center mb-2"
                  />
                ) : (
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                    {profile.name || 'Belum diisi'}
                  </h3>
                )}
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {profile.position || 'Posisi belum diisi'}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    activeTab === 'overview'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    activeTab === 'profile'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    activeTab === 'achievements'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  🏆 Achievements
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    activeTab === 'favorites'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  ⭐ Favorit
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    activeTab === 'notifications'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  🔔 Notifikasi
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    activeTab === 'notifications'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  🔔 Notifikasi
                </button>
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <ProgressExporter />
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Informasi Profile</h3>
                  <button
                    onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600"
                  >
                    {isEditing ? '💾 Simpan' : '✏️ Edit'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Nama Lengkap</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-white">
                        {profile.name || '-'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-white">
                        {profile.email || '-'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Perusahaan</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-white">
                        {profile.company || '-'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Posisi/Jabatan</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.position}
                        onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg"
                      />
                    ) : (
                      <p className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-white">
                        {profile.position || '-'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Target Level SKK</label>
                    {isEditing ? (
                      <select
                        value={profile.targetLevel}
                        onChange={(e) => setProfile({ ...profile, targetLevel: e.target.value })}
                        className="w-full p-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg"
                      >
                        <option value="">Pilih level...</option>
                        {levels.filter(l => l !== 'Semua').map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-white">
                        {profile.targetLevel || '-'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-xl text-center ${progress.bimtekCompleted.length >= 1 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <div className="text-3xl mb-1">🎯</div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">First Step</p>
                    <p className="text-xs text-slate-500">1 modul selesai</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${progress.bimtekCompleted.length >= 10 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <div className="text-3xl mb-1">📚</div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Penggemar BIMTEK</p>
                    <p className="text-xs text-slate-500">10 modul selesai</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${progress.totalPKB >= 50 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <div className="text-3xl mb-1">⭐</div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">PKB Hunter</p>
                    <p className="text-xs text-slate-500">50 PKB points</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${Object.keys(progress.quizBestScores).length >= 5 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <div className="text-3xl mb-1">🧠</div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Quiz Master</p>
                    <p className="text-xs text-slate-500">5 kategori quiz</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${progress.totalPKB >= 100 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <div className="text-3xl mb-1">🏆</div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Century</p>
                    <p className="text-xs text-slate-500">100 PKB points</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${progress.bimtekCompleted.length >= 20 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <div className="text-3xl mb-1">🎓</div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Mahir</p>
                    <p className="text-xs text-slate-500">20 modul selesai</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${progress.totalPKB >= 150 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <div className="text-3xl mb-1">👑</div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Expert</p>
                    <p className="text-xs text-slate-500">150 PKB points</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${profile.targetLevel ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <div className="text-3xl mb-1">🎯</div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Ber目标</p>
                    <p className="text-xs text-slate-500">Target dipilih</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Modul Favorit</h3>
                {progress.favoriteModules.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">⭐</div>
                    <p className="text-slate-500 mb-4">Belum ada modul favorit</p>
                    <Link href="/bimtek" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                      Pilih Modul
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {progress.favoriteModules.map((id) => {
                      const mod = bimtekModules.find(m => m.id === id);
                      return (
                        <div key={id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                          <div>
                            <h4 className="font-medium text-slate-800 dark:text-white">{mod?.title}</h4>
                            <p className="text-sm text-slate-500">{mod?.category} • +{mod?.pkb} PKB</p>
                          </div>
                          <button
                            onClick={() => toggleFavorite(id)}
                            className="text-amber-500 hover:text-amber-600"
                          >
                            ⭐
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <NotificationManager />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
