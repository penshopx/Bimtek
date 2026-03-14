'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIMentorProps {
  moduleId: string;
  moduleTitle: string;
  moduleCategory: string;
  mentorName: string;
}

const mentorResponses: Record<string, Record<string, string>> = {
  'default': {
    'halo': 'Halo! Saya mentor AI Anda. Saya siap membantu Anda memahami materi modul ini. Silakan bertanya apapun!',
    'apa': 'Pertanyaan yang bagus! Mari kita diskusikan lebih lanjut.',
    'sulit': 'Ini memang materi yang kompleks. Mari saya jelaskan dengan lebih sederhana.',
    'contoh': 'Tentu, ini contoh yang baik untuk dipahami.',
    'latihan': 'Praktek adalah cara terbaik untuk memahami materi ini.',
  },
  'sipil': {
    'fondasi': 'Fondasi adalah elemen struktural yang meneruskan beban bangunan ke tanah. Ada dua jenis: shallow foundation (telapak, footings) dan deep foundation (tiang pancang, bored pile).',
    'beton': 'Beton bertulang adalah kombinasi beton dan baja tulangan. Beton menahan tekan, tulangan menahan tarik. Desain sesuai SNI 2847:2019.',
    'baja': 'Struktur baja memiliki keunggulan kekuatan tinggi, ductility baik, dan construction speed tinggi. Sambungan sangat penting.',
    'kolom': 'Kolom adalah elemen vertikal yang meneruskan beban ke fondasi. Desain harus mempertimbangkan slenderness ratio dan effective length.',
    'balok': 'Balok meneruskan beban lantai ke kolom. Desain melibatkan momen, geser, dan defleksi.',
    'geser': 'Geser (shear) terjadi karena gaya lateral. Desain tulangan geser (stirrups) sangat penting untuk kapasitas.',
    'tulangan': 'Tulangan harus memiliki adequate development length dan splice sesuai ketentuan SNI.',
  },
  'k3': {
    'k3': 'Keselamatan dan Kesehatan Kerja (K3) sangat penting di proyek konstruksi. Identifikasi hazard dan controls adalah kunci.',
    'apd': 'Alat Pelindung Diri (APD) wajib digunakan: helm, safety shoes, vest, gloves, dan harness untuk ketinggian.',
    'hazard': 'Hazard di konstruksi: jatuh, tertimpa, tersengat listrik, dan tertimpa material. Control melalui engineering, admin, dan PPE.',
    'izin': 'Izin kerja (work permit) diperlukan untuk pekerjaan berbahaya: hot work, confined space, electrical, dan work at height.',
    'accident': 'Laporan kecelakaan harus segera dibuat dengan metode Root Cause Analysis untuk mencegah terulang.',
  },
  'manajemen': {
    'manajemen': 'Manajemen proyek meliputi: initiation, planning, execution, monitoring, dan closing.',
    'schedule': 'Schedule dibuat dengan metode CPM atau PDM. Critical path menentukan durasi proyek.',
    'biaya': 'Cost control meliputi: budget, earned value analysis, dan forecasting.',
    'quality': 'Quality assurance dan quality control memastikan deliverable sesuai standar.',
    'risiko': 'Risk management: identification, analysis, response planning, dan monitoring.',
  },
  'elektrikal': {
    'listrik': 'Instalasi listrik gedung harus sesuai PUIL (Persyaratan Umum Instalasi Listrik).',
    'distribution': 'Sistem distribusi listrik gedung: MDP, MCC, panel distribusi, dan circuit breaker.',
    ' grounding': 'Grounding/arde penting untuk safety dan proteksi equipment.',
    'hvac': 'HVAC (Heating, Ventilation, Air Conditioning) untuk comfort dan indoor air quality.',
  },
};

function getMentorResponse(message: string, moduleCategory: string): string {
  const lowerMsg = message.toLowerCase();
  
  const category = moduleCategory.toLowerCase().includes('sipil') ? 'sipil' :
                  moduleCategory.toLowerCase().includes('k3') ? 'k3' :
                  moduleCategory.toLowerCase().includes('manajemen') ? 'manajemen' :
                  moduleCategory.toLowerCase().includes('elektrikal') || moduleCategory.toLowerCase().includes('mekanikal') ? 'elektrikal' : 'default';
  
  const responses = mentorResponses[category] || mentorResponses['default'];
  
  for (const [key, response] of Object.entries(responses)) {
    if (lowerMsg.includes(key)) {
      return response;
    }
  }
  
  const defaultResponses = [
    `Pertanyaan yang bagus tentang "${message}". Ini adalah topik penting dalam ${moduleCategory}.`,
    `Saya memahami pertanyaan Anda. Mari kita bahas lebih dalam tentang aspek praktisnya.`,
    `Baik, izinkan saya menjelaskan konsep ini dengan detail.`,
    `Ini materi yang bagus untuk dipahami. Mari kita praktikkan bersama.`,
    `Pertanyaan yang tepat! Di industri konstruksi, pemahaman ini sangat penting untuk kualitas dan safety.`,
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)] + ` Untuk ${moduleCategory}, ada beberapa poin penting yang perlu Anda pahami:`;
}

export function AIMentor({ moduleId, moduleTitle, moduleCategory, mentorName }: AIMentorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: '1', role: 'assistant', content: `Halo! Saya ${mentorName}, mentor AI Anda untuk modul "${moduleTitle}". 

Saya siap membantu Anda dengan:
• Penjelasan materi ${moduleCategory}
• Jawaban pertanyaan teknis
• Contoh perhitungan
• Tips praktis di lapangan

Apa yang ingin Anda tanyakan?` }
      ]);
    }
  }, [isOpen, messages.length, moduleTitle, moduleCategory, mentorName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getMentorResponse(input, moduleCategory);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
  };

  const quickQuestions = [
    'Apa itu fondasi?',
    'Cara menghitung beton?',
    'Tips safety?',
    'Contoh RAB?',
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform z-40"
        title="AI Mentor"
      >
        🤖
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-50">
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <div className="font-semibold text-white">{mentorName}</div>
                  <div className="text-xs text-amber-100">AI Mentor • Online</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-amber-200">
                ✕
              </button>
            </div>
            <div className="mt-2 text-xs text-amber-100">
              {moduleTitle}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 ${
                  msg.role === 'user' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); }}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900 text-xs rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu..."
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white rounded-lg text-sm"
              >
                Kirim
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
