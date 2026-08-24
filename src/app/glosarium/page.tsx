'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Kategori = 'Sertifikasi' | 'Dokumen & Form' | 'Regulasi' | 'Konstruksi' | 'Organisasi';

export interface Term {
  singkatan: string;
  kepanjangan: string;
  deskripsi: string;
  kategori: Kategori;
  link?: string;
}

export const terms: Term[] = [
  // ── Sertifikasi ──────────────────────────────────────────────────────────────
  { singkatan: 'SKK', kepanjangan: 'Sertifikat Kompetensi Kerja', kategori: 'Sertifikasi', deskripsi: 'Bukti tertulis yang diterbitkan oleh LSP terakreditasi BNSP bahwa seseorang telah memenuhi standar kompetensi kerja di bidang konstruksi. Menggantikan SKA dan SKT sejak 2022.' },
  { singkatan: 'SKKNI', kepanjangan: 'Standar Kompetensi Kerja Nasional Indonesia', kategori: 'Sertifikasi', deskripsi: 'Rumusan kemampuan kerja yang mencakup aspek pengetahuan, keterampilan, dan sikap kerja yang relevan dalam pelaksanaan tugas dan syarat jabatan tertentu. Ditetapkan oleh Menteri.' },
  { singkatan: 'KKNI', kepanjangan: 'Kerangka Kualifikasi Nasional Indonesia', kategori: 'Sertifikasi', deskripsi: 'Kerangka penjenjangan kualifikasi kompetensi yang menyandingkan, menyetarakan, dan mengintegrasikan sektor pendidikan dan pelatihan serta pengalaman kerja. Terdiri dari 9 level, Level 1 (operator) hingga Level 9 (ahli utama).' },
  { singkatan: 'UK', kepanjangan: 'Unit Kompetensi', kategori: 'Sertifikasi', deskripsi: 'Komponen terkecil dalam SKKNI yang menggambarkan kemampuan kerja spesifik yang dapat diobservasi dan dinilai. Setiap jabatan memiliki beberapa UK yang wajib dikuasai.' },
  { singkatan: 'KUK', kepanjangan: 'Kriteria Unjuk Kerja', kategori: 'Sertifikasi', deskripsi: 'Indikator spesifik dalam setiap Unit Kompetensi yang menggambarkan perilaku yang harus didemonstrasikan oleh asesi untuk dinyatakan kompeten.' },
  { singkatan: 'UJK', kepanjangan: 'Uji Kompetensi', kategori: 'Sertifikasi', deskripsi: 'Proses penilaian yang dilakukan oleh asesor kompetensi untuk menentukan apakah seseorang telah mencapai standar kompetensi yang ditetapkan dalam skema sertifikasi.' },
  { singkatan: 'AJJ', kepanjangan: 'Asesmen Jarak Jauh', kategori: 'Sertifikasi', deskripsi: 'Metode asesmen kompetensi yang dilakukan secara daring (online) melalui platform video conference, tanpa kehadiran fisik di TUK. Diatur dalam Pedoman BNSP No. 210.' },
  { singkatan: 'TPA', kepanjangan: 'Tempat Praktik Asesmen', kategori: 'Sertifikasi', deskripsi: 'Lokasi atau fasilitas yang digunakan untuk mendemonstrasikan kompetensi praktis selama proses asesmen. Berbeda dengan TUK yang merupakan lokasi administratif asesmen.' },
  { singkatan: 'TPL', kepanjangan: 'Tempat Pelatihan', kategori: 'Sertifikasi', deskripsi: 'Fasilitas atau institusi yang menyelenggarakan pelatihan berbasis kompetensi sebagai persiapan sebelum mengikuti uji kompetensi SKK.' },
  { singkatan: 'RAL', kepanjangan: 'Rekognisi Aktivitas Luar', kategori: 'Sertifikasi', deskripsi: 'Pengakuan atas kompetensi yang diperoleh dari kegiatan di luar jalur formal — termasuk pengalaman kerja, pelatihan non-formal, dan kegiatan profesional lainnya.' },
  { singkatan: 'RCC', kepanjangan: 'Recognition of Current Competency', kategori: 'Sertifikasi', deskripsi: 'Pengakuan kompetensi terkini seseorang melalui bukti-bukti yang dikumpulkan tanpa perlu mengulang pelatihan formal. Relevan bagi profesional berpengalaman.' },
  { singkatan: 'PKB', kepanjangan: 'Pengembangan Keprofesian Berkelanjutan', kategori: 'Sertifikasi', deskripsi: 'Kegiatan yang dilakukan tenaga ahli konstruksi untuk mempertahankan, meningkatkan, dan mengembangkan pengetahuan, keahlian, dan kompetensi profesional secara terus-menerus. Dipersyaratkan untuk perpanjangan SKK.' },
  { singkatan: 'SKA', kepanjangan: 'Sertifikat Keahlian', kategori: 'Sertifikasi', deskripsi: 'Sertifikasi tenaga ahli konstruksi yang berlaku sebelum penerapan SKK. SKA sudah tidak diterbitkan lagi sejak diberlakukannya PP 14/2021, namun SKA yang masih berlaku tetap diakui.' },
  { singkatan: 'SKT', kepanjangan: 'Sertifikat Keterampilan', kategori: 'Sertifikasi', deskripsi: 'Sertifikasi tenaga terampil konstruksi yang berlaku sebelum penerapan SKK. Seperti SKA, sudah tidak diterbitkan lagi dan digantikan oleh SKK.' },

  // ── Dokumen & Form ───────────────────────────────────────────────────────────
  { singkatan: 'FR.APL.01', kepanjangan: 'Formulir Permohonan Asesmen Kompetensi', kategori: 'Dokumen & Form', deskripsi: 'Formulir resmi yang diisi oleh asesi untuk mendaftar uji kompetensi. Berisi data pribadi, riwayat pendidikan, pengalaman kerja, dan pilihan metode asesmen (hardcopy/paperless/AJJ).' },
  { singkatan: 'FR.APL.02', kepanjangan: 'Formulir Asesmen Mandiri', kategori: 'Dokumen & Form', deskripsi: 'Formulir self-assessment di mana asesi menilai diri sendiri terhadap setiap Kriteria Unjuk Kerja (KUK) dari unit kompetensi yang akan diujikan. Dilengkapi dengan bukti-bukti kompetensi.' },
  { singkatan: 'RK3K', kepanjangan: 'Rencana Keselamatan Konstruksi', kategori: 'Dokumen & Form', deskripsi: 'Dokumen wajib dalam tender konstruksi yang memuat rencana pengelolaan K3 untuk proyek yang ditawarkan. Berisi identifikasi bahaya, penilaian risiko, dan rencana pengendalian.' },
  { singkatan: 'IBPRP', kepanjangan: 'Identifikasi Bahaya, Penilaian Risiko, dan Pengendalian', kategori: 'Dokumen & Form', deskripsi: 'Dokumen analisis risiko K3 yang mengidentifikasi potensi bahaya di tempat kerja, menilai tingkat risikonya, dan menetapkan langkah pengendalian yang sesuai.' },
  { singkatan: 'JSA', kepanjangan: 'Job Safety Analysis', kategori: 'Dokumen & Form', deskripsi: 'Analisis keselamatan untuk pekerjaan spesifik yang mengidentifikasi bahaya di setiap langkah pekerjaan dan tindakan pencegahan yang diperlukan sebelum pekerjaan dimulai.' },
  { singkatan: 'NCR', kepanjangan: 'Non-Conformance Report', kategori: 'Dokumen & Form', deskripsi: 'Laporan yang mencatat ketidaksesuaian pekerjaan dengan spesifikasi, standar, atau prosedur yang berlaku. Wajib ditindaklanjuti oleh kontraktor dengan corrective action.' },
  { singkatan: 'ITP', kepanjangan: 'Inspection and Test Plan', kategori: 'Dokumen & Form', deskripsi: 'Rencana inspeksi dan pengujian yang menetapkan titik-titik pemeriksaan mutu, metode pengujian, standar penerimaan, dan pihak yang berwenang melakukan inspeksi.' },
  { singkatan: 'RFI', kepanjangan: 'Request for Information', kategori: 'Dokumen & Form', deskripsi: 'Surat permintaan klarifikasi atau informasi tambahan yang diajukan kontraktor kepada owner atau konsultan perencana terkait ketidakjelasan dalam dokumen kontrak atau gambar.' },
  { singkatan: 'BAP', kepanjangan: 'Berita Acara Pemeriksaan', kategori: 'Dokumen & Form', deskripsi: 'Dokumen resmi yang mencatat hasil pemeriksaan pekerjaan, material, atau kondisi lapangan. Ditandatangani oleh pihak-pihak terkait sebagai bukti pemeriksaan telah dilakukan.' },

  // ── Regulasi ─────────────────────────────────────────────────────────────────
  { singkatan: 'UU 2/2017', kepanjangan: 'Undang-Undang Nomor 2 Tahun 2017 tentang Jasa Konstruksi', kategori: 'Regulasi', deskripsi: 'Undang-undang utama yang mengatur penyelenggaraan jasa konstruksi di Indonesia, termasuk persyaratan kompetensi tenaga kerja konstruksi dan kewajiban sertifikasi SKK.' },
  { singkatan: 'PP 14/2021', kepanjangan: 'Peraturan Pemerintah Nomor 14 Tahun 2021', kategori: 'Regulasi', deskripsi: 'Perubahan atas PP 22/2020 tentang penyelenggaraan jasa konstruksi. Mengatur persyaratan SKK, SBU, dan mekanisme pengawasan tenaga kerja konstruksi secara lebih detail.' },
  { singkatan: 'Permen PU 6/2021', kepanjangan: 'Peraturan Menteri PUPR Nomor 6 Tahun 2021', kategori: 'Regulasi', deskripsi: 'Mengatur standar kegiatan usaha dan standar produk usaha jasa konstruksi. Mengatur klasifikasi dan kualifikasi badan usaha serta persyaratan tenaga ahli.' },
  { singkatan: 'KM 713/2021', kepanjangan: 'Keputusan Menteri PUPR Nomor 713 Tahun 2021', kategori: 'Regulasi', deskripsi: 'Mengatur persyaratan pemenuhan kompetensi tenaga kerja konstruksi dan penetapan jabatan kerja yang wajib memiliki SKK untuk dapat bekerja di proyek konstruksi.' },
  { singkatan: 'SK DJBK 114', kepanjangan: 'Surat Keputusan Direktur Jenderal Bina Konstruksi Nomor 114', kategori: 'Regulasi', deskripsi: 'Menetapkan daftar jabatan kerja bidang jasa konstruksi beserta persyaratan SKK masing-masing. Referensi utama untuk mengetahui jabatan apa yang butuh SKK level berapa.' },
  { singkatan: 'Permen PU 9/2023', kepanjangan: 'Peraturan Menteri PUPR Nomor 9 Tahun 2023', kategori: 'Regulasi', deskripsi: 'Mengatur persyaratan teknis bangunan gedung dan memperkuat kewajiban penggunaan tenaga ahli bersertifikat SKK dalam proyek konstruksi bangunan gedung.' },
  { singkatan: 'SNI', kepanjangan: 'Standar Nasional Indonesia', kategori: 'Regulasi', deskripsi: 'Standar teknis resmi yang ditetapkan oleh BSN (Badan Standardisasi Nasional) sebagai acuan mutu dan keselamatan produk, material, dan proses konstruksi di Indonesia.' },
  { singkatan: 'PP 50/2012', kepanjangan: 'Peraturan Pemerintah Nomor 50 Tahun 2012', kategori: 'Regulasi', deskripsi: 'Mengatur penerapan Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMK3) di perusahaan. Wajib bagi perusahaan dengan 100+ karyawan atau proyek berisiko tinggi.' },

  // ── Konstruksi ────────────────────────────────────────────────────────────────
  { singkatan: 'RAB', kepanjangan: 'Rencana Anggaran Biaya', kategori: 'Konstruksi', deskripsi: 'Perhitungan estimasi biaya keseluruhan proyek konstruksi yang mencakup material, tenaga kerja, peralatan, overhead, keuntungan, dan pajak.' },
  { singkatan: 'RKS', kepanjangan: 'Rencana Kerja dan Syarat-syarat', kategori: 'Konstruksi', deskripsi: 'Dokumen kontrak yang mengatur persyaratan teknis dan administratif pelaksanaan pekerjaan konstruksi, termasuk spesifikasi material, metode kerja, dan standar mutu.' },
  { singkatan: 'WBS', kepanjangan: 'Work Breakdown Structure', kategori: 'Konstruksi', deskripsi: 'Dekomposisi hierarkis dari seluruh lingkup pekerjaan proyek menjadi komponen yang lebih kecil dan dapat dikelola, sebagai dasar perencanaan jadwal dan biaya.' },
  { singkatan: 'CPM', kepanjangan: 'Critical Path Method', kategori: 'Konstruksi', deskripsi: 'Metode perencanaan jadwal proyek yang mengidentifikasi jalur terpanjang (kritis) dari kegiatan-kegiatan yang menentukan durasi total proyek. Digunakan bersama network diagram.' },
  { singkatan: 'EVM', kepanjangan: 'Earned Value Management', kategori: 'Konstruksi', deskripsi: 'Metode pengendalian proyek yang mengintegrasikan scope, jadwal, dan biaya untuk mengukur kinerja dan kemajuan proyek secara objektif. Menggunakan indikator SPI dan CPI.' },
  { singkatan: 'SPI', kepanjangan: 'Schedule Performance Index', kategori: 'Konstruksi', deskripsi: 'Indikator EVM yang mengukur efisiensi jadwal proyek. SPI > 1 berarti proyek lebih cepat dari rencana, SPI < 1 berarti proyek terlambat.' },
  { singkatan: 'CPI', kepanjangan: 'Cost Performance Index', kategori: 'Konstruksi', deskripsi: 'Indikator EVM yang mengukur efisiensi penggunaan biaya proyek. CPI > 1 berarti proyek di bawah anggaran, CPI < 1 berarti melebihi anggaran.' },
  { singkatan: 'BOQ', kepanjangan: 'Bill of Quantities', kategori: 'Konstruksi', deskripsi: 'Daftar rincian volume pekerjaan yang digunakan sebagai dasar penawaran harga oleh kontraktor dalam proses tender. Disusun oleh QS atau perencana.' },
  { singkatan: 'CBR', kepanjangan: 'California Bearing Ratio', kategori: 'Konstruksi', deskripsi: 'Parameter kekuatan tanah dasar yang digunakan dalam perencanaan perkerasan jalan. Semakin tinggi nilai CBR, semakin kuat tanah dan semakin tipis tebal perkerasan yang diperlukan.' },
  { singkatan: 'SPT', kepanjangan: 'Standard Penetration Test', kategori: 'Konstruksi', deskripsi: 'Uji lapangan untuk menentukan kekuatan dan kepadatan tanah di kedalaman tertentu menggunakan bor dan pipa SPT. Hasilnya digunakan dalam perencanaan pondasi.' },
  { singkatan: 'K3', kepanjangan: 'Keselamatan dan Kesehatan Kerja', kategori: 'Konstruksi', deskripsi: 'Aspek perlindungan keselamatan, kesehatan, dan kesejahteraan tenaga kerja di tempat kerja konstruksi. Diatur dalam UU 1/1970 dan berbagai peraturan turunannya.' },
  { singkatan: 'APD', kepanjangan: 'Alat Pelindung Diri', kategori: 'Konstruksi', deskripsi: 'Peralatan wajib yang digunakan pekerja konstruksi untuk melindungi diri dari bahaya kerja: helm, rompi, sepatu safety, harness, masker, kacamata pelindung, dll.' },
  { singkatan: 'LTI', kepanjangan: 'Lost Time Injury', kategori: 'Konstruksi', deskripsi: 'Kecelakaan kerja yang mengakibatkan korban tidak dapat bekerja selama 1 hari atau lebih setelah kejadian. Menjadi indikator utama keselamatan kerja proyek.' },
  { singkatan: 'HSPK', kepanjangan: 'Harga Satuan Pekerjaan Konstruksi', kategori: 'Konstruksi', deskripsi: 'Harga untuk menyelesaikan satu satuan pekerjaan konstruksi tertentu, termasuk upah tenaga kerja, bahan, dan peralatan. Ditetapkan oleh pemerintah daerah setiap tahun.' },

  // ── Organisasi ────────────────────────────────────────────────────────────────
  { singkatan: 'BNSP', kepanjangan: 'Badan Nasional Sertifikasi Profesi', kategori: 'Organisasi', deskripsi: 'Lembaga independen yang bertanggung jawab mengembangkan dan melaksanakan sistem sertifikasi kompetensi kerja nasional. BNSP memberikan lisensi kepada LSP untuk menyelenggarakan sertifikasi.' },
  { singkatan: 'LSP', kepanjangan: 'Lembaga Sertifikasi Profesi', kategori: 'Organisasi', deskripsi: 'Lembaga yang mendapat lisensi dari BNSP untuk menyelenggarakan sertifikasi kompetensi di bidang tertentu. LSP P1 dibentuk industri, P2 pemerintah, P3 asosiasi profesi.' },
  { singkatan: 'TUK', kepanjangan: 'Tempat Uji Kompetensi', kategori: 'Organisasi', deskripsi: 'Fasilitas yang ditetapkan LSP sebagai tempat pelaksanaan uji kompetensi. TUK bisa bersifat sewaktu (temporer) atau tetap (permanen) dan harus memenuhi standar yang ditetapkan BNSP.' },
  { singkatan: 'BUJK', kepanjangan: 'Badan Usaha Jasa Konstruksi', kategori: 'Organisasi', deskripsi: 'Badan usaha yang bergerak di sektor jasa konstruksi, meliputi perencana, pelaksana, dan pengawas konstruksi. Wajib memiliki SBU dan mempekerjakan tenaga ahli bersertifikat SKK.' },
  { singkatan: 'SBU', kepanjangan: 'Sertifikat Badan Usaha', kategori: 'Organisasi', deskripsi: 'Sertifikat yang diterbitkan LPJK kepada BUJK sebagai bukti kemampuan usaha di bidang jasa konstruksi. Persyaratannya mencakup kepemilikan tenaga ahli bersertifikat SKK.' },
  { singkatan: 'LPJK', kepanjangan: 'Lembaga Pengembangan Jasa Konstruksi', kategori: 'Organisasi', deskripsi: 'Lembaga yang dibentuk Kementerian PUPR untuk menyelenggarakan pengembangan dan registrasi BUJK serta tenaga kerja konstruksi. LPJK menerbitkan SBU dan mengelola database SKK.' },
  { singkatan: 'DJBK', kepanjangan: 'Direktorat Jenderal Bina Konstruksi', kategori: 'Organisasi', deskripsi: 'Unit eselon I di Kementerian PUPR yang membidangi pembinaan dan pengembangan jasa konstruksi, termasuk pengawasan sertifikasi kompetensi dan kapasitas tenaga konstruksi.' },
  { singkatan: 'IUJK', kepanjangan: 'Izin Usaha Jasa Konstruksi', kategori: 'Organisasi', deskripsi: 'Izin yang harus dimiliki BUJK untuk dapat menjalankan kegiatan usaha jasa konstruksi. Diterbitkan oleh pemerintah daerah setelah persyaratan administrasi dan teknis terpenuhi.' },
  { singkatan: 'BSN', kepanjangan: 'Badan Standardisasi Nasional', kategori: 'Organisasi', deskripsi: 'Lembaga pemerintah yang menetapkan, menerapkan, dan membina standardisasi teknis di Indonesia, termasuk menetapkan SNI yang digunakan sebagai acuan teknis konstruksi.' },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const kategoriList: Kategori[] = ['Sertifikasi', 'Dokumen & Form', 'Regulasi', 'Konstruksi', 'Organisasi'];

const kategoriColor: Record<Kategori, string> = {
  'Sertifikasi':   'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Dokumen & Form':'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Regulasi':      'bg-red-500/20 text-red-400 border-red-500/30',
  'Konstruksi':    'bg-green-500/20 text-green-400 border-green-500/30',
  'Organisasi':    'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const kategoriIcon: Record<Kategori, string> = {
  'Sertifikasi':   '🏅',
  'Dokumen & Form':'📄',
  'Regulasi':      '⚖️',
  'Konstruksi':    '🏗️',
  'Organisasi':    '🏢',
};

const STORAGE_KEY = 'siapskk_glosarium_recent';

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function GlosariumPage() {
  const [query, setQuery] = useState('');
  const [aktifKat, setAktifKat] = useState<Kategori | 'Semua'>('Semua');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setRecent(JSON.parse(s));
    } catch {}
  }, []);

  const addRecent = (singkatan: string) => {
    const next = [singkatan, ...recent.filter(r => r !== singkatan)].slice(0, 5);
    setRecent(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return terms.filter(t => {
      const matchKat = aktifKat === 'Semua' || t.kategori === aktifKat;
      if (!matchKat) return false;
      if (!q) return true;
      return (
        t.singkatan.toLowerCase().includes(q) ||
        t.kepanjangan.toLowerCase().includes(q) ||
        t.deskripsi.toLowerCase().includes(q)
      );
    });
  }, [query, aktifKat]);

  const grouped = useMemo(() => {
    const map: Partial<Record<Kategori, Term[]>> = {};
    for (const t of filtered) {
      if (!map[t.kategori]) map[t.kategori] = [];
      map[t.kategori]!.push(t);
    }
    return map;
  }, [filtered]);

  const toggle = (singkatan: string) => {
    if (expanded !== singkatan) addRecent(singkatan);
    setExpanded(expanded === singkatan ? null : singkatan);
  };

  const recentTerms = recent.map(r => terms.find(t => t.singkatan === r)).filter(Boolean) as Term[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium mb-4">
            📖 {terms.length} Istilah & Singkatan
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Glosarium <span className="text-cyan-400">SKK & Konstruksi</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Kamus lengkap singkatan dan istilah teknis di bidang sertifikasi kompetensi konstruksi Indonesia. Dari SKKNI hingga EVM, semuanya ada di sini.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setAktifKat('Semua'); }}
            placeholder="Cari singkatan atau istilah... (mis: SKK, BNSP, LSP, RAB)"
            className="w-full pl-11 pr-4 py-3.5 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-lg">✕</button>
          )}
        </div>

        {/* Category tabs */}
        {!query && (
          <div className="flex gap-2 flex-wrap">
            {(['Semua', ...kategoriList] as (Kategori | 'Semua')[]).map(k => (
              <button
                key={k}
                onClick={() => setAktifKat(k)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  aktifKat === k
                    ? k === 'Semua'
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : `${kategoriColor[k as Kategori]} font-semibold`
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {k !== 'Semua' && <span className="mr-1">{kategoriIcon[k as Kategori]}</span>}
                {k}
                {k !== 'Semua' && (
                  <span className="ml-1 text-xs opacity-70">({terms.filter(t => t.kategori === k).length})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Recently viewed */}
        {!query && recentTerms.length > 0 && aktifKat === 'Semua' && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Terakhir Dilihat</p>
            <div className="flex flex-wrap gap-2">
              {recentTerms.map(t => (
                <button
                  key={t.singkatan}
                  onClick={() => { toggle(t.singkatan); setExpanded(t.singkatan); }}
                  className="px-3 py-1 bg-slate-700/60 rounded-full text-sm text-slate-300 hover:text-white hover:bg-slate-600 transition-colors border border-slate-600"
                >
                  {t.singkatan}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results count when searching */}
        {query && (
          <p className="text-slate-400 text-sm">
            Ditemukan <span className="text-cyan-400 font-semibold">{filtered.length}</span> istilah untuk &ldquo;<span className="text-white">{query}</span>&rdquo;
          </p>
        )}

        {/* Term list — grouped by category */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-4xl mb-3">🔍</div>
            <p>Tidak ada istilah yang cocok dengan &ldquo;{query}&rdquo;</p>
          </div>
        ) : query ? (
          // Flat list when searching
          <div className="space-y-2">
            {filtered.map(t => <TermCard key={t.singkatan} term={t} expanded={expanded === t.singkatan} onToggle={() => toggle(t.singkatan)} showBadge />)}
          </div>
        ) : (
          // Grouped by category
          <div className="space-y-8">
            {kategoriList.map(kat => {
              const items = grouped[kat];
              if (!items || items.length === 0) return null;
              return (
                <div key={kat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span>{kategoriIcon[kat]}</span>
                    <h2 className="text-white font-semibold">{kat}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${kategoriColor[kat]}`}>{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(t => <TermCard key={t.singkatan} term={t} expanded={expanded === t.singkatan} onToggle={() => toggle(t.singkatan)} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/prosedur" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-cyan-500/40 transition-colors">
            <span className="text-xl">📋</span>
            <div>
              <p className="text-white text-sm font-medium">Prosedur UJK</p>
              <p className="text-slate-500 text-xs">Alur sertifikasi SKK</p>
            </div>
          </Link>
          <Link href="/sertifikasi" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-cyan-500/40 transition-colors">
            <span className="text-xl">🏅</span>
            <div>
              <p className="text-white text-sm font-medium">Cari Jabatan SKK</p>
              <p className="text-slate-500 text-xs">67+ jabatan dengan syarat</p>
            </div>
          </Link>
          <Link href="/skk-coach" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-cyan-500/40 transition-colors">
            <span className="text-xl">💬</span>
            <div>
              <p className="text-white text-sm font-medium">SKK Coach AI</p>
              <p className="text-slate-500 text-xs">Tanya apa saja tentang SKK</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── TermCard ─────────────────────────────────────────────────────────────────

function TermCard({ term, expanded, onToggle, showBadge }: {
  term: Term; expanded: boolean; onToggle: () => void; showBadge?: boolean;
}) {
  const color = kategoriColor[term.kategori];
  return (
    <button
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        expanded
          ? 'bg-slate-700/60 border-cyan-500/40'
          : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600 hover:bg-slate-800/60'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-base">{term.singkatan}</span>
            {showBadge && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>
                {kategoriIcon[term.kategori]} {term.kategori}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-0.5">{term.kepanjangan}</p>
          {expanded && (
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">{term.deskripsi}</p>
          )}
        </div>
        <span className="text-slate-500 text-sm flex-shrink-0 mt-0.5">{expanded ? '▲' : '▼'}</span>
      </div>
    </button>
  );
}
