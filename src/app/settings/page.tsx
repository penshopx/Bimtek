'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface AppSettings {
  compactMode: boolean;
  showAnimations: boolean;
  autoSaveProgress: boolean;
  showStreakNotifications: boolean;
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    compactMode: false,
    showAnimations: true,
    autoSaveProgress: true,
    showStreakNotifications: true,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    }
  }, [settings, mounted]);

  const clearAllData = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data? Ini tidak dapat dibatalkan.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">⚙️ Settings</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Konfigurasi aplikasi BimtekKita
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Tampilan</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-slate-500">Aktifkan tema gelap</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                  }`}
                >
                  {theme === 'dark' ? '🌙 Gelap' : '☀️ Terang'}
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">Compact Mode</p>
                  <p className="text-sm text-slate-500">Tampilan lebih ringkas</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, compactMode: !settings.compactMode })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    settings.compactMode
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                  }`}
                >
                  {settings.compactMode ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">Show Animations</p>
                  <p className="text-sm text-slate-500">Tampilkan animasi transisi</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showAnimations: !settings.showAnimations })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    settings.showAnimations
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                  }`}
                >
                  {settings.showAnimations ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Data & Progress</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">Auto-save Progress</p>
                  <p className="text-sm text-slate-500">Simpan progress secara otomatis</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, autoSaveProgress: !settings.autoSaveProgress })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    settings.autoSaveProgress
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                  }`}
                >
                  {settings.autoSaveProgress ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">Streak Notifications</p>
                  <p className="text-sm text-slate-500">Notifikasi saat streak aktif</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, showStreakNotifications: !settings.showStreakNotifications })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    settings.showStreakNotifications
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                  }`}
                >
                  {settings.showStreakNotifications ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Data Management</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <h3 className="font-medium text-slate-800 dark:text-white mb-2">Data Tersimpan</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Profile:</span>
                    <span className="text-slate-800 dark:text-white">{localStorage.getItem('bimtekProfile') ? '✓' : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Progress:</span>
                    <span className="text-slate-800 dark:text-white">{localStorage.getItem('bimtekCompleted') ? '✓' : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bookmarks:</span>
                    <span className="text-slate-800 dark:text-white">{localStorage.getItem('bookmarks') ? '✓' : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Streak:</span>
                    <span className="text-slate-800 dark:text-white">{localStorage.getItem('learningStreak') ? '✓' : '—'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={clearAllData}
                className="w-full px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all"
              >
                🗑️ Hapus Semua Data
              </button>
              <p className="text-xs text-slate-500 text-center">
                Menghapus semua data lokal termasuk progress, bookmarks, dan pengaturan
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Tentang</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Versi App</span>
                <span className="text-slate-800 dark:text-white">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Total Modul</span>
                <span className="text-slate-800 dark:text-white">67+</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500">Soal Quiz</span>
                <span className="text-slate-800 dark:text-white">65+</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Posisi SKK</span>
                <span className="text-slate-800 dark:text-white">334+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
