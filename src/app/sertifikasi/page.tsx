'use client';

import { useState } from 'react';

const jobPositions = [
  // === ORIGINAL POSITIONS ===
  { id: 'B001', name: 'Ahli Madya Teknik Bangunan Gedung', level: 'Ahli Madya', subklasifikasi: 'B', requirements: ['S1 Teknik Sipil/Arsitektur', 'Pengalaman 5 tahun', 'SKK Level 7'] },
  { id: 'B002', name: 'Ahli Teknik Bangunan Gedung', level: 'Ahli', subklasifikasi: 'B', requirements: ['S1 Teknik Sipil/Arsitektur', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'B003', name: 'Teknisi Teknik Bangunan Gedung', level: 'Teknisi', subklasifikasi: 'B', requirements: ['D3/SMK Teknik Bangunan', 'Pengalaman 2 tahun', 'SKK Level 3'] },
  { id: 'B004', name: 'Pelaksana Teknik Bangunan Gedung', level: 'Pelaksana', subklasifikasi: 'B', requirements: ['SMA/SMK', 'Pengalaman 1 tahun', 'SKK Level 2'] },
  { id: 'B005', name: 'Ahli Desain Interior', level: 'Ahli', subklasifikasi: 'B', requirements: ['S1 Desain Interior/Arsitektur', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'B006', name: 'Ahli Arsitektur Lanskap', level: 'Ahli', subklasifikasi: 'B', requirements: ['S1 Arsitektur/Landscape', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'B007', name: 'Manager Proyek Gedung', level: 'Manager', subklasifikasi: 'B', requirements: ['S1 Teknik/SIPIL', 'Pengalaman 7 tahun', 'SKK Level 8'] },
  { id: 'B008', name: 'Supervisor Konstruksi Gedung', level: 'Supervisor', subklasifikasi: 'B', requirements: ['S1/D4 Teknik', 'Pengalaman 5 tahun', 'SKK Level 5'] },
  { id: 'C001', name: 'Ahli Madya Teknik Sipil', level: 'Ahli Madya', subklasifikasi: 'C', requirements: ['S1 Teknik Sipil', 'Pengalaman 5 tahun', 'SKK Level 7'] },
  { id: 'C002', name: 'Ahli Teknik Sipil', level: 'Ahli', subklasifikasi: 'C', requirements: ['S1 Teknik Sipil', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'C003', name: 'Teknisi Teknik Sipil', level: 'Teknisi', subklasifikasi: 'C', requirements: ['D3/SMK Teknik Sipil', 'Pengalaman 2 tahun', 'SKK Level 3'] },
  { id: 'C004', name: 'Pelaksana Teknik Sipil', level: 'Pelaksana', subklasifikasi: 'C', requirements: ['SMA/SMK', 'Pengalaman 1 tahun', 'SKK Level 2'] },
  { id: 'C005', name: 'Ahli Geoteknik', level: 'Ahli', subklasifikasi: 'C', requirements: ['S1 Teknik Geologi/Sipil', 'Pengalaman 4 tahun', 'SKK Level 7'] },
  { id: 'C006', name: 'Ahli Hidrologi', level: 'Ahli', subklasifikasi: 'C', requirements: ['S1 Teknik Sipil/Hidrologi', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'C007', name: 'Ahli Struktur', level: 'Ahli', subklasifikasi: 'C', requirements: ['S1 Teknik Sipil', 'Pengalaman 5 tahun', 'SKK Level 7'] },
  { id: 'D001', name: 'Ahli Madya Teknik Mekanikal', level: 'Ahli Madya', subklasifikasi: 'D', requirements: ['S1 Teknik Mesin', 'Pengalaman 5 tahun', 'SKK Level 7'] },
  { id: 'D002', name: 'Ahli Teknik Mekanikal', level: 'Ahli', subklasifikasi: 'D', requirements: ['S1 Teknik Mesin', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'D003', name: 'Teknisi Teknik Mekanikal', level: 'Teknisi', subklasifikasi: 'D', requirements: ['D3/SMK Teknik Mesin', 'Pengalaman 2 tahun', 'SKK Level 3'] },
  { id: 'D004', name: 'Ahli Plumbing', level: 'Ahli', subklasifikasi: 'D', requirements: ['S1 Teknik Mesin/Sipil', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'D005', name: 'Ahli HVAC', level: 'Ahli', subklasifikasi: 'D', requirements: ['S1 Teknik Mesin', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'D006', name: 'Ahli Fire Protection', level: 'Ahli', subklasifikasi: 'D', requirements: ['S1 Teknik Mesin/Sipil', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'E001', name: 'Ahli Madya Teknik Elektrikal', level: 'Ahli Madya', subklasifikasi: 'E', requirements: ['S1 Teknik Elektro', 'Pengalaman 5 tahun', 'SKK Level 7'] },
  { id: 'E002', name: 'Ahli Teknik Elektrikal', level: 'Ahli', subklasifikasi: 'E', requirements: ['S1 Teknik Elektro', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'E003', name: 'Teknisi Teknik Elektrikal', level: 'Teknisi', subklasifikasi: 'E', requirements: ['D3/SMK Elektro', 'Pengalaman 2 tahun', 'SKK Level 3'] },
  { id: 'E004', name: 'Ahli Instalasi Listrik', level: 'Ahli', subklasifikasi: 'E', requirements: ['S1 Teknik Elektro', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'E005', name: 'Ahli Sistem Pendingin', level: 'Ahli', subklasifikasi: 'E', requirements: ['S1 Teknik Elektro/Mesin', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'F001', name: 'Ahli Madya Teknik Jalan', level: 'Ahli Madya', subklasifikasi: 'F', requirements: ['S1 Teknik Sipil', 'Pengalaman 5 tahun', 'SKK Level 7'] },
  { id: 'F002', name: 'Ahli Teknik Jalan', level: 'Ahli', subklasifikasi: 'F', requirements: ['S1 Teknik Sipil', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'F003', name: 'Teknisi Teknik Jalan', level: 'Teknisi', subklasifikasi: 'F', requirements: ['D3/SMK Teknik Sipil', 'Pengalaman 2 tahun', 'SKK Level 3'] },
  { id: 'F004', name: 'Ahli Perkerasan Jalan', level: 'Ahli', subklasifikasi: 'F', requirements: ['S1 Teknik Sipil', 'Pengalaman 4 tahun', 'SKK Level 7'] },
  { id: 'F005', name: 'Ahli Drainase Jalan', level: 'Ahli', subklasifikasi: 'F', requirements: ['S1 Teknik Sipil', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'G001', name: 'Ahli Madya Teknik Jembatan', level: 'Ahli Madya', subklasifikasi: 'G', requirements: ['S1 Teknik Sipil', 'Pengalaman 5 tahun', 'SKK Level 7'] },
  { id: 'G002', name: 'Ahli Teknik Jembatan', level: 'Ahli', subklasifikasi: 'G', requirements: ['S1 Teknik Sipil', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'G003', name: 'Teknisi Teknik Jembatan', level: 'Teknisi', subklasifikasi: 'G', requirements: ['D3/SMK Teknik Sipil', 'Pengalaman 2 tahun', 'SKK Level 3'] },
  { id: 'G004', name: 'Ahli Struktur Jembatan', level: 'Ahli', subklasifikasi: 'G', requirements: ['S1 Teknik Sipil', 'Pengalaman 5 tahun', 'SKK Level 7'] },
  { id: 'H001', name: 'Ahli Benda Cagar Budaya', level: 'Ahli', subklasifikasi: 'H', requirements: ['S1 Arsitektur/Sejarah', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'H002', name: 'Teknisi Benda Cagar Budaya', level: 'Teknisi', subklasifikasi: 'H', requirements: ['D3/SMK', 'Pengalaman 2 tahun', 'SKK Level 3'] },
  // === PERSONIL MANAGERIAL - PERMEN PU NO 7 TAHUN 2024 ===
  { id: 'MG001', name: 'Penanggung Jawab Badan Usaha (PJBU)', level: 'PJBU', subklasifikasi: 'MG', requirements: ['S1 Teknik', 'Pengalaman 10 tahun di konstruksi', 'SKK Level 9', 'Memiliki NUPTK'] },
  { id: 'MG002', name: 'Penanggung Jawab Teknik (PJT)', level: 'PJT', subklasifikasi: 'MG', requirements: ['S1 Teknik relevan', 'Pengalaman 7 tahun', 'SKK Level 8', 'Sertifikasi bidang keahlian'] },
  { id: 'MG003', name: 'Penanggung Jawab Bidang (PJKB)', level: 'PJKB', subklasifikasi: 'MG', requirements: ['S1 Teknik relevan', 'Pengalaman 5 tahun', 'SKK Level 7', 'Sertifikasi bidang'] },
  { id: 'MG004', name: 'Penanggung Jawab Subklasifikasi (PJSKBBU)', level: 'PJSKBBU', subklasifikasi: 'MG', requirements: ['S1/D4 Teknik', 'Pengalaman 3 tahun', 'SKK Level 6', 'Bidang subklasifikasi'] },
  { id: 'MG005', name: 'Manajer Keuangan', level: 'Manager', subklasifikasi: 'MG', requirements: ['S1 Akuntansi/Ekonomi', 'Pengalaman 5 tahun', 'SKK Level 7', 'Memahami keuangan konstruksi'] },
  { id: 'MG006', name: 'Manajer Pengadaan (Procurement)', level: 'Manager', subklasifikasi: 'MG', requirements: ['S1 Teknik/Ekonomi', 'Pengalaman 5 tahun', 'SKK Level 7', 'Sertifikasi pengadaan'] },
  { id: 'MG007', name: 'Manajer Rantai Pasok Material', level: 'Manager', subklasifikasi: 'MG', requirements: ['S1 Teknik/Logistik', 'Pengalaman 4 tahun', 'SKK Level 6', 'Memahami supply chain'] },
  { id: 'MG008', name: 'Petugas K3 Konstruksi', level: 'K3', subklasifikasi: 'MG', requirements: ['SMA/D3/S1', 'Pelatihan K3 konstruksi 40 jam', 'Pengalaman 2 tahun', 'Sertifikasi K3'] },
  { id: 'MG009', name: 'Ahli K3 Konstruksi', level: 'Ahli', subklasifikasi: 'MG', requirements: ['S1 Teknik', 'Pelatihan K3 80 jam', 'Pengalaman 5 tahun', 'SKK Level 7'] },
  { id: 'MG010', name: 'P2K3 (Panitia Pembina K3)', level: 'K3', subklasifikasi: 'MG', requirements: ['S1 Teknik', 'Pelatihan K3 40 jam', 'Pengalaman 3 tahun', 'Ditunjuk perusahaan'] },
  // === PENGADAAN DAN TENDER ===
  { id: 'PN001', name: 'Pejabat Pengadaan', level: 'Ahli', subklasifikasi: 'PN', requirements: ['S1 Teknik/Ekonomi', 'Sertifikasi pengadaan', 'Pengalaman 3 tahun', 'SKK Level 5'] },
  { id: 'PN002', name: 'Pokja Pemilihan', level: 'Ahli', subklasifikasi: 'PN', requirements: ['S1 Teknik/Ekonomi', 'Sertifikasi pengadaan', 'Pengalaman 2 tahun', 'SKK Level 4'] },
  { id: 'PN003', name: 'Penyusun Dokumen Tender', level: 'Ahli', subklasifikasi: 'PN', requirements: ['S1 Teknik', 'Pengalaman 3 tahun', 'SKK Level 5', 'Memahami SNI/SPI'] },
  { id: 'PN004', name: 'Evaluator Tender', level: 'Ahli', subklasifikasi: 'PN', requirements: ['S1 Teknik/Ekonomi', 'Sertifikasi evaluator', 'Pengalaman 3 tahun', 'SKK Level 6'] },
  { id: 'PN005', name: 'Kontraktor Utama', level: 'Ahli Utama', subklasifikasi: 'PN', requirements: ['SBU Terbit', 'Kualifikasi Besar', 'Nilai proyek > 10M', 'Personil lengkap'] },
  { id: 'PN006', name: 'Kontraktor Menengah', level: 'Ahli', subklasifikasi: 'PN', requirements: ['SBU Terbit', 'Kualifikasi Menengah', 'Nilai proyek 1-10M', 'Personil sesuai'] },
  { id: 'PN007', name: 'Kontraktor Kecil', level: 'Teknisi', subklasifikasi: 'PN', requirements: ['SBU Terbit', 'Kualifikasi Kecil', 'Nilai proyek < 1M', 'Personil minimal'] },
  // === LKUT - LAPORAN KEGIATAN USAHA TAHUNAN ===
  { id: 'LK001', name: 'Penyusun LKUT', level: 'Ahli', subklasifikasi: 'LK', requirements: ['S1 Akuntansi/Ekonomi', 'Memahami laporan keuangan', 'Pengalaman 3 tahun', 'Terlatih LKUT'] },
  { id: 'LK002', name: 'Validator LKUT', level: 'Ahli', subklasifikasi: 'LK', requirements: ['S1 Akuntansi', 'Sertifikasi validator', 'Pengalaman 5 tahun', 'Memahami regulasi PU'] },
  { id: 'LK003', name: 'Auditor LKUT', level: 'Ahli', subklasifikasi: 'LK', requirements: ['S1 Akuntansi', 'Sertifikasi auditor', 'Pengalaman 7 tahun', 'CPA/CA'] },
];

const levels = ['Semua', 'Ahli Utama', 'Ahli Madya', 'Ahli', 'Supervisor', 'Manager', 'PJBU', 'PJT', 'PJKB', 'PJSKBBU', 'K3', 'Teknisi', 'Pelaksana'];
const subklasifikasis = ['Semua', 'B - Gedung', 'C - Sipil', 'D - Mekanikal', 'E - Elektrikal', 'F - Jalan', 'G - Jembatan', 'H - Benda', 'MG - Personil Managerial', 'PN - Pengadaan', 'LK - LKUT'];

export default function SertifikasiPage() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('Semua');
  const [subFilter, setSubFilter] = useState('Semua');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredPositions = jobPositions.filter(pos => {
    const matchSearch = pos.name.toLowerCase().includes(search.toLowerCase()) || pos.id.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'Semua' || pos.level === levelFilter;
    const matchSub = subFilter === 'Semua' || pos.subklasifikasi === subFilter.split(' ')[0];
    return matchSearch && matchLevel && matchSub;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">📋 Sertifikasi</h1>
          <p className="text-lg text-slate-600">
            Database posisi pekerjaan & persyaratan SKK ({jobPositions.length}+ posisi, 334 total dalam sistem)
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Cari</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nama atau kode posisi..."
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Level</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Subklasifikasi</label>
              <select
                value={subFilter}
                onChange={(e) => setSubFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                {subklasifikasis.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredPositions.map((pos) => (
            <div
              key={pos.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === pos.id ? null : pos.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pos.level === 'Ahli Madya' ? 'bg-purple-100 text-purple-700' :
                    pos.level === 'Ahli' ? 'bg-blue-100 text-blue-700' :
                    pos.level === 'Manager' ? 'bg-indigo-100 text-indigo-700' :
                    pos.level === 'Supervisor' ? 'bg-cyan-100 text-cyan-700' :
                    pos.level === 'Teknisi' ? 'bg-green-100 text-green-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {pos.level}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-800">{pos.name}</h3>
                    <p className="text-sm text-slate-500">Kode: {pos.id} • Subklasifikasi: {pos.subklasifikasi}</p>
                  </div>
                </div>
                <span className="text-slate-400">
                  {expandedId === pos.id ? '▲' : '▼'}
                </span>
              </button>

              {expandedId === pos.id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                  <h4 className="font-medium text-slate-700 mb-2">Persyaratan:</h4>
                  <ul className="space-y-1">
                    {pos.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-amber-500">✓</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <a href="/certify" className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
                      Lihat Proses Sertifikasi
                    </a>
                    <a href="/chat" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
                      Tanya AI
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-slate-500">
          Menampilkan {filteredPositions.length} dari {jobPositions.length} posisi
        </div>
      </div>
    </div>
  );
}
