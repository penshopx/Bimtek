'use client';

import { useState } from 'react';

const subklasifikasi = [
  { id: 'B', name: 'B - Gedung', color: 'bg-blue-500' },
  { id: 'C', name: 'C - sipil', color: 'bg-green-500' },
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

export default function MatrixPage() {
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedPos, setSelectedPos] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);

  const connectedPositions = selectedSub 
    ? jobPositions.filter(jp => jp.subklasifikasi.includes(selectedSub))
    : [];

  const connectedSubklasifikasi = selectedPos
    ? jobPositions.find(jp => jp.id === selectedPos)?.subklasifikasi || []
    : [];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">🔗 Matrix</h1>
          <p className="text-lg text-slate-600">
            Visualisasi koneksi subklasifikasi & jabatan kerja
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Subklasifikasi</h2>
            <div className="space-y-3">
              {subklasifikasi.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSub(selectedSub === sub.id ? null : sub.id)}
                  onMouseEnter={() => setHoveredConnection(sub.id)}
                  onMouseLeave={() => setHoveredConnection(null)}
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
      </div>
    </div>
  );
}
