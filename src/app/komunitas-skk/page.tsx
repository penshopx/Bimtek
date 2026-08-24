'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Bidang = 'all' | 'kontraktor' | 'konsultan' | 'profesi' | 'spesialis';
type Manfaat = 'lsp' | 'cpe' | 'jaringan' | 'pelatihan' | 'advokasi';

interface Asosiasi {
  id: string;
  nama: string;
  singkatan: string;
  kepanjangan: string;
  bidang: Bidang[];
  icon: string;
  accent: string;
  deskripsi: string;
  jabatanSKK: string[];
  manfaat: Manfaat[];
  lspAfiliasi?: string;
  website?: string;
  didirikan?: string;
  anggota?: string;
  highlight?: string;
  tips?: string;
}

const asosiasi: Asosiasi[] = [
  {
    id: 'gapensi',
    nama: 'Gabungan Pelaksana Konstruksi Nasional Indonesia',
    singkatan: 'GAPENSI',
    kepanjangan: 'Gabungan Pelaksana Konstruksi Nasional Indonesia',
    bidang: ['kontraktor'],
    icon: '🏗️',
    accent: 'blue',
    deskripsi: 'Asosiasi BUJK kontraktor terbesar di Indonesia. Anggota GAPENSI tersebar di 34 provinsi dan diakui oleh LPJK sebagai asosiasi badan usaha konstruksi. Memiliki LSP Gapensi sendiri yang aktif menggelar asesmen SKK di seluruh wilayah.',
    jabatanSKK: ['Ahli Teknik Jalan', 'Ahli Teknik Bangunan Gedung', 'Pelaksana Bangunan Gedung', 'Mandor Konstruksi', 'Ahli Manajemen Konstruksi', 'Ahli K3 Konstruksi'],
    manfaat: ['lsp', 'cpe', 'jaringan', 'pelatihan'],
    lspAfiliasi: 'LSP Gapensi',
    website: 'gapensi.or.id',
    didirikan: '1959',
    anggota: '30.000+ BUJK',
    highlight: 'Terbesar',
    tips: 'Anggota GAPENSI sering mendapat prioritas slot asesmen dan diskon biaya SKK di LSP Gapensi.',
  },
  {
    id: 'gapeksindo',
    nama: 'Gabungan Pengusaha Konstruksi Indonesia',
    singkatan: 'GAPEKSINDO',
    kepanjangan: 'Gabungan Pengusaha Konstruksi Indonesia',
    bidang: ['kontraktor'],
    icon: '🏢',
    accent: 'indigo',
    deskripsi: 'Asosiasi BUJK kontraktor dengan fokus pada kontraktor menengah dan kecil. Diakui LPJK, aktif mendorong pelatihan pra-sertifikasi bagi personil teknis anggota di berbagai wilayah.',
    jabatanSKK: ['Pelaksana Lapangan', 'Ahli Teknik Sipil', 'Quantity Surveyor', 'Ahli Manajemen Konstruksi', 'Teknisi/Analis Pengujian Laboratorium'],
    manfaat: ['lsp', 'pelatihan', 'jaringan'],
    lspAfiliasi: 'LSP Gapeksindo',
    website: 'gapeksindo.or.id',
    anggota: '12.000+ BUJK',
    tips: 'Cocok untuk kontraktor menengah yang butuh jalur SKK terjangkau dengan bimbingan asosiasi.',
  },
  {
    id: 'askonas',
    nama: 'Asosiasi Kontraktor Konstruksi Indonesia',
    singkatan: 'ASKONAS',
    kepanjangan: 'Asosiasi Kontraktor Konstruksi Indonesia',
    bidang: ['kontraktor'],
    icon: '⚙️',
    accent: 'slate',
    deskripsi: 'Asosiasi BUJK kontraktor yang diakui LPJK. Fokus pada pemberdayaan kontraktor nasional dengan program peningkatan kapasitas SDM dan akses ke informasi kebijakan PUPR terbaru.',
    jabatanSKK: ['Ahli Teknik Bangunan Gedung', 'Pelaksana Bangunan', 'Ahli Muda Teknik Sipil', 'Ahli K3 Konstruksi'],
    manfaat: ['jaringan', 'advokasi', 'pelatihan'],
    website: 'askonas.or.id',
    anggota: '8.000+ BUJK',
  },
  {
    id: 'inkindo',
    nama: 'Ikatan Nasional Konsultan Indonesia',
    singkatan: 'INKINDO',
    kepanjangan: 'Ikatan Nasional Konsultan Indonesia',
    bidang: ['konsultan'],
    icon: '📐',
    accent: 'cyan',
    deskripsi: 'Wadah utama perusahaan konsultan konstruksi Indonesia. Diakui LPJK sebagai asosiasi badan usaha konsultansi konstruksi. Memiliki LSP INKINDO sendiri dan aktif mengadakan Continuing Professional Education (CPE) untuk anggota.',
    jabatanSKK: ['Ahli Teknik (semua bidang)', 'Ahli Manajemen Proyek', 'Quantity Surveyor', 'Ahli Perencanaan Wilayah dan Kota', 'Ahli Geodesi'],
    manfaat: ['lsp', 'cpe', 'jaringan', 'pelatihan', 'advokasi'],
    lspAfiliasi: 'LSP Konsultan Konstruksi Indonesia (LSP INKINDO)',
    website: 'inkindo.org',
    didirikan: '1979',
    anggota: '7.000+ badan usaha konsultan',
    highlight: 'Konsultan #1',
    tips: 'Anggota INKINDO wajib memiliki personil dengan SKK — keanggotaan memudahkan akses program sertifikasi kolektif.',
  },
  {
    id: 'perkindo',
    nama: 'Persatuan Konsultan Indonesia',
    singkatan: 'PERKINDO',
    kepanjangan: 'Persatuan Konsultan Indonesia',
    bidang: ['konsultan'],
    icon: '🔬',
    accent: 'teal',
    deskripsi: 'Asosiasi badan usaha konsultansi yang diakui LPJK. Berfokus pada pengembangan standar jasa konsultansi dan advokasi kepentingan konsultan nasional di forum regulasi PUPR.',
    jabatanSKK: ['Ahli Teknik', 'Ahli Manajemen Konstruksi', 'Ahli Lingkungan', 'Ahli Geodesi', 'Ahli Hidrologi'],
    manfaat: ['jaringan', 'advokasi', 'cpe'],
    website: 'perkindo.org',
    anggota: '4.000+ badan usaha',
  },
  {
    id: 'iai',
    nama: 'Ikatan Arsitek Indonesia',
    singkatan: 'IAI',
    kepanjangan: 'Ikatan Arsitek Indonesia',
    bidang: ['profesi'],
    icon: '🏛️',
    accent: 'orange',
    deskripsi: 'Organisasi profesi arsitek yang diakui negara. Anggota IAI mendapatkan Sertifikat Keahlian Arsitek (SKA-IAI) yang menjadi prasyarat untuk sejumlah jabatan SKK arsitektur. IAI aktif memfasilitasi sertifikasi BNSP bagi arsitek anggota.',
    jabatanSKK: ['Ahli Arsitektur Pratama', 'Ahli Arsitektur Muda', 'Ahli Arsitektur Madya', 'Ahli Arsitektur Utama', 'Ahli Desain Interior'],
    manfaat: ['lsp', 'cpe', 'jaringan', 'advokasi'],
    lspAfiliasi: 'LSP Arsitek Indonesia',
    website: 'iai.or.id',
    didirikan: '1959',
    anggota: '18.000+ arsitek',
    highlight: 'Profesi Arsitek',
    tips: 'Sertifikat IAI (SKA) dan SKK BNSP saling melengkapi — IAI memudahkan jalur pengakuan portofolio.',
  },
  {
    id: 'pii',
    nama: 'Persatuan Insinyur Indonesia',
    singkatan: 'PII',
    kepanjangan: 'Persatuan Insinyur Indonesia',
    bidang: ['profesi'],
    icon: '⚗️',
    accent: 'emerald',
    deskripsi: 'Organisasi profesi insinyur lintas bidang tertua di Indonesia. Mengelola program Insinyur Profesional (IP) yang diakui negara. Jalur Insinyur Profesional PII dan SKK BNSP sering dikombinasikan untuk memenuhi persyaratan jabatan teknis proyek nasional.',
    jabatanSKK: ['Ahli Teknik Sipil', 'Ahli Teknik Bangunan Gedung', 'Ahli Teknik Jalan', 'Ahli Teknik Jembatan', 'Ahli Teknik Mekanikal', 'Ahli Teknik Elektrikal'],
    manfaat: ['cpe', 'jaringan', 'advokasi', 'pelatihan'],
    website: 'pii.or.id',
    didirikan: '1952',
    anggota: '50.000+ insinyur',
    highlight: 'Tertua & Terluas',
    tips: 'Insinyur Profesional PII (IP-PII) adalah nilai tambah signifikan untuk proyek strategis nasional.',
  },
  {
    id: 'haki',
    nama: 'Himpunan Ahli Konstruksi Indonesia',
    singkatan: 'HAKI',
    kepanjangan: 'Himpunan Ahli Konstruksi Indonesia',
    bidang: ['profesi'],
    icon: '🏗️',
    accent: 'amber',
    deskripsi: 'Himpunan profesi ahli konstruksi yang diakui LPJK. Fokus pada bidang teknis konstruksi bangunan dan infrastruktur. HAKI aktif mengadakan seminar teknis dan program pengembangan kompetensi yang dapat dihitung sebagai CPE untuk perpanjangan SKK.',
    jabatanSKK: ['Ahli Teknik Bangunan Gedung', 'Ahli Teknik Pondasi', 'Ahli Geoteknik', 'Ahli Teknik Sipil', 'Ahli Teknik Jalan'],
    manfaat: ['cpe', 'jaringan', 'pelatihan'],
    website: 'haki.or.id',
    didirikan: '1974',
    anggota: '5.000+ anggota',
    tips: 'Seminar teknis HAKI diakui sebagai CPE untuk perpanjangan SKK — dokumentasikan setiap kehadiran.',
  },
  {
    id: 'hamki',
    nama: 'Himpunan Ahli Manajemen Konstruksi Indonesia',
    singkatan: 'HAMKI',
    kepanjangan: 'Himpunan Ahli Manajemen Konstruksi Indonesia',
    bidang: ['profesi', 'spesialis'],
    icon: '📊',
    accent: 'violet',
    deskripsi: 'Organisasi profesi spesialis bidang manajemen konstruksi. Fokus pada pengembangan standar manajemen proyek konstruksi Indonesia dan fasilitasi sertifikasi SKK manajemen. Aktif berkolaborasi dengan LPJK untuk skema jabatan manajerial.',
    jabatanSKK: ['Ahli Manajemen Konstruksi Pratama', 'Ahli Manajemen Konstruksi Muda', 'Ahli Manajemen Konstruksi Madya', 'Ahli Manajemen Proyek', 'Quantity Surveyor'],
    manfaat: ['lsp', 'cpe', 'jaringan'],
    website: 'hamki.or.id',
    tips: 'Untuk jabatan manajemen konstruksi level madya ke atas, jaringan HAMKI memperlancar akses ke asesor berpengalaman.',
  },
  {
    id: 'iampi',
    nama: 'Ikatan Ahli Manajemen Proyek Indonesia',
    singkatan: 'IAMPI',
    kepanjangan: 'Ikatan Ahli Manajemen Proyek Indonesia',
    bidang: ['profesi', 'spesialis'],
    icon: '📋',
    accent: 'rose',
    deskripsi: 'Asosiasi profesional manajemen proyek yang mengelola program sertifikasi Project Management Professional (PMP) versi Indonesia. Sertifikasi IAMPI sering dikombinasikan dengan SKK Ahli Manajemen Proyek untuk proyek-proyek multi-sumber dana.',
    jabatanSKK: ['Ahli Manajemen Proyek', 'Ahli Manajemen Konstruksi', 'Quantity Surveyor', 'Ahli Pengadaan'],
    manfaat: ['cpe', 'jaringan', 'pelatihan'],
    website: 'iampi.or.id',
    highlight: 'Manajemen Proyek',
  },
  {
    id: 'iap',
    nama: 'Ikatan Ahli Perencanaan Indonesia',
    singkatan: 'IAP',
    kepanjangan: 'Ikatan Ahli Perencanaan Indonesia',
    bidang: ['profesi', 'spesialis'],
    icon: '🗺️',
    accent: 'lime',
    deskripsi: 'Organisasi profesi perencana wilayah dan kota yang diakui. Mengelola Sertifikat Ahli Perencanaan (SAP) yang menjadi dasar bagi SKK Ahli Perencanaan Wilayah dan Kota. Aktif melakukan advokasi kebijakan tata ruang nasional.',
    jabatanSKK: ['Ahli Perencanaan Wilayah dan Kota Pratama', 'Ahli Perencanaan Wilayah dan Kota Muda', 'Ahli Perencanaan Wilayah dan Kota Madya'],
    manfaat: ['lsp', 'cpe', 'jaringan', 'advokasi'],
    website: 'iap.or.id',
    didirikan: '1970',
    anggota: '4.000+ anggota',
  },
  {
    id: 'hdii',
    nama: 'Himpunan Desainer Interior Indonesia',
    singkatan: 'HDII',
    kepanjangan: 'Himpunan Desainer Interior Indonesia',
    bidang: ['spesialis'],
    icon: '🛋️',
    accent: 'pink',
    deskripsi: 'Organisasi profesi desainer interior yang diakui. HDII memfasilitasi sertifikasi kompetensi desainer interior selaras dengan skema BNSP. Keanggotaan HDII diakui di forum regional ASEAN Federation of Interior Designers.',
    jabatanSKK: ['Ahli Desain Interior', 'Perancang Produk Interior', 'Drafter Desain Interior'],
    manfaat: ['lsp', 'cpe', 'jaringan'],
    website: 'hdii.or.id',
    anggota: '3.500+ desainer',
    tips: 'Portofolio proyek yang diakui HDII memperkuat bukti kompetensi saat asesmen SKK.',
  },
  {
    id: 'hpji',
    nama: 'Himpunan Pengembangan Jalan Indonesia',
    singkatan: 'HPJI',
    kepanjangan: 'Himpunan Pengembangan Jalan Indonesia',
    bidang: ['spesialis'],
    icon: '🛣️',
    accent: 'yellow',
    deskripsi: 'Himpunan profesi spesialis rekayasa jalan dan transportasi. Mengorganisir seminar teknis dan standar konstruksi jalan yang menjadi referensi bagi SKK jabatan bidang jalan. Aktif berkolaborasi dengan Ditjen Bina Marga PUPR.',
    jabatanSKK: ['Ahli Teknik Jalan Pratama', 'Ahli Teknik Jalan Muda', 'Ahli Teknik Jalan Madya', 'Ahli Teknik Jembatan', 'Pelaksana Jalan'],
    manfaat: ['cpe', 'jaringan', 'pelatihan'],
    website: 'hpji.or.id',
    highlight: 'Jalan & Jembatan',
  },
  {
    id: 'iatpi',
    nama: 'Ikatan Ahli Teknik Penyehatan dan Teknik Lingkungan Indonesia',
    singkatan: 'IATPI',
    kepanjangan: 'Ikatan Ahli Teknik Penyehatan dan Teknik Lingkungan Indonesia',
    bidang: ['spesialis'],
    icon: '💧',
    accent: 'sky',
    deskripsi: 'Organisasi profesi spesialis bidang sanitasi, air bersih, limbah, dan teknik lingkungan. Relevan untuk proyek infrastruktur air dan sanitasi. Keanggotaan memfasilitasi akses ke pelatihan dan sertifikasi SKK bidang mekanikal-lingkungan.',
    jabatanSKK: ['Ahli Teknik Air Minum', 'Ahli Teknik Sanitasi dan Limbah', 'Ahli Teknik Lingkungan', 'Ahli Teknik Mekanikal (MEP)'],
    manfaat: ['cpe', 'jaringan', 'pelatihan'],
    website: 'iatpi.or.id',
    tips: 'Proyek SPAM dan IPAL sering mensyaratkan jabatan SKK yang hanya dipahami komunitas IATPI.',
  },
];

const bidangOptions: { id: Bidang; label: string; icon: string }[] = [
  { id: 'all', label: 'Semua', icon: '🌐' },
  { id: 'kontraktor', label: 'Kontraktor (BUJK)', icon: '🏗️' },
  { id: 'konsultan', label: 'Konsultan', icon: '📐' },
  { id: 'profesi', label: 'Profesi Umum', icon: '👷' },
  { id: 'spesialis', label: 'Spesialis', icon: '🔬' },
];

const manfaatLabels: Record<Manfaat, { label: string; icon: string; color: string }> = {
  lsp: { label: 'Punya LSP Afiliasi', icon: '🏛️', color: 'text-emerald-400 bg-emerald-500/20' },
  cpe: { label: 'CPE Perpanjangan SKK', icon: '📅', color: 'text-blue-400 bg-blue-500/20' },
  jaringan: { label: 'Jaringan Nasional', icon: '🤝', color: 'text-purple-400 bg-purple-500/20' },
  pelatihan: { label: 'Pelatihan Pra-SKK', icon: '📚', color: 'text-amber-400 bg-amber-500/20' },
  advokasi: { label: 'Advokasi Kebijakan', icon: '⚖️', color: 'text-rose-400 bg-rose-500/20' },
};

const accentClasses: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  blue: { border: 'border-blue-500/40', bg: 'from-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
  indigo: { border: 'border-indigo-500/40', bg: 'from-indigo-500/10', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300' },
  slate: { border: 'border-slate-500/40', bg: 'from-slate-500/10', text: 'text-slate-300', badge: 'bg-slate-500/30 text-slate-200' },
  cyan: { border: 'border-cyan-500/40', bg: 'from-cyan-500/10', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
  teal: { border: 'border-teal-500/40', bg: 'from-teal-500/10', text: 'text-teal-400', badge: 'bg-teal-500/20 text-teal-300' },
  orange: { border: 'border-orange-500/40', bg: 'from-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
  emerald: { border: 'border-emerald-500/40', bg: 'from-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  amber: { border: 'border-amber-500/40', bg: 'from-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
  violet: { border: 'border-violet-500/40', bg: 'from-violet-500/10', text: 'text-violet-400', badge: 'bg-violet-500/20 text-violet-300' },
  rose: { border: 'border-rose-500/40', bg: 'from-rose-500/10', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' },
  lime: { border: 'border-lime-500/40', bg: 'from-lime-500/10', text: 'text-lime-400', badge: 'bg-lime-500/20 text-lime-300' },
  pink: { border: 'border-pink-500/40', bg: 'from-pink-500/10', text: 'text-pink-400', badge: 'bg-pink-500/20 text-pink-300' },
  yellow: { border: 'border-yellow-500/40', bg: 'from-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300' },
  sky: { border: 'border-sky-500/40', bg: 'from-sky-500/10', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300' },
};

export default function KomunitasSKKPage() {
  const [activeBidang, setActiveBidang] = useState<Bidang>('all');
  const [search, setSearch] = useState('');
  const [activeManfaat, setActiveManfaat] = useState<Manfaat | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return asosiasi.filter(a => {
      const matchBidang = activeBidang === 'all' || a.bidang.includes(activeBidang);
      const matchManfaat = activeManfaat === 'all' || a.manfaat.includes(activeManfaat);
      const q = search.toLowerCase();
      const matchSearch = !q || a.nama.toLowerCase().includes(q) || a.singkatan.toLowerCase().includes(q) ||
        a.jabatanSKK.some(j => j.toLowerCase().includes(q)) || a.deskripsi.toLowerCase().includes(q);
      return matchBidang && matchManfaat && matchSearch;
    });
  }, [activeBidang, activeManfaat, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/skk" className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm mb-4 transition-colors">
            ← SKK Hub
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium mb-4 ml-4">
            🤝 Ekosistem Profesi Konstruksi
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Komunitas & Asosiasi<br />
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Profesi Konstruksi Indonesia
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            14 asosiasi profesi dan badan usaha konstruksi yang diakui LPJK & BNSP. Bergabung untuk mempercepat akses SKK, mendapatkan CPE, dan membangun jaringan profesional.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { v: '14', l: 'Asosiasi Diakui LPJK' },
            { v: '5+', l: 'Punya LSP Afiliasi' },
            { v: 'CPE', l: 'Untuk Perpanjangan SKK' },
            { v: '100K+', l: 'Total Anggota' },
          ].map(s => (
            <div key={s.l} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-cyan-400 mb-0.5">{s.v}</div>
              <div className="text-slate-400 text-sm">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Why Join Banner */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 rounded-xl p-5 mb-8">
          <h2 className="text-white font-semibold mb-3">💡 Mengapa Bergabung ke Asosiasi Profesi?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {[
              { icon: '🏛️', title: 'Akses LSP Afiliasi', desc: 'Banyak asosiasi punya LSP sendiri — anggota dapat prioritas jadwal dan potongan biaya asesmen SKK.' },
              { icon: '📅', title: 'Poin CPE Gratis', desc: 'Seminar dan kegiatan asosiasi dihitung sebagai Continuing Professional Education untuk perpanjangan SKK 5 tahunan.' },
              { icon: '📋', title: 'Rekomendasi Portofolio', desc: 'Surat rekomendasi asosiasi memperkuat bukti kompetensi saat mengajukan jabatan SKK level madya–utama.' },
              { icon: '🤝', title: 'Jaringan Proyek', desc: 'Kenalan di asosiasi = referensi pekerjaan. Kontraktor dan konsultan sering mencari personil bersertifikat lewat jaringan asosiasi.' },
              { icon: '⚖️', title: 'Advokasi Regulasi', desc: 'Asosiasi mewakili kepentingan profesi di forum BNSP dan PUPR — kebijakan SKK dibentuk bersama anggota.' },
              { icon: '📚', title: 'Pelatihan Eksklusif', desc: 'Pelatihan pra-sertifikasi internal asosiasi sering lebih terjangkau dan relevan dibanding lembaga umum.' },
            ].map(item => (
              <div key={item.title} className="flex gap-3">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <div className="text-white font-medium">{item.title}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari asosiasi atau jabatan SKK..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">✕</button>
            )}
          </div>

          {/* Bidang filter */}
          <div className="flex flex-wrap gap-2">
            {bidangOptions.map(b => (
              <button
                key={b.id}
                onClick={() => setActiveBidang(b.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeBidang === b.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {b.icon} {b.label}
              </button>
            ))}
          </div>

          {/* Manfaat filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveManfaat('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeManfaat === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-800/50 text-slate-500 hover:text-slate-300 border border-slate-700'
              }`}
            >
              Semua Manfaat
            </button>
            {(Object.keys(manfaatLabels) as Manfaat[]).map(m => (
              <button
                key={m}
                onClick={() => setActiveManfaat(activeManfaat === m ? 'all' : m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeManfaat === m
                    ? `${manfaatLabels[m].color} border border-current`
                    : 'bg-slate-800/50 text-slate-500 hover:text-slate-300 border border-slate-700'
                }`}
              >
                {manfaatLabels[m].icon} {manfaatLabels[m].label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-slate-400 text-sm">
            Menampilkan <span className="text-white font-semibold">{filtered.length}</span> dari {asosiasi.length} asosiasi
          </p>
          {(search || activeBidang !== 'all' || activeManfaat !== 'all') && (
            <button
              onClick={() => { setSearch(''); setActiveBidang('all'); setActiveManfaat('all'); }}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Cards */}
        <div className="space-y-4 mb-12">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <div className="text-4xl mb-3">🔍</div>
              <p>Tidak ada asosiasi yang cocok dengan filter Anda.</p>
            </div>
          ) : (
            filtered.map(a => {
              const ac = accentClasses[a.accent] || accentClasses.slate;
              const isOpen = expanded === a.id;
              return (
                <div
                  key={a.id}
                  className={`bg-gradient-to-br ${ac.bg} to-slate-800/60 border ${ac.border} rounded-xl overflow-hidden transition-all`}
                >
                  {/* Card Header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : a.id)}
                    className="w-full text-left p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-slate-800 border ${ac.border} flex items-center justify-center text-2xl shrink-0`}>
                        {a.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-lg font-bold ${ac.text}`}>{a.singkatan}</span>
                          {a.highlight && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ac.badge}`}>
                              ⭐ {a.highlight}
                            </span>
                          )}
                          {a.lspAfiliasi && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                              🏛️ Punya LSP
                            </span>
                          )}
                        </div>
                        <p className="text-white text-sm font-medium mb-1 leading-snug">{a.nama}</p>
                        <p className="text-slate-400 text-xs line-clamp-2">{a.deskripsi}</p>

                        {/* Quick stats */}
                        <div className="flex flex-wrap gap-3 mt-2">
                          {a.didirikan && <span className="text-slate-500 text-xs">📅 Est. {a.didirikan}</span>}
                          {a.anggota && <span className="text-slate-500 text-xs">👥 {a.anggota}</span>}
                          <span className="text-slate-500 text-xs">🎯 {a.jabatanSKK.length} jabatan SKK relevan</span>
                        </div>
                      </div>
                      <div className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</div>
                    </div>

                    {/* Manfaat badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3 pl-16">
                      {a.manfaat.map(m => (
                        <span key={m} className={`text-xs px-2 py-0.5 rounded-full ${manfaatLabels[m].color}`}>
                          {manfaatLabels[m].icon} {manfaatLabels[m].label}
                        </span>
                      ))}
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-slate-700/50 pt-5 space-y-5">
                      {/* Deskripsi */}
                      <p className="text-slate-300 text-sm leading-relaxed">{a.deskripsi}</p>

                      {/* Jabatan SKK */}
                      <div>
                        <h3 className={`text-sm font-semibold ${ac.text} mb-2`}>Jabatan SKK yang Difasilitasi</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {a.jabatanSKK.map(j => (
                            <span key={j} className="bg-slate-700/60 text-slate-300 text-xs px-2.5 py-1 rounded-lg">
                              {j}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* LSP Afiliasi */}
                      {a.lspAfiliasi && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                          <div className="text-emerald-400 text-xs font-semibold mb-1">🏛️ LSP Terafiliasi</div>
                          <div className="text-white text-sm">{a.lspAfiliasi}</div>
                          <div className="text-emerald-300/70 text-xs mt-1">
                            Anggota asosiasi ini dapat mengakses asesmen SKK melalui LSP afiliasi dengan kemudahan khusus.
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      {a.tips && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                          <div className="text-amber-400 text-xs font-semibold mb-1">💡 Tips SKK</div>
                          <div className="text-slate-300 text-sm">{a.tips}</div>
                        </div>
                      )}

                      {/* Links */}
                      <div className="flex flex-wrap gap-3">
                        {a.website && (
                          <a
                            href={`https://${a.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 text-sm ${ac.text} hover:underline`}
                          >
                            🌐 {a.website} ↗
                          </a>
                        )}
                        <Link
                          href={`/chat?q=Saya ingin bergabung dengan ${a.singkatan}. Apa manfaatnya untuk SKK dan bagaimana prosedur pendaftaran anggotanya?`}
                          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                        >
                          💬 Tanya AI tentang {a.singkatan}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* SKK + Asosiasi Synergy Section */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 mb-10">
          <h2 className="text-white font-bold text-xl mb-2">🔄 Sinergi SKK dan Keanggotaan Asosiasi</h2>
          <p className="text-slate-400 text-sm mb-5">Asosiasi dan SKK bukan pilihan — keduanya saling memperkuat jalur karir Anda.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: '1',
                title: 'Bergabung Asosiasi',
                desc: 'Daftar ke asosiasi sesuai bidang kerja. Biasanya cukup fotokopi KTP, ijazah, dan surat keterangan bekerja.',
                icon: '📝',
              },
              {
                step: '2',
                title: 'Ikuti Program Pra-SKK',
                desc: 'Manfaatkan pelatihan internal asosiasi, seminar teknis, dan bimbingan dari senior anggota untuk persiapan portofolio SKK.',
                icon: '🎓',
              },
              {
                step: '3',
                title: 'Asesmen via LSP Afiliasi',
                desc: 'Ajukan asesmen SKK melalui LSP milik asosiasi — prosesnya lebih familiar, asesornya sering dikenal, dan biayanya lebih ringan.',
                icon: '🏛️',
              },
            ].map(s => (
              <div key={s.step} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-lg flex items-center justify-center shrink-0">
                  {s.step}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm mb-1">{s.icon} {s.title}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-white font-bold text-xl mb-5">❓ Pertanyaan Umum</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Apakah harus bergabung asosiasi untuk mendapatkan SKK?',
                a: 'Tidak wajib. SKK bisa didapat langsung melalui LSP mana pun tanpa keanggotaan asosiasi. Namun, bergabung ke asosiasi memberi banyak kemudahan: prioritas jadwal, diskon biaya, pelatihan pra-asesmen, dan jaringan untuk portofolio.',
              },
              {
                q: 'Biaya keanggotaan asosiasi biasanya berapa?',
                a: 'Berbeda-beda. Untuk asosiasi badan usaha (GAPENSI, GAPEKSINDO, INKINDO) biasanya ratusan ribu per tahun per perusahaan. Untuk asosiasi profesi individu (IAI, PII, HAKI) sekitar Rp 200.000–600.000/tahun tergantung jenjang.',
              },
              {
                q: 'Seminar asosiasi bisa dihitung CPE untuk perpanjangan SKK?',
                a: 'Ya — seminar, workshop, dan kegiatan teknis asosiasi yang berkaitan dengan kompetensi jabatan SKK dapat dihitung sebagai Continuing Professional Education (CPE). Simpan bukti kehadiran dan sertifikat untuk dilampirkan saat perpanjangan.',
              },
              {
                q: 'LSP asosiasi vs LSP umum, mana yang lebih baik?',
                a: 'Keduanya sah dan diakui BNSP. LSP asosiasi cenderung lebih familiar dengan profil anggotanya dan lebih terjangkau, tapi jadwalnya mungkin tidak selalu tersedia. LSP umum lebih fleksibel jadwal dan terbuka untuk semua.',
              },
              {
                q: 'Bisa bergabung lebih dari satu asosiasi?',
                a: 'Bisa. Banyak profesional konstruksi menjadi anggota PII (engineer) sekaligus HAKI (konstruksi) atau INKINDO (badan usaha). Pilih kombinasi yang paling relevan dengan jabatan SKK target Anda.',
              },
            ].map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 rounded-2xl p-8">
          <div className="text-3xl mb-3">🤝</div>
          <h2 className="text-white font-bold text-xl mb-2">Bingung Pilih Asosiasi?</h2>
          <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
            Ceritakan jabatan SKK target Anda, dan AI SIAP SKK akan merekomendasikan asosiasi yang paling relevan untuk karir Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/chat?q=Saya ingin bergabung asosiasi profesi konstruksi. Bidang saya adalah teknik sipil dan saya sedang mempersiapkan SKK. Asosiasi mana yang paling cocok untuk saya?"
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              💬 Tanya AI — Asosiasi Mana Cocok untuk Saya?
            </Link>
            <Link
              href="/direktori-lsp"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              🏛️ Lihat Direktori LSP
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left gap-4"
      >
        <span className="text-white text-sm font-medium">{q}</span>
        <span className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}
