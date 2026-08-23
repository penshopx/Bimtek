'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface UnitKompetensi {
  kode: string;
  judul: string;
  deskripsi: string;
  durasi: number; // jam belajar estimasi
  prio: 'tinggi' | 'sedang' | 'rendah';
}

interface JabatanData {
  id: string;
  nama: string;
  level: number;
  bidang: string;
  uk: UnitKompetensi[];
}

const jabatanList: JabatanData[] = [
  {
    id: 'ahli-sipil-muda', nama: 'Ahli Teknik Sipil – Ahli Muda', level: 6, bidang: 'Sipil',
    uk: [
      { kode: 'F.410000.001', judul: 'Menerapkan SMK3 di Lingkungan Kerja', deskripsi: 'Identifikasi bahaya, APD, JSA, permit to work', durasi: 4, prio: 'tinggi' },
      { kode: 'F.410000.010', judul: 'Membuat Desain & Gambar Teknik', deskripsi: 'AutoCAD, gambar konstruksi, as-built drawing', durasi: 6, prio: 'tinggi' },
      { kode: 'F.410000.020', judul: 'Menghitung Volume & Estimasi Biaya', deskripsi: 'Take-off kuantitas, analisa harga satuan, RAB', durasi: 5, prio: 'tinggi' },
      { kode: 'F.410000.030', judul: 'Merencanakan Jadwal Pelaksanaan', deskripsi: 'S-curve, network diagram, bar chart, CPM', durasi: 4, prio: 'sedang' },
      { kode: 'F.410000.040', judul: 'Mengendalikan Mutu Konstruksi', deskripsi: 'QA/QC, ITP, uji material beton dan baja', durasi: 5, prio: 'tinggi' },
      { kode: 'F.410000.050', judul: 'Melaksanakan Pengawasan Lapangan', deskripsi: 'Supervisi harian, NCR, laporan progres', durasi: 4, prio: 'sedang' },
      { kode: 'F.410000.060', judul: 'Menyusun Laporan Teknis', deskripsi: 'Daily report, monthly report, as-built report', durasi: 3, prio: 'sedang' },
      { kode: 'F.410000.070', judul: 'Membaca & Memahami Spesifikasi Teknis', deskripsi: 'SNI, spesifikasi material, toleransi', durasi: 3, prio: 'rendah' },
    ],
  },
  {
    id: 'ahli-sipil-madya', nama: 'Ahli Teknik Sipil – Ahli Madya', level: 7, bidang: 'Sipil',
    uk: [
      { kode: 'F.410000.001', judul: 'Menerapkan SMK3 Konstruksi', deskripsi: 'SMK3, audit K3, sistem manajemen keselamatan', durasi: 4, prio: 'tinggi' },
      { kode: 'F.410000.011', judul: 'Merencanakan Struktur Gedung', deskripsi: 'SNI 1726 (gempa), SNI 1727 (beban), SAP2000', durasi: 8, prio: 'tinggi' },
      { kode: 'F.410000.021', judul: 'Merancang Pondasi Bangunan', deskripsi: 'Analisis tanah, pondasi dangkal & dalam, pile', durasi: 6, prio: 'tinggi' },
      { kode: 'F.410000.031', judul: 'Mengelola Risiko Proyek', deskripsi: 'Identifikasi risiko, mitigasi, monitoring risiko', durasi: 5, prio: 'tinggi' },
      { kode: 'F.410000.041', judul: 'Mengendalikan Biaya & Waktu', deskripsi: 'EVM, BCWS, BCWP, ACWP, SPI, CPI', durasi: 5, prio: 'sedang' },
      { kode: 'F.410000.051', judul: 'Memimpin Tim Teknis', deskripsi: 'Koordinasi engineer, delegasi tugas, mentoring', durasi: 3, prio: 'sedang' },
      { kode: 'F.410000.061', judul: 'Menyusun Spesifikasi Teknis', deskripsi: 'RKS, spesifikasi material, syarat mutu', durasi: 4, prio: 'rendah' },
      { kode: 'F.410000.071', judul: 'Melakukan Investigasi Lapangan', deskripsi: 'Soil investigation, bore log, SPT', durasi: 4, prio: 'sedang' },
    ],
  },
  {
    id: 'manager-proyek', nama: 'Manager Proyek Konstruksi', level: 7, bidang: 'Manajemen',
    uk: [
      { kode: 'M.711000.001', judul: 'Menyusun Rencana Proyek (Project Plan)', deskripsi: 'Scope, WBS, jadwal, anggaran, resource plan', durasi: 6, prio: 'tinggi' },
      { kode: 'M.711000.010', judul: 'Mengelola Waktu Proyek', deskripsi: 'CPM, S-curve, schedule recovery, crashing', durasi: 5, prio: 'tinggi' },
      { kode: 'M.711000.020', judul: 'Mengelola Biaya Proyek', deskripsi: 'Cost control, cashflow, change order, EVM', durasi: 6, prio: 'tinggi' },
      { kode: 'M.711000.030', judul: 'Mengelola Sumber Daya Manusia', deskripsi: 'Resource leveling, mobilisasi, evaluasi kinerja', durasi: 4, prio: 'sedang' },
      { kode: 'M.711000.040', judul: 'Mengelola Pengadaan & Kontrak', deskripsi: 'Procurement, administrasi kontrak, klaim', durasi: 5, prio: 'tinggi' },
      { kode: 'M.711000.050', judul: 'Mengelola Mutu Proyek', deskripsi: 'Quality plan, audit mutu, NCR, acceptance test', durasi: 4, prio: 'sedang' },
      { kode: 'M.711000.060', judul: 'Mengelola Risiko Proyek', deskripsi: 'Risk register, FMEA, contingency plan', durasi: 4, prio: 'tinggi' },
      { kode: 'M.711000.070', judul: 'Mengelola Komunikasi & Stakeholder', deskripsi: 'Rapat proyek, laporan progres, RFI, RFQ', durasi: 3, prio: 'sedang' },
    ],
  },
  {
    id: 'k3-konstruksi', nama: 'Ahli K3 Konstruksi', level: 6, bidang: 'K3',
    uk: [
      { kode: 'F.430000.001', judul: 'Mengidentifikasi Bahaya di Tempat Kerja', deskripsi: 'HIRA, Job Safety Analysis, toolbox meeting', durasi: 5, prio: 'tinggi' },
      { kode: 'F.430000.010', judul: 'Menerapkan Sistem Manajemen K3', deskripsi: 'PP 50/2012, SMK3, OHSAS 18001/ISO 45001', durasi: 6, prio: 'tinggi' },
      { kode: 'F.430000.020', judul: 'Membuat Rencana K3 Konstruksi (RK3K)', deskripsi: 'RK3K, HSE Plan, Job Hazard Analysis', durasi: 5, prio: 'tinggi' },
      { kode: 'F.430000.030', judul: 'Mengelola Keadaan Darurat', deskripsi: 'ERP, simulasi kedaruratan, P3K, evakuasi', durasi: 4, prio: 'tinggi' },
      { kode: 'F.430000.040', judul: 'Melakukan Inspeksi & Audit K3', deskripsi: 'Safety inspection, audit internal, NCR K3', durasi: 5, prio: 'sedang' },
      { kode: 'F.430000.050', judul: 'Menyelidiki Kecelakaan Kerja', deskripsi: 'Incident investigation, root cause analysis, LTI', durasi: 4, prio: 'sedang' },
      { kode: 'F.430000.060', judul: 'Mengelola Peraturan K3 Konstruksi', deskripsi: 'UU 1/1970, UU 2/2017, Permen PUPR K3', durasi: 4, prio: 'tinggi' },
      { kode: 'F.430000.070', judul: 'Menyusun Laporan K3', deskripsi: 'Safety report, statistics, leading/lagging indicator', durasi: 3, prio: 'rendah' },
    ],
  },
  {
    id: 'pelaksana-sipil', nama: 'Pelaksana Lapangan Pekerjaan Sipil', level: 4, bidang: 'Sipil',
    uk: [
      { kode: 'F.410000.002', judul: 'Menerapkan K3 di Pekerjaan Sipil', deskripsi: 'APD, safety sign, permit kerja, toolbox', durasi: 3, prio: 'tinggi' },
      { kode: 'F.410000.012', judul: 'Membaca Gambar Kerja', deskripsi: 'Denah, potongan, detail, simbol gambar teknik', durasi: 4, prio: 'tinggi' },
      { kode: 'F.410000.022', judul: 'Melaksanakan Pekerjaan Tanah', deskripsi: 'Galian, timbunan, pemadatan, dewatering', durasi: 4, prio: 'tinggi' },
      { kode: 'F.410000.032', judul: 'Melaksanakan Pekerjaan Beton', deskripsi: 'Bekisting, pembesian, pengecoran, curing', durasi: 5, prio: 'tinggi' },
      { kode: 'F.410000.042', judul: 'Mengendalikan Mutu Pekerjaan', deskripsi: 'Uji slump, kubus beton, pemeriksaan lapangan', durasi: 4, prio: 'sedang' },
      { kode: 'F.410000.052', judul: 'Membuat Laporan Harian', deskripsi: 'Daily report: cuaca, progres, material, alat', durasi: 2, prio: 'sedang' },
      { kode: 'F.410000.062', judul: 'Mengoperasikan Alat Ukur', deskripsi: 'Waterpass, theodolite, GPS, total station', durasi: 4, prio: 'sedang' },
    ],
  },
  {
    id: 'ahli-jalan', nama: 'Ahli Teknik Jalan – Ahli Muda', level: 6, bidang: 'Jalan',
    uk: [
      { kode: 'F.421100.001', judul: 'Menerapkan K3 Pekerjaan Jalan', deskripsi: 'Traffic management, APD, safety signage jalan', durasi: 3, prio: 'tinggi' },
      { kode: 'F.421100.010', judul: 'Merencanakan Geometri Jalan', deskripsi: 'Alinyemen horizontal & vertikal, superelevasi', durasi: 6, prio: 'tinggi' },
      { kode: 'F.421100.020', judul: 'Merencanakan Perkerasan Jalan', deskripsi: 'Tebal perkerasan lentur & kaku, CBR, ESAL', durasi: 6, prio: 'tinggi' },
      { kode: 'F.421100.030', judul: 'Merencanakan Drainase Jalan', deskripsi: 'Saluran tepi, gorong-gorong, debit limpasan', durasi: 4, prio: 'sedang' },
      { kode: 'F.421100.040', judul: 'Mengendalikan Mutu Perkerasan', deskripsi: 'Marshall test, density, gradasi agregat', durasi: 5, prio: 'tinggi' },
      { kode: 'F.421100.050', judul: 'Melaksanakan Pengawasan Pekerjaan Jalan', deskripsi: 'Daily inspection, NCR, laporan progres', durasi: 4, prio: 'sedang' },
      { kode: 'F.421100.060', judul: 'Menyusun Estimasi Biaya Jalan', deskripsi: 'HSPK jalan, analisa harga satuan Bina Marga', durasi: 4, prio: 'sedang' },
    ],
  },
];

// ─── Study plan generator ─────────────────────────────────────────────────────

interface StudyWeek {
  week: number;
  label: string;
  theme: string;
  icon: string;
  items: StudyItem[];
}

interface StudyItem {
  id: string;
  type: 'uk' | 'review' | 'latihan' | 'harih';
  label: string;
  desc: string;
  jam: number;
  prio?: 'tinggi' | 'sedang' | 'rendah';
}

function generatePlan(jabatan: JabatanData, daysLeft: number, jamPerHari: number): StudyWeek[] {
  const weeks: StudyWeek[] = [];
  const ukHighPrio = jabatan.uk.filter(u => u.prio === 'tinggi');
  const ukOther = jabatan.uk.filter(u => u.prio !== 'tinggi');

  // Week 1: Orientasi & Dokumen
  weeks.push({
    week: 1, label: 'Minggu 1', theme: 'Orientasi & Persiapan Dokumen', icon: '📋',
    items: [
      { id: 'w1-1', type: 'review', label: 'Pelajari Skema Sertifikasi', desc: 'Unduh dan baca skema sertifikasi jabatan dari BNSP/LSP', jam: 2, prio: 'tinggi' },
      { id: 'w1-2', type: 'review', label: 'Inventarisasi Bukti Kompetensi', desc: 'Kumpulkan semua sertifikat pelatihan, SK penugasan, dan bukti pengalaman kerja', jam: 3, prio: 'tinggi' },
      { id: 'w1-3', type: 'review', label: 'Isi FR.APL.01 (Formulir Permohonan)', desc: 'Isi data diri, riwayat kerja, dan pilihan metode asesmen', jam: 2, prio: 'tinggi' },
      { id: 'w1-4', type: 'review', label: 'Mulai FR.APL.02 (Asesmen Mandiri)', desc: 'Review tiap unit kompetensi dan tandai yang sudah Anda kuasai', jam: 4, prio: 'tinggi' },
    ],
  });

  // Week 2+: Unit Kompetensi Prioritas Tinggi
  const ukChunks: UnitKompetensi[][] = [];
  const itemsPerWeek = Math.max(2, Math.floor(jamPerHari * 7 / 5)); // avg ~5 jam per UK
  let chunk: UnitKompetensi[] = [];
  for (const uk of ukHighPrio) {
    chunk.push(uk);
    if (chunk.length >= itemsPerWeek) { ukChunks.push(chunk); chunk = []; }
  }
  if (chunk.length > 0) ukChunks.push(chunk);

  ukChunks.forEach((c, i) => {
    weeks.push({
      week: i + 2, label: `Minggu ${i + 2}`, theme: `Unit Kompetensi Prioritas Tinggi (${i + 1}/${ukChunks.length})`, icon: '📚',
      items: c.map(uk => ({
        id: uk.kode, type: 'uk', label: uk.judul, desc: uk.deskripsi, jam: uk.durasi, prio: uk.prio,
      })),
    });
  });

  // Next: UK Prioritas Sedang/Rendah
  if (ukOther.length > 0) {
    const w = weeks.length + 1;
    weeks.push({
      week: w, label: `Minggu ${w}`, theme: 'Unit Kompetensi Tambahan', icon: '📖',
      items: ukOther.map(uk => ({
        id: uk.kode, type: 'uk', label: uk.judul, desc: uk.deskripsi, jam: uk.durasi, prio: uk.prio,
      })),
    });
  }

  // Review & Latihan Soal
  const wrev = weeks.length + 1;
  weeks.push({
    week: wrev, label: `Minggu ${wrev}`, theme: 'Review Menyeluruh & Latihan Soal', icon: '🎯',
    items: [
      { id: 'rev-1', type: 'latihan', label: 'Latihan Soal Mock Asesmen (Domain 1–3)', desc: 'Kerjakan minimal 30 soal di SIAP SKK Mock Asesmen', jam: 3 },
      { id: 'rev-2', type: 'latihan', label: 'Latihan Soal Mock Asesmen (Domain 4–7)', desc: 'Fokus pada domain yang nilai latihan paling rendah', jam: 3 },
      { id: 'rev-3', type: 'review', label: 'Review Catatan Semua UK', desc: 'Baca ulang rangkuman tiap UK, perkuat yang masih lemah', jam: 4 },
      { id: 'rev-4', type: 'latihan', label: 'Latihan Wawancara (Metode STAR)', desc: 'Siapkan 2–3 contoh proyek nyata per unit kompetensi', jam: 4 },
      { id: 'rev-5', type: 'review', label: 'Selesaikan & Periksa FR.APL.02', desc: 'Pastikan semua kolom diisi lengkap dengan bukti konkret', jam: 3 },
    ],
  });

  // H-7 hingga H
  const wfinal = weeks.length + 1;
  weeks.push({
    week: wfinal, label: `Minggu ${wfinal}`, theme: 'Persiapan Hari-H', icon: '🏁',
    items: [
      { id: 'hh-1', type: 'harih', label: 'Cetak & Jilid Semua Dokumen', desc: 'Cetak FR.APL.01, FR.APL.02, portofolio, dokumen pendukung', jam: 2 },
      { id: 'hh-2', type: 'harih', label: 'Survei Lokasi TUK (H-3)', desc: 'Cek rute, parkir, dan estimasi waktu tempuh', jam: 1 },
      { id: 'hh-3', type: 'latihan', label: 'Sesi Latihan Soal Final', desc: 'Kerjakan 20 soal terpilih dari domain terlemah', jam: 2 },
      { id: 'hh-4', type: 'harih', label: 'Cek Perlengkapan (Panduan Hari-H)', desc: 'Gunakan checklist di halaman Hari-H Asesmen', jam: 1 },
      { id: 'hh-5', type: 'harih', label: 'Istirahat Cukup H-1', desc: 'Tidur 7–8 jam, sarapan bergizi, berangkat 30 menit lebih awal', jam: 0 },
    ],
  });

  return weeks;
}

// ─── Constants & helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'siapskk_rencana_belajar';
const prio_color: Record<string, string> = {
  tinggi: 'text-red-400 bg-red-500/10',
  sedang: 'text-amber-400 bg-amber-500/10',
  rendah: 'text-green-400 bg-green-500/10',
};
const type_icon: Record<string, string> = {
  uk: '📚', review: '📝', latihan: '🎯', harih: '🏁',
};
const type_color: Record<string, string> = {
  uk: 'border-blue-500/30',
  review: 'border-amber-500/30',
  latihan: 'border-green-500/30',
  harih: 'border-purple-500/30',
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function RencanaBelajarPage() {
  const [jabatanId, setJabatanId] = useState('');
  const [ujianDate, setUjianDate] = useState('');
  const [jamPerHari, setJamPerHari] = useState(2);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [generated, setGenerated] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.jabatanId) setJabatanId(d.jabatanId);
        if (d.ujianDate) setUjianDate(d.ujianDate);
        if (d.jamPerHari) setJamPerHari(d.jamPerHari);
        if (d.checked) setChecked(d.checked);
        if (d.generated) setGenerated(d.generated);
      }
    } catch {}
  }, []);

  const save = (updates: object) => {
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...updates }));
    } catch {}
  };

  const jabatan = jabatanList.find(j => j.id === jabatanId) ?? null;

  const daysLeft = useMemo(() => {
    if (!ujianDate) return 0;
    const diff = new Date(ujianDate).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [ujianDate]);

  const plan = useMemo(() => {
    if (!jabatan || !ujianDate || !generated) return null;
    return generatePlan(jabatan, daysLeft, jamPerHari);
  }, [jabatan, ujianDate, jamPerHari, generated]);

  const totalItems = plan ? plan.flatMap(w => w.items).length : 0;
  const doneItems = plan ? plan.flatMap(w => w.items).filter(i => checked[i.id]).length : 0;
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const totalJam = plan ? plan.flatMap(w => w.items).reduce((s, i) => s + i.jam, 0) : 0;

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    save({ checked: next });
  };

  const handleGenerate = () => {
    if (!jabatanId || !ujianDate) return;
    setGenerated(true);
    save({ jabatanId, ujianDate, jamPerHari, generated: true });
  };

  const handleReset = () => {
    setGenerated(false);
    setChecked({});
    save({ generated: false, checked: {} });
  };

  // Today's recommended topic
  const todayItem = plan
    ? plan.flatMap(w => w.items).find(i => !checked[i.id])
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium mb-4">
            📅 Rencana Belajar SKK Personal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Rencana <span className="text-purple-400">Belajar SKK</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Masukkan jabatan target dan tanggal ujian — sistem otomatis buat jadwal belajar per minggu lengkap dengan progress tracker.
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-lg">🎯 Target Sertifikasi</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Jabatan SKK Target</label>
              <select
                value={jabatanId}
                onChange={e => { setJabatanId(e.target.value); setGenerated(false); save({ jabatanId: e.target.value, generated: false }); }}
                className="w-full px-3 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">— Pilih Jabatan —</option>
                {jabatanList.map(j => (
                  <option key={j.id} value={j.id}>{j.nama} (Level {j.level})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Rencana Tanggal Ujian</label>
              <input
                type="date"
                value={ujianDate}
                min={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}
                onChange={e => { setUjianDate(e.target.value); setGenerated(false); save({ ujianDate: e.target.value, generated: false }); }}
                className="w-full px-3 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Waktu Belajar per Hari: <span className="text-purple-400 font-bold">{jamPerHari} jam</span>
              </label>
              <input
                type="range" min={1} max={8} step={0.5} value={jamPerHari}
                onChange={e => { setJamPerHari(+e.target.value); setGenerated(false); save({ jamPerHari: +e.target.value, generated: false }); }}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1 jam (santai)</span>
                <span>4 jam</span>
                <span>8 jam (intensif)</span>
              </div>
            </div>
          </div>

          {jabatan && ujianDate && (
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900/40 rounded-xl">
              <div className="text-center">
                <div className={`text-2xl font-bold ${daysLeft < 30 ? 'text-red-400' : daysLeft < 60 ? 'text-amber-400' : 'text-green-400'}`}>{daysLeft}</div>
                <div className="text-slate-400 text-xs">Hari Tersisa</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{Math.round(daysLeft * jamPerHari)}</div>
                <div className="text-slate-400 text-xs">Total Jam Belajar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{jabatan.uk.length}</div>
                <div className="text-slate-400 text-xs">Unit Kompetensi</div>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!jabatanId || !ujianDate}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-sm transition-colors"
          >
            {generated ? '🔄 Buat Ulang Rencana Belajar' : '✨ Buat Rencana Belajar'}
          </button>
        </div>

        {/* Plan */}
        {plan && (
          <>
            {/* Stats bar */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-semibold">📊 Progress Belajar</h2>
                  <p className="text-slate-400 text-sm">{jabatan!.nama}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-400">{pct}%</div>
                  <div className="text-slate-500 text-xs">{doneItems}/{totalItems} selesai</div>
                </div>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{plan.length}</div>
                  <div className="text-slate-500 text-xs">Minggu</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{totalJam}</div>
                  <div className="text-slate-500 text-xs">Jam Belajar</div>
                </div>
                <div>
                  <div className={`text-lg font-bold ${daysLeft < 30 ? 'text-red-400' : 'text-green-400'}`}>{daysLeft}</div>
                  <div className="text-slate-500 text-xs">Hari Lagi</div>
                </div>
              </div>
            </div>

            {/* Today's topic */}
            {todayItem && (
              <div className="flex items-start gap-4 p-5 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
                <span className="text-3xl flex-shrink-0">💡</span>
                <div>
                  <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">Lanjutkan Sekarang</p>
                  <p className="text-white font-semibold">{todayItem.label}</p>
                  <p className="text-slate-400 text-sm mt-0.5">{todayItem.desc}</p>
                  {todayItem.jam > 0 && (
                    <p className="text-purple-400 text-xs mt-1">⏱ Estimasi {todayItem.jam} jam</p>
                  )}
                </div>
              </div>
            )}

            {pct === 100 && (
              <div className="flex items-center gap-4 p-5 bg-green-500/10 border border-green-500/30 rounded-2xl">
                <span className="text-4xl">🎉</span>
                <div>
                  <p className="text-green-300 font-semibold">Semua materi selesai!</p>
                  <p className="text-green-400/70 text-sm">Anda sudah menyelesaikan seluruh rencana belajar. Semoga sukses di hari asesmen!</p>
                </div>
              </div>
            )}

            {/* Weekly plan */}
            <div className="space-y-4">
              {plan.map(week => {
                const weekDone = week.items.filter(i => checked[i.id]).length;
                const weekPct = Math.round((weekDone / week.items.length) * 100);
                return (
                  <WeekCard
                    key={week.week}
                    week={week}
                    checked={checked}
                    onToggle={toggle}
                    weekDone={weekDone}
                    weekPct={weekPct}
                  />
                );
              })}
            </div>

            <div className="text-center">
              <button
                onClick={handleReset}
                className="text-sm text-slate-600 hover:text-slate-400 transition-colors"
              >
                Reset rencana belajar
              </button>
            </div>
          </>
        )}

        {/* CTA */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/mock-asesmen" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-purple-500/40 transition-colors">
            <span className="text-xl">🎯</span>
            <div>
              <p className="text-white text-sm font-medium">Mock Asesmen</p>
              <p className="text-slate-500 text-xs">Latihan soal AI</p>
            </div>
          </Link>
          <Link href="/hari-h" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-purple-500/40 transition-colors">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-white text-sm font-medium">Panduan Hari-H</p>
              <p className="text-slate-500 text-xs">Checklist hari ujian</p>
            </div>
          </Link>
          <Link href="/klinik-uji-kompetensi" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-purple-500/40 transition-colors">
            <span className="text-xl">🏥</span>
            <div>
              <p className="text-white text-sm font-medium">Klinik SKK</p>
              <p className="text-slate-500 text-xs">Jalur persiapan lengkap</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── WeekCard ─────────────────────────────────────────────────────────────────

function WeekCard({
  week, checked, onToggle, weekDone, weekPct,
}: {
  week: StudyWeek;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  weekDone: number;
  weekPct: number;
}) {
  const [open, setOpen] = useState(weekPct < 100);

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-700/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-2xl flex-shrink-0">{week.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-slate-400 text-xs font-semibold">{week.label}</span>
            {weekPct === 100 && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓ Selesai</span>}
          </div>
          <p className="text-white text-sm font-semibold">{week.theme}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${weekPct}%` }} />
            </div>
            <span className="text-xs text-slate-500">{weekDone}/{week.items.length}</span>
          </div>
        </div>
        <span className="text-slate-500 text-sm flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-2">
          {week.items.map(item => (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                checked[item.id]
                  ? 'bg-green-500/10 border-green-500/30'
                  : `bg-slate-700/30 ${type_color[item.type]} border hover:border-slate-600`
              }`}
            >
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={() => onToggle(item.id)}
                className="w-4 h-4 rounded accent-purple-500 flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>{type_icon[item.type]}</span>
                  <span className={`text-sm font-medium transition-colors ${checked[item.id] ? 'line-through text-slate-500' : 'text-white'}`}>
                    {item.label}
                  </span>
                  {item.prio && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${prio_color[item.prio]}`}>
                      {item.prio}
                    </span>
                  )}
                  {item.jam > 0 && (
                    <span className="text-xs text-slate-500">⏱ {item.jam}j</span>
                  )}
                </div>
                {item.desc && (
                  <p className={`text-xs mt-0.5 transition-colors ${checked[item.id] ? 'text-slate-600' : 'text-slate-400'}`}>{item.desc}</p>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
