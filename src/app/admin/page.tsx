'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

interface AdminStats {
  users: number;
  events: number;
  certificates: number;
  progress: number;
  quizAttempts: number;
  activities: number;
}

interface AdminEvent {
  id: string;
  title: string;
  city: string;
  date: string;
  status: string;
  registered: number;
  capacity: number;
  participantCount: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'events' | 'activities'>('dashboard');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, eventsRes, activitiesRes] = await Promise.all([
        fetch('/api/admin?action=stats'),
        fetch('/api/admin?action=allUsers'),
        fetch('/api/admin?action=allEvents'),
        fetch('/api/admin?action=allActivities'),
      ]);
      
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const eventsData = await eventsRes.json();
      const activitiesData = await activitiesRes.json();
      
      setStats(statsData.stats);
      setUsers(usersData.users || []);
      setEvents(eventsData.events || []);
      setActivities(activitiesData.activities || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateRole = async (userId: string, role: string) => {
    await fetch('/api/auth?action=updateUserRole', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    loadData();
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Yakin hapus user ini? Semua datanya akan hilang.')) {
      await fetch('/api/auth?action=deleteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      loadData();
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (confirm('Yakin hapus event ini?')) {
      await fetch('/api/admin?action=deleteEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      loadData();
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Akses Ditolak</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Halaman ini hanya untuk admin</p>
          <Link href="/dashboard" className="text-amber-500 hover:underline">Kembali ke Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Kelola semua aspek sistem</p>
          </div>
          <Link href="/dashboard" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
            ← Dashboard
          </Link>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto">
          {(['dashboard', 'users', 'events', 'activities'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tab === 'dashboard' && '📊 Dashboard'}
              {tab === 'users' && `👥 Pengguna (${stats?.users || 0})`}
              {tab === 'events' && `📍 Events (${stats?.events || 0})`}
              {tab === 'activities' && `📝 Aktivitas`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat data...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-amber-500">{stats.users}</div>
                  <div className="text-sm text-slate-500">Total Pengguna</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-blue-500">{stats.events}</div>
                  <div className="text-sm text-slate-500">Total Events</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-green-500">{stats.certificates}</div>
                  <div className="text-sm text-slate-500">Sertifikat</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-purple-500">{stats.progress}</div>
                  <div className="text-sm text-slate-500">Progress Modules</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-red-500">{stats.quizAttempts}</div>
                  <div className="text-sm text-slate-500">Quiz Attempts</div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-cyan-500">{stats.activities}</div>
                  <div className="text-sm text-slate-500">Aktivitas</div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Pengguna</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Perusahaan</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Bergabung</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Belum ada pengguna</td>
                        </tr>
                      ) : users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center text-amber-600 font-bold">
                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="font-medium text-slate-900 dark:text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{u.company || '-'}</td>
                          <td className="px-6 py-4">
                            <select
                              value={u.role}
                              onChange={(e) => updateRole(u.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                u.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                u.role === 'instructor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              }`}
                            >
                              <option value="user">User</option>
                              <option value="instructor">Instructor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                            {new Date(u.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Event</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Lokasi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Tanggal</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Peserta</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {events.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Belum ada event</td>
                        </tr>
                      ) : events.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-6 py-4">
                            <span className="font-medium text-slate-900 dark:text-white">{e.title}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{e.city}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {new Date(e.date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              e.status === 'open' ? 'bg-green-100 text-green-700' :
                              e.status === 'full' ? 'bg-red-100 text-red-700' :
                              e.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {e.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {e.registered}/{e.capacity}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteEvent(e.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Waktu</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Tipe</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Judul</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Deskripsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {activities.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada aktivitas</td>
                        </tr>
                      ) : activities.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                            {new Date(a.timestamp).toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-600 text-xs rounded">
                              {a.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-900 dark:text-white">{a.title}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{a.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
