'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useAgenticAI } from '@/components/AgenticAIProvider';

const quickActions = [
  { label: '📋 Syarat Dokumen SKK', action: 'dokumen' },
  { label: '🎯 Pilih Jabatan SKK', action: 'jabatan' },
  { label: '📡 Prosedur AJJ', action: 'ajj' },
  { label: '📅 Event BIMTEK', action: 'offline' },
  { label: '✍️ Latihan Soal', action: 'quiz' },
  { label: '💬 Expert AI', action: 'expert' },
];

export default function AgenticChatPage() {
  const { messages, isProcessing, processMessage, retryLastMessage, appFeatures, clearMessages, oversizedMessage, sendShortenedMessage } = useAgenticAI();
  const [input, setInput] = useState('');
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore the original text to the input when a too-large message is detected,
  // so the user can edit rather than retype.
  useEffect(() => {
    if (oversizedMessage) {
      setInput(oversizedMessage);
    }
  }, [oversizedMessage]);

  // Count consecutive trailing AI-error assistant messages (ignoring user messages).
  const consecutiveAIErrors = useMemo(() => {
    let count = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'user') continue;
      if (msg.role === 'assistant' && msg.isAIError && !msg.isMessageTooLarge) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [messages]);

  const dismissWarning = (id: string) => {
    setDismissedWarnings(prev => new Set(prev).add(id));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    const text = input;
    setInput('');
    await processMessage(text);
  };

  const handleQuickAction = async (action: string) => {
    const prompts: Record<string, string> = {
      dokumen: 'Dokumen apa saja yang wajib disiapkan untuk uji kompetensi SKK? Jelaskan FR.APL.01 dan FR.APL.02.',
      jabatan: 'Bagaimana cara memilih jabatan SKK yang tepat untuk saya di bidang Sipil atau Manajemen Pelaksanaan?',
      ajj: 'Jelaskan prosedur Asesmen Jarak Jauh (AJJ) untuk uji kompetensi SKK dari awal hingga selesai.',
      offline: 'Tampilkan event BIMTEK offline yang tersedia.',
      quiz: 'Apa saja latihan soal yang tersedia untuk persiapan uji kompetensi SKK?',
      expert: 'Siapa saja expert AI yang tersedia dan bagaimana cara menggunakannya?',
    };
    await processMessage(prompts[action] || action);
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            🤖 Agentic AI SiapSKK
          </h1>
          <p className="text-slate-400">
            Asisten AI Pintar - Tahu segalanya tentang aplikasi ini
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex gap-2 overflow-x-auto">
            {quickActions.map((action) => (
              <button
                key={action.action}
                onClick={() => handleQuickAction(action.action)}
                className="px-4 py-2 bg-slate-700 hover:bg-amber-500 text-white text-sm rounded-lg whitespace-nowrap transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>

          {consecutiveAIErrors >= 2 && (
            <div className="px-4 py-2.5 bg-amber-500/15 border-b border-amber-500/30 flex items-center gap-2 text-amber-400 text-sm">
              <span>⚠️</span>
              <span>AI sedang tidak tersedia. Respons saat ini menggunakan mode otomatis.</span>
              <button
                onClick={retryLastMessage}
                disabled={isProcessing}
                className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-medium text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Coba Lagi
              </button>
            </div>
          )}

          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-lg">Halo! Saya Agentic AI SiapSKK</p>
                <p className="text-sm mt-2">Tanyakan apa saja tentang aplikasi ini!</p>
                <div className="mt-6 grid grid-cols-2 gap-2 text-left max-w-md mx-auto">
                  <button onClick={() => handleQuickAction('dokumen')} className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left text-sm">
                    <span className="text-amber-400">📋</span> Dokumen wajib SKK?
                  </button>
                  <button onClick={() => handleQuickAction('jabatan')} className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left text-sm">
                    <span className="text-amber-400">🎯</span> Pilih jabatan SKK?
                  </button>
                  <button onClick={() => handleQuickAction('ajj')} className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left text-sm">
                    <span className="text-amber-400">📡</span> Prosedur AJJ?
                  </button>
                  <button onClick={() => handleQuickAction('expert')} className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left text-sm">
                    <span className="text-amber-400">💬</span> Expert AI apa saja?
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">🤖</span>
                      <span className="text-slate-400 text-sm">Agentic AI</span>
                    </div>
                  )}
                  <div className={`rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-amber-500 text-white' 
                      : msg.isMessageTooLarge
                        ? 'bg-slate-700/50 text-slate-100 border border-red-500/60'
                        : msg.isAIError
                          ? 'bg-slate-700/50 text-slate-100 border border-amber-500/50'
                          : 'bg-slate-700/50 text-slate-100 border border-slate-600'
                  }`}>
                    {/* Truncation badge in user bubble */}
                    {msg.role === 'user' && msg.isMessageTruncated && (
                      <div className="flex items-center gap-1 mb-1.5 text-amber-200 text-xs opacity-90">
                        <span>✂️</span>
                        <span>diperpendek</span>
                      </div>
                    )}
                    {/* Truncation header in assistant response */}
                    {msg.role === 'assistant' && msg.isMessageTruncated && !msg.isAIError && (
                      <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-medium">
                        <span>✂️</span>
                        <span>Merespons versi yang diperpendek</span>
                      </div>
                    )}
                    {msg.isMessageTooLarge && (
                      <div className="flex items-center gap-2 mb-2 text-red-400 text-xs font-medium">
                        <span>✂️</span>
                        <span>Pesan terlalu panjang untuk konteks AI</span>
                      </div>
                    )}
                    {msg.isAIError && !msg.isMessageTooLarge && !dismissedWarnings.has(msg.id) && (
                      <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-medium">
                        <span>⚠️</span>
                        <span>AI sedang tidak tersedia — menggunakan respons otomatis</span>
                        <button
                          onClick={() => dismissWarning(msg.id)}
                          className="ml-auto text-amber-300 hover:text-amber-100 leading-none"
                          aria-label="Tutup peringatan"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.isMessageTooLarge && (
                      <button
                        onClick={() => { sendShortenedMessage(); setInput(''); }}
                        disabled={isProcessing}
                        className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 disabled:opacity-50 text-red-300 text-xs rounded-lg transition-colors"
                      >
                        <span>✂️</span>
                        <span>Kirim versi yang diperpendek</span>
                      </button>
                    )}
                    {msg.isAIError && !msg.isMessageTooLarge && (
                      <button
                        onClick={() => retryLastMessage()}
                        disabled={isProcessing}
                        className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/40 disabled:opacity-50 text-amber-400 text-xs rounded-lg transition-colors"
                      >
                        <span>🔄</span>
                        <span>Coba lagi dengan AI</span>
                      </button>
                    )}
                  </div>
                  
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.suggestions.map((suggestion) => {
                        const title = suggestion.title;
                        const isNav = suggestion.type === 'navigation' || title.includes('Ke ') || title.includes('BIMTEK') || title.includes('Quiz') || title.includes('Dashboard') || title.includes('Sertifikasi') || title.includes('Chat') || title.includes('Event') || title.includes('Mulai') || title.includes('Panduan') || title.includes('Cari') || title.includes('Jelajahi');
                        const paths: Record<string, string> = {
                          'Ke BIMTEK': '/bimtek', 'BIMTEK': '/bimtek', 'Jelajahi BIMTEK': '/bimtek',
                          'Ke Quiz': '/quiz', 'Quiz': '/quiz', 'Mulai Quiz': '/quiz',
                          'Ke Dashboard': '/dashboard', 'Dashboard': '/dashboard',
                          'Ke Solver': '/solver',
                          'Ke Tools': '/tools',
                          'Ke Profile': '/profile',
                          'Ke Chat': '/chat', 'Expert Chat': '/chat',
                          'Ke Sertifikasi': '/sertifikasi', 'Sertifikasi': '/sertifikasi', 'Cari Sertifikasi': '/sertifikasi',
                          'Ke Matrix': '/matrix',
                          'Ke Certify': '/certify', 'Panduan Certify': '/certify',
                          'Ke Offline': '/offline', 'Event Offline': '/offline', 'Lihat Event': '/offline', 'Buat Event': '/offline/create',
                          'Ke Achievements': '/achievements',
                          'Ke Calendar': '/calendar',
                          'Ke Settings': '/settings',
                          'Ke Bookmarks': '/bookmarks',
                          'Ke Activity': '/activity',
                          'Ke Knowledge': '/knowledge-base',
                        };
                        const path = paths[title];
                        return (
                        <button
                          key={suggestion.id}
                          onClick={() => {
                            if (isNav && path) {
                              window.location.href = path;
                            } else if (suggestion.action) {
                              suggestion.action();
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-600 hover:bg-amber-500 text-white text-xs rounded-full transition-colors flex items-center gap-1"
                        >
                          {suggestion.type === 'navigation' && <span>→</span>}
                          {suggestion.type === 'information' && <span>ℹ️</span>}
                          {suggestion.title}
                        </button>
                      )})}
                    </div>
                  )}
                  
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="mt-2 text-xs text-slate-500">
                      Tools used: {msg.toolsUsed.join(', ')}
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-500 mt-1">
                    {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan apapun tentang aplikasi ini..."
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-white font-medium rounded-xl transition-colors"
              >
                Kirim
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              💡 Coba: &quot;Bawa saya ke BIMTEK&quot; atau &quot;Apa saja fitur di aplikasi ini?&quot;
            </p>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {appFeatures.slice(0, 8).map((feature) => (
            <button
              key={feature.id}
              onClick={() => navigateTo(feature.path)}
              className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-xl border border-slate-700 hover:border-amber-500 transition-colors text-left"
            >
              <span className="text-xl">{feature.icon}</span>
              <div className="text-sm font-medium text-white mt-1">{feature.name}</div>
              <div className="text-xs text-slate-400 line-clamp-1">{feature.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
