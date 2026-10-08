'use client';

import { useState } from 'react';

const articles: { id: number; title: string; category: string; content: string; sourceUrl?: string }[] = [
  {
    id: 101,
    title: 'Permen PU No. 6 Tahun 2025 — Standar dan Pengawasan Perizinan Berusaha Sektor Pekerjaan Umum',
    category: 'Regulasi',
    content: 'Judul lengkap: Standar Kegiatan Usaha dan/atau Standar Produk/Jasa, Pelaksanaan Pengawasan, dan Pengenaan Sanksi pada Penyelenggaraan Perizinan Berusaha Berbasis Risiko Sektor Pekerjaan Umum. Regulasi ini bukan penetapan standar kompetensi per jabatan kerja. Untuk nomenklatur jabatan dan jenjang, lihat SK DJBK 114/KPTS/Dk/2024 beserta lampirannya dan skema LSP terkini.',
    sourceUrl: 'https://binakonstruksi.pu.go.id/pengumuman/peraturan-menteri-pekerjaan-umum-republik-indonesia-nomor-6-tahun-2025/',
  },
  {
    id: 102,
    title: 'KM PUPR No. 713/KPTS/M/2022 — Jabatan dan Kualifikasi SKK',
    category: 'SKK',
    content: 'Rujukan terkait jabatan dan kualifikasi tenaga kerja konstruksi. Jangan menganggap pengelompokan atau kode internal aplikasi sebagai kode resmi keputusan ini. Katalog SIAP SKK kini menampilkan nomenklatur baru dari lampiran SK DJBK 114/KPTS/Dk/2024; persyaratan sertifikasi harus dicocokkan kembali dengan skema LSP yang berlaku.',
  },
  {
    id: 103,
    title: 'SK DJBK No. 114/KPTS/DK/2024 — Penetapan Jabatan Kerja dan Jenjang Kualifikasi',
    category: 'SKK',
    content: 'Keputusan Direktur Jenderal Bina Konstruksi tentang penetapan jabatan kerja dan jenjang kualifikasi tenaga kerja konstruksi. Gunakan daftar jabatan dan jenjang dalam keputusan beserta lampirannya untuk mencocokkan jabatan kerja dengan skema sertifikasi yang dituju. Keputusan ini bukan pedoman pelaksanaan Asesmen Jarak Jauh (AJJ); ketentuan metode asesmen perlu dikonfirmasi kepada LSP yang berwenang.',
    sourceUrl: '/references/sk-djbk-114-2024.pdf',
  },
  {
    id: 104,
    title: 'Permen PUPR No. 12 Tahun 2021 — Pelaksanaan Pengembangan Keprofesian Berkelanjutan',
    category: 'SKK',
    content: 'Peraturan Menteri PUPR tentang pelaksanaan Pengembangan Keprofesian Berkelanjutan (PKB). Rujukan ini berkaitan dengan pelaksanaan kegiatan pengembangan keprofesian, bukan pedoman pengadaan jasa konstruksi. Pengakuan kegiatan dan kredit PKB harus mengikuti ketentuan yang berlaku serta pemeriksaan pihak berwenang; catatan belajar di SIAP SKK tidak otomatis menjadi kredit resmi.',
  },
  {
    id: 1,
    title: 'Peraturan Pemerintah No. 14 Tahun 2021',
    category: 'Regulasi',
    content: 'Perubahan atas Peraturan Pemerintah Nomor 22 Tahun 2020 tentang Peraturan Pelaksanaan Undang-Undang Nomor 2 Tahun 2017 tentang Jasa Konstruksi. Rujukan ini terkait penyelenggaraan jasa konstruksi, termasuk persyaratan kompetensi tenaga kerja konstruksi; bukan regulasi utama AMDAL atau izin lingkungan.',
    sourceUrl: '/references/sk-djbk-114-2024.pdf#page=125',
  },
  {
    id: 2,
    title: 'SNI 1726:2019 - Tata Cara Perencanaan Ketahanan Gempa',
    category: 'Standar',
    content: 'Standar Nasional Indonesia untuk tata cara perencanaan ketahanan gemap structures dan bangunan gedung sesuai dengan kondisi geologi Indonesia.',
  },
  {
    id: 3,
    title: 'SNI 2847:2019 - Tata Cara Perencanaan Beton',
    category: 'Standar',
    content: 'Standar untuk perencanaan struktur beton bertulang termasuk material, campuran, pengujian, dan kontrol kualitas.',
  },
  {
    id: 4,
    title: 'Perpres 16/2018 - Pengadaan Barang/Jasa Pemerintah',
    category: 'Regulasi',
    content: 'Regulasi tentang pengadaan barang/jasa pemerintah yang wajib diikuti oleh kontraktor dalam mengikuti tender proyek pemerintah.',
  },
  {
    id: 5,
    title: 'SKKNI Konstruksi Bidang Teknik Sipil',
    category: 'Sertifikasi',
    content: 'Skema Kompetensi Standar Nasional Indonesia untuk tenaga ahli teknik sipil termasuk persyaratan competency standard.',
  },
  {
    id: 6,
    title: 'UU No. 2/2017 - Jasa Konstruksi',
    category: 'Regulasi',
    content: 'Undang-undang tentang jasa konstruksi yang mengatur tentang berusaha, hak dan kewajiban, serta sanksi dalam sektor konstruksi.',
  },
  {
    id: 7,
    title: 'PermenPUPR 28/2015 - Standar Pengadaan',
    category: 'Regulasi',
    content: 'Standar dan pedoman pengadaan pekerjaan konstruksi melalui tender dan seleksi.',
  },
  {
    id: 8,
    title: 'SNI 6371:2015 - Keselamatan dan Kesehatan',
    category: 'K3',
    content: 'Standar keselamatan dan kesehatan kerja (K3) pada kegiatan konstruksi untuk melindungi pekerja dan lingkungan.',
  },
  {
    id: 9,
    title: 'ISO 9001:2015 - Sistem Manajemen Mutu',
    category: 'Manajemen',
    content: 'Standar internasional untuk sistem manajemen mutu yang applicable untuk perusahaan konstruksi.',
  },
  {
    id: 10,
    title: 'ISO 14001:2015 - Sistem Manajemen Lingkungan',
    category: 'Manajemen',
    content: 'Standar sistem manajemen lingkungan yang harus dipenuhi kontraktor untuk proyek berkelanjutan.',
  },
  {
    id: 11,
    title: 'Permenaker 10/2020 - K3 Konstruksi',
    category: 'K3',
    content: 'Peraturan Menteri Ketenagakerjaan tentang keselamatan dan kesehatan kerja konstruksi bangunan.',
  },
  {
    id: 12,
    title: 'SNI 2837:2018 - Tata Cara Campuran Beton',
    category: 'Standar',
    content: 'Cara uji dan spesifikasi campuran beton yang harus dipenuhi dalam pekerjaan struktural.',
  },
  {
    id: 13,
    title: 'PUBI 1982 - Tata Cara Pelaksanaan',
    category: 'Standar',
    content: 'Pedoman pelaksanaan pekerjaan utc dan drainase untuk jalan raya dan jembatan.',
  },
  {
    id: 14,
    title: 'AASHTO LRFD - Bridge Design',
    category: 'Standar',
    content: 'American Association of State Highway and Transportation Officials specification untuk desain jembatan.',
  },
  {
    id: 15,
    title: 'Konstruksi Baja - SNI 1729:2020',
    category: 'Standar',
    content: 'Spesifikasi untuk bangunan struktural baja termasuk desain, fabrikasi, dan erection.',
  },
  {
    id: 16,
    title: 'Manajemen Proyek - PMBOK Guide 7',
    category: 'Manajemen',
    content: 'Project Management Body of Knowledge untuk pengelolaan proyek konstruksi yang efektif.',
  },
];

const categories = ['Semua', 'SKK', 'Regulasi', 'Standar', 'Sertifikasi', 'K3', 'Manajemen'];

export default function KnowledgeBase() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredArticles = selectedCategory === 'Semua' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            📚 Knowledge Base
          </h1>
          <p className="text-lg text-slate-600">
            Regulasi SKK, standar teknis, dan best practice konstruksi Indonesia
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      article.category === 'Regulasi' ? 'bg-blue-100 text-blue-700' :
                      article.category === 'Standar' ? 'bg-green-100 text-green-700' :
                      article.category === 'Sertifikasi' ? 'bg-purple-100 text-purple-700' :
                      article.category === 'K3' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {article.title}
                  </h3>
                </div>
                <span className="text-2xl ml-4">
                  {expandedId === article.id ? '▲' : '▼'}
                </span>
              </button>
              
              {expandedId === article.id && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                  <p className="text-slate-600 leading-relaxed">
                    {article.content}
                  </p>
                  {article.sourceUrl && <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-blue-700 underline">Buka sumber rujukan</a>}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm">
          Total: {filteredArticles.length} artikel
        </div>
      </div>
    </div>
  );
}
