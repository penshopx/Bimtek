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


---

# Addendum — Audit publik diperluas dan prioritas perbaikan awal

**Tidak ada perubahan kode atau data aplikasi.** Audit akun tetap belum selesai karena akses browser/prompt login tidak dapat dipertahankan. Addendum ini memakai ekstraksi teks halaman publik; bukan pengujian interaksi ulang seluruh halaman tambahan. Rekomendasi berikut bersifat sementara berdasarkan bukti yang sudah ada.

## Pemeriksaan tambahan
| Halaman | Observasi | Batas kesimpulan |
| --- | --- | --- |
| /dokumen | Menampilkan Ahli Muda (L5) pada beberapa Pelaksana Lapangan dan Ahli Madya (L6) pada Ahli Teknik Jalan | Memperluas ISSUE-005: kekeliruan label ahli bukan hanya pada Klinik. Tidak menetapkan jenjang benar setiap Pelaksana tanpa mencocokkan nama skema spesifik. |
| /matrix | Menampilkan kategori B–H, termasuk H–Benda, serta hubungan sejumlah jabatan dengan huruf kategori | Pada teks awal belum jelas mana taksonomi/kode internal dan mana klasifikasi resmi. Isi tab Unit Kompetensi belum diuji; tidak dianggap tidak ada. |
| /offline | Menampilkan “Tidak ada event ditemukan” dan anjuran mengubah filter atau membuat event | Tidak membuktikan fungsi event rusak atau seluruh database event kosong. Alur publik belum memperlihatkan kegiatan yang dapat diikuti saat pemeriksaan. |
| /panduan-ajj | Memisahkan hardcopy, paperless, AJJ; menyarankan persiapan H-3 | Pembedaan format membantu. Panel detail tertutup belum ditinjau; H-3 perlu dilabeli sebagai rekomendasi persiapan, bukan otomatis kewajiban regulasi. |

Sumber observasi: https://bimtek.replit.app/dokumen ; https://bimtek.replit.app/matrix ; https://bimtek.replit.app/offline ; https://bimtek.replit.app/panduan-ajj . Ekstraksi halaman belum menggantikan audit sumber regulasi masing-masing klaim.

## Keputusan produk sementara
Prioritas terdekat bukan menambah chatbot, modul, atau menu. Prioritasnya adalah memastikan nomenklatur/regulasi dapat dipercaya, dua alur AI utama berfungsi, dan progres belajar tidak tercampur dengan kredit PKB resmi. Keluasan katalog bukan bukti mutu atau kepatuhan.

## P0 — Benahi fondasi sebelum memperluas penggunaan
### 1. Satu master jabatan dan regulasi
- Rekonsiliasi nama bidang/jabatan kerja, nama skema sertifikasi, jenjang numerik, klasifikasi/subklasifikasi, standar dan jalur persyaratan dengan dokumen resmi serta skema LSP yang berlaku.
- Bedakan kode internal seperti B002/SKK-602 dari kode resmi; jangan memberi kesan kode tersebut berasal dari regulasi tanpa sumber.
- Terapkan master yang sama pada Klinik, Dokumen, Sertifikasi, Matrix, Mock, Coach dan profil peserta; jangan biarkan setiap halaman menyimpan label jenjang sendiri.
- Simpan versi, tanggal berlaku, status perubahan, sumber dan halaman/pasal per aturan. Periksa pembaruan setelah dokumen baseline sebelum mempublikasikan klaim terkini.
- Perbaiki atribusi Permen PUPR 12/2021, SK DJBK 114/2024 dan Permen PU 6/2025; telaah ulang isi ringkasannya, bukan hanya mengganti judul.
**Kriteria lulus:** Muda/Madya/Utama konsisten 7/8/9 pada fungsi yang memang mengacu kualifikasi ahli; nama skema serta syarat dapat ditelusuri ke sumber. Jalur lulusan baru tidak disamakan secara otomatis dengan jalur biasa.

### 2. Pulihkan layanan diagnostik dan mock
- Periksa log permintaan, layanan/model AI, kredensial server, kuota, timeout, validasi keluaran serta error upstream. Ini daftar pemeriksaan, bukan diagnosis penyebab yang sudah dibuktikan.
- Beri pesan kesalahan yang membedakan kendala layanan dari hasil tidak memenuhi persyaratan; sediakan jalur mencoba lagi yang aman.
- Gunakan aturan deterministik untuk keputusan yang punya dasar pasti; AI menjelaskan/rekomendasikan, bukan menetapkan kelayakan atau kredit resmi secara bebas.
**Kriteria lulus:** profil uji yang direkam menghasilkan keluaran valid; mock Gedung menghasilkan soal yang dapat ditelusuri ke standar/unit yang sesuai; kasus layanan gagal memberi pesan yang dapat ditindaklanjuti. Tidak menganggap sukses satu domain sebagai lulus semua domain.

### 3. Pisahkan progres belajar dan SKPK
- “Selesai lesson” adalah progres belajar/checklist, bukan otomatis memperoleh kredit resmi.
- Jika angka modul masih reward internal, beri label poin belajar. Jika estimasi SKPK, tampilkan kategori, nilai dasar, bobot, peran/durasi, relevansi subklasifikasi peserta dan asumsi.
- Pisahkan estimasi, penilaian mandiri, dan nilai yang ditetapkan pihak berwenang. Status terverifikasi tidak lahir hanya karena admin aplikasi memberi centang.
**Kriteria lulus:** modul 4 jam tidak diberi kesan otomatis +10 SKPK resmi tanpa dasar kegiatan dan penetapan yang dapat ditelusuri.

## P1 — Rapikan dua perjalanan peserta
### Jalur persiapan uji kompetensi
Profil → target jabatan/skema/jenjang → cek persyaratan dan diagnostik → unit kompetensi dan kebutuhan bukti → materi/latihan → simulasi → ringkasan kesiapan.
- Halaman lesson membuka materi; jika hanya checklist manual, labeli secara eksplisit.
- Petakan materi dan soal ke unit, elemen/KUK bila tersedia dalam standar, sumber dan versi. SK 114/2024 sendiri tidak menyediakan semua unit/KUK atau bank soal.
- Hasil latihan bukan putusan kompeten resmi; kecukupan bukti dan keputusan akhir tetap mengikuti skema/LSP/asesor.

### Jalur peserta PKB
Profil SKK → jenjang/subklasifikasi dan periode relevan → pilih/catat kegiatan → unggah bukti → estimasi/penilaian mandiri → riwayat penilaian/penetapan → ringkasan komposisi dan kelengkapan.
- Baseline Permen 12/2021: ahli jenjang 7/8/9 memerlukan 100/150/200 SKPK untuk persyaratan perpanjangan. Jangan ditampilkan sebagai target tahunan universal atau kewajiban otomatis untuk semua operator/teknisi.
- Uji empat komposisi secara terpisah: utama ≥75%/penunjang ≤25%; pendidikan nonformal ≤25%; terverifikasi ≥60%; khusus ≥60%. Dimensi saling tumpang tindih, bukan empat kotak yang dijumlah menjadi 100%.
- Setiap kegiatan memiliki data tanggal/durasi/peran/bukti, kategori dan riwayat status; koreksi nilai tidak menghapus jejak penilaian.
**Kriteria lulus:** profil beda jenjang menunjukkan target yang sesuai; total tercapai tetapi komposisi tidak memenuhi tidak ditampilkan sebagai “siap perpanjangan”; angka dan status dapat ditelusuri ke kegiatan serta bukti.

## P2 — Verifikasi dan lengkapi operasi penyelenggara PKB
Tahap ini bergantung pemeriksaan fitur yang sudah ada di dalam akun; jangan membangun duplikasi sebelum inventarisasi.
- Pisahkan peserta, penyelenggara, reviewer internal dan pihak penilai resmi; keberadaan peran aplikasi bukan bukti kewenangan regulasi.
- Inventarisasi registrasi penyelenggara, pengajuan kegiatan, pelaksanaan, bukti kehadiran, laporan dan hasil penilaian.
- Berdasarkan baseline, pengajuan kegiatan paling lambat 4 hari kerja sebelum pelaksanaan; laporan paling lambat 14 hari setelah kegiatan berakhir. Bedakan hari kerja dengan hari kalender dan catat status/sumber tenggat.
- Alur internal menyiapkan berkas/ekspor; jangan mengklaim tersambung SIJK/LPJK hanya karena ada tombol kirim. Integrasi harus dibuktikan dari otorisasi, pengiriman, penerimaan dan hasil resmi.
**Kriteria lulus:** satu kegiatan dapat ditelusuri end-to-end sampai hasil dan kredit peserta, dengan bukti, jejak status, serta penanganan laporan terlambat yang sesuai aturan berlaku.

## P3 — Audit teknis sebelum produksi operasional
Perlu akses kode/lingkungan uji dan akun berbagai peran: isolasi data, kontrol akses dokumen, unggah file, penyimpanan NIK/SKK, masa simpan dan penghapusan, backup/restore, audit log, secret management, biaya/rate-limit AI, dan validasi keluaran. Jangan mengubah sistem produksi atau menggunakan data pribadi nyata untuk pengujian.
**Kriteria lulus:** akun A tidak dapat membaca dokumen akun B; akses admin sesuai peran; secret tidak terekspos; backup dipulihkan dalam uji; keputusan aturan dapat diulang tanpa bergantung variasi jawaban AI.

## Urutan pelaksanaan yang disarankan
1. Validasi dan koreksi fondasi regulasi/jenjang, kredibilitas nilai PKB, serta pemulihan AI.
2. Uji ulang bukti ISSUE-001 s.d. ISSUE-008; catat yang benar-benar tertutup.
3. Audit akun peserta/penyelenggara dan inventarisasi fitur existing.
4. Baru finalisasi backlog pengembangan serta estimasi pekerjaan berdasarkan kode dan data aktual.

Tidak diberikan estimasi hari/biaya karena implementasi, tim dan dependensi belum diperiksa. Lampiran screenshot/video menggunakan paket bukti Audit Tahap 1 yang telah diserahkan sebelumnya.
