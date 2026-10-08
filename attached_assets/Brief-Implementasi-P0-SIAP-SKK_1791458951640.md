# Brief Implementasi P0 — SIAP SKK

## Tujuan
Menutup temuan audit publik yang memengaruhi keandalan informasi regulasi, pemetaan jenjang, keberhasilan layanan AI, dan kredibilitas kredit PKB sebelum perluasan fitur. Ini brief untuk pengerjaan pada proyek Replit yang sudah ada, bukan bukti bahwa perbaikan telah diterapkan.

## Batas dan baseline
- Audit black-box publik menemukan delapan temuan. Fitur dalam akun, kode, data produksi, dan integrasi resmi belum diperiksa.
- Gunakan lampiran Permen PUPR 12/2021 dan SK DJBK 114/KPTS/Dk/2024 sebagai baseline; cek aturan perubahan dan skema LSP aktual sebelum menetapkan aturan produksi.
- Tidak boleh menganggap 157 modul, 65 soal atau 67 jabatan yang ditampilkan telah tervalidasi seluruhnya.
- Jangan membuat migrasi destruktif, menghapus data, mengubah nilai resmi, membuat akun produksi atau mengirim pengajuan ke lembaga eksternal tanpa persetujuan terpisah.

## Backlog P0

### P0-01 — Inventarisasi kode dan sumber aturan
**Masalah:** label jenjang dan regulasi tampak tidak konsisten lintas halaman.
**Pekerjaan:**
1. Temukan sumber data dan komponen untuk /knowledge-base, /sertifikasi, /matrix, /klinik-uji-kompetensi, /dokumen, /mock-asesmen, /bimtek serta fitur PKB.
2. Petakan mana data statis, data database, keluaran AI, state lokal dan sumber resmi.
3. Catat aturan duplikat, kode internal, referensi tanpa versi, serta dependensi API/model. Jangan menampilkan secret dalam laporan.
4. Hasilkan daftar berkas/tabel terkait dan rencana perubahan kecil yang mempertahankan data lama.
**Lulus bila:** ada peta sumber aturan dan daftar titik konsumsi; usulan perubahan tidak bergantung tebakan struktur kode.
**Dependensi:** tidak ada. Ini langkah pertama, bukan alasan membangun ulang aplikasi.

### P0-02 — Koreksi regulasi dan nomenklatur jenjang
**Masalah terkonfirmasi:**
- Knowledge Base menyebut SK DJBK 114/2024 sebagai pedoman AJJ.
- Permen PUPR 12/2021 ditampilkan sebagai standar/pedoman pengadaan.
- Permen PU 6/2025 diberi judul Standar Kompetensi Tenaga Kerja Konstruksi.
- Klinik memetakan Ahli Muda/Madya/Utama ke L5/L6/L7. Persiapan Dokumen juga memuat Muda L5 dan Madya L6.
**Pekerjaan:**
1. Koreksi judul dan telaah isi ringkasan, kutipan, referensi pada prompt AI, serta halaman turunannya.
2. Judul baseline yang benar:
   - Permen PUPR 12 Tahun 2021: Pelaksanaan Pengembangan Keprofesian Berkelanjutan.
   - SK DJBK 114/KPTS/Dk/2024: Penetapan Jabatan Kerja dan Jenjang Kualifikasi atas Jabatan Kerja di Bidang Jasa Konstruksi.
   - Permen PU 6 Tahun 2025: Standar Kegiatan Usaha dan/atau Standar Produk/Jasa, Pelaksanaan Pengawasan, dan Pengenaan Sanksi pada Penyelenggaraan Perizinan Berusaha Berbasis Risiko Sektor Pekerjaan Umum.
3. Untuk kualifikasi ahli yang menggunakan nomenklatur tersebut, Muda/Madya/Utama adalah jenjang 7/8/9. Jangan menetapkan semua Pelaksana Lapangan sebagai ahli; cocokkan jabatan/skema masing-masing.
4. Bedakan bidang/jabatan kerja, nama skema sertifikasi dan jenjang numerik. Kode internal tetap boleh digunakan, tetapi harus diberi label jelas dan tidak diklaim resmi tanpa bukti.
5. Susun satu master yang dipakai lintas halaman. Perubahan master tidak boleh diam-diam mengubah target/riwayat peserta lama; tandai records yang membutuhkan rekonsiliasi.
6. Simpan sumber, halaman/pasal, versi dan status validasi. Jika unit/KUK belum tersedia, jangan mengarang dari nama jabatan atau SK 114/2024 saja.
**Lulus bila:** tidak ada label Ahli Muda L5, Madya L6, atau Utama L7 pada konteks KKNI ahli; atribusi tiga regulasi benar; data yang belum tervalidasi ditandai, bukan dipaksakan menjadi benar.
**Dependensi:** P0-01.

### P0-03 — Pulihkan diagnostik dan mock AI
**Reproduksi:**
- Diagnostik: S1 Teknik Sipil; pengalaman 3–5 tahun; Konstruksi Gedung; target Ahli Teknik Bangunan Gedung jenjang 7 → “AI gagal melakukan analisis”, dua kali.
- Mock: pilih Teknik Bangunan Gedung Ahli Muda SKK-602 → “AI gagal menghasilkan soal”, dua kali.
**Pekerjaan:**
1. Telusuri request dari UI sampai server/provider dan validasi keluaran. Periksa konfigurasi/model, kuota, timeout, status upstream dan parsing, tanpa menganggap salah satu sebagai penyebab sebelum ada bukti.
2. Terapkan validasi input/output; request ID dan error code yang aman; log tanpa NIK, dokumen, isi password atau secret.
3. Tangani unavailable, rate limit, timeout dan keluaran tidak valid secara berbeda di internal; beri pesan pengguna yang jelas serta retry terkontrol.
4. Jangan menyajikan respons dummy/fallback generik seolah analisis AI berhasil.
5. Jika ada bank soal yang ditinjau dan sesuai skema, fallback dapat beralih secara eksplisit ke bank tersebut. Jika tidak ada, hentikan dengan pesan yang jujur.
6. Aturan persyaratan yang pasti dijalankan deterministik. Jawaban AI membantu penjelasan, bukan menggantikan keputusan resmi LSP atau penilai.
**Lulus bila:** kedua reproduksi menghasilkan keluaran valid; kegagalan provider teruji dan ditangani; keluaran soal menyertakan keterkaitan standar/unit yang dapat diverifikasi atau ditandai draft untuk review, bukan otomatis dipercaya.
**Dependensi:** P0-01 untuk diagnosis; P0-02 untuk akurasi keluaran.

### P0-04 — Pisahkan progres belajar dari kredit PKB
**Masalah:** katalog tamu menampilkan target umum 150 PKB; modul fondasi 4 jam menampilkan +10 PKB termasuk Info Sertifikasi tanpa dasar/status yang terlihat.
**Pekerjaan:**
1. Identifikasi asal angka dan cara angka tersebut disimpan/ditambahkan. Jangan langsung menghapus atau mengubah nilai historis.
2. Bedakan istilah dan status:
   - progres belajar/checklist;
   - poin belajar internal, bila memang gamifikasi;
   - estimasi SKPK;
   - penilaian mandiri;
   - nilai ditetapkan, dengan bukti pihak berwenang.
   Tidak semua label harus menjadi kolom baru: sesuaikan struktur yang sudah ada dan hindari duplikasi.
3. Nilai tetap per modul tidak boleh diklaim kredit resmi otomatis. Jika nilai itu hanya poin internal, relabel secara konsisten termasuk halaman detail dan agregasi.
4. Jangan menampilkan target universal 150. Untuk profil ahli yang tervalidasi, baseline Permen 12/2021 menetapkan minimum perpanjangan 100/150/200 SKPK bagi jenjang 7/8/9; untuk tamu tampilkan informasi per jenjang atau minta profil terlebih dahulu. Ini bukan kuota tahunan universal.
5. Jika kalkulator SKPK sudah ada, telaah kategori/subkegiatan, nilai dasar dan bobot yang relevan. Jangan menerapkan satu tabel bobot untuk semua subkegiatan atau menganggap tanda “-” berarti nol.
6. Validasi komposisi sebagai dimensi terpisah: utama ≥75%; penunjang ≤25%; pendidikan nonformal ≤25%; terverifikasi ≥60%; khusus ≥60%. Dimensi tersebut tumpang tindih, bukan kategori yang dijumlah menjadi 100%.
7. Nilai resmi tidak diberikan hanya karena admin aplikasi menekan “verifikasi”. Bedakan review internal, status kegiatan resmi dan penetapan nilai.
**Lulus bila:** klik selesai lesson tidak menaikkan nilai resmi; tamu tidak diberi kesan target 150 berlaku untuk semua; estimasi dapat dijelaskan; total cukup tetapi komposisi belum memenuhi tidak ditampilkan sebagai memenuhi persyaratan PKB. Pesan mengenai PKB tidak menyatakan seluruh persyaratan perpanjangan SKK otomatis selesai.
**Dependensi:** P0-01 dan P0-02; audit akun diperlukan untuk memastikan perilaku agregasi.

### P0-05 — Perjelas materi dan penyelesaian lesson
**Masalah:** klik Pengenalan Materi pada /bimtek/sipil-gedung-1 langsung mengubah progress 0/6 menjadi 1/6 tanpa membuka materi.
**Pekerjaan:**
1. Periksa apakah komponen memang checklist atau pembuka lesson yang salah implementasi.
2. Jika checklist, beri label “Checklist belajar mandiri” dan aksi “Tandai selesai”; jangan menyatakan tersedia isi lesson yang tidak ada.
3. Jika materi tersedia, judul membuka materi; aksi penyelesaian terpisah dan tidak menjadi bukti kompetensi resmi.
4. Jangan mengisi semua lesson dengan materi AI generik untuk sekadar menutup kekosongan. Materi harus dipetakan dan ditinjau sesuai unit/standar.
**Lulus bila:** perilaku dan label konsisten; pengguna dapat membedakan membaca materi dari mencentang checklist; progress tidak diklaim sebagai hasil asesmen atau kredit resmi.
**Dependensi:** P0-01 dan P0-04.

## Uji penerimaan minimal
| Uji | Hasil yang diharapkan |
| --- | --- |
| Kualifikasi ahli di Klinik, Dokumen dan halaman lain | Muda/Madya/Utama konsisten 7/8/9; jabatan lain mengikuti skema masing-masing |
| Tiga entri regulasi | Judul, isi ringkasan dan atribusi sesuai dokumen, bukan hanya judul diganti |
| Profil diagnostik pada reproduksi | Keluaran valid dan batas keputusan jelas |
| Mock Gedung pada reproduksi | Soal valid atau status draft transparan; bukan pesan gagal berulang tanpa diagnosis |
| Provider AI timeout/rate limit | Tidak ada keluaran dummy berlabel sukses; retry aman; error tersanitasi |
| Klik lesson contoh | Materi terbuka atau jelas checklist; tidak otomatis menghasilkan kredit resmi |
| PKB tamu dan ahli jenjang 7/8/9 | Tidak ada target generik yang menyesatkan; baseline target mengikuti jenjang dan versi aturan |
| Total PKB cukup, komposisi tidak memenuhi | Tidak diberi status memenuhi ketentuan PKB |
| Tidak ada bukti penetapan resmi | Nilai tidak berstatus ditetapkan resmi |
| Records lama setelah perubahan master | Tidak hilang atau berubah diam-diam; ada mekanisme review bila mapping berubah |

## Prompt siap pakai untuk Replit Agent

```text
Kerjakan perbaikan P0 pada aplikasi SIAP SKK yang sudah ada. Gunakan brief ini dan laporan audit sebagai daftar masalah; jangan menganggap struktur implementasi sudah diketahui.

TAHAP 1 — INSPEKSI, BELUM DEPLOY
1. Baca struktur proyek, package/scripts, routes, komponen, sumber data, model database, layanan AI dan pengujian yang relevan.
2. Petakan sumber label jenjang, judul regulasi, kredit PKB, progres lesson dan dua endpoint AI yang gagal.
3. Periksa baseline regulasi yang dilampirkan dan sumber resmi. Bedakan data tervalidasi dari asumsi. Jangan mengarang unit/KUK, syarat pendidikan, kode resmi atau nilai kredit.
4. Laporkan berkas/tabel terdampak, penyebab yang benar-benar ditemukan, risiko data lama dan rencana perubahan kecil. Jangan tampilkan secret.
5. Hentikan dan minta persetujuan bila perlu migrasi destruktif, perubahan nilai resmi/historis, akun/biaya baru, perubahan otorisasi atau pengiriman eksternal.

TAHAP 2 — PATCH DI LINGKUNGAN UJI
6. Setelah rencana disetujui, gunakan branch/checkpoint. Kerjakan P0-02 sampai P0-05, mempertahankan arsitektur dan data yang masih benar. Jangan membangun ulang seluruh aplikasi atau menambah chatbot baru.
7. Terapkan master nomenklatur/regulasi yang konsisten; benahi isi dan atribusi, bukan sekadar search-and-replace judul.
8. Pulihkan diagnostik dan mock berdasarkan bukti log; tangani timeout/rate limit/output invalid. Jangan menyamarkan fallback sebagai keberhasilan AI.
9. Pisahkan progres belajar, poin internal, estimasi/penilaian mandiri dan penetapan resmi. Jangan mengubah kredit lama tanpa persetujuan dan jejak review.
10. Perjelas perilaku lesson: pembuka materi atau checklist manual. Penyelesaian lesson bukan bukti kompetensi atau kredit PKB resmi otomatis.

TAHAP 3 — VERIFIKASI
11. Jalankan lint/typecheck/build/test yang benar-benar tersedia. Tambahkan tes terarah untuk bug yang diperbaiki, bukan hanya tes snapshot.
12. Ulangi reproduksi diagnostik, mock Gedung dan lesson contoh. Uji juga kegagalan AI, label jenjang lintas halaman dan status PKB.
13. Serahkan daftar perubahan, hasil tes beserta bukti, masalah yang belum ditutup, dampak records lama dan cara rollback.
14. Jangan klaim semua modul/jabatan sudah benar, aplikasi patuh penuh, integrasi LPJK tersedia, atau produksi siap bila belum diverifikasi. Jangan deploy produksi tanpa persetujuan.
```

## Handoff dan urutan
1. Jalankan tahap inspeksi proyek dahulu.
2. Tinjau hasil inspeksi dan risiko perubahan data.
3. Patch fondasi regulasi/jenjang, kredibilitas PKB, AI dan lesson di lingkungan uji.
4. Audit ulang berdasarkan uji penerimaan, kemudian lanjut backlog P1/P2 dan audit peran/keamanan.

Estimasi waktu dan biaya baru dibuat setelah inspeksi proyek. Brief ini tidak membuktikan perbaikan telah diimplementasikan.

## Sumber
- https://bimtek.replit.app/knowledge-base
- https://bimtek.replit.app/klinik-uji-kompetensi
- https://bimtek.replit.app/dokumen
- https://bimtek.replit.app/sertifikasi
- https://bimtek.replit.app/diagnostik-kompetensi
- https://bimtek.replit.app/mock-asesmen
- https://bimtek.replit.app/bimtek
- https://bimtek.replit.app/bimtek/sipil-gedung-1
- Permen PUPR 12/2021 dan SK DJBK 114/KPTS/Dk/2024: lampiran pengguna.
- Judul resmi Permen PU 6/2025: https://binakonstruksi.pu.go.id/pengumuman/peraturan-menteri-pekerjaan-umum-republik-indonesia-nomor-6-tahun-2025/
