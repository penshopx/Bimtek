'use client';

import { useState, useEffect } from 'react';

interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  modules: number;
  quizzes: number;
  streak: number;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [timeRange]);

  const loadLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      setUsers(data.leaderboard || []);
    } catch (e) {
      setUsers(generateMockLeaderboard());
    }
    setLoading(false);
  };

  const generateMockLeaderboard = (): LeaderboardUser[] => [
    { rank: 1, name: 'Ahmad Wijaya', points: 12500, modules: 45, quizzes: 28, streak: 45 },
    { rank: 2, name: 'Budi Santoso', points: 11200, modules: 42, quizzes: 25, streak: 38 },
    { rank: 3, name: 'Siti Nurhaliza', points: 10800, modules: 40, quizzes: 24, streak: 35 },
    { rank: 4, name: 'Hendra Gunawan', points: 9500, modules: 38, quizzes: 20, streak: 28 },
    { rank: 5, name: 'Rina Susilowati', points: 8900, modules: 35, quizzes: 18, streak: 25 },
    { rank: 6, name: 'Joko Pramono', points: 8200, modules: 32, quizzes: 16, streak: 22 },
    { rank: 7, name: 'Dewi Lestari', points: 7800, modules: 30, quizzes: 15, streak: 20 },
    { rank: 8, name: 'Michael Tanoto', points: 7200, modules: 28, quizzes: 14, streak: 18 },
    { rank: 9, name: 'Lisa Permata', points: 6800, modules: 26, quizzes: 12, streak: 15 },
    { rank: 10, name: 'Rio Ferdian', points: 6200, modules: 24, quizzes: 11, streak: 12 },
  ];

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-amber-500 text-white';
    if (rank === 2) return 'from-gray-300 to-gray-400 text-gray-800';
    if (rank === 3) return 'from-orange-400 to-orange-500 text-white';
    return '';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">🏆 Leaderboard</h2>
          <div className="flex gap-2">
            {(['all', 'month', 'week'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeRange === range 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {range === 'all' ? 'Semua' : range === 'month' ? 'Bulan' : 'Minggu'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Memuat...</div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {users.slice(0, 10).map((user) => (
            <div
              key={user.rank}
              className={`p-4 flex items-center gap-4 ${
                user.rank <= 3 ? 'bg-gradient-to-r ' + getRankColor(user.rank) : ''
              }`}
            >
              <div className="w-10 text-center font-bold text-lg">
                {getMedal(user.rank)}
              </div>
              
              <div className="flex-1">
                <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>🎓 {user.modules} modul</span>
                  <span>✍️ {user.quizzes} quiz</span>
                  <span>🔥 {user.streak} hari</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-amber-500">{user.points.toLocaleString()}</div>
                <div className="text-xs text-slate-500">poin</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 text-center">
        <button className="text-amber-500 hover:text-amber-600 font-medium text-sm">
          Lihat Peringkat Lengkap →
        </button>
      </div>
    </div>
  );
}
