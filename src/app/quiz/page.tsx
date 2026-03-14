'use client';

import { useState } from 'react';

const quizQuestions = [
  { id: 1, question: 'Apa fungsi utama pondasi pada struktur bangunan?', category: 'Sipil', options: ['Menahan beban struktural', 'Dekorasi', 'Insulasi', 'Ventilasi'], correct: 0 },
  { id: 2, question: 'SNI yang mengatur perencanaan struktur beton adalah?', category: 'Standar', options: ['SNI 1726', 'SNI 2847', 'SNI 6371', 'SNI 1729'], correct: 1 },
  { id: 3, question: 'APD yang wajib digunakan di ketinggian adalah?', category: 'K3', options: ['Helm dan sepatu', 'Harness dan safety belt', 'Kacamata dan sarung tangan', 'Topi dan rompi'], correct: 1 },
  { id: 4, question: 'Apa kepanjangan AMDAL?', category: 'Lingkungan', options: ['Analisis Manajemen Dampak', 'Analisis Mengenai Dampak Lingkungan', 'Assessment Muka Dasar Laut', 'Auditing Material Dienstbilitas'], correct: 1 },
  { id: 5, question: 'Steel reinforcement pada beton berfungsi untuk?', category: 'Sipil', options: ['Mengurangi berat', 'Menambah kekuatan tarik', 'Memperindah tampilan', 'Menambah kedap air'], correct: 1 },
  { id: 6, question: 'Berapa kuat tekan minimum beton struktural (MPa)?', category: 'Material', options: ['15 MPa', '20 MPa', '25 MPa', '30 MPa'], correct: 2 },
  { id: 7, question: 'Alat pelindung diri (APD) untuk pekerjaan tinggi wajib menggunakan?', category: 'K3', options: ['Helm', 'Safety harness', 'Sepatu safety', 'Kacamata'], correct: 1 },
  { id: 8, question: 'Floor Area Ratio (FAR) adalah?', category: 'Perencanaan', options: ['Rasio biaya lantai', 'Rasio luas lantai terhadap luas tanah', 'Rasio finishing', 'Rasio fondasi'], correct: 1 },
  { id: 9, question: 'Konstruksi metode precast adalah?', category: 'Metode', options: ['Cor di tempat', 'Pabrikasi di luar lokasi', 'Pasang batu bata', 'Catatan arsitektur'], correct: 1 },
  { id: 10, question: 'Apa fungsi utama Scaffolding?', category: 'K3', options: ['Dekorasi', 'Penyangga sementara', 'Jalur kabel', 'Drainase'], correct: 1 },
  { id: 11, question: 'Peraturan Pemerintah yang mengatur JLAP adalah?', category: 'Regulasi', options: ['PP 14/2021', 'PP 34/2021', 'PP 24/2021', 'PP 44/2021'], correct: 1 },
  { id: 12, question: 'Slump test digunakan untuk mengukur?', category: 'Material', options: ['Kekuatan beton', 'Workability beton', 'Durabilitas', 'Berat jenis'], correct: 1 },
  { id: 13, question: ' Jenis pondasi yang cocok untuk tanah lunak adalah?', category: 'Sipil', options: ['Raft foundation', 'Pile foundation', 'Ring foundation', 'Strip foundation'], correct: 1 },
  { id: 14, question: 'Fire rating minimum untuk struktur baja adalah?', category: 'K3', options: ['30 menit', '60 menit', '90 menit', '120 menit'], correct: 1 },
  { id: 15, question: 'Kontrak yang berdasarkan lumpsum adalah?', category: 'Kontrak', options: ['Bayar sesuai volume', 'Bayar sesuai waktu', 'Harga tetap total', 'Cost plus fee'], correct: 2 },
  { id: 16, question: 'Critical Path Method (CPM) adalah?', category: 'Manajemen', options: ['Metode biaya', 'Metode penjadwalan', 'Metode pengawasan', 'Metode quality'], correct: 1 },
  { id: 17, question: 'Yang bukan merupakan jenis crane adalah?', category: 'Alat', options: ['Tower crane', 'Mobile crane', 'Forklift crane', 'Crawler crane'], correct: 2 },
  { id: 18, question: 'Besi tulangan polos (plain bar) memiliki simbol?', category: 'Material', options: ['D', 'U', 'P', 'R'], correct: 2 },
  { id: 19, question: 'Fungsi expansion joint adalah?', category: 'Sipil', options: ['Mengikat struktur', 'Mungkinkan gerakan termal', 'Memperkuat kolom', 'Dekorasi'], correct: 1 },
  { id: 20, question: 'PUIL adalah singkatan dari?', category: 'Elektrikal', options: ['Pedoman Umum Instalasi Listrik', 'Petunjuk Utama Instalasi Listrik', 'Peraturan Umum Instalasi Listrik', 'Peraturan Útama Instalasi Listrik'], correct: 2 },
  { id: 21, question: 'Kapasitas genset diukur dalam?', category: 'Elektrikal', options: ['Volt', 'Ampere', 'kVA', 'Watt'], correct: 2 },
  { id: 22, question: 'AC Split kapasitas besar disebut?', category: 'Mekanikal', options: ['Window type', 'Split wall', 'VRV/VRF', 'Portable'], correct: 2 },
  { id: 23, question: 'Sistem sprinkler menggunakan standar?', category: 'Mekanikal', options: ['ISO 9001', 'NFPA 13', 'ASTM A36', 'BS 1139'], correct: 1 },
  { id: 24, question: 'Pipa PVC ukuran 4 inch sama dengan?', category: 'Mekanikal', options: ['100 mm', '110 mm', '125 mm', '150 mm'], correct: 1 },
  { id: 25, question: 'Debit air diukur dalam?', category: 'Hydraulic', options: ['m/s', 'm³/s', 'kg/m', 'Pa'], correct: 1 },
  { id: 26, question: 'Boiler berfungsi untuk?', category: 'Mekanikal', options: ['Pendinginan', 'Pemanas air', 'Kompresi', 'Generasi'], correct: 1 },
  { id: 27, question: 'HVAC adalah singkatan dari?', category: 'Mekanikal', options: ['Heat, Ventilation, Air Conditioning', 'High Voltage Alternating Current', 'Heat Valve Air Compressor', 'Horizontal Ventilation AC'], correct: 0 },
  { id: 28, question: 'Tegangan listrik gedung menggunakan?', category: 'Elektrikal', options: ['220V 1 phase', '380V 3 phase', '110V DC', '1000V AC'], correct: 1 },
  { id: 29, question: 'MCB berfungsi untuk?', category: 'Elektrikal', options: ['Mengubah voltage', 'Proteksi overload', 'Mengubah frekuensi', 'Menyimpan energi'], correct: 1 },
  { id: 30, question: 'Grounding electrode resistance idealnya?', category: 'Elektrikal', options: ['< 1 Ohm', '< 5 Ohm', '< 10 Ohm', '< 50 Ohm'], correct: 1 },
  { id: 31, question: 'Material yang tidak cocok untuk struktur tahan api adalah?', category: 'Material', options: ['Beton', 'Batu bata', 'Baja', 'Kayu'], correct: 3 },
  { id: 32, question: 'Uji beban (load test) pada jembatan menggunakan?', category: 'Pengujian', options: ['Beban hidup', 'Beban mati', 'Beban desain', 'Semua benar'], correct: 3 },
  { id: 33, question: 'Beton bertulang dalam bahasa sehari-hari disebut?', category: 'Sipil', options: ['Reinforced concrete', 'Prestressed concrete', 'Plain concrete', 'Mass concrete'], correct: 0 },
  { id: 34, question: 'Ductility material menunjukkan?', category: 'Material', options: ['Kekuatan', 'Kekerasan', 'Kemampuan deformasi', 'Kekakuan'], correct: 2 },
  { id: 35, question: 'Freeboard minimum pada bendungan adalah?', category: 'Hydraulic', options: ['0.5 m', '1.0 m', '1.5 m', '2.0 m'], correct: 1 },
  { id: 36, question: 'Peak Expiratory Flow digunakan untuk?', category: 'K3', options: ['Kebugaran jantung', 'Fungsi paru', 'Kekuatan tangan', 'Pendengaran'], correct: 1 },
  { id: 37, question: 'Noise level aman di tempat kerja adalah?', category: 'K3', options: ['< 85 dB', '< 90 dB', '< 100 dB', '< 120 dB'], correct: 0 },
  { id: 38, question: 'MSDS adalah?', category: 'K3', options: ['Manual Safety Data Sheet', 'Material Safety Data Sheet', 'Mechanical Safety Design', 'Management Safety Documentation'], correct: 1 },
  { id: 39, question: 'LOTO dalam K3 berarti?', category: 'K3', options: ['List of Tools', 'Lock Out Tag Out', 'Low Oil Temperature', 'Life Of Tools'], correct: 1 },
  { id: 40, question: 'JSA adalah?', category: 'K3', options: ['Job Safety Analysis', 'Japanese Safety Association', 'Joint Safety Audit', 'Junior Safety Agent'], correct: 0 },
  { id: 41, question: 'Tiang lampu jalan menggunakan pondasi?', category: 'Sipil', options: ['Raft', 'Pile', 'Spread footing', 'Caisson'], correct: 2 },
  { id: 42, question: 'Asphalt mixing plant menghasilkan?', category: 'Jalan', options: ['Beton jadi', 'Campuran aspal', 'Agregat', 'Subbase'], correct: 1 },
  { id: 43, question: 'Marshall test untuk?', category: 'Jalan', options: ['Tanah', 'Aspal', 'Baja', 'Beton'], correct: 1 },
  { id: 44, question: 'CBR test mengukur?', category: 'Jalan', options: ['Kekuatan jalan', 'Daya dukung tanah', 'Ketebalan perkerasan', 'Kekasaran'], correct: 1 },
  { id: 45, question: 'Lapisan aus (wearing course) menggunakan?', category: 'Jalan', options: ['Limestone', 'Hot mix asphalt', 'Batu pecah', 'Pasir'], correct: 1 },
  { id: 46, question: 'PMI (Physical Metal Identification) meliputi?', category: 'Material', options: ['Komposisi kimia', 'Warna', 'Berat', 'Ukuran'], correct: 0 },
  { id: 47, question: 'NDT adalah?', category: 'Pengujian', options: ['New Design Technology', 'Non Destructive Testing', 'National Design Test', 'Nuclear Data Test'], correct: 1 },
  { id: 48, question: 'Ultrasonic test mendeteksi?', category: 'Pengujian', options: ['Retak internal', 'Warna', 'Berat', 'Ukuran'], correct: 0 },
  { id: 49, question: 'Weldability baja dipengaruhi oleh?', category: 'Material', options: ['Kadar karbon', 'Kadar manganese', 'Kadar chromium', 'Semua benar'], correct: 3 },
  { id: 50, question: 'Galvanisasi melindungi baja dari?', category: 'Material', options: ['Api', 'Korosi', 'Suhu tinggi', 'Tekanan'], correct: 1 },
  { id: 51, question: 'Kontraktor all risk insurance melindungi?', category: 'Asuransi', options: ['Pekerja', 'Material dan peralatan', 'Properti sekitar', 'Semua benar'], correct: 3 },
  { id: 52, question: 'Retensioning pada post-tension dilakukan?', category: 'Metode', options: ['Sebelum beton keras', 'Sesudah beton keras', 'Saat pengecoran', 'Setiap saat'], correct: 1 },
  { id: 53, question: 'Grout digunakan untuk?', category: 'Material', options: ['Finishing', 'Mengisi void', 'Dekorasi', 'Insulasi'], correct: 1 },
  { id: 54, question: 'Waterstop pada beton berfungsi?', category: 'Sipil', options: ['Menghilangkan air', 'Menghentikan rembesan', 'Menambah kekuatan', 'Dekorasi'], correct: 1 },
  { id: 55, question: 'Shotcrete adalah?', category: 'Metode', options: ['Cat beton', 'Semprotan beton', 'Beton polos', 'Beton pracetak'], correct: 1 },
  { id: 56, question: 'Tegangan geser izin baja struktural sekitar?', category: 'Material', options: ['0.4 fy', '0.5 fy', '0.6 fy', '0.7 fy'], correct: 2 },
  { id: 57, question: 'Rafter pada atap berfungsi?', category: 'Sipil', options: ['Mendukung beban atap', 'Drainase', 'Dekorasi', 'Ventilasi'], correct: 0 },
  { id: 58, question: 'Batang tekan (column) menerima?', category: 'Sipil', options: ['Tarik', 'Tekan', 'Geser', 'Torsi'], correct: 1 },
  { id: 59, question: 'Saggy floor menunjukkan?', category: 'Struktur', options: ['Beban berlebih', 'Fondasi masalah', 'Keduanya benar', 'Tidak ada'], correct: 2 },
  { id: 60, question: 'Persiapan sebelum welding meliputi?', category: 'Manufaktur', options: ['Cleaning', 'Preheating', 'Welding', 'A dan B benar'], correct: 3 },
  { id: 61, question: 'Welder qualification test menggunakan?', category: 'Manufaktur', options: ['Visual test', 'Destructive test', 'NDT', 'Semua benar'], correct: 3 },
  { id: 62, question: 'PQR dalam welding adalah?', category: 'Manufaktur', options: ['Procedure Qualification Record', 'Process Quality Report', 'Professional Qualification', 'Production Quality Review'], correct: 0 },
  { id: 63, question: 'SMA (Stone Matrix Asphalt) menggunakan?', category: 'Jalan', options: ['Agregat halus', 'Agregat kasar', 'Filler mineral', 'B and C'], correct: 3 },
  { id: 64, question: 'Joint sealant berfungsi?', category: 'Jalan', options: ['Mengisi celah', 'Mencegah air masuk', 'Memperkuat', 'Dekorasi'], correct: 1 },
  { id: 65, question: 'Micro surfacing adalah?', category: 'Jalan', options: ['Lapisan tipis', 'Lapisan tebal', 'Fondasi', 'Subbase'], correct: 0 },
];

const categories = ['Semua', 'Sipil', 'K3', 'Standar', 'Material', 'Metode', 'Elektrikal', 'Mekanikal', 'Manajemen', 'Jalan', 'Pengujian', 'Kontrak', 'Perencanaan'];

export default function QuizPage() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const filteredQuestions = selectedCategory === 'Semua' 
    ? quizQuestions 
    : quizQuestions.filter(q => q.category === selectedCategory);

  const handleAnswer = (answerIndex: number) => {
    if (answered) return;
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    
    if (answerIndex === filteredQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  if (showScore) {
    const percentage = Math.round((score / filteredQuestions.length) * 100);
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '📚'}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Selesai!</h2>
            <p className="text-slate-600 mb-6">
              Skor Anda: {score} dari {filteredQuestions.length} ({percentage}%)
            </p>
            <div className={`text-4xl font-bold mb-6 ${percentage >= 60 ? 'text-green-600' : 'text-amber-600'}`}>
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Learning!'}
            </div>
            <button
              onClick={restartQuiz}
              className="px-8 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600"
            >
              🔄 Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = filteredQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">✍️ Simulasi Quiz</h1>
          <p className="text-lg text-slate-600">
            {filteredQuestions.length} soal persiapan ujian sertifikasi
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); restartQuiz(); }}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {question.category}
            </span>
            <span className="text-slate-500">
              {currentQuestion + 1} / {filteredQuestions.length}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                className={`w-full p-4 text-left rounded-xl transition-all ${
                  answered
                    ? index === question.correct
                      ? 'bg-green-100 border-2 border-green-500 text-green-800'
                      : selectedAnswer === index
                        ? 'bg-red-100 border-2 border-red-500 text-red-800'
                        : 'bg-slate-50 text-slate-600'
                    : selectedAnswer === index
                      ? 'bg-amber-100 border-2 border-amber-500'
                      : 'bg-slate-50 border-2 border-slate-200 hover:border-amber-300'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>

          {answered && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={nextQuestion}
                className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600"
              >
                {currentQuestion < filteredQuestions.length - 1 ? 'Soal Berikutnya →' : 'Lihat Hasil'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl p-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / filteredQuestions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-slate-500 mt-2">
            Progress: {currentQuestion + 1} / {filteredQuestions.length}
          </p>
        </div>
      </div>
    </div>
  );
}
