'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

interface DashboardStats {
  completedModules: number;
  totalModules: number;
  quizScores: number;
  averageScore: number;
  streak: number;
  longestStreak: number;
  bookmarks: number;
  achievements: number;
  totalAchievements: number;
  hoursLearned: number;
  certificates: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

interface QuizScore {
  category: string;
  score: number;
  totalQuestions: number;
  takenAt: string;
}

interface WeeklyData {
  day: string;
  hours: number;
  activities: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    completedModules: 0,
    totalModules: 67,
    quizScores: 0,
    averageScore: 0,
    streak: 0,
    longestStreak: 0,
    bookmarks: 0,
    achievements: 0,
    totalAchievements: 14,
    hoursLearned: 0,
    certificates: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizScore[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const savedCompleted = localStorage.getItem('bimtekCompleted');
      const completed = savedCompleted ? JSON.parse(savedCompleted) : [];
      
      const savedQuizScores = localStorage.getItem('quizBestScores');
      const quizScoresData = savedQuizScores ? JSON.parse(savedQuizScores) : {};
      
      const savedStreak = localStorage.getItem('learningStreak');
      const streakData = savedStreak ? JSON.parse(savedStreak) : { currentStreak: 0, longestStreak: 0, totalHours: 0 };
      
      const savedBookmarks = localStorage.getItem('bookmarks');
      const bookmarksData = savedBookmarks ? JSON.parse(savedBookmarks) : [];
      
      const savedAchievements = localStorage.getItem('achievements');
      const achievementsData = savedAchievements ? JSON.parse(savedAchievements) : [];
      
      const savedActivities = localStorage.getItem('activities');
      const activitiesData: Activity[] = savedActivities ? JSON.parse(savedActivities) : [];
      
      let totalScore = 0;
      let quizCount = 0;
      const quizList: QuizScore[] = [];
      
      Object.entries(quizScoresData).forEach(([category, data]: [string, any]) => {
        totalScore += data.bestScore || 0;
        quizCount += 1;
        quizList.push({
          category,
          score: data.bestScore || 0,
          totalQuestions: data.totalQuestions || 10,
          takenAt: data.lastTaken || new Date().toISOString(),
        });
      });
      
      const avgScore = quizCount > 0 ? Math.round(totalScore / quizCount) : 0;
      
      const weekly = generateWeeklyData(activitiesData);
      
      setStats({
        completedModules: completed.length,
        totalModules: 67,
        quizScores: quizCount,
        averageScore: avgScore,
        streak: streakData.currentStreak || 0,
        longestStreak: streakData.longestStreak || 0,
        bookmarks: bookmarksData.length,
        achievements: achievementsData.filter((a: any) => a.unlocked).length,
        totalAchievements: 14,
        hoursLearned: streakData.totalHours || Math.floor(completed.length * 2),
        certificates: 0,
      });
      
      setActivities(activitiesData.slice(0, 10));
      setRecentQuizzes(quizList.slice(0, 5));
      setWeeklyData(weekly);
      
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const generateWeeklyData = (activities: Activity[]): WeeklyData[] => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const today = new Date();
    const result: WeeklyData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = activities.filter((a: Activity) => 
        a.timestamp && a.timestamp.startsWith(dateStr)
      );
      
      result.push({
        day: days[date.getDay()],
        hours: dayActivities.length * 0.5 + Math.random() * 1.5,
        activities: dayActivities.length,
      });
    }
    
    return result;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      'module_complete': '🎓',
      'quiz_take': '✍️',
      'bookmark_add': '🔖',
      'profile_update': '👤',
      'achievement_unlock': '🏆',
      'streak_update': '🔥',
    };
    return icons[type] || '📝';
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  const progressPercentage = Math.round((stats.completedModules / stats.totalModules) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {user ? `👋 Halo, ${user.name}!` : '📊 Dashboard'}
          </h1>
          <p className="text-slate-400 mt-1">Selamat datang di BimtekKita - Platform Pelatihan Konstruksi</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Memuat data...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold">{stats.completedModules}</div>
                <div className="text-amber-100 text-sm">Modul Selesai</div>
                <div className="mt-2 text-xs text-amber-200">{progressPercentage}% dari 67 modul</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold">{stats.streak}</div>
                <div className="text-blue-100 text-sm">Hari Streak</div>
                <div className="mt-2 text-xs text-blue-200">Terpanjang: {stats.longestStreak} hari</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold">{stats.averageScore}%</div>
                <div className="text-green-100 text-sm">Rata-rata Quiz</div>
                <div className="mt-2 text-xs text-green-200">{stats.quizScores} kali mengerjakan</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold">{stats.achievements}/{stats.totalAchievements}</div>
                <div className="text-purple-100 text-sm">Achievements</div>
                <div className="mt-2 text-xs text-purple-200">{stats.totalAchievements - stats.achievements} lagi unlock</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">📈 Aktivitas Mingguan</h2>
                <div className="flex items-end justify-between h-48 gap-2">
                  {weeklyData.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg transition-all"
                        style={{ height: `${Math.min(day.hours * 30, 160)}px` }}
                      />
                      <div className="mt-2 text-xs text-slate-400">{day.day}</div>
                      <div className="text-xs text-slate-500">{day.hours.toFixed(1)}j</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">🎯 Progress Modules</h2>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="text-right w-full">
                      <span className="text-xs font-semibold inline-block text-amber-500">
                        {progressPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-slate-700">
                    <div 
                      style={{ width: `${progressPercentage}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-amber-500 to-orange-500"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Selesai</span>
                    <span className="text-white font-medium">{stats.completedModules} modul</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total</span>
                    <span className="text-white font-medium">{stats.totalModules} modul</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Waktu belajar</span>
                    <span className="text-white font-medium">{stats.hoursLearned} jam</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">📝 Aktivitas Terbaru</h2>
                  <Link href="/activity" className="text-amber-500 text-sm hover:underline">Lihat semua</Link>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">Belum ada aktivitas</div>
                  ) : (
                    activities.slice(0, 6).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <span className="text-xl">{getActivityIcon(activity.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{activity.title}</div>
                          <div className="text-slate-400 text-xs">{getTimeAgo(activity.timestamp)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">✍️ Quiz Terbaru</h2>
                  <Link href="/quiz" className="text-amber-500 text-sm hover:underline">Mulai quiz</Link>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentQuizzes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">Belum ada quiz</div>
                  ) : (
                    recentQuizzes.map((quiz, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <div className="text-white text-sm font-medium">{quiz.category}</div>
                          <div className="text-slate-400 text-xs">
                            {new Date(quiz.takenAt).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          quiz.score >= 80 ? 'bg-green-500/20 text-green-400' :
                          quiz.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {quiz.score}%
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/bimtek" className="bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500 transition-all">
                <div className="text-3xl mb-2">🎓</div>
                <div className="text-white font-semibold">BIMTEK</div>
                <div className="text-slate-400 text-sm">67+ Modul</div>
              </Link>
              
              <Link href="/quiz" className="bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500 transition-all">
                <div className="text-3xl mb-2">✍️</div>
                <div className="text-white font-semibold">Quiz</div>
                <div className="text-slate-400 text-sm">65+ Pertanyaan</div>
              </Link>
              
              <Link href="/offline" className="bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500 transition-all">
                <div className="text-3xl mb-2">📍</div>
                <div className="text-white font-semibold">Offline</div>
                <div className="text-slate-400 text-sm">Event Terbesar</div>
              </Link>
              
              <Link href="/agentic-chat" className="bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500 transition-all">
                <div className="text-3xl mb-2">🤖</div>
                <div className="text-white font-semibold">AI Agent</div>
                <div className="text-slate-400 text-sm">Konsultasi AI</div>
              </Link>
            </div>

            {!user && (
              <div className="mt-8 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-6 border border-amber-500/30">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Mulai Perjalanan Belajarmu!</h3>
                    <p className="text-slate-400">Daftar sekarang untuk akses penuh ke semua fitur</p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/login" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium">
                      Masuk
                    </Link>
                    <Link href="/register" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium">
                      Daftar Gratis
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
