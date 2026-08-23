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
  { q: 'Dokumen apa saja yang wajib untuk uji kompetensi SKK?', a: 'Dokumen utama: FR.APL.01 (formulir permohonan), FR.APL.02 (asesmen mandiri), bukti pengalaman kerja (referensi proyek/foto), ijazah pendidikan, KTP, dan sertifikat pelatihan relevan. Setiap jabatan SKK bisa memiliki persyaratan tambahan.' },
  { q: 'Apa itu Asesmen Jarak Jauh (AJJ) dan bagaimana prosedurnya?', a: 'AJJ adalah metode uji kompetensi via video call yang diatur dalam SK DJBK No. 114/KPTS/DK/2024. Prosedur: (1) Pendaftaran ke LSP, (2) Verifikasi dokumen online, (3) Jadwal sesi video call dengan asesor, (4) Pelaksanaan asesmen real-time, (5) Keputusan kompetensi.' },
  { q: 'Apa perbedaan asesmen hardcopy, paperless, dan AJJ?', a: 'Hardcopy: tatap muka dengan formulir fisik. Paperless: tatap muka di lokasi LSP tapi semua formulir digital. AJJ: sepenuhnya online via video call, cocok untuk Asesi di luar kota LSP.' },
  { q: 'Berapa lama masa berlaku SKK dan bagaimana perpanjangannya?', a: 'SKK berlaku 5 tahun. Perpanjangan dilakukan melalui Pengembangan Keprofesian Berkelanjutan (PKB) dengan mengumpulkan poin PKB minimal sesuai kualifikasi, atau mengikuti asesmen ulang.' },
  { q: 'Bagaimana cara memilih jabatan SKK yang tepat untuk saya?', a: 'Jabatan SKK ditentukan oleh: (1) Bidang pekerjaan (Sipil, Mekanikal, Elektrikal, dll), (2) Jenis pekerjaan (Operator/Teknisi/Ahli), (3) Pengalaman kerja dan pendidikan. Gunakan fitur /sertifikasi untuk menelusuri 334+ jabatan SKK.' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isAIError?: boolean;
  isMessageTooLarge?: boolean;
  /** True when this bubble is a truncated version of an oversized message. */
  isMessageTruncated?: boolean;
}

function generateRuleBasedResponse(userInput: string, selectedExpert: string | null): string {
  const expert = selectedExpert ? experts.find(e => e.id === selectedExpert) : null;
  const lower = userInput.toLowerCase();

  if (lower.includes('skk') || lower.includes('sertifikasi')) {
    return 'Untuk pertanyaan tentang SKK dan sertifikasi, saya sarankan berbicara dengan Expert Sertifikasi kami. Mereka dapat membantu Anda dengan: \n\n• Persyaratan SKK per level\n• Proses pengajuan ke LSP\n• Dokumen yang diperlukan\n• Estimasi biaya\n\nSilakan pilih "Sertifikasi & Regulasi" dari expert di atas.';
  } else if (lower.includes('struktur') || lower.includes('beton') || lower.includes('fondasi')) {
    return expert
      ? `Sebagai ${expert.name}, saya dapat membantu Anda dengan ${expert.description}. ${expert.id === 'sipil' ? 'Silakan gunakan toolbox untuk kalkulasi.' : ''} Apa spesifik yang ingin Anda tanyakan?`
      : 'Untuk pertanyaan tentang struktur, beton, atau fondasi, saya sarankan memilih Expert "Ahli Teknik Sipil" di atas untuk hasil yang lebih optimal.';
  } else if (lower.includes('k3') || lower.includes('keselamatan') || lower.includes('safety')) {
    return 'Expert K3 kami siap membantu dengan masalah keselamatan kerja konstruksi. Silakan pilih "K3 Konstruksi" dari expert di atas, atau saya bisa langsung membantu dengan informasi umum K3.';
  } else {
    return expert
      ? `Terima kasih atas pertanyaan Anda! Sebagai ${expert.name}, saya akan membantu dengan ${expert.description}. ${toolboxes[expert.id] ? 'Anda juga bisa menggunakan toolbox yang tersedia.' : ''} Silakan jelaskan lebih detail.`
      : 'Terima kasih! Saya AI Assistant SiapSKK. Silakan pilih expert di atas untuk mendapat bantuan yang lebih spesifik, atau tanya langsung tentang:\n\n• Proses sertifikasi\n• Modul BIMTEK\n• Persyaratan SKK\n• Kalkulator teknis';
  }
}

export default function ChatPage() {
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Halo! Saya AI Assistant SiapSKK. Saya siap membantu Anda dengan:' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showFAQ, setShowFAQ] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());
  const [consecutiveAIErrors, setConsecutiveAIErrors] = useState(0);
  const [oversizedMessage, setOversizedMessage] = useState<string | null>(null);

  const dismissWarning = (id: string) => {
    setDismissedWarnings(prev => new Set(prev).add(id));
  };

  const generateResponse = async (
    userInput: string,
    currentExpert: string | null,
    currentMessages: Message[]
  ): Promise<{ content: string; isAIError: boolean; isMessageTooLarge?: boolean }> => {
    try {
      const expertContext = currentExpert ? experts.find(e => e.id === currentExpert) : null;

      const systemPrompt = expertContext
        ? `Anda adalah ${expertContext.name}, expert dalam ${expertContext.description}. Jawab dalam Bahasa Indonesia.`
        : 'Anda adalah AI Assistant SiapSKK, membantu profesional konstruksi Indonesia. Jawab dalam Bahasa Indonesia.';

      // Guard: warn the user if their message alone exceeds the context window.
      const { isMessageTooLargeForBudget } = await import('@/lib/ai/token-utils');
      if (isMessageTooLargeForBudget(userInput, systemPrompt, 8000, 1000)) {
        return {
          content:
            'Pesan Anda terlalu panjang untuk diproses AI dalam satu konteks. Coba pisahkan pesan menjadi bagian-bagian yang lebih pendek atau kurangi panjangnya.',
          isAIError: false,
          isMessageTooLarge: true,
        };
      }

      const rawHistory = currentMessages
        .filter(m => !m.isAIError)
        .map(m => ({ role: m.role, content: m.content }));

      const { trimHistoryByTokenBudget, estimateTokens } = await import('@/lib/ai/token-utils');
      // Reserve exactly as many tokens as the current user message needs (content + framing overhead).
      const userMessageTokens = estimateTokens(userInput) + 10;
      const history = trimHistoryByTokenBudget(rawHistory, systemPrompt, 8000, 1000, userMessageTokens);

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: userInput },
          ],
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty AI response');

      return { content, isAIError: false };
    } catch (err) {
      console.error('AI API error:', err);
      return { content: generateRuleBasedResponse(userInput, currentExpert), isAIError: true };
    }
  };

  const sendMessage = async () => {
    const text = inputMessage;
    if (!text.trim() || isProcessing) return;

    const historySnapshot = messages;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLastUserMessage(text);
    setIsProcessing(true);

    const { content, isAIError, isMessageTooLarge } = await generateResponse(text, selectedExpert, historySnapshot);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      isAIError,
      isMessageTooLarge,
    };
    setMessages(prev => [...prev, assistantMsg]);

    if (isMessageTooLarge) {
      // Restore the input so the user can edit rather than retype.
      setInputMessage(text);
      setOversizedMessage(text);
    } else {
      setOversizedMessage(null);
    }

    if (isAIError && !isMessageTooLarge) {
      setConsecutiveAIErrors(prev => prev + 1);
    } else {
      setConsecutiveAIErrors(0);
    }
    setIsProcessing(false);
  };

  const handleSendShortened = async () => {
    if (!oversizedMessage || isProcessing) return;
    setIsProcessing(true);

    const expertContext = selectedExpert ? experts.find(e => e.id === selectedExpert) : null;
    const systemPrompt = expertContext
      ? `Anda adalah ${expertContext.name}, expert dalam ${expertContext.description}. Jawab dalam Bahasa Indonesia.`
      : 'Anda adalah AI Assistant SiapSKK, membantu profesional konstruksi Indonesia. Jawab dalam Bahasa Indonesia.';

    const { truncateMessageToFit } = await import('@/lib/ai/token-utils');
    const truncated = truncateMessageToFit(oversizedMessage, systemPrompt, 8000, 1000);

    // Remove the isMessageTooLarge warning and the oversized user bubble.
    let cleaned = [...messages];
    const lastTooLargeIdx = cleaned.map(m => m.isMessageTooLarge).lastIndexOf(true);
    if (lastTooLargeIdx !== -1) cleaned.splice(lastTooLargeIdx, 1);
    const lastUserIdx = cleaned.map(m => m.role).lastIndexOf('user');
    if (lastUserIdx !== -1) cleaned.splice(lastUserIdx, 1);

    const truncatedUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: truncated,
      isMessageTruncated: true,
    };
    setMessages([...cleaned, truncatedUserMsg]);
    setOversizedMessage(null);
    setInputMessage('');
    setLastUserMessage(truncated);

    const { content, isAIError } = await generateResponse(truncated, selectedExpert, cleaned);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      isAIError,
      isMessageTruncated: true,
    };
    setMessages(prev => [...prev, assistantMsg]);

    if (isAIError) {
      setConsecutiveAIErrors(prev => prev + 1);
    } else {
      setConsecutiveAIErrors(0);
    }
    setIsProcessing(false);
  };

  const handleRetry = async () => {
    if (!lastUserMessage || isProcessing) return;

    // Compute the cleaned history (remove last error + last user) from current state snapshot.
    const copy = [...messages];
    const lastAiErrorIdx = copy.map(m => m.isAIError).lastIndexOf(true);
    if (lastAiErrorIdx !== -1) copy.splice(lastAiErrorIdx, 1);
    const lastUserIdx = copy.map(m => m.role).lastIndexOf('user');
    if (lastUserIdx !== -1) copy.splice(lastUserIdx, 1);
    const cleanedMessages = copy;

    // Reconstruct visible list: cleaned history + the retried user message.
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: lastUserMessage };
    setMessages([...cleanedMessages, userMsg]);

    setIsProcessing(true);
    const { content, isAIError, isMessageTooLarge } = await generateResponse(lastUserMessage, selectedExpert, cleanedMessages);
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      isAIError,
      isMessageTooLarge,
    };
    setMessages(prev => [...prev, assistantMsg]);
    if (assistantMsg.isAIError && !assistantMsg.isMessageTooLarge) {
      setConsecutiveAIErrors(prev => prev + 1);
    } else {
      setConsecutiveAIErrors(0);
    }
    setIsProcessing(false);
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

              {consecutiveAIErrors >= 2 && (
                <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-amber-700 text-sm">
                  <span>⚠️</span>
                  <span>AI sedang tidak tersedia. Respons saat ini menggunakan mode otomatis.</span>
                  <button
                    onClick={handleRetry}
                    disabled={isProcessing}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔄 Coba Lagi
                  </button>
                </div>
              )}

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
                          : msg.isMessageTooLarge
                          ? 'bg-slate-100 text-slate-800 border border-red-400/60'
                          : msg.isAIError
                          ? 'bg-slate-100 text-slate-800 border border-amber-500/50'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {/* Truncation badge in user bubble */}
                      {msg.role === 'user' && msg.isMessageTruncated && (
                        <div className="flex items-center gap-1 mb-1.5 text-amber-200 text-xs opacity-90">
                          <span>✂️</span>
                          <span>diperpendek</span>
                        </div>
                      )}
                      {/* Truncation header in assistant response */}
                      {msg.role === 'assistant' && msg.isMessageTruncated && !msg.isAIError && (
                        <div className="flex items-center gap-2 text-amber-600 text-xs mb-2 font-medium">
                          <span>✂️</span>
                          <span>Merespons versi yang diperpendek</span>
                        </div>
                      )}
                      {msg.isMessageTooLarge && !dismissedWarnings.has(msg.id) && (
                        <div className="flex items-center gap-2 text-red-500 text-xs mb-2 font-medium">
                          <span>✂️</span>
                          <span>Pesan terlalu panjang untuk konteks AI</span>
                          <button
                            onClick={() => dismissWarning(msg.id)}
                            className="ml-auto text-red-400 hover:text-red-600 leading-none"
                            aria-label="Tutup peringatan"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      {msg.isAIError && !msg.isMessageTooLarge && !dismissedWarnings.has(msg.id) && (
                        <div className="flex items-center gap-2 text-amber-600 text-xs mb-2">
                          <span>⚠️</span>
                          <span>AI sedang tidak tersedia — menggunakan respons otomatis</span>
                          <button
                            onClick={() => dismissWarning(msg.id)}
                            className="ml-auto text-amber-400 hover:text-amber-600 leading-none"
                            aria-label="Tutup peringatan"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                      {msg.isMessageTooLarge && (
                        <button
                          onClick={handleSendShortened}
                          disabled={isProcessing}
                          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-600 text-xs rounded-lg transition-colors"
                        >
                          <span>✂️</span>
                          <span>Kirim versi yang diperpendek</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {messages[messages.length - 1]?.isAIError && !messages[messages.length - 1]?.isMessageTooLarge && (
                  <div className="flex justify-start">
                    <button
                      onClick={handleRetry}
                      disabled={isProcessing}
                      className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      🔄 Coba lagi dengan AI
                    </button>
                  </div>
                )}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-800 p-3 rounded-2xl">
                      <p className="text-sm">⏳ Sedang memproses...</p>
                    </div>
                  </div>
                )}
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
                    disabled={isProcessing}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
