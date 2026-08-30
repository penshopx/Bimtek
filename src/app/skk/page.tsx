'use client';

import { useState } from 'react';
import Link from 'next/link';

const personas = [
  { id: 'asesi', label: '👨‍🎓 Asesi', desc: 'Profesional yang akan atau sedang disertifikasi' },
  { id: 'asesor', label: '👨‍⚖️ Asesor', desc: 'Asesor kompetensi BNSP/LPJK' },
  { id: 'lsp', label: '🏢 LSP / TUK', desc: 'Lembaga Sertifikasi Profesi dan Tempat Uji Kompetensi' },
  { id: 'perusahaan', label: '🏗️ Perusahaan', desc: 'Badan usaha jasa konstruksi (BUJK)' },
];

const tools: Record<string, { icon: string; name: string; desc: string; href: string }[]> = {
  asesi: [
    { icon: '🧠', name: 'Diagnostik Kompetensi', desc: 'Analisis gap KKNI dari profil pendidikan & pengalaman', href: '/diagnostik-kompetensi' },
    { icon: '🔍', name: 'Cek Kelayakan SKK', desc: 'Jabatan SKK mana yang bisa diambil sekarang', href: '/skk-coach/chat?agent=kelayakan' },
    { icon: '📋', name: 'Cari Jabatan SKK', desc: '67+ jabatan dengan persyaratan lengkap', href: '/sertifikasi' },
    { icon: '📄', name: 'Checklist Dokumen', desc: 'FR.APL.01, FR.APL.02, dan dokumen pendukung per jabatan', href: '/skk-coach/chat?agent=dokumen' },
    { icon: '💰', name: 'Kalkulator Biaya SKK', desc: 'Estimasi biaya pelatihan, asesmen, dan dokumen per jabatan & wilayah', href: '/biaya-skk' },
    { icon: '📅', name: 'Panduan Hari-H Asesmen', desc: 'Checklist interaktif + timeline ujian untuk Hardcopy, Paperless & AJJ', href: '/hari-h' },
    { icon: '📆', name: 'Rencana Belajar SKK', desc: 'Jadwal belajar per minggu otomatis + progress tracker per unit kompetensi', href: '/rencana-belajar' },
    { icon: '📖', name: 'Glosarium SKK', desc: '55+ singkatan & istilah teknis sertifikasi konstruksi yang bisa dicari', href: '/glosarium' },
    { icon: '❓', name: 'FAQ SKK', desc: '36 pertanyaan paling umum tentang persyaratan, pendaftaran, asesmen & biaya', href: '/faq-skk' },
    { icon: '🏆', name: 'Tips Lolos Asesmen', desc: 'Strategi per bagian asesmen: portofolio, wawancara, tes tertulis, hari-H & mental', href: '/tips-lolos' },
    { icon: '📡', name: 'Panduan AJJ', desc: 'Setup teknis, dokumen digital, protokol hari-H, troubleshooting & aturan AJJ', href: '/panduan-ajj' },
    { icon: 'RPL', name: 'Panduan RPL', desc: 'Jalur pengakuan pengalaman untuk mengajukan SKK tanpa bergantung pada ijazah formal', href: '/panduan-rpl' },
    { icon: '🎖️', name: 'Menjadi Asesor Kompetensi', desc: 'Langkah, syarat, peran & FAQ untuk pemegang SKK yang ingin jadi asesor BNSP', href: '/menjadi-asesor' },
    { icon: '🧭', name: 'SIAP Index', desc: 'Self-assessment 8 dimensi kesiapan → SIAP Index 0–100 + rekomendasi prioritas', href: '/siap-index' },
    { icon: '🗺️', name: 'Timeline Proses SKK', desc: 'Peta perjalanan 8 tahap dari persiapan hingga terima sertifikat + dokumen & biaya per fase', href: '/timeline-skk' },
    { icon: '🎯', name: 'Peta Karir KKNI', desc: 'Jenjang Level 1–9 konstruksi: jabatan, gaji, skala proyek, dan langkah naik level berikutnya', href: '/karir-skk' },
    { icon: '🏛️', name: 'Direktori LSP', desc: '17+ LSP konstruksi terverifikasi BNSP — filter wilayah, bidang & jabatan, plus tips memilih LSP', href: '/direktori-lsp' },
    { icon: '🤝', name: 'Komunitas & Asosiasi', desc: '14 asosiasi profesi konstruksi diakui LPJK — manfaat keanggotaan, LSP afiliasi & CPE perpanjangan SKK', href: '/komunitas-skk' },
    { icon: '🏛️', name: 'SIAP CERTIFY — Jasa Pengurusan SKK', desc: 'Pendampingan administrasi sertifikasi: kelayakan, dokumen, pengajuan, monitoring & persiapan ujikom dalam satu perjalanan', href: '/siap-certify' },
    { icon: '🎯', name: 'Mock Asesmen SKK', desc: 'Simulasi 5 soal AI berbasis SKKNI per domain', href: '/mock-asesmen' },
    { icon: '🏥', name: 'Klinik Uji Kompetensi', desc: 'Jalur lengkap: Dialog → Blueprint → Chatbot → Ujian', href: '/klinik-uji-kompetensi' },
    { icon: '💬', name: 'SKK Coach AI', desc: '5 agen spesialis: kelayakan, dokumen, jabatan, perpanjangan, SBU', href: '/skk-coach' },
    { icon: '♻️', name: 'Perpanjangan SKK', desc: 'Panduan surveillance dan re-sertifikasi', href: '/skk-coach/chat?agent=perpanjangan' },
  ],
  asesor: [
    { icon: '🎓', name: 'Peta Jabatan & Skema', desc: 'Unit kompetensi SKKNI per jabatan kerja', href: '/skk-coach/chat?agent=jabatan' },
    { icon: '📋', name: 'Database Jabatan SKK', desc: '67+ jabatan dengan kode dan subklasifikasi', href: '/sertifikasi' },
    { icon: '🧠', name: 'Diagnostik Kandidat', desc: 'Bantu asesi analisis gap kompetensi', href: '/diagnostik-kompetensi' },
    { icon: '🎯', name: 'Bank Soal SKKNI', desc: 'Generate soal latihan per domain dan level', href: '/mock-asesmen' },
    { icon: '📚', name: 'Knowledge Base Regulasi', desc: 'Permen PU 6/2025, KM 713, SK DJBK 114, dll', href: '/knowledge-base' },
    { icon: '💬', name: 'Expert AI Chat', desc: 'Konsultasi teknis dengan AI konstruksi', href: '/chat' },
  ],
  lsp: [
    { icon: '🔗', name: 'SKK–SBU Link', desc: 'Ketergantungan SKK untuk izin BUJK dan SBU', href: '/skk-coach/chat?agent=sbu' },
    { icon: '📋', name: 'Database Jabatan SKK', desc: '67+ jabatan termasuk Manajemen Pelaksanaan', href: '/sertifikasi' },
    { icon: '📚', name: 'Knowledge Base SKK', desc: 'Regulasi: Permen PU 6/2025, KM 713, SK 114', href: '/knowledge-base' },
    { icon: '🎯', name: 'Simulasi Asesmen', desc: 'Bank soal AI untuk materi TUK', href: '/mock-asesmen' },
    { icon: '📅', name: 'Event BIMTEK Offline', desc: 'Kelola event pelatihan pra-sertifikasi', href: '/offline' },
    { icon: '💬', name: 'SKK Coach', desc: '5 agen spesialis untuk panduan sertifikasi', href: '/skk-coach' },
  ],
  perusahaan: [
    { icon: '🔗', name: 'SKK–SBU Link', desc: 'SKK wajib per subklasifikasi untuk mempertahankan SBU', href: '/skk-coach/chat?agent=sbu' },
    { icon: '🔍', name: 'Cek Kelayakan Personil', desc: 'Analisis kelayakan SKK tim teknis perusahaan', href: '/skk-coach/chat?agent=kelayakan' },
    { icon: '♻️', name: 'Monitor Perpanjangan', desc: 'Panduan surveillance dan re-sertifikasi seluruh personil', href: '/skk-coach/chat?agent=perpanjangan' },
    { icon: '📅', name: 'Event BIMTEK', desc: 'Daftarkan tim ke pelatihan pra-sertifikasi', href: '/offline' },
    { icon: '🧠', name: 'Diagnostik Tim', desc: 'Analisis gap kompetensi personil sebelum sertifikasi', href: '/diagnostik-kompetensi' },
    { icon: '📋', name: 'Persyaratan Jabatan', desc: 'SKK apa yang dibutuhkan untuk tender proyek', href: '/sertifikasi' },
  ],
};

export default function SKKPortalPage() {
  const [activePersona, setActivePersona] = useState('asesi');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
            Portal Ekosistem SKK · Permen PUPR 9/2023
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Seluruh Kebutuhan SKK<br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Dalam Satu Platform
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Untuk Asesi, Asesor, LSP, TUK, dan Perusahaan Jasa Konstruksi. AI yang sudah dilatih regulasi SKK terbaru.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { v: '200+', l: 'Jabatan Kerja' },
            { v: 'KKNI L1-9', l: 'Semua Jenjang' },
            { v: '24/7', l: 'AI Aktif' },
            { v: '2025', l: 'Regulasi Terbaru' },
          ].map(s => (
            <div key={s.l} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-amber-400 mb-0.5">{s.v}</div>
              <div className="text-slate-400 text-sm">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Persona tabs */}
        <div className="mb-8">
          <p className="text-slate-400 text-center text-sm mb-4">Pilih segmen Anda untuk melihat solusi yang relevan</p>
          <div className="flex flex-wrap justify-center gap-2">
            {personas.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePersona(p.id)}
                className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  activePersona === p.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-2">
            {personas.find(p => p.id === activePersona)?.desc}
          </p>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {tools[activePersona]?.map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="p-5 bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 rounded-xl transition-all group"
            >
              <div className="text-2xl mb-3">{t.icon}</div>
              <div className="font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">{t.name}</div>
              <div className="text-slate-400 text-sm">{t.desc}</div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-2">Mulai dari mana?</h3>
          <p className="text-slate-400 mb-6">Jika baru pertama kali, mulai dengan Diagnostik Kompetensi atau SKK Coach.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/diagnostik-kompetensi" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors">
              🧠 Mulai Diagnostik
            </Link>
            <Link href="/skk-coach" className="px-6 py-3 border border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-400 rounded-xl font-medium transition-colors">
              💬 Buka SKK Coach
            </Link>
            <Link href="/klinik-uji-kompetensi" className="px-6 py-3 border border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-400 rounded-xl font-medium transition-colors">
              🏥 Klinik Uji Kompetensi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
