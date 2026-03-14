'use client';

import { useState, useEffect } from 'react';
import { Leaderboard } from '@/components/Leaderboard';

interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  modules: number;
  quizzes: number;
  streak: number;
}

export default function LeaderboardPage() {
  const [myRank, setMyRank] = useState<LeaderboardUser | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Peringkat tertinggi learner BimtekKita</p>
        </div>

        <div className="mb-8">
          <Leaderboard />
        </div>

        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-500/30">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">💡 Tips Naik Peringkat</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
              <div className="text-2xl mb-2">🎓</div>
              <div className="font-medium text-slate-900 dark:text-white">Selesaikan Modul</div>
              <div className="text-sm text-slate-500">+500 poin per modul</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
              <div className="text-2xl mb-2">✍️</div>
              <div className="font-medium text-slate-900 dark:text-white">Kerjakan Quiz</div>
              <div className="text-sm text-slate-500">+200 poin per quiz</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
              <div className="text-2xl mb-2">🔥</div>
              <div className="font-medium text-slate-900 dark:text-white">Jaga Streak</div>
              <div className="text-sm text-slate-500">+100 poin per hari</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
