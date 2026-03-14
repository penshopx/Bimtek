'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOfflineEvents, OfflineEvent } from '@/components/OfflineEventProvider';

const statusColors = {
  open: 'bg-green-500',
  full: 'bg-red-500',
  ongoing: 'bg-blue-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-gray-300',
};

const statusLabels = {
  open: 'Terbuka',
  full: 'Penuh',
  ongoing: 'Sedang Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { events, registerForEvent } = useOfflineEvents();
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [registered, setRegistered] = useState(false);

  const event = events.find(e => e.id === resolvedParams.id);

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Event tidak ditemukan</h2>
          <Link href="/offline" className="text-amber-500 hover:underline">Kembali ke daftar</Link>
        </div>
      </div>
    );
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const success = registerForEvent(event.id, form);
    if (success) {
      setRegistered(true);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isOpen = event.status === 'open' || event.status === 'full';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/offline" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-amber-500 mb-6">
          ← Kembali ke daftar
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-3">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium text-white ${statusColors[event.status]}`}>
                  {statusLabels[event.status]}
                </span>
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {event.category}
                </span>
              </div>
              {event.status === 'open' && (
                <Link href={`/offline/${event.id}/manage`} className="text-amber-500 hover:underline text-sm">
                  Kelola Event →
                </Link>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{event.title}</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">{event.description}</p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Detail Event</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <span className="text-xl">📍</span>
                    <div>
                      <div className="font-medium">{event.location}</div>
                      <div className="text-sm text-slate-500">{event.city}, {event.province}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <span className="text-xl">📅</span>
                    <div>
                      <div className="font-medium">{formatDate(event.date)}</div>
                      <div className="text-sm text-slate-500">{event.time} • {event.duration} jam</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <span className="text-xl">📚</span>
                    <div>
                      <div className="font-medium">{event.module}</div>
                      <div className="text-sm text-slate-500">Modul pelatihan</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Instruktur</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center text-2xl">👨‍🏫</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{event.instructorName}</div>
                    <div className="text-slate-500 dark:text-slate-400">{event.instructorPhone}</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Kapasitas</span>
                    <span className="font-medium text-slate-900 dark:text-white">{event.registered} / {event.capacity}</span>
                  </div>
                  <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-3xl font-bold text-amber-600">{formatPrice(event.price)}</div>
                  <div className="text-sm text-slate-500">per peserta</div>
                </div>
              </div>
            </div>

            {isOpen && !registered && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                {showRegister ? (
                  <form onSubmit={handleRegister} className="max-w-md">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-4">Daftar Sekarang</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">No. HP</label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={e => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Perusahaan</label>
                        <input
                          type="text"
                          required
                          value={form.company}
                          onChange={e => setForm({ ...form, company: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Konfirmasi Daftar
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRegister(false)}
                          className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowRegister(true)}
                    disabled={event.status === 'full'}
                    className="px-8 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-lg transition-colors"
                  >
                    {event.status === 'full' ? 'Kuota Penuh' : 'Daftar Sekarang'}
                  </button>
                )}
              </div>
            )}

            {registered && (
              <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-semibold">Berhasil Mendaftar!</div>
                    <div className="text-sm">Anda akan menerima konfirmasi melalui email</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
