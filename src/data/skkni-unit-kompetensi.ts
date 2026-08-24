/**
 * SKKNI unit kompetensi data for the civil engineering and construction
 * management fields.
 *
 * Source document: SKKNI Bidang Sipil dan Manajemen Pelaksanaan (LPJK /
 * Kementerian PUPR reference used by SIAP SKK).
 * Last reviewed: 24 August 2026. Verify against the latest official
 * publication before updating this dataset.
 */
export interface UnitKompetensi {
  kode: string;
  judul: string;
  kelompok: 'Inti' | 'Pilihan' | 'Umum';
}

export interface JabatanSKK {
  id: string;
  nama: string;
  kualifikasi: string;
  jenjang: number;   // KKNI level 4–9
  bidang: string;
  unitKompetensi: UnitKompetensi[];
}

export const jabatanSKKData: JabatanSKK[] = [
  // ── 1. Pelaksana Lapangan Pekerjaan Jalan ──────────────────────────────────
  {
    id: 'SKK-001',
    nama: 'Pelaksana Lapangan Pekerjaan Jalan',
    kualifikasi: 'Teknisi/Analis',
    jenjang: 5,
    bidang: 'Sipil',
    unitKompetensi: [
      { kode: 'F.45 JKJ 01 001 1', judul: 'Menerapkan Sistem Manajemen Keselamatan, Kesehatan Kerja dan Lingkungan (SMK3-L)', kelompok: 'Umum' },
      { kode: 'F.45 JKJ 01 002 1', judul: 'Melakukan Komunikasi dan Kerjasama di Tempat Kerja', kelompok: 'Umum' },
      { kode: 'F.45 JKJ 01 003 1', judul: 'Membaca Gambar Teknik dan Spesifikasi Teknis', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 01 004 1', judul: 'Melaksanakan Pekerjaan Persiapan', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 01 005 1', judul: 'Melaksanakan Pekerjaan Tanah dan Subgrade', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 01 006 1', judul: 'Melaksanakan Pekerjaan Lapis Pondasi Agregat', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 01 007 1', judul: 'Melaksanakan Pekerjaan Perkerasan Aspal', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 01 008 1', judul: 'Melaksanakan Pekerjaan Drainase', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 01 009 1', judul: 'Melaksanakan Pekerjaan Beton Struktur', kelompok: 'Pilihan' },
      { kode: 'F.45 JKJ 01 010 1', judul: 'Membuat Laporan Pelaksanaan Pekerjaan', kelompok: 'Umum' },
    ],
  },

  // ── 2. Pelaksana Lapangan Pekerjaan Jembatan ──────────────────────────────
  {
    id: 'SKK-002',
    nama: 'Pelaksana Lapangan Pekerjaan Jembatan',
    kualifikasi: 'Teknisi/Analis',
    jenjang: 5,
    bidang: 'Sipil',
    unitKompetensi: [
      { kode: 'F.45 JKB 01 001 1', judul: 'Menerapkan Sistem Manajemen Keselamatan, Kesehatan Kerja dan Lingkungan (SMK3-L)', kelompok: 'Umum' },
      { kode: 'F.45 JKB 01 002 1', judul: 'Melakukan Komunikasi dan Kerjasama di Tempat Kerja', kelompok: 'Umum' },
      { kode: 'F.45 JKB 01 003 1', judul: 'Membaca Gambar Teknik Jembatan dan Spesifikasi Teknis', kelompok: 'Inti' },
      { kode: 'F.45 JKB 01 004 1', judul: 'Melaksanakan Pekerjaan Pondasi Jembatan', kelompok: 'Inti' },
      { kode: 'F.45 JKB 01 005 1', judul: 'Melaksanakan Pekerjaan Beton Bertulang untuk Substruktur', kelompok: 'Inti' },
      { kode: 'F.45 JKB 01 006 1', judul: 'Melaksanakan Pekerjaan Beton Bertulang untuk Superstruktur', kelompok: 'Inti' },
      { kode: 'F.45 JKB 01 007 1', judul: 'Melaksanakan Pekerjaan Struktur Baja Jembatan', kelompok: 'Pilihan' },
      { kode: 'F.45 JKB 01 008 1', judul: 'Melaksanakan Pekerjaan Bangunan Pelengkap Jembatan', kelompok: 'Inti' },
      { kode: 'F.45 JKB 01 009 1', judul: 'Membuat Laporan Pelaksanaan Pekerjaan Jembatan', kelompok: 'Umum' },
    ],
  },

  // ── 3. Pelaksana Lapangan Pekerjaan Gedung ────────────────────────────────
  {
    id: 'SKK-003',
    nama: 'Pelaksana Lapangan Pekerjaan Gedung',
    kualifikasi: 'Teknisi/Analis',
    jenjang: 5,
    bidang: 'Sipil',
    unitKompetensi: [
      { kode: 'F.45 GDG 01 001 1', judul: 'Menerapkan Sistem Manajemen Keselamatan, Kesehatan Kerja dan Lingkungan (SMK3-L)', kelompok: 'Umum' },
      { kode: 'F.45 GDG 01 002 1', judul: 'Melakukan Komunikasi dan Kerjasama di Tempat Kerja', kelompok: 'Umum' },
      { kode: 'F.45 GDG 01 003 1', judul: 'Membaca Gambar Teknik Gedung dan Spesifikasi Teknis', kelompok: 'Inti' },
      { kode: 'F.45 GDG 01 004 1', judul: 'Melaksanakan Pekerjaan Persiapan dan Pondasi', kelompok: 'Inti' },
      { kode: 'F.45 GDG 01 005 1', judul: 'Melaksanakan Pekerjaan Beton Bertulang Struktur Gedung', kelompok: 'Inti' },
      { kode: 'F.45 GDG 01 006 1', judul: 'Melaksanakan Pekerjaan Pasangan Dinding dan Plesteran', kelompok: 'Inti' },
      { kode: 'F.45 GDG 01 007 1', judul: 'Melaksanakan Pekerjaan Lantai dan Keramik', kelompok: 'Inti' },
      { kode: 'F.45 GDG 01 008 1', judul: 'Melaksanakan Pekerjaan Atap dan Penutup Atap', kelompok: 'Inti' },
      { kode: 'F.45 GDG 01 009 1', judul: 'Melaksanakan Pekerjaan Kusen, Pintu, dan Jendela', kelompok: 'Pilihan' },
      { kode: 'F.45 GDG 01 010 1', judul: 'Membuat Laporan Pelaksanaan Pekerjaan', kelompok: 'Umum' },
    ],
  },

  // ── 4. Ahli Muda Teknik Jalan ─────────────────────────────────────────────
  {
    id: 'SKK-004',
    nama: 'Ahli Muda Teknik Jalan',
    kualifikasi: 'Ahli',
    jenjang: 7,
    bidang: 'Sipil',
    unitKompetensi: [
      { kode: 'F.45 JKJ 02 001 1', judul: 'Menerapkan Sistem Manajemen Keselamatan, Kesehatan Kerja dan Lingkungan (SMK3-L) pada Pekerjaan Teknik Jalan', kelompok: 'Umum' },
      { kode: 'F.45 JKJ 02 002 1', judul: 'Melakukan Komunikasi dan Koordinasi Teknis', kelompok: 'Umum' },
      { kode: 'F.45 JKJ 02 003 1', judul: 'Menerapkan Prinsip-prinsip Rekayasa Jalan Raya', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 02 004 1', judul: 'Melakukan Survei dan Investigasi Jalan', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 02 005 1', judul: 'Membuat Desain Geometrik Jalan', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 02 006 1', judul: 'Membuat Desain Perkerasan Jalan', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 02 007 1', judul: 'Membuat Desain Drainase Jalan', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 02 008 1', judul: 'Melakukan Pengawasan Teknis Pelaksanaan Konstruksi Jalan', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 02 009 1', judul: 'Melakukan Pengendalian Mutu Material dan Pekerjaan Jalan', kelompok: 'Inti' },
      { kode: 'F.45 JKJ 02 010 1', judul: 'Menyusun Laporan Teknis Pekerjaan Jalan', kelompok: 'Umum' },
      { kode: 'F.45 JKJ 02 011 1', judul: 'Melakukan Penilaian Kondisi dan Kebutuhan Pemeliharaan Jalan', kelompok: 'Pilihan' },
    ],
  },

  // ── 5. Ahli Muda Teknik Jembatan ──────────────────────────────────────────
  {
    id: 'SKK-005',
    nama: 'Ahli Muda Teknik Jembatan',
    kualifikasi: 'Ahli',
    jenjang: 7,
    bidang: 'Sipil',
    unitKompetensi: [
      { kode: 'F.45 JKB 02 001 1', judul: 'Menerapkan Sistem Manajemen Keselamatan, Kesehatan Kerja dan Lingkungan (SMK3-L) pada Pekerjaan Jembatan', kelompok: 'Umum' },
      { kode: 'F.45 JKB 02 002 1', judul: 'Melakukan Komunikasi dan Koordinasi Teknis Pekerjaan Jembatan', kelompok: 'Umum' },
      { kode: 'F.45 JKB 02 003 1', judul: 'Menerapkan Prinsip-prinsip Rekayasa Struktur Jembatan', kelompok: 'Inti' },
      { kode: 'F.45 JKB 02 004 1', judul: 'Melakukan Investigasi Lapangan dan Tanah untuk Jembatan', kelompok: 'Inti' },
      { kode: 'F.45 JKB 02 005 1', judul: 'Membuat Desain Pondasi Jembatan', kelompok: 'Inti' },
      { kode: 'F.45 JKB 02 006 1', judul: 'Membuat Desain Substruktur Jembatan', kelompok: 'Inti' },
      { kode: 'F.45 JKB 02 007 1', judul: 'Membuat Desain Superstruktur Jembatan Beton', kelompok: 'Inti' },
      { kode: 'F.45 JKB 02 008 1', judul: 'Membuat Desain Superstruktur Jembatan Baja', kelompok: 'Pilihan' },
      { kode: 'F.45 JKB 02 009 1', judul: 'Melakukan Pengawasan Teknis Pelaksanaan Konstruksi Jembatan', kelompok: 'Inti' },
      { kode: 'F.45 JKB 02 010 1', judul: 'Melakukan Inspeksi dan Penilaian Kondisi Jembatan', kelompok: 'Pilihan' },
      { kode: 'F.45 JKB 02 011 1', judul: 'Menyusun Laporan Teknis Pekerjaan Jembatan', kelompok: 'Umum' },
    ],
  },

  // ── 6. Ahli Muda Teknik Bangunan Gedung ──────────────────────────────────
  {
    id: 'SKK-006',
    nama: 'Ahli Muda Teknik Bangunan Gedung',
    kualifikasi: 'Ahli',
    jenjang: 7,
    bidang: 'Sipil',
    unitKompetensi: [
      { kode: 'F.45 GDG 02 001 1', judul: 'Menerapkan Sistem Manajemen Keselamatan, Kesehatan Kerja dan Lingkungan (SMK3-L)', kelompok: 'Umum' },
      { kode: 'F.45 GDG 02 002 1', judul: 'Melakukan Komunikasi dan Koordinasi Teknis Bangunan Gedung', kelompok: 'Umum' },
      { kode: 'F.45 GDG 02 003 1', judul: 'Menerapkan Peraturan dan Standar Teknis Bangunan Gedung', kelompok: 'Umum' },
      { kode: 'F.45 GDG 02 004 1', judul: 'Merencanakan Struktur Bawah Bangunan Gedung', kelompok: 'Inti' },
      { kode: 'F.45 GDG 02 005 1', judul: 'Merencanakan Struktur Atas Bangunan Gedung Beton Bertulang', kelompok: 'Inti' },
      { kode: 'F.45 GDG 02 006 1', judul: 'Merencanakan Struktur Atas Bangunan Gedung Baja', kelompok: 'Pilihan' },
      { kode: 'F.45 GDG 02 007 1', judul: 'Melakukan Pengawasan Teknis Pelaksanaan Konstruksi Gedung', kelompok: 'Inti' },
      { kode: 'F.45 GDG 02 008 1', judul: 'Melakukan Pengendalian Mutu Bahan dan Pekerjaan Gedung', kelompok: 'Inti' },
      { kode: 'F.45 GDG 02 009 1', judul: 'Melakukan Pemeriksaan Kelaikan Bangunan Gedung', kelompok: 'Pilihan' },
      { kode: 'F.45 GDG 02 010 1', judul: 'Menyusun Laporan Teknis Perencanaan/Pengawasan Gedung', kelompok: 'Umum' },
    ],
  },

  // ── 7. Ahli Manajemen Proyek Konstruksi Muda ─────────────────────────────
  {
    id: 'SKK-007',
    nama: 'Ahli Manajemen Proyek Konstruksi Muda',
    kualifikasi: 'Ahli',
    jenjang: 7,
    bidang: 'Manajemen Pelaksanaan',
    unitKompetensi: [
      { kode: 'M.71 MPK 01 001 1', judul: 'Menerapkan Sistem Manajemen Keselamatan, Kesehatan Kerja dan Lingkungan (SMK3-L)', kelompok: 'Umum' },
      { kode: 'M.71 MPK 01 002 1', judul: 'Melakukan Komunikasi dan Koordinasi Proyek', kelompok: 'Umum' },
      { kode: 'M.71 MPK 01 003 1', judul: 'Menerapkan Manajemen Ruang Lingkup Proyek', kelompok: 'Inti' },
      { kode: 'M.71 MPK 01 004 1', judul: 'Menerapkan Manajemen Waktu dan Penjadwalan Proyek', kelompok: 'Inti' },
      { kode: 'M.71 MPK 01 005 1', judul: 'Menerapkan Manajemen Biaya Proyek', kelompok: 'Inti' },
      { kode: 'M.71 MPK 01 006 1', judul: 'Menerapkan Manajemen Mutu Proyek', kelompok: 'Inti' },
      { kode: 'M.71 MPK 01 007 1', judul: 'Menerapkan Manajemen Risiko Proyek', kelompok: 'Inti' },
      { kode: 'M.71 MPK 01 008 1', judul: 'Menerapkan Manajemen Pengadaan Proyek', kelompok: 'Inti' },
      { kode: 'M.71 MPK 01 009 1', judul: 'Menerapkan Manajemen Komunikasi Proyek', kelompok: 'Pilihan' },
      { kode: 'M.71 MPK 01 010 1', judul: 'Membuat Laporan Kinerja dan Kemajuan Proyek', kelompok: 'Umum' },
    ],
  },

  // ── 8. Ahli Manajemen Proyek Konstruksi Madya ────────────────────────────
  {
    id: 'SKK-008',
    nama: 'Ahli Manajemen Proyek Konstruksi Madya',
    kualifikasi: 'Ahli',
    jenjang: 8,
    bidang: 'Manajemen Pelaksanaan',
    unitKompetensi: [
      { kode: 'M.71 MPK 02 001 1', judul: 'Memimpin Penerapan Sistem Manajemen K3 Konstruksi', kelompok: 'Umum' },
      { kode: 'M.71 MPK 02 002 1', judul: 'Memimpin Tim dan Mengelola Hubungan Pemangku Kepentingan', kelompok: 'Umum' },
      { kode: 'M.71 MPK 02 003 1', judul: 'Mengintegrasikan Semua Area Pengetahuan Manajemen Proyek', kelompok: 'Inti' },
      { kode: 'M.71 MPK 02 004 1', judul: 'Mengelola Kontrak dan Klaim Konstruksi', kelompok: 'Inti' },
      { kode: 'M.71 MPK 02 005 1', judul: 'Mengelola Rantai Pasok dan Subkontraktor', kelompok: 'Inti' },
      { kode: 'M.71 MPK 02 006 1', judul: 'Mengendalikan Biaya dan Nilai Hasil Proyek', kelompok: 'Inti' },
      { kode: 'M.71 MPK 02 007 1', judul: 'Mengelola Perubahan Proyek dan Klaim', kelompok: 'Inti' },
      { kode: 'M.71 MPK 02 008 1', judul: 'Melakukan Manajemen Nilai (Value Engineering)', kelompok: 'Pilihan' },
      { kode: 'M.71 MPK 02 009 1', judul: 'Menyusun Program Mutu dan Rencana Kerja Proyek Kompleks', kelompok: 'Inti' },
      { kode: 'M.71 MPK 02 010 1', judul: 'Membuat Laporan Akhir dan Serah Terima Proyek', kelompok: 'Umum' },
    ],
  },

  // ── 9. Ahli K3 Konstruksi Muda ────────────────────────────────────────────
  {
    id: 'SKK-009',
    nama: 'Ahli K3 Konstruksi Muda',
    kualifikasi: 'Ahli',
    jenjang: 7,
    bidang: 'Manajemen Pelaksanaan',
    unitKompetensi: [
      { kode: 'M.71 K3K 01 001 1', judul: 'Menerapkan Peraturan Perundang-undangan K3 Konstruksi', kelompok: 'Umum' },
      { kode: 'M.71 K3K 01 002 1', judul: 'Melakukan Identifikasi Bahaya dan Penilaian Risiko K3', kelompok: 'Inti' },
      { kode: 'M.71 K3K 01 003 1', judul: 'Menyusun Rencana K3 Kontrak (RK3K)', kelompok: 'Inti' },
      { kode: 'M.71 K3K 01 004 1', judul: 'Melaksanakan Program K3 di Lapangan', kelompok: 'Inti' },
      { kode: 'M.71 K3K 01 005 1', judul: 'Melakukan Pemeriksaan dan Audit K3 Konstruksi', kelompok: 'Inti' },
      { kode: 'M.71 K3K 01 006 1', judul: 'Melakukan Penanganan Kecelakaan Kerja dan Penyakit Akibat Kerja', kelompok: 'Inti' },
      { kode: 'M.71 K3K 01 007 1', judul: 'Mengelola Lingkungan Kerja dan Kebersihan Lokasi', kelompok: 'Pilihan' },
      { kode: 'M.71 K3K 01 008 1', judul: 'Membuat Laporan K3 Konstruksi', kelompok: 'Umum' },
    ],
  },

  // ── 10. Ahli Supervisi Pekerjaan Jalan ────────────────────────────────────
  {
    id: 'SKK-010',
    nama: 'Ahli Supervisi Pekerjaan Jalan',
    kualifikasi: 'Ahli',
    jenjang: 7,
    bidang: 'Sipil',
    unitKompetensi: [
      { kode: 'F.45 SPV 01 001 1', judul: 'Menerapkan Sistem Manajemen K3-L pada Pengawasan Jalan', kelompok: 'Umum' },
      { kode: 'F.45 SPV 01 002 1', judul: 'Melakukan Koordinasi dan Komunikasi Pengawasan', kelompok: 'Umum' },
      { kode: 'F.45 SPV 01 003 1', judul: 'Memeriksa Kesesuaian Pelaksanaan dengan Dokumen Kontrak', kelompok: 'Inti' },
      { kode: 'F.45 SPV 01 004 1', judul: 'Melakukan Pengujian dan Pengendalian Mutu Material Jalan', kelompok: 'Inti' },
      { kode: 'F.45 SPV 01 005 1', judul: 'Melakukan Pengawasan Pekerjaan Tanah dan Drainase', kelompok: 'Inti' },
      { kode: 'F.45 SPV 01 006 1', judul: 'Melakukan Pengawasan Pekerjaan Lapis Pondasi dan Perkerasan', kelompok: 'Inti' },
      { kode: 'F.45 SPV 01 007 1', judul: 'Melakukan Pengawasan Pekerjaan Pelengkap Jalan', kelompok: 'Inti' },
      { kode: 'F.45 SPV 01 008 1', judul: 'Melakukan Pengendalian Kemajuan dan Biaya Pekerjaan', kelompok: 'Pilihan' },
      { kode: 'F.45 SPV 01 009 1', judul: 'Menyusun Laporan Pengawasan Pekerjaan Jalan', kelompok: 'Umum' },
    ],
  },

  // ── 11. Estimator Biaya Konstruksi ────────────────────────────────────────
  {
    id: 'SKK-011',
    nama: 'Estimator Biaya Konstruksi',
    kualifikasi: 'Teknisi/Analis',
    jenjang: 6,
    bidang: 'Manajemen Pelaksanaan',
    unitKompetensi: [
      { kode: 'M.71 EBC 01 001 1', judul: 'Menerapkan Prinsip-prinsip K3 dalam Estimasi Biaya', kelompok: 'Umum' },
      { kode: 'M.71 EBC 01 002 1', judul: 'Membaca dan Menafsirkan Dokumen Kontrak', kelompok: 'Umum' },
      { kode: 'M.71 EBC 01 003 1', judul: 'Menghitung Volume Pekerjaan (Quantity Take-off)', kelompok: 'Inti' },
      { kode: 'M.71 EBC 01 004 1', judul: 'Menyusun Analisa Harga Satuan Pekerjaan', kelompok: 'Inti' },
      { kode: 'M.71 EBC 01 005 1', judul: 'Menyusun Rencana Anggaran Biaya (RAB)', kelompok: 'Inti' },
      { kode: 'M.71 EBC 01 006 1', judul: 'Menyusun Harga Penawaran Tender', kelompok: 'Inti' },
      { kode: 'M.71 EBC 01 007 1', judul: 'Melakukan Evaluasi dan Pengendalian Biaya Pelaksanaan', kelompok: 'Pilihan' },
      { kode: 'M.71 EBC 01 008 1', judul: 'Membuat Laporan Biaya Proyek', kelompok: 'Umum' },
    ],
  },

  // ── 12. Ahli Quantity Surveyor ────────────────────────────────────────────
  {
    id: 'SKK-012',
    nama: 'Ahli Quantity Surveyor',
    kualifikasi: 'Ahli',
    jenjang: 7,
    bidang: 'Manajemen Pelaksanaan',
    unitKompetensi: [
      { kode: 'M.71 QSV 01 001 1', judul: 'Menerapkan Prinsip-prinsip K3 dan Etika Profesi', kelompok: 'Umum' },
      { kode: 'M.71 QSV 01 002 1', judul: 'Melakukan Estimasi Biaya Pra-rancangan', kelompok: 'Inti' },
      { kode: 'M.71 QSV 01 003 1', judul: 'Menyusun Bill of Quantities (BoQ)', kelompok: 'Inti' },
      { kode: 'M.71 QSV 01 004 1', judul: 'Melakukan Analisis Penawaran Tender', kelompok: 'Inti' },
      { kode: 'M.71 QSV 01 005 1', judul: 'Mengelola Kontrak dan Administrasi Klaim', kelompok: 'Inti' },
      { kode: 'M.71 QSV 01 006 1', judul: 'Melakukan Pengendalian Biaya Pelaksanaan', kelompok: 'Inti' },
      { kode: 'M.71 QSV 01 007 1', judul: 'Menyusun Final Account dan Laporan Biaya Akhir Proyek', kelompok: 'Pilihan' },
      { kode: 'M.71 QSV 01 008 1', judul: 'Memberikan Saran Nilai dan Optimalisasi Biaya', kelompok: 'Umum' },
    ],
  },
];
