'use client';

import { useState, useEffect } from 'react';
import { useActivities, Activity } from '@/components/ActivityLogger';

const typeLabels: Record<Activity['type'], { label: string; icon: string; color: string }> = {
  module_complete: { label: 'Modul Selesai', icon: '🎓', color: 'bg-green-100 dark:bg-green-900/30 text-green-700' },
  quiz_take: { label: 'Quiz', icon: '✍️', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700' },
  bookmark_add: { label: 'Bookmark', icon: '🔖', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700' },
  profile_update: { label: 'Profile Update', icon: '👤', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700' },
  achievement_unlock: { label: 'Achievement', icon: '🏆', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700' },
  streak_update: { label: 'Streak', icon: '🔥', color: 'bg-red-100 dark:bg-red-900/30 text-red-700' },
};

export default function ActivityLogPage() {
  const { activities, clearActivities } = useActivities();
  const [filter, setFilter] = useState<Activity['type'] | 'all'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter);

  const types = ['all', ...new Set(activities.map(a => a.type))] as (Activity['type'] | 'all')[];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString('id-ID');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">📝 Activity Log</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Riwayat aktivitas belajar Anda ({activities.length})
            </p>
          </div>
          {activities.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Hapus semua riwayat aktivitas?')) {
                  clearActivities();
                }
              }}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
            >
              Hapus Semua
            </button>
          )}
        </div>

        {activities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === type
                    ? 'bg-amber-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {type === 'all' ? 'Semua' : typeLabels[type].label}
              </button>
            ))}
          </div>
        )}

        {filteredActivities.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              {activities.length === 0 ? 'Belum ada aktivitas' : 'Tidak ada aktivitas untuk filter ini'}
            </h2>
            <p className="text-slate-500">
              {activities.length === 0 
                ? 'Mulai belajar untuk melihat aktivitas Anda di sini!' 
                : 'Coba pilih filter lain'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${typeLabels[activity.type].color}`}>
                  {typeLabels[activity.type].icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-800 dark:text-white">{activity.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${typeLabels[activity.type].color}`}>
                      {typeLabels[activity.type].label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
