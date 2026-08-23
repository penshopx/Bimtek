'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'siapskk_timeline_progress';

type Path = 'hardcopy' | 'paperless' | 'ajj';

interface Step {
  id: string;
  phase: number;
  title: string;
  subtitle: string;
  duration: string;
  actor: string;
  icon: string;
  color: string;
  paths: Path[];
  description: string;
  actions: string[];
  documents: string[];
  tips: string[];
  pitfalls: string[];
  cost?: string;
  note?: string;
}

const steps: Step[] = [
  {
    id: 'persiapan-awal',
    phase: 1,
    title: 'Persiapan Awal',
    subtitle: 'Pilih jabatan & periksa kelayakan',
    duration: '1–2 minggu',
    actor: 'Asesi',
    icon: '🔍',
    color: 'cyan',
    paths: ['hardcopy', 'paperless', 'ajj'],
    description:
      'Langkah paling kritis. Pilih jabatan SKK yang sesuai latar belakang, pastikan syarat pendidikan & pengalaman terpenuhi, dan identifikasi LSP yang berwenang.',
    actions: [
      'Tentukan jabatan SKK target (Level 1–9, kode SKKNI)',
      'Cek persyaratan pendidikan minimum (D3/S1/SMK)',
      'Hitung total pengalaman kerja konstruksi (bulan/tahun)',
      'Cari LSP/TUK berwenang di wilayah Anda',
      'Hubungi LSP untuk konfirmasi jadwal dan kuota',
    ],
    documents: [
      'Ijazah (untuk verifikasi kualifikasi)',
      'CV / riwayat kerja singkat',
      'KTP (siapkan digital)',
    ],
    tips: [
      'Gunakan fitur Cek Kelayakan SKK di platform ini untuk analisis otomatis',
      'Pilih LSP yang sudah terakreditasi BNSP dan aktif di SIMPAN',
      'Tanya ke LSP apakah mereka menerima asesi fresh atau butuh rekomendasi perusahaan',
      'Bandingkan jadwal minimal 2-3 LSP sebelum memutuskan',
    ],
    pitfalls: [
      'Memilih jabatan yang kodenya sudah tidak aktif di SIMPAN',
      'Tidak menghitung pengalaman kerja dalam satuan bulan (bukan tahun)',
      'Mendaftar ke LSP yang tidak berwenang untuk jabatan tersebut',
    ],
    cost: 'Gratis (hanya waktu)',
  },
  {
    id: 'pendaftaran',
    phase: 2,
    title: 'Pendaftaran & FR.APL.01',
    subtitle: 'Daftar ke LSP dan isi formulir aplikasi',
    duration: '1–3 hari',
    actor: 'Asesi + LSP',
    icon: '📝',
    color: 'blue',
    paths: ['hardcopy', 'paperless', 'ajj'],
    description:
      'Asesi mengisi FR.APL.01 (formulir aplikasi asesmen) secara resmi ke LSP. LSP memverifikasi identitas dan konfirmasi skema sertifikasi yang sesuai.',
    actions: [
      'Isi formulir FR.APL.01 (bisa online atau offline tergantung LSP)',
      'Lampirkan KTP, ijazah, dan foto 3×4',
      'Deklarasikan jabatan pekerjaan dan nama perusahaan/klien',
      'Tanda tangani persetujuan asesmen dan pernyataan kebenaran data',
      'Bayar biaya administrasi pendaftaran (jika ada)',
      'Terima nomor registrasi peserta dari LSP',
    ],
    documents: [
      'FR.APL.01 yang sudah diisi dan ditandatangani',
      'Fotokopi KTP (2 lembar)',
      'Fotokopi ijazah terakhir (2 lembar, legalisir bila diperlukan)',
      'Pas foto 3×4 (2 lembar, background merah/biru)',
      'Surat keterangan kerja (dari perusahaan / klien)',
    ],
    tips: [
      'Isi FR.APL.01 dengan nama lengkap sesuai KTP, bukan nama panggilan',
      'Tuliskan pengalaman kerja secara kronologis dan spesifik',
      'Simpan salinan FR.APL.01 — dokumen ini menjadi referensi seluruh proses',
      'Tanya LSP apakah bisa submit FR.APL.01 via email/portal untuk efisiensi',
    ],
    pitfalls: [
      'Nama di formulir tidak sama persis dengan KTP → bisa ditolak',
      'Tidak menyebut jabatan pekerjaan yang relevan dengan skema',
      'Lupa tanda tangan atau stempel perusahaan di surat keterangan kerja',
    ],
    cost: 'Rp 0 – Rp 200.000 (biaya administrasi LSP, bervariasi)',
  },
  {
    id: 'verifikasi-dokumen',
    phase: 3,
    title: 'Verifikasi Dokumen Awal',
    subtitle: 'LSP memeriksa kelengkapan berkas',
    duration: '2–7 hari kerja',
    actor: 'LSP / Asesor',
    icon: '🔎',
    color: 'violet',
    paths: ['hardcopy', 'paperless', 'ajj'],
    description:
      'Tim LSP memverifikasi bahwa berkas pendaftaran memenuhi syarat skema sertifikasi yang dipilih. Asesi mungkin diminta melengkapi dokumen tambahan sebelum lanjut.',
    actions: [
      'Tunggu konfirmasi dari LSP (via telepon/email/WhatsApp)',
      'Siapkan dokumen tambahan jika LSP meminta revisi',
      'Konfirmasi tanggal jadwal asesmen setelah berkas disetujui',
    ],
    documents: [
      'Semua dokumen dari tahap pendaftaran',
      'Dokumen tambahan per permintaan LSP (portofolio proyek, dll)',
    ],
    tips: [
      'Aktif follow-up ke LSP setelah 3 hari kerja jika belum ada kabar',
      'Simpan nomor WA/email PIC LSP untuk komunikasi cepat',
      'Siapkan portofolio proyek lebih awal agar tidak tergesa bila diminta',
    ],
    pitfalls: [
      'Menunggu pasif lebih dari seminggu tanpa follow-up → bisa kehabisan slot jadwal',
      'Tidak menyimpan bukti pengiriman dokumen → sulit klaim jika berkas hilang',
    ],
    cost: 'Gratis',
  },
  {
    id: 'persiapan-asesmen',
    phase: 4,
    title: 'Persiapan Asesmen & FR.APL.02',
    subtitle: 'Belajar, kumpulkan bukti, isi self-assessment',
    duration: '2–4 minggu',
    actor: 'Asesi',
    icon: '📚',
    color: 'emerald',
    paths: ['hardcopy', 'paperless', 'ajj'],
    description:
      'Fase paling intensif: asesi mengisi FR.APL.02 (self-assessment per unit kompetensi), mengumpulkan bukti kompetensi, dan berlatih untuk asesmen. Kualitas FR.APL.02 sangat menentukan alur wawancara.',
    actions: [
      'Download FR.APL.02 resmi dari LSP atau portal BNSP',
      'Isi kolom self-assessment per unit kompetensi (Kompeten / Belum Kompeten)',
      'Lampirkan bukti kompetensi per unit: foto proyek, laporan, kontrak, sertifikat pelatihan',
      'Belajar materi SKKNI unit per unit sesuai jabatan',
      'Ikuti sesi bimbingan teknis (BIMTEK) jika tersedia',
      'Latihan simulasi wawancara dan jawab soal tertulis',
    ],
    documents: [
      'FR.APL.02 yang sudah diisi (per unit kompetensi)',
      'Portofolio bukti proyek: foto, laporan harian, gambar kerja, RAB',
      'Kontrak kerja / SPK / surat penugasan proyek',
      'Sertifikat pelatihan teknis yang relevan',
      'Laporan / karya tulis / publikasi (jika ada)',
    ],
    tips: [
      'Isi FR.APL.02 sejujurnya — jangan klaim Kompeten untuk unit yang belum dikuasai',
      'Gunakan foto proyek nyata; cantumkan tanggal, lokasi, dan peran Anda',
      'Pelajari elemen kompetensi dan kriteria unjuk kerja di SKKNI secara detail',
      'Ikuti Quiz SKK dan Mock Asesmen di platform ini untuk simulasi soal tertulis',
      'Minta feedback dari rekan senior atau mentor sebelum submit FR.APL.02',
    ],
    pitfalls: [
      'Mengisi FR.APL.02 asal-asalan → asesor akan menguji lebih dalam di wawancara',
      'Bukti proyek tidak mencantumkan peran/kontribusi Anda secara eksplisit',
      'Tidak mempelajari SKKNI → tidak bisa menjawab pertanyaan unit kompetensi spesifik',
      'Terlalu fokus hafalan, lupa menyiapkan bukti portofolio fisik',
    ],
    cost: 'Rp 500.000 – Rp 2.000.000 (BIMTEK opsional, print dokumen)',
  },
  {
    id: 'asesmen-kompetensi',
    phase: 5,
    title: 'Asesmen Kompetensi',
    subtitle: 'Hari-H: Tertulis, Portofolio, Wawancara',
    duration: '1 hari (4–8 jam)',
    actor: 'Asesi + Asesor',
    icon: '🎯',
    color: 'amber',
    paths: ['hardcopy', 'paperless', 'ajj'],
    description:
      'Inti dari seluruh proses. Asesor mengevaluasi kompetensi melalui tiga instrumen utama: tes tertulis (pengetahuan SKKNI), observasi/portofolio, dan wawancara mendalam per unit kompetensi.',
    actions: [
      'Hadir tepat waktu (atau join Zoom/Google Meet untuk AJJ) minimal 30 menit sebelum mulai',
      'Bawa seluruh dokumen asli: KTP, ijazah, FR.APL.01, FR.APL.02, portofolio',
      'Ikuti sesi orientasi peserta dari asesor',
      'Kerjakan tes tertulis (pilihan ganda + isian, 60–120 menit)',
      'Presentasikan portofolio bukti per unit kompetensi',
      'Jawab pertanyaan wawancara asesor per unit kompetensi',
      'Tanda tangani berita acara asesmen',
    ],
    documents: [
      'KTP ASLI',
      'Ijazah ASLI + fotokopi',
      'FR.APL.01 + FR.APL.02 (sudah diisi)',
      'Portofolio bukti fisik (map/folder terorganisir per unit)',
      'Kartu peserta / nomor registrasi dari LSP',
    ],
    tips: [
      'Organisir portofolio dalam map berlabel per unit kompetensi → kesan profesional',
      'Jawab dengan STAR (Situation, Task, Action, Result) untuk pertanyaan pengalaman',
      'Jika tidak tahu jawaban, akui dengan jujur dan tawarkan pendekatan alternatif',
      'Minum air putih, istirahat singkat antar sesi jika diizinkan',
      'Untuk AJJ: cek koneksi internet, kamera, dan mikrofon H-1',
    ],
    pitfalls: [
      'Lupa membawa dokumen asli → bisa tidak diperbolehkan mengikuti asesmen',
      'Terlambat hadir tanpa konfirmasi ke LSP terlebih dahulu',
      'Menjawab tanpa bukti konkret → asesor tidak bisa memvalidasi kompetensi',
      'Gugup berlebihan → latihan wawancara Mock Asesmen sangat membantu',
    ],
    cost: 'Rp 1.500.000 – Rp 5.000.000 (biaya asesmen utama, tergantung jabatan & LSP)',
    note: 'AJJ: seluruh proses via video conference. Paperless: tidak ada dokumen fisik, semua digital.',
  },
  {
    id: 'keputusan-kompetensi',
    phase: 6,
    title: 'Keputusan Kompetensi',
    subtitle: 'Panel asesor menetapkan rekomendasi',
    duration: '1–7 hari kerja',
    actor: 'Panel Asesor / LSP',
    icon: '⚖️',
    color: 'orange',
    paths: ['hardcopy', 'paperless', 'ajj'],
    description:
      'Panel asesor melakukan rapat pembahasan hasil asesmen dan menetapkan rekomendasi: Kompeten atau Belum Kompeten per unit kompetensi. Keputusan final diambil oleh LSP, bukan asesor individual.',
    actions: [
      'Tunggu pemberitahuan hasil dari LSP (biasanya 3–7 hari kerja)',
      'Jika Belum Kompeten sebagian unit: tanyakan unit mana yang perlu diulang',
      'Jika semua Kompeten: tunggu proses penerbitan SKK',
      'Bila ada banding: ajukan dalam batas waktu yang ditentukan LSP',
    ],
    documents: [
      'Berita Acara Asesmen (diterima setelah asesmen selesai)',
      'Lembar rekomendasi hasil (dari asesor → LSP)',
    ],
    tips: [
      'Tetap tenang dan profesional apapun hasilnya',
      'Jika Belum Kompeten, tanya ke LSP unit apa yang kurang dan kapan bisa re-asesmen',
      'Re-asesmen biasanya hanya untuk unit yang belum Kompeten, bukan semua unit',
    ],
    pitfalls: [
      'Tidak merespons notifikasi LSP tepat waktu → bisa memperlambat proses SKK',
      'Mengira bisa meminta asesor mengubah nilai → tidak bisa, keputusan final di LSP',
    ],
    cost: 'Gratis',
  },
  {
    id: 'penerbitan-skk',
    phase: 7,
    title: 'Penerbitan & Registrasi SKK',
    subtitle: 'SKK diterbitkan dan terdaftar di SIMPAN',
    duration: '7–21 hari kerja',
    actor: 'LSP / LPJK / BNSP',
    icon: '📜',
    color: 'rose',
    paths: ['hardcopy', 'paperless', 'ajj'],
    description:
      'LSP mengajukan data ke Sistem Informasi Manajemen Akreditasi (SIMPAN) dan menerbitkan SKK fisik/digital. SKK berlaku 3 tahun sejak diterbitkan.',
    actions: [
      'Tunggu konfirmasi dari LSP bahwa SKK sudah diterbitkan',
      'Cek nama dan data di SIMPAN (simpan.pu.go.id) untuk verifikasi',
      'Ambil SKK fisik di LSP ATAU terima SKK digital (sesuai LSP)',
      'Simpan SKK di tempat aman; buat salinan digital',
      'Catat tanggal kadaluarsa SKK untuk rencana perpanjangan',
    ],
    documents: [
      'SKK asli (fisik atau digital dengan QR code verifikasi)',
      'Kartu SKK (ukuran KTP, berisi foto + data + QR)',
    ],
    tips: [
      'Verifikasi SKK di SIMPAN segera setelah menerima — pastikan data benar',
      'Jika ada kesalahan nama/data di SKK, segera hubungi LSP untuk koreksi',
      'Foto SKK dan simpan di Google Drive/cloud sebagai backup',
      'Tandai kalender 2,5 tahun ke depan untuk mulai persiapan perpanjangan',
    ],
    pitfalls: [
      'Tidak mengecek SIMPAN → SKK bisa tercetak dengan data salah tanpa Anda sadari',
      'Kehilangan SKK fisik tanpa backup digital → proses duplikat butuh waktu lama',
      'Tidak memantau tanggal kadaluarsa → SKK expired tanpa surveillance → harus sertifikasi ulang',
    ],
    cost: 'Termasuk dalam biaya asesmen atau Rp 0 – Rp 100.000 biaya cetak',
  },
  {
    id: 'maintenance-skk',
    phase: 8,
    title: 'Pemeliharaan & Perpanjangan SKK',
    subtitle: 'Surveillance + PKB + re-sertifikasi',
    duration: 'Setiap 3 tahun (+ surveillance tahunan)',
    actor: 'Asesi + LSP',
    icon: '♻️',
    color: 'teal',
    paths: ['hardcopy', 'paperless', 'ajj'],
    description:
      'SKK berlaku 3 tahun. Untuk mempertahankan, asesi wajib mengikuti surveillance (kunjungan/laporan tahunan) dan memenuhi kewajiban PKB (Pengembangan Keprofesian Berkelanjutan). Setelah 3 tahun, perlu re-sertifikasi.',
    actions: [
      'Catat jadwal surveillance tahunan (biasanya tahun ke-1 dan ke-2)',
      'Kumpulkan bukti PKB: pelatihan, seminar, publikasi, proyek baru',
      'Hubungi LSP 6 bulan sebelum kadaluarsa untuk jadwal re-sertifikasi',
      'Siapkan portofolio proyek baru sejak tahun pertama',
      'Pertimbangkan naik level atau jabatan berbeda saat re-sertifikasi',
    ],
    documents: [
      'Laporan PKB (log aktivitas pengembangan keprofesian)',
      'Bukti surveillance (jika diminta LSP)',
      'SKK lama saat proses perpanjangan',
    ],
    tips: [
      'Mulai catat PKB sejak hari pertama terima SKK, bukan mepet deadline',
      'Gunakan Tracker PKB di platform ini untuk log aktivitas otomatis',
      'Diskusikan dengan LSP kemungkinan upgrade level saat perpanjangan',
      'SKK yang diperbarui langsung terupdate di SIMPAN tanpa proses baru',
    ],
    pitfalls: [
      'Lupa surveillance → LSP bisa merekomendasi pencabutan SKK',
      'PKB kosong → re-sertifikasi lebih sulit karena tidak ada bukti aktivitas',
      'Menunggu SKK expired baru mendaftar perpanjangan → ada gap periode tidak bersertifikat',
    ],
    cost: 'Rp 500.000 – Rp 2.000.000 (re-sertifikasi, biaya serupa asesmen awal)',
  },
];

const pathLabels: Record<Path, { label: string; icon: string; color: string; desc: string }> = {
  hardcopy: { label: 'Hardcopy', icon: '📄', color: 'amber', desc: 'Dokumen fisik cetak, hadir langsung di TUK' },
  paperless: { label: 'Paperless', icon: '💻', color: 'blue', desc: 'Dokumen digital, hadir langsung di TUK' },
  ajj: { label: 'AJJ', icon: '📡', color: 'emerald', desc: 'Asesmen Jarak Jauh via video conference' },
};

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; dot: string; ring: string }> = {
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300', dot: 'bg-cyan-500', ring: 'ring-cyan-500/40' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300', dot: 'bg-blue-500', ring: 'ring-blue-500/40' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', badge: 'bg-violet-500/20 text-violet-300', dot: 'bg-violet-500', ring: 'ring-violet-500/40' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300', dot: 'bg-amber-500', ring: 'ring-amber-500/40' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300', dot: 'bg-orange-500', ring: 'ring-orange-500/40' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300', dot: 'bg-rose-500', ring: 'ring-rose-500/40' },
  teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', badge: 'bg-teal-500/20 text-teal-300', dot: 'bg-teal-500', ring: 'ring-teal-500/40' },
};

export default function TimelineSKKPage() {
  const [selectedPath, setSelectedPath] = useState<Path>('hardcopy');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [expandedStep, setExpandedStep] = useState<string | null>('persiapan-awal');
  const [activeTab, setActiveTab] = useState<'langkah' | 'dokumen' | 'biaya'>('langkah');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCompletedSteps(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleStep = (id: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const filteredSteps = steps.filter(s => s.paths.includes(selectedPath));
  const completedCount = filteredSteps.filter(s => completedSteps.has(s.id)).length;
  const progressPct = Math.round((completedCount / filteredSteps.length) * 100);

  const totalMinCost = 2_000_000;
  const totalMaxCost = 7_300_000;

  // Estimated weeks per path
  const pathWeeks: Record<Path, string> = {
    hardcopy: '6–10 minggu',
    paperless: '5–9 minggu',
    ajj: '5–8 minggu',
  };

  const resetProgress = () => {
    setCompletedSteps(new Set());
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  // Build full document list for "Dokumen" tab
  const allDocs = Array.from(
    new Set(filteredSteps.flatMap(s => s.documents))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/20 text-teal-400 rounded-full text-sm font-medium mb-4">
            🗺️ Panduan Lengkap · Berdasarkan Regulasi BNSP & Permen PUPR 9/2023
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Timeline Proses SKK<br />
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Dari Awal Hingga Terima Sertifikat
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            8 tahap lengkap proses sertifikasi SKK — estimasi waktu, dokumen wajib, biaya, tips, dan jebakan umum di setiap langkah.
          </p>
        </div>

        {/* Path Selector */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-8">
          <p className="text-slate-400 text-sm mb-4 font-medium">Pilih jalur asesmen Anda:</p>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(pathLabels) as [Path, typeof pathLabels[Path]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setSelectedPath(key)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  selectedPath === key
                    ? 'border-teal-500/60 bg-teal-500/15 ring-2 ring-teal-500/30'
                    : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600/60'
                }`}
              >
                <div className="text-2xl mb-1">{val.icon}</div>
                <div className={`font-bold text-sm ${selectedPath === key ? 'text-teal-300' : 'text-white'}`}>
                  {val.label}
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-tight">{val.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-teal-400">{filteredSteps.length}</div>
            <div className="text-slate-400 text-xs mt-1">Total Tahap</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{pathWeeks[selectedPath]}</div>
            <div className="text-slate-400 text-xs mt-1">Estimasi Total</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-amber-400">Rp {(totalMinCost / 1_000_000).toFixed(1)}–{(totalMaxCost / 1_000_000).toFixed(1)} Jt</div>
            <div className="text-slate-400 text-xs mt-1">Estimasi Biaya Total</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{progressPct}%</div>
            <div className="text-slate-400 text-xs mt-1">Progress Anda</div>
          </div>
        </div>

        {/* Progress Bar */}
        {completedCount > 0 && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-300 font-medium">Progress Journey</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-teal-400">{completedCount}/{filteredSteps.length} tahap selesai</span>
                <button
                  onClick={resetProgress}
                  className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {progressPct === 100 && (
              <p className="text-center text-emerald-400 text-sm mt-3 font-medium">
                🎉 Selamat! Seluruh proses SKK selesai. Anda kini pemegang SKK resmi!
              </p>
            )}
          </div>
        )}

        {/* Tab Nav */}
        <div className="flex gap-2 mb-6">
          {(['langkah', 'dokumen', 'biaya'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === t
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-300 border border-transparent hover:border-slate-700/50'
              }`}
            >
              {t === 'langkah' ? '🗓️ Tahap demi Tahap' : t === 'dokumen' ? '📄 Master Dokumen' : '💰 Rincian Biaya'}
            </button>
          ))}
        </div>

        {/* TAB: LANGKAH */}
        {activeTab === 'langkah' && (
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[22px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-teal-500/40 via-slate-600/30 to-teal-500/10 hidden md:block" />

            <div className="space-y-4">
              {filteredSteps.map((step, idx) => {
                const c = colorMap[step.color];
                const isCompleted = completedSteps.has(step.id);
                const isExpanded = expandedStep === step.id;

                return (
                  <div key={step.id} className="relative">
                    {/* Step Row */}
                    <div
                      className={`rounded-2xl border transition-all ${
                        isCompleted
                          ? 'border-teal-500/30 bg-teal-500/5'
                          : `${c.border} ${c.bg}`
                      } ${isExpanded ? 'ring-1 ' + c.ring : ''}`}
                    >
                      {/* Header */}
                      <div className="flex items-start gap-4 p-5">
                        {/* Step number / checkbox */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <button
                            onClick={() => toggleStep(step.id)}
                            className={`w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold border-2 transition-all ${
                              isCompleted
                                ? 'bg-teal-500 border-teal-400 text-white'
                                : `border-slate-600 bg-slate-800 ${c.text} hover:border-current`
                            }`}
                            title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                          >
                            {isCompleted ? '✓' : step.icon}
                          </button>
                          <span className="text-xs text-slate-600 font-mono">{String(idx + 1).padStart(2, '0')}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3 className={`font-bold text-lg ${isCompleted ? 'text-teal-300 line-through opacity-70' : 'text-white'}`}>
                                {step.title}
                              </h3>
                              <p className="text-slate-400 text-sm">{step.subtitle}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${c.badge}`}>
                                ⏱ {step.duration}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-700/60 text-slate-400">
                                👤 {step.actor}
                              </span>
                              {step.cost && (
                                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/15 text-amber-300">
                                  💰 {step.cost}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-slate-400 text-sm mt-2 leading-relaxed">{step.description}</p>

                          {/* AJJ note */}
                          {step.note && (
                            <div className="mt-2 px-3 py-2 bg-slate-700/40 border border-slate-600/40 rounded-lg text-xs text-slate-400 italic">
                              ℹ️ {step.note}
                            </div>
                          )}

                          {/* Expand toggle */}
                          <button
                            onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                            className={`mt-3 text-xs font-medium flex items-center gap-1 transition-colors ${c.text} hover:opacity-80`}
                          >
                            {isExpanded ? '▲ Sembunyikan detail' : '▼ Lihat langkah, dokumen & tips'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Detail */}
                      {isExpanded && (
                        <div className="px-5 pb-5 grid md:grid-cols-3 gap-4 border-t border-slate-700/40 pt-4">
                          {/* Langkah */}
                          <div>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${c.text}`}>
                              ✅ Yang harus dilakukan
                            </h4>
                            <ul className="space-y-1.5">
                              {step.actions.map((a, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                  <span className="text-slate-600 shrink-0 mt-0.5">•</span>
                                  <span>{a}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Dokumen */}
                          <div>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${c.text}`}>
                              📋 Dokumen di tahap ini
                            </h4>
                            <ul className="space-y-1.5">
                              {step.documents.map((d, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                  <span className="shrink-0">📎</span>
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tips & Pitfalls */}
                          <div className="space-y-4">
                            <div>
                              <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 text-emerald-400`}>
                                💡 Tips
                              </h4>
                              <ul className="space-y-1.5">
                                {step.tips.map((t, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                    <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 text-rose-400`}>
                                ⚠️ Jebakan umum
                              </h4>
                              <ul className="space-y-1.5">
                                {step.pitfalls.map((p, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                    <span className="text-rose-500 shrink-0 mt-0.5">✕</span>
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                Centang setiap tahap yang sudah selesai untuk memantau progress perjalanan sertifikasi Anda.
              </p>
            </div>
          </div>
        )}

        {/* TAB: DOKUMEN */}
        {activeTab === 'dokumen' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 border border-teal-500/20 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-1">Master Checklist Dokumen</h2>
              <p className="text-slate-400 text-sm mb-6">
                Semua dokumen yang perlu disiapkan sepanjang proses SKK — jalur{' '}
                <span className="text-teal-400 font-medium">{pathLabels[selectedPath].label}</span>.
              </p>

              {/* By phase */}
              {filteredSteps.map(step => {
                const c = colorMap[step.color];
                return (
                  <div key={step.id} className="mb-6">
                    <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-slate-700/40`}>
                      <span className="text-xl">{step.icon}</span>
                      <span className={`font-semibold ${c.text}`}>Fase {step.phase}: {step.title}</span>
                      <span className="text-slate-600 text-xs ml-auto">{step.duration}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      {step.documents.map((doc, i) => (
                        <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg ${c.bg} border ${c.border}`}>
                          <span className="text-sm shrink-0">📎</span>
                          <span className="text-sm text-slate-300">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pro tips */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
              <h3 className="text-amber-400 font-bold mb-3">📦 Tips Organisasi Dokumen</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-300">
                {[
                  'Buat map/folder berlabel per fase (Fase 1, 2, 3...)',
                  'Scan semua dokumen fisik ke PDF dan simpan di Google Drive',
                  'Beri nama file: NamaAnda_JenisDoc_Tanggal.pdf',
                  'Pisahkan dokumen per unit kompetensi untuk portofolio',
                  'Bawa dokumen asli + 2 fotokopi ke TUK',
                  'Sertifikat pelatihan: scan dengan kualitas 300 DPI ke atas',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 shrink-0">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: BIAYA */}
        {activeTab === 'biaya' && (
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-1">Rincian Estimasi Biaya SKK</h2>
              <p className="text-slate-400 text-sm mb-6">
                Biaya bervariasi tergantung jabatan, LSP, wilayah, dan kebutuhan dokumen.
              </p>

              <div className="space-y-3">
                {[
                  { fase: 'Persiapan Awal', item: 'Konsultasi, print dokumen awal', min: 0, max: 100_000, color: 'cyan' },
                  { fase: 'Pendaftaran', item: 'Biaya administrasi LSP', min: 0, max: 200_000, color: 'blue' },
                  { fase: 'Verifikasi Dokumen', item: 'Gratis (dilakukan LSP)', min: 0, max: 0, color: 'violet' },
                  { fase: 'Persiapan Asesmen', item: 'BIMTEK opsional, print portofolio', min: 500_000, max: 2_000_000, color: 'emerald' },
                  { fase: 'Asesmen Kompetensi', item: 'Biaya asesmen utama (terbesar)', min: 1_500_000, max: 5_000_000, color: 'amber' },
                  { fase: 'Penerbitan SKK', item: 'Cetak SKK (biasanya included)', min: 0, max: 100_000, color: 'rose' },
                  { fase: 'Perpanjangan (3 thn)', item: 'Re-sertifikasi + surveillance', min: 500_000, max: 2_000_000, color: 'teal' },
                ].map((row, i) => {
                  const c = colorMap[row.color];
                  const maxBar = 5_000_000;
                  const barWidth = Math.max(4, Math.round((row.max / maxBar) * 100));
                  return (
                    <div key={i} className={`p-4 rounded-xl border ${c.border} ${c.bg}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className={`font-semibold text-sm ${c.text}`}>{row.fase}</div>
                          <div className="text-slate-400 text-xs">{row.item}</div>
                        </div>
                        <div className="text-right">
                          {row.max === 0 ? (
                            <div className="text-emerald-400 font-bold text-sm">Gratis</div>
                          ) : (
                            <div className="text-white font-bold text-sm">
                              {row.min === 0 ? '0' : `Rp ${(row.min / 1000).toFixed(0)}rb`}
                              {' – '}
                              Rp {row.max >= 1_000_000 ? `${(row.max / 1_000_000).toFixed(1)} Jt` : `${(row.max / 1000).toFixed(0)}rb`}
                            </div>
                          )}
                        </div>
                      </div>
                      {row.max > 0 && (
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${c.dot} rounded-full`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="mt-6 p-4 bg-gradient-to-r from-teal-500/15 to-cyan-500/10 border border-teal-500/30 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">Total Estimasi (Sertifikasi Pertama)</div>
                    <div className="text-slate-400 text-sm">Tidak termasuk BIMTEK dan perpanjangan</div>
                  </div>
                  <div className="text-right">
                    <div className="text-teal-400 font-bold text-xl">Rp 2 – 7,3 Juta</div>
                    <div className="text-slate-500 text-xs">Tergantung jabatan & LSP</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips hemat */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
              <h3 className="text-emerald-400 font-bold mb-3">💡 Tips Hemat Biaya SKK</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-300">
                {[
                  'Minta perusahaan cover biaya asesmen — ini investasi bisnis, bukan personal',
                  'Bandingkan minimal 3 LSP sebelum memilih — biaya bisa beda Rp 1–2 Jt',
                  'Siapkan dokumen sendiri tanpa jasa pihak ketiga jika mampu',
                  'BIMTEK gratis/murah sering tersedia dari asosiasi profesi (GAPENSI, dll)',
                  'Kelompok 3–5 orang dari satu perusahaan kadang dapat diskon LSP',
                  'Pilih AJJ jika domisili jauh dari TUK — hemat biaya transportasi & akomodasi',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 text-xs text-slate-500 text-center">
              ℹ️ Semua estimasi biaya bersifat indikatif. Hubungi LSP secara langsung untuk tarif resmi sesuai jabatan dan wilayah Anda.
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/30 rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold text-lg mb-2">Siap Mulai Perjalanan SKK Anda?</h3>
          <p className="text-slate-400 text-sm mb-5">
            Gunakan tools di SKK Hub untuk mengecek kelayakan, menyiapkan dokumen, dan latihan soal — semua dalam satu platform.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/skk-coach/chat?agent=kelayakan" className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl transition-colors">
              🔍 Cek Kelayakan SKK
            </a>
            <a href="/hari-h" className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
              📅 Panduan Hari-H
            </a>
            <a href="/mock-asesmen" className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
              🎯 Latihan Mock Asesmen
            </a>
            <a href="/biaya-skk" className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
              💰 Kalkulator Biaya SKK
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
