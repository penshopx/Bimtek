'use client';

import { useEffect, useState } from 'react';

const shortcuts = [
  { key: '⌘ / Ctrl + K', description: 'Buka global search', category: 'Navigation' },
  { key: '⌘ / Ctrl + B', description: 'Buka bookmarks', category: 'Navigation' },
  { key: '⌘ / Ctrl + P', description: 'Buka profile', category: 'Navigation' },
  { key: 'Escape', description: 'Tutup modal / search', category: 'General' },
  { key: 'Enter', description: 'Pilih hasil search', category: 'Search' },
  { key: '↑ / ↓', description: 'Navigasi hasil search', category: 'Search' },
];

const categories = ['Navigation', 'General', 'Search'];

export default function ShortcutsPage() {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKey(e.key);
      setTimeout(() => setPressedKey(null), 200);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">⌨️ Keyboard Shortcuts</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Gunakan keyboard untuk navigasi lebih cepat
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Test Keyboard</h2>
          <div className="text-center py-8">
            <p className="text-slate-500 mb-2">Tekan tombol keyboard:</p>
            <div className="text-4xl font-bold text-amber-500 min-h-[60px] flex items-center justify-center">
              {pressedKey || '—'}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {categories.map(category => (
            <div key={category} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{category}</h2>
              <div className="space-y-3">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <span className="text-slate-600 dark:text-slate-300">{shortcut.description}</span>
                      <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-mono text-sm">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Tips: Gunakan keyboard shortcuts untuk navigasi lebih cepat!
          </p>
        </div>
      </div>
    </div>
  );
}
