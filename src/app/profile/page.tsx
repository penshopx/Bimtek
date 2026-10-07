'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NotificationManager } from '@/components/NotificationManager';
import { ProgressExporter } from '@/components/ProgressExporter';
import { StreakTracker } from '@/components/StreakTracker';
import { useAuth } from '@/components/AuthProvider';
import { SKK_JABATAN, BIDANG_OPTIONS, KUALIFIKASI_OPTIONS, getJabatanByBidang, getJabatanById } from '@/lib/skkData';
import type { Bidang, Kualifikasi } from '@/lib/skkData';

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

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [progress, setProgress] = useState<UserProgress>({
    bimtekCompleted: [],
    quizBestScores: {},
    totalPKB: 0,
    favoriteModules: [],
  });
  const [activeTab, setActiveTab] = useState('overview');

  // SKK editing state
  const [editingSkk, setEditingSkk] = useState(false);
  const [skkBidang, setSkkBidang] = useState<Bidang | ''>('');
  const [skkJabatanId, setSkkJabatanId] = useState('');
  const [skkKualifikasi, setSkkKualifikasi] = useState<Kualifikasi | ''>('');
  const [savingSkk, setSavingSkk] = useState(false);
  const [skkSaved, setSkkSaved] = useState(false);
  const [certificateLevel, setCertificateLevel] = useState('');
  const [certificateIssuedAt, setCertificateIssuedAt] = useState('');
  const [savingCertificate, setSavingCertificate] = useState(false);
  const [certificateSaved, setCertificateSaved] = useState(false);

  useEffect(() => {
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

    setProgress({ bimtekCompleted: completed, quizBestScores: quizScores, totalPKB: pkb, favoriteModules: favorites });
  }, []);

  useEffect(() => {
    setCertificateLevel(user?.skkCertificateLevel || '');
    setCertificateIssuedAt(user?.skkIssuedAt || '');
  }, [user?.skkCertificateLevel, user?.skkIssuedAt]);

  // Populate SKK fields from user profile when editing starts
  const startEditSkk = () => {
    setSkkBidang((user?.bidang as Bidang) || '');
    setSkkJabatanId(user?.jabatanSkk || '');
    setSkkKualifikasi((user?.kualifikasiSkk as Kualifikasi) || '');
    setEditingSkk(true);
    setSkkSaved(false);
  };

  const saveSkk = async () => {
    if (!skkBidang || !skkJabatanId || !skkKualifikasi) return;
    setSavingSkk(true);
    await updateProfile({ bidang: skkBidang, jabatanSkk: skkJabatanId, kualifikasiSkk: skkKualifikasi } as any);
    setSavingSkk(false);
    setEditingSkk(false);
    setSkkSaved(true);
  };

  const saveCertificate = async () => {
    if (!certificateLevel || !certificateIssuedAt) return;
    setSavingCertificate(true);
    setCertificateSaved(false);
    await updateProfile({
      skkCertificateLevel: certificateLevel,
      skkIssuedAt: certificateIssuedAt,
    });
    setSavingCertificate(false);
    setCertificateSaved(true);
  };

  const toggleFavorite = (moduleId: string) => {
    const newFavorites = progress.favoriteModules.includes(moduleId)
      ? progress.favoriteModules.filter(id => id !== moduleId)
      : [...progress.favoriteModules, moduleId];
    setProgress({ ...progress, favoriteModules: newFavorites });
    localStorage.setItem('favoriteModules', JSON.stringify(newFavorites));
  };

  const totalPKBTarget = 150;
  const jabatanList = skkBidang ? getJabatanByBidang(skkBidang as Bidang) : [];
  const currentJabatan = user?.jabatanSkk ? getJabatanById(user.jabatanSkk) : null;

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'skk', label: '🎯 Jabatan SKK' },
    { id: 'profile', label: '👤 Profile' },
    { id: 'achievements', label: '🏆 Achievements' },
    { id: 'favorites', label: '⭐ Favorit' },
    { id: 'notifications', label: '🔔 Notifikasi' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">👤 Profile</h1>
          <p className="text-slate-600 dark:text-slate-300">Kelola profile dan lihat progress belajar Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-4xl text-white mx-auto mb-4">
                  {user?.name ? user.name[0].toUpperCase() : '👤'}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                  {user?.name || 'Belum login'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {currentJabatan ? currentJabatan.name : 'Jabatan SKK belum dipilih'}
                </p>
                {user?.kualifikasiSkk && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                    {user.kualifikasiSkk}
                  </span>
                )}
              </div>

              <div className="mt-6 space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all text-sm ${
                      activeTab === tab.id
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* SKK summary card */}
                {user && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">🎯 Target SKK Anda</h3>
                      <button
                        onClick={() => setActiveTab('skk')}
                        className="text-amber-500 text-sm hover:underline"
                      >
                        {currentJabatan ? 'Ubah' : 'Pilih sekarang'}
                      </button>
                    </div>
                    {currentJabatan ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Bidang</p>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm mt-1">{user.bidang}</p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Jabatan</p>
                          <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm mt-1 leading-tight">{currentJabatan.name}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Kualifikasi</p>
                          <p className="font-semibold text-slate-800 dark:text-white text-sm mt-1">{user.kualifikasiSkk}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-3xl mb-2">🎯</div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                          Pilih jabatan SKK untuk mendapatkan rekomendasi modul yang relevan
                        </p>
                        <button
                          onClick={() => setActiveTab('skk')}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm"
                        >
                          Pilih Jabatan SKK
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <StreakTracker />
                <ProgressExporter />
              </div>
            )}

            {/* SKK Jabatan tab */}
            {activeTab === 'skk' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white">🎯 Jabatan SKK Target</h3>
                  {!editingSkk && (
                    <button
                      onClick={startEditSkk}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600"
                    >
                      {currentJabatan ? '✏️ Ubah' : '+ Pilih Jabatan'}
                    </button>
                  )}
                </div>

                {skkSaved && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl text-green-700 dark:text-green-400 text-sm">
                    ✅ Jabatan SKK berhasil disimpan!
                  </div>
                )}

                {!editingSkk && currentJabatan && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Bidang</p>
                        <p className="text-slate-800 dark:text-white font-semibold">{user?.bidang}</p>
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Jabatan SKK</p>
                        <p className="text-amber-700 dark:text-amber-400 font-semibold text-sm">{currentJabatan.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{currentJabatan.level} • Sub {currentJabatan.subklasifikasi}</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Kualifikasi</p>
                        <p className="text-slate-800 dark:text-white font-semibold">{user?.kualifikasiSkk}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">📚 Kategori BIMTEK yang relevan:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentJabatan.relatedCategories.map(cat => (
                          <span key={cat} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        💡 Buka halaman <Link href="/bimtek" className="text-amber-500 hover:underline">BIMTEK</Link> untuk melihat modul yang dipersonalisasi untuk jabatan Anda, atau cek <Link href="/sertifikasi" className="text-amber-500 hover:underline">Sertifikasi</Link> untuk persyaratan lengkap.
                      </p>
                    </div>
                  </div>
                )}

                {!editingSkk && !currentJabatan && (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">🎯</div>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      Belum ada jabatan SKK yang dipilih. Pilih jabatan target Anda agar platform bisa menampilkan konten yang relevan.
                    </p>
                    <button
                      onClick={startEditSkk}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold"
                    >
                      + Pilih Jabatan SKK
                    </button>
                  </div>
                )}

                {editingSkk && (
                  <div className="space-y-6">
                    {/* Step 1: Bidang */}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                        1. Bidang Pekerjaan
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {BIDANG_OPTIONS.map(b => (
                          <button
                            key={b}
                            onClick={() => { setSkkBidang(b); setSkkJabatanId(''); }}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              skkBidang === b
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                            }`}
                          >
                            <div className="font-semibold text-sm">
                              {b === 'Sipil' ? '🏗️ Sipil' : '📋 Manajemen Pelaksanaan'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: Jabatan */}
                    {skkBidang && (
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                          2. Jabatan SKK
                        </label>
                        <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-600 rounded-xl p-2">
                          {jabatanList.map(j => (
                            <button
                              key={j.id}
                              onClick={() => setSkkJabatanId(j.id)}
                              className={`w-full p-3 rounded-lg border text-left transition-all ${
                                skkJabatanId === j.id
                                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="font-medium text-sm">{j.name}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{j.level} • Sub {j.subklasifikasi}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Kualifikasi */}
                    {skkJabatanId && (
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                          3. Kualifikasi
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {KUALIFIKASI_OPTIONS.map(k => (
                            <button
                              key={k}
                              onClick={() => setSkkKualifikasi(k)}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${
                                skkKualifikasi === k
                                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                  : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                              }`}
                            >
                              <div className="font-semibold text-sm">{k}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setEditingSkk(false)}
                        className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        disabled={!skkBidang || !skkJabatanId || !skkKualifikasi || savingSkk}
                        onClick={saveSkk}
                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
                      >
                        {savingSkk ? '⏳ Menyimpan...' : '💾 Simpan'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-800 dark:text-white">🏅 SKK Aktif yang Anda Miliki</h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Data ini disimpan di profil akun untuk mempersonalisasi pengingat masa berlaku dan rekomendasi jalur karier.
                    </p>
                  </div>

                  {certificateSaved && (
                    <div className="mb-4 rounded-xl border border-green-200 bg-green-100 p-3 text-sm text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400">
                      ✅ Data SKK aktif berhasil disimpan.
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="certificate-level" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                        Jenjang SKK
                      </label>
                      <select
                        id="certificate-level"
                        value={certificateLevel}
                        onChange={(event) => {
                          setCertificateLevel(event.target.value);
                          setCertificateSaved(false);
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-800 outline-none focus:border-amber-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="">Pilih jenjang</option>
                        {[1, 2, 3, 4, 5, 6, 7].map(level => (
                          <option key={level} value={String(level)}>Level {level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="certificate-issued-at" className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                        Tanggal terbit
                      </label>
                      <input
                        id="certificate-issued-at"
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                        value={certificateIssuedAt}
                        onChange={(event) => {
                          setCertificateIssuedAt(event.target.value);
                          setCertificateSaved(false);
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-800 outline-none focus:border-amber-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Jalur asesor umumnya mensyaratkan SKK aktif Level 6+ dan pengalaman kerja relevan minimal 5 tahun.
                    </p>
                    <button
                      onClick={saveCertificate}
                      disabled={!user || !certificateLevel || !certificateIssuedAt || savingCertificate}
                      className="shrink-0 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {savingCertificate ? '⏳ Menyimpan...' : 'Simpan Data SKK'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile info tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Informasi Akun</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Nama Lengkap', value: user?.name },
                    { label: 'Email', value: user?.email },
                    { label: 'Perusahaan', value: user?.company },
                    { label: 'Posisi/Jabatan', value: user?.position },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
                      <p className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-white">
                        {value || '-'}
                      </p>
                    </div>
                  ))}
                  <p className="text-sm text-slate-400">Untuk mengubah data akun, hubungi administrator.</p>
                </div>
              </div>
            )}

            {/* Achievements tab */}
            {activeTab === 'achievements' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: '🎯', title: 'First Step', desc: '1 modul selesai', unlocked: progress.bimtekCompleted.length >= 1 },
                    { icon: '📚', title: 'Penggemar BIMTEK', desc: '10 modul selesai', unlocked: progress.bimtekCompleted.length >= 10 },
                    { icon: '⭐', title: 'Learning Hunter', desc: '50 poin belajar internal, bukan SKPK', unlocked: progress.totalPKB >= 50 },
                    { icon: '🧠', title: 'Quiz Master', desc: '5 kategori quiz', unlocked: Object.keys(progress.quizBestScores).length >= 5 },
                    { icon: '🏆', title: 'Century', desc: '100 poin belajar internal, bukan SKPK', unlocked: progress.totalPKB >= 100 },
                    { icon: '🎓', title: 'Mahir', desc: '20 modul selesai', unlocked: progress.bimtekCompleted.length >= 20 },
                    { icon: '👑', title: 'Expert', desc: '150 poin belajar internal, bukan SKPK', unlocked: progress.totalPKB >= 150 },
                    { icon: '🎯', title: 'Berjabatan', desc: 'Jabatan SKK dipilih', unlocked: !!user?.jabatanSkk },
                  ].map(ach => (
                    <div key={ach.title} className={`p-4 rounded-xl text-center ${ach.unlocked ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      <div className="text-3xl mb-1">{ach.icon}</div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{ach.title}</p>
                      <p className="text-xs text-slate-500">{ach.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites tab */}
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
                      return mod ? (
                        <div key={id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                          <div>
                            <h4 className="font-medium text-slate-800 dark:text-white">{mod.title}</h4>
                            <p className="text-sm text-slate-500">{mod.category} • Materi pembelajaran</p>
                          </div>
                          <button onClick={() => toggleFavorite(id)} className="text-amber-500 hover:text-amber-600">⭐</button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Notifications tab */}
            {activeTab === 'notifications' && <NotificationManager />}
          </div>
        </div>
      </div>
    </div>
  );
}
