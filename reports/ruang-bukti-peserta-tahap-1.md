# Ruang Bukti Peserta — handoff pengembangan

## Status

Kode tahap pertama diterapkan di lingkungan pengembangan. Belum dipublikasikan. Fitur belum dinyatakan selesai operasional karena App Storage nyata belum memiliki bucket yang dapat digunakan.

Tidak ada integrasi Gustafta, pengiriman dokumen ke AI, perubahan keputusan kompetensi, atau pemberian kredit PKB.

## Implementasi

- Halaman desktop `/ruang-bukti` dan tautan navigasi.
- Daftar bukti milik akun, pencarian nama/metadata, filter kategori.
- Form unggah dan edit metadata: kategori, konteks penggunaan, periode, catatan.
- Unduh melalui endpoint autentikasi; tidak ada URL berkas publik atau token sesi di URL.
- Penghapusan dengan konfirmasi.
- Pembatasan PDF, PNG, JPEG, TXT UTF-8; maksimal 10 MB per berkas. Server memeriksa isi/signature dan membatasi body permintaan.
- Kepemilikan, keberadaan akun, dan masa berlaku sesi diperiksa server. Tidak menerima identitas tamu/browser sebagai pemilik.
- Status penyimpanan terpisah dari keabsahan, kelayakan, kompetensi, dan kredit resmi.
- Berkas diarahkan ke App Storage privat; SQLite hanya menyimpan metadata dan object key.
- Konteks persiapan SKK/portofolio/PKB berupa metadata. Belum ada pemetaan unit atau otomatisasi checklist/APL.02/PKB.

## Berkas yang diubah

- `src/app/ruang-bukti/page.tsx`
- `src/components/Navbar.tsx`
- `src/lib/evidence.ts` dan `src/lib/evidence.test.ts`
- `src/server/evidenceAccess.ts`
- `src/server/evidenceStorage.ts`
- `src/server/evidence.integration.test.ts`
- `src/app/api/ruang-bukti/route.ts`
- `src/app/api/ruang-bukti/[id]/route.ts`
- `src/db/schema.ts`
- `src/db/migrations/0017_serious_rhodey.sql`
- snapshot dan journal migrasi Drizzle
- `package.json` dan `bun.lock` untuk SDK App Storage

## Migrasi

Hanya menambah tabel `participant_evidence` dan indeks pemilik. SQL diperiksa sebelum dijalankan; tidak ada penghapusan atau perubahan tabel lama. Urutan journal telah diperiksa dan tabel/indeks telah dikonfirmasi di database pengembangan.

## Pengujian otomatis

- `bun test src/lib/evidence.test.ts`: 4 lulus.
- `bun test src/server/evidence.integration.test.ts`: 4 lulus.
- Integrasi memakai database in-memory dan penyimpanan fixture khusus pengujian, bukan bukti keberhasilan App Storage nyata.
- Skenario: tamu, sesi kedaluwarsa, identitas palsu, unggah, persistensi metadata, unduh, edit, isolasi baca/edit/hapus, penghapusan, kegagalan storage, unggah gagal, tipe berkas palsu, dan permintaan lintas situs.
- `bun run typecheck`: lulus.
- ESLint pada semua berkas fitur baru: lulus.
- `bun run build`: lulus.
- Workflow aplikasi setelah restart: berjalan.

## Pemeriksaan browser desktop

Lulus pada alur yang tersedia: halaman tamu, pendaftaran/login akun sintetis, halaman Ruang Bukti setelah login, pesan storage tidak tersedia, tombol unggah dinonaktifkan, daftar kosong, reload, tautan navigasi, dan logout. API tanpa sesi mengembalikan 401.

Tangkapan layar halaman setelah login diperiksa. Pengujian tidak menyatakan unggah nyata berhasil; alur itu masih terblokir bucket. Browser mencatat satu respons resource 403 saat fallback storage tampil; ini tidak menghalangi pemeriksaan halaman.

## Batas dan dependensi

- Bucket App Storage belum tersedia. UI menampilkan pembatasan dan menonaktifkan unggah/unduh; API gagal secara eksplisit, tidak memberi sukses semu.
- Belum diuji unggah/unduh/hapus dengan App Storage nyata atau persistensi lintas publikasi.
- Tidak ada OCR, ekstraksi AI, versi konten berkas, pemetaan unit, atau portofolio otomatis pada tahap ini.
- Download menggunakan attachment untuk membatasi konten aktif; belum ada preview PDF inline.
- Pemeriksaan format bukan pemindaian malware atau validasi keabsahan dokumen.
- Autentikasi existing tidak direfaktor; audit keamanan autentikasi menyeluruh masih diperlukan sebelum rilis untuk dokumen sensitif.
- Tahap 2–6 belum dikerjakan dalam perubahan ini; mobile ditunda.

## Pemulihan

Jika perubahan perlu dibatalkan, gunakan checkpoint sebelum implementasi. Jangan menghapus tabel atau objek penyimpanan secara manual setelah ada data nyata.

Migrasi bersifat aditif: versi kode sebelumnya dapat dijalankan dengan membiarkan tabel baru tetap ada. Setelah penyimpanan diaktifkan, backup/restore harus mencakup SQLite, metadata, serta objek App Storage. Restore nyata belum diuji.

## Langkah berikutnya

Minta persetujuan penggunaan App Storage yang ditagih berdasarkan pemakaian; konfigurasi bucket, kemudian uji alur nyata sebelum melanjutkan analisis dokumen.
