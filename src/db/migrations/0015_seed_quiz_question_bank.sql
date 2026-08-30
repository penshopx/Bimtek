INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Apa fungsi utama pondasi pada struktur bangunan?', 'Sipil', '["Menahan beban struktural","Dekorasi","Insulasi","Ventilasi"]', 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Apa fungsi utama pondasi pada struktur bangunan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'SNI yang mengatur perencanaan struktur beton adalah?', 'Standar', '["SNI 1726","SNI 2847","SNI 6371","SNI 1729"]', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'SNI yang mengatur perencanaan struktur beton adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'APD yang wajib digunakan di ketinggian adalah?', 'K3', '["Helm dan sepatu","Harness dan safety belt","Kacamata dan sarung tangan","Topi dan rompi"]', 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'APD yang wajib digunakan di ketinggian adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Apa kepanjangan AMDAL?', 'Lingkungan', '["Analisis Manajemen Dampak","Analisis Mengenai Dampak Lingkungan","Assessment Muka Dasar Laut","Auditing Material Dienstbilitas"]', 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Apa kepanjangan AMDAL?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Steel reinforcement pada beton berfungsi untuk?', 'Sipil', '["Mengurangi berat","Menambah kekuatan tarik","Memperindah tampilan","Menambah kedap air"]', 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Steel reinforcement pada beton berfungsi untuk?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Berapa kuat tekan minimum beton struktural (MPa)?', 'Material', '["15 MPa","20 MPa","25 MPa","30 MPa"]', 2, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Berapa kuat tekan minimum beton struktural (MPa)?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Alat pelindung diri (APD) untuk pekerjaan tinggi wajib menggunakan?', 'K3', '["Helm","Safety harness","Sepatu safety","Kacamata"]', 1, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Alat pelindung diri (APD) untuk pekerjaan tinggi wajib menggunakan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Floor Area Ratio (FAR) adalah?', 'Perencanaan', '["Rasio biaya lantai","Rasio luas lantai terhadap luas tanah","Rasio finishing","Rasio fondasi"]', 1, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Floor Area Ratio (FAR) adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Konstruksi metode precast adalah?', 'Metode', '["Cor di tempat","Pabrikasi di luar lokasi","Pasang batu bata","Catatan arsitektur"]', 1, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Konstruksi metode precast adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Apa fungsi utama Scaffolding?', 'K3', '["Dekorasi","Penyangga sementara","Jalur kabel","Drainase"]', 1, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Apa fungsi utama Scaffolding?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Peraturan Pemerintah yang mengatur JLAP adalah?', 'Regulasi', '["PP 14/2021","PP 34/2021","PP 24/2021","PP 44/2021"]', 1, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Peraturan Pemerintah yang mengatur JLAP adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Slump test digunakan untuk mengukur?', 'Material', '["Kekuatan beton","Workability beton","Durabilitas","Berat jenis"]', 1, 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Slump test digunakan untuk mengukur?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Jenis pondasi yang cocok untuk tanah lunak adalah?', 'Sipil', '["Raft foundation","Pile foundation","Ring foundation","Strip foundation"]', 1, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Jenis pondasi yang cocok untuk tanah lunak adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Fire rating minimum untuk struktur baja adalah?', 'K3', '["30 menit","60 menit","90 menit","120 menit"]', 1, 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Fire rating minimum untuk struktur baja adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Kontrak yang berdasarkan lumpsum adalah?', 'Kontrak', '["Bayar sesuai volume","Bayar sesuai waktu","Harga tetap total","Cost plus fee"]', 2, 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Kontrak yang berdasarkan lumpsum adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Critical Path Method (CPM) adalah?', 'Manajemen', '["Metode biaya","Metode penjadwalan","Metode pengawasan","Metode quality"]', 1, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Critical Path Method (CPM) adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Yang bukan merupakan jenis crane adalah?', 'Alat', '["Tower crane","Mobile crane","Forklift crane","Crawler crane"]', 2, 16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Yang bukan merupakan jenis crane adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Besi tulangan polos (plain bar) memiliki simbol?', 'Material', '["D","U","P","R"]', 2, 17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Besi tulangan polos (plain bar) memiliki simbol?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Fungsi expansion joint adalah?', 'Sipil', '["Mengikat struktur","Mungkinkan gerakan termal","Memperkuat kolom","Dekorasi"]', 1, 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Fungsi expansion joint adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'PUIL adalah singkatan dari?', 'Elektrikal', '["Pedoman Umum Instalasi Listrik","Petunjuk Utama Instalasi Listrik","Peraturan Umum Instalasi Listrik","Peraturan Útama Instalasi Listrik"]', 2, 19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'PUIL adalah singkatan dari?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Kapasitas genset diukur dalam?', 'Elektrikal', '["Volt","Ampere","kVA","Watt"]', 2, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Kapasitas genset diukur dalam?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'AC Split kapasitas besar disebut?', 'Mekanikal', '["Window type","Split wall","VRV/VRF","Portable"]', 2, 21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'AC Split kapasitas besar disebut?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Sistem sprinkler menggunakan standar?', 'Mekanikal', '["ISO 9001","NFPA 13","ASTM A36","BS 1139"]', 1, 22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Sistem sprinkler menggunakan standar?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Pipa PVC ukuran 4 inch sama dengan?', 'Mekanikal', '["100 mm","110 mm","125 mm","150 mm"]', 1, 23, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Pipa PVC ukuran 4 inch sama dengan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Debit air diukur dalam?', 'Hydraulic', '["m/s","m³/s","kg/m","Pa"]', 1, 24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Debit air diukur dalam?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Boiler berfungsi untuk?', 'Mekanikal', '["Pendinginan","Pemanas air","Kompresi","Generasi"]', 1, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Boiler berfungsi untuk?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'HVAC adalah singkatan dari?', 'Mekanikal', '["Heat, Ventilation, Air Conditioning","High Voltage Alternating Current","Heat Valve Air Compressor","Horizontal Ventilation AC"]', 0, 26, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'HVAC adalah singkatan dari?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Tegangan listrik gedung menggunakan?', 'Elektrikal', '["220V 1 phase","380V 3 phase","110V DC","1000V AC"]', 1, 27, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Tegangan listrik gedung menggunakan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'MCB berfungsi untuk?', 'Elektrikal', '["Mengubah voltage","Proteksi overload","Mengubah frekuensi","Menyimpan energi"]', 1, 28, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'MCB berfungsi untuk?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Grounding electrode resistance idealnya?', 'Elektrikal', '["< 1 Ohm","< 5 Ohm","< 10 Ohm","< 50 Ohm"]', 1, 29, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Grounding electrode resistance idealnya?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Material yang tidak cocok untuk struktur tahan api adalah?', 'Material', '["Beton","Batu bata","Baja","Kayu"]', 3, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Material yang tidak cocok untuk struktur tahan api adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Uji beban (load test) pada jembatan menggunakan?', 'Pengujian', '["Beban hidup","Beban mati","Beban desain","Semua benar"]', 3, 31, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Uji beban (load test) pada jembatan menggunakan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Beton bertulang dalam bahasa sehari-hari disebut?', 'Sipil', '["Reinforced concrete","Prestressed concrete","Plain concrete","Mass concrete"]', 0, 32, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Beton bertulang dalam bahasa sehari-hari disebut?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Ductility material menunjukkan?', 'Material', '["Kekuatan","Kekerasan","Kemampuan deformasi","Kekakuan"]', 2, 33, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Ductility material menunjukkan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Freeboard minimum pada bendungan adalah?', 'Hydraulic', '["0.5 m","1.0 m","1.5 m","2.0 m"]', 1, 34, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Freeboard minimum pada bendungan adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Peak Expiratory Flow digunakan untuk?', 'K3', '["Kebugaran jantung","Fungsi paru","Kekuatan tangan","Pendengaran"]', 1, 35, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Peak Expiratory Flow digunakan untuk?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Noise level aman di tempat kerja adalah?', 'K3', '["< 85 dB","< 90 dB","< 100 dB","< 120 dB"]', 0, 36, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Noise level aman di tempat kerja adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'MSDS adalah?', 'K3', '["Manual Safety Data Sheet","Material Safety Data Sheet","Mechanical Safety Design","Management Safety Documentation"]', 1, 37, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'MSDS adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'LOTO dalam K3 berarti?', 'K3', '["List of Tools","Lock Out Tag Out","Low Oil Temperature","Life Of Tools"]', 1, 38, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'LOTO dalam K3 berarti?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'JSA adalah?', 'K3', '["Job Safety Analysis","Japanese Safety Association","Joint Safety Audit","Junior Safety Agent"]', 0, 39, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'JSA adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Tiang lampu jalan menggunakan pondasi?', 'Sipil', '["Raft","Pile","Spread footing","Caisson"]', 2, 40, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Tiang lampu jalan menggunakan pondasi?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Asphalt mixing plant menghasilkan?', 'Jalan', '["Beton jadi","Campuran aspal","Agregat","Subbase"]', 1, 41, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Asphalt mixing plant menghasilkan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Marshall test untuk?', 'Jalan', '["Tanah","Aspal","Baja","Beton"]', 1, 42, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Marshall test untuk?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'CBR test mengukur?', 'Jalan', '["Kekuatan jalan","Daya dukung tanah","Ketebalan perkerasan","Kekasaran"]', 1, 43, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'CBR test mengukur?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Lapisan aus (wearing course) menggunakan?', 'Jalan', '["Limestone","Hot mix asphalt","Batu pecah","Pasir"]', 1, 44, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Lapisan aus (wearing course) menggunakan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'PMI (Physical Metal Identification) meliputi?', 'Material', '["Komposisi kimia","Warna","Berat","Ukuran"]', 0, 45, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'PMI (Physical Metal Identification) meliputi?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'NDT adalah?', 'Pengujian', '["New Design Technology","Non Destructive Testing","National Design Test","Nuclear Data Test"]', 1, 46, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'NDT adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Ultrasonic test mendeteksi?', 'Pengujian', '["Retak internal","Warna","Berat","Ukuran"]', 0, 47, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Ultrasonic test mendeteksi?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Weldability baja dipengaruhi oleh?', 'Material', '["Kadar karbon","Kadar manganese","Kadar chromium","Semua benar"]', 3, 48, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Weldability baja dipengaruhi oleh?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Galvanisasi melindungi baja dari?', 'Material', '["Api","Korosi","Suhu tinggi","Tekanan"]', 1, 49, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Galvanisasi melindungi baja dari?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Kontraktor all risk insurance melindungi?', 'Asuransi', '["Pekerja","Material dan peralatan","Properti sekitar","Semua benar"]', 3, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Kontraktor all risk insurance melindungi?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Retensioning pada post-tension dilakukan?', 'Metode', '["Sebelum beton keras","Sesudah beton keras","Saat pengecoran","Setiap saat"]', 1, 51, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Retensioning pada post-tension dilakukan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Grout digunakan untuk?', 'Material', '["Finishing","Mengisi void","Dekorasi","Insulasi"]', 1, 52, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Grout digunakan untuk?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Waterstop pada beton berfungsi?', 'Sipil', '["Menghilangkan air","Menghentikan rembesan","Menambah kekuatan","Dekorasi"]', 1, 53, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Waterstop pada beton berfungsi?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Shotcrete adalah?', 'Metode', '["Cat beton","Semprotan beton","Beton polos","Beton pracetak"]', 1, 54, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Shotcrete adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Tegangan geser izin baja struktural sekitar?', 'Material', '["0.4 fy","0.5 fy","0.6 fy","0.7 fy"]', 2, 55, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Tegangan geser izin baja struktural sekitar?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Rafter pada atap berfungsi?', 'Sipil', '["Mendukung beban atap","Drainase","Dekorasi","Ventilasi"]', 0, 56, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Rafter pada atap berfungsi?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Batang tekan (column) menerima?', 'Sipil', '["Tarik","Tekan","Geser","Torsi"]', 1, 57, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Batang tekan (column) menerima?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Saggy floor menunjukkan?', 'Struktur', '["Beban berlebih","Fondasi masalah","Keduanya benar","Tidak ada"]', 2, 58, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Saggy floor menunjukkan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Persiapan sebelum welding meliputi?', 'Manufaktur', '["Cleaning","Preheating","Welding","A dan B benar"]', 3, 59, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Persiapan sebelum welding meliputi?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Welder qualification test menggunakan?', 'Manufaktur', '["Visual test","Destructive test","NDT","Semua benar"]', 3, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Welder qualification test menggunakan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'PQR dalam welding adalah?', 'Manufaktur', '["Procedure Qualification Record","Process Quality Report","Professional Qualification","Production Quality Review"]', 0, 61, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'PQR dalam welding adalah?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'SMA (Stone Matrix Asphalt) menggunakan?', 'Jalan', '["Agregat halus","Agregat kasar","Filler mineral","B and C"]', 3, 62, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'SMA (Stone Matrix Asphalt) menggunakan?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Joint sealant berfungsi?', 'Jalan', '["Mengisi celah","Mencegah air masuk","Memperkuat","Dekorasi"]', 1, 63, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Joint sealant berfungsi?');
--> statement-breakpoint
INSERT INTO `quiz_questions` (`question`, `category`, `options`, `correct`, `sort_order`, `created_at`, `updated_at`)
SELECT 'Micro surfacing adalah?', 'Jalan', '["Lapisan tipis","Lapisan tebal","Fondasi","Subbase"]', 0, 64, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `quiz_questions` WHERE `question` = 'Micro surfacing adalah?');