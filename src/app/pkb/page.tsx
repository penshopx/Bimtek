'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

const ACTIVITY_TYPES = [
  { value: 'pelatihan', label: 'Pelatihan', icon: '🎓', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { value: 'seminar', label: 'Seminar', icon: '🎤', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { value: 'workshop', label: 'Workshop', icon: '🛠️', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  { value: 'publikasi', label: 'Publikasi', icon: '📰', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { value: 'pengabdian', label: 'Pengabdian Masyarakat', icon: '🤝', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' },
] as const;

type ActivityType = typeof ACTIVITY_TYPES[number]['value'];

interface PKBActivity {
  id: string;
  type: ActivityType;
  title: string;
  date: string;
  organizer: string;
  points: number;
  description?: string;
  createdAt: string;
}

const RENEWAL_TARGET = 80; // typical SKP target for 5-year renewal

const typeInfo = (type: string) =>
  ACTIVITY_TYPES.find((t) => t.value === type) ?? ACTIVITY_TYPES[0];

const emptyForm = {
  type: 'pelatihan' as ActivityType,
  title: '',
  date: '',
  organizer: '',
  points: '',
  description: '',
};

export default function PKBPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [activities, setActivities] = useState<PKBActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;

  const fetchActivities = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch('/api/pkb', {
        headers: { 'x-session-id': sessionId },
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchActivities();
  }, [user, isLoading, fetchActivities, router]);

  const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);
  const progressPercent = Math.min(100, Math.round((totalPoints / RENEWAL_TARGET) * 100));

  const filtered =
    filterType === 'all' ? activities : activities.filter((a) => a.type === filterType);

  const pointsByType = ACTIVITY_TYPES.map((t) => ({
    ...t,
    total: activities.filter((a) => a.type === t.value).reduce((s, a) => s + a.points, 0),
  }));

  function openAdd() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
  }

  function openEdit(activity: PKBActivity) {
    setForm({
      type: activity.type,
      title: activity.title,
      date: activity.date,
      organizer: activity.organizer,
      points: String(activity.points),
      description: activity.description || '',
    });
    setEditingId(activity.id);
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId) return;
    setSaving(true);
    setError('');

    const payload = {
      action: editingId ? 'update' : 'add',
      ...(editingId ? { id: editingId } : {}),
      type: form.type,
      title: form.title.trim(),
      date: form.date,
      organizer: form.organizer.trim(),
      points: Number(form.points),
      description: form.description.trim() || undefined,
    };

    try {
      const res = await fetch('/api/pkb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan');
      } else {
        setShowForm(false);
        setEditingId(null);
        await fetchActivities();
      }
    } catch {
      setError('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!sessionId) return;
    try {
      const res = await fetch('/api/pkb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify({ action: 'delete', id }),
      });
      if (res.ok) {
        setDeleteConfirm(null);
        await fetchActivities();
      }
    } catch {
      setError('Gagal menghapus');
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
              📈 Tracker PKB
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Pengembangan Keprofesian Berkelanjutan — catat aktivitas &amp; pantau poin SKP
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <span className="text-lg">+</span>
            Tambah Aktivitas
          </button>
        </div>

        {/* Progress card */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">Total Poin SKP</p>
              <p className="text-5xl font-bold">{totalPoints}</p>
              <p className="text-amber-100 text-sm mt-1">
                dari target {RENEWAL_TARGET} SKP untuk perpanjangan
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-amber-100 text-sm font-medium mb-2">{progressPercent}% tercapai</p>
              <div className="w-full sm:w-48 h-3 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-amber-100 text-sm mt-2">
                {Math.max(0, RENEWAL_TARGET - totalPoints)} SKP lagi untuk lulus
              </p>
            </div>
          </div>
        </div>

        {/* Points by type */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {pointsByType.map((t) => (
            <div key={t.value} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">{t.total}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filterType === 'all'
                ? 'bg-amber-500 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Semua ({activities.length})
          </button>
          {ACTIVITY_TYPES.map((t) => {
            const count = activities.filter((a) => a.type === t.value).length;
            return (
              <button
                key={t.value}
                onClick={() => setFilterType(t.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterType === t.value
                    ? 'bg-amber-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {t.icon} {t.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Activity list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              {activities.length === 0 ? 'Belum ada aktivitas PKB' : 'Tidak ada aktivitas untuk filter ini'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {activities.length === 0
                ? 'Mulai catat pelatihan, seminar, atau workshop yang telah Anda ikuti'
                : 'Coba pilih filter lain'}
            </p>
            {activities.length === 0 && (
              <button
                onClick={openAdd}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
              >
                + Tambah Aktivitas Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((activity) => {
              const info = typeInfo(activity.type);
              return (
                <div
                  key={activity.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${info.color}`}>
                      {info.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800 dark:text-white truncate">{activity.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${info.color}`}>
                          {info.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        🏢 {activity.organizer}
                      </p>
                      <p className="text-sm text-slate-400 dark:text-slate-500">
                        📅 {new Date(activity.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-amber-500">+{activity.points}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mb-3">SKP</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(activity)}
                          className="px-3 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-amber-500 border border-slate-200 dark:border-slate-600 hover:border-amber-500 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(activity.id)}
                          className="px-3 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-red-500 border border-slate-200 dark:border-slate-600 hover:border-red-500 rounded-lg transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingId ? '✏️ Edit Aktivitas' : '➕ Tambah Aktivitas PKB'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Jenis Aktivitas <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ACTIVITY_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.value })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                          form.type === t.value
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                            : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Judul / Nama Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="mis. Pelatihan Manajemen Proyek Konstruksi"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                {/* Date & Points row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Poin SKP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={999}
                      value={form.points}
                      onChange={(e) => setForm({ ...form, points: e.target.value })}
                      placeholder="mis. 10"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    />
                  </div>
                </div>

                {/* Organizer */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Penyelenggara <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.organizer}
                    onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                    placeholder="mis. LPJK Jawa Barat"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Keterangan <span className="text-slate-400 text-xs">(opsional)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Catatan tambahan, nomor sertifikat, dll."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium transition-colors text-sm"
                  >
                    {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Aktivitas'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">🗑️</div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Hapus Aktivitas?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Poin SKP dari aktivitas ini akan dihapus dari total Anda.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors text-sm"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
