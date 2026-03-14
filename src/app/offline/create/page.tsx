'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOfflineEvents } from '@/components/OfflineEventProvider';

const categories = ['K3', 'Sipil', 'Manajemen', 'Elektrikal', 'Arsitektur', 'Mekanikal', 'Lainnya'];

export default function CreateOfflineEventPage() {
  const router = useRouter();
  const { createEvent } = useOfflineEvents();
  const [form, setForm] = useState({
    title: '',
    description: '',
    instructorName: '',
    instructorPhone: '',
    location: '',
    city: '',
    province: '',
    date: '',
    time: '',
    duration: 8,
    capacity: 30,
    price: 1500000,
    module: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    createEvent(form);
    setTimeout(() => {
      router.push('/offline');
    }, 500);
  };

  const inputClass = "w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Buat Event Offline Baru</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Isi detail pelatihan offline yang akan Anda adakan</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Judul Event</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: Bimtek K3 Konstruksi Gedung"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Deskripsi</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Jelaskan detail pelatihan..."
              className={inputClass}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nama Instruktur</label>
              <input
                type="text"
                required
                value={form.instructorName}
                onChange={e => setForm({ ...form, instructorName: e.target.value })}
                placeholder="Nama lengkap"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">No. HP Instruktur</label>
              <input
                type="tel"
                required
                value={form.instructorPhone}
                onChange={e => setForm({ ...form, instructorPhone: e.target.value })}
                placeholder="0812-3456-7890"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Lokasi</label>
              <input
                type="text"
                required
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="Nama tempat/gedung"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kota</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                placeholder="Jakarta"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Provinsi</label>
              <input
                type="text"
                required
                value={form.province}
                onChange={e => setForm({ ...form, province: e.target.value })}
                placeholder="DKI Jakarta"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tanggal</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Jam</label>
              <input
                type="time"
                required
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Durasi (jam)</label>
              <input
                type="number"
                required
                min={1}
                max={24}
                value={form.duration}
                onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kapasitas</label>
              <input
                type="number"
                required
                min={1}
                value={form.capacity}
                onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kategori</label>
              <select
                required
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                <option value="">Pilih kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Modul</label>
              <input
                type="text"
                required
                value={form.module}
                onChange={e => setForm({ ...form, module: e.target.value })}
                placeholder="Nama modul"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Harga (Rp)</label>
              <input
                type="number"
                required
                min={0}
                value={form.price}
                onChange={e => setForm({ ...form, price: parseInt(e.target.value) })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Membuat...' : 'Buat Event'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
