'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SKKEntry {
  id: string;
  jabatan: string;
  jenjang: string;
  nomorSKK: string;
  tanggalTerbit: string; // ISO string YYYY-MM-DD
}

const jenjangOptions = [
  'Operator (L1-L3)',
  'Teknisi / Analis (L4-L6)',
  'Ahli Muda (L7)',
  'Ahli Madya (L8)',
  'Ahli Utama (L9)',
];

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function daysFromNow(target: Date): number {
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isActiveSkk(expiry: Date): boolean {
  // Keep the recommendation aligned with the status badge: an SKK expiring
  // today is still considered active until the day has passed.
  return daysFromNow(expiry) >= 0;
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

function isLevelSixOrAbove(jenjang: string): boolean {
  const level = jenjang.match(/\(L(\d+)\)/)?.[1];
  return level ? Number(level) >= 6 : false;
}

function statusBadge(days: number, label: string) {
  if (days < 0) return { label: `${label} — Terlewat`, color: 'bg-red-500/20 text-red-400 border-red-500/40', dot: 'bg-red-500' };
  if (days <= 30) return { label: `${label} — ${days} hari lagi`, color: 'bg-red-500/20 text-red-400 border-red-500/40', dot: 'bg-red-500 animate-pulse' };
  if (days <= 90) return { label: `${label} — ${days} hari lagi`, color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', dot: 'bg-amber-500' };
  return { label: `${label} — ${days} hari lagi`, color: 'bg-slate-700/50 text-slate-400 border-slate-600', dot: 'bg-slate-500' };
}

function SKKCard({ entry, onDelete }: { entry: SKKEntry; onDelete: () => void }) {
  const terbit = new Date(entry.tanggalTerbit);
  const surv1 = addMonths(terbit, 18);
  const surv2 = addMonths(terbit, 36);
  const expired = addMonths(terbit, 60);

  const daysSurv1 = daysFromNow(surv1);
  const daysSurv2 = daysFromNow(surv2);
  const daysExp = daysFromNow(expired);

  const isExpired = daysExp < 0;
  const isUrgent = daysExp >= 0 && daysExp <= 30;
  const isWarning = daysExp >= 0 && daysExp <= 90;

  const cardBorder = isExpired ? 'border-red-600/60' : isUrgent ? 'border-red-500/50' : isWarning ? 'border-amber-500/50' : 'border-slate-700';

  const overallBadge = isExpired
    ? { text: 'Sudah Kadaluarsa', bg: 'bg-red-500/20 text-red-400' }
    : isUrgent
    ? { text: `Kritis — ${daysExp} hari menuju expired`, bg: 'bg-red-500/20 text-red-400' }
    : isWarning
    ? { text: `Perhatian — ${daysExp} hari menuju expired`, bg: 'bg-amber-500/20 text-amber-400' }
    : { text: `Aktif · ${daysExp} hari tersisa`, bg: 'bg-green-500/20 text-green-400' };

  // Timeline progress
  const totalDays = 60 * 30.44; // ~5 years in days
  const elapsed = (Date.now() - terbit.getTime()) / 86400000;
  const progress = Math.min(100, (elapsed / totalDays) * 100);

  const s1Pct = (18 / 60) * 100;
  const s2Pct = (36 / 60) * 100;

  return (
    <div className={`bg-slate-800/70 border rounded-2xl p-5 ${cardBorder}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-white font-bold text-lg">{entry.jabatan}</div>
          <div className="text-slate-400 text-sm">{entry.jenjang}</div>
          {entry.nomorSKK && <div className="text-slate-500 text-xs mt-0.5">No. {entry.nomorSKK}</div>}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${overallBadge.bg}`}>
            {overallBadge.text}
          </span>
          <button onClick={onDelete} className="text-slate-600 hover:text-red-400 text-sm transition-colors" title="Hapus">✕</button>
        </div>
      </div>

      {/* Timeline bar */}
      <div className="mb-5">
        <div className="relative h-3 bg-slate-700 rounded-full overflow-visible mb-2">
          {/* Progress fill */}
          <div
            className={`absolute left-0 top-0 h-3 rounded-full transition-all ${isExpired ? 'bg-red-500' : isUrgent ? 'bg-red-400' : isWarning ? 'bg-amber-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
          {/* S1 marker */}
          <div className="absolute top-0 h-3 w-0.5 bg-blue-400" style={{ left: `${s1Pct}%` }} />
          {/* S2 marker */}
          <div className="absolute top-0 h-3 w-0.5 bg-purple-400" style={{ left: `${s2Pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Terbit</span>
          <span className="text-blue-400">Surv. 1</span>
          <span className="text-purple-400">Surv. 2</span>
          <span>Expired</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        {[
          { label: 'Terbit', date: terbit, days: null, color: 'text-slate-300' },
          { label: 'Surveillance 1', date: surv1, days: daysSurv1, color: 'text-blue-400' },
          { label: 'Surveillance 2', date: surv2, days: daysSurv2, color: 'text-purple-400' },
          { label: 'Expired / Re-sertifikasi', date: expired, days: daysExp, color: 'text-red-400' },
        ].map((m) => {
          const past = m.days !== null && m.days < 0;
          return (
            <div key={m.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={past ? 'text-slate-600 line-through' : m.color}>
                  {m.label}
                </span>
              </div>
              <div className={`text-right ${past ? 'text-slate-600' : 'text-slate-300'}`}>
                <span className="font-medium">{formatDate(m.date)}</span>
                {m.days !== null && (
                  <span className={`ml-2 text-xs ${m.days < 0 ? 'text-red-500' : m.days <= 30 ? 'text-red-400' : m.days <= 90 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {m.days < 0 ? `${Math.abs(m.days)} hari lalu` : `${m.days} hari lagi`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert if urgent */}
      {(isExpired || isUrgent) && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
          {isExpired
            ? '🔴 SKK sudah kadaluarsa. Segera hubungi LSP untuk re-sertifikasi agar SKK dapat dipulihkan.'
            : '🔴 SKK akan segera expired. Ajukan re-sertifikasi ke LSP minimal 3 bulan sebelum tanggal expired.'}
        </div>
      )}
      {!isExpired && isWarning && !isUrgent && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs">
          ⚠️ SKK mendekati expired dalam {daysExp} hari. Rencanakan re-sertifikasi segera.
        </div>
      )}
    </div>
  );
}

export default function PantauSKKPage() {
  const [entries, setEntries] = useState<SKKEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [assessorSuggestionDismissed, setAssessorSuggestionDismissed] = useState(false);
  const [jabatan, setJabatan] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [nomorSKK, setNomorSKK] = useState('');
  const [tanggalTerbit, setTanggalTerbit] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('siapskk-pantau-skk');
      if (saved) setEntries(JSON.parse(saved));
      setAssessorSuggestionDismissed(
        localStorage.getItem('siapskk-assessor-suggestion-dismissed') === 'true'
      );
    } catch {}
  }, []);

  const save = (newEntries: SKKEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('siapskk-pantau-skk', JSON.stringify(newEntries));
  };

  const addEntry = () => {
    if (!jabatan.trim() || !jenjang || !tanggalTerbit) return;
    const entry: SKKEntry = {
      id: Date.now().toString(),
      jabatan: jabatan.trim(),
      jenjang,
      nomorSKK: nomorSKK.trim(),
      tanggalTerbit,
    };
    save([...entries, entry]);
    setJabatan(''); setJenjang(''); setNomorSKK(''); setTanggalTerbit('');
    setShowForm(false);
  };

  const deleteEntry = (id: string) => save(entries.filter(e => e.id !== id));

  // Stats
  const now = Date.now();
  const expiredCount = entries.filter(e => addMonths(new Date(e.tanggalTerbit), 60).getTime() < now).length;
  const urgentCount = entries.filter(e => {
    const exp = addMonths(new Date(e.tanggalTerbit), 60);
    const d = daysFromNow(exp);
    return d >= 0 && d <= 90;
  }).length;
  const activeExperiencedSkk = entries
    .filter(entry => {
      const expiry = addMonths(new Date(entry.tanggalTerbit), 60);
      return isActiveSkk(expiry) && isLevelSixOrAbove(entry.jenjang);
    })
    .map(entry => ({ entry, years: fullYearsSince(entry.tanggalTerbit) }))
    .filter(({ years }) => years >= 2)
    .sort((a, b) => b.years - a.years)[0];

  const dismissAssessorSuggestion = () => {
    setAssessorSuggestionDismissed(true);
    localStorage.setItem('siapskk-assessor-suggestion-dismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            🗓️ Monitor SKK · Reminder Surveillance & Perpanjangan
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Pantau Masa Berlaku SKK</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Catat tanggal terbit SKK — sistem otomatis hitung kapan Surveillance (1.5 & 3 tahun) dan Expired (5 tahun)
          </p>
        </div>

        {/* Stats row */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{entries.length}</div>
              <div className="text-slate-400 text-sm">Total SKK</div>
            </div>
            <div className={`border rounded-xl p-4 text-center ${urgentCount > 0 ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-800/60 border-slate-700'}`}>
              <div className={`text-2xl font-bold ${urgentCount > 0 ? 'text-amber-400' : 'text-white'}`}>{urgentCount}</div>
              <div className="text-slate-400 text-sm">Perlu Perhatian</div>
            </div>
            <div className={`border rounded-xl p-4 text-center ${expiredCount > 0 ? 'bg-red-500/10 border-red-500/40' : 'bg-slate-800/60 border-slate-700'}`}>
              <div className={`text-2xl font-bold ${expiredCount > 0 ? 'text-red-400' : 'text-white'}`}>{expiredCount}</div>
              <div className="text-slate-400 text-sm">Kadaluarsa</div>
            </div>
          </div>
        )}

        {/* Add button */}
        <div className="flex justify-end mb-5">
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            + Tambah SKK
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-slate-800/80 border border-amber-500/40 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-bold mb-5">📋 Tambah SKK Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Jabatan SKK *</label>
                <input type="text" value={jabatan} onChange={e => setJabatan(e.target.value)}
                  placeholder="Contoh: Ahli Muda Teknik Gedung, Site Manager, Ahli K3 Konstruksi…"
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Jenjang *</label>
                <div className="flex flex-wrap gap-2">
                  {jenjangOptions.map(j => (
                    <button key={j} onClick={() => setJenjang(j)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${jenjang === j ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-slate-600 text-slate-400 hover:border-slate-400'}`}>
                      {j}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nomor SKK (opsional)</label>
                  <input type="text" value={nomorSKK} onChange={e => setNomorSKK(e.target.value)}
                    placeholder="Contoh: SKK.B.600.2.1.01.01.24"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal Terbit *</label>
                  <input type="date" value={tanggalTerbit} onChange={e => setTanggalTerbit(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none text-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-slate-600 text-slate-400 hover:text-white rounded-xl text-sm">
                Batal
              </button>
              <button onClick={addEntry} disabled={!jabatan.trim() || !jenjang || !tanggalTerbit}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium text-sm transition-colors">
                Simpan SKK
              </button>
            </div>
          </div>
        )}

        {/* Career suggestion for experienced active SKK holders */}
        {activeExperiencedSkk && !assessorSuggestionDismissed && (
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
              <div className="max-w-2xl">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-purple-300">
                  <span className="text-lg">🎖️</span>
                  Langkah Selanjutnya
                </div>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  Pengalaman Anda bisa membuka jalur baru
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Dengan pengalaman {activeExperiencedSkk.years} tahun memegang SKK aktif
                  Level 6+, Anda sudah memenuhi salah satu syarat dasar untuk mulai
                  mengeksplorasi jalur Asesor Kompetensi.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Pastikan juga pengalaman kerja relevan minimal 5 tahun dan pelajari persyaratan
                  LSP, pelatihan ASKOM, serta langkah sertifikasinya.
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

        {/* Empty state */}
        {entries.length === 0 && !showForm && (
          <div className="text-center py-20 bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-white font-semibold mb-1">Belum ada SKK yang dipantau</p>
            <p className="text-slate-400 text-sm mb-6">Tambahkan SKK yang kamu miliki untuk memantau masa berlaku dan jadwal surveillance.</p>
            <button onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium">
              + Tambah SKK Pertama
            </button>
          </div>
        )}

        {/* SKK Cards */}
        <div className="space-y-5">
          {entries.map(e => (
            <SKKCard key={e.id} entry={e} onDelete={() => deleteEntry(e.id)} />
          ))}
        </div>

        {/* Info box */}
        {entries.length > 0 && (
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm text-blue-300">
            <div className="font-medium mb-2">📌 Ketentuan Masa Berlaku SKK (Permen PUPR No. 9/2023)</div>
            <ul className="space-y-1 text-slate-400 text-xs">
              <li>• SKK berlaku <strong className="text-blue-300">5 tahun</strong> sejak tanggal terbit</li>
              <li>• Surveillance wajib dilaksanakan pada <strong className="text-blue-300">tahun ke-1.5 (18 bulan)</strong> dan <strong className="text-blue-300">tahun ke-3 (36 bulan)</strong></li>
              <li>• Pengajuan re-sertifikasi dianjurkan <strong className="text-blue-300">minimal 3 bulan</strong> sebelum tanggal expired</li>
              <li>• Data tersimpan di perangkat ini saja (localStorage) — tidak dikirim ke server</li>
            </ul>
          </div>
        )}

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <a href="/skk-coach/chat?agent=perpanjangan" className="px-4 py-2 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-400 rounded-xl text-sm transition-colors">
            ♻️ Panduan Perpanjangan
          </a>
          <a href="/skk-coach/chat?agent=dokumen" className="px-4 py-2 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-400 rounded-xl text-sm transition-colors">
            📄 Checklist Dokumen Re-sertifikasi
          </a>
          <a href="/klinik-uji-kompetensi" className="px-4 py-2 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-400 rounded-xl text-sm transition-colors">
            🏥 Klinik Uji Kompetensi
          </a>
        </div>
      </div>
    </div>
  );
}
