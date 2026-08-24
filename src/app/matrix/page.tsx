'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getJabatanById } from '@/lib/skkData';
import { getSavedJabatanTarget, saveJabatanTarget } from '@/lib/jabatanPreference';

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

// ── SKKNI Unit Kompetensi data — Bidang Sipil & Manajemen Pelaksanaan ────────
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

const jabatanSKKData: JabatanSKK[] = [
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

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">🔗 Matrix SKK</h1>
          <p className="text-lg text-slate-600">
            Visualisasi subklasifikasi & unit kompetensi per jabatan SKK
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl shadow p-2 w-fit">
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
          <div className="space-y-6">

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
                      {displayedUnits.map((u, i) => (
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
                          </div>
                        </div>
                      ))}
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
        )}
      </div>
    </div>
  );
}
