'use client';

import { useState, useRef, useEffect } from 'react';
import { useAgenticAI } from '@/components/AgenticAIProvider';

const quickActions = [
  { label: '🎓 BIMTEK', action: 'bimtek' },
  { label: '✍️ Quiz', action: 'quiz' },
  { label: '📋 Sertifikasi', action: 'sertifikasi' },
  { label: '📍 Event Offline', action: 'offline' },
  { label: '🧮 Kalkulator', action: 'solver' },
  { label: '💬 Expert Chat', action: 'expert' },
];

export default function AgenticChatPage() {
  const { messages, isProcessing, processMessage, appFeatures, clearMessages } = useAgenticAI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    await processMessage(input);
    setInput('');
  };

  const handleQuickAction = async (action: string) => {
    const prompts: Record<string, string> = {
      bimtek: 'Apa itu BIMTEK?',
      quiz: 'Jelaskan tentang Quiz',
      sertifikasi: 'Bagaimana cara sertifikasi?',
      offline: 'Apa itu Bimtek Offline?',
      solver: 'Apa saja kalkulator yang tersedia?',
      expert: 'Siapa saja expert yang tersedia?',
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
            🤖 Agentic AI BimtekKita
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

          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-lg">Halo! Saya Agentic AI BimtekKita</p>
                <p className="text-sm mt-2">Tanyakan apa saja tentang aplikasi ini!</p>
                <div className="mt-6 grid grid-cols-2 gap-2 text-left max-w-md mx-auto">
                  <button onClick={() => handleQuickAction('bimtek')} className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left text-sm">
                    <span className="text-amber-400">🎓</span> Apa itu BIMTEK?
                  </button>
                  <button onClick={() => handleQuickAction('sertifikasi')} className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left text-sm">
                    <span className="text-amber-400">📋</span> Cara sertifikasi?
                  </button>
                  <button onClick={() => handleQuickAction('solver')} className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left text-sm">
                    <span className="text-amber-400">🧮</span> Kalkulator apa saja?
                  </button>
                  <button onClick={() => handleQuickAction('expert')} className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left text-sm">
                    <span className="text-amber-400">💬</span> Siapa expert?
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
                      : 'bg-slate-700/50 text-slate-100 border border-slate-600'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
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
              💡 Coba: "Bawa saya ke BIMTEK" atau "Apa saja fitur di aplikasi ini?"
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
