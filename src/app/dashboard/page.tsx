'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getJabatanById, getRelatedCategories } from '@/lib/skkData';
import { bimtekModules } from '@/lib/bimtekCatalog';
import { LearningJourney } from '@/components/learning/LearningJourney';
import { readJourneyProgress } from '@/lib/learning-journey-storage';

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
  activities: number;
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fullYearsSince(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return 0;

  const now = new Date();
  let years = now.getFullYear() - year;
  const anniversaryPassed =
    now.getMonth() + 1 > month ||
    (now.getMonth() + 1 === month && now.getDate() >= day);

  if (!anniversaryPassed) years -= 1;
  return Math.max(0, years);
}

function isCertificateActive(dateString: string): boolean {
  const issuedAt = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(issuedAt.getTime())) return false;

  const expiresAt = new Date(issuedAt);
  expiresAt.setMonth(expiresAt.getMonth() + 60);
  return Math.ceil((expiresAt.getTime() - Date.now()) / 86400000) >= 0;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    completedModules: 0,
    totalModules: bimtekModules.length,
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
  const [assessorDismissal, setAssessorDismissal] = useState({ key: '', dismissed: false });

  // Derived jabatan info
  const jabatan = user?.jabatanSkk ? getJabatanById(user.jabatanSkk) : null;
  const relatedCategories = user?.jabatanSkk ? getRelatedCategories(user.jabatanSkk) : [];
  const skkExperienceYears = user?.skkIssuedAt ? fullYearsSince(user.skkIssuedAt) : 0;
  const assessorDismissalKey = user?.skkIssuedAt && user.skkCertificateLevel
    ? `siapskk-assessor-suggestion-dismissed:${user.id}:${user.skkCertificateLevel}:${user.skkIssuedAt}`
    : '';
  const showAssessorSuggestion =
    !!user?.skkIssuedAt &&
    Number(user.skkCertificateLevel) >= 6 &&
    skkExperienceYears >= 2 &&
    isCertificateActive(user.skkIssuedAt) &&
    assessorDismissal.key === assessorDismissalKey &&
    !assessorDismissal.dismissed;

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!assessorDismissalKey) {
      setAssessorDismissal({ key: '', dismissed: false });
      return;
    }

    setAssessorDismissal({
      key: assessorDismissalKey,
      dismissed: localStorage.getItem(assessorDismissalKey) === 'true',
    });
  }, [assessorDismissalKey]);

  const loadDashboardData = async () => {
    try {
      // Fetch certificate count from the DB
      let certCount = 0;
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        try {
          const certRes = await fetch('/api/events?action=my-certificates', {
            headers: { 'x-session-id': sessionId },
          });
          if (certRes.ok) {
            const certs = await certRes.json();
            certCount = Array.isArray(certs) ? certs.length : 0;
          }
        } catch {
          // silently ignore — non-critical
        }
      }

      const completed = Object.entries(user ? readJourneyProgress(user.id).progress.modules : {})
        .filter(([, item]) => item.completed).map(([id]) => id);

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
        completedModules: bimtekModules.filter(module => completed.includes(module.id)).length,
        totalModules: bimtekModules.length,
        quizScores: quizCount,
        averageScore: avgScore,
        streak: streakData.currentStreak || 0,
        longestStreak: streakData.longestStreak || 0,
        bookmarks: bookmarksData.length,
        achievements: achievementsData.filter((a: any) => a.unlocked).length,
        totalAchievements: 14,
        hoursLearned: Number.isFinite(streakData.totalHours) ? Math.max(0, streakData.totalHours) : 0,
        certificates: certCount,
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
      const dateStr = localDateKey(date);

      const dayActivities = activities.filter((a: Activity) => {
        const activityDate = new Date(a.timestamp);
        return !Number.isNaN(activityDate.getTime()) && localDateKey(activityDate) === dateStr;
      });

      result.push({
        day: days[date.getDay()],
        activities: dayActivities.length,
      });
    }

    return result;
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      module_complete: '🎓',
      quiz_take: '✍️',
      bookmark_add: '🔖',
      profile_update: '👤',
      achievement_unlock: '🏆',
      streak_update: '🔥',
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

  const dismissAssessorSuggestion = () => {
    if (!assessorDismissalKey) return;
    localStorage.setItem(assessorDismissalKey, 'true');
    setAssessorDismissal({ key: assessorDismissalKey, dismissed: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {user ? `👋 Halo, ${user.name}!` : '📊 Dashboard'}
          </h1>
          <p className="text-slate-400 mt-1">Selamat datang di SIAP SKK - Platform Pelatihan Konstruksi</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Memuat data...</div>
        ) : (
          <>
            {/* SKK Jabatan banner (only for logged-in users) */}
            {user && (
              <div className={`mb-6 rounded-2xl p-5 border ${
                jabatan
                  ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-amber-500/30'
                  : 'bg-slate-800/50 border-slate-700'
              }`}>
                {jabatan ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-1">Target Sertifikasi Anda</p>
                      <p className="text-white text-lg font-bold">{jabatan.name}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-xs">{user.bidang}</span>
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full text-xs">{jabatan.level}</span>
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full text-xs">{user.kualifikasiSkk}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href="/bimtek"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-all"
                      >
                        🎓 Modul Relevan
                      </Link>
                      <Link
                        href="/profile"
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-all"
                      >
                        ✏️ Ubah
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-slate-300 font-semibold">🎯 Belum ada jabatan SKK yang dipilih</p>
                      <p className="text-slate-400 text-sm mt-1">Pilih jabatan target Anda agar kami bisa menampilkan modul yang relevan</p>
                    </div>
                    <Link
                      href="/profile"
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                    >
                      Pilih Jabatan SKK →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="mb-6">
              <LearningJourney compact />
            </div>

            {showAssessorSuggestion && (
              <div className="relative mb-6 overflow-hidden rounded-2xl border border-purple-500/35 bg-gradient-to-br from-purple-950/70 via-slate-800/80 to-blue-950/60 p-5 sm:p-6">
                <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl" />
                <button
                  onClick={dismissAssessorSuggestion}
                  className="absolute right-4 top-4 text-slate-500 transition-colors hover:text-white"
                  title="Tutup saran"
                  aria-label="Tutup saran menjadi asesor"
                >
                  ✕
                </button>
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-purple-300">
                      <span className="text-lg">🎖️</span>
                      Langkah Selanjutnya
                    </div>
                    <h2 className="text-xl font-bold text-white sm:text-2xl">
                      Pengalaman Anda bisa membuka jalur baru
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      Dengan pengalaman {skkExperienceYears} tahun memegang SKK aktif Level {user.skkCertificateLevel},
                      Anda sudah memenuhi salah satu syarat dasar untuk mulai mengeksplorasi jalur Asesor Kompetensi.
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Pastikan juga pengalaman kerja relevan minimal 5 tahun dan pelajari persyaratan LSP,
                      pelatihan ASKOM, serta langkah sertifikasinya.
                    </p>
                  </div>
                  <Link
                    href="/menjadi-asesor"
                    className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    Lihat Jalur Asesor
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Recommended categories (only when jabatan is set) */}
            {jabatan && relatedCategories.length > 0 && (
              <div className="mb-6 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
                <h2 className="text-white font-semibold mb-3">📚 Kategori BIMTEK Prioritas untuk {jabatan.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {relatedCategories.map(cat => (
                    <Link
                      key={cat}
                      href={`/bimtek?category=${encodeURIComponent(cat)}`}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-full text-sm transition-all"
                    >
                      {cat} →
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold">{stats.completedModules}</div>
                <div className="text-amber-100 text-sm">Modul Selesai</div>
                <div className="mt-2 text-xs text-amber-200">{progressPercentage}% dari {stats.totalModules} modul</div>
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

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">📈 Aktivitas Mingguan</h2>
                <div className="flex items-end justify-between h-48 gap-2">
                  {weeklyData.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg transition-all"
                        style={{ height: `${day.activities / Math.max(1, ...weeklyData.map(d => d.activities)) * 140}px` }}
                      />
                      <div className="mt-2 text-xs text-slate-400">{day.day}</div>
                      <div className="text-xs text-slate-400">{day.activities} aktivitas</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  {weeklyData.some(day => day.activities > 0)
                    ? 'Jumlah aktivitas yang tercatat, bukan estimasi jam belajar.'
                    : 'Belum ada aktivitas yang tercatat dalam tujuh hari terakhir.'}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">🎯 Progress Modules</h2>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="text-right w-full">
                      <span className="text-xs font-semibold inline-block text-amber-500">{progressPercentage}%</span>
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
                    <span className="text-slate-400">Durasi tercatat</span>
                    <span className="text-white font-medium">{stats.hoursLearned > 0 ? `${stats.hoursLearned} jam` : 'Belum tersedia'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity & Quiz */}
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
                          <div className="text-slate-400 text-xs">{new Date(quiz.takenAt).toLocaleDateString('id-ID')}</div>
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

            {/* Quick links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/bimtek" className="bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500 transition-all">
                <div className="text-3xl mb-2">🎓</div>
                <div className="text-white font-semibold">BIMTEK</div>
                <div className="text-slate-400 text-sm">
                  {jabatan ? `${relatedCategories.length} kategori relevan` : '67+ Modul'}
                </div>
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

              <Link href="/my-certificates" className="bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500 transition-all">
                <div className="text-3xl mb-2">🏅</div>
                <div className="text-white font-semibold">Sertifikat</div>
                <div className="text-slate-400 text-sm">
                  {stats.certificates > 0 ? `${stats.certificates} sertifikat` : 'Lihat sertifikat'}
                </div>
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
                    <Link href="/login" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium">Masuk</Link>
                    <Link href="/register" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium">Daftar Gratis</Link>
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
