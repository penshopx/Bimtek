# Audit desktop dan katalog jabatan SIAP SKK

## Ruang lingkup

Audit ini membandingkan laporan audit yang diunggah dengan source code proyek dan lampiran SK DJBK Nomor 114/KPTS/Dk/2024 tanggal 4 Desember 2024. Fokus: konten publik, rujukan regulasi, serta katalog tenaga kerja konstruksi. Ini bukan audit keamanan menyeluruh, bukan pengujian ulang seluruh fitur akun, dan bukan verifikasi aplikasi produksi setelah publikasi.

Perbaikan berada di proyek pengembangan. Belum dilakukan publikasi ulang. Pekerjaan mobile ditunda.

## Katalog yang ditambahkan

Halaman `/sertifikasi` kini menyediakan katalog berdasarkan **kolom nomenklatur jabatan kerja baru** pada lampiran SK DJBK:

- **8 klasifikasi**, **51 subklasifikasi**.
- **478 kombinasi skema sertifikasi–jenjang**; bukan 478 jabatan unik.
- **266 kombinasi jabatan kerja–klasifikasi–subklasifikasi–ruang lingkup**.
- 465 entri umum pada Lampiran I; 13 entri khusus ASN pada Lampiran II.
- Nama jabatan kerja dibedakan dari nama skema sertifikasi.
- Jenjang KKNI berupa angka 1–9, dengan pencarian serta filter bertingkat.
- Setiap entri menyediakan halaman sumber PDF dan halaman cetak lampiran.
- Dokumen yang dilampirkan dapat dibuka langsung dari katalog.
- ID katalog diberi label **internal**, bukan kode jabatan resmi.
- Subklasifikasi yang belum berisi usulan jabatan tetap tersedia sebagai kategori, tanpa menciptakan jabatan pengganti.

### Delapan klasifikasi

1. Arsitektur.
2. Sipil.
3. Mekanikal.
4. Tata Lingkungan.
5. Manajemen Pelaksanaan.
6. Arsitektur Lanskap, Teknik Iluminasi dan Desain Interior.
7. Perencanaan Wilayah dan Kota.
8. Sains dan Rekayasa Teknik.

### Batasan penting

Katalog adalah transkripsi snapshot dokumen 2024, **bukan bukti seluruh skema masih berlaku saat ini**. Status seperti “akan disusun” atau “proses penetapan” dipertahankan dari dokumen dan ditandai perlu konfirmasi. Ketersediaan skema di LSP perlu diperiksa tersendiri.

Lampiran III (program akselerasi ahli muda fresh graduate) belum dimasukkan. Persyaratan pendidikan/pengalaman lengkap serta UK/KUK tidak dikarang dari daftar nama jabatan.

Daftar Notion berisi 593 baris konsep. Daftar tersebut tidak diimpor langsung sebagai data resmi, karena dokumen SK memuat konversi, penggabungan, penghapusan, dan nama skema baru. Perbedaan nama atau jumlah tidak otomatis membuktikan kesalahan Notion; rekonsiliasi per baris masih diperlukan.

### Contoh rujukan yang diperiksa

Pada PDF halaman 10 / lampiran halaman 4:

- Jabatan: Ahli Teknik Bangunan Gedung.
- Skema Ahli Muda: jenjang 7.
- Skema Ahli Madya: jenjang 8.
- Skema Ahli Utama: jenjang 9.
- Acuan yang dicantumkan: SKKNI 192-2016, 255-2019, dan 106-2015.

## Status temuan audit sebelumnya

| Temuan | Hasil pemeriksaan source / tindakan |
|---|---|
| SK DJBK 114/2024 disebut pedoman AJJ | Source Knowledge Base dan panduan asisten sudah menyebut penetapan jabatan dan jenjang, bukan pedoman AJJ. Katalog kini menyertakan lampiran sumber. |
| Permen PUPR 12/2021 disebut pedoman pengadaan | Source sudah menyebut Pelaksanaan Pengembangan Keprofesian Berkelanjutan. |
| Permen PU 6/2025 disebut standar kompetensi jabatan | Diperbaiki di Knowledge Base, panduan asisten, dan prompt diagnostik. Regulasi ini menyangkut standar, pengawasan, dan sanksi perizinan berusaha sektor PU. Tautan halaman resmi disediakan. |
| PP 14/2021 disebut aturan AMDAL/izin lingkungan | Diperbaiki sesuai judul rujukan pada lampiran SK: perubahan PP 22/2020 tentang pelaksanaan UU Jasa Konstruksi. |
| Klinik ahli muda/madya/utama memakai jenjang 5/6/7 | Source Klinik sudah memakai 7/8/9. Contoh JSON prompt diagnostik yang masih memakai Ahli Muda 6 diperbaiki menjadi 7. |
| Jabatan internal B002 dan syarat “SKK Level 6” tampil sebagai persyaratan resmi | Katalog sumber menjadi tampilan utama. Data lama dipisahkan dan diberi peringatan; persyaratan lama yang belum direkonsiliasi tidak lagi ditampilkan pada katalog publik sebagai persyaratan resmi. |
| Matrix B–H seolah klasifikasi resmi | Diberi keterangan pengelompokan belajar internal dan tautan ke katalog sumber. Pemetaan lama tidak diganti otomatis. |
| Target PKB universal 150 dan kredit modul otomatis | Pada source yang diperiksa, klaim kredit resmi di BIMTEK telah dipisahkan dari progres belajar. Belum merupakan validasi semua aturan/perhitungan PKB. |
| Klik materi langsung menambah selesai tanpa membuka pelajaran | Antarmuka dilabeli checklist mandiri, tombol dapat dipakai dengan keyboard, dan batasan dijelaskan. **Konten pelajaran terstruktur belum selesai**; perubahan label bukan penyelesaian materi. |
| Angka 73% dan 65% tanpa sumber di beranda | Dihapus, diganti petunjuk persiapan tanpa statistik yang tidak memiliki rujukan. |
| Diagnostik AI gagal | **Masih terbuka.** Source meneruskan kegagalan upstream sebagai 502 generik, tanpa timeout eksplisit atau penanganan seluruh kegagalan jaringan. Koreksi prompt bukan bukti layanan sudah berfungsi. Penyebab produksi belum dipastikan. |
| Mock asesmen gagal | **Masih terbuka.** Source meminta array JSON sementara mode API meminta objek JSON, dan hasil belum divalidasi secara ketat. Ketidaksesuaian ini adalah risiko kode, bukan penyebab produksi yang sudah terbukti. |

## Perlindungan data pengguna

Tidak ada migrasi database, penghapusan progres, atau perubahan otomatis ID jabatan pengguna. Data internal lama tetap disimpan. Katalog baru adalah tambahan referensi; pemetaan ke profil, Matrix, BIMTEK, Quiz, serta unit kompetensi harus dilakukan dengan rekonsiliasi eksplisit agar jabatan pengguna tidak berubah tanpa dasar.

## Yang belum selesai sebelum menyatakan siap rilis menyeluruh

1. Diagnosis kegagalan layanan AI dan uji ulang diagnostik serta mock asesmen, termasuk respons gagal dan retry.
2. Materi pelajaran nyata per langkah, bukan hanya checklist.
3. Rekonsiliasi katalog baru dengan target profil dan konten belajar; verifikasi UK/KUK dari standar dan skema yang tepat.
4. Persyaratan pendidikan/pengalaman per jalur dan per skema, dengan sumber serta pemeriksaan LSP.
5. Lampiran III program fresh graduate, dipisahkan dari jalur umum.
6. Pemeriksaan regulasi/SNI lain yang belum diperiksa dalam Knowledge Base; koreksi empat rujukan tidak berarti semua artikel valid.
7. Pengujian akun dan alur penting serta pemeriksaan aplikasi produksi setelah publikasi ulang.

Tidak tepat menyebut seluruh aplikasi 100% selesai atau seluruh temuan P0 tertutup hanya berdasarkan penambahan katalog ini.

## Verifikasi pada proyek pengembangan

- Pemeriksaan TypeScript: lulus.
- Delapan pengujian katalog: lulus, mencakup hierarki, jenjang Gedung 7/8/9, pemisahan umum/ASN, pencarian, filter, kategori kosong, dan penandaan standar belum pasti.
- ESLint pada berkas yang diubah: selesai tanpa temuan.
- Pemeriksaan tampilan desktop `/sertifikasi`: katalog, filter, serta hasil tampil tanpa halaman error.
- Dokumen sumber tersedia dengan HTTP 200; hash file publik sama dengan lampiran asli.
- Nama jabatan dan skema setiap entri dicocokkan secara otomatis dengan teks halaman PDF yang dirujuk. Pencocokan ini bukan validasi regulasi terkini atau pengganti pemeriksaan manual lengkap.
- Workflow pengembangan berhasil berjalan setelah restart. Peringatan HMR lintas-origin pada browser pengambilan screenshot tidak dipakai sebagai bukti kegagalan produksi.

Pengujian ini **tidak mencakup** permintaan AI nyata, pemetaan target profil baru, semua alur akun, atau pengujian ulang produksi.
