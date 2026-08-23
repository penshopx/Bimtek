'use client';

import { useState, useMemo } from 'react';

type Region = 'all' | 'nasional' | 'jawa' | 'sumatera' | 'kalimantan' | 'sulawesi' | 'balinusra' | 'malukupapua';
type Category = 'all' | 'sipil' | 'arsitektur' | 'mep' | 'manajemen' | 'k3' | 'spesialis';

interface LSP {
  id: string;
  name: string;
  shortName: string;
  type: 'nasional' | 'daerah' | 'sektoral';
  accreditation: 'BNSP' | 'BNSP + LPJK';
  status: 'aktif' | 'aktif-terbatas';
  regions: Region[];
  categories: Category[];
  jabatanFokus: string[];
  description: string;
  website?: string;
  contact: string;
  notes?: string;
  highlight?: string;
}

const lsps: LSP[] = [
  {
    id: 'lsp-gapensi',
    name: 'LSP Gapensi',
    shortName: 'LSP Gapensi',
    type: 'sektoral',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['nasional', 'jawa', 'sumatera', 'kalimantan', 'sulawesi', 'balinusra'],
    categories: ['sipil', 'manajemen'],
    jabatanFokus: ['Ahli Teknik Jalan', 'Ahli Bangunan Gedung', 'Pelaksana Bangunan', 'Mandor Konstruksi', 'Ahli Manajemen Konstruksi'],
    description: 'LSP bentukan Gabungan Pelaksana Konstruksi Nasional Indonesia. Salah satu LSP terbesar dan paling aktif di bidang konstruksi sipil dan bangunan gedung. Beroperasi melalui jaringan TUK di seluruh provinsi.',
    website: 'lsp-gapensi.or.id',
    contact: 'info@lsp-gapensi.or.id',
    highlight: 'Terluas',
    notes: 'Anggota Gapensi mendapat kemudahan akses dan potongan biaya di beberapa cabang.',
  },
  {
    id: 'lsp-konstruksi',
    name: 'LSP Jasa Konstruksi',
    shortName: 'LSP Jasa Konstruksi',
    type: 'sektoral',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['nasional', 'jawa', 'sumatera'],
    categories: ['sipil', 'arsitektur', 'mep', 'manajemen'],
    jabatanFokus: ['Ahli Teknik Bangunan Gedung', 'Ahli Arsitektur', 'Ahli MEP', 'Ahli Manajemen Proyek', 'Ahli K3 Konstruksi'],
    description: 'LSP sektoral dengan cakupan multi-disiplin konstruksi — sipil, arsitektur, MEP, dan manajemen. Menyediakan skema sertifikasi dari level pratama hingga utama.',
    website: 'lspjasakonstruksi.com',
    contact: 'sekretariat@lspjasakonstruksi.com',
    highlight: 'Multi-disiplin',
  },
  {
    id: 'lsp-gapeksindo',
    name: 'LSP Gapeksindo',
    shortName: 'LSP Gapeksindo',
    type: 'sektoral',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['nasional', 'jawa', 'sumatera', 'kalimantan', 'sulawesi'],
    categories: ['sipil', 'manajemen', 'spesialis'],
    jabatanFokus: ['Pelaksana Lapangan', 'Ahli Teknik Sipil', 'Quantity Surveyor', 'Ahli Manajemen Konstruksi'],
    description: 'LSP di bawah Gabungan Pengusaha Konstruksi Indonesia. Fokus pada jabatan pelaksana lapangan dan tenaga teknis konstruksi umum.',
    website: 'lsp-gapeksindo.or.id',
    contact: 'info@lsp-gapeksindo.or.id',
  },
  {
    id: 'lsp-inkindo',
    name: 'LSP Konsultan Konstruksi Indonesia',
    shortName: 'LSP INKINDO',
    type: 'sektoral',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['nasional', 'jawa', 'sumatera', 'kalimantan', 'sulawesi'],
    categories: ['sipil', 'arsitektur', 'mep', 'manajemen'],
    jabatanFokus: ['Ahli Teknik (semua bidang)', 'Ahli Manajemen Proyek', 'Ahli Perencanaan Wilayah', 'Quantity Surveyor'],
    description: 'LSP untuk profesi konsultan konstruksi, di bawah INKINDO. Fokus pada jabatan teknis dan manajemen level madya-utama untuk konsultan perencanaan dan pengawasan.',
    website: 'lsp-inkindo.or.id',
    contact: 'info@lsp-inkindo.or.id',
    highlight: 'Konsultan',
    notes: 'Direkomendasikan bagi profesional konsultan perencana/pengawas.',
  },
  {
    id: 'lsp-k3',
    name: 'LSP K3 Konstruksi Indonesia',
    shortName: 'LSP K3 Konstruksi',
    type: 'sektoral',
    accreditation: 'BNSP',
    status: 'aktif',
    regions: ['nasional', 'jawa', 'sumatera', 'kalimantan'],
    categories: ['k3'],
    jabatanFokus: ['Ahli K3 Konstruksi (Pratama)', 'Ahli K3 Konstruksi (Muda)', 'Ahli K3 Konstruksi (Madya)', 'Petugas K3 Lapangan'],
    description: 'LSP spesialis keselamatan dan kesehatan kerja (K3) di bidang konstruksi. Merupakan pilihan utama untuk sertifikasi jalur K3 yang diakui BNSP dan PUPR.',
    website: 'lspk3konstruksi.co.id',
    contact: 'admin@lspk3konstruksi.co.id',
    highlight: 'Spesialis K3',
    notes: 'Wajib untuk proyek yang mensyaratkan tenaga ahli K3 konstruksi.',
  },
  {
    id: 'lsp-mep',
    name: 'LSP Mekanikal Elektrikal Plumbing',
    shortName: 'LSP MEP',
    type: 'sektoral',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['nasional', 'jawa'],
    categories: ['mep'],
    jabatanFokus: ['Ahli Teknik Mekanikal', 'Ahli Teknik Elektrikal', 'Ahli Sistem Plumbing', 'Teknisi HVAC', 'Ahli Instalasi Listrik'],
    description: 'LSP khusus bidang MEP (Mechanical, Electrical, Plumbing). Skema sertifikasi mencakup seluruh jabatan di bidang mekanikal, elektrikal, dan plumbing dari level teknisi hingga ahli.',
    contact: 'info@lspmep.id',
    highlight: 'Spesialis MEP',
  },
  {
    id: 'lsp-arsitektur',
    name: 'LSP Arsitek Indonesia',
    shortName: 'LSP Arsitek',
    type: 'sektoral',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['nasional', 'jawa', 'sumatera'],
    categories: ['arsitektur'],
    jabatanFokus: ['Ahli Arsitektur (Pratama s.d. Utama)', 'Ahli Desain Interior', 'Ahli Perencanaan Wilayah & Kota', 'Ahli Konservasi Bangunan'],
    description: 'LSP dengan afiliasi Ikatan Arsitek Indonesia (IAI). Fokus pada sertifikasi profesi arsitek untuk semua level KKNI dan jabatan turunan arsitektur.',
    website: 'lsp-arsitek.or.id',
    contact: 'sekretariat@lsp-arsitek.or.id',
    notes: 'Sertifikasi dari LSP ini diakui secara internasional melalui ASEAN Architect.',
  },
  {
    id: 'lsp-bangunan-gedung',
    name: 'LSP Bangunan Gedung & Infrastruktur',
    shortName: 'LSP Bangun Gedung',
    type: 'sektoral',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['jawa', 'sumatera', 'kalimantan'],
    categories: ['sipil', 'arsitektur', 'manajemen'],
    jabatanFokus: ['Ahli Bangunan Gedung', 'Pelaksana Gedung', 'Pengawas Lapangan', 'Ahli Manajemen Konstruksi'],
    description: 'Fokus pada proyek bangunan gedung: hunian, perkantoran, komersial, dan fasilitas publik. Memiliki TUK di kota-kota besar Pulau Jawa dan Sumatera.',
    contact: 'info@lsp-bangungedung.id',
  },
  {
    id: 'lsp-sipil-lingkungan',
    name: 'LSP Sipil dan Lingkungan',
    shortName: 'LSP Sipil-Lingkungan',
    type: 'sektoral',
    accreditation: 'BNSP',
    status: 'aktif',
    regions: ['jawa', 'sumatera'],
    categories: ['sipil', 'spesialis'],
    jabatanFokus: ['Ahli Geoteknik', 'Ahli Sumber Daya Air', 'Ahli Lingkungan Konstruksi', 'Ahli Drainase'],
    description: 'Spesialis di bidang teknik sipil dan rekayasa lingkungan: geoteknik, sumber daya air, drainase, dan pengelolaan lingkungan konstruksi.',
    contact: 'info@lsp-sipillingkungan.id',
    highlight: 'Spesialis SDA',
  },
  {
    id: 'lsp-jembatan',
    name: 'LSP Jembatan dan Infrastruktur',
    shortName: 'LSP Jembatan',
    type: 'sektoral',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['nasional', 'jawa'],
    categories: ['sipil', 'spesialis'],
    jabatanFokus: ['Ahli Teknik Jembatan', 'Ahli Jalan Raya', 'Ahli Terowongan', 'Ahli Teknik Dermaga'],
    description: 'Spesialis sertifikasi infrastruktur transportasi: jembatan, jalan, terowongan, dan dermaga. Menjadi pilihan untuk proyek infrastruktur berskala besar.',
    contact: 'info@lsp-jembatan.id',
    highlight: 'Infrastruktur',
    notes: 'Direkomendasikan untuk profesional di proyek jalan tol, jembatan, dan infrastruktur PUPR.',
  },
  {
    id: 'lsp-manpro',
    name: 'LSP Manajemen Proyek Konstruksi',
    shortName: 'LSP ManPro',
    type: 'sektoral',
    accreditation: 'BNSP',
    status: 'aktif',
    regions: ['jawa', 'sumatera', 'kalimantan'],
    categories: ['manajemen'],
    jabatanFokus: ['Project Manager Konstruksi', 'Ahli Manajemen Proyek', 'Site Manager', 'Quantity Surveyor', 'Cost Engineer'],
    description: 'Fokus pada jabatan manajemen dan pengendalian proyek konstruksi. Cocok untuk site manager, project manager, dan profesional QS/cost control.',
    contact: 'info@lsp-manpro.id',
    highlight: 'Manajemen',
  },
  {
    id: 'lsp-daerah-jabar',
    name: 'LSP Jasa Konstruksi Daerah Jawa Barat',
    shortName: 'LSP-JK Jabar',
    type: 'daerah',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['jawa'],
    categories: ['sipil', 'arsitektur', 'manajemen'],
    jabatanFokus: ['Ahli Bangunan Gedung', 'Ahli Teknik Jalan', 'Pelaksana Lapangan', 'Ahli Arsitektur'],
    description: 'LSP daerah di bawah koordinasi LPJKD Jawa Barat. Beroperasi di Bandung, Bekasi, Bogor, Cirebon, dan kota besar Jabar lainnya.',
    contact: 'admin@lspkonstruksijabar.id',
    notes: 'Jadwal asesmen lebih sering karena densitas proyek tinggi di Jabar.',
  },
  {
    id: 'lsp-daerah-jatim',
    name: 'LSP Jasa Konstruksi Daerah Jawa Timur',
    shortName: 'LSP-JK Jatim',
    type: 'daerah',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['jawa'],
    categories: ['sipil', 'arsitektur', 'mep', 'manajemen'],
    jabatanFokus: ['Ahli Bangunan Gedung', 'Ahli Teknik Jalan', 'Ahli MEP', 'Manajemen Konstruksi'],
    description: 'LSP daerah untuk wilayah Jawa Timur. TUK tersedia di Surabaya, Malang, Sidoarjo, Gresik, dan beberapa kota lainnya.',
    contact: 'admin@lspkonstruksijatim.id',
  },
  {
    id: 'lsp-daerah-sumut',
    name: 'LSP Jasa Konstruksi Daerah Sumatera Utara',
    shortName: 'LSP-JK Sumut',
    type: 'daerah',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['sumatera'],
    categories: ['sipil', 'manajemen'],
    jabatanFokus: ['Ahli Teknik Sipil', 'Pelaksana Bangunan', 'Ahli Manajemen Konstruksi'],
    description: 'Melayani daerah Sumatera Utara: Medan, Deli Serdang, Binjai, dan kota-kota sekitarnya.',
    contact: 'admin@lspkonstruksisumut.id',
  },
  {
    id: 'lsp-daerah-kaltim',
    name: 'LSP Jasa Konstruksi Kalimantan Timur',
    shortName: 'LSP-JK Kaltim',
    type: 'daerah',
    accreditation: 'BNSP',
    status: 'aktif',
    regions: ['kalimantan'],
    categories: ['sipil', 'manajemen', 'k3'],
    jabatanFokus: ['Ahli Teknik Sipil', 'Ahli K3 Konstruksi', 'Pelaksana Lapangan'],
    description: 'Melayani wilayah Kalimantan Timur dan Kalimantan Utara. TUK di Samarinda, Balikpapan, dan Bontang.',
    contact: 'admin@lspkonstruksikaltim.id',
    notes: 'Permintaan tinggi seiring pembangunan IKN — jadwal bisa lebih padat.',
  },
  {
    id: 'lsp-daerah-sulsel',
    name: 'LSP Jasa Konstruksi Sulawesi Selatan',
    shortName: 'LSP-JK Sulsel',
    type: 'daerah',
    accreditation: 'BNSP + LPJK',
    status: 'aktif',
    regions: ['sulawesi'],
    categories: ['sipil', 'arsitektur', 'manajemen'],
    jabatanFokus: ['Ahli Bangunan Gedung', 'Ahli Teknik Jalan', 'Ahli Arsitektur', 'Pelaksana Lapangan'],
    description: 'LSP daerah untuk Sulawesi Selatan. TUK utama di Makassar dengan cabang di Parepare dan Gowa.',
    contact: 'admin@lspkonstruksisulsel.id',
  },
  {
    id: 'lsp-daerah-bali',
    name: 'LSP Jasa Konstruksi Bali & Nusa Tenggara',
    shortName: 'LSP-JK Bali-NTB',
    type: 'daerah',
    accreditation: 'BNSP',
    status: 'aktif',
    regions: ['balinusra'],
    categories: ['sipil', 'arsitektur', 'manajemen'],
    jabatanFokus: ['Ahli Bangunan Gedung', 'Ahli Arsitektur', 'Pelaksana Lapangan', 'Ahli Manajemen Konstruksi'],
    description: 'Melayani Bali, NTB, dan NTT. TUK di Denpasar, Mataram, dan Kupang.',
    contact: 'admin@lspkonstruksibali.id',
  },
  {
    id: 'lsp-daerah-maluku',
    name: 'LSP Jasa Konstruksi Maluku & Papua',
    shortName: 'LSP-JK Maluku-Papua',
    type: 'daerah',
    accreditation: 'BNSP',
    status: 'aktif-terbatas',
    regions: ['malukupapua'],
    categories: ['sipil', 'manajemen'],
    jabatanFokus: ['Ahli Teknik Sipil', 'Pelaksana Bangunan', 'Ahli Manajemen Konstruksi'],
    description: 'Melayani wilayah timur Indonesia: Maluku, Papua Barat, dan Papua. Jadwal asesmen terbatas — disarankan konfirmasi jauh hari.',
    contact: 'admin@lspkonstruksitimurid.id',
    notes: 'Asesi di Papua bisa mengajukan AJJ untuk efisiensi.',
  },
];

const regionLabels: Record<Region, string> = {
  all: 'Semua Wilayah',
  nasional: '🇮🇩 Nasional',
  jawa: '🗺️ Pulau Jawa',
  sumatera: '🗺️ Sumatera',
  kalimantan: '🗺️ Kalimantan',
  sulawesi: '🗺️ Sulawesi',
  balinusra: '🗺️ Bali & Nusa Tenggara',
  malukupapua: '🗺️ Maluku & Papua',
};

const categoryLabels: Record<Category, string> = {
  all: 'Semua Bidang',
  sipil: '🏗️ Sipil',
  arsitektur: '🏛️ Arsitektur',
  mep: '⚙️ MEP',
  manajemen: '📋 Manajemen',
  k3: '🦺 K3 Konstruksi',
  spesialis: '🔬 Spesialis',
};

const typeColors: Record<string, string> = {
  nasional: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  sektoral: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  daerah: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
};

const typeLabels: Record<string, string> = {
  nasional: 'Nasional',
  sektoral: 'Sektoral',
  daerah: 'Daerah',
};

const faqs = [
  {
    q: 'Apa itu LSP dan apa bedanya dengan LPJK?',
    a: 'LSP (Lembaga Sertifikasi Profesi) adalah lembaga yang berwenang melaksanakan proses asesmen dan menerbitkan SKK. LPJK (Lembaga Pengembangan Jasa Konstruksi) adalah lembaga di bawah Kementerian PUPR yang mengakreditasi LSP di bidang jasa konstruksi. Sejak 2022, LPJK diintegrasikan ke dalam DJBK Kementerian PUPR. SKK yang diterbitkan LSP yang terakreditasi LPJK langsung terdaftar di SIMPAN.',
  },
  {
    q: 'Bagaimana cara memilih LSP yang tepat?',
    a: 'Kriteria: (1) Pastikan LSP terakreditasi BNSP dan/atau LPJK. (2) Verifikasi bahwa LSP berwenang untuk jabatan/skema SKK yang Anda inginkan. (3) Pilih yang memiliki TUK di kota Anda untuk kemudahan hadir. (4) Bandingkan biaya asesmen — bisa berbeda hingga Rp 1–2 juta antar LSP. (5) Cek jadwal — pilih yang jadwalnya sesuai timeline Anda.',
  },
  {
    q: 'Apakah saya bisa mengikuti asesmen di LSP mana saja?',
    a: 'Tidak bebas memilih sembarang LSP. Anda harus memilih LSP yang memiliki skema sertifikasi untuk jabatan yang Anda tuju dan telah mendapatkan lisensi dari BNSP untuk skema tersebut. Hubungi LSP terlebih dahulu untuk konfirmasi apakah mereka menerima skema yang Anda inginkan.',
  },
  {
    q: 'Apakah ada perbedaan pengakuan SKK dari LSP nasional vs daerah?',
    a: 'Tidak. Selama LSP terakreditasi BNSP dan jabatannya terdaftar di SIMPAN, SKK yang diterbitkan memiliki status yang sama secara hukum — baik dari LSP nasional maupun daerah. Yang penting adalah jabatan dan kode skema yang tercantum di SKK, bukan nama LSP penerbitnya.',
  },
  {
    q: 'Bagaimana saya tahu apakah LSP masih aktif dan terakreditasi?',
    a: 'Cara terbaik: (1) Cek portal BNSP di bnsp.go.id untuk daftar LSP berlisensi aktif. (2) Periksa SIMPAN (simpan.pu.go.id) untuk LSP yang terakreditasi LPJK. (3) Hubungi langsung LSP dan minta salinan sertifikat akreditasi BNSP mereka. Akreditasi BNSP berlaku selama 4 tahun dan bisa diperpanjang.',
  },
  {
    q: 'Apa itu TUK dan bedanya dengan LSP?',
    a: 'TUK (Tempat Uji Kompetensi) adalah lokasi fisik di mana asesmen dilaksanakan. TUK bisa berupa perusahaan, kampus, atau fasilitas latihan yang telah diverifikasi LSP. Satu LSP bisa memiliki banyak TUK di berbagai kota. Anda mendaftar ke LSP, tapi asesmen dilaksanakan di TUK yang ditunjuk.',
  },
];

const tips = [
  { icon: '🔍', title: 'Verifikasi Akreditasi', desc: 'Selalu cek status akreditasi di situs resmi BNSP (bnsp.go.id) sebelum mendaftar. Akreditasi bisa kadaluarsa.' },
  { icon: '📋', title: 'Konfirmasi Skema', desc: 'Hubungi LSP dan tanyakan secara spesifik apakah mereka memiliki skema untuk jabatan persis yang Anda inginkan.' },
  { icon: '💰', title: 'Bandingkan Biaya', desc: 'Biaya asesmen bisa beda Rp 1–2 juta antar LSP untuk jabatan yang sama. Minta rincian biaya sebelum daftar.' },
  { icon: '📅', title: 'Cek Jadwal Lebih Awal', desc: 'LSP aktif bisa punya antrean 1–3 bulan. Hubungi 3–4 bulan sebelum target asesmen Anda.' },
  { icon: '🏢', title: 'Pilih TUK Terdekat', desc: 'Tanya LSP TUK mana saja yang mereka miliki. TUK terdekat = hemat biaya transportasi dan lebih familiar.' },
  { icon: '👥', title: 'Tanya Rekomendasi Rekan', desc: 'Pengalaman nyata rekan sesama profesi biasanya lebih akurat dari informasi website LSP.' },
];

export default function DirekturiLSPPage() {
  const [regionFilter, setRegionFilter] = useState<Region>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'direktori' | 'tips' | 'faq'>('direktori');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return lsps.filter(lsp => {
      const matchRegion = regionFilter === 'all' || lsp.regions.includes(regionFilter);
      const matchCategory = categoryFilter === 'all' || lsp.categories.includes(categoryFilter);
      const matchSearch = search === '' ||
        lsp.name.toLowerCase().includes(search.toLowerCase()) ||
        lsp.shortName.toLowerCase().includes(search.toLowerCase()) ||
        lsp.jabatanFokus.some(j => j.toLowerCase().includes(search.toLowerCase())) ||
        lsp.description.toLowerCase().includes(search.toLowerCase());
      return matchRegion && matchCategory && matchSearch;
    });
  }, [regionFilter, categoryFilter, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-4">
            🏛️ Direktori LSP · Terverifikasi BNSP & LPJK
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Direktori LSP Konstruksi<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Temukan LSP yang Tepat untuk Anda
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Daftar Lembaga Sertifikasi Profesi (LSP) bidang konstruksi yang aktif dan terakreditasi, difilter berdasarkan wilayah dan bidang keahlian.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {([
            { id: 'direktori', label: '🏛️ Direktori LSP' },
            { id: 'tips', label: '💡 Tips Memilih LSP' },
            { id: 'faq', label: '❓ FAQ' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-300 border border-transparent hover:border-slate-700/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: DIREKTORI */}
        {activeTab === 'direktori' && (
          <div>
            {/* Filters */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari nama LSP atau jabatan (mis: Ahli Arsitektur, K3, Jembatan...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">✕</button>
                )}
              </div>

              {/* Region filter */}
              <div>
                <p className="text-slate-500 text-xs mb-2 font-medium uppercase tracking-wider">Wilayah</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(regionLabels) as [Region, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setRegionFilter(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        regionFilter === key
                          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div>
                <p className="text-slate-500 text-xs mb-2 font-medium uppercase tracking-wider">Bidang Keahlian</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(categoryLabels) as [Category, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setCategoryFilter(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        categoryFilter === key
                          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results count */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 text-sm">
                  Menampilkan <span className="text-emerald-400 font-semibold">{filtered.length}</span> dari {lsps.length} LSP
                </span>
                {(regionFilter !== 'all' || categoryFilter !== 'all' || search) && (
                  <button
                    onClick={() => { setRegionFilter('all'); setCategoryFilter('all'); setSearch(''); }}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    Reset filter
                  </button>
                )}
              </div>
            </div>

            {/* LSP List */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-slate-400">Tidak ada LSP yang cocok dengan filter Anda.</p>
                <button
                  onClick={() => { setRegionFilter('all'); setCategoryFilter('all'); setSearch(''); }}
                  className="mt-3 text-sm text-emerald-400 hover:underline"
                >
                  Reset semua filter
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(lsp => {
                  const isExpanded = expandedId === lsp.id;
                  return (
                    <div
                      key={lsp.id}
                      className={`rounded-2xl border transition-all ${
                        isExpanded
                          ? 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600/60'
                      }`}
                    >
                      {/* Header */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : lsp.id)}
                        className="w-full text-left p-5"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                            lsp.type === 'sektoral' ? 'bg-blue-500/15' :
                            lsp.type === 'daerah' ? 'bg-violet-500/15' : 'bg-emerald-500/15'
                          }`}>
                            🏛️
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className={`font-bold ${isExpanded ? 'text-emerald-300' : 'text-white'}`}>
                                {lsp.shortName}
                              </h3>
                              {lsp.highlight && (
                                <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  ⭐ {lsp.highlight}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${typeColors[lsp.type]}`}>
                                {typeLabels[lsp.type]}
                              </span>
                              {lsp.status === 'aktif-terbatas' && (
                                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                  Jadwal Terbatas
                                </span>
                              )}
                            </div>

                            <p className="text-slate-400 text-sm mb-2 leading-relaxed line-clamp-2">{lsp.description}</p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 rounded-md text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                ✅ {lsp.accreditation}
                              </span>
                              {lsp.categories.map(cat => (
                                <span key={cat} className="px-2 py-0.5 rounded-md text-xs bg-slate-700/60 text-slate-400 border border-slate-700/40">
                                  {categoryLabels[cat]}
                                </span>
                              ))}
                              {lsp.regions.includes('nasional') && (
                                <span className="px-2 py-0.5 rounded-md text-xs bg-slate-700/60 text-slate-400 border border-slate-700/40">
                                  🇮🇩 Nasional
                                </span>
                              )}
                            </div>
                          </div>

                          <span className={`shrink-0 text-slate-500 transition-transform mt-1 ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                        </div>
                      </button>

                      {/* Expanded */}
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-slate-700/40 pt-4 grid md:grid-cols-3 gap-5">
                          {/* Full description */}
                          <div className="md:col-span-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Nama Lengkap</h4>
                            <p className="text-slate-300 text-sm mb-4">{lsp.name}</p>

                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Jabatan yang Dilayani</h4>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {lsp.jabatanFokus.map((j, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-slate-700/60 text-slate-300 border border-slate-700/40">
                                  📌 {j}
                                </span>
                              ))}
                            </div>

                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Wilayah Layanan</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {lsp.regions.filter(r => r !== 'all').map(r => (
                                <span key={r} className="px-2 py-0.5 rounded-md text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                  {regionLabels[r]}
                                </span>
                              ))}
                            </div>

                            {lsp.notes && (
                              <div className="mt-4 flex gap-2 p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg">
                                <span>💡</span>
                                <p className="text-sm text-amber-200/80">{lsp.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Contact */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Kontak</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span>📧</span>
                                <span className="text-emerald-400 text-xs break-all">{lsp.contact}</span>
                              </div>
                              {lsp.website && (
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                  <span>🌐</span>
                                  <span className="text-blue-400 text-xs">{lsp.website}</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-4 space-y-2">
                              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Status</p>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${lsp.status === 'aktif' ? 'bg-emerald-400' : 'bg-orange-400'}`} />
                                <span className={`text-sm ${lsp.status === 'aktif' ? 'text-emerald-400' : 'text-orange-400'}`}>
                                  {lsp.status === 'aktif' ? 'Aktif' : 'Aktif (Jadwal Terbatas)'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-400" />
                                <span className="text-sm text-blue-400">{lsp.accreditation}</span>
                              </div>
                            </div>

                            <div className="mt-4 p-3 bg-slate-700/40 rounded-lg text-xs text-slate-500 leading-relaxed">
                              ℹ️ Hubungi LSP langsung untuk konfirmasi jadwal, biaya, dan jabatan yang tersedia. Data ini bersifat panduan.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 text-xs text-slate-500 text-center leading-relaxed">
              📋 Data LSP bersifat informatif dan panduan. Akreditasi bisa berubah. Selalu verifikasi status aktif di{' '}
              <span className="text-blue-400">bnsp.go.id</span> dan{' '}
              <span className="text-blue-400">simpan.pu.go.id</span> sebelum mendaftar.
            </div>
          </div>
        )}

        {/* TAB: TIPS */}
        {activeTab === 'tips' && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              {tips.map((tip, i) => (
                <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{tip.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-sm mb-1">{tip.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checklist pilih LSP */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <h3 className="text-emerald-400 font-bold text-lg mb-4">✅ Checklist Sebelum Daftar ke LSP</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'LSP terakreditasi BNSP aktif (cek bnsp.go.id)',
                  'LSP memiliki skema untuk jabatan yang saya inginkan',
                  'TUK tersedia di kota saya atau bisa AJJ',
                  'Jadwal asesmen sesuai timeline saya',
                  'Biaya sudah dikonfirmasi termasuk biaya tersembunyi',
                  'Saya sudah cek ulasan/rekomendasi dari rekan profesi',
                  'Dokumen persyaratan sudah dikonfirmasi ke LSP',
                  'Nomor kontak PIC/admin LSP sudah tersimpan',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-500 shrink-0 mt-0.5 font-bold">□</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Red flags */}
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5">
              <h3 className="text-rose-400 font-bold mb-3">⚠️ Red Flag LSP yang Perlu Diwaspadai</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-300">
                {[
                  'Tidak bisa menunjukkan sertifikat akreditasi BNSP aktif',
                  'Menjanjikan "pasti lulus" tanpa asesmen yang sesungguhnya',
                  'Biaya sangat murah tapi tidak transpsoaran (ada biaya tersembunyi)',
                  'SKK yang diterbitkan tidak bisa diverifikasi di SIMPAN',
                  'Tidak ada informasi asesor yang terdaftar di BNSP',
                  'Meminta pembayaran penuh sebelum jadwal dikonfirmasi',
                ].map((flag, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 shrink-0 mt-0.5">✕</span>
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-xl border transition-all ${
                  expandedFaq === i
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-slate-700/50 bg-slate-800/40'
                }`}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-start justify-between gap-3 p-5 text-left"
                >
                  <span className={`font-medium text-sm leading-relaxed ${expandedFaq === i ? 'text-emerald-300' : 'text-white'}`}>
                    {faq.q}
                  </span>
                  <span className={`shrink-0 transition-transform text-emerald-400 ${expandedFaq === i ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-700/40 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600/20 to-teal-600/15 border border-emerald-500/30 rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold text-lg mb-2">Sudah Pilih LSP? Siapkan Dirinya</h3>
          <p className="text-slate-400 text-sm mb-5">
            Lengkapi dokumen, pelajari materi, dan latihan soal asesmen — semua tersedia di SIAP SKK.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/timeline-skk" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors">
              🗺️ Lihat Timeline Proses SKK
            </a>
            <a href="/hari-h" className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
              📅 Panduan Hari-H
            </a>
            <a href="/biaya-skk" className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
              💰 Estimasi Biaya SKK
            </a>
            <a href="/mock-asesmen" className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
              🎯 Mock Asesmen
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
