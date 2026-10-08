import Link from 'next/link';
import { count } from 'drizzle-orm';
import { db } from '@/db';
import { quizQuestions } from '@/db/schema';
import { bimtekModules } from '@/lib/bimtekCatalog';
import { certificationPositions } from '@/lib/certificationPositions';
import JourneyTracker from '@/components/JourneyTracker';

const journeySteps = [
  {
    step: 1,
    icon: '🧠',
    title: 'Diagnostik Kompetensi',
    desc: 'Analisis gap KKNI dari profil pendidikan & pengalaman kerja Anda',
    href: '/diagnostik-kompetensi',
    cta: 'Mulai Diagnostik',
  },
  {
    step: 2,
    icon: '🏥',
    title: 'Klinik Uji Kompetensi',
    desc: 'Jalur terstruktur: Dialog → Blueprint → Chatbot → Ujian per unit kompetensi',
    href: '/klinik-uji-kompetensi',
    cta: 'Buka Klinik',
  },
  {
    step: 3,
    icon: '🎯',
    title: 'Mock Asesmen SKK',
    desc: 'Simulasi 5 soal AI berbasis SKKNI — latihan per domain sebelum hari H',
    href: '/mock-asesmen',
    cta: 'Coba Mock Asesmen',
  },
  {
    step: 4,
    icon: '💬',
    title: 'SKK Coach AI',
    desc: '5 agen spesialis: kelayakan jabatan, dokumen, perpanjangan, dan SBU',
    href: '/skk-coach',
    cta: 'Tanya SKK Coach',
  },
  {
    step: 5,
    icon: '📊',
    title: 'Pantau SKK',
    desc: 'Lacak progress persiapan, jadwal, dan kesiapan Anda menuju asesmen',
    href: '/siap-index',
    cta: 'Cek SIAP Index',
  },
];

const quickTools = [
  { icon: '📋', name: 'Sertifikasi', desc: 'Cari jabatan & cek persyaratan dokumen', href: '/sertifikasi' },
  { icon: '🎯', name: 'Mock Asesmen', desc: 'Simulasi soal SKKNI berbasis AI', href: '/mock-asesmen' },
  { icon: '🏥', name: 'Klinik', desc: 'Jalur latihan terstruktur per unit kompetensi', href: '/klinik-uji-kompetensi' },
  { icon: '💬', name: 'SKK Coach', desc: '5 agen spesialis siap membantu', href: '/skk-coach' },
  { icon: '🧠', name: 'Diagnostik', desc: 'Analisis gap KKNI dari profil Anda', href: '/diagnostik-kompetensi' },
  { icon: '🏗️', name: 'SKK Hub', desc: 'Semua alat SKK dalam satu portal', href: '/skk' },
];

const getFeatures = (bimtekCount: number, quizCount: number) => [
  {
    icon: '📋',
    title: 'Persiapan Dokumen',
    description: 'Checklist dokumen portofolio per jabatan SKK — FR.APL.01, FR.APL.02, dan bukti pengalaman kerja',
    href: '/sertifikasi',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: '🎓',
    title: 'BIMTEK & Materi',
    description: `${bimtekCount} modul pelatihan teknis & manajerial sesuai unit kompetensi SKKNI bidang Sipil & Manajemen`,
    href: '/bimtek',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: '✍️',
    title: 'Simulasi Asesmen',
    description: `${quizCount} soal latihan berdasarkan unit kompetensi — persiapkan diri sebelum menghadapi asesor`,
    href: '/quiz',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: '🗺️',
    title: 'Timeline Proses SKK',
    description: '8 tahap lengkap dari persiapan hingga terima sertifikat — dokumen, biaya, dan tips per fase',
    href: '/timeline-skk',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    icon: '🔗',
    title: 'Matriks Kompetensi',
    description: 'Visualisasi unit kompetensi per jabatan SKK — lihat koneksi antara jabatan dan subklasifikasi',
    href: '/matrix',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: '🧮',
    title: 'Solver Teknis',
    description: 'Kalkulator perhitungan teknik sipil & manajemen proyek untuk uji kompetensi tertulis',
    href: '/solver',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: '✅',
    title: 'Panduan Sertifikasi',
    description: 'Panduan 5 langkah proses sertifikasi — dari pendaftaran hingga penerbitan SKK',
    href: '/certify',
    color: 'from-green-500 to-lime-600',
  },
  {
    icon: '📅',
    title: 'Bimtek Offline',
    description: 'Event pelatihan tatap muka di kota Anda — persiapan intensif sebelum uji kompetensi',
    href: '/offline',
    color: 'from-cyan-500 to-teal-600',
  },
  {
    icon: '📚',
    title: 'Regulasi & Standar',
    description: 'Permen PU, SKKNI, dan regulasi SKK terkini — Permen PU No. 6/2025, KM 713/2022',
    href: '/knowledge-base',
    color: 'from-indigo-500 to-blue-600',
  },
];

const challenges = [
  {
    icon: '📄',
    title: 'Bingung Dokumen yang Harus Disiapkan',
    desc: 'Setiap jabatan SKK punya persyaratan dokumen berbeda. FR.APL.01, FR.APL.02, portofolio, dan bukti pengalaman — tidak semua Asesi tahu mana yang wajib.',
    stat: 'Periksa kelengkapan bukti sesuai skema LSP',
    color: 'border-red-200 bg-red-50',
    statColor: 'text-red-600',
  },
  {
    icon: '📖',
    title: 'Pengetahuan Teknis Belum Cukup',
    desc: 'Unit kompetensi SKKNI mencakup materi teknis dan manajerial yang luas. Tanpa persiapan terstruktur, sesi tanya jawab dengan asesor bisa menjadi hambatan terbesar.',
    stat: 'Latihan membantu persiapan, bukan menjamin kelulusan',
    color: 'border-amber-200 bg-amber-50',
    statColor: 'text-amber-600',
  },
  {
    icon: '🖥️',
    title: 'Prosedur Asesmen Tidak Dipahami',
    desc: 'Ada tiga metode asesmen — hardcopy, paperless, dan Asesmen Jarak Jauh (AJJ). Masing-masing punya alur berbeda. Tidak paham prosedur = persiapan salah arah.',
    stat: 'Konfirmasi metode asesmen yang tersedia kepada LSP',
    color: 'border-blue-200 bg-blue-50',
    statColor: 'text-blue-600',
  },
];

const methods = [
  {
    icon: '📝',
    name: 'Hardcopy',
    desc: 'Asesmen tatap muka dengan formulir fisik. Metode tradisional yang masih banyak digunakan LSP.',
    color: 'bg-slate-700',
  },
  {
    icon: '💻',
    name: 'Paperless',
    desc: 'Asesmen digital tanpa kertas. Dokumen dan formulir diisi secara elektronik di lokasi asesmen.',
    color: 'bg-blue-700',
  },
  {
    icon: '📡',
    name: 'Asesmen Jarak Jauh (AJJ)',
    desc: 'Asesmen jarak jauh dengan sarana komunikasi daring. Ketersediaan, persyaratan, dan tata cara pelaksanaannya perlu dikonfirmasi kepada LSP yang berwenang.',
    color: 'bg-amber-600',
  },
];

const aiExperts = [
  { icon: '🔍', name: 'Cek Kelayakan', desc: 'Jabatan SKK mana yang bisa diambil sekarang', href: '/skk-coach/chat?agent=kelayakan' },
  { icon: '📄', name: 'Panduan Dokumen', desc: 'FR.APL.01, FR.APL.02, dan bukti per jabatan', href: '/skk-coach/chat?agent=dokumen' },
  { icon: '🏗️', name: 'Info Jabatan SKK', desc: 'Detail skema, unit kompetensi & syarat', href: '/skk-coach/chat?agent=jabatan' },
  { icon: '♻️', name: 'Perpanjangan SKK', desc: 'Surveillance, PKB, dan re-sertifikasi', href: '/skk-coach/chat?agent=perpanjangan' },
  { icon: '🔗', name: 'SKK & SBU', desc: 'Persyaratan SKK untuk izin BUJK', href: '/skk-coach/chat?agent=sbu' },
  { icon: '💬', name: 'Expert AI Chat', desc: 'Konsultasi teknis bebas dengan AI konstruksi', href: '/chat' },
];

const aiPromptStarters = [
  'Saya lulusan SMK, bisa ambil SKK Ahli Pratama?',
  'Apa saja dokumen untuk FR.APL.01 jabatan Pelaksana Bangunan?',
  'Berapa lama proses sertifikasi SKK dari awal sampai terima sertifikat?',
  'Apa bedanya asesmen hardcopy, paperless, dan AJJ?',
  'Bagaimana cara memilih jabatan SKK yang sesuai pengalaman saya?',
];

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [quizCountRow] = await db
    .select({ count: count() })
    .from(quizQuestions);
  const bimtekCount = bimtekModules.length;
  const quizCount = Number(quizCountRow?.count ?? 0);
  const stats = [
    { value: String(bimtekCount), label: 'Modul BIMTEK' },
    { value: String(quizCount), label: 'Soal Latihan' },
    { value: String(certificationPositions.length), label: 'Posisi SKK' },
    { value: '8', label: 'AI Experts' },
  ];
  const features = getFeatures(bimtekCount, quizCount);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400 text-sm font-medium">
              Sistem Intensif Asistensi Pra-Uji · Uji Kompetensi SKK
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-3 tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                SIAP SKK
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 mb-5 tracking-widest uppercase font-medium">
              Sistem Intensif Asistensi Pra-Uji · Uji Kompetensi SKK Konstruksi
            </p>
            <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto">
              Persiapkan Uji Kompetensi SKK Anda dengan
              <span className="text-amber-400 font-semibold"> Panduan Terstruktur</span>
            </p>
            <p className="text-base text-slate-400 mb-8 max-w-2xl mx-auto">
              Dokumen portofolio, materi teknis, simulasi asesmen, dan panduan prosedur —
              semua dalam satu platform untuk bidang Sipil &amp; Manajemen Pelaksanaan.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="#journey"
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
              >
                🎓 Mulai Persiapan SKK
              </Link>
              <Link
                href="/chat"
                className="px-8 py-3 bg-slate-700/60 border border-slate-600 rounded-xl font-semibold hover:bg-slate-700 transition-all"
              >
                🤖 Tanya AI SIAP SKK
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-slate-800/50 rounded-xl backdrop-blur">
                <div className="text-3xl md:text-4xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-slate-400 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 Pilihan Utama ── */}
      <section className="py-12 bg-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-slate-400 text-sm uppercase tracking-widest font-medium mb-2">Apa yang Anda butuhkan?</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Mulai dari Mana Saja</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '🏛️',
                title: 'Saya ingin mengurus SKK',
                desc: 'Bantu saya dari cek kelayakan, persiapan dokumen, hingga proses pengajuan ke LSP.',
                cta: 'Ke SIAP Certify →',
                href: '/siap-certify',
                color: 'border-blue-500/50 hover:border-blue-400',
                iconBg: 'bg-blue-500/20',
                ctaColor: 'bg-blue-600 hover:bg-blue-500',
              },
              {
                icon: '📚',
                title: 'Saya ingin mempersiapkan uji kompetensi',
                desc: 'Bantu saya belajar materi, latihan soal, dan simulasi sebelum menghadapi asesor.',
                cta: 'Mulai Persiapan →',
                href: '/klinik-uji-kompetensi',
                color: 'border-amber-500/50 hover:border-amber-400',
                iconBg: 'bg-amber-500/20',
                ctaColor: 'bg-amber-600 hover:bg-amber-500',
              },
              {
                icon: '♻️',
                title: 'Saya sudah punya SKK',
                desc: 'Bantu saya memantau masa berlaku, perpanjangan, upgrade jenjang, atau SKK berikutnya.',
                cta: 'Pantau & Perpanjang →',
                href: '/skk-coach/chat?agent=perpanjangan',
                color: 'border-emerald-500/50 hover:border-emerald-400',
                iconBg: 'bg-emerald-500/20',
                ctaColor: 'bg-emerald-600 hover:bg-emerald-500',
              },
            ].map(item => (
              <div key={item.title} className={`flex flex-col p-6 bg-slate-900/60 border-2 ${item.color} rounded-2xl transition-all`}>
                <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center text-2xl mb-4`}>{item.icon}</div>
                <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-5">{item.desc}</p>
                <Link href={item.href} className={`block text-center py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-colors ${item.ctaColor}`}>
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Perjalanan SKK ── */}
      <section id="journey" className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-4">
              🗺️ Panduan Langkah demi Langkah
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Mulai Perjalanan{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                SKK Kamu
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Ikuti 5 tahap persiapan ini secara berurutan — dari mengenali gap kompetensi hingga siap menghadapi asesor.
            </p>
          </div>

          {/* Step-by-step flow */}
          <JourneyTracker steps={journeySteps} />

          {/* Quick-access grid */}
          <div className="mt-16">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-1">Akses Cepat Alat Terpopuler</h3>
              <p className="text-slate-500 text-sm">6 fitur paling sering digunakan Asesi SKK</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex flex-col items-center text-center p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl hover:border-amber-500/40 hover:bg-slate-800 transition-all"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{tool.icon}</div>
                  <div className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">{tool.name}</div>
                  <div className="text-slate-500 text-xs mt-1 leading-snug">{tool.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI SIAP SKK — Pusat Pengetahuan ── */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-4">
              🤖 Didukung GPT-4o · Tersedia 24/7
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              AI SIAP SKK —{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Pusat Pengetahuan
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Tanya apa saja tentang SKK konstruksi — kelayakan jabatan, dokumen, peraturan, jadwal, biaya — langsung dijawab oleh AI yang sudah dilatih regulasi SKK terbaru.
            </p>
          </div>

          {/* AI Entry Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {aiExperts.map((expert) => (
              <Link
                key={expert.href}
                href={expert.href}
                className="group flex items-start gap-4 p-5 bg-slate-800/60 border border-slate-700/50 rounded-2xl hover:border-amber-500/40 hover:bg-slate-800/80 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {expert.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">{expert.name}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{expert.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Prompt starters */}
          <div className="mb-10">
            <p className="text-center text-slate-400 text-sm mb-3">Belum tahu mau mulai dari mana? Coba tanyakan:</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {aiPromptStarters.map((prompt) => (
                <Link
                  key={prompt}
                  href={`/chat?q=${encodeURIComponent(prompt)}`}
                  className="px-4 py-2.5 bg-slate-800/80 border border-slate-600/70 rounded-full text-sm text-slate-200 hover:text-white hover:border-amber-500/60 hover:bg-slate-700 transition-all"
                >
                  {prompt}
                </Link>
              ))}
            </div>
          </div>

          {/* Big CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl font-bold text-white hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-amber-500/25 text-lg"
            >
              🤖 Mulai Chat dengan AI SIAP SKK
            </Link>
            <Link
              href="/agentic-chat"
              className="px-8 py-4 bg-slate-700/60 border border-slate-600 rounded-2xl font-bold text-white hover:bg-slate-700 transition-all text-lg"
            >
              ⚡ Agentic AI — Multi-Step Analysis
            </Link>
            <Link
              href="/skk-coach"
              className="px-8 py-4 bg-slate-700/60 border border-slate-600 rounded-2xl font-bold text-white hover:bg-slate-700 transition-all text-lg"
            >
              💼 SKK Coach — 5 Agen Spesialis
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-slate-600 text-xs mt-6">
            AI SIAP SKK mengacu pada Permen PU 6/2025, KM 713/2022, SK DJBK 114/2024, dan SKKNI terkini.
            Jawaban AI bersifat panduan — konfirmasi ke LSP untuk keputusan final.
          </p>
        </div>
      </section>

      {/* Tantangan Asesi */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              3 Tantangan Utama Asesi SKK
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Masalah yang paling sering dihadapi peserta uji kompetensi bidang Sipil dan Manajemen Pelaksanaan — dan cara SIAP SKK membantu mengatasinya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {challenges.map((c) => (
              <div key={c.title} className={`p-6 rounded-2xl border-2 ${c.color}`}>
                <div className="text-4xl mb-3">{c.icon}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{c.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{c.desc}</p>
                <p className={`text-xs font-semibold ${c.statColor}`}>📊 {c.stat}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-slate-500 text-sm">
              Berdasarkan regulasi: <span className="font-medium">Permen PU No. 6/2025 · KM PUPR No. 713/2022 · SK DJBK No. 114/2024 · Permen PU No. 12/2021</span>
            </p>
          </div>
        </div>
      </section>

      {/* Metode Asesmen */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              3 Metode Uji Kompetensi SKK
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Pahami perbedaan setiap metode asesmen agar persiapan Anda tepat sasaran.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {methods.map((m) => (
              <div key={m.name} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className={`${m.color} p-6 text-white`}>
                  <div className="text-4xl mb-2">{m.icon}</div>
                  <h3 className="text-xl font-bold">{m.name}</h3>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-sm">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/chat"
              className="inline-flex items-center px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all"
            >
              <span className="mr-2">🤖</span>
              Tanya AI SIAP SKK Tentang Prosedur Asesmen
            </Link>
          </div>
        </div>
      </section>

      {/* Fitur Platform */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">
            Semua yang Anda Butuhkan untuk Lulus SKK
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Dari persiapan dokumen hingga simulasi asesmen — SIAP SKK memandu Asesi bidang Sipil &amp; Manajemen Pelaksanaan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group p-6 bg-slate-50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-amber-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Siap Lulus Uji Kompetensi SKK?
          </h2>
          <p className="text-amber-100 mb-8 max-w-2xl mx-auto text-lg">
            Mulai persiapan sekarang dengan panduan terstruktur, materi lengkap, dan AI SIAP SKK yang siap membantu 24/7.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/bimtek"
              className="px-8 py-3 bg-white text-amber-600 rounded-xl font-semibold hover:bg-amber-50 transition-all shadow-lg"
            >
              🎓 Mulai Belajar Sekarang
            </Link>
            <Link
              href="/chat"
              className="px-8 py-3 bg-amber-700/50 border border-amber-300/50 rounded-xl font-semibold hover:bg-amber-700 transition-all"
            >
              🤖 Tanya AI SIAP SKK
            </Link>
            <Link
              href="/skk"
              className="px-8 py-3 bg-amber-700/50 border border-amber-300/50 rounded-xl font-semibold hover:bg-amber-700 transition-all"
            >
              🏗️ Jelajahi SKK Hub
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-bold text-white text-lg tracking-wider mb-1">SIAP SKK</p>
          <p className="text-xs text-slate-500 mb-3">Sistem Intensif Asistensi Pra-Uji · Uji Kompetensi SKK Konstruksi</p>
          <p className="text-xs text-slate-600">
            Referensi: Permen PU No. 6/2025 · KM PUPR No. 713/KPTS/M/2022 · SK DJBK No. 114/KPTS/DK/2024 · Permen PU No. 12/2021
          </p>
        </div>
      </footer>
    </div>
  );
}
