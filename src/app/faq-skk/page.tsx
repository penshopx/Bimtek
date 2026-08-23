'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// ─── Data ─────────────────────────────────────────────────────────────────────

type Kategori = 'Umum' | 'Persyaratan' | 'Pendaftaran' | 'Dokumen' | 'Asesmen' | 'Perpanjangan' | 'Biaya';

interface FAQ {
  id: string;
  q: string;
  a: string;
  links?: { label: string; href: string }[];
  kategori: Kategori;
}

const faqs: FAQ[] = [
  // ── Umum ──────────────────────────────────────────────────────────────────────
  {
    id: 'u1', kategori: 'Umum',
    q: 'Apa itu SKK dan mengapa wajib dimiliki?',
    a: 'SKK (Sertifikat Kompetensi Kerja) adalah bukti tertulis bahwa seseorang memenuhi standar kompetensi kerja di bidang konstruksi. Berdasarkan UU 2/2017 tentang Jasa Konstruksi dan PP 14/2021, setiap tenaga kerja yang bekerja di proyek konstruksi di Indonesia wajib memiliki SKK sesuai jabatannya. Tanpa SKK, kontraktor tidak dapat memenuhi persyaratan SBU (Sertifikat Badan Usaha) dan berisiko dikenai sanksi administratif.',
    links: [{ label: 'Cari Jabatan SKK', href: '/sertifikasi' }],
  },
  {
    id: 'u2', kategori: 'Umum',
    q: 'Apa perbedaan SKK dengan SKA dan SKT lama?',
    a: 'SKA (Sertifikat Keahlian) dan SKT (Sertifikat Keterampilan) adalah sertifikasi lama yang sudah tidak diterbitkan sejak PP 14/2021 berlaku. SKK adalah penggantinya yang berbasis kompetensi (SKKNI) dan menggunakan sistem KKNI Level 2–9, sedangkan SKA menggunakan klasifikasi Muda/Madya/Utama. SKA yang masih dalam masa berlaku tetap diakui hingga kadaluarsa.',
  },
  {
    id: 'u3', kategori: 'Umum',
    q: 'Siapa yang menerbitkan SKK?',
    a: 'SKK diterbitkan oleh LSP (Lembaga Sertifikasi Profesi) yang telah mendapat lisensi dari BNSP (Badan Nasional Sertifikasi Profesi). LSP adalah lembaga independen — ada LSP P1 (dibentuk industri), P2 (pemerintah), dan P3 (asosiasi profesi). Data SKK yang terbit diregistrasi di sistem LPJK Kementerian PUPR.',
    links: [{ label: 'Glosarium: BNSP, LSP, TUK', href: '/glosarium' }],
  },
  {
    id: 'u4', kategori: 'Umum',
    q: 'Berapa lama SKK berlaku?',
    a: 'SKK berlaku selama 5 tahun sejak tanggal terbit. Selama masa berlaku, pemegang SKK wajib mengikuti surveillance: Surveillance 1 pada bulan ke-18 dan Surveillance 2 pada bulan ke-36. Sebelum kadaluarsa (bulan ke-60), SKK dapat diperpanjang melalui proses re-sertifikasi.',
    links: [{ label: 'Pantau Masa Berlaku SKK', href: '/pantau-skk' }],
  },
  {
    id: 'u5', kategori: 'Umum',
    q: 'Apakah SKK berlaku di seluruh Indonesia?',
    a: 'Ya, SKK berlaku secara nasional di seluruh wilayah Indonesia karena diterbitkan oleh LSP berlisensi BNSP yang merupakan lembaga pemerintah. SKK juga diakui secara internasional dalam kerangka ASEAN Mutual Recognition Arrangement (MRA) untuk profesi tertentu.',
  },
  {
    id: 'u6', kategori: 'Umum',
    q: 'Apakah SKK bisa digunakan untuk lebih dari satu jabatan sekaligus?',
    a: 'Seseorang bisa memiliki lebih dari satu SKK untuk jabatan yang berbeda. Misalnya, seorang profesional bisa memegang SKK Ahli Teknik Sipil dan SKK K3 Konstruksi secara bersamaan. Setiap SKK diajukan, dinilai, dan diterbitkan secara terpisah sesuai skema sertifikasi masing-masing jabatan.',
  },

  // ── Persyaratan ───────────────────────────────────────────────────────────────
  {
    id: 'p1', kategori: 'Persyaratan',
    q: 'Apa persyaratan umum untuk mendaftar SKK?',
    a: 'Persyaratan umum SKK: (1) WNI atau WNA yang bekerja di Indonesia, (2) memiliki pendidikan sesuai jabatan yang dituju, (3) memiliki pengalaman kerja konstruksi yang relevan sesuai level, (4) mampu berbahasa Indonesia untuk proses asesmen. Persyaratan spesifik (pendidikan dan pengalaman) berbeda-beda per jabatan dan level KKNI.',
    links: [{ label: 'Diagnostik Kompetensi', href: '/diagnostik-kompetensi' }],
  },
  {
    id: 'p2', kategori: 'Persyaratan',
    q: 'Berapa tahun pengalaman yang dibutuhkan untuk SKK Level 6 (Ahli Muda)?',
    a: 'Untuk SKK Level 6 (Ahli Muda), persyaratan umumnya: S1 teknik relevan + minimal 2 tahun pengalaman, atau D4 + 3 tahun pengalaman, atau D3 + 5 tahun pengalaman. Persyaratan bisa berbeda tergantung jabatan spesifik. Gunakan Diagnostik Kompetensi untuk cek kelayakan Anda secara personal.',
    links: [{ label: 'Cek Kelayakan Saya', href: '/diagnostik-kompetensi' }],
  },
  {
    id: 'p3', kategori: 'Persyaratan',
    q: 'Apakah harus memiliki sertifikat pelatihan untuk mendaftar SKK?',
    a: 'Tidak wajib, tapi sangat disarankan. Beberapa LSP mensyaratkan sertifikat pelatihan relevan sebagai bukti kompetensi tambahan, terutama untuk level tinggi (Level 7–9). Pelatihan yang diakui bisa berupa: bimtek pemerintah, kursus lembaga pelatihan terakreditasi, atau in-house training perusahaan yang terdokumentasi.',
  },
  {
    id: 'p4', kategori: 'Persyaratan',
    q: 'Bisakah lulusan non-teknik mendaftar SKK konstruksi?',
    a: 'Tergantung jabatannya. Untuk jabatan manajemen proyek (Level 6–7), beberapa LSP menerima lulusan non-teknik jika pengalaman kerja konstruksi sangat memadai (biasanya 10+ tahun). Untuk jabatan teknis seperti Ahli Teknik Sipil, biasanya diperlukan latar belakang pendidikan teknik. Konsultasikan langsung ke LSP yang dituju.',
  },

  // ── Pendaftaran ───────────────────────────────────────────────────────────────
  {
    id: 'df1', kategori: 'Pendaftaran',
    q: 'Bagaimana cara mendaftar uji kompetensi SKK?',
    a: 'Langkah pendaftaran SKK: (1) Pilih LSP berlisensi BNSP yang melayani jabatan yang Anda tuju. (2) Hubungi LSP untuk mendapat informasi jadwal dan formulir pendaftaran. (3) Isi FR.APL.01 (formulir permohonan) dan FR.APL.02 (asesmen mandiri). (4) Kumpulkan dokumen pendukung. (5) Bayar biaya asesmen. (6) Ikuti proses uji kompetensi sesuai jadwal.',
    links: [{ label: 'Panduan Prosedur UJK', href: '/prosedur' }],
  },
  {
    id: 'df2', kategori: 'Pendaftaran',
    q: 'Bagaimana cara menemukan LSP yang tepat untuk jabatan saya?',
    a: 'Cari LSP yang berlisensi BNSP di website resmi BNSP (bnsp.go.id) dengan filter bidang konstruksi. Pastikan LSP tersebut memiliki skema sertifikasi untuk jabatan yang Anda tuju. Anda juga bisa bertanya ke asosiasi profesi (HATTI, HPJI, PII) atau rekan sejawat yang sudah bersertifikat di bidang yang sama.',
  },
  {
    id: 'df3', kategori: 'Pendaftaran',
    q: 'Apakah pendaftaran bisa dilakukan online?',
    a: 'Semakin banyak LSP yang menerima pendaftaran online, terutama setelah pandemi. Beberapa LSP memiliki portal pendaftaran digital. Namun sebagian masih mengharuskan pengiriman dokumen fisik atau kunjungan langsung ke TUK. Konfirmasi ke LSP yang Anda pilih untuk prosedur pendaftaran spesifiknya.',
  },
  {
    id: 'df4', kategori: 'Pendaftaran',
    q: 'Berapa lama proses dari pendaftaran hingga terima SKK?',
    a: 'Estimasi total waktu: Pendaftaran + verifikasi dokumen (1–2 minggu) → Jadwal asesmen (1–4 minggu tergantung ketersediaan) → Proses asesmen (1 hari) → Pengumuman hasil (7–14 hari kerja) → Penerbitan SKK jika kompeten (30–60 hari). Total estimasi: 2–4 bulan dari pendaftaran hingga SKK di tangan.',
  },

  // ── Dokumen ───────────────────────────────────────────────────────────────────
  {
    id: 'dk1', kategori: 'Dokumen',
    q: 'Dokumen apa saja yang harus disiapkan untuk SKK?',
    a: 'Dokumen wajib umum: (1) KTP asli + fotokopi, (2) Ijazah terakhir yang dilegalisir, (3) Pas foto terbaru 3×4 (biasanya 4 lembar), (4) FR.APL.01 yang diisi lengkap, (5) FR.APL.02 (asesmen mandiri) dengan bukti, (6) Surat Keterangan Pengalaman Kerja dari perusahaan, (7) Portofolio pekerjaan relevan, (8) Sertifikat pelatihan (jika ada), (9) Bukti pembayaran biaya asesmen.',
    links: [{ label: 'Checklist Lengkap Hari-H', href: '/hari-h' }],
  },
  {
    id: 'dk2', kategori: 'Dokumen',
    q: 'Apa isi FR.APL.01 dan siapa yang mengisi?',
    a: 'FR.APL.01 adalah Formulir Permohonan Asesmen Kompetensi yang diisi oleh asesi (peserta). Isinya mencakup: data diri, riwayat pendidikan, riwayat pengalaman kerja, jabatan yang dimohon, metode asesmen yang dipilih (hardcopy/paperless/AJJ), dan pernyataan komitmen kejujuran. Formulir harus ditandatangani di atas materai.',
  },
  {
    id: 'dk3', kategori: 'Dokumen',
    q: 'Bagaimana cara mengisi FR.APL.02 (Asesmen Mandiri)?',
    a: 'FR.APL.02 berisi daftar semua unit kompetensi (UK) dan kriteria unjuk kerja (KUK) untuk jabatan yang diajukan. Untuk setiap KUK, asesi mencentang "Kompeten" atau "Belum Kompeten" berdasarkan pengalaman nyata, lalu melampirkan bukti konkret (foto proyek, sertifikat, SK penugasan, laporan kerja). Semakin spesifik bukti yang dilampirkan, semakin kuat asesmen mandiri Anda.',
  },
  {
    id: 'dk4', kategori: 'Dokumen',
    q: 'Apakah portofolio harus menggunakan format tertentu?',
    a: 'Tidak ada format baku nasional untuk portofolio SKK, namun umumnya berisi: halaman cover, daftar isi, ringkasan pengalaman kerja, bukti proyek per unit kompetensi (foto, gambar, laporan, SK), dan sertifikat relevan. Tata dengan rapi sesuai urutan UK di FR.APL.02. Beberapa LSP menyediakan template portofolio mereka sendiri.',
  },
  {
    id: 'dk5', kategori: 'Dokumen',
    q: 'Berapa lama dokumen pendukung harus disimpan setelah asesmen?',
    a: 'Simpan semua dokumen asli minimal 5 tahun (sesuai masa berlaku SKK) untuk keperluan surveillance dan re-sertifikasi. Backup digital sangat dianjurkan — scan semua dokumen dalam resolusi tinggi dan simpan di cloud storage atau harddisk eksternal.',
  },

  // ── Asesmen ───────────────────────────────────────────────────────────────────
  {
    id: 'a1', kategori: 'Asesmen',
    q: 'Apa saja metode asesmen SKK yang tersedia?',
    a: 'Ada 3 metode asesmen SKK: (1) Hardcopy — asesmen konvensional dengan dokumen fisik di TUK, (2) Paperless — asesmen digital menggunakan platform online di TUK, (3) AJJ (Asesmen Jarak Jauh) — asesmen via video conference tanpa harus hadir di TUK. Tidak semua LSP menawarkan ketiga metode. Pilih sesuai kemampuan dan ketersediaan.',
    links: [{ label: 'Panduan per Metode Asesmen', href: '/hari-h' }],
  },
  {
    id: 'a2', kategori: 'Asesmen',
    q: 'Apa yang terjadi selama proses asesmen berlangsung?',
    a: 'Proses asesmen biasanya terdiri dari: (1) Registrasi & verifikasi identitas, (2) Asesmen portofolio — asesor memeriksa dokumen dan bukti kompetensi, (3) Tes tertulis — soal pilihan ganda dan/atau esai berbasis SKKNI, (4) Wawancara kompetensi — asesor menanyakan pengalaman konkret per unit kompetensi, (5) Demonstrasi praktik (untuk level terampil). Durasi total biasanya 4–8 jam.',
  },
  {
    id: 'a3', kategori: 'Asesmen',
    q: 'Apa yang dimaksud "metode STAR" dalam wawancara asesmen?',
    a: 'STAR adalah kerangka menjawab pertanyaan wawancara kompetensi: Situasi (apa konteks/latar belakang kejadian?), Tugas (apa peran dan tanggung jawab Anda?), Aksi (apa yang Anda lakukan secara konkret?), Hasil (apa dampak/hasilnya, ukurannya?). Contoh: "Saat proyek jembatan X terlambat 3 minggu (S), saya sebagai pelaksana harus mengejar jadwal (T), saya melakukan lembur terstruktur dan penjadwalan ulang (A), proyek selesai hanya terlambat 5 hari (R)."',
    links: [{ label: 'Mock Asesmen: Latihan Soal', href: '/mock-asesmen' }],
  },
  {
    id: 'a4', kategori: 'Asesmen',
    q: 'Apa yang terjadi jika dinyatakan Belum Kompeten?',
    a: 'Jika hasil asesmen "Belum Kompeten", asesor akan memberikan umpan balik spesifik tentang gap yang perlu diperbaiki. Anda dapat mengajukan banding jika merasa ada ketidaksesuaian proses, atau memperbaiki gap dan mengulang asesmen. Biasanya ada masa tunggu 1–3 bulan sebelum bisa mengulang asesmen. Tidak ada batasan jumlah pengulangan.',
  },
  {
    id: 'a5', kategori: 'Asesmen',
    q: 'Kapan hasil asesmen diumumkan?',
    a: 'Beberapa LSP mengumumkan hasil secara lisan di hari yang sama (hasil sementara). Hasil resmi tertulis biasanya keluar dalam 7–14 hari kerja. Setelah dinyatakan Kompeten, SKK fisik/digital diterbitkan dalam 30–60 hari kerja. Anda akan mendapat notifikasi dari LSP via email atau WhatsApp.',
  },
  {
    id: 'a6', kategori: 'Asesmen',
    q: 'Apakah asesmen AJJ (jarak jauh) sama validitasnya dengan asesmen tatap muka?',
    a: 'Ya, SKK yang diterbitkan dari asesmen AJJ memiliki validitas yang sama dengan asesmen tatap muka. AJJ diatur dalam Pedoman BNSP No. 210 dan menggunakan prosedur pengawasan ketat melalui video conference untuk memastikan integritas proses.',
  },

  // ── Perpanjangan ──────────────────────────────────────────────────────────────
  {
    id: 'pr1', kategori: 'Perpanjangan',
    q: 'Apa itu Surveillance SKK dan kapan wajib dilakukan?',
    a: 'Surveillance adalah kewajiban pemantauan kompetensi selama masa berlaku SKK untuk memastikan pemegang SKK tetap aktif dan kompeten. Surveillance 1 dilakukan pada bulan ke-18, Surveillance 2 pada bulan ke-36 sejak SKK diterbitkan. Jika tidak mengikuti surveillance, SKK bisa dibekukan/dicabut.',
    links: [{ label: 'Pantau Jadwal Surveillance', href: '/pantau-skk' }],
  },
  {
    id: 'pr2', kategori: 'Perpanjangan',
    q: 'Apakah surveillance sama dengan asesmen ulang?',
    a: 'Tidak. Surveillance lebih ringan dari asesmen penuh. Biasanya berupa pelaporan aktivitas PKB (Pengembangan Keprofesian Berkelanjutan), verifikasi bahwa pemegang SKK masih aktif bekerja di bidang yang relevan, dan mungkin wawancara singkat. Biayanya juga lebih rendah dibanding asesmen baru.',
  },
  {
    id: 'pr3', kategori: 'Perpanjangan',
    q: 'Bagaimana cara memperpanjang SKK yang hampir kadaluarsa?',
    a: 'Proses re-sertifikasi (perpanjangan SKK): (1) Ajukan permohonan ke LSP minimal 3 bulan sebelum kadaluarsa. (2) Siapkan bukti PKB dan pengalaman kerja selama 5 tahun terakhir. (3) Ikuti proses asesmen ulang (biasanya lebih ringkas dari asesmen pertama). (4) SKK baru diterbitkan dengan masa berlaku 5 tahun baru.',
    links: [{ label: 'Panduan Perpanjangan via SKK Coach', href: '/skk-coach/chat?agent=perpanjangan' }],
  },
  {
    id: 'pr4', kategori: 'Perpanjangan',
    q: 'Apa yang terjadi jika SKK kadaluarsa dan tidak diperpanjang?',
    a: 'SKK yang kadaluarsa tidak dapat digunakan sebagai bukti kompetensi dalam proyek konstruksi. Untuk mendapat SKK baru, harus mengulang proses sertifikasi dari awal (bukan re-sertifikasi). Perusahaan yang mempekerjakan tenaga kerja dengan SKK kadaluarsa berisiko sanksi administratif dan tidak dapat memperbarui SBU.',
  },
  {
    id: 'pr5', kategori: 'Perpanjangan',
    q: 'Apa itu PKB dan bagaimana cara mengumpulkan poinnya?',
    a: 'PKB (Pengembangan Keprofesian Berkelanjutan) adalah kegiatan yang dilakukan untuk mempertahankan dan meningkatkan kompetensi profesional. Poin PKB bisa diperoleh dari: seminar/webinar, pelatihan, penulisan artikel/makalah, kegiatan asosiasi profesi, memberi pelatihan/pengajaran, dan proyek inovatif. Poin PKB biasanya dilaporkan saat surveillance.',
  },

  // ── Biaya ──────────────────────────────────────────────────────────────────────
  {
    id: 'b1', kategori: 'Biaya',
    q: 'Berapa total biaya yang diperlukan untuk mendapatkan SKK?',
    a: 'Biaya SKK bervariasi tergantung jabatan, level, wilayah, dan LSP. Estimasi kasar: Level 2–4 (Rp 3–8 juta total), Level 5–6 (Rp 8–20 juta), Level 7–9 (Rp 25–60 juta). Komponen: pelatihan, biaya asesmen LSP, TUK, persiapan dokumen, dan transportasi. Gunakan kalkulator untuk estimasi akurat.',
    links: [{ label: 'Kalkulator Biaya SKK', href: '/biaya-skk' }],
  },
  {
    id: 'b2', kategori: 'Biaya',
    q: 'Apakah biaya SKK bisa ditanggung perusahaan?',
    a: 'Ya, dan ini umum terjadi. Perusahaan BUJK memiliki kewajiban memiliki tenaga ahli bersertifikat SKK, sehingga banyak yang menanggung atau mensubsidi biaya sertifikasi karyawannya. Minta HR/manajemen untuk mengalokasikan biaya SKK dalam anggaran pelatihan karyawan. Biaya ini juga bisa diklaim sebagai biaya operasional yang mengurangi pajak perusahaan.',
  },
  {
    id: 'b3', kategori: 'Biaya',
    q: 'Adakah SKK gratis atau bersubsidi dari pemerintah?',
    a: 'Ya. Kementerian PUPR dan Pemda secara berkala menyelenggarakan program sertifikasi SKK bersubsidi, terutama untuk tenaga terampil (Level 2–4) di daerah. Pantau website DJBK Kementerian PUPR, Dinas PUPR daerah, dan asosiasi konstruksi (GAPENSI, ASKONAS, dll) untuk informasi program subsidi terbaru.',
  },
  {
    id: 'b4', kategori: 'Biaya',
    q: 'Apakah biaya perpanjangan SKK lebih murah dari sertifikasi baru?',
    a: 'Umumnya ya. Re-sertifikasi (perpanjangan) biasanya 50–70% dari biaya sertifikasi baru karena prosesnya lebih singkat dan tidak memerlukan pelatihan ulang dari awal. Namun tetap bergantung kebijakan masing-masing LSP. Surveillance (bulan ke-18 dan ke-36) biasanya lebih murah lagi.',
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const kategoriList: Kategori[] = ['Umum', 'Persyaratan', 'Pendaftaran', 'Dokumen', 'Asesmen', 'Perpanjangan', 'Biaya'];

const kategoriColor: Record<Kategori, string> = {
  'Umum':          'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'Persyaratan':   'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Pendaftaran':   'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Dokumen':       'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Asesmen':       'bg-green-500/20 text-green-400 border-green-500/30',
  'Perpanjangan':  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Biaya':         'bg-red-500/20 text-red-400 border-red-500/30',
};

const kategoriIcon: Record<Kategori, string> = {
  'Umum': '💡', 'Persyaratan': '📋', 'Pendaftaran': '📝',
  'Dokumen': '📄', 'Asesmen': '🎯', 'Perpanjangan': '🔄', 'Biaya': '💰',
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function FAQSKKPage() {
  const [query, setQuery] = useState('');
  const [aktifKat, setAktifKat] = useState<Kategori | 'Semua'>('Semua');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return faqs.filter(f => {
      const matchKat = aktifKat === 'Semua' || f.kategori === aktifKat;
      if (!matchKat) return false;
      if (!q) return true;
      return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    });
  }, [query, aktifKat]);

  const grouped = useMemo(() => {
    const map: Partial<Record<Kategori, FAQ[]>> = {};
    for (const f of filtered) {
      if (!map[f.kategori]) map[f.kategori] = [];
      map[f.kategori]!.push(f);
    }
    return map;
  }, [filtered]);

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium mb-4">
            ❓ {faqs.length} Pertanyaan yang Sering Ditanyakan
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            FAQ <span className="text-orange-400">SKK</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Jawaban lengkap untuk pertanyaan paling umum seputar Sertifikat Kompetensi Kerja konstruksi — dari persyaratan, pendaftaran, hingga perpanjangan.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">❓</span>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setAktifKat('Semua'); }}
            placeholder="Cari pertanyaan... (mis: cara daftar, biaya, perpanjangan)"
            className="w-full pl-11 pr-10 py-3.5 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">✕</button>
          )}
        </div>

        {/* Category pills */}
        {!query && (
          <div className="flex gap-2 flex-wrap">
            {(['Semua', ...kategoriList] as (Kategori | 'Semua')[]).map(k => (
              <button
                key={k}
                onClick={() => setAktifKat(k)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  aktifKat === k
                    ? k === 'Semua'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : `${kategoriColor[k as Kategori]} font-semibold`
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {k !== 'Semua' && <span className="mr-1">{kategoriIcon[k as Kategori]}</span>}
                {k}
                {k !== 'Semua' && (
                  <span className="ml-1 text-xs opacity-60">({faqs.filter(f => f.kategori === k).length})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Results info */}
        {query && (
          <p className="text-slate-400 text-sm">
            <span className="text-orange-400 font-semibold">{filtered.length}</span> pertanyaan ditemukan untuk &ldquo;<span className="text-white">{query}</span>&rdquo;
          </p>
        )}

        {/* FAQ content */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-4xl mb-3">🔍</div>
            <p>Tidak ada pertanyaan yang cocok.</p>
            <p className="text-sm mt-1">Coba kata kunci lain atau tanya langsung ke SKK Coach AI.</p>
            <Link href="/skk-coach" className="inline-block mt-4 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm hover:bg-orange-500/30 transition-colors">
              Tanya SKK Coach →
            </Link>
          </div>
        ) : query ? (
          <div className="space-y-3">
            {filtered.map(f => (
              <FAQCard key={f.id} faq={f} expanded={expanded === f.id} onToggle={() => toggle(f.id)} showBadge />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {kategoriList.map(kat => {
              const items = grouped[kat];
              if (!items || items.length === 0) return null;
              return (
                <div key={kat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{kategoriIcon[kat]}</span>
                    <h2 className="text-white font-semibold">{kat}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${kategoriColor[kat]}`}>{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(f => (
                      <FAQCard key={f.id} faq={f} expanded={expanded === f.id} onToggle={() => toggle(f.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 text-center space-y-3">
          <p className="text-white font-semibold">Tidak menemukan jawaban yang Anda cari?</p>
          <p className="text-slate-400 text-sm">Tanyakan langsung ke SKK Coach AI — tersedia 5 agen spesialis: kelayakan, dokumen, jabatan, perpanjangan, dan SKK-SBU.</p>
          <Link
            href="/skk-coach"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            💬 Tanya SKK Coach AI
          </Link>
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/prosedur" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-orange-500/40 transition-colors">
            <span className="text-xl">📋</span>
            <div><p className="text-white text-sm font-medium">Prosedur UJK</p><p className="text-slate-500 text-xs">Alur sertifikasi lengkap</p></div>
          </Link>
          <Link href="/glosarium" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-orange-500/40 transition-colors">
            <span className="text-xl">📖</span>
            <div><p className="text-white text-sm font-medium">Glosarium SKK</p><p className="text-slate-500 text-xs">Kamus istilah & singkatan</p></div>
          </Link>
          <Link href="/biaya-skk" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-orange-500/40 transition-colors">
            <span className="text-xl">💰</span>
            <div><p className="text-white text-sm font-medium">Kalkulator Biaya</p><p className="text-slate-500 text-xs">Estimasi biaya per jabatan</p></div>
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── FAQCard ──────────────────────────────────────────────────────────────────

function FAQCard({ faq, expanded, onToggle, showBadge }: {
  faq: FAQ; expanded: boolean; onToggle: () => void; showBadge?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border transition-all overflow-hidden ${
        expanded ? 'bg-slate-700/50 border-orange-500/40' : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600'
      }`}
    >
      <button className="w-full text-left p-4 flex items-start gap-3" onClick={onToggle}>
        <span className={`text-lg flex-shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-0' : ''}`}>
          {expanded ? '🔽' : '▶️'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            {showBadge && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${kategoriColor[faq.kategori]}`}>
                {kategoriIcon[faq.kategori]} {faq.kategori}
              </span>
            )}
          </div>
          <p className={`text-sm font-semibold leading-snug ${expanded ? 'text-orange-300' : 'text-white'}`}>{faq.q}</p>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-5 space-y-3">
          <div className="h-px bg-slate-700/60" />
          <p className="text-slate-300 text-sm leading-relaxed">{faq.a}</p>
          {faq.links && faq.links.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {faq.links.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg text-xs font-medium hover:bg-orange-500/20 transition-colors"
                >
                  {l.label} →
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
