'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBookmarks, BookmarkItem } from '@/components/BookmarkProvider';

const typeLabels: Record<string, string> = {
  module: '🎓 Modul',
  quiz: '✍️ Quiz',
  article: '📚 Artikel',
  tool: '🔧 Tools',
  position: '📋 Posisi',
  solver: '🧮 Solver',
};

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const [filter, setFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredBookmarks = filter === 'all' 
    ? bookmarks 
    : bookmarks.filter(b => b.type === filter);

  const types = ['all', ...new Set(bookmarks.map(b => b.type))];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">🔖 Bookmarks</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Konten yang telah Anda simpan ({bookmarks.length})
          </p>
        </div>

        {bookmarks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === type
                    ? 'bg-amber-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {type === 'all' ? 'Semua' : typeLabels[type] || type}
              </button>
            ))}
          </div>
        )}

        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔖</div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              {bookmarks.length === 0 ? 'Belum ada bookmark' : 'Tidak ada bookmark untuk filter ini'}
            </h2>
            <p className="text-slate-500 mb-6">
              {bookmarks.length === 0 
                ? 'Simpan konten favorit Anda dengan klik tombol bookmark' 
                : 'Coba pilih filter lain'}
            </p>
            <Link href="/bimtek" className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600">
              Eksplorasi Konten
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between"
              >
                <Link href={bookmark.url} className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {bookmark.type === 'module' ? '🎓' :
                       bookmark.type === 'quiz' ? '✍️' :
                       bookmark.type === 'article' ? '📚' :
                       bookmark.type === 'tool' ? '🔧' :
                       bookmark.type === 'position' ? '📋' : '🧮'}
                    </span>
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-white hover:text-amber-600">
                        {bookmark.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {typeLabels[bookmark.type]} • Ditambahkan {new Date(bookmark.addedAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Hapus bookmark"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
