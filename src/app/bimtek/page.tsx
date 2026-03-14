'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const bimtekModules = [
  { id: 'sipil-gedung-1', title: 'Teknik Fondasi Gedung', category: 'Sipil Gedung', pkb: 10, duration: '4 jam', level: 'Ahli' },
  { id: 'sipil-gedung-2', title: 'Struktur Beton Bertulang', category: 'Sipil Gedung', pkb: 12, duration: '6 jam', level: 'Ahli' },
  { id: 'sipil-gedung-3', title: 'Struktur Baja Gedung', category: 'Sipil Gedung', pkb: 12, duration: '6 jam', level: 'Ahli' },
  { id: 'sipil-gedung-4', title: 'Konstruksi Jalan Raya', category: 'Sipil Gedung', pkb: 10, duration: '4 jam', level: 'Ahli' },
  { id: 'sipil-gedung-5', title: 'Pondasi Tiang Pancang', category: 'Sipil Gedung', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'sipil-gedung-6', title: ' waterproofing Gedung', category: 'Sipil Gedung', pkb: 6, duration: '3 jam', level: 'Ahli' },
  { id: 'sipil-gedung-7', title: 'Beton Pracetak', category: 'Sipil Gedung', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'sipil-gedung-8', title: 'Metode Pelaksanaan Konstruksi', category: 'Sipil Gedung', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'k3-1', title: 'K3 Konstruksi Gedung', category: 'K3', pkb: 15, duration: '8 jam', level: 'Wajib' },
  { id: 'k3-2', title: 'Pencegahan Kecelakaan Kerja', category: 'K3', pkb: 10, duration: '4 jam', level: 'Ahli' },
  { id: 'k3-3', title: 'APD dan Penangannya', category: 'K3', pkb: 6, duration: '3 jam', level: 'Teknisi' },
  { id: 'k3-4', title: 'P3K di Tempat Kerja', category: 'K3', pkb: 8, duration: '4 jam', level: 'Wajib' },
  { id: 'k3-5', title: 'Keselamatan Kerja Tinggi', category: 'K3', pkb: 10, duration: '4 jam', level: 'Ahli' },
  { id: 'k3-6', title: 'Proteksi Kebakaran', category: 'K3', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'jalan-1', title: 'Desain Jalan Raya', category: 'Jalan', pkb: 12, duration: '6 jam', level: 'Ahli' },
  { id: 'jalan-2', title: 'Perkerasan Jalan', category: 'Jalan', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'jalan-3', title: 'Jembatan Beton', category: 'Jalan', pkb: 12, duration: '6 jam', level: 'Ahli' },
  { id: 'jalan-4', title: 'Jembatan Baja', category: 'Jalan', pkb: 12, duration: '6 jam', level: 'Ahli' },
  { id: 'jalan-5', title: 'Drainase Jalan', category: 'Jalan', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'jalan-6', title: 'Lapisan Aspal', category: 'Jalan', pkb: 8, duration: '4 jam', level: 'Teknisi' },
  { id: 'elektrikal-1', title: 'Instalasi Listrik Gedung', category: 'Elektrikal', pkb: 12, duration: '6 jam', level: 'Ahli' },
  { id: 'elektrikal-2', title: 'Sistem Proteksi Listrik', category: 'Elektrikal', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'elektrikal-3', title: 'Pembangkit Listrik Tenaga Surya', category: 'Elektrikal', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'elektrikal-4', title: 'Sistem HVAC', category: 'Elektrikal', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'elektrikal-5', title: 'Listrik Gedung Bertingkat', category: 'Elektrikal', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'elektrikal-6', title: 'Trafo dan Distribusi', category: 'Elektrikal', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'mekanikal-1', title: 'Plumbing Gedung', category: 'Mekanikal', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'mekanikal-2', title: 'Sistem Sprinkler', category: 'Mekanikal', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'mekanikal-3', title: 'Elevator dan Eskalator', category: 'Mekanikal', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'mekanikal-4', title: 'Sistem Pendingin', category: 'Mekanikal', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'mekanikal-5', title: 'Pipa Industri', category: 'Mekanikal', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'manajemen-1', title: 'Manajemen Proyek Konstruksi', category: 'Manajemen', pkb: 15, duration: '8 jam', level: 'Manager' },
  { id: 'manajemen-2', title: 'Cost Control Proyek', category: 'Manajemen', pkb: 12, duration: '6 jam', level: 'Manager' },
  { id: 'manajemen-3', title: 'Schedule Proyek', category: 'Manajemen', pkb: 10, duration: '5 jam', level: 'Manager' },
  { id: 'manajemen-4', title: 'Manajemen Risiko', category: 'Manajemen', pkb: 10, duration: '5 jam', level: 'Manager' },
  { id: 'manajemen-5', title: 'Quality Assurance', category: 'Manajemen', pkb: 10, duration: '5 jam', level: 'Manager' },
  { id: 'manajemen-6', title: 'Kontrak Konstruksi', category: 'Manajemen', pkb: 8, duration: '4 jam', level: 'Manager' },
  { id: 'rab-1', title: 'Penyusunan RAB', category: 'RAB', pkb: 12, duration: '6 jam', level: 'Ahli' },
  { id: 'rab-2', title: 'Analisa Harga Satuan', category: 'RAB', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'rab-3', title: 'Bill of Quantity', category: 'RAB', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'rab-4', title: 'Estimasi Biaya Proyek', category: 'RAB', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'rab-5', title: 'Nilai Kontrak dan Addendum', category: 'RAB', pkb: 6, duration: '3 jam', level: 'Ahli' },
  { id: 'quality-1', title: 'Quality Control Beton', category: 'Quality', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'quality-2', title: 'Quality Control Baja', category: 'Quality', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'quality-3', title: 'Pengujian Material', category: 'Quality', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'quality-4', title: 'Inspecti dan Audit', category: 'Quality', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'quality-5', title: 'NCR dan Corrective Action', category: 'Quality', pkb: 6, duration: '3 jam', level: 'Ahli' },
  { id: 'environment-1', title: 'AMDAL Konstruksi', category: 'Lingkungan', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'environment-2', title: 'Pengelolaan Limbah', category: 'Lingkungan', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'environment-3', title: 'Konstruksi Ramah Lingkungan', category: 'Lingkungan', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'environment-4', title: 'Pencemaran dan Mitigasi', category: 'Lingkungan', pkb: 6, duration: '3 jam', level: 'Ahli' },
  { id: 'safety-1', title: 'Sistem Management K3', category: 'Safety', pkb: 12, duration: '6 jam', level: 'Ahli' },
  { id: 'safety-2', title: 'Investigasi Kecelakaan', category: 'Safety', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'safety-3', title: 'Emergency Response Plan', category: 'Safety', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'safety-4', title: 'Safety Inspection', category: 'Safety', pkb: 6, duration: '3 jam', level: 'Teknisi' },
  { id: 'digital-1', title: 'Autocad untuk Konstruksi', category: 'Digital', pkb: 10, duration: '5 jam', level: 'Teknisi' },
  { id: 'digital-2', title: 'Revit Architecture', category: 'Digital', pkb: 12, duration: '6 jam', level: 'Ahli' },
  { id: 'digital-3', title: 'BIM Fundamental', category: 'Digital', pkb: 15, duration: '8 jam', level: 'Ahli' },
  { id: 'digital-4', title: 'Microsoft Project', category: 'Digital', pkb: 8, duration: '4 jam', level: 'Manager' },
  { id: 'digital-5', title: 'Primavera P6', category: 'Digital', pkb: 10, duration: '5 jam', level: 'Ahli' },
  { id: 'digital-6', title: 'SAP2000 Analisis Struktur', category: 'Digital', pkb: 12, duration: '6 jam', level: 'Ahli' },
  { id: 'digital-7', title: 'ETABS untuk Gedung', category: 'Digital', pkb: 12, duration: '6 jam', level: 'Ahli' },
  { id: 'sertifikasi-1', title: 'SKKNI Konstruksi', category: 'Sertifikasi', pkb: 8, duration: '4 jam', level: 'Ahli' },
  { id: 'sertifikasi-2', title: 'Proses Sertifikasi BNSP', category: 'Sertifikasi', pkb: 6, duration: '3 jam', level: 'Ahli' },
  { id: 'sertifikasi-3', title: 'Asesmen Kompetensi', category: 'Sertifikasi', pkb: 6, duration: '3 jam', level: 'Ahli' },
];

const categories = ['Semua', 'Sipil Gedung', 'K3', 'Jalan', 'Elektrikal', 'Mekanikal', 'Manajemen', 'RAB', 'Quality', 'Lingkungan', 'Safety', 'Digital', 'Sertifikasi'];

export default function BimtekPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [totalPKB, setTotalPKB] = useState(0);
  const [targetPKB, setTargetPKB] = useState(150);

  useEffect(() => {
    const saved = localStorage.getItem('bimtekCompleted');
    if (saved) {
      try {
        const completed = JSON.parse(saved);
        setCompletedModules(completed);
        const pkb = completed.reduce((sum: number, id: string) => {
          const mod = bimtekModules.find(m => m.id === id);
          return sum + (mod?.pkb || 0);
        }, 0);
        setTotalPKB(pkb);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const filteredModules = selectedCategory === 'Semua' 
    ? bimtekModules 
    : bimtekModules.filter(m => m.category === selectedCategory);

  const completedCount = filteredModules.filter(m => completedModules.includes(m.id)).length;
  const progressPercent = filteredModules.length > 0 ? (completedCount / filteredModules.length) * 100 : 0;

  const handleModuleClick = (id: string) => {
    router.push(`/bimtek/${id}`);
  };

  const toggleComplete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newCompleted = completedModules.includes(id)
      ? completedModules.filter(m => m !== id)
      : [...completedModules, id];
    
    setCompletedModules(newCompleted);
    localStorage.setItem('bimtekCompleted', JSON.stringify(newCompleted));
    
    const pkb = newCompleted.reduce((sum, modId) => {
      const mod = bimtekModules.find(m => m.id === modId);
      return sum + (mod?.pkb || 0);
    }, 0);
    setTotalPKB(pkb);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            🎓 BIMTEK - Pelatihan Konstruksi
          </h1>
          <p className="text-lg text-slate-600">
            {bimtekModules.length} modul pelatihan dengan PKB points
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Progress PKB Anda</h2>
              <p className="text-slate-500">Target: {targetPKB} PKB Points</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-amber-600">{totalPKB}</span>
              <span className="text-slate-400"> / {targetPKB} PKB</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalPKB / targetPKB) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-500 mt-2 text-center">
            {completedModules.length} modul selesai dari {bimtekModules.length} total
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-4 text-center">
          <span className="text-slate-600">
            Menampilkan {filteredModules.length} modul • {completedCount} selesai ({progressPercent.toFixed(0)}%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => {
            const isCompleted = completedModules.includes(module.id);
            return (
              <div
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className={`bg-white rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all hover:shadow-lg hover:border-amber-300 ${
                  isCompleted ? 'border-green-300 bg-green-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    module.category === 'Sipil Gedung' ? 'bg-blue-100 text-blue-700' :
                    module.category === 'K3' ? 'bg-red-100 text-red-700' :
                    module.category === 'Jalan' ? 'bg-orange-100 text-orange-700' :
                    module.category === 'Elektrikal' ? 'bg-yellow-100 text-yellow-700' :
                    module.category === 'Mekanikal' ? 'bg-cyan-100 text-cyan-700' :
                    module.category === 'Manajemen' ? 'bg-purple-100 text-purple-700' :
                    module.category === 'RAB' ? 'bg-green-100 text-green-700' :
                    module.category === 'Quality' ? 'bg-pink-100 text-pink-700' :
                    module.category === 'Lingkungan' ? 'bg-emerald-100 text-emerald-700' :
                    module.category === 'Safety' ? 'bg-rose-100 text-rose-700' :
                    module.category === 'Digital' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {module.category}
                  </span>
                  <button
                    onClick={(e) => toggleComplete(e, module.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-200 text-slate-400 hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    {isCompleted ? '✓' : '+'}
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {module.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center">
                      <span className="mr-1">⏱️</span>
                      {module.duration}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${
                      module.level === 'Ahli' ? 'bg-purple-100 text-purple-700' :
                      module.level === 'Manager' ? 'bg-indigo-100 text-indigo-700' :
                      module.level === 'Teknisi' ? 'bg-cyan-100 text-cyan-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {module.level}
                    </span>
                  </div>
                  <span className="font-semibold text-amber-600">
                    +{module.pkb} PKB
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
