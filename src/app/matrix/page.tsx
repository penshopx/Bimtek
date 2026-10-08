'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getQuizQuestions, type QuizQuestion } from '@/app/actions/quiz';
import { getJabatanById } from '@/lib/skkData';
import { getSavedJabatanTarget, saveJabatanTarget } from '@/lib/jabatanPreference';
import { getUnitLearningRecommendation } from '@/lib/learningRecommendations';
import {
  jabatanSKKData,
  type JabatanSKK,
  type UnitKompetensi,
} from '@/data/skkni-unit-kompetensi';

// ── Subklasifikasi matrix data ────────────────────────────────────────────────
const subklasifikasi = [
  { id: 'B', name: 'B - Gedung', color: 'bg-blue-500' },
  { id: 'C', name: 'C - Sipil', color: 'bg-green-500' },
  { id: 'D', name: 'D - Mekanikal', color: 'bg-cyan-500' },
  { id: 'E', name: 'E - Elektrikal', color: 'bg-yellow-500' },
  { id: 'F', name: 'F - Jalan', color: 'bg-orange-500' },
  { id: 'G', name: 'G - Jembatan', color: 'bg-purple-500' },
  { id: 'H', name: 'H - Benda', color: 'bg-pink-500' },
];

const jobPositions = [
  { id: 'JP001', name: 'Ahli Teknik Jalan', subklasifikasi: ['F'], level: 'Ahli' },
  { id: 'JP002', name: 'Ahli Teknik Jembatan', subklasifikasi: ['G'], level: 'Ahli' },
  { id: 'JP003', name: 'Ahli Teknik Sipil', subklasifikasi: ['B', 'C'], level: 'Ahli' },
  { id: 'JP004', name: 'Ahli Elektrikal', subklasifikasi: ['E'], level: 'Ahli' },
  { id: 'JP005', name: 'Ahli Mekanikal', subklasifikasi: ['D'], level: 'Ahli' },
  { id: 'JP006', name: 'Manager Proyek', subklasifikasi: ['B', 'C', 'D', 'E', 'F', 'G'], level: 'Manager' },
  { id: 'JP007', name: 'Supervisor Konstruksi', subklasifikasi: ['B', 'C'], level: 'Supervisor' },
  { id: 'JP008', name: 'Teknisi Jalan', subklasifikasi: ['F'], level: 'Teknisi' },
  { id: 'JP009', name: 'Teknisi Listrik', subklasifikasi: ['E'], level: 'Teknisi' },
  { id: 'JP010', name: 'K3 Konstruksi', subklasifikasi: ['B', 'C', 'D', 'E', 'F', 'G'], level: 'Ahli' },
];

// Matrix roles use a more detailed SKKNI dataset than the profile selector.
// Only exact, one-to-one matches can safely update the shared profile value.
const MATRIX_TO_PROFILE_JABATAN: Record<string, string> = {
  'SKK-001': 'MP002',
  'SKK-003': 'MP001',
};

const kualifikasiOptions = ['Semua', 'Teknisi/Analis', 'Ahli'];
const bidangOptions = ['Semua', 'Sipil', 'Manajemen Pelaksanaan'];
const kelompokColors: Record<UnitKompetensi['kelompok'], string> = {
  Inti:    'bg-blue-100 text-blue-700',
  Pilihan: 'bg-purple-100 text-purple-700',
  Umum:    'bg-slate-100 text-slate-600',
};

// ── Export helper ─────────────────────────────────────────────────────────────
function exportCSV(jabatan: JabatanSKK) {
  const header = 'Kode,Judul,Kelompok\n';
  const rows = jabatan.unitKompetensi
    .map(u => `"${u.kode}","${u.judul}","${u.kelompok}"`)
    .join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `unit-kompetensi-${jabatan.nama.replace(/\s+/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAllCSV(list: JabatanSKK[]) {
  const header = 'Jabatan,Kualifikasi,Jenjang KKNI,Bidang,Kode,Judul,Kelompok\n';
  const rows = list.flatMap(j =>
    j.unitKompetensi.map(u =>
      `"${j.nama}","${j.kualifikasi}","${j.jenjang}","${j.bidang}","${u.kode}","${u.judul}","${u.kelompok}"`,
    ),
  ).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'unit-kompetensi-skkni-sipil-manajemen.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function printJabatan(jabatan: JabatanSKK) {
  const previousTitle = document.title;
  document.title = `Unit Kompetensi - ${jabatan.nama}`;

  const restoreTitle = () => {
    document.title = previousTitle;
  };

  window.addEventListener('afterprint', restoreTitle, { once: true });
  window.print();
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function MatrixPage() {
  const { updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'matriks' | 'unitkompetensi'>('matriks');

  // Matriks tab state
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<string | null>(null);

  // Unit Kompetensi tab state
  const [filterBidang, setFilterBidang] = useState('Semua');
  const [filterKualifikasi, setFilterKualifikasi] = useState('Semua');
  const [selectedJabatan, setSelectedJabatan] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [savedJabatanTarget, setSavedJabatanTarget] = useState<string | null>(null);
  const [targetSaved, setTargetSaved] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const unitDetailRef = useRef<HTMLDivElement>(null);
  const shouldScrollToTargetRef = useRef(false);

  // The matrix target remains authoritative because its detailed SKKNI roles
  // do not always have a one-to-one entry in the broader profile selector.
  useEffect(() => {
    const savedTarget = getSavedJabatanTarget();
    if (!savedTarget || !jabatanSKKData.some(j => j.id === savedTarget)) return;

    setSavedJabatanTarget(savedTarget);
    setSelectedJabatan(savedTarget);
    setActiveTab('unitkompetensi');
    shouldScrollToTargetRef.current = true;
  }, []);

  useEffect(() => {
    let active = true;
    getQuizQuestions('Semua')
      .then((questions) => {
        if (active) setQuizQuestions(questions);
      })
      .catch(() => {
        if (active) setQuizQuestions([]);
      });

    return () => {
      active = false;
    };
  }, []);

  // The detail panel is rendered only after selectedJabatan is restored.
  useEffect(() => {
    if (!shouldScrollToTargetRef.current || !selectedJabatan) return;

    shouldScrollToTargetRef.current = false;
    requestAnimationFrame(() => {
      unitDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [selectedJabatan]);

  const handleSaveTarget = async () => {
    if (!selectedJabatanData) return;

    const savedLocally = saveJabatanTarget(selectedJabatanData.id);
    if (!savedLocally) return;

    setSavedJabatanTarget(selectedJabatanData.id);
    setTargetSaved(true);

    const profileJabatanId = MATRIX_TO_PROFILE_JABATAN[selectedJabatanData.id];
    const profileJabatan = profileJabatanId ? getJabatanById(profileJabatanId) : null;
    if (profileJabatan) {
      await updateProfile({
        jabatanSkk: profileJabatanId,
        bidang: profileJabatan.bidang,
        kualifikasiSkk: selectedJabatanData.kualifikasi === 'Teknisi/Analis'
          ? 'Teknisi / Analis'
          : 'Ahli',
      });
    }
  };

  const connectedPositions = selectedSub
    ? jobPositions.filter(jp => jp.subklasifikasi.includes(selectedSub))
    : [];
  const connectedSubklasifikasi = selectedPos
    ? jobPositions.find(jp => jp.id === selectedPos)?.subklasifikasi || []
    : [];

  const filteredJabatan = useMemo(() => {
    return jabatanSKKData.filter(j => {
      if (filterBidang !== 'Semua' && j.bidang !== filterBidang) return false;
      if (filterKualifikasi !== 'Semua' && j.kualifikasi !== filterKualifikasi) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = j.nama.toLowerCase().includes(q);
        const matchUnit = j.unitKompetensi.some(
          u => u.kode.toLowerCase().includes(q) || u.judul.toLowerCase().includes(q),
        );
        if (!matchName && !matchUnit) return false;
      }
      return true;
    });
  }, [filterBidang, filterKualifikasi, search]);

  const selectedJabatanData = jabatanSKKData.find(j => j.id === selectedJabatan);

  // When filters change, clear selection if it's no longer in results
  const selectedVisible = filteredJabatan.some(j => j.id === selectedJabatan);

  const displayedUnits = !selectedJabatanData
    ? []
    : !search
      ? selectedJabatanData.unitKompetensi
      : selectedJabatanData.unitKompetensi.filter((u) => {
          const q = search.toLowerCase();
          return u.kode.toLowerCase().includes(q) || u.judul.toLowerCase().includes(q);
        });

  const selectedLearningCoverage = selectedJabatanData
    ? selectedJabatanData.unitKompetensi.map((unit) => ({
        unit,
        recommendation: getUnitLearningRecommendation(selectedJabatanData.id, unit),
      }))
    : [];
  const coveredModuleCount = new Set(
    selectedLearningCoverage.flatMap(({ recommendation }) =>
      recommendation.modules.map((module) => module.id),
    ),
  ).size;
  const coveredQuizQuestionCount = new Set(
    selectedLearningCoverage.flatMap(({ recommendation }) =>
      quizQuestions
        .filter((question) => recommendation.quizCategories.includes(question.category))
        .map((question) => question.id),
    ),
  ).size;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8 print:hidden">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">🔗 Matrix SKK</h1>
          <p className="text-lg text-slate-600">
            Visualisasi subklasifikasi & unit kompetensi per jabatan SKK
          </p>
          <p className="mt-3 text-sm text-slate-700">
            Kelompok B–H dan kode pada matriks ini adalah pengelompokan belajar internal, bukan taksonomi resmi SK DJBK 114/2024.
            {' '}<a href="/sertifikasi" className="text-blue-700 underline">Lihat katalog klasifikasi, subklasifikasi, dan jabatan dari lampiran SK DJBK.</a>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl shadow p-2 w-fit print:hidden">
          <button
            onClick={() => setActiveTab('matriks')}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'matriks'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🗂️ Matriks Subklasifikasi
          </button>
          <button
            onClick={() => setActiveTab('unitkompetensi')}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'unitkompetensi'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📋 Unit Kompetensi
          </button>
        </div>

        {/* ── TAB 1: Matriks Subklasifikasi ───────────────────────────────── */}
        {activeTab === 'matriks' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Subklasifikasi</h2>
                <div className="space-y-3">
                  {subklasifikasi.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSub(selectedSub === sub.id ? null : sub.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        selectedSub === sub.id
                          ? `${sub.color} text-white`
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-10 h-10 ${sub.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                        {sub.id}
                      </span>
                      <span className="font-medium">{sub.name}</span>
                      {selectedSub === sub.id && (
                        <span className="ml-auto text-sm">({connectedPositions.length} posisi)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Jabatan Kerja</h2>
                <div className="space-y-3">
                  {jobPositions.map((pos) => {
                    const isConnected = selectedSub && pos.subklasifikasi.includes(selectedSub);
                    return (
                      <button
                        key={pos.id}
                        onClick={() => setSelectedPos(selectedPos === pos.id ? null : pos.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          selectedPos === pos.id
                            ? 'bg-amber-500 text-white'
                            : isConnected
                              ? 'bg-green-50 border-2 border-green-300'
                              : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <span className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 font-bold">
                          {pos.level[0]}
                        </span>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{pos.name}</div>
                          <div className="flex gap-1 mt-1">
                            {pos.subklasifikasi.map((s) => (
                              <span key={s} className={`px-2 py-0.5 text-xs rounded ${
                                selectedSub === s || selectedPos === pos.id
                                  ? 'bg-white/30 text-white'
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {(selectedSub || selectedPos) && (
              <div className="mt-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-3">
                  {selectedSub ? 'Koneksi Ditemukan' : 'Subklasifikasi Terkait'}
                </h3>
                {selectedSub && connectedPositions.length > 0 && (
                  <div>
                    <p className="mb-3">Subklasifikasi {selectedSub} terhubung dengan:</p>
                    <div className="flex flex-wrap gap-2">
                      {connectedPositions.map((pos) => (
                        <span key={pos.id} className="px-3 py-1 bg-white/20 rounded-full">
                          {pos.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPos && (
                  <div>
                    <p className="mb-3">Jabatan {jobPositions.find(j => j.id === selectedPos)?.name} memerlukan:</p>
                    <div className="flex flex-wrap gap-2">
                      {connectedSubklasifikasi.map((s) => (
                        <span key={s} className="px-3 py-1 bg-white/20 rounded-full">
                          {subklasifikasi.find(sub => sub.id === s)?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── TAB 2: Unit Kompetensi ──────────────────────────────────────── */}
        {activeTab === 'unitkompetensi' && (
          <>
          <div className="space-y-6 print:hidden">

            {/* Filters row */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <div className="flex flex-wrap gap-4 items-end">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Cari jabatan / kode / judul</label>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Contoh: jalan, F.45, manajemen…"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
                {/* Bidang */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Bidang</label>
                  <select
                    value={filterBidang}
                    onChange={e => { setFilterBidang(e.target.value); setSelectedJabatan(null); }}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
                  >
                    {bidangOptions.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                {/* Kualifikasi */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Kualifikasi</label>
                  <select
                    value={filterKualifikasi}
                    onChange={e => { setFilterKualifikasi(e.target.value); setSelectedJabatan(null); }}
                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
                  >
                    {kualifikasiOptions.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
                {/* Export all */}
                <button
                  onClick={() => exportAllCSV(filteredJabatan)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                >
                  ⬇️ Export Semua ({filteredJabatan.length})
                </button>
              </div>
            </div>

            {/* Main two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Jabatan list — left column */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <p className="text-sm text-slate-500">{filteredJabatan.length} jabatan ditemukan</p>
                </div>
                <div className="overflow-y-auto max-h-[600px] divide-y divide-slate-50">
                  {filteredJabatan.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      Tidak ada jabatan yang cocok
                    </div>
                  )}
                  {filteredJabatan.map(j => (
                    <button
                      key={j.id}
                      onClick={() => setSelectedJabatan(selectedJabatan === j.id ? null : j.id)}
                      className={`w-full text-left p-4 transition-all hover:bg-slate-50 ${
                        selectedJabatan === j.id ? 'bg-slate-800 text-white hover:bg-slate-800' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          selectedJabatan === j.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {j.jenjang}
                        </div>
                        <div className="min-w-0">
                          <div className={`font-medium text-sm leading-snug ${selectedJabatan === j.id ? 'text-white' : 'text-slate-800'}`}>
                            {j.nama}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              selectedJabatan === j.id
                                ? 'bg-white/20 text-white'
                                : 'bg-blue-50 text-blue-600'
                            }`}>{j.kualifikasi}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              selectedJabatan === j.id
                                ? 'bg-white/20 text-white'
                                : 'bg-green-50 text-green-600'
                            }`}>{j.bidang}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              selectedJabatan === j.id
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}>{j.unitKompetensi.length} unit</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Unit Kompetensi detail — right column */}
              <div ref={unitDetailRef} className="lg:col-span-3">
                {!selectedVisible || !selectedJabatanData ? (
                  <div className="bg-white rounded-2xl shadow-lg h-full flex items-center justify-center p-12 text-center min-h-[300px]">
                    <div>
                      <div className="text-5xl mb-4">👈</div>
                      <p className="text-slate-500 font-medium">Pilih jabatan SKK di sebelah kiri</p>
                      <p className="text-slate-400 text-sm mt-1">untuk melihat daftar unit kompetensinya</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Detail header */}
                    <div className="p-5 bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold leading-snug">{selectedJabatanData.nama}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                              KKNI Jenjang {selectedJabatanData.jenjang}
                            </span>
                            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                              {selectedJabatanData.kualifikasi}
                            </span>
                            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">
                              {selectedJabatanData.bidang}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => exportCSV(selectedJabatanData)}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all border border-white/20"
                        >
                          ⬇️ CSV
                        </button>
                        <button
                          onClick={() => printJabatan(selectedJabatanData)}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white text-slate-800 hover:bg-slate-100 rounded-xl text-sm font-medium transition-all border border-white"
                        >
                          🖨️ Cetak / PDF
                        </button>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          onClick={handleSaveTarget}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                            savedJabatanTarget === selectedJabatanData.id
                              ? 'bg-amber-400 text-slate-900 border-amber-300 hover:bg-amber-300'
                              : 'bg-white text-slate-800 border-white hover:bg-slate-100'
                          }`}
                        >
                          {savedJabatanTarget === selectedJabatanData.id ? '✓ Target SKK Saya' : '🎯 Jadikan Target SKK Saya'}
                        </button>
                        {targetSaved && savedJabatanTarget === selectedJabatanData.id && (
                          <span className="text-xs text-amber-100" role="status">
                            Target tersimpan dan akan dipakai di halaman terkait.
                          </span>
                        )}
                      </div>
                      {/* Summary counts */}
                      <div className="flex gap-4 mt-4 text-xs">
                        {(['Inti', 'Pilihan', 'Umum'] as const).map(k => {
                          const count = selectedJabatanData.unitKompetensi.filter(u => u.kelompok === k).length;
                          return (
                            <span key={k} className="flex items-center gap-1.5">
                              <span className={`inline-block w-2 h-2 rounded-full ${
                                k === 'Inti' ? 'bg-blue-300' : k === 'Pilihan' ? 'bg-purple-300' : 'bg-slate-400'
                              }`} />
                              {k}: {count}
                            </span>
                          );
                        })}
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-300" />
                          Rekomendasi: {coveredModuleCount} modul
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-300" />
                          Latihan: {coveredQuizQuestionCount} soal
                        </span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-3 text-xs">
                      {(['Inti', 'Pilihan', 'Umum'] as const).map(k => (
                        <span key={k} className={`px-2.5 py-0.5 rounded-full font-medium ${kelompokColors[k]}`}>
                          {k}
                        </span>
                      ))}
                    </div>

                    {/* Unit list */}
                    <div className="overflow-y-auto max-h-[490px] divide-y divide-slate-50">
                      {displayedUnits.map((u, i) => {
                        const recommendation = getUnitLearningRecommendation(selectedJabatanData.id, u);
                        const questionCount = quizQuestions.filter((question) =>
                          recommendation.quizCategories.includes(question.category),
                        ).length;
                        const primaryQuizCategory = recommendation.quizCategories.find((category) =>
                          quizQuestions.some((question) => question.category === category),
                        );

                        return (
                          <div key={u.kode} className="flex gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                            <span className="shrink-0 w-6 h-6 mt-0.5 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-500 font-medium">
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-3 flex-wrap">
                                <code className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
                                  {u.kode}
                                </code>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${kelompokColors[u.kelompok]}`}>
                                  {u.kelompok}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 mt-1.5 leading-snug">{u.judul}</p>
                              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                  Rekomendasi persiapan SIAP
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {recommendation.modules.map((module) => (
                                    <Link
                                      key={module.id}
                                      href={`/bimtek/${module.id}`}
                                      className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200"
                                    >
                                      📘 {module.title}
                                    </Link>
                                  ))}
                                  {primaryQuizCategory && questionCount > 0 ? (
                                    <Link
                                      href={`/quiz?category=${encodeURIComponent(primaryQuizCategory)}&unit=${encodeURIComponent(u.judul)}`}
                                      className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-200"
                                    >
                                      ✍️ {questionCount} soal terkait
                                    </Link>
                                  ) : (
                                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600">
                                      Soal khusus belum tersedia
                                    </span>
                                  )}
                                </div>
                                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                                  Rekomendasi berdasarkan kesesuaian topik dan kategori, bukan penetapan resmi SKKNI.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {displayedUnits.length === 0 && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          Tidak ada unit kompetensi yang cocok dengan pencarian
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info footer */}
            <p className="text-center text-xs text-slate-400 pb-4">
              Data berdasarkan SKKNI Bidang Sipil dan Manajemen Pelaksanaan — kode mengacu skema baku jabatan SKK LPJK
            </p>
          </div>

          {selectedVisible && selectedJabatanData && (
            <section
              className="hidden print:block print-sheet text-slate-900"
              aria-labelledby="print-jabatan-title"
            >
              <header className="border-b-2 border-slate-800 pb-4 mb-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                  SIAP SKK · Daftar Unit Kompetensi
                </p>
                <h1 id="print-jabatan-title" className="text-2xl font-bold leading-tight">
                  {selectedJabatanData.nama}
                </h1>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-slate-600">
                  <span><strong className="text-slate-900">KKNI:</strong> Jenjang {selectedJabatanData.jenjang}</span>
                  <span><strong className="text-slate-900">Kualifikasi:</strong> {selectedJabatanData.kualifikasi}</span>
                  <span><strong className="text-slate-900">Bidang:</strong> {selectedJabatanData.bidang}</span>
                </div>
              </header>

              <table className="w-full border-collapse text-sm" aria-label={`Unit kompetensi ${selectedJabatanData.nama}`}>
                <thead>
                  <tr className="bg-slate-100 border-y-2 border-slate-400 text-left">
                    <th scope="col" className="w-[27%] px-3 py-2.5 font-semibold">Kode</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Judul</th>
                    <th scope="col" className="w-[16%] px-3 py-2.5 font-semibold">Kelompok</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedJabatanData.unitKompetensi.map((unit) => (
                    <tr key={unit.kode} className="border-b border-slate-300 align-top">
                      <td className="px-3 py-2.5 font-mono text-xs">{unit.kode}</td>
                      <td className="px-3 py-2.5">{unit.judul}</td>
                      <td className="px-3 py-2.5">{unit.kelompok}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-5 text-xs text-slate-500">
                Dicetak dari SIAP SKK · Data berdasarkan SKKNI Bidang Sipil dan Manajemen Pelaksanaan.
              </p>
            </section>
          )}
          </>
        )}
      </div>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 14mm;
        }

        @media print {
          html,
          body {
            background: #ffffff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-sheet,
          .print-sheet * {
            visibility: visible !important;
          }

          .print-sheet {
            position: absolute !important;
            top: 0;
            left: 0;
            width: 100%;
            color-adjust: exact;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-sheet thead {
            display: table-header-group;
          }

          .print-sheet tr {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
