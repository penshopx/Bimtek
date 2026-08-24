'use client';

import { useState } from 'react';
import Link from 'next/link';

const journey = [
  {
    id: 'check',
    label: 'CHECK',
    icon: '🔍',
    title: 'Cek Kelayakan',
    desc: 'AI menganalisis profil pendidikan dan pengalaman Anda untuk menentukan jabatan SKK yang paling sesuai.',
    siap: ['Konsultasi awal via AI', 'Pemetaan jabatan SKK potensial', 'Preliminary eligibility screening', 'Rekomendasi jalur sertifikasi'],
    color: 'blue',
  },
  {
    id: 'apply',
    label: 'APPLY',
    icon: '📋',
    title: 'Pengurusan Dokumen & Pengajuan',
    desc: 'SIAP membantu melengkapi, memeriksa, dan mempersiapkan seluruh dokumen yang diperlukan untuk pengajuan ke LSP.',
    siap: ['Checklist dokumen per jabatan & jenjang', 'Pemeriksaan kelengkapan dokumen awal', 'Panduan pengisian FR.APL.01 & FR.APL.02', 'Monitoring kelengkapan dokumen', 'Panduan proses pengajuan ke LSP'],
    color: 'indigo',
  },
  {
    id: 'prepare',
    label: 'PREPARE',
    icon: '📚',
    title: 'Persiapan Uji Kompetensi',
    desc: 'Program persiapan berbasis AI sesuai skema dan jenjang — dari materi, latihan, simulasi, hingga analisis kesiapan.',
    siap: ['Diagnostic awal kompetensi', 'Materi per unit kompetensi SKKNI', 'Latihan soal adaptif per level', 'Simulasi wawancara asesor', 'Readiness Profile & rekomendasi'],
    color: 'violet',
  },
  {
    id: 'assess',
    label: 'ASSESS',
    icon: '⚖️',
    title: 'Asesmen Resmi (Eksternal)',
    desc: 'Asesmen resmi dilaksanakan oleh LSP/Asesor yang berwenang. SIAP tidak terlibat dalam proses ini.',
    siap: ['Panduan persiapan hari-H asesmen', 'Tips teknis per metode (Hardcopy/Paperless/AJJ)', 'Reminder jadwal & checklist hari-H'],
    external: ['Pelaksanaan asesmen oleh LSP/Asesor', 'Keputusan kompeten/belum kompeten', 'Penerbitan sertifikat resmi'],
    color: 'amber',
  },
  {
    id: 'certified',
    label: 'CERTIFIED',
    icon: '🏆',
    title: 'Sertifikat & Monitoring',
    desc: 'Setelah SKK terbit, SIAP membantu menyimpan profil profesional dan memantau masa berlaku untuk renewal.',
    siap: ['Penyimpanan profil sertifikasi', 'Reminder masa berlaku SKK', 'Panduan surveillance & PKB', 'Persiapan re-sertifikasi & upgrade jenjang'],
    color: 'emerald',
  },
];

const packages = [
  {
    id: 'basic',
    name: 'SIAP Basic',
    subtitle: 'Konsultasi & Checklist',
    price: 'Gratis',
    priceNote: 'Tanpa biaya',
    color: 'slate',
    features: [
      'Konsultasi AI — kelayakan jabatan SKK',
      'Checklist dokumen per jabatan',
      'FAQ & panduan proses',
      'Info LSP & biaya asesmen',
      'Akses Knowledge Base regulasi',
    ],
    cta: 'Mulai Gratis',
    href: '/skk-coach/chat?agent=kelayakan',
    highlight: false,
  },
  {
    id: 'assisted',
    name: 'SIAP Assisted',
    subtitle: 'Dokumen + Pendampingan',
    price: 'Hubungi Kami',
    priceNote: 'Sesuai kebutuhan',
    color: 'blue',
    features: [
      'Semua fitur SIAP Basic',
      'Pemeriksaan kelengkapan dokumen',
      'Panduan pengisian FR.APL.01 & FR.APL.02',
      'Generator APL.02 berbasis AI',
      'Monitoring progres dokumen',
      'Pendampingan proses pengajuan',
    ],
    cta: 'Tanya Lebih Lanjut',
    href: '/chat?q=Saya ingin menggunakan layanan SIAP Assisted untuk pengurusan dokumen SKK. Bisa jelaskan prosesnya?',
    highlight: false,
  },
  {
    id: 'siap',
    name: 'SIAP Complete',
    subtitle: 'Dokumen + Persiapan',
    price: 'Hubungi Kami',
    priceNote: 'Paket terlengkap',
    color: 'amber',
    features: [
      'Semua fitur SIAP Assisted',
      'Diagnostic kompetensi awal',
      'Program belajar terstruktur per unit',
      'Bank soal latihan per skema & level',
      'Simulasi wawancara asesor AI',
      'Readiness Profile & gap analysis',
      'Panduan hari-H asesmen',
    ],
    cta: 'Pilih Paket Ini',
    href: '/chat?q=Saya tertarik dengan SIAP Complete — paket pengurusan dokumen SKK plus persiapan uji kompetensi. Apa saja yang termasuk dan bagaimana memulainya?',
    highlight: true,
  },
  {
    id: 'pro',
    name: 'SIAP Corporate',
    subtitle: 'Untuk Perusahaan (BUJK)',
    price: 'Hubungi Kami',
    priceNote: 'Per perusahaan',
    color: 'violet',
    features: [
      'Pengelolaan banyak personel sekaligus',
      'Dashboard SKK workforce perusahaan',
      'Monitoring masa berlaku SKK personel',
      'Pengurusan SKK massal (bulk)',
      'Program persiapan kelas/cohort',
      'Laporan kompetensi tenaga kerja',
      'Dedicated support',
    ],
    cta: 'Hubungi Tim Kami',
    href: '/chat?q=Perusahaan kami membutuhkan layanan SIAP Corporate untuk mengelola sertifikasi SKK banyak personel sekaligus. Bagaimana cara kerjanya?',
    highlight: false,
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; badge: string; stepBg: string }> = {
  blue: { border: 'border-blue-500/40', bg: 'from-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300', stepBg: 'bg-blue-500' },
  indigo: { border: 'border-indigo-500/40', bg: 'from-indigo-500/10', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300', stepBg: 'bg-indigo-500' },
  violet: { border: 'border-violet-500/40', bg: 'from-violet-500/10', text: 'text-violet-400', badge: 'bg-violet-500/20 text-violet-300', stepBg: 'bg-violet-500' },
  amber: { border: 'border-amber-500/40', bg: 'from-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300', stepBg: 'bg-amber-500' },
  emerald: { border: 'border-emerald-500/40', bg: 'from-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300', stepBg: 'bg-emerald-500' },
  slate: { border: 'border-slate-500/40', bg: 'from-slate-500/10', text: 'text-slate-300', badge: 'bg-slate-600/50 text-slate-300', stepBg: 'bg-slate-500' },
};

const pkgColorMap: Record<string, { header: string; cta: string; border: string; badge: string }> = {
  slate: { header: 'from-slate-700 to-slate-800', cta: 'bg-slate-600 hover:bg-slate-500', border: 'border-slate-700', badge: '' },
  blue: { header: 'from-blue-700 to-blue-800', cta: 'bg-blue-600 hover:bg-blue-500', border: 'border-blue-700/50', badge: '' },
  amber: { header: 'from-amber-600 to-orange-700', cta: 'bg-amber-500 hover:bg-amber-400 text-slate-900', border: 'border-amber-500/50', badge: '⭐ Terpopuler' },
  violet: { header: 'from-violet-700 to-violet-800', cta: 'bg-violet-600 hover:bg-violet-500', border: 'border-violet-700/50', badge: '' },
};

const faqs = [
  {
    q: 'Apa bedanya SIAP SKK dengan LSP?',
    a: 'SIAP SKK bukan LSP dan bukan pelaksana asesmen resmi. SIAP berperan SEBELUM proses asesmen: membantu persiapan dokumen, kelayakan, pembelajaran, dan simulasi. Asesmen resmi dan keputusan kompeten/belum kompeten tetap menjadi kewenangan LSP dan Asesor BNSP.',
  },
  {
    q: 'Apakah menggunakan SIAP Certify menjamin saya mendapat SKK?',
    a: 'Tidak. SIAP tidak memberikan jaminan kelulusan atau menjanjikan hasil asesmen. SIAP membantu Anda lebih siap dan lebih terorganisir dalam proses sertifikasi. Keputusan sertifikasi sepenuhnya ada di tangan LSP/Asesor yang berwenang berdasarkan regulasi BNSP.',
  },
  {
    q: 'Apa saja dokumen yang dibantu SIAP?',
    a: 'SIAP membantu checklist dan panduan pengisian dokumen seperti FR.APL.01, FR.APL.02, surat keterangan kerja, portofolio, ijazah, dan dokumen pendukung per jabatan SKK. Pemeriksaan SIAP bersifat administratif — verifikasi resmi tetap dilakukan LSP.',
  },
  {
    q: 'Berapa lama proses pengurusan SKK?',
    a: 'Proses di sisi SIAP (persiapan dokumen dan pendampingan) bisa berlangsung 1–4 minggu tergantung kelengkapan dokumen Anda. Proses selanjutnya di LSP (penjadwalan, asesmen, penerbitan sertifikat) bergantung pada kebijakan LSP yang dipilih — SIAP tidak dapat mengontrol timeline ini.',
  },
  {
    q: 'Bisakah perusahaan mendaftarkan banyak karyawan sekaligus?',
    a: 'Ya. Paket SIAP Corporate dirancang khusus untuk BUJK yang ingin mengelola sertifikasi SKK banyak personel sekaligus, dengan dashboard workforce dan monitoring masa berlaku SKK secara terpusat.',
  },
  {
    q: 'Apakah SIAP bisa membantu perpanjangan SKK (renewal)?',
    a: 'Ya. SIAP membantu persiapan dokumen dan panduan untuk proses surveillance (perpanjangan SKK 5 tahunan) dan re-sertifikasi, termasuk reminder masa berlaku dan panduan Pengembangan Keprofesian Berkelanjutan (PKB).',
  },
];

export default function SIAPCertifyPage() {
  const [activeStep, setActiveStep] = useState('check');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const activeJourney = journey.find(j => j.id === activeStep) || journey[0];
  const ac = colorMap[activeJourney.color];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/skk" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm mb-4 transition-colors">
            ← SKK Hub
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4 ml-4">
            🏛️ Layanan Sertifikasi SKK
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">SIAP CERTIFY</span>
          </h1>
          <p className="text-slate-300 text-xl font-medium mb-2">Layanan Pengurusan & Pendampingan Sertifikasi SKK</p>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            Dari cek kelayakan hingga dokumen siap — SIAP mendampingi proses administrasi sertifikasi SKK konstruksi Anda secara terstruktur dan akuntabel.
          </p>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-5 mb-10">
          <div className="flex gap-3">
            <span className="text-2xl shrink-0">⚖️</span>
            <div>
              <h3 className="text-amber-400 font-bold mb-1">Posisi SIAP SKK yang Jelas</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                <strong className="text-white">SIAP bukan LSP dan bukan Asesor.</strong> SIAP membantu persiapan administrasi dan kompetensi <em>sebelum</em> proses asesmen resmi.
                Asesmen, keputusan kompeten/belum kompeten, dan penerbitan sertifikat SKK sepenuhnya merupakan kewenangan LSP berlisensi BNSP dan Asesor yang ditugaskan.
                SIAP <strong className="text-white">tidak menjanjikan kelulusan</strong> dan tidak dapat mempengaruhi keputusan asesor.
              </p>
            </div>
          </div>
        </div>

        {/* Journey — CHECK → CERTIFIED */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Perjalanan Sertifikasi SKK</h2>
            <p className="text-slate-400 text-sm">Klik setiap tahap untuk melihat peran SIAP</p>
          </div>

          {/* Step pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {journey.map((j, idx) => {
              const c = colorMap[j.color];
              const isActive = activeStep === j.id;
              return (
                <button
                  key={j.id}
                  onClick={() => setActiveStep(j.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    isActive ? `${c.border} ${c.badge} border-2` : 'border-slate-700 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span>{j.icon}</span>
                  <span>{j.label}</span>
                  {idx < journey.length - 1 && <span className="text-slate-600 hidden sm:inline">›</span>}
                </button>
              );
            })}
          </div>

          {/* Active step detail */}
          <div className={`bg-gradient-to-br ${ac.bg} to-slate-800/60 border ${ac.border} rounded-2xl p-6 transition-all`}>
            <div className="flex items-start gap-4 mb-5">
              <div className={`w-14 h-14 rounded-xl bg-slate-800 border ${ac.border} flex items-center justify-center text-3xl shrink-0`}>
                {activeJourney.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ac.badge}`}>{activeJourney.label}</span>
                  {activeStep === 'assess' && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-600/50 text-slate-400">External Process</span>
                  )}
                </div>
                <h3 className={`text-xl font-bold ${ac.text} mb-1`}>{activeJourney.title}</h3>
                <p className="text-slate-400 text-sm">{activeJourney.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-400 text-xs flex items-center justify-center font-bold">✓</span>
                  Yang SIAP Lakukan
                </h4>
                <ul className="space-y-2">
                  {activeJourney.siap.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {activeJourney.external && (
                <div>
                  <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-400 text-xs flex items-center justify-center font-bold">!</span>
                    Kewenangan LSP/Asesor (bukan SIAP)
                  </h4>
                  <ul className="space-y-2">
                    {activeJourney.external.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300/80">
                    Keputusan pada tahap ini sepenuhnya berada pada proses asesmen resmi. SIAP hanya membantu persiapan teknis hari-H.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Packages */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Paket Layanan SIAP CERTIFY</h2>
            <p className="text-slate-400 text-sm">Pilih sesuai kebutuhan — dari konsultasi mandiri hingga pendampingan penuh</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map(pkg => {
              const pc = pkgColorMap[pkg.color];
              return (
                <div
                  key={pkg.id}
                  className={`border ${pc.border} rounded-2xl overflow-hidden flex flex-col ${pkg.highlight ? 'ring-2 ring-amber-500/60' : ''}`}
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-br ${pc.header} p-5`}>
                    {pc.badge && (
                      <div className="text-xs font-bold text-amber-300 mb-2">{pc.badge}</div>
                    )}
                    <div className="text-lg font-bold text-white">{pkg.name}</div>
                    <div className="text-slate-300 text-xs mb-3">{pkg.subtitle}</div>
                    <div className="text-2xl font-black text-white">{pkg.price}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{pkg.priceNote}</div>
                  </div>

                  {/* Features */}
                  <div className="p-5 bg-slate-800/60 flex-1">
                    <ul className="space-y-2">
                      {pkg.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="p-4 bg-slate-800/60 border-t border-slate-700/50">
                    <Link
                      href={pkg.href}
                      className={`block text-center py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-colors ${pc.cta}`}
                    >
                      {pkg.cta} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What SIAP does vs doesn't */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 mb-12">
          <h2 className="text-white font-bold text-xl mb-6 text-center">SIAP Membantu Apa? Dan Apa yang Bukan Peran SIAP?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">✓</span>
                SIAP Membantu
              </h3>
              <ul className="space-y-3">
                {[
                  'Konsultasi kelayakan dan rekomendasi jabatan SKK',
                  'Pemeriksaan kelengkapan dokumen awal (administratif)',
                  'Panduan pengisian FR.APL.01 dan FR.APL.02',
                  'Persiapan materi, latihan soal, dan simulasi uji kompetensi',
                  'Analisis kesiapan (Readiness Profile) — bukan prediksi kelulusan',
                  'Monitoring progres persiapan dan dokumen',
                  'Reminder masa berlaku SKK dan panduan renewal',
                  'Komunikasi dan koordinasi dengan pelanggan',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-sm">✕</span>
                Bukan Peran SIAP
              </h3>
              <ul className="space-y-3">
                {[
                  'Pelaksanaan asesmen resmi (domain LSP/Asesor BNSP)',
                  'Keputusan kompeten atau belum kompeten',
                  'Penerbitan atau penandatanganan sertifikat SKK',
                  'Verifikasi resmi dokumen (dilakukan LSP)',
                  'Penjaminan kelulusan atau jaminan hasil asesmen',
                  'Mengakses atau mengoperasikan sistem resmi BNSP/LPJK atas nama peserta',
                  'Mengarang atau memalsukan pengalaman/dokumen',
                  'Menyatakan peserta "pasti kompeten" sebelum asesmen',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-red-400 shrink-0 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Alat Pendukung */}
        <div className="mb-12">
          <h2 className="text-white font-bold text-xl mb-6 text-center">Alat SIAP SKK yang Mendukung Proses Sertifikasi</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: '🔍', name: 'Cek Kelayakan', href: '/skk-coach/chat?agent=kelayakan', desc: 'Jabatan SKK mana yang cocok' },
              { icon: '📋', name: 'Cek Persyaratan', href: '/sertifikasi', desc: '200+ jabatan & syarat dokumen' },
              { icon: '📝', name: 'Generator APL.02', href: '/apl02-generator', desc: 'FR.APL.02 berbasis AI' },
              { icon: '📄', name: 'Cek Dokumen', href: '/dokumen', desc: 'Checklist per jabatan' },
              { icon: '🗺️', name: 'Timeline SKK', href: '/timeline-skk', desc: '8 tahap proses sertifikasi' },
              { icon: '💰', name: 'Biaya SKK', href: '/biaya-skk', desc: 'Estimasi biaya per jabatan' },
            ].map(tool => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex flex-col items-center text-center p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/40 hover:bg-slate-800 transition-all"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{tool.icon}</div>
                <div className="font-semibold text-white text-xs group-hover:text-blue-400 transition-colors">{tool.name}</div>
                <div className="text-slate-500 text-xs mt-1 leading-snug">{tool.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-white font-bold text-xl mb-6">❓ Pertanyaan Umum tentang SIAP CERTIFY</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left gap-4"
                >
                  <span className="text-white text-sm font-medium">{faq.q}</span>
                  <span className={`text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-8">
          <div className="text-4xl mb-3">🏛️</div>
          <h2 className="text-white font-bold text-2xl mb-2">Mulai Konsultasi Gratis</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Ceritakan profil dan target SKK Anda. AI SIAP SKK akan menganalisis kelayakan, merekomendasikan jabatan, dan menjelaskan langkah pertama yang harus dilakukan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/chat?q=Saya ingin menggunakan layanan SIAP Certify untuk mengurus sertifikasi SKK. Bisa bantu saya mulai dari analisis kelayakan?"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors"
            >
              💬 Mulai Konsultasi dengan AI
            </Link>
            <Link
              href="/skk-coach/chat?agent=kelayakan"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-colors"
            >
              🔍 Cek Kelayakan SKK Saya
            </Link>
            <Link
              href="/timeline-skk"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-colors"
            >
              🗺️ Lihat Timeline Proses SKK
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
