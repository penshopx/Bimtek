'use client';

import { useState } from 'react';
import Link from 'next/link';
import { certificationPositions as allPositions } from '@/lib/certificationPositions';
import ConstructionCatalog from '@/components/ConstructionCatalog';

const levels = ['Semua', 'Ahli Utama', 'Ahli Madya', 'Ahli', 'Supervisor', 'Manager', 'PJBU', 'PJT', 'PJKB', 'PJSKBBU', 'K3', 'Teknisi', 'Pelaksana'];
const subklasifikasis = ['Semua', 'B - Gedung', 'C - Sipil', 'D - Mekanikal', 'E - Elektrikal', 'F - Jalan', 'G - Jembatan', 'H - Benda', 'MG - Personil Managerial', 'MP - Manajemen Pelaksanaan', 'PN - Pengadaan', 'LK - LKUT'];

const quickFilters = [
  { label: '🏗️ Sipil', sub: 'C' },
  { label: '🏢 Gedung', sub: 'B' },
  { label: '📋 Manajemen Pelaksanaan', sub: 'MP' },
  { label: '🛣️ Jalan', sub: 'F' },
  { label: '🌉 Jembatan', sub: 'G' },
  { label: '⚙️ Mekanikal', sub: 'D' },
];

export default function SertifikasiPage() {
  const [catalogView, setCatalogView] = useState<'source' | 'legacy'>('source');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('Semua');
  const [subFilter, setSubFilter] = useState('Semua');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const applyQuickFilter = (sub: string) => {
    setSubFilter(subklasifikasis.find(s => s.startsWith(sub)) ?? 'Semua');
    setLevelFilter('Semua');
    setSearch('');
  };

  const filteredPositions = allPositions.filter(pos => {
    const matchSearch = pos.name.toLowerCase().includes(search.toLowerCase()) || pos.id.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'Semua' || pos.level === levelFilter;
    const matchSub = subFilter === 'Semua' || pos.subklasifikasi === subFilter.split(' ')[0];
    return matchSearch && matchLevel && matchSub;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Katalog Jabatan Kerja Konstruksi</h1>
          <p className="text-lg text-slate-600 mb-2">
            Telusuri klasifikasi, subklasifikasi, jabatan kerja, dan jenjang kualifikasi
          </p>
          <p className="text-sm text-slate-600">Rujukan katalog: lampiran SK DJBK Nomor 114/KPTS/Dk/2024</p>
        </div>

        <div className="flex gap-3 mb-6" role="group" aria-label="Pilih katalog">
          <button onClick={() => setCatalogView('source')} aria-pressed={catalogView === 'source'} className={`px-4 py-3 rounded-lg font-medium border ${catalogView === 'source' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}>Katalog SK DJBK 114/2024</button>
          <button onClick={() => setCatalogView('legacy')} aria-pressed={catalogView === 'legacy'} className={`px-4 py-3 rounded-lg font-medium border ${catalogView === 'legacy' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}>Data internal lama</button>
        </div>
        {catalogView === 'source' ? <ConstructionCatalog /> : <>
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
          Data lama dipertahankan untuk kompatibilitas. Kode dan pengelompokan di bawah adalah internal aplikasi, bukan kode resmi SK DJBK.
          Persyaratan pendidikan, pengalaman, dan jenjang pada data lama belum direkonsiliasi dan tidak ditampilkan sebagai persyaratan sertifikasi.
          Gunakan katalog SK DJBK untuk rujukan jabatan dan konfirmasikan skema terkini ke LSP.
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {quickFilters.map(qf => (
            <button
              key={qf.sub}
              onClick={() => applyQuickFilter(qf.sub)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                subFilter.startsWith(qf.sub)
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-amber-400 hover:text-amber-600'
              }`}
            >
              {qf.label}
            </button>
          ))}
          {subFilter !== 'Semua' && (
            <button
              onClick={() => setSubFilter('Semua')}
              className="px-4 py-2 rounded-full text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              × Semua bidang
            </button>
          )}
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
                    <p className="text-sm text-slate-500">ID internal: {pos.id} • Kelompok belajar internal: {pos.subklasifikasi}</p>
                  </div>
                </div>
                <span className="text-slate-400">
                  {expandedId === pos.id ? '▲' : '▼'}
                </span>
              </button>

              {expandedId === pos.id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-700">Nama dan label ini berasal dari katalog internal lama, belum merupakan pemetaan resmi ke katalog baru. Persyaratan lengkap mengikuti skema LSP yang dituju.</p>
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-800 mb-3">
                    <span className="font-medium">📋 Dokumen wajib untuk jabatan ini:</span> FR.APL.01 (formulir permohonan), FR.APL.02 (asesmen mandiri), bukti pengalaman kerja, ijazah, KTP.
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link href="/agentic-chat" className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
                      🤖 Tanya AI tentang jabatan ini
                    </Link>
                    <Link href="/quiz" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
                      ✍️ Latihan Soal
                    </Link>
                    <Link href="/offline" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">
                      📅 Event BIMTEK
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-slate-500">
          Menampilkan {filteredPositions.length} dari {allPositions.length} jabatan SKK
        </div>
        </>}
      </div>
    </div>
  );
}
