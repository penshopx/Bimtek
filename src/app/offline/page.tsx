'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOfflineEvents } from '@/components/OfflineEventProvider';

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

export default function OfflinePage() {
  const { events } = useOfflineEvents();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const cities = [...new Set(events.map(e => e.city))];
  const categories = [...new Set(events.map(e => e.category))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase()) ||
      event.instructorName.toLowerCase().includes(search.toLowerCase());
    const matchesCity = !cityFilter || event.city === cityFilter;
    const matchesCategory = !categoryFilter || event.category === categoryFilter;
    return matchesSearch && matchesCity && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bimtek Offline</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Temukan pelatihan offline di kota Anda</p>
          </div>
          <Link
            href="/offline/create"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>➕</span> Buat Event
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Cari event, lokasi, atau instruktur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Semua Kota</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <Link key={event.id} href={`/offline/${event.id}`}>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[event.status]}`}>
                      {statusLabels[event.status]}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{event.category}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{event.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span>📍</span> {event.location}, {event.city}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span>📅</span> {formatDate(event.date)} • {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span>👨‍🏫</span> {event.instructorName}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-lg font-bold text-amber-600">{formatPrice(event.price)}</span>
                    <span className="text-sm text-slate-500">{event.registered}/{event.capacity} terdaftar</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Tidak ada event ditemukan</h3>
            <p className="text-slate-600 dark:text-slate-400">Coba ubah filter atau buat event baru</p>
          </div>
        )}
      </div>
    </div>
  );
}
