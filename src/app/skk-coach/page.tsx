'use client';

import Link from 'next/link';

const agents = [
  {
    id: 'kelayakan',
    icon: '🔍',
    name: 'Cek Kelayakan SKK',
    desc: 'Analisis kelayakan jabatan & jenjang KKNI L1-9 berdasarkan pendidikan dan pengalamanmu',
    color: 'blue',
  },
  {
    id: 'perpanjangan',
    icon: '♻️',
    name: 'Perpanjangan SKK',
    desc: 'Panduan surveillance 1.5 tahunan dan re-sertifikasi 3 tahunan agar SKK tetap valid',
    color: 'green',
  },
  {
    id: 'sbu',
    icon: '🔗',
    name: 'SKK–SBU Link',
    desc: 'Ketergantungan SKK personil untuk penerbitan dan pemeliharaan SBU perusahaan (BUJK)',
    color: 'purple',
  },
  {
    id: 'dokumen',
    icon: '📄',
    name: 'Dokumen SKK',
    desc: 'Checklist dokumen lengkap per skema jabatan: FR.APL.01, FR.APL.02, bukti pengalaman, dll',
    color: 'amber',
  },
  {
    id: 'jabatan',
    icon: '🎓',
    name: 'Jabatan & Skema',
    desc: 'Pemetaan 200+ jabatan kerja, unit kompetensi SKKNI, dan jalur karir per bidang',
    color: 'cyan',
  },
];

const colorMap: Record<string, { card: string; badge: string }> = {
  blue:   { card: 'border-blue-500/40 hover:border-blue-400 hover:bg-blue-500/10',   badge: 'bg-blue-500/20 text-blue-300' },
  green:  { card: 'border-green-500/40 hover:border-green-400 hover:bg-green-500/10', badge: 'bg-green-500/20 text-green-300' },
  purple: { card: 'border-purple-500/40 hover:border-purple-400 hover:bg-purple-500/10', badge: 'bg-purple-500/20 text-purple-300' },
  amber:  { card: 'border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10', badge: 'bg-amber-500/20 text-amber-300' },
  cyan:   { card: 'border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/10',   badge: 'bg-cyan-500/20 text-cyan-300' },
};

const stats = [
  { value: '5', label: 'Agen Spesialis' },
  { value: '200+', label: 'Jabatan Kerja' },
  { value: 'KKNI L9', label: 'Jenjang Tertinggi' },
  { value: '24/7', label: 'Selalu Aktif' },
];

export default function SKKCoachPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-5">
            5 Agen Spesialis · Permen PUPR 9/2023 & SK Dirjen 114
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Panduan SKK.<br/>
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Cepat. Tepat.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Platform panduan SKK Konstruksi bertenaga AI dengan 5 agen spesialis — dari cek kelayakan,
            dokumen, hingga monitoring perpanjangan. Berdasarkan regulasi terkini.
          </p>
          <Link
            href="/skk-coach/chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-amber-500/25"
          >
            💬 Mulai Konsultasi SKK
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {stats.map(s => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 text-center">
              <div className="text-2xl font-bold text-amber-400 mb-1">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 5 Agents */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-white text-center mb-2">5 Agen Spesialis SKK</h2>
          <p className="text-slate-400 text-center mb-8">Bekerja paralel untuk menjawab kebutuhan sertifikasi kompetensimu</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(a => (
              <Link
                key={a.id}
                href={`/skk-coach/chat?agent=${a.id}`}
                className={`p-5 rounded-xl border bg-slate-800/40 transition-all ${colorMap[a.color].card}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{a.icon}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorMap[a.color].badge}`}>
                    Agen
                  </span>
                </div>
                <div className="font-semibold text-white mb-1">{a.name}</div>
                <div className="text-slate-400 text-sm leading-relaxed">{a.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Why section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-10">
          <h2 className="text-xl font-bold text-white text-center mb-6">Mengapa SKK Coach AI?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: '📜', title: 'Permen PUPR 9/2023 & SK Dirjen 114', desc: 'Panduan berbasis regulasi terkini sebagai acuan teknis jabatan kerja SKK.' },
              { icon: '🔍', title: 'Cek Kelayakan & Gap Analysis', desc: 'Input pendidikan dan pengalaman — agen tentukan jabatan cocok dan gap yang perlu ditutup.' },
              { icon: '📋', title: 'Checklist Dokumen Otomatis', desc: 'Dokumen persyaratan dihasilkan berdasarkan skema SKK yang dipilih per jabatan.' },
              { icon: '♻️', title: 'Monitor Perpanjangan & Surveillance', desc: 'Pantau masa berlaku SKK, jadwal surveillance, dan alur re-sertifikasi 3 tahunan.' },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <div className="font-semibold text-white mb-1">{item.title}</div>
                  <div className="text-slate-400 text-sm">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/skk-coach/chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors"
          >
            💬 Buka SKK Coach Chat
          </Link>
          <p className="text-slate-500 text-xs mt-4">
            ⚠️ SKK Coach AI bersifat panduan — proses resmi melalui LSP berlisensi BNSP dan LPJK.
          </p>
        </div>
      </div>
    </div>
  );
}
