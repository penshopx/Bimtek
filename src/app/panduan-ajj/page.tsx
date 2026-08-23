'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Types & Data ──────────────────────────────────────────────────────────────

type Section = 'persiapan' | 'teknis' | 'hariH' | 'troubleshoot' | 'rules';

interface SectionData {
  id: Section;
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}

const sections: SectionData[] = [
  { id: 'persiapan', label: 'Persiapan Dokumen', icon: '📄', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'teknis',    label: 'Setup Teknis',      icon: '💻', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30'   },
  { id: 'hariH',    label: 'Hari-H AJJ',         icon: '📡', color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30'  },
  { id: 'troubleshoot', label: 'Troubleshooting', icon: '🔧', color: 'text-red-400',   bg: 'bg-red-500/10',    border: 'border-red-500/30'    },
  { id: 'rules',    label: 'Aturan Ketat',        icon: '⚖️',  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
];

const content: Record<Section, {
  intro: string;
  items: { title: string; detail: string; warning?: string; tip?: string }[];
}> = {
  persiapan: {
    intro: 'AJJ (Asesmen Jarak Jauh) mengharuskan semua dokumen dalam format digital yang terorganisir. Siapkan ini H-3 — jangan H-1.',
    items: [
      {
        title: 'Format File yang Diterima',
        detail: 'Dokumen: PDF (diutamakan), tidak terpassword. Foto bukti: JPG/PNG resolusi min. 1MP. File presentasi: PDF (bukan PPT — banyak LSP tidak izinkan). Video demonstrasi: MP4 max 50MB jika disyaratkan. Hindari format lama (DOC, XLS) — konversi ke PDF dulu.',
        tip: 'Nama file pakai format: NamaAnda_UK01_BuktiProyek.pdf — mudah dicari saat asesmen berlangsung.',
      },
      {
        title: 'Folder Digital Terstruktur',
        detail: 'Buat folder di Google Drive / OneDrive dengan struktur: 01_APL01 / 02_APL02 / 03_Ijazah_KTP / 04_Portofolio / 04a_UK01 / 04b_UK02 / … / 05_Sertifikat. Share link folder ke email Anda sendiri — akses mudah saat asesmen.',
        tip: 'Test buka semua file dari HP (jika komputer utama bermasalah) minimal H-1.',
      },
      {
        title: 'Resolusi & Keterbacaan',
        detail: 'Setiap halaman PDF harus terbaca jelas ketika di-zoom asesor. Test: buka file di komputer lain atau HP — apakah teks masih jelas? Scan dokumen fisik minimal 200 DPI. Foto lapangan pastikan tidak blur dan pencahayaan cukup.',
        warning: 'Dokumen yang tidak terbaca = bukti tidak valid. Asesor tidak wajib menunggu Anda kirim ulang.',
      },
      {
        title: 'Checklist Dokumen AJJ',
        detail: 'KTP (foto jelas kedua sisi) · Ijazah terakhir (scan halaman depan + belakang) · FR.APL.01 bertanda tangan digital atau scan basah · FR.APL.02 lengkap per UK · Portofolio PDF per UK · Sertifikat pelatihan · Surat Keterangan Kerja · Pas foto digital 3×4 (JPG) · Bukti bayar asesmen.',
      },
      {
        title: 'Link Berbagi Dokumen',
        detail: 'Siapkan satu link Google Drive/OneDrive yang bisa diakses siapapun (Anyone with link → Viewer). Kirimkan link ini ke asesor saat sesi dimulai. Alternatif: siapkan zip file terorganisir yang bisa dikirim via email/chat di awal sesi.',
        tip: 'Pastikan akses "Viewer" bukan "Editor" — jaga integritas dokumen Anda.',
      },
    ],
  },
  teknis: {
    intro: 'Setup teknis yang benar adalah kunci AJJ lancar. Test semua perangkat minimal H-2, bukan menit sebelum jadwal.',
    items: [
      {
        title: 'Spesifikasi Koneksi Internet',
        detail: 'Minimum yang disarankan: upload 5 Mbps, download 10 Mbps, latensi < 100ms. Test di fast.com atau speedtest.net. Jika WiFi tidak stabil, gunakan kabel LAN langsung ke router. Hindari hotspot HP kecuali tidak ada pilihan lain — kuota bisa habis di tengah sesi.',
        warning: 'Matikan update Windows/Mac otomatis saat asesmen — bisa menghabiskan bandwidth tiba-tiba.',
      },
      {
        title: 'Platform Video Conference',
        detail: 'LSP menggunakan: Zoom (paling umum), Google Meet, Microsoft Teams, atau Webex. Konfirmasi platform spesifik ke LSP H-3. Install versi terbaru — jangan andalkan browser version. Test masuk meeting dengan akun yang sama yang sudah terdaftar di LSP.',
        tip: 'Buat akun Zoom/Meet dengan nama asli Anda (sesuai KTP) — asesor verifikasi identitas lewat nama akun.',
      },
      {
        title: 'Kamera & Mikrofon',
        detail: 'Kamera: minimal 720p (1080p lebih baik). Test: pastikan wajah Anda terlihat jelas, tidak backlit. Mikrofon: hindari suara echo. Gunakan earphone dengan mic built-in jika ruangan tidak kondusif. Alternatif: HP sebagai kamera kedua (angle samping) untuk dokumen fisik jika diminta.',
        tip: 'Posisikan kamera setinggi mata — bukan dari bawah. Kesan profesional mempengaruhi interaksi dengan asesor.',
      },
      {
        title: 'Layar & Tampilan Dokumen',
        detail: 'Siapkan 2 monitor jika memungkinkan: satu untuk video call, satu untuk dokumen. Alternatif: gunakan split screen (video call 40% kiri, PDF viewer 60% kanan). Pastikan bisa share screen hanya window/tab tertentu — hindari share seluruh desktop yang mungkin menampilkan notifikasi pribadi.',
        tip: 'Test screen share H-1 bersama keluarga/teman — pastikan dokumen terlihat jelas dari sisi mereka.',
      },
      {
        title: 'Ruangan & Pencahayaan',
        detail: 'Ruangan tenang tanpa gangguan 4-8 jam. Pencahayaan dari depan (bukan belakang) — jendela di belakang Anda akan membuat wajah gelap. Latar belakang bersih/blur virtual jika perlu. Beri tahu anggota keluarga agar tidak masuk/berisik selama sesi.',
        warning: 'AJJ mensyaratkan hanya 1 orang di ruangan. Kehadiran orang lain bisa dibatalkan asesmennya.',
      },
      {
        title: 'Power & Baterai',
        detail: 'Colokkan laptop ke charger selama seluruh sesi — jangan andalkan baterai 4-8 jam. Siapkan UPS atau pastikan listrik stabil. Jika di daerah sering mati listrik, koordinasikan dengan LSP untuk prosedur darurat (HP sebagai backup).',
      },
    ],
  },
  hariH: {
    intro: 'Timeline AJJ berbeda dari asesmen tatap muka. Ini urutan yang perlu diikuti.',
    items: [
      {
        title: 'H-1: Dry Run Wajib',
        detail: 'Lakukan simulasi lengkap H-1: buka platform video conference → test kamera & mikrofon → test share screen → buka semua folder dokumen → pastikan link dokumen bisa diakses. Ini bukan opsional — dry run mengungkap masalah teknis yang tidak akan ketahuan tanpa dicoba.',
        tip: 'Simpan semua link meeting dan dokumen di sticky note fisik — siaga jika komputer crash.',
      },
      {
        title: 'T-60 Menit: Persiapan Final',
        detail: 'Restart komputer (bersihkan RAM) → update platform video call jika ada → tutup semua aplikasi tidak perlu (browser tabs, musik, game) → aktifkan Do Not Disturb → siapkan air minum dan snack → buka folder dokumen siap diakses → pastikan charger tersambung.',
      },
      {
        title: 'T-15 Menit: Masuk Room',
        detail: 'Masuk waiting room Zoom/Meet 15 menit sebelum jadwal. Asesor biasanya masuk 5-10 menit sebelum jadwal. Saat waiting: posisikan kamera, cek pencahayaan, siapkan KTP di tangan untuk verifikasi identitas pertama. Jangan terlambat — AJJ biasanya ada batas toleransi 10-15 menit.',
      },
      {
        title: 'Pembukaan: Verifikasi Identitas',
        detail: 'Asesor akan meminta: (1) Tunjukkan KTP ke kamera — dekatkan sampai nomor terbaca jelas, (2) Wajah Anda di samping KTP untuk foto screenshot, (3) Konfirmasi nama, jabatan yang diajukan, dan nomor peserta. Proses ini 5-10 menit — bersabar dan kooperatif.',
      },
      {
        title: 'Asesmen Portofolio: Share Screen',
        detail: 'Asesor meminta Anda share screen dan membuka dokumen. Buka file per-UK sesuai petunjuk asesor. Navigasi dengan tenang — scroll perlahan agar asesor bisa membaca. Jika dokumen tidak terlihat jelas, zoom in. Durasi per UK bervariasi 10-20 menit.',
      },
      {
        title: 'Wawancara & Penutupan',
        detail: 'Setelah portofolio, wawancara dilakukan via video — sama seperti tatap muka, gunakan metode STAR. Rekaman sesi (jika ada) dilakukan oleh asesor sesuai SOP LSP. Di akhir sesi, asesor menyampaikan hasil awal dan langkah selanjutnya. Tanyakan: kapan hasil resmi, bagaimana cara mendapatkan laporan asesmen.',
        tip: 'Minta konfirmasi email/WA dari asesor untuk follow-up hasil — jangan hanya menunggu tanpa konfirmasi kontak.',
      },
    ],
  },
  troubleshoot: {
    intro: 'Masalah teknis bisa terjadi kapan saja. Ini protokol yang harus Anda tahu sebelum hari H.',
    items: [
      {
        title: '🔴 Koneksi Putus Saat Asesmen',
        detail: 'Langkah: (1) Reconnect secepat mungkin — coba refresh atau buka ulang link meeting, (2) Jika gagal dalam 2 menit, hubungi asesor via nomor HP yang sudah dipersiapkan H-1, (3) Asesor berwenang melanjutkan atau menjadwalkan ulang sesuai SOP LSP, (4) Jangan panik — disconnection yang disebabkan masalah teknis bukan kesalahan asesi.',
        warning: 'Simpan nomor HP asesor dan admin LSP di HP Anda sebelum asesmen mulai — ini emergency contact.',
        tip: 'Siapkan HP dengan hotspot aktif sebagai backup koneksi darurat.',
      },
      {
        title: '🟡 Kamera/Mikrofon Tidak Berfungsi',
        detail: 'Cek: (1) Izin browser/app untuk akses kamera & mikrofon di settings, (2) Tutup semua aplikasi lain yang mungkin "mengunci" kamera (Skype, Teams, lain-lain), (3) Restart platform video call, (4) Jika tetap gagal: gunakan HP sebagai kamera via DroidCam atau EpocCam, atau ganti ke HP untuk keseluruhan sesi.',
      },
      {
        title: '🟡 Screen Share Tidak Terlihat Asesor',
        detail: 'Solusi: (1) Stop sharing → share ulang → pilih specific window (bukan entire screen), (2) Pastikan izin screen recording diaktifkan di System Preferences (Mac), (3) Coba share via browser version platform, (4) Alternatif darurat: kirim file langsung via chat fitur platform.',
      },
      {
        title: '🟡 Dokumen Tidak Bisa Dibuka',
        detail: 'Jika link Google Drive error: (1) Coba buka dari browser berbeda, (2) Download file dulu lalu open locally, (3) Kirim file via chat platform, (4) Buka dari HP. Lesson: selalu punya lebih dari satu cara akses dokumen (link cloud + file lokal + backup HP).',
      },
      {
        title: '🔴 Platform Crash / Komputer Hang',
        detail: 'Protokol: (1) Force quit semua aplikasi → restart komputer (2-3 menit), (2) Sambil tunggu: hubungi asesor via HP, (3) Reconnect via HP jika komputer terlalu lama, (4) Jika tidak bisa reconnect dalam 15 menit: hubungi admin LSP untuk prosedur rescheduling darurat.',
        tip: 'Install platform video call di HP sebagai backup — login dengan akun yang sama sebelum hari H.',
      },
      {
        title: '🟡 Suara Echo atau Berisik',
        detail: 'Solusi cepat: (1) Gunakan earphone/headset dengan mic built-in, (2) Matikan speaker laptop, (3) Minta anggota keluarga/rekan untuk diam, (4) Aktifkan noise cancellation jika platform mendukung (Zoom: Settings → Audio → Suppress background noise → High).',
      },
    ],
  },
  rules: {
    intro: 'AJJ memiliki aturan ketat untuk menjaga integritas asesmen. Melanggar aturan dapat menyebabkan pembatalan asesmen.',
    items: [
      {
        title: 'Hanya 1 Orang di Ruangan',
        detail: 'Selama sesi AJJ, hanya asesi yang boleh ada di ruangan. Asesor dapat meminta Anda memutar kamera untuk memverifikasi ruangan kosong. Anggota keluarga, rekan kerja, atau siapapun tidak boleh masuk atau berbicara. Suara dari luar (TV, radio) harus diminimalkan.',
        warning: 'Kehadiran orang lain yang terdeteksi asesor dapat menyebabkan sesi langsung dibatalkan.',
      },
      {
        title: 'Kamera Wajib Aktif Sepanjang Sesi',
        detail: 'Tidak diizinkan mematikan kamera selama asesmen berlangsung kecuali atas instruksi asesor. Jika kamera mati karena masalah teknis, segera informasikan asesor dan atasi secepat mungkin. Kamera mati lama tanpa penjelasan dapat dianggap pelanggaran prosedur.',
      },
      {
        title: 'Dilarang Membuka Materi Lain saat Wawancara',
        detail: 'Saat sesi wawancara (bukan portofolio), Anda tidak boleh membuka tab/window lain untuk mencari jawaban. Asesor berpengalaman dalam mendeteksi asesi yang sedang "membaca" — pausa terlalu lama, tatapan ke arah lain, atau jawaban yang dibaca. Persiapkan dengan belajar, bukan mencontek saat AJJ.',
        warning: 'Platform Zoom/Meet tidak selalu notifikasi saat screen share aktif — tapi asesor bisa minta screen share kapan saja.',
      },
      {
        title: 'Identitas Asli, Bukan Orang Lain',
        detail: 'Verifikasi identitas dengan KTP adalah wajib dan ketat. Mengirim orang lain untuk mengikuti AJJ atas nama Anda adalah pelanggaran serius — bisa menyebabkan pemblokiran dari sistem BNSP/LPJK. SKK yang diperoleh dengan cara tidak sah dapat dicabut kapan saja.',
      },
      {
        title: 'Perekaman oleh Asesor',
        detail: 'LSP berwenang merekam sesi AJJ untuk keperluan audit dan pengendalian mutu asesmen. Asesi memberikan persetujuan tersirat dengan mengikuti AJJ. Rekaman ini tidak dipublikasikan dan hanya untuk arsip internal LSP sesuai kebijakan perlindungan data.',
      },
      {
        title: 'Durasi Tepat Waktu',
        detail: 'Jadwal AJJ umumnya fixed — jika ada UK yang belum selesai saat waktu habis, asesor berwenang menentukan apakah dilanjutkan atau dijadwalkan ulang. Manajemen waktu selama sesi penting: jangan terlalu panjang di satu UK hingga UK berikutnya terbengkalai.',
        tip: 'Tanyakan di awal sesi: berapa total durasi dan ada berapa sesi (jika lebih dari 1 hari)?',
      },
    ],
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PanduanAJJPage() {
  const [activeSection, setActiveSection] = useState<Section>('persiapan');
  const [expanded, setExpanded] = useState<number | null>(null);

  const sec = sections.find(s => s.id === activeSection)!;
  const data = content[activeSection];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            📡 Panduan Resmi AJJ untuk Asesi
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Asesmen Jarak Jauh <span className="text-blue-400">(AJJ)</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Panduan teknis lengkap uji kompetensi SKK via video conference — setup, dokumen digital, protokol hari-H, troubleshooting, dan aturan yang wajib dipatuhi.
          </p>
        </div>

        {/* AJJ vs Other Methods Quick Comparison */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Hardcopy', desc: 'Dokumen fisik di TUK', icon: '📋', active: false },
            { label: 'Paperless', desc: 'Digital di TUK', icon: '💻', active: false },
            { label: 'AJJ', desc: 'Video call dari rumah/kantor', icon: '📡', active: true },
          ].map(m => (
            <div key={m.label} className={`rounded-xl p-3 text-center border ${m.active ? 'bg-blue-500/15 border-blue-500/40' : 'bg-slate-800/40 border-slate-700/40'}`}>
              <div className="text-2xl mb-1">{m.icon}</div>
              <p className={`text-sm font-semibold ${m.active ? 'text-blue-300' : 'text-slate-400'}`}>{m.label}</p>
              <p className="text-xs text-slate-500">{m.desc}</p>
              {m.active && <span className="inline-block mt-1 text-xs text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">Halaman ini</span>}
            </div>
          ))}
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiveSection(s.id); setExpanded(null); }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeSection === s.id
                  ? `${s.bg} ${s.color} ${s.border}`
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/40 hover:border-slate-600'
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Section intro */}
        <div className={`rounded-2xl p-4 border ${sec.bg} ${sec.border}`}>
          <p className="text-slate-300 text-sm leading-relaxed">{data.intro}</p>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {data.items.map((item, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all overflow-hidden ${
                expanded === i ? `${sec.bg} ${sec.border}` : 'bg-slate-800/40 border-slate-700/40'
              }`}
            >
              <button
                className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <span className={`text-lg flex-shrink-0 transition-transform ${expanded === i ? 'rotate-90' : ''}`}>▶</span>
                <span className={`text-sm font-semibold ${expanded === i ? sec.color : 'text-white'}`}>{item.title}</span>
              </button>

              {expanded === i && (
                <div className="px-5 pb-5 space-y-3">
                  <div className="h-px bg-slate-700/50" />
                  <p className="text-slate-300 text-sm leading-relaxed">{item.detail}</p>
                  {item.tip && (
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <span className="text-blue-400 flex-shrink-0">💡</span>
                      <p className="text-blue-300 text-xs leading-relaxed">{item.tip}</p>
                    </div>
                  )}
                  {item.warning && (
                    <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <span className="text-red-400 flex-shrink-0">⚠️</span>
                      <p className="text-red-300 text-xs leading-relaxed">{item.warning}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Emergency Contacts Box */}
        {activeSection === 'troubleshoot' && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🆘</span>
              <p className="text-red-400 font-semibold">Siapkan Kontak Darurat Sebelum Hari H</p>
            </div>
            <p className="text-slate-400 text-sm">Simpan di HP (bukan hanya di komputer):</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                { label: 'No. HP Asesor', note: 'Minta saat konfirmasi jadwal' },
                { label: 'No. Admin LSP', note: 'Untuk eskalasi darurat' },
                { label: 'Link Meeting', note: 'Copy ke catatan HP' },
                { label: 'Link Dokumen', note: 'Google Drive / backup link' },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-2 p-2.5 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500 text-xs">📌</span>
                  <div>
                    <p className="text-white font-medium text-xs">{c.label}</p>
                    <p className="text-slate-500 text-xs">{c.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom links */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Link href="/hari-h" className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-blue-500/40 transition-colors">
            <span className="text-2xl">📅</span>
            <div><p className="text-white text-sm font-medium">Panduan Hari-H (Semua Metode)</p><p className="text-slate-500 text-xs">Hardcopy, Paperless, dan AJJ side-by-side</p></div>
          </Link>
          <Link href="/tips-lolos" className="flex items-center gap-3 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-green-500/40 transition-colors">
            <span className="text-2xl">🏆</span>
            <div><p className="text-white text-sm font-medium">Tips Lolos Asesmen</p><p className="text-slate-500 text-xs">Strategi portofolio, wawancara & mental</p></div>
          </Link>
        </div>

      </div>
    </div>
  );
}
