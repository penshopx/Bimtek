# Peta Adopsi Fitur Gustafta ke BIMTEK Mandiri

## Keputusan produk
Pertahankan aplikasi BIMTEK / SIAP SKK yang ada. Gunakan pola fungsi yang relevan dari Gustafta sebagai referensi pengembangan, bukan integrasi akun, database, storage, pembayaran, atau API Gustafta. Jangan menyalin kode, aset, data pengguna, atau dokumen privat yang tidak diberikan akses/izin.

## Lingkup pembelajaran sumber
Ditelaah: halaman publik Gustafta, Portal SKK, Klinik Uji Kompetensi, Bedah Dokumen, Ruang Simpan, dan Brain Project. Penelaahan ini membaca uraian produk; tidak menguji login, unggah, hasil AI, keamanan, performa, atau integrasi internalnya. Fitur yang dipromosikan bukan otomatis fitur yang telah dibuktikan bekerja. Klaim “30 detik”, jumlah pengguna, enkripsi, dukungan format, harga, AI dilatih regulasi terbaru, serta statistik industri tidak diadopsi sebagai fakta atau SLA BIMTEK.

## Pemetaan fitur
| Pola di Gustafta | Adaptasi mandiri untuk BIMTEK | Perlakuan terhadap BIMTEK existing |
| --- | --- | --- |
| Ruang Simpan: dokumen, pencarian isi, akses terbatas, riwayat | Ruang Bukti peserta: dokumen persyaratan, bukti pengalaman, hasil latihan, dan bukti PKB; metadata, sumber/halaman, versi, hak akses dan pencarian | Inventarisasi fitur dokumen/bookmark/profil/storage terlebih dahulu. Tambahkan kemampuan yang belum ada, jangan buat penyimpanan paralel |
| Bedah Dokumen: ringkasan, checklist, pertanyaan isi dokumen | Bedah Persyaratan dan Bukti: ringkas dokumen skema/regulasi, ekstrak daftar persyaratan, identifikasi informasi yang belum lengkap, chat bersumber | Hubungkan ke Persiapan Dokumen dan Knowledge Base. Hasil AI draft; keputusan kelayakan tidak ditetapkan dari ringkasan AI |
| Generator Portofolio pada Portal SKK | Penyusun Portofolio: proyek, peran nyata peserta, periode, kontribusi, bukti, dan keterkaitan unit kompetensi; ekspor draft | Periksa hubungan dengan Generator APL.02 yang sudah ada. Portofolio bukan otomatis formulir resmi dan tidak boleh mengarang pengalaman |
| Analisis SKKNI pada Portal SKK | Pemetaan Unit dan Kebutuhan Bukti: unit, elemen/KUK bila naskah tersedia, sumber, skema/versi dan kebutuhan belajar | Perkuat Matrix, katalog materi, Klinik dan bank soal dengan master yang sama; jangan menyusun katalog KUK hanya dari nama jabatan |
| Klinik: dialog, blueprint, belajar, simulasi, rekomendasi | Satu perjalanan persiapan per skema/jenjang, bukan daftar chatbot terpisah | BIMTEK telah menampilkan pola serupa. Benahi jenjang dan kegagalan AI; jangan membangun Klinik kedua |
| Materi, tutor dan simulator pada Portal SKK | Tutor dengan konteks target dan dokumen yang dipilih, latihan per unit, pembahasan, sumber dan ringkasan kesiapan | Perkuat BIMTEK, Quiz, Mock, Coach dan simulator existing. Konteks dipilih pengguna, bukan seluruh dokumen dibaca otomatis |
| Executive Summary SKK yang ditautkan dari beranda | Draft Ringkasan Pengalaman/Kegiatan: fakta, hasil, pembelajaran, relevansi dan daftar bukti | Masukkan ke Portofolio/Ruang Bukti sebagai satu keluaran, bukan aplikasi eksternal baru. Tidak otomatis menjadi kegiatan/kredit PKB yang diakui |
| Tracker dan Planner SKK BUJK pada Portal SKK | Pemantauan peserta/cohort: kebutuhan belajar, dokumen, jadwal dan pengingat pembaruan | Tahap berikutnya untuk penyelenggara/perusahaan bila dibutuhkan. Bedakan rencana belajar personal yang sudah ada dari pengelolaan cohort |

Pemetaan existing berdasarkan navigasi audit publik dan berkas yang disediakan; implementasi dalam akun/kode belum diaudit lengkap. Jangan menyatakan suatu fitur belum ada hanya karena tidak terlihat pada akses tamu.

## Tiga kemampuan yang diprioritaskan setelah P0

### 1. Ruang Bukti
**Kegunaan:** peserta tidak mengunggah ulang bukti untuk setiap alat. Berkas terkait persyaratan, portofolio, belajar dan PKB melalui referensi internal yang sama.
**Data minimum:** pemilik, identitas berkas, jenis bukti, tanggal/periode, konteks jabatan/skema/jenjang, versi, hak akses, dan status pemrosesan. Sesuaikan dengan schema existing; ini kebutuhan fungsional, bukan nama kolom wajib.
**Status berkas:** diterima, menunggu ekstraksi, diproses, siap ditinjau, atau gagal. “Siap ditinjau” tidak berarti dokumen sah atau kredit resmi.
**Kriteria penerimaan:** peserta A tidak dapat mengakses bukti peserta B; dokumen dapat digunakan ulang tanpa salinan tak terkendali; ekstraksi gagal tampil jelas; penghapusan/revokasi akses juga diterapkan pada indeks dan konteks AI.

### 2. Bedah Persyaratan dan Bukti
**Kegunaan:** mengubah dokumen yang dipilih menjadi checklist yang dapat ditinjau, bukan menebak syarat dari nama jabatan.
**Keluaran minimum:** ringkasan, daftar persyaratan/temuan, kutipan atau halaman sumber, bagian yang belum terbaca, asumsi/ketidakpastian dan tindak lanjut.
**Kriteria penerimaan:** setiap temuan faktual menunjukkan sumber; hasil hanya berdasarkan dokumen yang diizinkan; informasi tidak ditemukan ditulis tidak ditemukan, bukan direka; dokumen belum lengkap tidak otomatis disebut tidak memenuhi kelayakan; tidak mengeluarkan putusan sertifikasi.

### 3. Penyusun Portofolio dan Ringkasan
**Kegunaan:** merapikan bukti pengalaman nyata dan pembelajaran menjadi draft yang dapat dikoreksi peserta.
**Masukan minimum:** proyek/kegiatan nyata, peran, periode, tugas, hasil, dan bukti. Hubungkan dengan unit yang sumbernya tersedia.
**Kriteria penerimaan:** fakta yang belum diisi tetap kosong/ditandai; tidak membuat proyek, tanda tangan, sertifikat atau bukti fiktif; hasil dapat diedit dan diekspor sebagai draft; ketentuan formulir/skema resmi diperiksa terpisah.

## Dua jalur tetap terpisah
### Persiapan uji kompetensi
Profil → target skema/jenjang → cek persyaratan → Ruang Bukti/portofolio → pemetaan kebutuhan belajar → materi/tutor → latihan/simulasi → ringkasan kesiapan.
Hasil simulasi adalah hasil latihan. Indeks kesiapan tidak diberi label putusan kompeten resmi atau probabilitas lulus yang tidak tervalidasi.

### Pengelolaan PKB
Profil SKK → kegiatan → bukti → ringkasan/refleksi → estimasi atau penilaian mandiri → riwayat review/penetapan bila ada → ringkasan komposisi dan kebutuhan perpanjangan.
Ruang Bukti dapat digunakan bersama, tetapi aktivitas belajar, bukti pengalaman, portofolio dan kredit PKB tetap memiliki konteks/status berbeda. Perbaikan ketentuan PKB mengikuti baseline dan pemeriksaan aturan yang berlaku, bukan klaim produk Gustafta.

## Yang tidak diadopsi pada tahap awal
- Tender, LKUT, LKPM, SMAP/PUB, pengurusan SBU dan workspace proyek bisnis umum: tidak langsung mendukung sasaran utama peserta ujikom/PKB.
- BrainClaw lengkap: EVM, forecast proyek, stakeholder intelligence dan enam subagen paralel bukan kebutuhan awal platform persiapan.
- Login bersama, shared storage, pembayaran Scalev, otomatisasi API atau perpindahan data Gustafta.
- Harga, kuota, janji waktu analisis, statistik dan klaim AI/keamanan sebagai teks pemasaran siap pakai.

Pola Brain Project dapat dijadikan inspirasi untuk pembahasan studi kasus proyek pada materi manajemen, tetapi bukan alasan membangun mesin monitoring proyek penuh.

## Arsitektur mandiri
- Pertahankan autentikasi, database dan komponen yang masih layak pada BIMTEK; hasil inspeksi menentukan perubahan, bukan asumsi framework lain.
- Simpan berkas dan indeks di lingkungan yang dikelola BIMTEK sendiri. Provider model/storage dapat dipakai sesuai kebutuhan, tetapi tidak bergantung akun Gustafta.
- Master jabatan, skema, unit dan regulasi menjadi rujukan bersama bagi materi, checklist dan tutor.
- Kontrol akses dilakukan sebelum dokumen ditemukan/dikirim ke model, bukan hanya menyembunyikan tombol UI.
- Pengguna memilih dokumen yang boleh menjadi konteks AI; dokumen sensitif tidak dimasukkan otomatis ke seluruh layanan.
- Ketentuan deterministik dipisahkan dari penjelasan AI. Ekstraksi dokumen bukan penetapan sah/tidak sah atau penetapan kredit.
- Catat versi sumber, perubahan, model/konteks yang relevan dan hasil review; jangan menaruh secret atau data pribadi lengkap dalam log.

## Urutan pengerjaan
1. Tuntaskan P0: koreksi regulasi/jenjang, pemulihan AI, pembedaan poin belajar/kredit PKB dan fungsi lesson. File Knowledge Base telah disiapkan, tetapi belum dikonfirmasi diterapkan pada proyek.
2. Inspeksi kode fitur dokumen, APL.02, profil, Matrix, tutor dan storage existing agar pengembangan tidak duplikatif.
3. Bangun/penguatan Ruang Bukti dan aksesnya.
4. Bedah dokumen dengan sumber; kemudian draft portofolio/ringkasan menggunakan bukti yang sama.
5. Hubungkan ke pemetaan unit, tutor dan simulasi existing.
6. Tambahkan operasi cohort/penyelenggara PKB setelah audit akun dan kebutuhan perannya jelas.

Tidak ada perubahan produksi, integrasi, penyalinan kode, atau pemindahan data yang telah dilakukan. Estimasi waktu/biaya memerlukan inspeksi proyek.

## Sumber publik yang ditelaah
- https://gustafta.my.id/ — ekosistem, jalur persiapan dan tautan Executive Summary SKK.
- https://gustafta.my.id/skk — portofolio, simulator, materi, analisis SKKNI, tracker dan planner.
- https://gustafta.my.id/klinik-uji-kompetensi — perjalanan dialog hingga rekomendasi kesiapan.
- https://gustafta.my.id/bedah-dokumen — ringkasan, checklist, deteksi risiko dan chat dokumen.
- https://gustafta.my.id/ruang-simpan — penyimpanan, pencarian isi, konteks dan kontrol akses yang dipromosikan.
- https://gustafta.my.id/brain-project — analisis proyek/EVM/forecast, diputuskan bukan fokus awal.
