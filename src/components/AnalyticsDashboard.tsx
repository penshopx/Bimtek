'use client';

import { useState, useEffect } from 'react';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  totalRegistrations: number;
  certificatesIssued: number;
  modulesCompleted: number;
  quizAttempts: number;
  avgQuizScore: number;
}

interface ChartData {
  label: string;
  value: number;
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    certificatesIssued: 0,
    modulesCompleted: 0,
    quizAttempts: 0,
    avgQuizScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [usersRes, eventsRes, certsRes, progressRes, quizRes] = await Promise.all([
        fetch('/api/admin?action=allUsers'),
        fetch('/api/admin?action=allEvents'),
        fetch('/api/admin?action=allCertificates'),
        fetch('/api/admin?action=allProgress'),
        fetch('/api/admin?action=allQuizScores'),
      ]);

      const usersData = await usersRes.json();
      const eventsData = await eventsRes.json();
      const certsData = await certsRes.json();
      const progressData = await progressRes.json();
      const quizData = await quizRes.json();

      const users = usersData.users || [];
      const events = eventsData.events || [];
      const certs = certsData.certificates || [];
      const progress = progressData.progress || [];
      const quizScores = quizData.quizScores || [];

      const avgScore = quizScores.length > 0 
        ? Math.round(quizScores.reduce((acc: number, q: any) => acc + (q.score / q.totalQuestions * 100), 0) / quizScores.length)
        : 0;

      const activeLast30 = users.filter((u: any) => {
        const created = new Date(u.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return created > thirtyDaysAgo;
      }).length;

      setStats({
        totalUsers: users.length,
        activeUsers: activeLast30,
        totalEvents: events.length,
        totalRegistrations: events.reduce((acc: number, e: any) => acc + (e.registered || 0), 0),
        certificatesIssued: certs.length,
        modulesCompleted: progress.length,
        quizAttempts: quizScores.length,
        avgQuizScore: avgScore,
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Memuat analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Pengguna" value={stats.totalUsers} color="bg-blue-100 dark:bg-blue-900" />
        <StatCard icon="📈" label="Aktif (30 hari)" value={stats.activeUsers} color="bg-green-100 dark:bg-green-900" />
        <StatCard icon="📍" label="Total Events" value={stats.totalEvents} color="bg-purple-100 dark:bg-purple-900" />
        <StatCard icon="📝" label="Registrasi" value={stats.totalRegistrations} color="bg-amber-100 dark:bg-amber-900" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="📜" label="Sertifikat" value={stats.certificatesIssued} color="bg-emerald-100 dark:bg-emerald-900" />
        <StatCard icon="🎓" label="Modul Selesai" value={stats.modulesCompleted} color="bg-cyan-100 dark:bg-cyan-900" />
        <StatCard icon="✍️" label="Quiz Attempts" value={stats.quizAttempts} color="bg-pink-100 dark:bg-pink-900" />
        <StatCard icon="📊" label="Rata-rata Quiz" value={`${stats.avgQuizScore}%`} color="bg-orange-100 dark:bg-orange-900" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">📊 Distribusi Pengguna</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">User Biasa</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '70%' }} />
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">70%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Instructor</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '20%' }} />
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">20%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Admin</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: '10%' }} />
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">10%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">🎯 Status Events</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Open</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '50%' }} />
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">50%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Full</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: '25%' }} />
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">25%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Completed</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-500" style={{ width: '25%' }} />
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
