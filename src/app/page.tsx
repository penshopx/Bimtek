import Link from 'next/link';

const features = [
  {
    icon: '📚',
    title: 'Knowledge Base',
    description: 'Panduan lengkap regulasi, standar, dan best practice konstruksi',
    href: '/knowledge-base',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: '🎓',
    title: 'BIMTEK',
    description: '65+ modul pelatihan dengan progress tracking & PKB points',
    href: '/bimtek',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: '✍️',
    title: 'Simulasi Quiz',
    description: '60+ soal interaktif untuk prepare ujian sertifikasi',
    href: '/quiz',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: '🧮',
    title: 'Solver',
    description: '6+ template perhitungan teknik sipil & manajemen proyek',
    href: '/solver',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: '🔧',
    title: 'Tools',
    description: 'Kalkulator RAB & Mix Design untuk perencanaan proyek',
    href: '/tools',
    color: 'from-cyan-500 to-teal-600',
  },
  {
    icon: '🔗',
    title: 'Matrix',
    description: 'Visualisasi koneksi antar subklasifikasi & jabatan kerja',
    href: '/matrix',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: '📋',
    title: 'Sertifikasi',
    description: 'Database 334 posisi pekerjaan & persyaratan SKK',
    href: '/sertifikasi',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: '✅',
    title: 'Certify',
    description: 'Guide lengkap proses sertifikasi tenaga konstruksi',
    href: '/certify',
    color: 'from-green-500 to-lime-600',
  },
  {
    icon: '💬',
    title: 'AI Chat',
    description: 'AI Assistant dengan 8 expert agents & toolbox lengkap',
    href: '/chat',
    color: 'from-slate-600 to-slate-800',
  },
];

const stats = [
  { value: '65+', label: 'Modul BIMTEK' },
  { value: '60+', label: 'Soal Quiz' },
  { value: '334', label: 'Posisi SKK' },
  { value: '8', label: 'AI Experts' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                BimtekKita
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Platform Pelatihan & Sertifikasi<br/>Tenaga Konstruksi Indonesia
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/bimtek"
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
              >
                🎓 Mulai Belajar
              </Link>
              <Link
                href="/sertifikasi"
                className="px-8 py-3 bg-slate-700/50 border border-slate-600 rounded-xl font-semibold hover:bg-slate-700 transition-all"
              >
                📋 Cari Sertifikasi
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

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">
            Fitur Lengkap
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk sukses di industri konstruksi Indonesia
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

      <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Si untuk Kemajuan Konstruksi Indonesia
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto">
              Dengan bimtek dan sertifikasi yang tepat, tingkatkan kompetensi dan kredibilitas Anda di industri konstruksi.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all"
            >
              <span className="mr-2">💬</span>
              Tanya AI Assistant
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2026 BimtekKita - Platform Pelatihan Konstruksi Indonesia</p>
        </div>
      </footer>
    </div>
  );
}
