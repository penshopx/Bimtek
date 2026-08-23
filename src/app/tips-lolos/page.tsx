'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Tab = 'portofolio' | 'wawancara' | 'tertulis' | 'hariH' | 'mental';

interface Tip {
  judul: string;
  detail: string;
  level: 'wajib' | 'penting' | 'bonus';
}

interface Kesalahan {
  salah: string;
  benar: string;
}

interface TabData {
  id: Tab;
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  desc: string;
  tips: Tip[];
  kesalahan: Kesalahan[];
}

const tabs: TabData[] = [
  {
    id: 'portofolio',
    label: 'Portofolio',
    icon: '📁',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    desc: 'Portofolio adalah tulang punggung asesmen — asesor menilai bukti nyata kompetensi Anda di sini.',
    tips: [
      {
        judul: 'Satu UK = Satu Tab/Seksi',
        detail: 'Susun portofolio mengikuti urutan Unit Kompetensi (UK) persis seperti di FR.APL.02. Asesor membuka dokumen sambil mengisi form mereka — struktur yang sama mempercepat verifikasi dan mengurangi risiko Anda dianggap "tidak memiliki bukti" padahal buktinya ada tapi salah tempat.',
        level: 'wajib',
      },
      {
        judul: 'Bukti Konkret, Bukan Deskripsi',
        detail: 'Setiap Kriteria Unjuk Kerja (KUK) harus punya bukti NYATA: foto proyek + keterangan, halaman laporan yang Anda buat, SK penugasan, email persetujuan atasan, gambar teknik yang Anda revisi. Jangan cukup menulis "saya pernah melakukan X" — tunjukkan buktinya.',
        level: 'wajib',
      },
      {
        judul: 'Caption Setiap Foto',
        detail: 'Tiap foto harus punya keterangan: nama proyek, tahun, peran Anda, dan UK mana yang dibuktikan. Foto tanpa konteks dianggap lemah. Contoh: "Foto 3. Pengawasan pengecoran fondasi Proyek Jembatan X, Medan 2022. Penulis selaku Pelaksana Sipil. Membuktikan KUK 2.1."',
        level: 'wajib',
      },
      {
        judul: 'Variasi Jenis Bukti per UK',
        detail: 'Idealnya setiap UK punya 2-3 jenis bukti berbeda: dokumen + foto + sertifikat, atau laporan + SK + email. Variasi menunjukkan kompetensi yang terbentuk dari berbagai konteks, bukan satu insiden kebetulan.',
        level: 'penting',
      },
      {
        judul: 'Cover Page Profesional',
        detail: 'Buat halaman sampul dengan: nama lengkap, NIK, jabatan yang diajukan, nama LSP, tanggal, dan logo perusahaan. Daftar isi otomatis jika digital. Kesan pertama penting — portofolio yang rapi mencerminkan profesionalisme kandidat.',
        level: 'penting',
      },
      {
        judul: 'Backup Digital Sebelum Asesmen',
        detail: 'Scan/foto semua dokumen fisik dan simpan di Google Drive atau cloud storage. Jika dokumen asli hilang atau rusak saat perjalanan ke TUK, Anda bisa mencetak ulang. Juga berguna untuk AJJ (asesmen jarak jauh) jika tiba-tiba metode berubah.',
        level: 'penting',
      },
      {
        judul: 'Timeline Proyek sebagai Lampiran',
        detail: 'Tambahkan satu halaman timeline karir/proyek di bagian awal. Ini membantu asesor memahami lompatan kompetensi Anda secara kronologis dan memudahkan wawancara — asesor bisa langsung tunjuk "proyek tahun ini" dan bertanya lebih dalam.',
        level: 'bonus',
      },
    ],
    kesalahan: [
      { salah: 'Bukti hanya fotokopi ijazah dan KTP', benar: 'Bukti proyek nyata: foto lapangan, laporan, SK tugas, gambar kerja' },
      { salah: 'Urutan portofolio tidak ikuti urutan UK di APL.02', benar: 'Tab/seksi portofolio urut persis sesuai UK di FR.APL.02' },
      { salah: 'Foto tanpa keterangan/caption', benar: 'Setiap foto punya nama proyek, tahun, peran, dan UK yang dibuktikan' },
      { salah: 'Portofolio 200+ halaman tanpa daftar isi', benar: 'Portofolio terstruktur dengan daftar isi dan tab per UK, max ~80 hal' },
    ],
  },
  {
    id: 'wawancara',
    label: 'Wawancara',
    icon: '🎤',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    desc: 'Wawancara kompetensi menguji kedalaman pemahaman Anda — bukan hafalan, tapi pengalaman nyata.',
    tips: [
      {
        judul: 'Kuasai Metode STAR',
        detail: 'Jawab setiap pertanyaan dengan STAR: Situasi (konteks proyek/kejadian), Tugas (peran dan tanggung jawab Anda), Aksi (langkah konkret yang Anda ambil), Hasil (dampak terukur). Contoh: "Di proyek X (S), saya bertugas mengawasi pondasi (T), saya lakukan inspeksi harian dan buat checklist deviasi (A), proyek selesai tanpa NCR struktural (R)."',
        level: 'wajib',
      },
      {
        judul: 'Hafal 3 Proyek Kunci',
        detail: 'Siapkan 3 proyek terbaik yang bisa menjawab hampir semua UK. Untuk setiap proyek, hafal: nama, lokasi, tahun, nilai kontrak, peran Anda, tim, tantangan utama, dan hasil. Asesor sering menggali detail — "seberapa besar timnya?", "anggaran berapa?", "siapa supervisornya?".',
        level: 'wajib',
      },
      {
        judul: 'Baca FR.APL.02 Malam Sebelumnya',
        detail: 'FR.APL.02 yang Anda isi adalah "script" wawancara. Asesor menanyai berdasarkan bukti yang Anda klaim kompeten. Pastikan Anda ingat apa yang Anda tulis dan bisa elaborasi setiap poin dengan pengalaman nyata.',
        level: 'wajib',
      },
      {
        judul: 'Jangan Takut Minta Klarifikasi',
        detail: 'Jika pertanyaan tidak jelas, minta asesor mengulangi atau menjelaskan. Jauh lebih baik dari menjawab pertanyaan yang salah dipahami. Contoh: "Maaf Pak/Bu, maksudnya terkait kontrol mutu di lapangan atau di dokumen?"',
        level: 'penting',
      },
      {
        judul: 'Akui yang Belum Pernah Dilakukan',
        detail: 'Jika ada UK yang memang belum pernah Anda lakukan, jangan mengarang. Katakan: "Untuk hal ini saya belum pernah melakukan secara langsung, namun saya memahami prosedurnya karena [alasan]." Kejujuran + pemahaman konsep lebih dihargai dari kebohongan yang mudah terdeteksi.',
        level: 'penting',
      },
      {
        judul: 'Latihan dengan Pasangan',
        detail: 'Minta rekan kerja atau keluarga bertanya menggunakan KUK di FR.APL.02. Latihan bicara keras (bukan hanya dalam hati) membuat jawaban lebih terstruktur dan mengurangi gugup. Target: bisa menjawab setiap UK dalam 2-3 menit terstruktur.',
        level: 'penting',
      },
      {
        judul: 'Kalimat Pembuka yang Kuat',
        detail: 'Untuk setiap pertanyaan besar (misal: "Ceritakan pengalaman Anda mengelola proyek"), mulai dengan kalimat ringkasan 1 kalimat sebelum STAR. Contoh: "Saya paling banyak terlibat dalam proyek infrastruktur jembatan di Sumatra Utara antara 2019-2022. Salah satu yang paling relevan adalah..."',
        level: 'bonus',
      },
    ],
    kesalahan: [
      { salah: 'Menjawab "iya saya bisa" tanpa contoh konkret', benar: 'Selalu beri contoh nyata dengan metode STAR, lengkap dengan konteks' },
      { salah: 'Menyebut pengalaman orang lain sebagai pengalaman sendiri', benar: 'Ceritakan hanya yang Anda kerjakan langsung, plus kontribusi tim jika relevan' },
      { salah: 'Jawaban terlalu singkat: "pernah, di proyek Y"', benar: 'Jawaban 2-4 menit: situasi → tugas → aksi → hasil terukur' },
      { salah: 'Panik saat ditanya detail teknis yang lupa', benar: 'Tarik nafas, minta waktu sebentar, jawab sebisanya dengan jujur' },
    ],
  },
  {
    id: 'tertulis',
    label: 'Tes Tertulis',
    icon: '📝',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    desc: 'Tes tertulis menguji pengetahuan teoritis dari SKKNI — bisa dikuasai dengan strategi belajar yang tepat.',
    tips: [
      {
        judul: 'Pelajari Unit Kompetensi, Bukan Hafal Soal',
        detail: 'Soal tes tertulis dibuat dari Elemen Kompetensi dan Kriteria Unjuk Kerja di SKKNI. Download SKKNI jabatan Anda dari BSN atau PUPR, baca setiap elemen dan KUK, pahami tujuan dan prinsip di baliknya. Pemahaman prinsip lebih kuat dari hafalan soal yang bisa berubah.',
        level: 'wajib',
      },
      {
        judul: 'Latihan Soal Minimal 3 Hari Sebelum',
        detail: 'Kerjakan latihan soal di platform SKK untuk terbiasa dengan format dan gaya bahasa soal. Fokus pada soal yang salah — identifikasi pola kelemahan dan ulang materi terkait. Jangan belajar maraton di H-1; lebih baik sesi 2 jam selama 3 hari.',
        level: 'wajib',
      },
      {
        judul: 'Baca Soal Dua Kali',
        detail: 'Soal tes SKK sering menggunakan kata-kata kunci seperti "KECUALI", "PALING TEPAT", "TIDAK TERMASUK". Baca sekali untuk pemahaman umum, baca kedua untuk menangkap kata kunci. Jawaban salah sering karena terburu-buru, bukan tidak tahu.',
        level: 'wajib',
      },
      {
        judul: 'Strategi Eliminasi untuk Pilihan Ganda',
        detail: 'Jika tidak yakin, eliminasi 2 pilihan yang jelas salah terlebih dahulu. Dari 2 sisanya, pilih yang menggunakan kata-kata paling dekat dengan bahasa SKKNI/regulasi (bukan "akal sehat" umum). Soal SKK berbasis standar — jawaban yang "logis" belum tentu sesuai standar.',
        level: 'penting',
      },
      {
        judul: 'Prioritas Soal Esai',
        detail: 'Untuk soal esai, tulis jawaban dengan struktur: definisi singkat → langkah/prosedur → dasar hukum/standar jika tahu → contoh penerapan. Asesor memberi poin untuk kelengkapan elemen jawaban, bukan keindahan bahasa.',
        level: 'penting',
      },
      {
        judul: 'Tandai dan Lanjut',
        detail: 'Jika stuck di satu soal, tandai dan lanjut. Kembali di akhir. Psikologi: menyelesaikan soal yang Anda tahu lebih dulu membangun rasa percaya diri dan memastikan poin mudah tidak terlewat karena kehabisan waktu di soal susah.',
        level: 'penting',
      },
      {
        judul: 'Kenali Regulasi Kunci',
        detail: 'Hafal nomor dan isi singkat: UU 2/2017 (Jasa Konstruksi), PP 14/2021 (SKK), Permen PUPR 8/2022 (Klasifikasi), SNI relevan untuk bidang Anda. Soal sering menanyakan "sesuai PP/Permen mana" atau "apa kewajiban menurut UU...".',
        level: 'bonus',
      },
    ],
    kesalahan: [
      { salah: 'Belajar dari soal bocoran saja tanpa pahami SKKNI', benar: 'Pahami elemen kompetensi SKKNI — soal bisa berubah tapi prinsip sama' },
      { salah: 'Skip soal susah dan lupa kembali', benar: 'Tandai soal susah, selesaikan soal mudah dulu, kembali di akhir' },
      { salah: 'Menjawab esai dengan 1 kalimat', benar: 'Esai minimal: definisi + prosedur + dasar standar + contoh' },
      { salah: 'Tidak cek jawaban di sisa waktu', benar: 'Sisakan 10-15 menit untuk review, terutama soal yang ditandai' },
    ],
  },
  {
    id: 'hariH',
    label: 'Hari-H',
    icon: '📅',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    desc: 'Persiapan logistik dan mental di hari asesmen — hal kecil bisa berdampak besar pada performa.',
    tips: [
      {
        judul: 'Tiba 30 Menit Sebelum Waktu Registrasi',
        detail: 'Jangan percaya estimasi Google Maps saat peak hour. Berangkat lebih awal memberikan waktu buffer untuk: parkir, menemukan ruangan TUK, registrasi administrasi, dan menenangkan diri. Keterlambatan bisa menyebabkan tidak diizinkan mengikuti asesmen.',
        level: 'wajib',
      },
      {
        judul: 'Cek Kelengkapan Dokumen H-1',
        detail: 'Malam sebelum asesmen, keluarkan semua dokumen dan centang checklist: KTP asli, ijazah asli + legalisir, pas foto, FR.APL.01 bertanda tangan materai, FR.APL.02 lengkap, portofolio, sertifikat pelatihan, bukti bayar. Masukkan ke map/folder berlabel. Jangan pack di pagi hari saat terburu-buru.',
        level: 'wajib',
      },
      {
        judul: 'Siapkan Cadangan Meterai dan Bolpen',
        detail: 'Bawa minimal 3 meterai dan 2 bolpen (hitam). Sering ada form tambahan yang perlu ditandatangani di lokasi, atau materai yang Anda bawa ternyata sudah terpakai. Bawa juga stapler kecil — berguna untuk menyatukan dokumen di lokasi.',
        level: 'wajib',
      },
      {
        judul: 'Sarapan dan Minum Air Putih',
        detail: 'Asesmen berlangsung 4-8 jam. Perut kosong menurunkan konsentrasi secara signifikan. Sarapan dengan karbohidrat kompleks (nasi, roti gandum) dan protein untuk energi tahan lama. Bawa air minum — sebagian TUK tidak menyediakan minuman.',
        level: 'penting',
      },
      {
        judul: 'Dress Code Profesional tapi Nyaman',
        detail: 'Kenakan pakaian formal (kemeja/batik) yang profesional namun nyaman untuk duduk lama. Hindari pakaian baru yang belum pernah dicoba. Asesmen bisa berlangsung di ruang ber-AC kuat — bawa jaket tipis. Penampilan rapi memberikan kesan positif pertama kepada asesor.',
        level: 'penting',
      },
      {
        judul: 'Matikan Notifikasi HP',
        detail: 'Aktifkan Do Not Disturb atau matikan suara HP sepenuhnya. Bunyi notifikasi saat wawancara sangat mengganggu konsentrasi dan memberikan kesan tidak profesional. Untuk AJJ, test kamera, mikrofon, dan koneksi internet sejam sebelum jadwal.',
        level: 'penting',
      },
      {
        judul: 'Bawa Snack Ringan',
        detail: 'Coklat, kacang, atau buah kering berguna untuk menjaga energi antara sesi. Terutama jika ada jeda istirahat singkat. Hindari makanan berat yang membuat ngantuk, dan hindari kafein berlebih yang bisa meningkatkan kecemasan.',
        level: 'bonus',
      },
    ],
    kesalahan: [
      { salah: 'Berangkat pas waktu registrasi, terjebak macet', benar: 'Tiba 30 menit lebih awal dari jadwal registrasi' },
      { salah: 'Baru pack dokumen pagi hari saat asesmen', benar: 'Cek dan pack semua dokumen malam H-1' },
      { salah: 'Tidak sarapan karena terburu-buru', benar: 'Sarapan bergizi + bawa air minum untuk asesmen seharian' },
      { salah: 'HP nyala dan berdering saat wawancara', benar: 'HP Do Not Disturb/silent sebelum masuk ruangan asesmen' },
    ],
  },
  {
    id: 'mental',
    label: 'Mental & Strategi',
    icon: '🧠',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    desc: 'Kesiapan mental dan strategi keseluruhan sering jadi penentu hasil ketika kemampuan teknis sudah setara.',
    tips: [
      {
        judul: 'Asesor Bukan Musuh — Mereka Ingin Anda Lulus',
        detail: 'Asesor bertugas memverifikasi kompetensi, bukan menjebak. Mereka sudah punya banyak pengalaman dan bisa dengan cepat membedakan kandidat yang memang kompeten dari yang tidak. Sikap terbaik: terbuka, jujur, dan kooperatif. Jika ada yang kurang jelas, tanya — itu tanda kandidat yang matang.',
        level: 'wajib',
      },
      {
        judul: 'Sertifikasi adalah Verifikasi, Bukan Ujian Sekolah',
        detail: 'Jika Anda sudah punya pengalaman kerja yang relevan, asesmen hanya memverifikasi apa yang sudah Anda kuasai. Ubah mindset dari "saya harus lulus ujian" menjadi "saya menunjukkan apa yang sudah saya bisa." Kecemasan jauh berkurang dengan pergeseran perspektif ini.',
        level: 'wajib',
      },
      {
        judul: 'Siapkan Narasi Karir Anda',
        detail: 'Latih cerita 3 menit tentang perjalanan karir Anda: mulai dari mana, perkembangan, pencapaian utama, dan mengapa Anda layak SKK jabatan ini sekarang. Narasi yang koheren dan percaya diri meninggalkan kesan kuat di awal dan akhir asesmen.',
        level: 'penting',
      },
      {
        judul: 'Tidur Cukup H-2 dan H-1',
        detail: 'Tidur larut malam untuk belajar di H-1 justru kontraproduktif — otak butuh tidur untuk mengkonsolidasi memori. Belajar serius di H-3 sampai H-5, lalu H-2 dan H-1 hanya review ringan. Target tidur 7-8 jam malam sebelum asesmen.',
        level: 'penting',
      },
      {
        judul: 'Terima Ketidaksempurnaan',
        detail: 'Tidak ada kandidat yang menjawab 100% sempurna. Asesor menilai secara holistik — kelemahan di satu KUK bisa dikompensasi dengan kekuatan di KUK lain. Jika salah satu sesi terasa kurang, jangan biarkan itu memengaruhi performa sesi berikutnya. Setiap sesi adalah lembaran baru.',
        level: 'penting',
      },
      {
        judul: 'Buat Ritual Penenang Personal',
        detail: 'Sebelum asesmen: 5 menit deep breathing, dengarkan musik yang memotivasi, baca quotes favorit, atau hubungi orang yang mendukung. Ritual kecil memberi sinyal ke otak bahwa "ini saatnya fokus." Temukan yang berhasil untuk Anda melalui simulasi sebelum hari H.',
        level: 'bonus',
      },
      {
        judul: 'Rencana Jika Belum Kompeten',
        detail: 'Sebelum asesmen, buat rencana singkat: "Jika hasilnya belum kompeten, saya akan... [isi gap X dalam Y bulan dan coba lagi]." Memiliki rencana cadangan mengurangi ketakutan akan kegagalan dan paradoksnya meningkatkan performa karena tekanan berkurang.',
        level: 'bonus',
      },
    ],
    kesalahan: [
      { salah: 'Belajar sampai dini hari di H-1', benar: 'Belajar serius H-3 s/d H-5; H-1 hanya review ringan dan tidur cukup' },
      { salah: 'Menganggap asesor sebagai penguji yang ingin menjatuhkan', benar: 'Asesor mitra verifikasi — mereka ingin kandidat kompeten berhasil' },
      { salah: 'Menyerah mental setelah satu sesi yang kurang baik', benar: 'Setiap sesi independent — reset mindset, fokus sesi berikutnya' },
      { salah: 'Tidak punya rencana jika hasilnya belum kompeten', benar: 'Siapkan rencana gap-filling sebelum asesmen — kurangi beban mental' },
    ],
  },
];

const levelConfig = {
  wajib:   { label: 'Wajib', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  penting: { label: 'Penting', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  bonus:   { label: 'Bonus', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-600/40', dot: 'bg-slate-400' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TipsLolosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('portofolio');
  const [filter, setFilter] = useState<'semua' | 'wajib' | 'penting' | 'bonus'>('semua');
  const [showKesalahan, setShowKesalahan] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const tab = tabs.find(t => t.id === activeTab)!;
  const filteredTips = tab.tips.filter(t => filter === 'semua' || t.level === filter);
  const totalWajib = tab.tips.filter(t => t.level === 'wajib').length;
  const checkedWajib = tab.tips.filter(t => t.level === 'wajib' && checked[`${activeTab}-${t.judul}`]).length;

  const toggleCheck = (key: string) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-medium mb-4">
            🏆 Panduan Strategis Lolos Asesmen SKK
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Tips <span className="text-green-400">Lolos</span> Asesmen
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Tips terstruktur per bagian asesmen — dari membangun portofolio yang kuat hingga menjaga mental di hari-H. Tandai yang sudah Anda siapkan.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400">
          <span className="font-medium text-slate-300">Prioritas:</span>
          {(['wajib', 'penting', 'bonus'] as const).map(l => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${levelConfig[l].dot}`} />
              {levelConfig[l].label}
            </span>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setFilter('semua'); setShowKesalahan(false); }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeTab === t.id
                  ? `${t.bg} ${t.color} ${t.border}`
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/40 hover:border-slate-600'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab header */}
        <div className={`rounded-2xl p-5 ${tab.bg} border ${tab.border}`}>
          <p className="text-slate-300 text-sm leading-relaxed">{tab.desc}</p>
          {tab.id === 'portofolio' || tab.id === 'wawancara' || tab.id === 'hariH' ? (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${tab.color.replace('text-', 'bg-')}`}
                  style={{ width: `${totalWajib ? (checkedWajib / totalWajib) * 100 : 0}%` }}
                />
              </div>
              <span className={`text-xs font-mono ${tab.color}`}>{checkedWajib}/{totalWajib} wajib ✓</span>
            </div>
          ) : null}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {(['semua', 'wajib', 'penting', 'bonus'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                filter === f
                  ? f === 'semua'
                    ? 'bg-slate-600 text-white border-slate-500'
                    : `${levelConfig[f].bg} ${levelConfig[f].color} ${levelConfig[f].border}`
                  : 'bg-slate-800/60 text-slate-500 border-slate-700/40'
              }`}
            >
              {f === 'semua' ? `Semua (${tab.tips.length})` : `${levelConfig[f].label} (${tab.tips.filter(t => t.level === f).length})`}
            </button>
          ))}
        </div>

        {/* Tips list */}
        <div className="space-y-3">
          {filteredTips.map((tip, i) => {
            const key = `${activeTab}-${tip.judul}`;
            const isChecked = !!checked[key];
            const lc = levelConfig[tip.level];
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 transition-all ${
                  isChecked ? 'bg-slate-700/30 border-slate-600/40 opacity-70' : 'bg-slate-800/50 border-slate-700/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleCheck(key)}
                    className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isChecked ? `${lc.dot} border-transparent` : 'border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {isChecked && <span className="text-white text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${lc.bg} ${lc.color} ${lc.border}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${lc.dot} mr-1`} />
                        {lc.label}
                      </span>
                      <p className={`text-sm font-semibold ${isChecked ? 'line-through text-slate-500' : 'text-white'}`}>
                        {tip.judul}
                      </p>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{tip.detail}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Kesalahan Umum */}
        <div>
          <button
            onClick={() => setShowKesalahan(!showKesalahan)}
            className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left group"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span className="text-red-400 font-semibold text-sm">Kesalahan Paling Sering — {tab.label}</span>
              <span className="text-xs text-red-400/60 bg-red-500/10 px-2 py-0.5 rounded-full">{tab.kesalahan.length} hal</span>
            </div>
            <span className={`text-red-400 transition-transform ${showKesalahan ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showKesalahan && (
            <div className="mt-2 space-y-2">
              {tab.kesalahan.map((k, i) => (
                <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-800/40 overflow-hidden">
                  <div className="flex items-start gap-3 p-3.5">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-400 font-bold mt-0.5">✗</div>
                    <div className="flex-1">
                      <p className="text-red-400/80 text-sm line-through opacity-70 mb-1">{k.salah}</p>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 font-bold text-xs mt-0.5">→</span>
                        <p className="text-green-400 text-sm font-medium">{k.benar}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTAs */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/mock-asesmen"
            className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-green-500/40 transition-colors"
          >
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-white text-sm font-medium">Mock Asesmen</p>
              <p className="text-slate-500 text-xs">Latihan soal pilihan ganda per jabatan</p>
            </div>
          </Link>
          <Link
            href="/hari-h"
            className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-purple-500/40 transition-colors"
          >
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-white text-sm font-medium">Panduan Hari-H</p>
              <p className="text-slate-500 text-xs">Checklist perlengkapan & timeline asesmen</p>
            </div>
          </Link>
          <Link
            href="/rencana-belajar"
            className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-amber-500/40 transition-colors"
          >
            <span className="text-2xl">📚</span>
            <div>
              <p className="text-white text-sm font-medium">Rencana Belajar</p>
              <p className="text-slate-500 text-xs">Generate jadwal belajar personal</p>
            </div>
          </Link>
          <Link
            href="/skk-coach"
            className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-orange-500/40 transition-colors"
          >
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-white text-sm font-medium">SKK Coach AI</p>
              <p className="text-slate-500 text-xs">Tanya pertanyaan spesifik asesmen Anda</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
