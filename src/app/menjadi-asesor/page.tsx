'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Data ──────────────────────────────────────────────────────────────────────

const syarat = [
  {
    icon: '🎓',
    title: 'Pendidikan & SKK',
    items: [
      'Memiliki SKK (Sertifikat Kompetensi Kerja) minimal Level 6 di bidang yang akan dinilai',
      'Pendidikan minimal D3/S1 teknik relevan (tergantung kebijakan LSP)',
      'SKK yang digunakan sebagai dasar harus masih aktif (tidak kadaluarsa)',
    ],
  },
  {
    icon: '💼',
    title: 'Pengalaman Kerja',
    items: [
      'Pengalaman kerja konstruksi bidang relevan minimal 5 tahun (untuk Level 6)',
      'Pernah terlibat dalam proyek konstruksi secara aktif (bukan hanya administratif)',
      'Memiliki rekam jejak yang dapat diverifikasi (SK, laporan, portofolio proyek)',
    ],
  },
  {
    icon: '📋',
    title: 'Pelatihan ASKOM',
    items: [
      'Mengikuti dan lulus Pelatihan Asesor Kompetensi (ASKOM) yang diakui BNSP',
      'Durasi pelatihan biasanya 40-80 jam (5-10 hari)',
      'Materi: prinsip CBT, teknik asesmen, etika asesor, pengisian FR-IA dan FR-AK',
    ],
  },
  {
    icon: '✅',
    title: 'Sertifikasi BNSP',
    items: [
      'Mengikuti dan lulus asesmen kompetensi asesor oleh LSP yang memiliki skema ASKOM',
      'Mendapatkan Sertifikat Asesor Kompetensi dari BNSP',
      'Masa berlaku sertifikat asesor: 3 tahun dengan surveillance berkala',
    ],
  },
];

const steps = [
  {
    no: '01',
    judul: 'Cek Kelayakan Dasar',
    detail: 'Pastikan Anda memiliki SKK aktif Level 6+ dan pengalaman kerja ≥5 tahun di bidang yang ingin Anda ases. Ini adalah gerbang masuk. Tanpa SKK aktif yang relevan, Anda tidak akan bisa mendaftar sebagai asesor untuk jabatan tersebut.',
    durasi: 'Segera',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    no: '02',
    judul: 'Cari Pelatihan ASKOM',
    detail: 'Cari lembaga pelatihan yang menyelenggarakan ASKOM (Asesor Kompetensi) yang diakui BNSP. Sumber: website BNSP, asosiasi profesi (PII, HATTI, HPJI), Kementerian PUPR, atau LSP langsung yang ingin Anda gabung. Biaya pelatihan biasanya Rp 3-8 juta selama 5-10 hari.',
    durasi: '1-4 minggu pencarian',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    no: '03',
    judul: 'Ikuti Pelatihan ASKOM',
    detail: 'Pelatihan mencakup: (1) Prinsip Competency Based Training & Assessment (CBTA), (2) Teknik pengumpulan bukti dan analisis gap, (3) Metode asesmen: observasi, wawancara, tes tertulis, portofolio, (4) Pengisian formulir FR-IA (Instruksi Asesmen) dan FR-AK (Catatan Asesmen), (5) Etika dan peran asesor, (6) Praktik asesmen simulasi.',
    durasi: '5-10 hari',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  {
    no: '04',
    judul: 'Ujian Sertifikasi Asesor',
    detail: 'Setelah pelatihan, ikuti uji kompetensi asesor oleh LSP berlisensi BNSP untuk skema ASKOM. Metode: tes tertulis (pengetahuan CBT & regulasi) + demonstrasi/simulasi (praktik asesmen dengan asesi simulator) + wawancara kompetensi. Jika lulus: terima Sertifikat Asesor Kompetensi BNSP.',
    durasi: '1-2 hari asesmen',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    no: '05',
    judul: 'Daftarkan Diri ke LSP',
    detail: 'Setelah punya sertifikat asesor, daftarkan ke LSP yang akan menggunakan jasa Anda. Proses: kirim CV + sertifikat asesor + SKK + portofolio ke LSP → wawancara → MoU/kontrak asesor. Bisa bergabung ke lebih dari satu LSP. Beberapa LSP memiliki program rekrutmen asesor rutin.',
    durasi: '2-4 minggu',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  {
    no: '06',
    judul: 'Aktif & Pertahankan Sertifikasi',
    detail: 'Asesor wajib: (1) Mengikuti surveillance asesor (biasanya tahunan), (2) Mengumpulkan poin PKB (pelatihan, seminar, publikasi), (3) Mengevaluasi dan memperbarui kompetensi teknis di bidang yang diases, (4) Re-sertifikasi setiap 3 tahun. Asesor tidak aktif (tidak melakukan asesmen dalam 12 bulan) berisiko status asesornya ditangguhkan.',
    durasi: 'Berkelanjutan',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
];

const peranAsesor = [
  {
    icon: '📋',
    judul: 'Merencanakan Asesmen',
    detail: 'Membuat MAPA (Merencanakan dan Mengorganisasikan Asesmen) — rencana bagaimana asesmen akan dilakukan, instrumen yang digunakan, dan jadwal. Berkoordinasi dengan asesi untuk memastikan kesiapan.',
  },
  {
    icon: '🔍',
    judul: 'Mengumpulkan Bukti',
    detail: 'Menggunakan berbagai metode: review portofolio, wawancara kompetensi, tes tertulis, observasi demonstrasi. Menilai kesesuaian bukti dengan Kriteria Unjuk Kerja (KUK) di SKKNI.',
  },
  {
    icon: '⚖️',
    judul: 'Membuat Keputusan',
    detail: 'Menganalisis semua bukti yang terkumpul dan memutuskan: Kompeten (K) atau Belum Kompeten (BK) per unit kompetensi. Keputusan harus berdasarkan prinsip FAKTA — Valid, Asli, Kini, Terukur, Adil.',
  },
  {
    icon: '📝',
    judul: 'Memberi Umpan Balik',
    detail: 'Menyampaikan hasil dan umpan balik konstruktif kepada asesi. Untuk BK: jelaskan gap spesifik dan rekomendasikan pengembangan. Umpan balik harus profesional dan mendukung pertumbuhan asesi.',
  },
  {
    icon: '📊',
    judul: 'Melaporkan Hasil',
    detail: 'Mengisi FR-AK (Formulir Catatan Asesmen) dan laporan lengkap ke LSP. Manajer sertifikasi LSP yang kemudian memutuskan penerbitan SKK berdasarkan laporan asesor.',
  },
];

const faq = [
  {
    q: 'Berapa honorarium asesor per sesi?',
    a: 'Honorarium bervariasi per LSP: biasanya Rp 300.000 – Rp 1.500.000 per asesi per hari asesmen, tergantung level jabatan dan kebijakan LSP. Asesor senior dengan track record baik bisa negosiasi rate lebih tinggi. Ada juga biaya transport/akomodasi untuk asesmen di luar kota.',
  },
  {
    q: 'Bisakah menjadi asesor sambil tetap bekerja?',
    a: 'Bisa. Mayoritas asesor adalah praktisi yang masih aktif bekerja. Asesmen biasanya dijadwalkan akhir pekan atau sesuai kesepakatan. Bahkan, pengalaman kerja aktif sangat dianjurkan — asesor yang masih di lapangan lebih relevan dalam menilai kompetensi asesi.',
  },
  {
    q: 'Apakah asesor bisa menilai jabatan yang sama dengan SKK-nya?',
    a: 'Ya, justru itulah syaratnya — asesor hanya boleh menilai jabatan yang sesuai dengan kompetensinya sendiri. Asesor dengan SKK Ahli Teknik Sipil Level 7 bisa menilai asesi untuk jabatan yang sama atau di bawahnya.',
  },
  {
    q: 'Apakah ada konflik kepentingan yang harus dihindari?',
    a: 'Ya. Asesor tidak boleh menilai: (1) keluarga/saudara, (2) bawahan/atasan langsung, (3) peserta yang pernah dilatihnya di kelas yang sama. Jika ada potensi konflik, harus dilaporkan ke LSP untuk penugasan asesor lain.',
  },
  {
    q: 'Apa bedanya asesor dengan assessor dan auditor?',
    a: '"Asesor Kompetensi" (Indonesia) adalah penilai kompetensi kerja berlisensi BNSP. "Assessor" (internasional) adalah padanan kata yang sama. "Auditor" adalah istilah berbeda — mengevaluasi sistem/proses, bukan individu. Di KAN, ada juga "asesor akreditasi" yang menilai LSP — jabatan yang lebih senior dan berbeda prosedurnya.',
  },
];

export default function MenjadiAsesorPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'syarat' | 'langkah' | 'peran' | 'faq'>('langkah');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium mb-4">
            🎖️ Jalur Karir Pasca-SKK
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Menjadi <span className="text-purple-400">Asesor Kompetensi</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Panduan lengkap untuk pemegang SKK yang ingin melangkah lebih jauh — menjadi asesor kompetensi konstruksi bersertifikat BNSP dan berkontribusi pada ekosistem sertifikasi nasional.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '3 Tahun', label: 'Masa berlaku sertifikat asesor', icon: '⏱️' },
            { value: 'SKK L6+', label: 'Syarat minimum kompetensi', icon: '🏆' },
            { value: '5-10 Hari', label: 'Durasi pelatihan ASKOM', icon: '📚' },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <p className="text-purple-400 font-bold text-sm">{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            { id: 'langkah', label: 'Langkah-Langkah', icon: '🗺️' },
            { id: 'syarat', label: 'Persyaratan', icon: '📋' },
            { id: 'peran', label: 'Peran Asesor', icon: '🎯' },
            { id: 'faq', label: 'FAQ', icon: '❓' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeTab === t.id
                  ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/40 hover:border-slate-600'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Langkah */}
        {activeTab === 'langkah' && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">Klik setiap langkah untuk detail lengkap.</p>
            {steps.map((s, i) => (
              <div
                key={i}
                className={`rounded-xl border overflow-hidden transition-all ${
                  activeStep === i ? `${s.bgColor} ${s.borderColor}` : 'bg-slate-800/40 border-slate-700/40'
                }`}
              >
                <button
                  className="w-full text-left px-4 py-4 flex items-center gap-4"
                  onClick={() => setActiveStep(activeStep === i ? null : i)}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${s.bgColor} border ${s.borderColor} flex items-center justify-center`}>
                    <span className={`text-sm font-bold ${s.color}`}>{s.no}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${activeStep === i ? s.color : 'text-white'}`}>{s.judul}</p>
                    <p className="text-xs text-slate-500 mt-0.5">⏱ {s.durasi}</p>
                  </div>
                  <span className={`text-slate-500 transition-transform text-sm ${activeStep === i ? 'rotate-90' : ''}`}>▶</span>
                </button>
                {activeStep === i && (
                  <div className="px-5 pb-5">
                    <div className="h-px bg-slate-700/50 mb-4" />
                    <p className="text-slate-300 text-sm leading-relaxed">{s.detail}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Persyaratan */}
        {activeTab === 'syarat' && (
          <div className="space-y-4">
            {syarat.map((s, i) => (
              <div key={i} className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{s.icon}</span>
                  <h3 className="text-white font-semibold">{s.title}</h3>
                </div>
                <ul className="space-y-2">
                  {s.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-slate-300 text-sm">
                      <span className="text-purple-400 flex-shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-amber-300 text-sm font-medium mb-1">⚠️ Catatan Penting</p>
              <p className="text-slate-400 text-sm">Persyaratan spesifik dapat berbeda antar LSP. Selalu konfirmasi ke LSP yang dituju sebelum mendaftar pelatihan ASKOM, karena beberapa LSP memiliki syarat tambahan (pelatihan khusus bidang, keanggotaan asosiasi, dll).</p>
            </div>
          </div>
        )}

        {/* Tab: Peran Asesor */}
        {activeTab === 'peran' && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">Inilah yang akan Anda lakukan sebagai asesor kompetensi setiap kali menilai asesi.</p>
            {peranAsesor.map((p, i) => (
              <div key={i} className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl">
                  {p.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">{p.judul}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{p.detail}</p>
                </div>
              </div>
            ))}
            <div className="p-4 bg-slate-800/60 border border-slate-700/50 rounded-xl">
              <p className="text-purple-400 text-sm font-semibold mb-2">🔑 Prinsip Dasar VAKTA</p>
              <div className="grid grid-cols-5 gap-2 text-center">
                {['Valid', 'Asli', 'Kini', 'Terukur', 'Adil'].map((v, i) => (
                  <div key={v} className="bg-purple-500/10 rounded-lg py-2">
                    <p className="text-purple-400 font-bold text-sm">{v[0]}</p>
                    <p className="text-slate-400 text-xs">{v}</p>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-2">Semua bukti yang dinilai harus memenuhi kelima prinsip ini.</p>
            </div>
          </div>
        )}

        {/* Tab: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-2">
            {faq.map((f, i) => (
              <div
                key={i}
                className={`rounded-xl border overflow-hidden transition-all ${
                  activeFaq === i ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-800/40 border-slate-700/40'
                }`}
              >
                <button className="w-full text-left px-4 py-3.5 flex items-start gap-3" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <span className="text-purple-400 flex-shrink-0 mt-0.5">{activeFaq === i ? '▼' : '▶'}</span>
                  <p className={`text-sm font-medium ${activeFaq === i ? 'text-purple-300' : 'text-white'}`}>{f.q}</p>
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-4">
                    <div className="h-px bg-slate-700/50 mb-3" />
                    <p className="text-slate-300 text-sm leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA block */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-900/40 to-slate-800/40 border border-purple-500/20 p-6 text-center space-y-3">
          <p className="text-white font-semibold">Sudah punya SKK dan ingin tahu apakah siap jadi asesor?</p>
          <p className="text-slate-400 text-sm">Tanyakan ke SKK Coach AI — agen kelayakan bisa membantu menganalisis jalur karir Anda sebagai asesor.</p>
          <Link
            href="/skk-coach?agent=kelayakan"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-500 hover:bg-purple-400 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            💬 Konsultasi Jalur Asesor
          </Link>
        </div>

        {/* Related links */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/diagnostik-kompetensi" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-purple-500/40 transition-colors">
            <span className="text-xl">🔍</span>
            <div><p className="text-white text-sm font-medium">Diagnostik SKK</p><p className="text-slate-500 text-xs">Cek level kompetensi saat ini</p></div>
          </Link>
          <Link href="/pantau-skk" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-purple-500/40 transition-colors">
            <span className="text-xl">📅</span>
            <div><p className="text-white text-sm font-medium">Pantau SKK</p><p className="text-slate-500 text-xs">Kelola masa berlaku SKK</p></div>
          </Link>
          <Link href="/faq-skk" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-purple-500/40 transition-colors">
            <span className="text-xl">❓</span>
            <div><p className="text-white text-sm font-medium">FAQ SKK</p><p className="text-slate-500 text-xs">Pertanyaan umum sertifikasi</p></div>
          </Link>
        </div>

      </div>
    </div>
  );
}
