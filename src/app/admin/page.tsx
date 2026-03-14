'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  position?: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'settings'>('users');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth?action=getAllUsers', { method: 'POST' });
      const data = await res.json();
      setUsers(data.users || []);
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
    fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Yakin hapus user ini?')) {
      await fetch('/api/auth?action=deleteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      fetchUsers();
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
            <p className="text-slate-600 dark:text-slate-400">Kelola pengguna dan sistem</p>
          </div>
          <Link href="/dashboard" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
            ← Dashboard
          </Link>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'users' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
          >
            👥 Pengguna ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'events' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
          >
            📍 Events
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'settings' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
          >
            ⚙️ Pengaturan
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Nama</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Perusahaan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Bergabung</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Memuat...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Belum ada pengguna</td>
                    </tr>
                  ) : users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center text-amber-600 font-bold">
                            {u.name.charAt(0).toUpperCase()}
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Kelola Events</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Manajemen event offline</p>
            <Link href="/offline" className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg">
              Buka Manajemen Events
            </Link>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Pengaturan Sistem</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Mode Maintenance</div>
                  <div className="text-sm text-slate-500">Nonaktifkan akses sementara</div>
                </div>
                <button className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-lg text-sm">
                  Nonaktif
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Registrasi User</div>
                  <div className="text-sm text-slate-500">Izinkan pendaftaran baru</div>
                </div>
                <button className="px-4 py-2 bg-green-500 rounded-lg text-sm text-white">
                  Aktif
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Total Pengguna</div>
                  <div className="text-sm text-slate-500">{users.length}用户 terdaftar</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
