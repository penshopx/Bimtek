'use client';

import { useState, useEffect } from 'react';

interface NotificationSettings {
  enabled: boolean;
  remindDaily: boolean;
  remindUnfinished: boolean;
  reminderTime: string;
}

export function NotificationManager() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    remindDaily: true,
    remindUnfinished: true,
    reminderTime: '09:00',
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [mounted, setMounted] = useState(false);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
        new Notification('BimtekKita', {
          body: 'Notifikasi berhasil diaktifkan! Kami akan mengingatkan Anda untuk terus belajar.',
          icon: '/icon-192.svg',
        });
      }
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('BimtekKita - Reminder', {
        body: 'Waktunya belajar! Lanjutkan progress PKB Anda.',
        icon: '/icon-192.svg',
      });
    }
  };

  useEffect(() => {
    setMounted(true);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (mounted && settings.enabled && permission === 'granted') {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
    }
  }, [settings, mounted, permission]);

  if (!mounted) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">🔔 Pengaturan Notifikasi</h3>
      
      {permission === 'default' && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
          <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
            Aktifkan notifikasi untuk mendapat pengingat belajar!
          </p>
          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600"
          >
            Aktifkan Notifikasi
          </button>
        </div>
      )}

      {permission === 'denied' && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <p className="text-red-800 dark:text-red-200 text-sm">
            Notifikasi diblokir. Silakan aktifkan di pengaturan browser Anda.
          </p>
        </div>
      )}

      {permission === 'granted' && (
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl cursor-pointer">
            <span className="text-slate-700 dark:text-slate-300">Aktifkan notifikasi</span>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="w-5 h-5 text-amber-500 rounded"
            />
          </label>

          {settings.enabled && (
            <>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300">Pengingat harian</span>
                <input
                  type="checkbox"
                  checked={settings.remindDaily}
                  onChange={(e) => setSettings({ ...settings, remindDaily: e.target.checked })}
                  className="w-5 h-5 text-amber-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300">Ingatkan modul belum selesai</span>
                <input
                  type="checkbox"
                  checked={settings.remindUnfinished}
                  onChange={(e) => setSettings({ ...settings, remindUnfinished: e.target.checked })}
                  className="w-5 h-5 text-amber-500 rounded"
                />
              </label>

              {settings.remindDaily && (
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <label className="block text-slate-600 dark:text-slate-400 text-sm mb-2">
                    Jam pengingat
                  </label>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg"
                  />
                </div>
              )}

              <button
                onClick={sendTestNotification}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                Kirim Notifikasi Test
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
