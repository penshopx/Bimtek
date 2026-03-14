'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOfflineEvents } from '@/components/OfflineEventProvider';

export default function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { events, updateEvent, deleteEvent, markAttendance, completeEvent, cancelRegistration } = useOfflineEvents();
  const [activeTab, setActiveTab] = useState<'details' | 'participants'>('details');

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

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      deleteEvent(event.id);
      router.push('/offline');
    }
  };

  const handleComplete = () => {
    if (confirm('Tandai event sebagai selesai? Sertifikat akan otomatis diberikan ke peserta yang hadir.')) {
      completeEvent(event.id);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Link href={`/offline/${event.id}`} className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-amber-500 mb-6">
          ← Kembali ke detail event
        </Link>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola: {event.title}</h1>
            <p className="text-slate-600 dark:text-slate-400">{event.city} • {formatDate(event.date)}</p>
          </div>
          <div className="flex gap-3">
            {event.status === 'open' && (
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
              >
                Selesai & Beri Sertifikat
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
            >
              Hapus Event
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-4 font-medium ${activeTab === 'details' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              Detail Event
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-6 py-4 font-medium ${activeTab === 'participants' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              Peserta ({event.participants.length})
            </button>
          </div>

          {activeTab === 'details' && (
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Lokasi</label>
                    <div className="font-medium text-slate-900 dark:text-white">{event.location}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Kota & Provinsi</label>
                    <div className="font-medium text-slate-900 dark:text-white">{event.city}, {event.province}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Tanggal & Waktu</label>
                    <div className="font-medium text-slate-900 dark:text-white">{formatDate(event.date)} • {event.time}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Instruktur</label>
                    <div className="font-medium text-slate-900 dark:text-white">{event.instructorName}</div>
                    <div className="text-sm text-slate-500">{event.instructorPhone}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-500 dark:text-slate-400">Kapasitas</label>
                    <div className="font-medium text-slate-900 dark:text-white">{event.registered} / {event.capacity}</div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-1">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(event.registered / event.capacity) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="p-6">
              {event.participants.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <div className="text-4xl mb-2">👥</div>
                  <p>Belum ada peserta terdaftar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {event.participants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{participant.name}</div>
                        <div className="text-sm text-slate-500">{participant.email} • {participant.phone}</div>
                        <div className="text-sm text-slate-500">{participant.company}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          participant.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          participant.status === 'attended' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {participant.status === 'completed' ? 'Selesai' : participant.status === 'attended' ? 'Hadir' : 'Terdaftar'}
                        </span>
                        {participant.status === 'registered' && (
                          <button
                            onClick={() => markAttendance(event.id, participant.id)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                          >
                            Tandai Hadir
                          </button>
                        )}
                        {participant.status === 'registered' && (
                          <button
                            onClick={() => cancelRegistration(event.id, participant.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
