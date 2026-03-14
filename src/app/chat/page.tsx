'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const experts = [
  { id: 'sipil', name: 'Ahli Teknik Sipil', icon: '🏗️', description: 'Fondasi, struktur, beton, baja', color: 'bg-blue-500' },
  { id: 'arsitek', name: 'Arsitek & Interior', icon: '🏛️', description: 'Desain, interior, landscape', color: 'bg-purple-500' },
  { id: 'mekanikal', name: 'Teknik Mekanikal', icon: '⚙️', description: 'HVAC, plumbing, fire protection', color: 'bg-cyan-500' },
  { id: 'elektrikal', name: 'Teknik Elektrikal', icon: '⚡', description: 'Listrik, distribusi, generator', color: 'bg-yellow-500' },
  { id: 'k3', name: 'K3 Konstruksi', icon: '🦺', description: 'Keselamatan, kesehatan kerja', color: 'bg-red-500' },
  { id: 'proyek', name: 'Manajemen Proyek', icon: '📊', scope: 'Manajemen', description: 'Schedule, cost, quality', color: 'bg-green-500' },
  { id: 'sertifikasi', name: 'Sertifikasi & Regulasi', icon: '📜', description: 'SKK, BNSP, perizinan', color: 'bg-indigo-500' },
  { id: 'lingkungan', name: 'Tata Lingkungan', icon: '🌿', description: 'AMDAL, waste management', color: 'bg-emerald-500' },
];

const toolboxes: Record<string, { name: string; icon: string }[]> = {
  sipil: [
    { name: 'Kalkulator Beton', icon: '🧱' },
    { name: 'Desain Fondasi', icon: '🏗️' },
    { name: 'Analisis Beban', icon: '⚖️' },
  ],
  arsitek: [
    { name: 'Space Planner', icon: '📐' },
    { name: 'Material Selector', icon: '🎨' },
    { name: 'Lighting Calc', icon: '💡' },
  ],
  mekanikal: [
    { name: 'HVAC Sizing', icon: '❄️' },
    { name: 'Plumbing Calc', icon: '🚿' },
    { name: 'Fire System', icon: '🔥' },
  ],
  elektrikal: [
    { name: 'Load Calculator', icon: '⚡' },
    { name: 'Cable Sizing', icon: '🔌' },
    { name: 'Generator Sizing', icon: '🔋' },
  ],
  k3: [
    { name: 'Risk Assessment', icon: '⚠️' },
    { name: 'Inspection Checklist', icon: '📋' },
    { name: 'Accident Report', icon: '📝' },
  ],
  proyek: [
    { name: 'Schedule Maker', icon: '📅' },
    { name: 'Budget Tracker', icon: '💰' },
    { name: 'Progress Report', icon: '📈' },
  ],
  sertifikasi: [
    { name: 'Cek Syarat SKK', icon: '✅' },
    { name: 'LSP Directory', icon: '📂' },
    { name: 'Requirement Checker', icon: '🔍' },
  ],
  lingkungan: [
    { name: 'AMDAL Guide', icon: '📜' },
    { name: 'Waste Calculator', icon: '🗑️' },
    { name: 'Impact Assessment', icon: '🌍' },
  ],
};

const faqs = [
  { q: 'Bagaimana cara mendapatkan SKK?', a: 'Anda perlu mengajukan sertifikasi ke LSP terakreditasi, mengikuti asesmen kompetensi, dan memenuhi persyaratan pendidikan & pengalaman.' },
  { q: 'Berapa lama proses sertifikasi?', a: 'Biasanya 2-4 minggu setelah pengajuan, tergantung kelengkapan dokumen dan jadwal asesmen.' },
  { q: 'Apa bedanya SKK dengan ijazah?', a: 'SKK adalah bukti kompetensi kerja yang diakui BNP, sedangkan ijazah adalah bukti pendidikan formal.' },
  { q: 'Bagaimana cara naik level SKK?', a: 'Anda perlu mengikuti pelatihan tambahan, menambah pengalaman kerja, dan mengajukan升级.' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Halo! Saya AI Assistant BimtekKita. Saya siap membantu Anda dengan:' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showFAQ, setShowFAQ] = useState(true);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    setTimeout(() => {
      let response = '';
      const expert = selectedExpert ? experts.find(e => e.id === selectedExpert) : null;
      
      if (inputMessage.toLowerCase().includes('skk') || inputMessage.toLowerCase().includes('sertifikasi')) {
        response = 'Untuk pertanyaan tentang SKK dan sertifikasi, saya sarankan berbicara dengan Expert Sertifikasi kami. Mereka dapat membantu Anda dengan: \n\n• Persyaratan SKK per level\n• Proses pengajuan ke LSP\n• Dokumen yang diperlukan\n• Estimasi biaya\n\nSilakan pilih "Sertifikasi & Regulasi" dari expert di atas.';
      } else if (inputMessage.toLowerCase().includes('struktur') || inputMessage.toLowerCase().includes('beton') || inputMessage.toLowerCase().includes('fondasi')) {
        response = expert ? `Sebagai ${expert.name}, saya dapat membantu Anda dengan ${expert.description}. ${expert.id === 'sipil' ? 'Silakan gunakan toolbox untuk kalkulasi.' : ''} Apa spesifik yang ingin Anda tanyakan?` : 'Untuk pertanyaan tentang struktur, beton, atau fondasi, saya sarankan memilih Expert "Ahli Teknik Sipil" di atas untuk hasil yang lebih optimal.';
      } else if (inputMessage.toLowerCase().includes('k3') || inputMessage.toLowerCase().includes('keselamatan') || inputMessage.toLowerCase().includes('safety')) {
        response = 'Expert K3 kami siap membantu dengan masalah keselamatan kerja konstruksi. Silakan pilih "K3 Konstruksi" dari expert di atas, atau saya bisa langsung membantu dengan informasi umum K3.';
      } else {
        response = expert 
          ? `Terima kasih atas pertanyaan Anda! Sebagai ${expert.name}, saya akan membantu dengan ${expert.description}. ${toolboxes[expert.id] ? 'Anda juga bisa menggunakan toolbox yang tersedia.' : ''} Silakan jelaskan lebih detail.`
          : 'Terima kasih! Saya AI Assistant BimtekKita. Silakan pilih expert di atas untuk mendapat bantuan yang lebih spesifik, atau tanya langsung tentang:\n\n• Proses sertifikasi\n• Modul BIMTEK\n• Persyaratan SKK\n• Kalkulator teknis';
      }
      
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMsg]);
    }, 500);
  };

  const handleExpertSelect = (expertId: string) => {
    const expert = experts.find(e => e.id === expertId);
    const userMsg = { id: `user-${expertId}`, role: 'user' as const, content: `Pilih expert: ${expert?.name}` };
    const asstMsg = { id: `asst-${expertId}`, role: 'assistant' as const, content: `Baik! Saya ${expert?.name} akan membantu Anda dengan ${expert?.description}. ${toolboxes[expertId] ? 'Anda dapat menggunakan toolbox di bawah untuk akses cepat ke tools.' : ''} Ada yang bisa saya bantu?` };
    setMessages(prev => [...prev, userMsg, asstMsg]);
    setSelectedExpert(expertId);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">💬 AI Chat</h1>
          <p className="text-lg text-slate-600">
            AI Assistant dengan 8 expert agents & toolbox lengkap
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h3 className="font-semibold text-white">
                      {selectedExpert ? experts.find(e => e.id === selectedExpert)?.name : 'AI Orchestrator'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedExpert ? experts.find(e => e.id === selectedExpert)?.description : 'Pilih expert untuk dimulai'}
                    </p>
                  </div>
                </div>
                {selectedExpert && (
                  <button
                    onClick={() => setSelectedExpert(null)}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    Ubah Expert
                  </button>
                )}
              </div>

              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
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
                    placeholder="Tulis pertanyaan Anda..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600"
                  >
                    Kirim
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {!selectedExpert ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Pilih Expert</h3>
                <div className="space-y-2">
                  {experts.map((expert) => (
                    <button
                      key={expert.id}
                      onClick={() => handleExpertSelect(expert.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${expert.color} text-white hover:opacity-90`}
                    >
                      <span className="text-xl">{expert.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{expert.name}</div>
                        <div className="text-xs opacity-80">{expert.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Toolbox</h3>
                <div className="space-y-2">
                  {(toolboxes[selectedExpert] || []).map((tool, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
                    >
                      <span className="text-xl">{tool.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">FAQ Cepat</h3>
                <button
                  onClick={() => setShowFAQ(!showFAQ)}
                  className="text-slate-400"
                >
                  {showFAQ ? '▲' : '▼'}
                </button>
              </div>
              {showFAQ && (
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <div key={i} className="text-sm">
                      <div className="font-medium text-slate-700">{faq.q}</div>
                      <div className="text-slate-500 text-xs mt-1">{faq.a.substring(0, 80)}...</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-2">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/sertifikasi" className="block text-sm text-amber-700 hover:text-amber-900">📋 Cari Sertifikasi</Link>
                <Link href="/bimtek" className="block text-sm text-amber-700 hover:text-amber-900">🎓 BIMTEK Modules</Link>
                <Link href="/solver" className="block text-sm text-amber-700 hover:text-amber-900">🧮 Kalkulator</Link>
                <Link href="/tools" className="block text-sm text-amber-700 hover:text-amber-900">🔧 Tools RAB</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
