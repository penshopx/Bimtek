'use client';

import { useState } from 'react';

type Article = {
  id: number;
  title: string;
  category: string;
  content: string;
  sourceUrl?: string;
  sourceNote?: string;
};

const articles: Article[] = [
  {
    id: 101,
    title: 'Permen PU No. 6 Tahun 2025 — Standar Kegiatan Usaha dan/atau Standar Produk/Jasa, Pelaksanaan Pengawasan, dan Pengenaan Sanksi pada Penyelenggaraan Perizinan Berusaha Berbasis Risiko Sektor Pekerjaan Umum',
    category: 'Regulasi',
    content: 'Judul lengkap: Standar Kegiatan Usaha dan/atau Standar Produk/Jasa, Pelaksanaan Pengawasan, dan Pengenaan Sanksi pada Penyelenggaraan Perizinan Berusaha Berbasis Risiko Sektor Pekerjaan Umum. Regulasi ini bukan penetapan standar kompetensi per jabatan kerja. Untuk nomenklatur jabatan dan jenjang, lihat SK DJBK 114/KPTS/Dk/2024 beserta lampirannya dan skema LSP terkini.',
    sourceUrl: 'https://binakonstruksi.pu.go.id/pengumuman/peraturan-menteri-pekerjaan-umum-republik-indonesia-nomor-6-tahun-2025/',
    sourceNote: 'Pengumuman resmi Direktorat Jenderal Bina Konstruksi. Bukan naskah standar kompetensi per jabatan.',
  },
  {
    id: 102,
    title: 'KM PUPR No. 713/KPTS/M/2022 — Jabatan dan Kualifikasi SKK',
    category: 'SKK',
    content: 'Catatan rujukan lama aplikasi. Naskah dan status perubahan keputusan ini belum diverifikasi pada halaman ini; judul ringkasnya tidak boleh dijadikan dasar persyaratan. Jangan menganggap kode internal aplikasi sebagai kode resmi. Untuk nomenklatur yang tersedia, gunakan lampiran SK DJBK 114/KPTS/Dk/2024 dan cocokkan persyaratan dengan skema LSP yang dituju.',
  },
  {
    id: 103,
    title: 'SK DJBK No. 114/KPTS/Dk/2024 — Penetapan Jabatan Kerja dan Jenjang Kualifikasi atas Jabatan Kerja di Bidang Jasa Konstruksi',
    category: 'SKK',
    content: 'Keputusan Direktur Jenderal Bina Konstruksi tentang penetapan jabatan kerja dan jenjang kualifikasi tenaga kerja konstruksi. Gunakan daftar jabatan dan jenjang dalam keputusan beserta lampirannya untuk mencocokkan jabatan kerja dengan skema sertifikasi yang dituju. Keputusan ini bukan pedoman pelaksanaan Asesmen Jarak Jauh (AJJ); ketentuan metode asesmen perlu dikonfirmasi kepada LSP yang berwenang.',
    sourceUrl: '/references/sk-djbk-114-2024.pdf',
    sourceNote: 'Salinan keputusan dan lampiran dari dokumen yang diberikan pengguna. Bukan pengganti naskah SKKNI, elemen/KUK, atau skema LSP terkini.',
  },
  {
    id: 104,
    title: 'Permen PUPR No. 12 Tahun 2021 — Pelaksanaan Pengembangan Keprofesian Berkelanjutan',
    category: 'SKK',
    content: 'Peraturan Menteri PUPR tentang pelaksanaan Pengembangan Keprofesian Berkelanjutan (PKB). Rujukan ini berkaitan dengan pelaksanaan kegiatan pengembangan keprofesian, bukan pedoman pengadaan jasa konstruksi. Pengakuan kegiatan dan kredit PKB harus mengikuti ketentuan yang berlaku serta pemeriksaan pihak berwenang; catatan belajar di SIAP SKK tidak otomatis menjadi kredit resmi.',
    sourceUrl: 'https://peraturan.bpk.go.id/Download/211273/Permen%20PUPR_12_2021.pdf',
    sourceNote: 'Naskah baseline 2021, halaman 1: judul dan cakupan. Perubahan aturan dan ketentuan pelaksanaan perlu diperiksa sebelum menentukan kewajiban peserta.',
  },
  {
    id: 1,
    title: 'Peraturan Pemerintah No. 14 Tahun 2021',
    category: 'Regulasi',
    content: 'Perubahan atas Peraturan Pemerintah Nomor 22 Tahun 2020 tentang Peraturan Pelaksanaan Undang-Undang Nomor 2 Tahun 2017 tentang Jasa Konstruksi. Rujukan ini terkait penyelenggaraan jasa konstruksi, termasuk persyaratan kompetensi tenaga kerja konstruksi; bukan regulasi utama AMDAL atau izin lingkungan.',
    sourceUrl: 'https://peraturan.bpk.go.id/Download/154514/PP%20Nomor%2014%20Tahun%202021.pdf',
    sourceNote: 'Naskah PP 14/2021, halaman 1: perubahan atas PP 22/2020. Tautan ini menuju naskah PP, bukan catatan kaki dokumen lain.',
  },
  {
    id: 2,
    title: 'SNI 1726:2019 - Tata Cara Perencanaan Ketahanan Gempa',
    category: 'Standar',
    content: 'Rujukan perencanaan ketahanan gempa untuk struktur bangunan gedung dan nongedung. Ringkasan ini bukan naskah standar; nomor, judul lengkap, status edisi, dan ketentuan teknis perlu dicocokkan dengan katalog serta naskah resmi BSN.',
  },
  {
    id: 3,
    title: 'SNI 2847:2019 - Tata Cara Perencanaan Beton',
    category: 'Standar',
    content: 'Rujukan persyaratan beton struktural untuk bangunan gedung. Gunakan naskah resmi untuk ketentuan desain, material, dan pelaksanaan; ringkasan ini tidak menggantikan standar atau metode uji yang dirujuk.',
  },
  {
    id: 4,
    title: 'Perpres 16/2018 - Pengadaan Barang/Jasa Pemerintah',
    category: 'Regulasi',
    content: 'Baseline pengadaan barang/jasa pemerintah tahun 2018. Perubahan dan ketentuan pelaksanaan perlu diperiksa; jangan menggunakan naskah awal seolah seluruh pasalnya masih merupakan ketentuan terbaru.',
  },
  {
    id: 5,
    title: 'SKKNI Konstruksi Bidang Teknik Sipil',
    category: 'Sertifikasi',
    content: 'SKKNI adalah Standar Kompetensi Kerja Nasional Indonesia, bukan nama satu skema sertifikasi. Daftar unit, elemen, dan KUK harus berasal dari naskah standar untuk jabatan yang sesuai. Nomor/tahun naskah dan pemaketan skema belum tersedia pada catatan umum ini; jangan menyusun persyaratan hanya dari nama bidang.',
  },
  {
    id: 6,
    title: 'UU No. 2/2017 - Jasa Konstruksi',
    category: 'Regulasi',
    content: 'Baseline Undang-Undang tentang Jasa Konstruksi tahun 2017. Rujukan mencakup penyelenggaraan jasa konstruksi, hak, kewajiban, dan sanksi. Perubahan undang-undang serta peraturan pelaksanaannya perlu dicocokkan sebelum digunakan sebagai dasar keputusan.',
  },
  {
    id: 7,
    title: 'Permen PUPR 28/2015 — Identitas rujukan lama perlu verifikasi',
    category: 'Regulasi',
    content: 'Nomor ini sebelumnya dikaitkan dengan standar pengadaan, tetapi naskah dan judul resminya belum tersedia untuk memverifikasi keterkaitan tersebut. Jangan gunakan catatan ini sebagai pedoman tender atau dasar persyaratan sebelum sumber resmi diperiksa.',
  },
  {
    id: 8,
    title: 'SNI 6371:2015 — Identitas rujukan lama perlu verifikasi',
    category: 'Standar',
    content: 'Keterkaitan nomor ini dengan K3 konstruksi belum terverifikasi. Klaim K3 dari ringkasan lama tidak digunakan sebagai pedoman. Cocokkan nomor, judul, tahun, dan status standar dengan katalog resmi BSN sebelum memakai rujukan ini.',
  },
  {
    id: 9,
    title: 'ISO 9001:2015 - Sistem Manajemen Mutu',
    category: 'Manajemen',
    content: 'Referensi sistem manajemen mutu yang dapat digunakan organisasi, termasuk perusahaan konstruksi. Kesesuaian dan penerapannya perlu mengikuti naskah serta kebutuhan organisasi; membaca ringkasan ini tidak berarti tersertifikasi ISO.',
  },
  {
    id: 10,
    title: 'ISO 14001:2015 - Sistem Manajemen Lingkungan',
    category: 'Manajemen',
    content: 'Referensi sistem manajemen lingkungan bagi organisasi. Kewajiban penerapannya bergantung pada ketentuan dan kontrak yang relevan; jangan menyatakan semua kontraktor wajib tersertifikasi berdasarkan ringkasan ini.',
  },
  {
    id: 11,
    title: 'Permen PUPR No. 10 Tahun 2021 — Pedoman Sistem Manajemen Keselamatan Konstruksi',
    category: 'K3',
    content: 'Pedoman Sistem Manajemen Keselamatan Konstruksi (SMKK). Rujukan ini menggantikan atribusi K3 konstruksi yang keliru pada catatan lama Permenaker 10/2020. Penerapan teknis harus merujuk naskah, lampiran, serta ketentuan yang berlaku pada pekerjaan terkait.',
    sourceUrl: 'https://peraturan.bpk.go.id/Download/211232/Permen%20PUPR_10_2021.pdf',
    sourceNote: 'Naskah Permen PUPR 10/2021, halaman 1: judul dan dasar pengaturan SMKK. Ketersediaan sumber bukan penetapan bahwa seluruh aturan belum berubah.',
  },
  {
    id: 12,
    title: 'SNI 2837:2018 — Identitas rujukan lama perlu verifikasi',
    category: 'Standar',
    content: 'Nomor, tahun, dan keterkaitan dengan campuran beton dari catatan lama belum terverifikasi. Jangan menggunakan ringkasan sebelumnya sebagai cara uji atau spesifikasi. Dibutuhkan pencocokan dengan katalog dan naskah resmi BSN.',
  },
  {
    id: 13,
    title: 'PUBI 1982 — Rujukan historis perlu verifikasi',
    category: 'Standar',
    content: 'Rujukan historis yang dicatat aplikasi. Identitas dokumen, cakupan, dan kesesuaiannya dengan standar pekerjaan saat ini perlu diperiksa. Klaim ringkasan lama tentang pelaksanaan jalan dan drainase tidak dijadikan ketentuan teknis.',
  },
  {
    id: 14,
    title: 'AASHTO LRFD - Bridge Design',
    category: 'Standar',
    content: 'Referensi spesifikasi desain jembatan berbasis LRFD dari AASHTO. Edisi dan naskah yang digunakan belum dicatat; kesesuaian dengan ketentuan Indonesia dan kontrak proyek harus diperiksa terpisah.',
  },
  {
    id: 15,
    title: 'Konstruksi Baja - SNI 1729:2020',
    category: 'Standar',
    content: 'Referensi spesifikasi bangunan gedung baja struktural. Nomor, judul lengkap, edisi, dan ketentuan penerapannya perlu diperiksa pada naskah resmi BSN; ringkasan ini bukan pedoman perhitungan desain.',
  },
  {
    id: 16,
    title: 'Manajemen Proyek - PMBOK Guide 7',
    category: 'Manajemen',
    content: 'Referensi pengelolaan proyek dari PMI, edisi ketujuh sebagaimana dicatat aplikasi. Ini bukan regulasi konstruksi Indonesia. Naskah, pembaruan edisi, dan kesesuaian praktik untuk proyek tertentu belum ditinjau pada halaman ini.',
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
            Knowledge Base
          </h1>
          <p className="text-lg text-slate-600">
            Regulasi SKK, standar teknis, dan best practice konstruksi Indonesia
          </p>
          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-left text-sm leading-relaxed text-blue-950">
            <p className="font-semibold">Ringkasan untuk belajar, bukan penetapan resmi</p>
            <p className="mt-1">“Sumber tersedia” berarti ada dokumen atau halaman rujukan, bukan jaminan aturan masih berlaku tanpa perubahan. “Perlu verifikasi referensi” berarti identitas, naskah, atau edisinya belum ditinjau lengkap. Gunakan naskah dan skema LSP yang sesuai sebelum menetapkan persyaratan, kelayakan, atau kredit PKB.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8" role="group" aria-label="Filter kategori referensi">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={selectedCategory === cat}
              onClick={() => { setSelectedCategory(cat); setExpandedId(null); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700`}
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
                type="button"
                id={`reference-toggle-${article.id}`}
                aria-expanded={expandedId === article.id}
                aria-controls={`reference-panel-${article.id}`}
                onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700"
              >
                <span className="flex-1 min-w-0">
                  <span className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      article.category === 'Regulasi' ? 'bg-blue-100 text-blue-700' :
                      article.category === 'Standar' ? 'bg-green-100 text-green-700' :
                      article.category === 'Sertifikasi' ? 'bg-purple-100 text-purple-700' :
                      article.category === 'K3' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {article.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${article.sourceUrl ? 'bg-blue-100 text-blue-900' : 'bg-amber-100 text-amber-950'}`}>
                      {article.sourceUrl ? 'Sumber tersedia' : 'Perlu verifikasi referensi'}
                    </span>
                  </span>
                  <span className="block text-base sm:text-lg font-semibold text-slate-800 break-words">
                    {article.title}
                  </span>
                </span>
                <span className="text-xl ml-3 shrink-0" aria-hidden="true">
                  {expandedId === article.id ? '▲' : '▼'}
                </span>
              </button>
              
              {expandedId === article.id && (
                <div id={`reference-panel-${article.id}`} role="region" aria-labelledby={`reference-toggle-${article.id}`} className="px-4 sm:px-5 pb-5 border-t border-slate-100 pt-4">
                  <p className="text-slate-600 leading-relaxed">
                    {article.content}
                  </p>
                  {article.sourceNote && <p className="mt-3 text-sm leading-relaxed text-slate-700">{article.sourceNote}</p>}
                  {article.sourceUrl ? (
                    <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-blue-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-700">
                      Buka sumber rujukan <span className="text-sm">(tab baru)</span>
                    </a>
                  ) : (
                    <p className="mt-3 text-sm font-medium text-amber-900">Tautan naskah terverifikasi belum tersedia. Ringkasan ini belum dapat digunakan sebagai dasar ketentuan resmi.</p>
                  )}
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
