# Audit Tahap 1 — SIAP SKK / bimtek.replit.app

**Status: audit akses publik selesai; audit fitur akun dan teknis belum selesai.**

## Kesimpulan sementara
Platform sudah memiliki banyak pintu masuk pembelajaran dan pendampingan SKK. Namun belum layak diasumsikan sebagai rujukan regulasi atau pencatatan kredit PKB resmi: ditemukan salah atribusi regulasi, salah pemetaan jenjang ahli pada formulir inti, serta dua alur AI yang gagal pada uji publik. Aplikasi belum diaudit sebagai penyelenggara PKB operasional end-to-end.

## Ringkasan temuan
| ID | Prioritas | Area | Temuan |
| --- | --- | --- | --- |
| 001 | Tinggi | Diagnostik | Analisis AI gagal dua kali untuk profil uji yang sama |
| 002 | Tinggi | PKB | Target 150 ditampilkan tanpa konteks jenjang pada katalog tamu |
| 003 | Tinggi | PKB | Kredit tetap modul tanpa dasar, bobot, dan status resmi yang terlihat |
| 004 | Sedang | Pembelajaran | Klik judul pelajaran langsung menandai selesai tanpa membuka materi |
| 005 | Tinggi | Kualifikasi | Klinik memetakan Muda/Madya/Utama ke L5/L6/L7 |
| 006 | Tinggi | Katalog jabatan | Nama skema, jenjang, acuan dan jalur persyaratan belum ditelusuri |
| 007 | Tinggi | Regulasi | Tiga regulasi diberi judul/atribusi isi yang tidak tepat |
| 008 | Tinggi | Mock asesmen | Pembentukan soal AI gagal dua kali pada domain Gedung |

Total delapan temuan utama: tujuh tinggi, satu sedang. Tinggi = berisiko mengarahkan peserta secara keliru atau membuat fitur utama tidak berfungsi; bukan bukti seluruh aplikasi gagal. Tidak ada temuan eksploitasi keamanan atau kehilangan data yang dikonfirmasi.

## Cakupan dan metode
Audit black-box melalui browser pada akses tamu: beranda, SKK Hub, diagnostik, katalog BIMTEK, satu modul contoh Teknik Fondasi Gedung, katalog/detail satu jabatan, quiz soal pertama, formulir klinik, knowledge base, mock asesmen domain Gedung, dan akses tracker PKB. Memeriksa desktop serta screenshot beranda pada viewport 390 × 844. Menggunakan profil sintetis S1 Teknik Sipil, pengalaman 3–5 tahun di Konstruksi Gedung; tidak memakai identitas pribadi, tidak membuat akun, tidak mengubah kode.

Pengujian perilaku gagal diulang; bukti screenshot/video tersedia. Temuan konten diverifikasi terhadap lampiran pengguna dan satu sumber resmi tambahan. Pemeriksaan belum mencakup seluruh 157 modul, 65 soal, 67 jabatan, semua domain AI atau semua peran.

## Yang sudah terlihat berfungsi
- Halaman dan navigasi utama dapat dibuka; pintu masuk mengurus SKK, persiapan, dan perpanjangan tersedia.
- Form diagnostik tiga tahap menerima profil dan menjalankan proses analisis, tetapi proses itu gagal menghasilkan hasil pada pengujian ini.
- Modul contoh dan detail persyaratan jabatan dapat dibuka.
- Quiz contoh menerima pilihan jawaban lalu menyediakan tombol soal berikutnya. Mutu soal, pembahasan dan hasil akhir belum dinilai.
- Beranda menyesuaikan tata letak pada lebar ponsel; ini bukan verifikasi responsivitas seluruh aplikasi.
- /pkb mengarahkan pengunjung tanpa akun ke /login. Ini batas akses yang wajar, bukan bukti tracker tidak ada.
- Mock asesmen menyatakan soal AI bukan soal resmi BNSP; disclaimer ini membantu, meskipun pembentukan soal gagal.

## Batas audit
Belum diperiksa: dashboard pengguna, pencatatan kegiatan PKB, unggah bukti, validasi/penilaian, komposisi kredit, tenggat, laporan penyelenggara, ekspor, persistensi lintas perangkat, admin, LSP/asesor, otorisasi peran, isolasi data, penyimpanan dokumen, API, basis data, deployment, dan kode. Tidak dilakukan penetration testing. Tidak dapat menyatakan integrasi LPJK/LSP tersedia atau tidak tersedia hanya dari akses publik.

Regulasi lampiran digunakan sebagai baseline, bukan penegasan bahwa semua ketentuannya belum berubah hingga hari audit. Rekomendasi final perlu pemeriksaan aturan perubahan yang berlaku dan skema LSP aktual.

## Temuan terperinci

### ISSUE-001 — Diagnostik AI gagal untuk profil valid (tinggi)
Reproduksi terkonfirmasi dua kali pada akses publik.
1. S1 Teknik Sipil (screenshots/diag-step1.png).
2. Pengalaman 3–5 tahun, Konstruksi Gedung (screenshots/diag-step2.png).
3. Target Ahli Teknik Bangunan Gedung jenjang 7 (screenshots/diag-step3.png).
4. Klik Analisis Kompetensi: “AI gagal melakukan analisis” (screenshots/diag-result.png).
Video: videos/diagnostik-full-repro.webm. Akar masalah backend belum diketahui. Jangan menganggap hasil tidak memenuhi kelayakan; yang gagal adalah layanan analisis.
### ISSUE-002 — Target PKB generik tanpa penjelasan jenjang (tinggi, konten regulasi)
Pada /bimtek akses tamu ditampilkan Target: 150 PKB Points. Tidak terlihat pemilihan jenjang/kualifikasi atau penjelasan bahwa ini target pribadi, bukan target universal. Pasal 21 Permen PUPR 12/2021 menetapkan 100/150/200 SKPK bagi ahli jenjang 7/8/9. Bukti: screenshots/bimtek.png; teks bimtek.txt. Tidak disimpulkan bahwa tracker /pkb juga menggunakan angka ini, karena memerlukan login.
### ISSUE-003 — Klaim kredit tetap per modul belum dapat ditelusuri (tinggi, konten regulasi)
Modul Teknik Fondasi Gedung menampilkan 4 jam dan +10 PKB, termasuk pada Info Sertifikasi. Pada layar ini tidak tampak status verifikasi kegiatan, nomor kegiatan, bukti, kategori/subkegiatan, dasar atau bobot per peserta, dan status estimasi versus penetapan. Pasal 24 menentukan nilai dasar × bobot yang relevan. Ini temuan ketidakjelasan/provenance, bukan bukti bahwa setiap angka salah. Bukti: screenshots/module-fondasi.png.
### ISSUE-004 — Klik judul pelajaran langsung menandai selesai (sedang)
Terulang setelah reload. Pada modul contoh, klik “Pengenalan Materi” hanya mengubah ○ menjadi ✓ serta progress 0/6 menjadi 1/6. Tidak membuka materi pelajaran pada layar/URL tersebut. Ini dapat digunakan sebagai checklist manual, tetapi label Materi Pembelajaran tidak menjelaskan perilakunya dan checklist bukan bukti belajar/kompetensi/PKB. 
1. Buka /bimtek/sipil-gedung-1 (screenshots/lesson-step1.png).
2. Klik Pengenalan Materi (screenshots/lesson-step2.png).
Video: videos/lesson-toggle-repro.webm. Cakupan hanya satu modul contoh, tidak diasumsikan seluruh modul identik.
### ISSUE-005 — Klinik menampilkan pemetaan jenjang ahli yang keliru (tinggi)
/klinik-uji-kompetensi menampilkan Ahli Pertama (L4), Ahli Muda (L5), Ahli Madya (L6), Ahli Utama (L7). Ahli Muda/Madya/Utama dalam Permen PUPR 12/2021 Pasal 21 adalah jenjang 7/8/9, bukan 5/6/7. Ini input inti yang berpotensi mengarahkan blueprint/soal/target PKB ke tingkat salah. Bukti static: screenshots/klinik-levels.png; klinik.txt. Hasil blueprint belum diuji.
### ISSUE-006 — Detail jabatan dan level katalog tidak cukup ditelusuri (tinggi)
/sertifikasi menyebut berdasarkan KM 713/2022, memakai kode internal B002 dan level generik Ahli; detail Ahli Teknik Bangunan Gedung memberi syarat S1 Teknik Sipil/Arsitektur, pengalaman 3 tahun, SKK Level 6 tanpa penjelasan status sebagai prasyarat jalur tertentu. Perlu rekonsiliasi dengan nama skema, jenjang numerik, acuan standar, pendidikan dan jalur pada SK 114/2024. Tidak disimpulkan bahwa “SKK Level 6” merupakan level sertifikat hasil; saat ini tertulis sebagai persyaratan. Bukti screenshots/jabatan-gedung.png.
### ISSUE-007 — Basis pengetahuan salah mengidentifikasi tiga regulasi (tinggi)
Terlihat pada /knowledge-base:
- Permen PU 6/2025 dilabeli Standar Kompetensi Tenaga Kerja Konstruksi. Judul resmi adalah Standar Kegiatan Usaha dan/atau Standar Produk/Jasa, Pelaksanaan Pengawasan, dan Pengenaan Sanksi pada Penyelenggaraan Perizinan Berusaha Berbasis Risiko Sektor Pekerjaan Umum.
- SK DJBK 114/2024 dilabeli Pedoman AJJ; paragrafnya mengatribusikan persyaratan video call, identitas, keamanan dan prosedur AJJ pada SK itu. Dokumen lampiran pengguna berjudul Penetapan Jabatan Kerja dan Jenjang Kualifikasi atas Jabatan Kerja di Bidang Jasa Konstruksi, bukan pedoman AJJ.
- Permen 12/2021 dilabeli Standar & Pedoman Pengadaan Jasa Konstruksi; dokumen pengguna adalah Permen PUPR 12/2021 tentang Pelaksanaan PKB.
Bukti static: screenshots/knowledge-wrong-titles.png. Bukti paragraf: screenshots/knowledge-ajj.png, knowledge-ajj.txt. Ini bukan sekadar typo; atribusi isi/sumber juga salah. Tidak dibuktikan bahwa AI menggunakan database yang sama, tetapi risiko kontaminasi sumber perlu diperiksa.
Rujukan resmi: https://binakonstruksi.pu.go.id/pengumuman/peraturan-menteri-pekerjaan-umum-republik-indonesia-nomor-6-tahun-2025/ ; dokumen lampiran pengguna untuk Permen 12/2021 dan SK 114/2024.
### ISSUE-008 — Mock asesmen AI gagal menghasilkan soal (tinggi)
Kegagalan terkonfirmasi dua kali pada pilihan Teknik Bangunan Gedung Ahli Muda SKK-602.
1. Buka /mock-asesmen (screenshots/mock-step1.png).
2. Pilih Teknik Bangunan Gedung; layar menyiapkan soal (screenshots/mock-step2.png).
3. Muncul “AI gagal menghasilkan soal — Pastikan AI tersedia dan coba lagi” (screenshots/mock-step3.png).
Video: videos/mock-repro.webm. Tidak diuji seluruh domain. Tidak diketahui apakah berbagi akar masalah dengan diagnostik; tidak boleh diasumsikan.

## Observasi tambahan, bukan temuan utama
- Pemeriksaan otomatis axe pada knowledge base memberi temuan color-contrast dan heading-order. Penilaian kontras sejumlah elemen lain tidak tuntas karena latar gradasi. Ini perlu pemeriksaan manual sebelum dinyatakan memenuhi/tidak memenuhi WCAG.
- Beranda memuat angka “73% Asesi gagal karena dokumen tidak lengkap” dan “65% Asesi merasa kurang siap”. Dalam teks halaman yang diperiksa tidak tampak sumber studi untuk statistik tersebut. Validitas angka belum diverifikasi; jangan memperlakukannya sebagai hasil audit.
- PKB tidak menjadi jalur utama yang setara pada beranda; terdapat menu Tracker PKB di Menu Lainnya. Ini observasi posisi produk, bukan bukti ketiadaan fitur operasional di dalam akun.

## Acuan pembanding
1. Lampiran pengguna: Permen PUPR 12 Tahun 2021, tentang Pelaksanaan Pengembangan Keprofesian Berkelanjutan. Pasal 20: cakupan ahli dan komposisi; Pasal 21: 100/150/200 SKPK untuk jenjang 7/8/9; Pasal 22–24: penilai, penetapan dan perhitungan; Lampiran I: nilai dasar dan bobot per subkegiatan.
2. Lampiran pengguna: SK DJBK 114/KPTS/Dk/2024, tentang Penetapan Jabatan Kerja dan Jenjang Kualifikasi atas Jabatan Kerja di Bidang Jasa Konstruksi. Halaman PDF 10 / lampiran halaman 4: Ahli Muda/Madya/Utama Teknik Bangunan Gedung jenjang 7/8/9 dan acuan SKKNI 192-2016, 255-2019, 106-2015. Dokumen membedakan bidang/jabatan dengan nama skema; bukan bank soal atau pedoman AJJ.
3. Sumber resmi judul Permen PU 6/2025: https://binakonstruksi.pu.go.id/pengumuman/peraturan-menteri-pekerjaan-umum-republik-indonesia-nomor-6-tahun-2025/
4. Sumber observasi aplikasi: https://bimtek.replit.app/ serta rute yang disebut pada tiap temuan.

## Audit lanjutan sebelum rekomendasi pengembangan
Diperlukan akun uji minimal peran peserta; akun penyelenggara/admin bila fitur itu tersedia. Uji perjalanan peserta dan penyelenggara secara terpisah. Verifikasi apakah belajar internal berbeda dari kredit estimasi dan kredit ditetapkan; apakah target serta komposisi bergantung jenjang/subklasifikasi; dan apakah setiap aktivitas memiliki bukti serta riwayat penilaian. Pemeriksaan implementasi membutuhkan akses proyek/kode terpisah, tidak tersirat dari akses akun aplikasi.

Belum ada perubahan aplikasi yang dilakukan dan belum dibuat blueprint pengembangan. Laporan ini menjadi dasar audit lanjutan, bukan sertifikasi kepatuhan aplikasi.
