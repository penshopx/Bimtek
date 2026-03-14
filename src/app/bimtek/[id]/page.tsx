'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const bimtekModules: Record<string, { title: string; category: string; pkb: number; duration: string; level: string; content: string; mentor: string }> = {
  'sipil-gedung-1': { title: 'Teknik Fondasi Gedung', category: 'Sipil Gedung', pkb: 10, duration: '4 jam', level: 'Ahli', content: 'Pelajari teknik fondasi gedung mulai dari shallow foundation hingga deep foundation. Mencakup pile cap design, bearing capacity, dan settlement analysis.', mentor: 'Ahli Teknik Bangunan Gedung' },
  'sipil-gedung-2': { title: 'Struktur Beton Bertulang', category: 'Sipil Gedung', pkb: 12, duration: '6 jam', level: 'Ahli', content: 'Desain dan analisis struktur beton bertulang sesuai SNI 2847:2019. Mencakup flexural design, shear design, dan detailing.', mentor: 'Ahli Teknik Bangunan Gedung' },
  'sipil-gedung-3': { title: 'Struktur Baja Gedung', category: 'Sipil Gedung', pkb: 12, duration: '6 jam', level: 'Ahli', content: 'Perencanaan struktur baja gedung sesuai SNI 1729:2020. Mencakup connection design, column design, dan beam design.', mentor: 'Ahli Teknik Bangunan Gedung' },
  'k3-1': { title: 'K3 Konstruksi Gedung', category: 'K3', pkb: 15, duration: '8 jam', level: 'Wajib', content: 'Keselamatan dan kesehatan kerja di proyek konstruksi gedung. Identifikasi hazard, controls, dan implementasi K3.', mentor: 'Ahli K3 Konstruksi' },
  'k3-2': { title: 'Pencegahan Kecelakaan Kerja', category: 'K3', pkb: 10, duration: '4 jam', level: 'Ahli', content: 'Strategi pencegahan kecelakaan kerja di konstruksi. Incident analysis, hazard identification, dan safety culture.', mentor: 'Ahli K3 Konstruksi' },
  'jalan-1': { title: 'Desain Jalan Raya', category: 'Jalan', pkb: 12, duration: '6 jam', level: 'Ahli', content: 'Desain geometrik jalan raya sesuai standar Indonesia. Horizontal alignment, vertical alignment, dan cross section.', mentor: 'Ahli Teknik Jalan' },
  'jalan-3': { title: 'Jembatan Beton', category: 'Jalan', pkb: 12, duration: '6 jam', level: 'Ahli', content: 'Perencanaan dan desain jembatan beton. Superstructure, substructure, dan foundation design.', mentor: 'Ahli Teknik Jalan' },
  'elektrikal-1': { title: 'Instalasi Listrik Gedung', category: 'Elektrikal', pkb: 12, duration: '6 jam', level: 'Ahli', content: 'Desain instalasi listrik gedung sesuai PUIL. Distribution system, wiring, dan safety devices.', mentor: 'Ahli Teknik Elektrikal' },
  'mekanikal-1': { title: 'Plumbing Gedung', category: 'Mekanikal', pkb: 10, duration: '5 jam', level: 'Ahli', content: 'Sistem plumbing gedung meliputi water supply, drainage, dan fire protection.', mentor: 'Ahli Teknik Mekanikal' },
  'manajemen-1': { title: 'Manajemen Proyek Konstruksi', category: 'Manajemen', pkb: 15, duration: '8 jam', level: 'Manager', content: 'Manajemen proyek konstruksi dari inception hingga closeout. Project life cycle, stakeholders, dan deliverable.', mentor: 'Ahli Manajemen Proyek' },
  'rab-1': { title: 'Penyusunan RAB', category: 'RAB', pkb: 12, duration: '6 jam', level: 'Ahli', content: 'Penyusunan rencana anggaran biaya proyek konstruksi. Metode perhitunga, markup, dan contingency.', mentor: 'Ahli Estimasi Biaya' },
  'digital-3': { title: 'BIM Fundamental', category: 'Digital', pkb: 15, duration: '8 jam', level: 'Ahli', content: 'Building Information Modeling fundamental. BIM levels, software, dan implementation strategy.', mentor: 'Ahli BIM' },
  // === PELATIHAN PERSONIL MANAGERIAL - PERMEN PU NO 7 TAHUN 2024 ===
  'managerial-1': { title: 'Penanggung Jawab Badan Usaha (PJBU)', category: 'Personil Managerial', pkb: 20, duration: '12 jam', level: 'PJBU', content: 'Materi lengkap tentang PJBU berdasarkan Permen PU No 7 Tahun 2024. Mencakup persyaratan, kewajiban, dan tanggung jawab PJBU dalam badan usaha jasa konstruksi.', mentor: 'Ahli Manajemen Konstruksi' },
  'managerial-2': { title: 'Persyaratan PJBU berdasarkan Permen PU 7/2024', category: 'Personil Managerial', pkb: 15, duration: '8 jam', level: 'PJBU', content: 'Detail persyaratan PJBU sesuai Permen PU 7/2024 tentang Perubahan atas Permen PU 5/2017. Meliputi kualifikasi pendidikan, pengalaman, dan kompetensi.', mentor: 'Ahli Manajemen Konstruksi' },
  'managerial-3': { title: 'Kewajiban dan Tanggung Jawab PJBU', category: 'Personil Managerial', pkb: 10, duration: '6 jam', level: 'PJBU', content: 'Pemahaman kewajiban dan tanggung jawab PJBU dalam operasional badan usaha jasa konstruksi.', mentor: 'Ahli Manajemen Konstruksi' },
  'managerial-4': { title: 'Penanggung Jawab Teknik (PJT)', category: 'Personil Managerial', pkb: 20, duration: '12 jam', level: 'PJT', content: 'Kompetensi dan tugas PJT dalam pengawasan teknis proyek konstruksi.', mentor: 'Ahli Teknik Konstruksi' },
  'managerial-5': { title: 'Kompetensi Teknis PJT', category: 'Personil Managerial', pkb: 15, duration: '8 jam', level: 'PJT', content: 'Persyaratan kompetensi teknis PJT sesuai regulasi yang berlaku.', mentor: 'Ahli Teknik Konstruksi' },
  'managerial-6': { title: 'Pengawasan Pelaksanaan Pekerjaan PJT', category: 'Personil Managerial', pkb: 10, duration: '6 jam', level: 'PJT', content: 'Metode dan teknik pengawasan pelaksanaan pekerjaan oleh PJT.', mentor: 'Ahli Teknik Konstruksi' },
  'managerial-7': { title: 'Penanggung Jawab Bidang (PJKB)', category: 'Personil Managerial', pkb: 20, duration: '12 jam', level: 'PJKB', content: 'Tugas dan tanggung jawab PJKB dalam pengelolaan bidang keahlian tertentu.', mentor: 'Ahli Teknik Konstruksi' },
  'managerial-8': { title: 'Kualifikasi Bidang Keahlian PJKB', category: 'Personil Managerial', pkb: 15, duration: '8 jam', level: 'PJKB', content: 'Persyaratan kualifikasi bidang keahlian untuk PJKB.', mentor: 'Ahli Teknik Konstruksi' },
  'managerial-9': { title: 'Penanggung Jawab Subklasifikasi Badan Usaha (PJSKBBU)', category: 'Personil Managerial', pkb: 20, duration: '12 jam', level: 'PJSKBBU', content: 'Peran dan tanggung jawab PJSKBBU dalam subklasifikasi badan usaha.', mentor: 'Ahli Manajemen Konstruksi' },
  'managerial-10': { title: 'Registrasi dan Validasi PJSKBBU', category: 'Personil Managerial', pkb: 15, duration: '8 jam', level: 'PJSKBBU', content: 'Prosedur registrasi dan validasi PJSKBBU.', mentor: 'Ahli Manajemen Konstruksi' },
  'managerial-11': { title: 'Manajer Keuangan Badan Usaha', category: 'Personil Managerial', pkb: 18, duration: '10 jam', level: 'Manager', content: 'Tugas dan tanggung jawab manajer keuangan dalam badan usaha jasa konstruksi.', mentor: 'Ahli Keuangan Konstruksi' },
  'managerial-12': { title: 'Sistem Akuntansi Keuangan', category: 'Personil Managerial', pkb: 12, duration: '6 jam', level: 'Manager', content: 'Sistem akuntansi keuangan untuk badan usaha konstruksi.', mentor: 'Ahli Keuangan Konstruksi' },
  'managerial-13': { title: 'Manajer Pengadaan (Procurement)', category: 'Personil Managerial', pkb: 18, duration: '10 jam', level: 'Manager', content: 'Kompetensi manajer pengadaan dalam proyek konstruksi.', mentor: 'Ahli Pengadaan' },
  'managerial-14': { title: 'Etika dan Prosedur Pengadaan', category: 'Personil Managerial', pkb: 12, duration: '6 jam', level: 'Manager', content: 'Etika dan prosedur pengadaan barang/jasa konstruksi.', mentor: 'Ahli Pengadaan' },
  'managerial-15': { title: 'Manajer Rantai Pasok Material dan Peralatan', category: 'Personil Managerial', pkb: 18, duration: '10 jam', level: 'Manager', content: 'Manajemen rantai pasok material dan peralatan konstruksi.', mentor: 'Ahli Supply Chain' },
  'managerial-16': { title: 'Manajemen Logistik Proyek', category: 'Personil Managerial', pkb: 12, duration: '6 jam', level: 'Manager', content: 'Manajemen logistik di lokasi proyek konstruksi.', mentor: 'Ahli Supply Chain' },
  'managerial-17': { title: 'Petugas K3 Konstruksi', category: 'Personil Managerial', pkb: 20, duration: '12 jam', level: 'K3', content: 'Pelatihan petugas K3 konstruksi sesuai regulasi.', mentor: 'Ahli K3 Konstruksi' },
  'managerial-18': { title: 'P2K3 dan Pembinaan K3', category: 'Personil Managerial', pkb: 15, duration: '8 jam', level: 'K3', content: 'Pembentukan dan tugas P2K3 di proyek konstruksi.', mentor: 'Ahli K3 Konstruksi' },
  // === BIMTEK PENGADAAN DAN TENDER ===
  'pengadaan-1': { title: 'Dasar-dasar Pengadaan Barang/Jasa', category: 'Pengadaan & Tender', pkb: 15, duration: '8 jam', level: 'Ahli', content: 'Pengenalan dasar pengadaan barang/jasa di sektor konstruksi.', mentor: 'Ahli Pengadaan' },
  'pengadaan-2': { title: 'Perpres 16/2018 dan perubahannya', category: 'Pengadaan & Tender', pkb: 12, duration: '6 jam', level: 'Ahli', content: 'Pemahaman Perpres 16/2018 tentang Pengadaan Barang/Jasa Pemerintah.', mentor: 'Ahli Pengadaan' },
  'pengadaan-3': { title: 'Metode Pemilihan Penyedia', category: 'Pengadaan & Tender', pkb: 10, duration: '5 jam', level: 'Ahli', content: 'Metode pemilihan penyedia jasa konstruksi.', mentor: 'Ahli Pengadaan' },
  'pengadaan-4': { title: 'Penyusunan Dokumen Tender', category: 'Pengadaan & Tender', pkb: 15, duration: '8 jam', level: 'Ahli', content: 'Teknik penyusunan dokumen tender konstruksi.', mentor: 'Ahli Pengadaan' },
  'pengadaan-5': { title: 'Evaluasi Penawaran', category: 'Pengadaan & Tender', pkb: 12, duration: '6 jam', level: 'Ahli', content: 'Metode dan kriteria evaluasi penawaran.', mentor: 'Ahli Pengadaan' },
  'pengadaan-6': { title: 'Kontrak Pengadaan', category: 'Pengadaan & Tender', pkb: 10, duration: '5 jam', level: 'Ahli', content: 'Penyusunan dan pengelolaan kontrak pengadaan.', mentor: 'Ahli Kontrak' },
  'pengadaan-7': { title: 'E-Procurement dan LPSE', category: 'Pengadaan & Tender', pkb: 10, duration: '5 jam', level: 'Ahli', content: 'Sistem e-procurement dan LPSE.', mentor: 'Ahli Pengadaan' },
  'pengadaan-8': { title: 'Pengadaan Melalui Penyedia', category: 'Pengadaan & Tender', pkb: 8, duration: '4 jam', level: 'Ahli', content: 'Prosedur pengadaan melalui penyedia jasa.', mentor: 'Ahli Pengadaan' },
  'pengadaan-9': { title: 'Swakelola dan PK', category: 'Pengadaan & Tender', pkb: 8, duration: '4 jam', level: 'Ahli', content: 'Pengadaan secara swakelola dan pengadaan langsung.', mentor: 'Ahli Pengadaan' },
  'pengadaan-10': { title: 'Penyelesaian Sengketa Pengadaan', category: 'Pengadaan & Tender', pkb: 6, duration: '3 jam', level: 'Ahli', content: 'Mekanisme penyelesaian sengketa pengadaan.', mentor: 'Ahli Kontrak' },
  // === BIMTEK LKUT (LAPORAN KEGIATAN USAHA TAHUNAN) ===
  'lkut-1': { title: 'Pengantar LKUT', category: 'LKUT', pkb: 8, duration: '4 jam', level: 'Ahli', content: 'Pengenalan LKUT untuk badan usaha konstruksi.', mentor: 'Ahli Keuangan Konstruksi' },
  'lkut-2': { title: 'Format dan Isi LKUT', category: 'LKUT', pkb: 12, duration: '6 jam', level: 'Ahli', content: 'Format dan isi laporan kegiatan usaha tahunan.', mentor: 'Ahli Keuangan Konstruksi' },
  'lkut-3': { title: 'Penyusunan Laporan Keuangan', category: 'LKUT', pkb: 15, duration: '8 jam', level: 'Ahli', content: 'Teknik penyusunan laporan keuangan untuk LKUT.', mentor: 'Ahli Keuangan Konstruksi' },
  'lkut-4': { title: 'Pelaporan Kegiatan Usaha', category: 'LKUT', pkb: 10, duration: '5 jam', level: 'Ahli', content: 'Prosedur pelaporan kegiatan usaha tahunan.', mentor: 'Ahli Keuangan Konstruksi' },
  'lkut-5': { title: 'Persyaratan Submit LKUT', category: 'LKUT', pkb: 8, duration: '4 jam', level: 'Ahli', content: 'Persyaratan pengumpulan LKUT.', mentor: 'Ahli Keuangan Konstruksi' },
  'lkut-6': { title: 'Sanksi Adminstratif LKUT', category: 'LKUT', pkb: 6, duration: '3 jam', level: 'Ahli', content: 'Sanksi administratif jika tidak submit LKUT.', mentor: 'Ahli Keuangan Konstruksi' },
  'lkut-7': { title: 'Verifikasi dan Validasi LKUT', category: 'LKUT', pkb: 10, duration: '5 jam', level: 'Ahli', content: 'Proses verifikasi dan validasi LKUT.', mentor: 'Ahli Keuangan Konstruksi' },
  'lkut-8': { title: 'Teknis Pengisian Data LKUT', category: 'LKUT', pkb: 12, duration: '6 jam', level: 'Ahli', content: 'Teknis pengisian data LKUT secara online.', mentor: 'Ahli Keuangan Konstruksi' },
};

const defaultModule = { title: 'Modul BIMTEK', category: 'Umum', pkb: 10, duration: '4 jam', level: 'Ahli', content: 'Pelajari materi konstruksi lengkap dengan bimbingan AI mentor kami.', mentor: 'Ahli Teknik Bangunan Gedung' };

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function getModule(id: string) {
  return bimtekModules[id] || defaultModule;
}

export default function BimtekDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const currentModule = getModule(resolvedParams.id);
  
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`bimtek-lessons-${resolvedParams.id}`);
    if (saved) {
      try {
        setCompletedLessons(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
    setIsInitialized(true);
  }, [resolvedParams.id]);

  useEffect(() => {
    if (isInitialized) {
      setMessages([
        { id: '1', role: 'assistant', content: `Halo! Saya ${currentModule.mentor}, mentor AI Anda untuk modul "${currentModule.title}". Saya siap membantu Anda memahami materi ini. Silakan bertanya tentang:` }
      ]);
    }
  }, [isInitialized, currentModule]);

  const toggleLessonComplete = (lesson: string) => {
    const newCompleted = completedLessons.includes(lesson)
      ? completedLessons.filter(l => l !== lesson)
      : [...completedLessons, lesson];
    
    setCompletedLessons(newCompleted);
    localStorage.setItem(`bimtek-lessons-${resolvedParams.id}`, JSON.stringify(newCompleted));
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    setTimeout(() => {
      const responses = [
        `Berdasarkan materi "${currentModule.title}", ${currentModule.content}. Ada bagian spesifik yang ingin Anda tanyakan?`,
        `Pertanyaan bagus! Untuk topik "${currentModule.title}" dengan kategori ${currentModule.category}, point penting adalah ${currentModule.content}. Apa yang ingin Anda eksplorasi lebih dalam?`,
        `Sebagai ${currentModule.mentor}, saya bicara tentang modul ini: ${currentModule.content}. Apakah Anda ingin mencoba quiz atau lanjut ke materi berikutnya?`,
        `Modul ini bernilai ${currentModule.pkb} PKB dan membutuhkan waktu sekitar ${currentModule.duration}. Dijelaskan: ${currentModule.content}. Ada yang tidak jelas?`,
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const assistantMsg: Message = { id: `asst-${Date.now()}`, role: 'assistant', content: randomResponse };
      setMessages(prev => [...prev, assistantMsg]);
    }, 500);
  };

  const lessons = [
    'Pengenalan Materi',
    'Teori dan Konsep Dasar',
    'Studi Kasus',
    'Praktik dan Aplikasi',
    'Standar dan Regulasi',
    'Quiz dan Evaluasi',
  ];

  const progress = (completedLessons.length / lessons.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-amber-200 mb-2">
            <Link href="/bimtek" className="hover:text-white">← BIMTEK</Link>
            <span>•</span>
            <span>{currentModule.category}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{currentModule.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">⏱️ {currentModule.duration}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">📊 Level: {currentModule.level}</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">⭐ +{currentModule.pkb} PKB</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Progress Modul</h2>
              <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-500">{completedLessons.length} dari {lessons.length} lesson selesai</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Materi Pembelajaran</h2>
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <div
                    key={lesson}
                    onClick={() => toggleLessonComplete(lesson)}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                      completedLessons.includes(lesson)
                        ? 'bg-green-50 border-2 border-green-300'
                        : 'bg-slate-50 border-2 border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        completedLessons.includes(lesson)
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {completedLessons.includes(lesson) ? '✓' : '○'}
                      </span>
                      <span className="font-medium text-slate-800">{lesson}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Deskripsi Modul</h2>
              <p className="text-slate-600 leading-relaxed">{currentModule.content}</p>
              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">🎯 Target Jenjang</h3>
                <p className="text-amber-700">Modul ini dirancang untuk {currentModule.level} di bidang {currentModule.category}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🤖</span>
                <div>
                  <h3 className="font-semibold">AI Mentor</h3>
                  <p className="text-slate-400 text-sm">{currentModule.mentor}</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Tanya apapun tentang materi ini. AI mentor siap membantu!
              </p>
              <button
                onClick={() => setChatOpen(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all"
              >
                💬 Mulai Belajar
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-3">Info Sertifikasi</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">PKB Points</span>
                  <span className="font-semibold text-amber-600">+{currentModule.pkb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Level</span>
                  <span className="font-semibold">{currentModule.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Durasi</span>
                  <span className="font-semibold">{currentModule.duration}</span>
                </div>
              </div>
            </div>

            <Link
              href="/quiz"
              className="block bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center"
            >
              <span className="text-3xl mb-2 block">✍️</span>
              <h3 className="font-semibold">Ikuti Quiz</h3>
              <p className="text-green-100 text-sm">Test pemahaman Anda</p>
            </Link>
          </div>
        </div>
      </div>

      {chatOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-[450px] h-[80vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl flex flex-col">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold">{currentModule.mentor}</h3>
                  <p className="text-xs text-slate-400">AI Mentor • Online</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white hover:text-slate-300">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-white rounded-br-md'
                        : 'bg-slate-100 text-slate-800 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Tanya tentang materi..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
