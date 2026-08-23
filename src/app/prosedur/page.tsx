'use client';

import { useState } from 'react';

type Method = 'hardcopy' | 'paperless' | 'ajj';

interface Step {
  icon: string;
  title: string;
  description: string;
  details: string[];
  duration?: string;
  color: string;
}

const hardcopySteps: Step[] = [
  {
    icon: '📝',
    title: 'Pendaftaran',
    description: 'Asesi mendaftarkan diri ke LSP atau TUK yang ditunjuk dengan mengisi formulir permohonan secara manual.',
    details: [
      'Mengisi FR.APL.01 (Formulir Permohonan Asesmen) secara tertulis',
      'Melampirkan fotokopi ijazah, KTP, dan dokumen pengalaman kerja',
      'Menyerahkan dokumen langsung ke TUK atau melalui pos',
      'Membayar biaya asesmen sesuai tarif yang berlaku',
    ],
    duration: '1–3 hari kerja',
    color: 'blue',
  },
  {
    icon: '🔍',
    title: 'Verifikasi Dokumen',
    description: 'Asesor memeriksa kelengkapan dan keabsahan dokumen yang diserahkan secara fisik oleh asesi.',
    details: [
      'Asesor melakukan verifikasi keaslian dokumen hardcopy',
      'Pengecekan kesesuaian dokumen dengan skema sertifikasi yang dipilih',
      'Konfirmasi jadwal pelaksanaan asesmen tatap muka',
      'Asesi menerima undangan asesmen tertulis jika dokumen lengkap',
    ],
    duration: '3–5 hari kerja',
    color: 'purple',
  },
  {
    icon: '📋',
    title: 'Pelaksanaan Asesmen',
    description: 'Asesmen dilakukan secara tatap muka di Tempat Uji Kompetensi (TUK) yang telah ditentukan dengan menggunakan instrumen hardcopy.',
    details: [
      'Tes tertulis (paper-based) menggunakan lembar soal dan jawaban cetak',
      'Observasi langsung di lapangan atau simulasi di TUK',
      'Wawancara tatap muka dengan asesor untuk verifikasi kompetensi',
      'Pengisian FR.AK.01 (formulir asesmen) oleh asesor secara manual',
    ],
    duration: '1 hari (full day)',
    color: 'amber',
  },
  {
    icon: '⚖️',
    title: 'Keputusan Asesmen',
    description: 'Asesor membuat rekomendasi keputusan asesmen berdasarkan bukti yang terkumpul dan diserahkan ke LSP untuk penetapan.',
    details: [
      'Asesor mengisi formulir rekomendasi keputusan secara tertulis',
      'Dokumen diserahkan ke Manajer Sertifikasi LSP untuk dikaji',
      'Keputusan: Kompeten (K) atau Belum Kompeten (BK)',
      'Asesi diberitahu melalui surat resmi atau langsung',
    ],
    duration: '3–7 hari kerja',
    color: 'green',
  },
  {
    icon: '🏅',
    title: 'Penerbitan Sertifikat',
    description: 'LSP menerbitkan Sertifikat Kompetensi Kerja (SKK) yang dicetak secara fisik dan diserahkan kepada asesi.',
    details: [
      'SKK dicetak dengan tanda tangan dan cap basah LSP yang terakreditasi',
      'Sertifikat didaftarkan ke Sistem Informasi Jasa Konstruksi (SIJK)',
      'Asesi menerima SKK fisik langsung atau melalui pos',
      'Berlaku 5 tahun dan dapat diperpanjang melalui proses resertifikasi',
    ],
    duration: '7–14 hari kerja',
    color: 'rose',
  },
];

const paperlessSteps: Step[] = [
  {
    icon: '💻',
    title: 'Pendaftaran Digital',
    description: 'Asesi mendaftar secara online melalui portal LSP atau aplikasi yang terintegrasi dengan SIJK Kementerian PUPR.',
    details: [
      'Mengisi FR.APL.01 digital melalui portal resmi LSP',
      'Mengunggah dokumen pendukung dalam format PDF/JPG (maks. 2 MB per file)',
      'Pembayaran biaya asesmen via transfer bank atau payment gateway',
      'Menerima konfirmasi pendaftaran otomatis via email',
    ],
    duration: '1 hari kerja',
    color: 'blue',
  },
  {
    icon: '🔐',
    title: 'Verifikasi Digital',
    description: 'Asesor memverifikasi dokumen melalui sistem digital. Keaslian dokumen dikonfirmasi menggunakan tanda tangan elektronik.',
    details: [
      'Sistem otomatis memeriksa kelengkapan dokumen yang diunggah',
      'Asesor melakukan verifikasi manual via portal dalam 3 hari kerja',
      'Notifikasi status verifikasi dikirim via email/SMS',
      'Penjadwalan asesmen dilakukan secara otomatis oleh sistem',
    ],
    duration: '2–3 hari kerja',
    color: 'purple',
  },
  {
    icon: '🖥️',
    title: 'Pelaksanaan Asesmen',
    description: 'Asesmen dilakukan di TUK menggunakan perangkat komputer/tablet. Tidak ada dokumen fisik — semua dicatat dalam sistem digital.',
    details: [
      'Tes tertulis berbasis komputer (Computer Based Testing / CBT)',
      'Soal ditampilkan secara digital dengan timer otomatis',
      'Observasi praktik tetap dilakukan langsung di lapangan/TUK',
      'Asesor mengisi formulir asesmen digital via tablet atau laptop',
    ],
    duration: '1 hari (full day)',
    color: 'amber',
  },
  {
    icon: '📊',
    title: 'Keputusan Asesmen',
    description: 'Rekomendasi keputusan dimasukkan asesor ke dalam sistem dan disetujui secara digital oleh Manajer Sertifikasi LSP.',
    details: [
      'Asesor menginput rekomendasi dan catatan di portal LSP',
      'Manajer Sertifikasi memberi persetujuan digital (e-approval)',
      'Asesi menerima notifikasi hasil asesmen via email/portal',
      'Rekam jejak keputusan tersimpan otomatis di sistem',
    ],
    duration: '1–3 hari kerja',
    color: 'green',
  },
  {
    icon: '🎖️',
    title: 'Penerbitan SKK Digital',
    description: 'SKK diterbitkan secara digital dengan tanda tangan elektronik tersertifikasi dan dapat diverifikasi via QR Code.',
    details: [
      'SKK diterbitkan dengan tanda tangan elektronik BSrE (BSSN)',
      'QR Code tertanam di SKK untuk verifikasi keaslian secara instan',
      'Data terintegrasi langsung ke SIJK Kementerian PUPR',
      'Asesi dapat mengunduh SKK digital kapan saja dari portal',
    ],
    duration: '3–7 hari kerja',
    color: 'rose',
  },
];

const ajjSteps: Step[] = [
  {
    icon: '📱',
    title: 'Pendaftaran & Persiapan AJJ',
    description: 'Asesi mendaftar secara online dan menerima panduan teknis pelaksanaan asesmen jarak jauh beserta persyaratan khusus.',
    details: [
      'Pendaftaran melalui portal LSP dengan mencantumkan permintaan skema AJJ',
      'Mengisi formulir tambahan (FR.AJJ.01) tentang kesiapan infrastruktur',
      'Mengikuti sesi orientasi teknis (onboarding) via video conference',
      'Memastikan perangkat, koneksi internet, dan ruangan uji memenuhi standar',
    ],
    duration: '1–2 hari kerja',
    color: 'blue',
  },
  {
    icon: '🛡️',
    title: 'Verifikasi Identitas & Dokumen',
    description: 'Asesor melakukan verifikasi identitas asesi secara real-time via video conference sebelum asesmen dimulai.',
    details: [
      'Verifikasi KTP dan wajah asesi secara live via kamera',
      'Pemindaian ruangan (room scan) oleh asesor untuk memastikan kondisi asesmen',
      'Dokumen portofolio diunggah ke portal dan diverifikasi secara digital',
      'Uji coba teknis (tech check) koneksi internet dan perangkat',
    ],
    duration: '1 hari kerja',
    color: 'purple',
  },
  {
    icon: '🎥',
    title: 'Pelaksanaan Asesmen Jarak Jauh',
    description: 'Asesmen dilaksanakan sepenuhnya secara daring menggunakan platform video conference yang disetujui LSP, dipantau secara ketat.',
    details: [
      'Tes tertulis CBT dilakukan secara online dengan pengawasan kamera (proctoring)',
      'Wawancara kompetensi dilakukan via video conference dengan asesor',
      'Asesi wajib berbagi layar (screen sharing) selama tes berlangsung',
      'Rekaman sesi disimpan LSP sebagai bukti asesmen selama 5 tahun',
      'Dilarang menggunakan bantuan pihak lain — pelanggaran berakibat diskualifikasi',
    ],
    duration: '4–8 jam',
    color: 'amber',
  },
  {
    icon: '📋',
    title: 'Keputusan Asesmen',
    description: 'Asesor membuat keputusan berdasarkan bukti yang terkumpul selama sesi AJJ dan rekaman yang tersimpan di sistem.',
    details: [
      'Asesor mengkaji bukti dan rekaman setelah sesi selesai',
      'Keputusan Kompeten (K) atau Belum Kompeten (BK) ditetapkan oleh LSP',
      'Asesi menerima notifikasi hasil via email dalam 3–5 hari kerja',
      'Banding dapat diajukan dalam 14 hari jika asesi tidak setuju dengan keputusan',
    ],
    duration: '3–5 hari kerja',
    color: 'green',
  },
  {
    icon: '🎗️',
    title: 'Penerbitan SKK',
    description: 'SKK diterbitkan secara digital — sama seperti metode paperless — dan terintegrasi ke SIJK Kementerian PUPR.',
    details: [
      'SKK digital diterbitkan dengan tanda tangan elektronik BSrE',
      'QR Code untuk verifikasi keaslian SKK oleh pihak ketiga',
      'Data tersinkronisasi otomatis ke SIJK dalam 24 jam setelah penerbitan',
      'Asesi dapat mengunduh dan mencetak SKK mandiri dari portal LSP',
    ],
    duration: '3–7 hari kerja',
    color: 'rose',
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-400',   badge: 'bg-blue-500/20 text-blue-300' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-400',  badge: 'bg-amber-500/20 text-amber-300' },
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400',  badge: 'bg-green-500/20 text-green-300' },
  rose:   { bg: 'bg-rose-500/10',   border: 'border-rose-500/30',   text: 'text-rose-400',   badge: 'bg-rose-500/20 text-rose-300' },
};

function StepCard({ step, index, total }: { step: Step; index: number; total: number }) {
  const [expanded, setExpanded] = useState(false);
  const c = colorMap[step.color];

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div className={`w-full rounded-2xl border ${c.border} ${c.bg} p-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer`}
           onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-4">
          {/* Step number + icon */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className={`w-10 h-10 rounded-full ${c.bg} border-2 ${c.border} flex items-center justify-center text-lg`}>
              {step.icon}
            </div>
            <span className={`text-xs font-bold ${c.text}`}>{index + 1}/{total}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className={`font-bold text-base ${c.text}`}>{step.title}</h3>
              {step.duration && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge} shrink-0`}>
                  ⏱ {step.duration}
                </span>
              )}
            </div>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">{step.description}</p>

            {/* Expand toggle */}
            <button className={`mt-2 text-xs ${c.text} hover:underline flex items-center gap-1`}>
              {expanded ? 'Sembunyikan detail ▲' : 'Lihat detail ▼'}
            </button>

            {/* Expandable details */}
            {expanded && (
              <ul className="mt-3 space-y-1.5">
                {step.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className={`mt-0.5 ${c.text} shrink-0`}>•</span>
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Arrow connector */}
      {index < total - 1 && (
        <div className="flex flex-col items-center my-1">
          <div className="w-0.5 h-4 bg-slate-600" />
          <div className="text-slate-500 text-lg leading-none">▼</div>
        </div>
      )}
    </div>
  );
}

const tabs: { id: Method; label: string; icon: string; subtitle: string }[] = [
  { id: 'hardcopy', label: 'Hardcopy', icon: '📄', subtitle: 'Berbasis dokumen fisik & tatap muka' },
  { id: 'paperless', label: 'Paperless', icon: '🖥️', subtitle: 'Berbasis digital di TUK' },
  { id: 'ajj',       label: 'AJJ',       icon: '🎥', subtitle: 'Asesmen Jarak Jauh (Daring)' },
];

const stepsMap: Record<Method, Step[]> = {
  hardcopy: hardcopySteps,
  paperless: paperlessSteps,
  ajj: ajjSteps,
};

const comparisons = [
  { label: 'Media asesmen',    hardcopy: 'Dokumen fisik/cetak', paperless: 'Komputer di TUK', ajj: 'Komputer di rumah/kantor' },
  { label: 'Lokasi',           hardcopy: 'Wajib di TUK',        paperless: 'Wajib di TUK',    ajj: 'Jarak jauh (fleksibel)' },
  { label: 'Waktu keputusan',  hardcopy: '3–7 hari kerja',      paperless: '1–3 hari kerja',  ajj: '3–5 hari kerja' },
  { label: 'Sertifikat',       hardcopy: 'Fisik + digital',      paperless: 'Digital (QR)',    ajj: 'Digital (QR)' },
  { label: 'Proctoring',       hardcopy: 'Asesor langsung',      paperless: 'Asesor langsung', ajj: 'Kamera + screen share' },
  { label: 'Rekam bukti',      hardcopy: 'Formulir cetak',       paperless: 'Sistem digital',  ajj: 'Rekaman video + digital' },
];

export default function ProsedurPage() {
  const [activeTab, setActiveTab] = useState<Method>('hardcopy');
  const steps = stepsMap[activeTab];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-amber-400 text-sm mb-6">
            📖 Panduan Resmi Berdasarkan Regulasi Terbaru
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Prosedur Uji Kompetensi
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Pahami alur asesmen SKK dari pendaftaran hingga terbitnya sertifikat.
            Tersedia tiga metode sesuai Permen PU No. 6/2025, Permen PU No. 12/2021,
            dan SK DJBK No. 114/KPTS/DK/2024.
          </p>

          {/* Regulatory badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              'Permen PU No. 6/2025',
              'Permen PU No. 12/2021',
              'SK DJBK No. 114/KPTS/DK/2024',
            ].map(reg => (
              <span key={reg}
                className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-xs text-slate-300">
                ⚖️ {reg}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="text-2xl mb-1">{tab.icon}</div>
              <div className={`font-bold text-base ${activeTab === tab.id ? 'text-amber-400' : 'text-white'}`}>
                {tab.label}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{tab.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Active method header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{tabs.find(t => t.id === activeTab)!.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Alur Asesmen — {tabs.find(t => t.id === activeTab)!.label}
              </h2>
              <p className="text-slate-400 text-sm">{tabs.find(t => t.id === activeTab)!.subtitle}</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-3">
            Klik pada setiap langkah untuk melihat detail kegiatan yang harus dilakukan.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col mb-14">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} index={i} total={steps.length} />
          ))}
        </div>

        {/* AJJ specific note */}
        {activeTab === 'ajj' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-10">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-400 mb-1">Persyaratan Khusus AJJ</h3>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• Koneksi internet minimal <strong>10 Mbps</strong> yang stabil</li>
                  <li>• Kamera web (webcam) beresolusi minimal 720p</li>
                  <li>• Ruangan pribadi, tenang, dan bebas dari gangguan selama asesmen</li>
                  <li>• Laptop/PC dengan baterai penuh atau tersambung ke listrik</li>
                  <li>• Dilarang keras menggunakan earphone/earpiece selama tes tertulis</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Comparison table */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-white mb-4">📊 Perbandingan Tiga Metode</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 text-slate-300">
                  <th className="text-left px-4 py-3 font-semibold">Aspek</th>
                  <th className="text-left px-4 py-3 font-semibold text-blue-400">📄 Hardcopy</th>
                  <th className="text-left px-4 py-3 font-semibold text-purple-400">🖥️ Paperless</th>
                  <th className="text-left px-4 py-3 font-semibold text-amber-400">🎥 AJJ</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={i} className={`border-t border-slate-700 ${i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/40'}`}>
                    <td className="px-4 py-3 text-slate-400 font-medium">{row.label}</td>
                    <td className="px-4 py-3 text-slate-300">{row.hardcopy}</td>
                    <td className="px-4 py-3 text-slate-300">{row.paperless}</td>
                    <td className="px-4 py-3 text-slate-300">{row.ajj}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ / Tips */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-white mb-4">💡 Tips Agar Asesmen Lancar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '📁', title: 'Siapkan Dokumen Lengkap', desc: 'Pastikan semua dokumen (ijazah, KTP, portofolio kerja) sudah disiapkan sebelum mendaftar agar verifikasi berjalan cepat.' },
              { icon: '📅', title: 'Daftar Jauh Hari', desc: 'Kuota TUK sering penuh — daftar setidaknya 2–3 minggu sebelum tanggal yang diinginkan.' },
              { icon: '📖', title: 'Pelajari Skema Sertifikasi', desc: 'Baca unit kompetensi di skema yang Anda pilih. Fokus pada elemen kompetensi yang akan diujikan.' },
              { icon: '🎯', title: 'Latihan Sebelum Hari H', desc: 'Gunakan fitur Klinik SKK dan Mock Asesmen di platform ini untuk simulasi soal dan wawancara.' },
            ].map((tip, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex gap-3">
                <span className="text-2xl shrink-0">{tip.icon}</span>
                <div>
                  <div className="font-semibold text-white mb-1">{tip.title}</div>
                  <div className="text-slate-400 text-sm">{tip.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Siap Memulai Perjalanan SKK Anda?</h2>
          <p className="text-slate-400 mb-6">Gunakan fitur-fitur di SiapSKK untuk mempersiapkan diri sebelum asesmen.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/klinik-uji-kompetensi"
               className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2.5 rounded-xl transition-all">
              🏥 Klinik SKK
            </a>
            <a href="/mock-asesmen"
               className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all">
              🎯 Mock Asesmen
            </a>
            <a href="/dokumen"
               className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-all">
              📄 Persiapan Dokumen
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-8">
          Informasi berdasarkan Permen PU No. 6/2025, Permen PU No. 12/2021, dan SK DJBK No. 114/KPTS/DK/2024.
          Ketentuan dapat berubah — selalu konfirmasi ke LSP yang Anda tuju.
        </p>
      </div>
    </div>
  );
}
