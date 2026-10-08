'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProfileToolContext from '@/components/ProfileToolContext';
import { jabatanName } from '@/lib/professional-profile';

const agents = [
  { id: 'kelayakan', icon: '🔍', name: 'Cek Kelayakan', short: 'Kelayakan & Gap KKNI', color: 'blue',
    placeholder: 'Contoh: Saya S1 Teknik Sipil, 4 tahun pengalaman gedung. Apakah bisa ambil SKK Ahli Muda?' },
  { id: 'perpanjangan', icon: '♻️', name: 'Perpanjangan SKK', short: 'Surveillance & Re-sertifikasi', color: 'green',
    placeholder: 'Contoh: SKK saya terbit Januari 2022. Kapan harus surveillance dan kapan re-sertifikasi?' },
  { id: 'sbu', icon: '🔗', name: 'SKK–SBU Link', short: 'SKK untuk Izin BUJK', color: 'purple',
    placeholder: 'Contoh: Perusahaan kami kualifikasi Menengah. SKK apa yang wajib dimiliki personil?' },
  { id: 'dokumen', icon: '📄', name: 'Dokumen SKK', short: 'Checklist per Skema', color: 'amber',
    placeholder: 'Contoh: Saya mau daftar SKK Site Manager Gedung. Dokumen apa saja yang harus disiapkan?' },
  { id: 'jabatan', icon: '🎓', name: 'Jabatan & Skema', short: 'Pemetaan & Unit Kompetensi', color: 'cyan',
    placeholder: 'Contoh: Apa perbedaan Ahli Teknik Sipil dan Ahli Madya Teknik Sipil? Unit kompetensinya apa?' },
];

const colorMap: Record<string, { active: string; btn: string }> = {
  blue:   { active: 'bg-blue-500/20 border-blue-400 text-blue-300',   btn: 'bg-blue-500 hover:bg-blue-600' },
  green:  { active: 'bg-green-500/20 border-green-400 text-green-300', btn: 'bg-green-600 hover:bg-green-700' },
  purple: { active: 'bg-purple-500/20 border-purple-400 text-purple-300', btn: 'bg-purple-600 hover:bg-purple-700' },
  amber:  { active: 'bg-amber-500/20 border-amber-400 text-amber-300', btn: 'bg-amber-500 hover:bg-amber-600' },
  cyan:   { active: 'bg-cyan-500/20 border-cyan-400 text-cyan-300',   btn: 'bg-cyan-600 hover:bg-cyan-700' },
};

interface Msg { role: 'user' | 'assistant'; content: string; }

function SKKCoachChatInner() {
  const searchParams = useSearchParams();
  const initialAgent = searchParams.get('agent') ?? 'kelayakan';
  const target = searchParams.get('jabatan');
  const initialContext = searchParams.get('context') ?? (target
    ? `Saya ingin mengecek kelayakan untuk ${jabatanName(target)}.${searchParams.get('jenjang') ? ` Target jenjang: ${searchParams.get('jenjang')}.` : ''}${searchParams.get('timeline') ? ` Target tanggal persiapan: ${searchParams.get('timeline')}.` : ''}`
    : '');
  const [activeAgent, setActiveAgent] = useState(initialAgent);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(initialContext);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const agent = agents.find(a => a.id === activeAgent) ?? agents[0];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset chat when agent changes
  const switchAgent = (id: string) => {
    setActiveAgent(id);
    setMessages([]);
    setInput('');
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/skk-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, agent: activeAgent }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content ?? 'Maaf, tidak ada respons.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ AI tidak tersedia saat ini. Coba lagi.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-slate-700 px-4 py-3 flex items-center gap-3">
        <Link href="/skk-coach" className="text-slate-400 hover:text-white text-sm">← SKK Coach</Link>
        <div className="h-4 w-px bg-slate-700" />
        <span className="text-white font-semibold">{agent.icon} {agent.name}</span>
        <span className="text-slate-500 text-sm hidden sm:block">— {agent.short}</span>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-4">
        <ProfileToolContext onUseContext={context => setInput(context)} />
      </div>
      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full">
        {/* Agent sidebar */}
        <div className="hidden sm:flex flex-col w-56 border-r border-slate-700 py-4 gap-1 px-2 shrink-0">
          <p className="text-slate-500 text-xs px-2 mb-2 font-medium uppercase tracking-wide">Pilih Agen</p>
          {agents.map(a => (
            <button
              key={a.id}
              onClick={() => switchAgent(a.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                activeAgent === a.id
                  ? colorMap[a.color].active + ' border'
                  : 'border-transparent text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <span className="mr-2">{a.icon}</span>
              <span className="font-medium">{a.name}</span>
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile agent selector */}
          <div className="sm:hidden flex gap-2 overflow-x-auto p-3 border-b border-slate-700">
            {agents.map(a => (
              <button
                key={a.id}
                onClick={() => switchAgent(a.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  activeAgent === a.id
                    ? colorMap[a.color].active
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                {a.icon} {a.name}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">{agent.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{agent.name}</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">{agent.short}</p>
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 max-w-md mx-auto text-left">
                  <p className="text-slate-400 text-xs mb-1">Contoh pertanyaan:</p>
                  <p className="text-slate-300 text-sm italic">&quot;{agent.placeholder}&quot;</p>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm mr-2 shrink-0 mt-0.5">
                    {agent.icon}
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-700/80 text-slate-200'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm shrink-0">{agent.icon}</div>
                <div className="bg-slate-700/80 rounded-2xl px-4 py-3 flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={agent.placeholder}
                rows={2}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none resize-none placeholder:text-slate-500"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className={`px-5 rounded-xl text-white font-medium transition-colors disabled:opacity-40 ${colorMap[agent.color].btn}`}
              >
                Kirim
              </button>
            </div>
            <p className="text-slate-600 text-xs mt-2 text-center">
              Enter untuk kirim · Shift+Enter untuk baris baru
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SKKCoachChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Memuat...</div>}>
      <SKKCoachChatInner />
    </Suspense>
  );
}
