'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface CustomChatbot {
  id: string;
  name: string;
  description: string;
  type: 'mentoring' | 'problem-solving' | 'project-consultant';
  systemPrompt: string;
  modules: string[];
  createdAt: string;
}

const chatbotTypes = [
  { id: 'mentoring', name: '🎓 Mentoring', description: 'Membantu belajar dari modul tertentu', icon: '🎓' },
  { id: 'problem-solving', name: '🔧 Problem Solving', description: 'Memecahkan masalah teknis konstruksi', icon: '🔧' },
  { id: 'project-consultant', name: '🏗️ Project Consultant', description: 'Konsultan untuk proyek tertentu', icon: '🏗️' },
];

const moduleOptions = [
  'K3 Konstruksi', 'Struktur Beton', 'Struktur Baja', 'Fondasi',
  'Manajemen Proyek', 'Instalasi Listrik', 'Plumbing', 'HVAC',
  'RAB & Estimasi', 'Quality Control', 'Safety', 'AMDAL',
];

export default function ChatbotBuilderPage() {
  const [chatbots, setChatbots] = useState<CustomChatbot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'mentoring' as const,
    systemPrompt: '',
    modules: [] as string[],
  });

  useEffect(() => {
    const saved = localStorage.getItem('customChatbots');
    if (saved) {
      setChatbots(JSON.parse(saved));
    }
  }, []);

  const saveChatbots = (newChatbots: CustomChatbot[]) => {
    setChatbots(newChatbots);
    localStorage.setItem('customChatbots', JSON.stringify(newChatbots));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const systemPrompts: Record<string, string> = {
      'mentoring': `Anda adalah mentor AI untuk pembelajaran konstruksi. Fokus pada modul: ${form.modules.join(', ')}. Berikan penjelasan detail, contoh, dan latihan.`,
      'problem-solving': `Anda adalah ahli teknik konstruksi yang membantu memecahkan masalah. Fokus pada: ${form.modules.join(', ')}. Analisis masalah dan berikan solusi praktis.`,
      'project-consultant': `Anda adalah konsultan proyek konstruksi. Ikuti proyek dengan detail: ${form.description}. Berikan saran teknis, manajemen, dan keputusan.`,
    };

    const newChatbot: CustomChatbot = {
      id: `chatbot-${Date.now()}`,
      name: form.name,
      description: form.description,
      type: form.type,
      systemPrompt: form.systemPrompt || systemPrompts[form.type],
      modules: form.modules,
      createdAt: new Date().toISOString(),
    };

    saveChatbots([newChatbot, ...chatbots]);
    setShowForm(false);
    setForm({ name: '', description: '', type: 'mentoring', systemPrompt: '', modules: [] });
  };

  const deleteChatbot = (id: string) => {
    if (confirm('Hapus chatbot ini?')) {
      saveChatbots(chatbots.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">🤖 Chatbot Builder</h1>
            <p className="text-slate-400 mt-1">Buat chatbot AI sesuai kebutuhanmu</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium"
          >
            + Buat Chatbot
          </button>
        </div>

        {chatbots.length === 0 && !showForm && (
          <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-white mb-2">Belum Ada Chatbot</h2>
            <p className="text-slate-400 mb-6">Buat chatbot pertama Anda untuk membantu belajar atau konsultasi</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium"
            >
              + Buat Chatbot Pertama
            </button>
          </div>
        )}

        {showForm && (
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Buat Chatbot Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Nama Chatbot</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Contoh: Mentor K3 Saya"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Tipe Chatbot</label>
                <div className="grid md:grid-cols-3 gap-3">
                  {chatbotTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setForm({ ...form, type: type.id as any })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.type === type.id
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="font-medium text-white">{type.name}</div>
                      <div className="text-xs text-slate-400">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Deskripsi / Topik</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Jelaskan tujuan chatbot ini..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Modul yang Dikuasai</label>
                <div className="flex flex-wrap gap-2">
                  {moduleOptions.map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => {
                        const newModules = form.modules.includes(mod)
                          ? form.modules.filter(m => m !== mod)
                          : [...form.modules, mod];
                        setForm({ ...form, modules: newModules });
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        form.modules.includes(mod)
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">System Prompt (Opsional)</label>
                <textarea
                  value={form.systemPrompt}
                  onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                  placeholder="Custom instructions..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium"
                >
                  Simpan Chatbot
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-slate-700 text-white rounded-xl font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatbots.map((chatbot) => (
            <div key={chatbot.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl mb-1">
                    {chatbotTypes.find(t => t.id === chatbot.type)?.icon}
                  </div>
                  <h3 className="font-bold text-white">{chatbot.name}</h3>
                </div>
                <button
                  onClick={() => deleteChatbot(chatbot.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  🗑️
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-3">{chatbot.description}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {chatbot.modules.slice(0, 3).map((mod) => (
                  <span key={mod} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                    {mod}
                  </span>
                ))}
                {chatbot.modules.length > 3 && (
                  <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                    +{chatbot.modules.length - 3}
                  </span>
                )}
              </div>
              <Link
                href={`/chatbot/${chatbot.id}`}
                className="block w-full text-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
              >
                Buka Chat
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
