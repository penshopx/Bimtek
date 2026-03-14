'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useAgenticAI } from '@/components/AgenticAIProvider';

interface AppSettings {
  compactMode: boolean;
  showAnimations: boolean;
  autoSaveProgress: boolean;
  showStreakNotifications: boolean;
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { apiKey, setApiKey } = useAgenticAI();
  const [settings, setSettings] = useState<AppSettings>({
    compactMode: false,
    showAnimations: true,
    autoSaveProgress: true,
    showStreakNotifications: true,
  });
  const [mounted, setMounted] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

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
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">🤖 AI Configuration</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">💡</span>
                  <p className="font-medium text-slate-800 dark:text-white">OpenAI API Key</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Masukkan API key untuk mengaktifkan AI Chat yang lebih intelligent dengan OpenAI GPT-4.
                </p>
                
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showApiKey ? '🙈' : '👁️'}
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setApiKey(apiKeyInput);
                        alert('API Key disimpan!');
                      }}
                      disabled={!apiKeyInput.trim()}
                      className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
                    >
                      💾 Simpan API Key
                    </button>
                    {apiKey && (
                      <button
                        onClick={() => {
                          setApiKey('');
                          setApiKeyInput('');
                          alert('API Key dihapus!');
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  
                  {apiKey ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <span>✅</span> API Key aktif - Chat akan menggunakan GPT-4
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <span>⚠️</span> Menggunakan responses berbasis aturan
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-slate-500">
                <p className="font-medium mb-2">Cara mendapatkan API Key:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Kunjungi <a href="https://platform.openai.com" target="_blank" rel="noopener" className="text-purple-500 hover:underline">platform.openai.com</a></li>
                  <li>Login atau daftar akun</li>
                  <li>Pergi ke Settings &gt; API Keys</li>
                  <li>Buat API key baru</li>
                  <li>Copy dan paste di atas</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Data &amp; Progress</h2>
            
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
