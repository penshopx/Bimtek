'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// ─── Types ─────────────────────────────────────────────────────────────────────

type DimensionId =
  | 'knowledge'
  | 'application'
  | 'evidence'
  | 'communication'
  | 'simulation'
  | 'consistency'
  | 'evidence_prep'
  | 'learning_progress';

interface Dimension {
  id: DimensionId;
  label: string;
  desc: string;
  weight: number; // percentage weight in SIAP Index
  icon: string;
  tooltipLow: string;
  tooltipHigh: string;
  actionLink?: { label: string; href: string };
}

const dimensions: Dimension[] = [
  {
    id: 'knowledge',
    label: 'Pengetahuan Teori',
    desc: 'Seberapa baik Anda memahami konsep, regulasi, dan prosedur terkait jabatan SKK Anda?',
    weight: 20,
    icon: '📚',
    tooltipLow: 'Prioritas: pelajari SKKNI, regulasi UU 2/2017 & PP 14/2021, dan materi unit kompetensi Anda.',
    tooltipHigh: 'Fondasi pengetahuan sudah kuat. Pastikan tetap update jika ada revisi standar.',
    actionLink: { label: 'Latihan Soal', href: '/mock-asesmen' },
  },
  {
    id: 'application',
    label: 'Penerapan di Lapangan',
    desc: 'Seberapa yakin Anda bisa menjelaskan cara menerapkan kompetensi dalam pekerjaan nyata?',
    weight: 20,
    icon: '🔧',
    tooltipLow: 'Latih kemampuan menjawab pertanyaan "Bagaimana Anda melakukan X di proyek Y?" dengan metode STAR.',
    tooltipHigh: 'Kemampuan aplikasi baik. Pastikan siap menjelaskan keputusan dan alasannya kepada asesor.',
    actionLink: { label: 'Simulator Wawancara', href: '/mock-asesmen' },
  },
  {
    id: 'evidence',
    label: 'Kekuatan Bukti Kompetensi',
    desc: 'Seberapa lengkap dan kuat dokumen bukti pengalaman Anda (foto proyek, laporan, SK, dll)?',
    weight: 15,
    icon: '📁',
    tooltipLow: 'CRITICAL: Kumpulkan bukti konkret per unit kompetensi. Foto + laporan + SK penugasan lebih kuat dari sekedar deskripsi.',
    tooltipHigh: 'Bukti sudah cukup kuat. Pastikan terorganisir per UK sesuai urutan FR.APL.02.',
    actionLink: { label: 'Tips Portofolio', href: '/tips-lolos' },
  },
  {
    id: 'communication',
    label: 'Kemampuan Menjelaskan',
    desc: 'Seberapa lancar Anda menjelaskan pengalaman kerja secara struktural dan meyakinkan kepada asesor?',
    weight: 15,
    icon: '🎤',
    tooltipLow: 'Latih metode STAR: Situasi → Tugas → Aksi → Hasil. Rekam diri sendiri menjawab pertanyaan.',
    tooltipHigh: 'Kemampuan komunikasi baik. Coba latih jawaban untuk pertanyaan "mengapa" dan "bagaimana jika kondisi berubah".',
    actionLink: { label: 'Tips Wawancara', href: '/tips-lolos' },
  },
  {
    id: 'simulation',
    label: 'Latihan Soal & Simulasi',
    desc: 'Seberapa sering dan serius Anda berlatih soal dan simulasi wawancara asesor sebelum ini?',
    weight: 15,
    icon: '🎯',
    tooltipLow: 'Kerjakan minimal 3 sesi latihan soal penuh dan 2 simulasi wawancara sebelum asesmen.',
    tooltipHigh: 'Frekuensi latihan sudah baik. Fokus pada soal yang sering salah dan pertanyaan wawancara level tinggi.',
    actionLink: { label: 'Mock Asesmen', href: '/mock-asesmen' },
  },
  {
    id: 'consistency',
    label: 'Konsistensi Performa',
    desc: 'Apakah hasil latihan Anda konsisten dari sesi ke sesi, atau masih naik-turun signifikan?',
    weight: 10,
    icon: '📈',
    tooltipLow: 'Konsistensi lebih penting dari satu nilai tinggi. Ulangi materi yang hasilnya tidak stabil.',
    tooltipHigh: 'Konsistensi baik adalah sinyal kuat kesiapan yang sesungguhnya. Pertahankan.',
    actionLink: { label: 'Rencana Belajar', href: '/rencana-belajar' },
  },
  {
    id: 'evidence_prep',
    label: 'Kesiapan Dokumen Hari-H',
    desc: 'Seberapa siap dokumen fisik/digital Anda untuk dibawa ke asesmen (KTP, ijazah, portofolio, dll)?',
    weight: 3,
    icon: '📋',
    tooltipLow: 'Cek checklist dokumen lengkap dan siapkan H-3, bukan H-1.',
    tooltipHigh: 'Dokumen sudah siap. Pastikan ada backup digital semua dokumen di cloud storage.',
    actionLink: { label: 'Checklist Hari-H', href: '/hari-h' },
  },
  {
    id: 'learning_progress',
    label: 'Progres Belajar',
    desc: 'Seberapa jauh Anda sudah menyelesaikan rencana belajar dan materi unit kompetensi?',
    weight: 2,
    icon: '📅',
    tooltipLow: 'Buat rencana belajar terstruktur dan ikuti jadwal per minggu.',
    tooltipHigh: 'Progres belajar baik. Fokus review materi unit kompetensi yang masih terasa kurang mantap.',
    actionLink: { label: 'Rencana Belajar', href: '/rencana-belajar' },
  },
];

type ReadinessStatus = 'insufficient' | 'developing' | 'needs_improvement' | 'prepared' | 'high_readiness';

interface StatusConfig {
  label: string;
  labelId: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  desc: string;
  minScore: number;
}

const statusConfig: Record<ReadinessStatus, StatusConfig> = {
  insufficient: {
    label: 'INSUFFICIENT DATA',
    labelId: 'Data Belum Cukup',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    icon: '⏳',
    desc: 'Belum cukup data untuk menilai kesiapan. Selesaikan semua dimensi penilaian terlebih dahulu.',
    minScore: 0,
  },
  developing: {
    label: 'DEVELOPING',
    labelId: 'Sedang Berkembang',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: '🌱',
    desc: 'Masih ada gap signifikan yang perlu diatasi. Fokus pada area Critical dan Major Gap sebelum mendaftar asesmen.',
    minScore: 0,
  },
  needs_improvement: {
    label: 'NEEDS IMPROVEMENT',
    labelId: 'Perlu Penguatan',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: '📈',
    desc: 'Fondasi sudah ada tapi beberapa area kritis perlu diperkuat. Lanjutkan latihan terfokus.',
    minScore: 45,
  },
  prepared: {
    label: 'PREPARED',
    labelId: 'Siap',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: '✅',
    desc: 'Tingkat kesiapan sudah baik. Lanjutkan simulasi untuk memastikan konsistensi sebelum asesmen.',
    minScore: 65,
  },
  high_readiness: {
    label: 'HIGH READINESS',
    labelId: 'Siap Tinggi',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: '🚀',
    desc: 'Profil persiapan menunjukkan kesiapan tinggi berdasarkan data yang tersedia. Tetap jaga fokus dan kepercayaan diri.',
    minScore: 82,
  },
};

const levelConfig = {
  '1-4': { label: 'Foundation (Level 1–4)', icon: '🔨', coaching: 'Tutor', focus: 'Dapat melakukan pekerjaan sesuai prosedur', color: 'text-amber-400' },
  '5-6': { label: 'Professional (Level 5–6)', icon: '⚙️', coaching: 'Coach', focus: 'Menerapkan, mengendalikan, dan memecahkan masalah', color: 'text-blue-400' },
  '7-9': { label: 'Expert (Level 7–9)', icon: '🎓', coaching: 'Challenger', focus: 'Menganalisis, memutuskan, dan mempertanggungjawabkan', color: 'text-purple-400' },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SIAPIndexPage() {
  const [scores, setScores] = useState<Partial<Record<DimensionId, number>>>({});
  const [level, setLevel] = useState<keyof typeof levelConfig | ''>('');
  const [submitted, setSubmitted] = useState(false);
  const [activeDim, setActiveDim] = useState<DimensionId | null>(null);

  const allFilled = Object.keys(scores).length === dimensions.length;

  // Compute SIAP Index
  const siapIndex = useMemo(() => {
    if (!allFilled) return null;
    let total = 0;
    for (const dim of dimensions) {
      const s = scores[dim.id] ?? 0;
      // Convert 1-5 scale to 0-100, weight it
      total += ((s - 1) / 4) * 100 * (dim.weight / 100);
    }
    return Math.round(total);
  }, [scores, allFilled]);

  // Gap analysis
  const dimResults = useMemo(() => {
    return dimensions.map(dim => {
      const s = scores[dim.id];
      if (s === undefined) return { dim, pct: null, gapLevel: null };
      const pct = Math.round(((s - 1) / 4) * 100);
      const gapLevel = pct >= 75 ? 'strong' : pct >= 50 ? 'moderate' : pct >= 25 ? 'major' : 'critical';
      return { dim, pct, gapLevel };
    });
  }, [scores]);

  // Readiness status
  const status: ReadinessStatus = useMemo(() => {
    if (!submitted || siapIndex === null) return 'insufficient';
    // Check if any critical gap
    const hasCritical = dimResults.some(d => d.gapLevel === 'critical');
    if (hasCritical || siapIndex < 45) return 'developing';
    if (siapIndex < 65) return 'needs_improvement';
    if (siapIndex < 82) return 'prepared';
    return 'high_readiness';
  }, [siapIndex, dimResults, submitted]);

  const sc = statusConfig[status];
  const lc = level ? levelConfig[level] : null;

  const criticalGaps = dimResults.filter(d => d.gapLevel === 'critical' || d.gapLevel === 'major');
  const strengths = dimResults.filter(d => d.gapLevel === 'strong');
  const nextBestAction = criticalGaps[0];

  const handleScore = (dimId: DimensionId, val: number) => {
    setScores(prev => ({ ...prev, [dimId]: val }));
  };

  const handleSubmit = () => {
    if (!allFilled) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setScores({});
    setSubmitted(false);
    setLevel('');
    setActiveDim(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium mb-4">
            📊 SIAP Readiness Index — Bukan Keputusan Asesmen
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Indeks <span className="text-indigo-400">Kesiapan</span> Uji Kompetensi
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
            Nilai kesiapan persiapan Anda di 8 dimensi. Hasilnya adalah <strong className="text-slate-300">indikator kesiapan</strong>, bukan keputusan kompeten/belum kompeten — yang merupakan kewenangan Asesor dan LSP.
          </p>
        </div>

        {/* Result card — shown after submit */}
        {submitted && siapIndex !== null && (
          <div className={`rounded-2xl border p-6 space-y-5 ${sc.bg} ${sc.border}`}>
            {/* Score & Status */}
            <div className="flex items-center gap-5">
              <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-slate-900/50 border border-slate-700/50 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${sc.color}`}>{siapIndex}</span>
                <span className="text-slate-500 text-xs">/100</span>
              </div>
              <div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-2 ${sc.bg} ${sc.color} ${sc.border}`}>
                  <span>{sc.icon}</span> {sc.label}
                </div>
                <p className={`text-lg font-bold ${sc.color}`}>{sc.labelId}</p>
                <p className="text-slate-400 text-sm leading-relaxed mt-1 max-w-sm">{sc.desc}</p>
              </div>
            </div>

            {/* Level mode */}
            {lc && (
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/40 flex items-center gap-3">
                <span className="text-xl">{lc.icon}</span>
                <div>
                  <p className={`text-sm font-semibold ${lc.color}`}>{lc.label}</p>
                  <p className="text-slate-500 text-xs">Mode AI yang paling cocok: <span className="text-white font-medium">{lc.coaching}</span> — {lc.focus}</p>
                </div>
              </div>
            )}

            {/* Dimension bars */}
            <div className="space-y-2">
              {dimResults.map(({ dim, pct, gapLevel }) => {
                if (pct === null) return null;
                const barColor =
                  gapLevel === 'strong' ? 'bg-green-500' :
                  gapLevel === 'moderate' ? 'bg-blue-500' :
                  gapLevel === 'major' ? 'bg-amber-500' : 'bg-red-500';
                const labelColor =
                  gapLevel === 'strong' ? 'text-green-400' :
                  gapLevel === 'moderate' ? 'text-blue-400' :
                  gapLevel === 'major' ? 'text-amber-400' : 'text-red-400';
                const gapTag =
                  gapLevel === 'strong' ? 'Kuat' :
                  gapLevel === 'moderate' ? 'Cukup' :
                  gapLevel === 'major' ? 'Major Gap' : 'Critical Gap';
                return (
                  <div key={dim.id}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-slate-400">{dim.icon} {dim.label}</span>
                      <span className={`text-xs font-medium ${labelColor}`}>{gapTag} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Strengths & Gaps */}
            <div className="grid sm:grid-cols-2 gap-3">
              {strengths.length > 0 && (
                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <p className="text-green-400 text-xs font-semibold mb-1.5">💪 Area Kuat</p>
                  {strengths.map(({ dim }) => (
                    <p key={dim.id} className="text-slate-300 text-xs">{dim.icon} {dim.label}</p>
                  ))}
                </div>
              )}
              {criticalGaps.length > 0 && (
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-red-400 text-xs font-semibold mb-1.5">⚠️ Prioritas Penguatan</p>
                  {criticalGaps.slice(0, 3).map(({ dim, gapLevel }) => (
                    <p key={dim.id} className="text-slate-300 text-xs">{dim.icon} {dim.label}
                      <span className={`ml-1 text-xs ${gapLevel === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                        ({gapLevel === 'critical' ? 'Critical' : 'Major'})
                      </span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Next Best Action */}
            {nextBestAction && nextBestAction.dim.actionLink && (
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">🎯</span>
                <div className="flex-1 min-w-0">
                  <p className="text-indigo-300 font-semibold text-sm">Next Best Action</p>
                  <p className="text-slate-400 text-xs mt-0.5">{nextBestAction.dim.tooltipLow}</p>
                </div>
                <Link
                  href={nextBestAction.dim.actionLink.href}
                  className="flex-shrink-0 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {nextBestAction.dim.actionLink.label} →
                </Link>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/40">
              <p className="text-slate-500 text-xs leading-relaxed">
                ⚖️ <strong className="text-slate-400">Disclaimer:</strong> Indeks ini merupakan hasil self-assessment persiapan dan <strong>bukan keputusan hasil asesmen sertifikasi</strong>. Keputusan Kompeten/Belum Kompeten adalah kewenangan Asesor Kompetensi yang ditugaskan LSP. SIAP Index tidak menjamin kelulusan.
              </p>
            </div>

            <button onClick={handleReset} className="w-full py-2.5 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 rounded-xl text-sm transition-colors">
              🔄 Nilai Ulang
            </button>
          </div>
        )}

        {/* Form — shown before submit */}
        {!submitted && (
          <div className="space-y-6">
            {/* Level selector */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-3">
              <p className="text-white font-semibold text-sm">1. Pilih Jenjang KKNI Anda</p>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(levelConfig) as [keyof typeof levelConfig, typeof levelConfig[keyof typeof levelConfig]][]).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setLevel(key)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      level === key
                        ? 'bg-indigo-500/20 border-indigo-500/50 ' + val.color
                        : 'bg-slate-700/30 border-slate-600/40 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-xl mb-1">{val.icon}</div>
                    <p className="text-xs font-medium leading-tight">{val.label}</p>
                    <p className="text-xs opacity-60 mt-0.5">Mode: {val.coaching}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-6">
              <p className="text-white font-semibold text-sm">2. Nilai Kesiapan Anda per Dimensi</p>
              <p className="text-slate-500 text-xs -mt-3">Jujur = hasil lebih akurat. Tidak ada jawaban benar/salah.</p>

              {dimensions.map((dim, i) => {
                const val = scores[dim.id];
                return (
                  <div key={dim.id} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0 mt-0.5">{dim.icon}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{i + 2}. {dim.label}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{dim.desc}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { v: 1, label: 'Belum sama sekali' },
                        { v: 2, label: 'Masih lemah' },
                        { v: 3, label: 'Cukup' },
                        { v: 4, label: 'Baik' },
                        { v: 5, label: 'Sangat siap' },
                      ].map(({ v, label }) => (
                        <button
                          key={v}
                          onClick={() => handleScore(dim.id, v)}
                          className={`py-2 rounded-lg border text-center transition-all flex flex-col items-center ${
                            val === v
                              ? v <= 2
                                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                : v === 3
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                : 'bg-green-500/20 border-green-500/50 text-green-400'
                              : 'bg-slate-700/30 border-slate-600/40 text-slate-500 hover:border-slate-500'
                          }`}
                          title={label}
                        >
                          <span className="text-sm font-bold">{v}</span>
                          <span className="text-xs leading-tight hidden sm:block" style={{ fontSize: '9px' }}>{label}</span>
                        </button>
                      ))}
                    </div>
                    {val && (
                      <p className="text-xs text-slate-500 pl-1">
                        💡 {val <= 2 ? dim.tooltipLow : dim.tooltipHigh}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress & Submit */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Dimensi terisi</span>
                <span className={`font-semibold ${allFilled ? 'text-green-400' : 'text-slate-300'}`}>
                  {Object.keys(scores).length} / {dimensions.length}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${(Object.keys(scores).length / dimensions.length) * 100}%` }}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!allFilled}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  allFilled
                    ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {allFilled ? '📊 Lihat SIAP Index Saya' : `Lengkapi ${dimensions.length - Object.keys(scores).length} dimensi lagi`}
              </button>
              {!level && allFilled && (
                <p className="text-amber-400 text-xs text-center">⚠️ Pilih jenjang KKNI di atas untuk hasil lebih personal</p>
              )}
            </div>
          </div>
        )}

        {/* Bottom links */}
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: '🎯', name: 'Mock Asesmen', desc: 'Latihan soal per jabatan', href: '/mock-asesmen' },
            { icon: '🏆', name: 'Tips Lolos Asesmen', desc: 'Strategi per bagian asesmen', href: '/tips-lolos' },
            { icon: '📚', name: 'Rencana Belajar', desc: 'Jadwal belajar personal', href: '/rencana-belajar' },
            { icon: '📁', name: 'Checklist Hari-H', desc: 'Persiapan dokumen & logistik', href: '/hari-h' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-indigo-500/40 transition-colors">
              <span className="text-2xl flex-shrink-0">{l.icon}</span>
              <div><p className="text-white text-sm font-medium">{l.name}</p><p className="text-slate-500 text-xs">{l.desc}</p></div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
