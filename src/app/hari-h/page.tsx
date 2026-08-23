'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type Method = 'hardcopy' | 'paperless' | 'ajj';

interface TimelineStep {
  time: string;
  icon: string;
  title: string;
  desc: string;
  tips?: string[];
  color: string;
}

interface CheckItem {
  id: string;
  label: string;
  required: boolean;
  methods: Method[];
}

// ─── Checklist data ──────────────────────────────────────────────────────────

const checkItems: CheckItem[] = [
  // Dokumen — all methods
  { id: 'ktp', label: 'KTP asli + fotokopi 2 lembar', required: true, methods: ['hardcopy','paperless','ajj'] },
  { id: 'ijazah', label: 'Ijazah asli + fotokopi yang dilegalisir', required: true, methods: ['hardcopy','paperless','ajj'] },
  { id: 'foto', label: 'Pas foto 3×4 terbaru 4 lembar (background merah/biru)', required: true, methods: ['hardcopy','paperless','ajj'] },
  { id: 'apl01', label: 'FR.APL.01 yang sudah diisi dan ditandatangani', required: true, methods: ['hardcopy','paperless'] },
  { id: 'apl02', label: 'FR.APL.02 Asesmen Mandiri yang sudah diisi', required: true, methods: ['hardcopy','paperless'] },
  { id: 'skpengalaman', label: 'Surat Keterangan Pengalaman Kerja dari perusahaan', required: true, methods: ['hardcopy','paperless','ajj'] },
  { id: 'portofolio', label: 'Portofolio pekerjaan / bukti pengalaman', required: true, methods: ['hardcopy','paperless','ajj'] },
  { id: 'materai', label: 'Materai Rp 10.000 (minimal 5 lembar)', required: true, methods: ['hardcopy','paperless'] },
  // Hardcopy specific
  { id: 'ordner', label: 'Ordner/map snelhechter untuk semua dokumen (per berkas diberi label)', required: false, methods: ['hardcopy'] },
  { id: 'pulpen', label: 'Pulpen hitam cadangan (minimal 2)', required: false, methods: ['hardcopy'] },
  // Paperless specific
  { id: 'laptop', label: 'Laptop/tablet yang terisi penuh (+ charger)', required: true, methods: ['paperless'] },
  { id: 'scan', label: 'Semua dokumen sudah di-scan dan tersimpan di folder rapi', required: true, methods: ['paperless'] },
  { id: 'akun', label: 'Username & password platform e-asesmen sudah dicoba', required: true, methods: ['paperless'] },
  // AJJ specific
  { id: 'internet', label: 'Koneksi internet stabil (minimal 10 Mbps, uji coba H-1)', required: true, methods: ['ajj'] },
  { id: 'kamera', label: 'Kamera/webcam & mikrofon berfungsi baik', required: true, methods: ['ajj'] },
  { id: 'zoom', label: 'Aplikasi Zoom/Teams/GovVideo sudah terinstall & diuji', required: true, methods: ['ajj'] },
  { id: 'ruang', label: 'Ruangan tenang, pencahayaan cukup, background rapi', required: true, methods: ['ajj'] },
  { id: 'backup', label: 'Hotspot HP disiapkan sebagai backup internet', required: false, methods: ['ajj'] },
  // General items
  { id: 'biaya', label: 'Bukti pembayaran biaya asesmen', required: true, methods: ['hardcopy','paperless','ajj'] },
  { id: 'undangan', label: 'Surat undangan / konfirmasi jadwal asesmen dari LSP', required: true, methods: ['hardcopy','paperless','ajj'] },
  { id: 'makan', label: 'Sarapan & minum air putih (asesmen bisa 4–8 jam)', required: false, methods: ['hardcopy','paperless','ajj'] },
];

// ─── Timeline data ────────────────────────────────────────────────────────────

const timelineH7: TimelineStep[] = [
  {
    time: 'H-7', icon: '📋', title: 'Cek Kelengkapan Dokumen',
    desc: 'Review semua berkas yang dibutuhkan. Fotokopi ijazah & KTP, cetak FR.APL.01 dan FR.APL.02, siapkan bukti pengalaman kerja.',
    tips: ['Cek tanggal kadaluarsa KTP', 'Legalisir ijazah di instansi terkait', 'Scan semua dokumen sebagai backup digital'],
    color: 'blue',
  },
  {
    time: 'H-7', icon: '📚', title: 'Review Materi Unit Kompetensi',
    desc: 'Pelajari kembali unit kompetensi (UK) yang akan diuji. Fokus pada Kriteria Unjuk Kerja (KUK) di setiap UK.',
    tips: ['Download SKKNI jabatan Anda dari BSN', 'Gunakan Mock Asesmen di SIAP SKK untuk latihan soal', 'Buat rangkuman poin penting per UK'],
    color: 'amber',
  },
  {
    time: 'H-5', icon: '🗂️', title: 'Susun Portofolio',
    desc: 'Kumpulkan bukti pengalaman kerja: foto proyek, sertifikat pelatihan, surat tugas, laporan kerja. Tata sesuai urutan UK.',
    tips: ['Beri label jelas di setiap bukti', 'Hubungkan setiap bukti ke KUK spesifik', 'Simpan dalam folder berlabel per UK'],
    color: 'purple',
  },
  {
    time: 'H-3', icon: '💬', title: 'Latihan Wawancara',
    desc: 'Simulasikan pertanyaan asesor. Ceritakan pengalaman konkret menggunakan metode STAR (Situasi, Tugas, Aksi, Hasil).',
    tips: ['Latih dengan rekan / rekam video diri sendiri', 'Siapkan 2–3 contoh proyek nyata per UK', 'Gunakan bahasa formal dan spesifik'],
    color: 'green',
  },
];

const timelineH1: TimelineStep[] = [
  {
    time: 'Sore', icon: '🗺️', title: 'Survei Lokasi TUK',
    desc: 'Kunjungi atau cek Google Maps ke lokasi TUK. Perkirakan waktu tempuh dan parkir agar tidak terlambat besok.',
    tips: ['Cek jam buka dan protokol masuk gedung', 'Simpan nomor kontak TUK di HP'],
    color: 'blue',
  },
  {
    time: 'Sore', icon: '🖨️', title: 'Cetak & Jilid Dokumen',
    desc: 'Cetak semua formulir yang belum dicetak. Jilid portofolio dengan rapi. Urutkan sesuai daftar cek.',
    tips: ['Print 2 rangkap untuk jaga-jaga', 'Tanda tangani semua formulir yang belum'],
    color: 'amber',
  },
  {
    time: 'Malam', icon: '💻', title: 'Uji Perangkat (Paperless/AJJ)',
    desc: 'Tes login ke platform e-asesmen. Pastikan kamera, mikrofon, dan koneksi internet berjalan lancar.',
    tips: ['Update browser ke versi terbaru', 'Tutup aplikasi berat yang tidak perlu', 'Tes Zoom/Teams dengan koneksi yang akan dipakai'],
    color: 'purple',
  },
  {
    time: 'Malam', icon: '😴', title: 'Istirahat Cukup',
    desc: 'Tidur minimal 7–8 jam. Jangan belajar terlalu larut — kondisi fisik dan mental prima jauh lebih penting dari hafalan menit-menit terakhir.',
    color: 'green',
  },
];

const timelineHariH: Record<Method, TimelineStep[]> = {
  hardcopy: [
    { time: '07:00', icon: '🌅', title: 'Persiapan Pagi', desc: 'Sarapan, berpakaian rapi (formal/semi-formal). Cek sekali lagi semua dokumen di tas.', color: 'blue' },
    { time: '08:00', icon: '🚗', title: 'Berangkat ke TUK', desc: 'Tiba minimal 30 menit sebelum jadwal. Laporkan kedatangan ke panitia.', tips: ['Bawa charger HP', 'Matikan atau silent HP saat asesmen dimulai'], color: 'amber' },
    { time: '08:30', icon: '📝', title: 'Registrasi & Verifikasi', desc: 'Serahkan dokumen ke panitia. Tanda tangani daftar hadir. Asesor akan memverifikasi identitas dan kelengkapan berkas.', color: 'purple' },
    { time: '09:00', icon: '🗂️', title: 'Asesmen Portofolio', desc: 'Asesor memeriksa dokumen portofolio Anda. Jelaskan setiap bukti dengan singkat, jelas, dan percaya diri.', tips: ['Tetap tenang, asesor bukan musuh', 'Jawab sesuai pengalaman nyata Anda'], color: 'green' },
    { time: '10:00', icon: '✍️', title: 'Uji Tulis / Tes Tertulis', desc: 'Menjawab soal pilihan ganda dan/atau esai berbasis SKKNI. Baca soal dengan teliti sebelum menjawab.', tips: ['Jawab yang mudah dulu', 'Kelola waktu: ~1–2 menit per soal', 'Periksa kembali sebelum dikumpulkan'], color: 'cyan' },
    { time: '13:00', icon: '💬', title: 'Wawancara Kompetensi', desc: 'Asesor menanyakan pengalaman kerja sesuai unit kompetensi. Gunakan metode STAR dalam menjawab.', tips: ['Cerita konkret, bukan teori', 'Sebutkan proyek nyata dengan angka/fakta'], color: 'pink' },
    { time: '15:00', icon: '📊', title: 'Verifikasi Hasil (jika langsung)', desc: 'Beberapa LSP mengumumkan hasil di hari yang sama. Asesor memberikan rekomendasi kompeten/belum kompeten.', color: 'amber' },
  ],
  paperless: [
    { time: '07:30', icon: '💻', title: 'Nyalakan Perangkat', desc: 'Nyalakan laptop minimal 30 menit sebelum jadwal. Login ke platform e-asesmen dan pastikan semua berjalan normal.', color: 'blue' },
    { time: '08:00', icon: '🔐', title: 'Login & Konfirmasi', desc: 'Login dengan akun yang diberikan LSP. Konfirmasi kehadiran secara digital. Upload foto KTP jika diminta.', color: 'amber' },
    { time: '08:30', icon: '🗂️', title: 'Upload Dokumen', desc: 'Upload portofolio dan dokumen pendukung yang diminta melalui platform. Pastikan file tidak melebihi batas ukuran.', tips: ['Format file: PDF untuk dokumen, JPG untuk foto', 'Nama file harus jelas: APL01_NamaAnda.pdf'], color: 'purple' },
    { time: '09:00', icon: '✍️', title: 'Asesmen Portofolio Online', desc: 'Asesor mereview portofolio Anda melalui platform. Siap menjawab pertanyaan via chat atau video call.', color: 'green' },
    { time: '10:00', icon: '📱', title: 'Ujian Online', desc: 'Kerjakan soal berbasis computer-based test (CBT). Timer terlihat di layar — kelola waktu dengan baik.', tips: ['Jangan refresh halaman', 'Jawaban tersimpan otomatis per soal', 'Laporkan bug/masalah teknis segera ke panitia'], color: 'cyan' },
    { time: '13:00', icon: '🎥', title: 'Wawancara Video', desc: 'Wawancara via Zoom/Teams bersama asesor. Pastikan posisi kamera, pencahayaan, dan suara optimal.', tips: ['Tatap kamera, bukan layar', 'Matikan notifikasi semua aplikasi'], color: 'pink' },
  ],
  ajj: [
    { time: '07:45', icon: '🌐', title: 'Cek Koneksi Final', desc: 'Tes kecepatan internet (speedtest.net). Minimal 10 Mbps download. Jika kurang, switch ke hotspot HP.', color: 'blue' },
    { time: '08:00', icon: '🎥', title: 'Join Video Conference', desc: 'Buka link Zoom/Teams 10–15 menit sebelum jadwal. Tunggu di ruang lobi hingga asesor mengizinkan masuk.', tips: ['Rename akun Zoom: Nama_Jabatan_SKK', 'Background: polos atau blur'], color: 'amber' },
    { time: '08:15', icon: '🪪', title: 'Verifikasi Identitas Jarak Jauh', desc: 'Tunjukkan KTP asli ke kamera. Asesor akan melakukan verifikasi biometrik / foto. Pastikan pencahayaan cukup.', color: 'purple' },
    { time: '08:30', icon: '🗂️', title: 'Presentasi Portofolio', desc: 'Share screen dan presentasikan portofolio Anda. Jelaskan setiap bukti kompetensi secara ringkas dan terstruktur.', tips: ['Siapkan presentasi PPT/PDF yang rapi', 'Koneksi cadangan: hotspot HP siap sedia'], color: 'green' },
    { time: '10:00', icon: '✍️', title: 'Ujian Online / CBT', desc: 'Link ujian dikirim via chat Zoom. Buka di tab terpisah. Kamera tetap menyala selama ujian berlangsung.', tips: ['Jangan berbagi layar ke orang lain', 'Asesor memantau via kamera selama ujian'], color: 'cyan' },
    { time: '13:00', icon: '💬', title: 'Wawancara Kompetensi', desc: 'Wawancara mendalam per unit kompetensi. Ceritakan pengalaman konkret, berikan contoh spesifik.', color: 'pink' },
    { time: '15:00', icon: '📋', title: 'Penutupan & Tanda Tangan Digital', desc: 'Asesor menutup sesi. Tanda tangan berita acara secara digital atau dikirim via email untuk ditandatangani.', color: 'amber' },
  ],
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
  amber: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
  purple: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
  green: 'bg-green-500/20 border-green-500/40 text-green-400',
  cyan: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
  pink: 'bg-pink-500/20 border-pink-500/40 text-pink-400',
};

const methodLabels: Record<Method, { icon: string; label: string; desc: string }> = {
  hardcopy: { icon: '📝', label: 'Hardcopy', desc: 'Asesmen konvensional dengan dokumen fisik di TUK' },
  paperless: { icon: '💻', label: 'Paperless', desc: 'Asesmen digital di TUK menggunakan platform online' },
  ajj: { icon: '🌐', label: 'AJJ (Remote)', desc: 'Asesmen Jarak Jauh via video conference dari rumah/kantor' },
};

const STORAGE_KEY = 'siapskk_harih_checklist';

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function HariHPage() {
  const [method, setMethod] = useState<Method>('hardcopy');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [activePhase, setActivePhase] = useState<'h7' | 'h1' | 'harih'>('h7');

  // Persist checklist
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const relevantItems = checkItems.filter(i => i.methods.includes(method));
  const doneCount = relevantItems.filter(i => checked[i.id]).length;
  const pct = relevantItems.length > 0 ? Math.round((doneCount / relevantItems.length) * 100) : 0;

  const resetChecklist = () => {
    setChecked({});
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-medium mb-4">
            📅 Panduan Hari-H Asesmen SKK
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Panduan <span className="text-green-400">Hari-H</span> Asesmen
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Checklist interaktif, timeline hari ujian, dan tips dari H-7 hingga pasca asesmen — disesuaikan per metode: Hardcopy, Paperless, dan AJJ.
          </p>
        </div>

        {/* Method selector */}
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(methodLabels) as Method[]).map(m => {
            const info = methodLabels[m];
            return (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  method === m
                    ? 'bg-green-500/20 border-green-500/50 text-green-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-1">{info.icon}</div>
                <div className="font-semibold text-white text-sm">{info.label}</div>
                <div className="text-xs mt-0.5 line-clamp-2">{info.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Phase tabs */}
        <div className="flex gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl p-1.5">
          {([
            { id: 'h7', label: '📅 H-7 s/d H-3', sub: 'Persiapan Awal' },
            { id: 'h1', label: '🌙 H-1', sub: 'Persiapan Akhir' },
            { id: 'harih', label: '🎯 Hari H', sub: 'Jadwal Ujian' },
          ] as const).map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                activePhase === p.id
                  ? 'bg-green-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div>{p.label}</div>
              <div className={`text-xs font-normal mt-0.5 ${activePhase === p.id ? 'text-green-100' : 'text-slate-500'}`}>{p.sub}</div>
            </button>
          ))}
        </div>

        {/* Timeline content */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
          {activePhase === 'h7' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold text-lg mb-5">📅 Persiapan H-7 hingga H-3</h2>
              {timelineH7.map((step, i) => (
                <TimelineCard key={i} step={step} />
              ))}
            </div>
          )}
          {activePhase === 'h1' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold text-lg mb-5">🌙 Persiapan Hari H-1</h2>
              {timelineH1.filter(s => method !== 'ajj' || s.time !== 'Malam' || s.icon !== '🖨️').map((step, i) => (
                <TimelineCard key={i} step={step} />
              ))}
            </div>
          )}
          {activePhase === 'harih' && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold text-lg mb-1">🎯 Timeline Hari H — <span className="text-green-400">{methodLabels[method].label}</span></h2>
              <p className="text-slate-400 text-sm mb-5">{methodLabels[method].desc}</p>
              {timelineHariH[method].map((step, i) => (
                <TimelineCard key={i} step={step} showTime />
              ))}
              <div className="mt-4 p-4 bg-slate-700/40 rounded-xl">
                <p className="text-slate-300 text-sm font-medium mb-1">📋 Setelah Asesmen</p>
                <p className="text-slate-400 text-sm">Hasil asesmen diumumkan dalam <strong className="text-white">7–14 hari kerja</strong> setelah tanggal asesmen. Jika dinyatakan <span className="text-green-400">Kompeten</span>, SKK akan diterbitkan dalam 30–60 hari. Jika <span className="text-red-400">Belum Kompeten</span>, Anda dapat mengajukan banding atau mengulang asesmen setelah memperbaiki gap yang diidentifikasi asesor.</p>
              </div>
            </div>
          )}
        </div>

        {/* Interactive checklist */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-white font-semibold text-lg">✅ Checklist Perlengkapan</h2>
              <p className="text-slate-400 text-sm">Untuk metode: <span className="text-green-400 font-medium">{methodLabels[method].label}</span></p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-green-400">{pct}%</div>
              <div className="text-slate-500 text-xs">{doneCount}/{relevantItems.length} siap</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Required items */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Wajib</p>
            <div className="space-y-2">
              {relevantItems.filter(i => i.required).map(item => (
                <CheckRow key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggle} />
              ))}
            </div>
          </div>

          {/* Optional items */}
          {relevantItems.some(i => !i.required) && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Dianjurkan</p>
              <div className="space-y-2">
                {relevantItems.filter(i => !i.required).map(item => (
                  <CheckRow key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggle} />
                ))}
              </div>
            </div>
          )}

          {pct === 100 && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-green-300 font-medium text-sm">Semua perlengkapan siap!</p>
                <p className="text-green-400/70 text-xs">Anda sudah siap menghadapi asesmen. Semoga berhasil!</p>
              </div>
            </div>
          )}

          <button onClick={resetChecklist} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Reset checklist
          </button>
        </div>

        {/* Tips umum */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">💡 Tips Sukses Asesmen SKK</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: '🎯', title: 'Jawab dengan Bukti Nyata', desc: 'Asesor menguji kompetensi, bukan hafalan teori. Selalu punya contoh proyek konkret untuk setiap unit kompetensi.' },
              { icon: '📊', title: 'Gunakan Metode STAR', desc: 'Situasi → Tugas → Aksi → Hasil. Struktur jawaban wawancara yang paling efektif dan mudah dipahami asesor.' },
              { icon: '😌', title: 'Kelola Kecemasan', desc: 'Tarik napas dalam sebelum menjawab. Asesor memahami bahwa Anda mungkin tegang — yang penting substansi jawaban.' },
              { icon: '📝', title: 'Baca Soal Dua Kali', desc: 'Tes tertulis SKK sering menggunakan kata kunci spesifik SKKNI. Baca setiap soal dengan teliti sebelum memilih jawaban.' },
              { icon: '⏰', title: 'Kelola Waktu Ujian', desc: 'Jangan terlalu lama di satu soal sulit. Skip dulu, jawab yang pasti, kembali ke soal sulit di akhir.' },
              { icon: '🤝', title: 'Profesional Sepanjang Waktu', desc: 'Salam, sopan, dan kooperatif dengan asesor dari awal hingga akhir. Kesan baik mempengaruhi suasana asesmen.' },
            ].map(t => (
              <div key={t.title} className="flex gap-3 p-4 bg-slate-700/40 rounded-xl">
                <span className="text-2xl flex-shrink-0">{t.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium mb-0.5">{t.title}</p>
                  <p className="text-slate-400 text-xs">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/mock-asesmen" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-green-500/40 transition-colors">
            <span className="text-xl">🎯</span>
            <div>
              <p className="text-white text-sm font-medium">Mock Asesmen</p>
              <p className="text-slate-500 text-xs">Latihan soal AI SKKNI</p>
            </div>
          </Link>
          <Link href="/prosedur" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-green-500/40 transition-colors">
            <span className="text-xl">📋</span>
            <div>
              <p className="text-white text-sm font-medium">Prosedur UJK</p>
              <p className="text-slate-500 text-xs">Panduan alur sertifikasi</p>
            </div>
          </Link>
          <Link href="/klinik-uji-kompetensi" className="flex items-center gap-2 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-green-500/40 transition-colors">
            <span className="text-xl">🏥</span>
            <div>
              <p className="text-white text-sm font-medium">Klinik SKK</p>
              <p className="text-slate-500 text-xs">Jalur persiapan lengkap</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TimelineCard({ step, showTime }: { step: TimelineStep; showTime?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${colorMap[step.color]} hover:opacity-90`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex-shrink-0 text-2xl">{step.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {showTime && (
            <span className="text-xs font-bold opacity-70 font-mono">{step.time}</span>
          )}
          {!showTime && (
            <span className="text-xs font-semibold opacity-70">{step.time}</span>
          )}
        </div>
        <p className="text-white text-sm font-semibold">{step.title}</p>
        <p className="text-sm opacity-80 mt-0.5">{step.desc}</p>
        {open && step.tips && (
          <ul className="mt-2 space-y-1">
            {step.tips.map((tip, i) => (
              <li key={i} className="text-xs opacity-70 flex gap-1.5">
                <span>•</span><span>{tip}</span>
              </li>
            ))}
          </ul>
        )}
        {step.tips && (
          <p className="text-xs opacity-50 mt-1.5">{open ? '▲ Tutup tips' : '▼ Lihat tips'}</p>
        )}
      </div>
    </div>
  );
}

function CheckRow({ item, checked, onToggle }: { item: CheckItem; checked: boolean; onToggle: (id: string) => void }) {
  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
        checked ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-700/40 border border-transparent hover:border-slate-600'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(item.id)}
        className="w-4 h-4 rounded accent-green-500 flex-shrink-0"
      />
      <span className={`text-sm transition-colors ${checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
        {item.label}
      </span>
      {item.required && !checked && (
        <span className="ml-auto flex-shrink-0 text-xs text-red-400 font-medium">Wajib</span>
      )}
    </label>
  );
}
