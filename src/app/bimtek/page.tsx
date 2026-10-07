'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getJabatanById, getRelatedCategories } from '@/lib/skkData';
import { bimtekCategories, bimtekModules } from '@/lib/bimtekCatalog';

const categories = ['Semua', ...bimtekCategories];

function BimtekContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Personalization: get jabatan info
  const jabatan = user?.jabatanSkk ? getJabatanById(user.jabatanSkk) : null;
  const relatedCategories = user?.jabatanSkk ? getRelatedCategories(user.jabatanSkk) : [];

  // Pre-select category from URL param (e.g. from dashboard links) or default to 'Semua'
  const initialCategory = searchParams.get('category') || 'Semua';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showOnlyRelevant, setShowOnlyRelevant] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('bimtekCompleted');
    if (saved) {
      try {
        const completed = JSON.parse(saved);
        setCompletedModules(completed);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Apply filters
  let filteredModules = selectedCategory === 'Semua'
    ? bimtekModules
    : bimtekModules.filter(m => m.category === selectedCategory);

  if (showOnlyRelevant && relatedCategories.length > 0) {
    filteredModules = filteredModules.filter(m => relatedCategories.includes(m.category));
  }

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
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Sipil Gedung': 'bg-blue-100 text-blue-700',
      'K3': 'bg-red-100 text-red-700',
      'Jalan': 'bg-orange-100 text-orange-700',
      'Elektrikal': 'bg-yellow-100 text-yellow-700',
      'Mekanikal': 'bg-cyan-100 text-cyan-700',
      'Manajemen': 'bg-purple-100 text-purple-700',
      'RAB': 'bg-green-100 text-green-700',
      'Quality': 'bg-pink-100 text-pink-700',
      'Lingkungan': 'bg-emerald-100 text-emerald-700',
      'Safety': 'bg-rose-100 text-rose-700',
      'Digital': 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Ahli': 'bg-purple-100 text-purple-700',
      'Manager': 'bg-indigo-100 text-indigo-700',
      'Teknisi': 'bg-cyan-100 text-cyan-700',
    };
    return colors[level] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">🎓 BIMTEK - Pelatihan Konstruksi</h1>
          <p className="text-lg text-slate-600">{bimtekModules.length} modul pembelajaran untuk memperkuat pengetahuan konstruksi</p>
        </div>

        {/* Personalization banner */}
        {jabatan ? (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-amber-700 text-xs font-semibold uppercase tracking-wide mb-1">Dipersonalisasi untuk jabatan Anda</p>
                <p className="text-slate-800 font-bold">{jabatan.name}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {relatedCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setShowOnlyRelevant(false); }}
                      className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-full text-xs transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setShowOnlyRelevant(v => !v); setSelectedCategory('Semua'); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    showOnlyRelevant
                      ? 'bg-amber-500 text-white'
                      : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  {showOnlyRelevant ? '✅ Menampilkan relevan' : '🎯 Tampilkan relevan saja'}
                </button>
                <Link href="/profile" className="text-center text-xs text-amber-600 hover:underline">
                  Ganti jabatan →
                </Link>
              </div>
            </div>
          </div>
        ) : user ? (
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">💡 Pilih jabatan SKK Anda untuk melihat modul yang diprioritaskan</p>
            <Link href="/profile" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium whitespace-nowrap">
              Pilih Jabatan →
            </Link>
          </div>
        ) : null}

        {/* Learning progress for the current filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Kemajuan belajar BIMTEK</h2>
              <p className="text-slate-600">Modul yang ditandai selesai pada filter aktif</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-amber-600">{completedCount}</span>
              <span className="text-slate-600"> / {filteredModules.length} modul</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-2 text-center">
            Penyelesaian modul mencatat kemajuan belajar pribadi, bukan pemberian SKPK otomatis.
            Kredit PKB resmi memerlukan bukti kegiatan dan penilaian pihak berwenang.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setShowOnlyRelevant(false); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat && !showOnlyRelevant
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              } ${
                // Highlight categories relevant to user's jabatan
                relatedCategories.includes(cat) && cat !== 'Semua'
                  ? 'ring-2 ring-amber-300'
                  : ''
              }`}
            >
              {cat}
              {relatedCategories.includes(cat) && cat !== 'Semua' && (
                <span className="ml-1 text-amber-500">★</span>
              )}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-slate-600 text-sm">
            Menampilkan {filteredModules.length} modul • {completedCount} selesai ({progressPercent.toFixed(0)}%)
          </span>
          {showOnlyRelevant && (
            <span className="text-amber-600 text-sm font-medium">
              🎯 Difilter: relevan untuk {jabatan?.name}
            </span>
          )}
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => {
            const isCompleted = completedModules.includes(module.id);
            const isRelevant = relatedCategories.includes(module.category);
            return (
              <div
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className={`bg-white rounded-xl shadow-sm border-2 p-5 cursor-pointer transition-all hover:shadow-lg hover:border-amber-300 ${
                  isCompleted
                    ? 'border-green-300 bg-green-50'
                    : isRelevant && jabatan
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(module.category)}`}>
                      {module.category}
                    </span>
                    {isRelevant && jabatan && !isCompleted && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                        ★ Relevan
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => toggleComplete(e, module.id)}
                    aria-label={`${isCompleted ? 'Batalkan tanda selesai' : 'Tandai selesai'}: ${module.title}`}
                    aria-pressed={isCompleted}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-400 hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    {isCompleted ? '✓' : '+'}
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-2">{module.title}</h3>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center">
                      <span className="mr-1">⏱️</span>
                      {module.duration}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${getLevelColor(module.level)}`}>
                      {module.level}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-3">🔍</div>
            <p>Tidak ada modul yang sesuai dengan filter ini.</p>
            <button onClick={() => { setSelectedCategory('Semua'); setShowOnlyRelevant(false); }} className="mt-3 text-amber-500 hover:underline text-sm">
              Reset filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BimtekPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-slate-600">Memuat katalog BIMTEK...</p>
        </div>
      }
    >
      <BimtekContent />
    </Suspense>
  );
}
