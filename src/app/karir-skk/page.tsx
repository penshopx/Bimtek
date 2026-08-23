'use client';

import { useState } from 'react';

type Specialty = 'all' | 'sipil' | 'arsitektur' | 'mekanikal' | 'manajemen';

interface KKNILevel {
  level: number;
  label: string;
  title: string;
  role: string;
  color: string;
  education: string;
  experience: string;
  salary: string;
  projectScale: string;
  responsibilities: string[];
  jabatanSipil: string[];
  jabatanArsitektur: string[];
  jabatanMekanikal: string[];
  jabatanManajemen: string[];
  keySkills: string[];
  toNextLevel: string[];
}

const levels: KKNILevel[] = [
  {
    level: 1,
    label: 'KKNI 1',
    title: 'Operator Dasar',
    role: 'Pelaksana Lapangan Pemula',
    color: 'slate',
    education: 'SMP/sederajat',
    experience: '0–1 tahun',
    salary: 'Rp 3–5 juta/bln',
    projectScale: 'Pekerjaan sederhana & berulang',
    responsibilities: [
      'Melaksanakan instruksi kerja secara langsung',
      'Mengerjakan pekerjaan fisik di lapangan',
      'Menjaga kebersihan dan keselamatan area kerja',
    ],
    jabatanSipil: ['Pembantu Tukang Kayu', 'Pembantu Tukang Batu', 'Pembantu Tukang Besi'],
    jabatanArsitektur: ['Pembantu Tukang Finishing', 'Pembantu Tukang Keramik'],
    jabatanMekanikal: ['Pembantu Tukang Plumbing', 'Pembantu Teknisi Listrik'],
    jabatanManajemen: ['Pembantu Administrasi Proyek'],
    keySkills: ['Keselamatan kerja dasar', 'Penggunaan alat tangan', 'Kerja tim'],
    toNextLevel: [
      'Selesaikan pendidikan SMK/sederajat',
      'Kumpulkan 1–2 tahun pengalaman kerja lapangan',
      'Ikuti pelatihan keterampilan dasar bidang konstruksi',
      'Daftarkan diri ke LSP untuk sertifikasi Level 2',
    ],
  },
  {
    level: 2,
    label: 'KKNI 2',
    title: 'Tukang / Teknisi Dasar',
    role: 'Pelaksana Pekerjaan Terampil',
    color: 'stone',
    education: 'SMP + pelatihan / SMK',
    experience: '1–3 tahun',
    salary: 'Rp 4–7 juta/bln',
    projectScale: 'Pekerjaan elemen konstruksi spesifik',
    responsibilities: [
      'Melaksanakan pekerjaan konstruksi sesuai standar teknis',
      'Membaca gambar kerja sederhana',
      'Memilih dan menggunakan material sesuai spesifikasi',
    ],
    jabatanSipil: ['Tukang Batu', 'Tukang Kayu', 'Tukang Besi / Pembesian'],
    jabatanArsitektur: ['Tukang Finishing', 'Tukang Cat', 'Tukang Keramik/Ubin'],
    jabatanMekanikal: ['Tukang Plumbing', 'Tukang Listrik Bangunan'],
    jabatanManajemen: ['Asisten Logistik', 'Petugas K3 Lapangan'],
    keySkills: ['Membaca gambar kerja', 'Standar mutu material', 'Teknik konstruksi dasar'],
    toNextLevel: [
      'Tingkatkan pendidikan ke D3 atau SMK + pengalaman 3 tahun',
      'Kuasai minimal satu spesialisasi teknis (beton, baja, finishing)',
      'Latih kemampuan koordinasi tim kecil',
      'Dokumentasikan proyek yang pernah dikerjakan',
    ],
  },
  {
    level: 3,
    label: 'KKNI 3',
    title: 'Teknisi / Juru',
    role: 'Pelaksana Teknis Terampil',
    color: 'zinc',
    education: 'SMK / D1',
    experience: '2–4 tahun',
    salary: 'Rp 5–9 juta/bln',
    projectScale: 'Bagian sub-pekerjaan konstruksi',
    responsibilities: [
      'Mengkoordinir sekelompok kecil tukang',
      'Memastikan kualitas pekerjaan sesuai gambar',
      'Membuat laporan kemajuan sederhana',
      'Mengidentifikasi dan melaporkan masalah lapangan',
    ],
    jabatanSipil: ['Juru Gambar (Drafter)', 'Juru Ukur (Surveyor)', 'Mandor Bangunan'],
    jabatanArsitektur: ['Juru Gambar Arsitektur', 'Juru Interior'],
    jabatanMekanikal: ['Teknisi Mekanikal', 'Teknisi Elektrikal Gedung'],
    jabatanManajemen: ['Asisten Quantity Surveyor', 'Petugas Gudang Proyek'],
    keySkills: ['AutoCAD dasar', 'Pengukuran dan pematokan', 'Koordinasi tim kecil', 'Laporan harian'],
    toNextLevel: [
      'Tingkatkan ke D3 Teknik Sipil/Arsitektur/ME',
      'Kumpulkan 4+ tahun pengalaman di berbagai tipe proyek',
      'Pelajari software teknik (AutoCAD, SAP2000 basic)',
      'Ambil pelatihan manajemen konstruksi dasar',
    ],
  },
  {
    level: 4,
    label: 'KKNI 4',
    title: 'Teknisi Senior / Analis',
    role: 'Pelaksana Teknis dengan Supervisi',
    color: 'green',
    education: 'D3 / SMK + pengalaman 4 thn',
    experience: '3–6 tahun',
    salary: 'Rp 7–15 juta/bln',
    projectScale: 'Proyek s.d. Rp 10 miliar',
    responsibilities: [
      'Mengawasi pelaksanaan pekerjaan teknis di lapangan',
      'Membaca dan menginterpretasi gambar teknik kompleks',
      'Membantu perencanaan dan penjadwalan pekerjaan',
      'Menghitung volume pekerjaan (BOQ)',
      'Berkoordinasi dengan kontraktor sub-pekerjaan',
    ],
    jabatanSipil: ['Teknisi Geoteknik', 'Teknisi Struktur Bangunan', 'Surveyor Lapangan'],
    jabatanArsitektur: ['Teknisi Arsitektur', 'Desainer Interior (Pelaksana)'],
    jabatanMekanikal: ['Teknisi Senior MEP', 'Teknisi Plambing & Sanitasi'],
    jabatanManajemen: ['Estimator Proyek', 'Scheduler Proyek'],
    keySkills: ['BOQ & RAB', 'Manajemen sub-kontraktor', 'Analisis gambar teknik', 'MS Project basic'],
    toNextLevel: [
      'Raih gelar S1 Teknik',
      'Kumpulkan 6+ tahun pengalaman multi-proyek',
      'Kelola minimal satu proyek di atas Rp 5 miliar',
      'Kuasai analisis struktural atau MEP lebih dalam',
    ],
  },
  {
    level: 5,
    label: 'KKNI 5',
    title: 'Ahli Pratama / Junior Engineer',
    role: 'Tenaga Ahli Tingkat Pertama',
    color: 'sky',
    education: 'D4 / S1 / D3 + pengalaman',
    experience: '0–4 tahun (lulusan S1)',
    salary: 'Rp 10–20 juta/bln',
    projectScale: 'Proyek s.d. Rp 50 miliar',
    responsibilities: [
      'Membuat desain dan perencanaan teknis awal',
      'Melakukan analisis dan perhitungan teknik',
      'Menyusun spesifikasi teknis dan dokumen lelang',
      'Mengawasi kualitas pekerjaan konstruksi',
      'Membuat laporan teknis dan progress report',
    ],
    jabatanSipil: ['Ahli Teknik Jalan (Pratama)', 'Ahli Bangunan Gedung (Pratama)', 'Ahli Geoteknik (Pratama)'],
    jabatanArsitektur: ['Ahli Arsitektur (Pratama)', 'Ahli Desain Interior (Pratama)'],
    jabatanMekanikal: ['Ahli Teknik Mekanikal (Pratama)', 'Ahli Teknik Elektrikal (Pratama)'],
    jabatanManajemen: ['Ahli Manajemen Konstruksi (Pratama)', 'Ahli K3 Konstruksi (Pratama)'],
    keySkills: ['Desain struktural/arsitektur', 'Analisis teknik', 'Dokumen kontrak', 'Quality control'],
    toNextLevel: [
      'Perbanyak portofolio proyek yang dipimpin secara teknis',
      'Kumpulkan 5–7 tahun pengalaman sebagai engineer',
      'Kembangkan kompetensi desain/analisis yang lebih kompleks',
      'Ambil sertifikasi spesialisasi atau mengajar di BIMTEK',
    ],
  },
  {
    level: 6,
    label: 'KKNI 6',
    title: 'Ahli Muda / Engineer',
    role: 'Tenaga Ahli Tingkat Muda',
    color: 'blue',
    education: 'S1 + pengalaman 5–8 thn',
    experience: '5–8 tahun',
    salary: 'Rp 15–35 juta/bln',
    projectScale: 'Proyek s.d. Rp 250 miliar',
    responsibilities: [
      'Memimpin tim teknis dalam perencanaan proyek',
      'Membuat desain teknis kompleks secara mandiri',
      'Review dan persetujuan dokumen teknis junior',
      'Konsultasi teknis dengan klien dan pemilik proyek',
      'Tanggung jawab atas keselamatan dan mutu pekerjaan',
    ],
    jabatanSipil: ['Ahli Teknik Jalan (Muda)', 'Ahli Bangunan Gedung (Muda)', 'Ahli Geoteknik (Muda)'],
    jabatanArsitektur: ['Ahli Arsitektur (Muda)', 'Ahli Perencanaan Wilayah & Kota (Muda)'],
    jabatanMekanikal: ['Ahli Teknik Mekanikal (Muda)', 'Ahli Teknik Elektrikal (Muda)'],
    jabatanManajemen: ['Ahli Manajemen Konstruksi (Muda)', 'Ahli K3 Konstruksi (Muda)'],
    keySkills: ['Manajemen tim teknis', 'Desain kompleks', 'Review dokumen', 'Client management'],
    toNextLevel: [
      'Pimpin proyek berskala besar (di atas Rp 100 miliar)',
      'Kembangkan spesialisasi unik atau keahlian niche',
      'Pertimbangkan S2 untuk karir akademik/riset',
      'Bangun track record sebagai lead engineer yang diakui industri',
    ],
  },
  {
    level: 7,
    label: 'KKNI 7',
    title: 'Ahli Madya / Senior Engineer',
    role: 'Tenaga Ahli Tingkat Madya',
    color: 'violet',
    education: 'S1 + 8–12 thn / S2',
    experience: '8–12 tahun',
    salary: 'Rp 25–60 juta/bln',
    projectScale: 'Proyek s.d. Rp 500 miliar',
    responsibilities: [
      'Memimpin proyek berskala menengah-besar secara penuh',
      'Mengembangkan metodologi dan standar teknis baru',
      'Mentor untuk engineer junior dan muda',
      'Terlibat dalam proses tender dan negosiasi kontrak',
      'Pembuatan keputusan teknis tingkat tinggi',
    ],
    jabatanSipil: ['Ahli Teknik Jalan (Madya)', 'Ahli Bangunan Gedung (Madya)', 'Ahli Jembatan (Madya)'],
    jabatanArsitektur: ['Ahli Arsitektur (Madya)', 'Ahli Konservasi Bangunan (Madya)'],
    jabatanMekanikal: ['Ahli Teknik Mekanikal (Madya)', 'Ahli Instalasi Listrik (Madya)'],
    jabatanManajemen: ['Ahli Manajemen Konstruksi (Madya)', 'Project Manager Bersertifikat'],
    keySkills: ['Kepemimpinan proyek besar', 'Mentoring', 'Inovasi teknis', 'Negosiasi kontrak'],
    toNextLevel: [
      'Pimpin proyek nasional skala besar (> Rp 500 miliar)',
      'Publikasi karya teknis atau kontribusi ke standar nasional',
      'Bangun reputasi sebagai expert yang diakui industri',
      'Pertimbangkan berkontribusi sebagai Asesor Kompetensi BNSP',
    ],
  },
  {
    level: 8,
    label: 'KKNI 8',
    title: 'Ahli Utama / Principal Engineer',
    role: 'Tenaga Ahli Tingkat Utama',
    color: 'amber',
    education: 'S2 / S1 + 15+ thn',
    experience: '12–20 tahun',
    salary: 'Rp 50–150 juta/bln',
    projectScale: 'Proyek nasional strategis',
    responsibilities: [
      'Memimpin divisi atau departemen teknis perusahaan',
      'Merumuskan kebijakan teknis dan metodologi perusahaan',
      'Kontribusi aktif dalam penyusunan SNI dan regulasi',
      'Pembicara nasional dan pakar teknis yang diakui',
      'Pengembangan SDM teknis di tingkat organisasi',
    ],
    jabatanSipil: ['Ahli Teknik Jalan (Utama)', 'Ahli Bangunan Gedung (Utama)', 'Ahli Geoteknik Khusus (Utama)'],
    jabatanArsitektur: ['Ahli Arsitektur (Utama)', 'Ahli Perencanaan Kota (Utama)'],
    jabatanMekanikal: ['Ahli Teknik Mekanikal (Utama)', 'Ahli Sistem Elektrikal (Utama)'],
    jabatanManajemen: ['Ahli Manajemen Proyek (Utama)', 'Expert K3 Konstruksi (Utama)'],
    keySkills: ['Kepemimpinan organisasi', 'Kontribusi kebijakan nasional', 'Riset & pengembangan', 'Public speaking'],
    toNextLevel: [
      'Gelar Doktor (S3) di bidang teknik konstruksi',
      'Kontribusi internasional (ISO, IEC, FIDIC)',
      'Pengakuan internasional sebagai expert/fellow',
    ],
  },
  {
    level: 9,
    label: 'KKNI 9',
    title: 'Expert / Distinguished Engineer',
    role: 'Pakar / Ahli Internasional',
    color: 'gold',
    education: 'S3 / Pengakuan internasional',
    experience: '20+ tahun',
    salary: 'Rp 100 juta+/bln',
    projectScale: 'Proyek nasional & internasional',
    responsibilities: [
      'Otoritas teknis tertinggi di bidang spesialisasi',
      'Kontribusi pada standar internasional (ISO, IEC)',
      'Riset dan inovasi yang mengubah praktik industri',
      'Advisor pemerintah dan lembaga internasional',
      'Pengembangan generasi ahli berikutnya',
    ],
    jabatanSipil: ['Professor Rekayasa Sipil', 'National Technical Expert', 'FIDIC Advisor'],
    jabatanArsitektur: ['Distinguished Architect', 'Urban Planning Expert'],
    jabatanMekanikal: ['Distinguished MEP Engineer', 'International Systems Expert'],
    jabatanManajemen: ['Distinguished Project Manager', 'International PM Expert'],
    keySkills: ['Thought leadership', 'Standar internasional', 'Inovasi industri', 'Riset doktoral'],
    toNextLevel: [],
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; glow: string; bar: string }> = {
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-300', glow: 'shadow-slate-500/10', bar: 'bg-slate-400' },
  stone: { bg: 'bg-stone-500/10', border: 'border-stone-500/30', text: 'text-stone-400', badge: 'bg-stone-500/20 text-stone-300', glow: 'shadow-stone-500/10', bar: 'bg-stone-400' },
  zinc: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/30', text: 'text-zinc-400', badge: 'bg-zinc-500/20 text-zinc-300', glow: 'shadow-zinc-500/10', bar: 'bg-zinc-400' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20 text-green-300', glow: 'shadow-green-500/10', bar: 'bg-green-400' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300', glow: 'shadow-sky-500/10', bar: 'bg-sky-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300', glow: 'shadow-blue-500/10', bar: 'bg-blue-400' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', badge: 'bg-violet-500/20 text-violet-300', glow: 'shadow-violet-500/10', bar: 'bg-violet-400' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300', glow: 'shadow-amber-500/20', bar: 'bg-amber-400' },
  gold: { bg: 'bg-yellow-400/10', border: 'border-yellow-400/40', text: 'text-yellow-400', badge: 'bg-yellow-400/20 text-yellow-300', glow: 'shadow-yellow-400/20', bar: 'bg-yellow-400' },
};

const specialtyJabatan: Record<Specialty, keyof KKNILevel> = {
  all: 'jabatanSipil',
  sipil: 'jabatanSipil',
  arsitektur: 'jabatanArsitektur',
  mekanikal: 'jabatanMekanikal',
  manajemen: 'jabatanManajemen',
};

const faqs = [
  {
    q: 'Apa bedanya KKNI Level dan SKK?',
    a: 'KKNI (Kerangka Kualifikasi Nasional Indonesia) adalah sistem penyetaraan kualifikasi nasional. SKK (Sertifikat Kompetensi Kerja) adalah bukti formal bahwa seseorang telah memenuhi standar KKNI tertentu di bidang konstruksi. Satu level KKNI bisa memiliki banyak jabatan/skema SKK yang berbeda.',
  },
  {
    q: 'Apakah saya bisa langsung ambil Level 6 tanpa Level 5?',
    a: 'Ya, bisa — jika Anda memenuhi persyaratan pendidikan dan pengalaman Level 6 secara langsung. KKNI tidak mengharuskan jalur linear. Namun, banyak LSP memperbolehkan "pengakuan kompetensi sebelumnya" (RPL) sehingga pengalaman kerja bisa menggantikan persyaratan formal.',
  },
  {
    q: 'Berapa lama masa berlaku SKK?',
    a: 'SKK berlaku 3 tahun. Setelah itu wajib perpanjangan melalui proses surveillance dan/atau re-sertifikasi. Selama masa berlaku, Anda wajib melakukan kegiatan PKB (Pengembangan Keprofesian Berkelanjutan).',
  },
  {
    q: 'Apakah SKK level lebih tinggi otomatis mencakup level bawahnya?',
    a: 'Tidak otomatis. Setiap jabatan dan skema SKK berdiri sendiri. Pemegang SKK Ahli Madya tidak otomatis dianggap memiliki SKK Ahli Pratama, kecuali untuk jabatan yang memang sama dengan pengembangan level.',
  },
  {
    q: 'Apa itu RPL dalam sertifikasi SKK?',
    a: 'RPL (Rekognisi Pembelajaran Lampau) adalah pengakuan formal atas kompetensi yang sudah dimiliki melalui pengalaman kerja, pelatihan non-formal, atau jalur lain di luar pendidikan formal. RPL memungkinkan profesional berpengalaman mendapatkan SKK tanpa harus memenuhi syarat pendidikan formal yang ketat.',
  },
  {
    q: 'Apakah SKK wajib untuk bekerja di proyek konstruksi?',
    a: 'Berdasarkan UU Jasa Konstruksi 2/2017 dan Permen PUPR 9/2023, tenaga kerja pada pekerjaan konstruksi yang menangani risiko K3 sedang ke atas wajib bersertifikat. Untuk proyek yang dibiayai APBN/APBD, ketentuan ini sangat ketat. Perusahaan (BUJK) juga wajib memiliki tenaga ahli bersertifikat untuk mempertahankan SBU.',
  },
  {
    q: 'Bagaimana cara naik dari Ahli Pratama ke Ahli Muda?',
    a: 'Umumnya: (1) Kumpulkan pengalaman kerja sesuai persyaratan Level 6, (2) Siapkan portofolio proyek yang lebih kompleks, (3) Daftar ke LSP yang sama atau berbeda untuk skema Ahli Muda, (4) Ikuti proses asesmen ulang. Masa berlaku SKK lama tidak otomatis diperpanjang — Anda perlu sertifikasi jabatan baru.',
  },
];

export default function KarirSKKPage() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [myLevel, setMyLevel] = useState<number | null>(null);
  const [specialty, setSpecialty] = useState<Specialty>('sipil');
  const [activeTab, setActiveTab] = useState<'peta' | 'path' | 'jabatan' | 'faq'>('peta');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const selectedData = selectedLevel !== null ? levels.find(l => l.level === selectedLevel) : null;
  const myLevelData = myLevel !== null ? levels.find(l => l.level === myLevel) : null;
  const nextLevelData = myLevel !== null ? levels.find(l => l.level === myLevel + 1) : null;

  const getJabatan = (lvl: KKNILevel): string[] => {
    if (specialty === 'arsitektur') return lvl.jabatanArsitektur;
    if (specialty === 'mekanikal') return lvl.jabatanMekanikal;
    if (specialty === 'manajemen') return lvl.jabatanManajemen;
    return lvl.jabatanSipil;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
            🎯 Peta Karir Konstruksi · KKNI Level 1–9 · SKK BNSP
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Peta Karir Konstruksi<br />
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Dari Tukang hingga Pakar Nasional
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Pahami posisi Anda di jenjang KKNI, jabatan yang bisa diambil, dan langkah konkret untuk naik ke level berikutnya.
          </p>
        </div>

        {/* Tab Nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {([
            { id: 'peta', label: '🗺️ Peta Jenjang KKNI' },
            { id: 'path', label: '🚀 Path Karir Saya' },
            { id: 'jabatan', label: '📋 Jabatan per Spesialisasi' },
            { id: 'faq', label: '❓ FAQ' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-300 border border-transparent hover:border-slate-700/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: PETA */}
        {activeTab === 'peta' && (
          <div>
            {/* Overview rows */}
            <div className="space-y-3 mb-8">
              {levels.map(lvl => {
                const c = colorMap[lvl.color];
                const isSelected = selectedLevel === lvl.level;
                const barWidth = `${(lvl.level / 9) * 100}%`;
                return (
                  <div key={lvl.level}>
                    <button
                      onClick={() => setSelectedLevel(isSelected ? null : lvl.level)}
                      className={`w-full text-left rounded-xl border transition-all p-4 ${
                        isSelected
                          ? `${c.border} ${c.bg} ring-1 ${c.glow}`
                          : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600/60 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Level badge */}
                        <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold ${c.bg} border ${c.border}`}>
                          <span className={`text-xs ${c.text}`}>L</span>
                          <span className={`text-lg leading-none ${c.text}`}>{lvl.level}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-white font-bold">{lvl.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-md ${c.badge}`}>{lvl.role}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span>🎓 {lvl.education}</span>
                            <span>⏳ {lvl.experience}</span>
                            <span>💰 {lvl.salary}</span>
                            <span>🏗️ {lvl.projectScale}</span>
                          </div>
                          {/* Progress bar */}
                          <div className="h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
                            <div className={`h-full ${c.bar} rounded-full transition-all`} style={{ width: barWidth }} />
                          </div>
                        </div>

                        <div className={`shrink-0 transition-transform ${isSelected ? 'rotate-180' : ''} ${c.text}`}>▾</div>
                      </div>
                    </button>

                    {/* Expanded */}
                    {isSelected && selectedData && (
                      <div className={`mt-1 rounded-xl border ${c.border} ${c.bg} p-5 grid md:grid-cols-3 gap-5`}>
                        {/* Tanggung jawab */}
                        <div>
                          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${c.text}`}>Tanggung Jawab</h4>
                          <ul className="space-y-1.5">
                            {selectedData.responsibilities.map((r, i) => (
                              <li key={i} className="flex gap-2 text-sm text-slate-300">
                                <span className="text-slate-600 shrink-0 mt-0.5">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Kompetensi kunci */}
                        <div>
                          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${c.text}`}>Kompetensi Kunci</h4>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {selectedData.keySkills.map((s, i) => (
                              <span key={i} className={`px-2 py-1 rounded-lg text-xs ${c.badge}`}>{s}</span>
                            ))}
                          </div>
                          <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Jabatan Sipil</h4>
                          {selectedData.jabatanSipil.map((j, i) => (
                            <div key={i} className="text-sm text-slate-300 py-0.5">📌 {j}</div>
                          ))}
                        </div>

                        {/* Cara naik level */}
                        {selectedData.toNextLevel.length > 0 ? (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-emerald-400">
                              ⬆️ Cara Naik ke Level {selectedData.level + 1}
                            </h4>
                            <ul className="space-y-1.5">
                              {selectedData.toNextLevel.map((t, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-300">
                                  <span className="text-emerald-500 shrink-0 mt-0.5">→</span>
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🏆</div>
                              <p className="text-amber-400 font-bold text-sm">Level Tertinggi</p>
                              <p className="text-slate-500 text-xs mt-1">Pakar internasional KKNI</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-center text-xs">
                {[
                  { range: 'L1–L3', label: 'Pelaksana', color: 'text-slate-400' },
                  { range: 'L4', label: 'Teknisi Senior', color: 'text-green-400' },
                  { range: 'L5–L6', label: 'Tenaga Ahli', color: 'text-blue-400' },
                  { range: 'L7–L8', label: 'Senior Expert', color: 'text-amber-400' },
                  { range: 'L9', label: 'Pakar Nasional', color: 'text-yellow-400' },
                ].map((g, i) => (
                  <div key={i} className="p-2 bg-slate-800/60 rounded-lg">
                    <div className={`font-bold ${g.color}`}>{g.range}</div>
                    <div className="text-slate-500 mt-0.5">{g.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: MY PATH */}
        {activeTab === 'path' && (
          <div className="space-y-6">
            {/* Level selector */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-1">Di mana posisi Anda sekarang?</h2>
              <p className="text-slate-400 text-sm mb-4">Pilih level SKK yang sudah Anda miliki saat ini:</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {levels.map(lvl => {
                  const c = colorMap[lvl.color];
                  return (
                    <button
                      key={lvl.level}
                      onClick={() => setMyLevel(lvl.level === myLevel ? null : lvl.level)}
                      className={`p-3 rounded-xl border transition-all text-center ${
                        myLevel === lvl.level
                          ? `${c.border} ${c.bg} ring-1 ring-amber-500/30`
                          : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600/60'
                      }`}
                    >
                      <div className={`text-xl font-bold ${myLevel === lvl.level ? c.text : 'text-slate-400'}`}>
                        L{lvl.level}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-tight">{lvl.title}</div>
                    </button>
                  );
                })}
                <button
                  onClick={() => setMyLevel(null)}
                  className={`p-3 rounded-xl border transition-all text-center ${
                    myLevel === null
                      ? 'border-rose-500/40 bg-rose-500/10 ring-1 ring-rose-500/20'
                      : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600/60'
                  }`}
                >
                  <div className={`text-xl font-bold ${myLevel === null ? 'text-rose-400' : 'text-slate-400'}`}>?</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-tight">Belum punya</div>
                </button>
              </div>
            </div>

            {/* Result */}
            {myLevel === null && (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-white font-bold text-lg mb-2">Mulai dari Level 1 atau 2</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
                  Jika belum memiliki SKK, mulai dengan memeriksa kelayakan Anda untuk jabatan di level yang sesuai latar belakang pendidikan dan pengalaman.
                </p>
                <a
                  href="/skk-coach/chat?agent=kelayakan"
                  className="inline-block px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  🔍 Cek Kelayakan SKK Saya
                </a>
              </div>
            )}

            {myLevel !== null && myLevelData && (
              <div className="space-y-4">
                {/* Current status */}
                <div className={`rounded-2xl border ${colorMap[myLevelData.color].border} ${colorMap[myLevelData.color].bg} p-6`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-2xl ${colorMap[myLevelData.color].badge} border ${colorMap[myLevelData.color].border}`}>
                      L{myLevel}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-xl ${colorMap[myLevelData.color].text}`}>{myLevelData.title}</h3>
                      <p className="text-slate-300 text-sm">{myLevelData.role}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-400">
                        <span>💰 {myLevelData.salary}</span>
                        <span>🏗️ {myLevelData.projectScale}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {myLevelData.keySkills.map((s, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-md ${colorMap[myLevelData.color].badge}`}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Path to next */}
                {nextLevelData && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                      <span className="text-amber-400 text-sm font-medium">⬆️ Target Berikutnya</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                    </div>

                    <div className={`rounded-2xl border ${colorMap[nextLevelData.color].border} bg-slate-800/40 p-6`}>
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold ${colorMap[nextLevelData.color].badge} border ${colorMap[nextLevelData.color].border}`}>
                          <span className="text-xs">L</span>
                          <span className="text-lg leading-none">{nextLevelData.level}</span>
                        </div>
                        <div>
                          <h4 className={`font-bold text-lg ${colorMap[nextLevelData.color].text}`}>{nextLevelData.title}</h4>
                          <p className="text-slate-400 text-sm">{nextLevelData.role}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                            <span>🎓 {nextLevelData.education}</span>
                            <span>⏳ {nextLevelData.experience}</span>
                            <span>💰 {nextLevelData.salary}</span>
                          </div>
                        </div>
                      </div>

                      <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                        Langkah untuk mencapai Level {nextLevelData.level}:
                      </h5>
                      <div className="grid md:grid-cols-2 gap-2">
                        {myLevelData.toNextLevel.map((step, i) => (
                          <div key={i} className={`flex items-start gap-2 p-3 rounded-lg ${colorMap[nextLevelData.color].bg} border ${colorMap[nextLevelData.color].border}`}>
                            <span className="text-emerald-400 font-bold shrink-0 text-sm">{i + 1}.</span>
                            <span className="text-sm text-slate-300">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Career vision */}
                {myLevel < 9 && (
                  <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
                    <h4 className="text-white font-bold mb-3">🔭 Visi Karir Jangka Panjang</h4>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {levels.filter(l => l.level >= myLevel).map((lvl, idx) => {
                        const c = colorMap[lvl.color];
                        const isCurrent = lvl.level === myLevel;
                        return (
                          <div key={lvl.level} className="flex items-center gap-2 shrink-0">
                            {idx > 0 && <div className="text-slate-700 font-bold">→</div>}
                            <div className={`px-3 py-2 rounded-lg border text-center min-w-[80px] ${
                              isCurrent ? `${c.border} ${c.bg} ring-1 ring-amber-500/30` : `border-slate-700/40 bg-slate-800/60`
                            }`}>
                              <div className={`font-bold text-sm ${isCurrent ? c.text : 'text-slate-400'}`}>L{lvl.level}</div>
                              <div className="text-xs text-slate-600 leading-tight">{lvl.title.split(' ').slice(-1)[0]}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {myLevel === 9 && (
                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-6 text-center">
                    <div className="text-5xl mb-3">🌟</div>
                    <h3 className="text-yellow-400 font-bold text-xl">Anda di Puncak Tertinggi</h3>
                    <p className="text-slate-400 text-sm mt-2">KKNI Level 9 — Pakar internasional bidang konstruksi. Kontribusi Anda membentuk industri untuk generasi berikutnya.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: JABATAN */}
        {activeTab === 'jabatan' && (
          <div>
            {/* Specialty selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {([
                { id: 'sipil', label: '🏗️ Sipil' },
                { id: 'arsitektur', label: '🏛️ Arsitektur' },
                { id: 'mekanikal', label: '⚙️ Mekanikal & Elektrikal' },
                { id: 'manajemen', label: '📋 Manajemen Konstruksi' },
              ] as { id: Specialty; label: string }[]).map(sp => (
                <button
                  key={sp.id}
                  onClick={() => setSpecialty(sp.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    specialty === sp.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-300 border border-slate-700/50'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {levels.map(lvl => {
                const c = colorMap[lvl.color];
                const jabatan = getJabatan(lvl);
                return (
                  <div key={lvl.level} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`font-bold ${c.text}`}>Level {lvl.level}</span>
                      <span className="text-slate-500 text-sm">{lvl.title}</span>
                      <span className="text-slate-600 text-xs ml-auto">{lvl.education} · {lvl.experience}</span>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {jabatan.map((j, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-sm text-slate-300`}>
                          <span className="text-xs">📌</span>
                          <span>{j}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-slate-400">
              💡 Daftar jabatan bersifat representatif. Untuk daftar lengkap jabatan SKK per subklasifikasi, gunakan{' '}
              <a href="/sertifikasi" className="text-amber-400 hover:underline">Database Jabatan SKK</a>.
            </div>
          </div>
        )}

        {/* TAB: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`rounded-xl border transition-all ${
                expandedFaq === i ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-700/50 bg-slate-800/40'
              }`}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-start justify-between gap-3 p-5 text-left"
                >
                  <span className={`font-medium text-sm leading-relaxed ${expandedFaq === i ? 'text-amber-300' : 'text-white'}`}>
                    {faq.q}
                  </span>
                  <span className={`shrink-0 transition-transform text-amber-400 ${expandedFaq === i ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-700/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-amber-600/20 to-yellow-600/15 border border-amber-500/30 rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold text-lg mb-2">Siap Naik Level?</h3>
          <p className="text-slate-400 text-sm mb-5">
            Periksa kelayakan SKK Anda, rencanakan belajar, dan latihan soal asesmen — semuanya di SIAP SKK.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/skk-coach/chat?agent=kelayakan" className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition-colors">
              🔍 Cek Kelayakan SKK
            </a>
            <a href="/diagnostik-kompetensi" className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
              🧠 Diagnostik Kompetensi
            </a>
            <a href="/timeline-skk" className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
              🗺️ Timeline Proses SKK
            </a>
            <a href="/menjadi-asesor" className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
              🎖️ Menjadi Asesor
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
