'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CustomChatbot {
  id: string;
  name: string;
  tagline: string;
  description: string;
  avatar: string;
  type: 'mentoring' | 'problem-solving' | 'project-consultant';
  language: string;
  
  welcome: {
    greeting: string;
    starters: string[];
  };
  
  personality: {
    communicationStyle: string;
    systemPrompt: string;
    tone: 'formal' | 'casual' | 'professional' | 'friendly';
  };
  
  offTopic: {
    strategy: 'ignore' | 'polite_redirect' | 'custom';
    customResponse: string;
  };
  
  aiConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
  
  agentic: {
    enabled: boolean;
    attentiveListening: boolean;
    proactiveHelp: boolean;
    adaptiveLearning: boolean;
    emotionalIntelligence: boolean;
    multiStepReasoning: boolean;
    selfCorrection: boolean;
    contextRetention: number;
  };
  
  rag: {
    enabled: boolean;
    chunkSize: number;
    overlap: number;
    topK: number;
  };
  
  projectBrain: {
    templates: {
      name: string;
      fields: { key: string; label: string; type: string; required: boolean; options?: string[] }[];
    }[];
    currentProject: Record<string, string>;
  };
  
  modules: string[];
  knowledgeBase: { id: string; title: string; content: string }[];
  createdAt: string;
  updatedAt: string;
}

const defaultChatbots: CustomChatbot[] = [
  {
    id: 'demo-bimtek',
    name: 'BimtekKita Assistant',
    tagline: 'Asisten pembelajaran konstruksi',
    description: 'Chatbot AI untuk membantu belajar BIMTEK dan konsultasi konstruksi',
    avatar: '🤖',
    type: 'mentoring',
    language: 'Bahasa Indonesia',
    welcome: {
      greeting: 'Halo! Saya BimtekKita Assistant - asisten AI untuk pembelajaran konstruksi. Saya bisa membantu Anda dengan:\n\n📚 Pembelajaran modul BIMTEK\n❓ Jawaban pertanyaan teknis\n🏗️ Konsultasi proyek\n\nAda yang bisa saya bantu?',
      starters: ['Apa itu BIMTEK?', 'Cara belajar struktur beton', 'Jadwal pelatihan terdekat'],
    },
    personality: {
      communicationStyle: 'Membantu, sabar, dan educational. Selalu berikan contoh nyata dari industri konstruksi Indonesia.',
      systemPrompt: `Anda adalah BimtekKita Assistant - asisten AI untuk platform pelatihan konstruksi.

TENTANG BIMTEKKITA:
- Platform pelatihan konstruksi No.1 di Indonesia
- 67+ modul BIMTEK (Struktur, K3, Manajemen, Elektrikal)
- 334+ posisi sertifikasi
- 8 Expert Agents

KEMAMPUAN:
1. Menjawab pertanyaan teknis konstruksi (SNI, material, desain)
2. Membantu navigasi dan pembelajaran
3. Memberikan saran personal
4. Menjelaskan materi dengan contoh nyata

PERATURAN:
- Jawab dalam bahasa Indonesia
- Gunakan formatting markdown
- Sertakan referensi SNI/standar jika relevan`,
      tone: 'friendly',
    },
    offTopic: {
      strategy: 'polite_redirect',
      customResponse: 'Maaf, saya fokus membantu pertanyaan tentang konstruksi dan pembelajaran di BimtekKita. Apakah ada yang bisa saya bantu tentang BIMTEK, Quiz, atau Sertifikasi?',
    },
    aiConfig: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1024,
    },
    agentic: {
      enabled: true,
      attentiveListening: true,
      proactiveHelp: true,
      adaptiveLearning: true,
      emotionalIntelligence: true,
      multiStepReasoning: true,
      selfCorrection: true,
      contextRetention: 12,
    },
    rag: {
      enabled: true,
      chunkSize: 800,
      overlap: 200,
      topK: 5,
    },
    projectBrain: {
      templates: [],
      currentProject: {},
    },
    modules: ['K3 Konstruksi', 'Struktur Beton', 'Manajemen Proyek'],
    knowledgeBase: [
      { id: 'kb1', title: 'Dasar Beton', content: 'Beton adalah campuran semen, agregat, dan air...' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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

const toneOptions = [
  { id: 'formal', name: 'Formal', description: 'Profesional dan resmi' },
  { id: 'casual', name: 'Casual', description: 'Santai dan informal' },
  { id: 'professional', name: 'Professional', description: 'Bisnis dan teknis' },
  { id: 'friendly', name: 'Friendly', description: 'Ramah dan hangat' },
];

export default function ChatbotBuilderPage() {
  const [chatbots, setChatbots] = useState<CustomChatbot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('identity');
  
  const [form, setForm] = useState<Partial<CustomChatbot>>({
    name: '',
    tagline: '',
    description: '',
    avatar: '🤖',
    type: 'mentoring',
    language: 'Bahasa Indonesia',
    welcome: {
      greeting: '',
      starters: ['', '', ''],
    },
    personality: {
      communicationStyle: '',
      systemPrompt: '',
      tone: 'friendly',
    },
    offTopic: {
      strategy: 'polite_redirect',
      customResponse: '',
    },
    aiConfig: {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1024,
    },
    agentic: {
      enabled: true,
      attentiveListening: true,
      proactiveHelp: true,
      adaptiveLearning: true,
      emotionalIntelligence: true,
      multiStepReasoning: true,
      selfCorrection: true,
      contextRetention: 12,
    },
    rag: {
      enabled: true,
      chunkSize: 800,
      overlap: 200,
      topK: 5,
    },
    projectBrain: {
      templates: [],
      currentProject: {},
    },
    modules: [],
    knowledgeBase: [],
  });

  useEffect(() => {
    const saved = localStorage.getItem('customChatbots');
    if (saved) {
      setChatbots(JSON.parse(saved));
    } else {
      setChatbots(defaultChatbots);
      localStorage.setItem('customChatbots', JSON.stringify(defaultChatbots));
    }
  }, []);

  const saveChatbots = (newChatbots: CustomChatbot[]) => {
    setChatbots(newChatbots);
    localStorage.setItem('customChatbots', JSON.stringify(newChatbots));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const systemPrompts: Record<string, string> = {
      'mentoring': `Anda adalah mentor AI untuk pembelajaran konstruksi. Fokus pada modul: ${form.modules?.join(', ') || 'konstruksi umum'}. Berikan penjelasan detail, contoh, dan latihan.`,
      'problem-solving': `Anda adalah ahli teknik konstruksi yang membantu memecahkan masalah. Fokus pada: ${form.modules?.join(', ') || 'konstruksi'}. Analisis masalah dan berikan solusi praktis.`,
      'project-consultant': `Anda adalah konsultan proyek konstruksi. Ikuti proyek dengan detail. Berikan saran teknis, manajemen, dan keputusan.`,
    };

    const newChatbot: CustomChatbot = {
      id: editingId || `chatbot-${Date.now()}`,
      name: form.name || 'Chatbot Baru',
      tagline: form.tagline || '',
      description: form.description || '',
      avatar: form.avatar || '🤖',
      type: form.type || 'mentoring',
      language: form.language || 'Bahasa Indonesia',
      welcome: form.welcome || { greeting: '', starters: [] },
      personality: form.personality || { communicationStyle: '', systemPrompt: '', tone: 'friendly' },
      offTopic: form.offTopic || { strategy: 'polite_redirect', customResponse: '' },
      aiConfig: form.aiConfig || { model: 'gpt-4o-mini', temperature: 0.7, maxTokens: 1024 },
      agentic: form.agentic || { enabled: true, attentiveListening: true, proactiveHelp: true, adaptiveLearning: true, emotionalIntelligence: true, multiStepReasoning: true, selfCorrection: true, contextRetention: 12 },
      rag: form.rag || { enabled: true, chunkSize: 800, overlap: 200, topK: 5 },
      projectBrain: form.projectBrain || { templates: [], currentProject: {} },
      modules: form.modules || [],
      knowledgeBase: form.knowledgeBase || [],
      createdAt: editingId ? chatbots.find(c => c.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      saveChatbots(chatbots.map(c => c.id === editingId ? newChatbot : c));
    } else {
      saveChatbots([newChatbot, ...chatbots]);
    }
    
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      name: '',
      tagline: '',
      description: '',
      avatar: '🤖',
      type: 'mentoring',
      language: 'Bahasa Indonesia',
      welcome: { greeting: '', starters: ['', '', ''] },
      personality: { communicationStyle: '', systemPrompt: '', tone: 'friendly' },
      offTopic: { strategy: 'polite_redirect', customResponse: '' },
      aiConfig: { model: 'gpt-4o-mini', temperature: 0.7, maxTokens: 1024 },
      agentic: { enabled: true, attentiveListening: true, proactiveHelp: true, adaptiveLearning: true, emotionalIntelligence: true, multiStepReasoning: true, selfCorrection: true, contextRetention: 12 },
      rag: { enabled: true, chunkSize: 800, overlap: 200, topK: 5 },
      projectBrain: { templates: [], currentProject: {} },
      modules: [],
      knowledgeBase: [],
    });
    setActiveTab('identity');
  };

  const editChatbot = (chatbot: CustomChatbot) => {
    setForm(chatbot);
    setEditingId(chatbot.id);
    setShowForm(true);
  };

  const deleteChatbot = (id: string) => {
    if (confirm('Hapus chatbot ini?')) {
      saveChatbots(chatbots.filter(c => c.id !== id));
    }
  };

  const tabs = [
    { id: 'identity', label: 'Identitas', icon: '👤' },
    { id: 'welcome', label: 'Welcome', icon: '👋' },
    { id: 'personality', label: 'Kepribadian', icon: '🧠' },
    { id: 'ai-model', label: 'AI Model', icon: '🤖' },
    { id: 'agentic', label: 'Agentic AI', icon: '⚡' },
    { id: 'knowledge', label: 'Knowledge Base', icon: '📚' },
    { id: 'project', label: 'Otak Proyek', icon: '🏗️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">🤖 Chatbot Builder</h1>
            <p className="text-slate-400 mt-1">Buat dan kelola chatbot AI yang powerful</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
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
              onClick={() => { resetForm(); setShowForm(true); }}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium"
            >
              + Buat Chatbot Pertama
            </button>
          </div>
        )}

        {showForm && (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 mb-8 overflow-hidden">
            <div className="flex border-b border-slate-700 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-500/20 text-amber-500 border-b-2 border-amber-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {activeTab === 'identity' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Identitas Chatbot</h3>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-4xl">
                        {form.avatar}
                      </div>
                      <button type="button" className="absolute bottom-0 right-0 bg-amber-500 p-1.5 rounded-full text-white text-xs">
                        📷
                      </button>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Klik ikon kamera untuk upload avatar</p>
                      <p className="text-slate-500 text-xs">Format: JPG, PNG, GIF, WebP. Max 5MB</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Nama Chatbot</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Contoh: Dokumentender Assistant"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      placeholder="Contoh: Sumber pengetahuan teknik, konstruksi, dan pengadaan"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Deskripsi</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Jelaskan tujuan dan fungsi chatbot..."
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Bahasa Utama</label>
                      <select
                        value={form.language}
                        onChange={(e) => setForm({ ...form, language: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                      >
                        <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                        <option value="English">English</option>
                        <option value="Mix">Campuran</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Tipe Chatbot</label>
                      <div className="grid grid-cols-3 gap-2">
                        {chatbotTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setForm({ ...form, type: type.id as any })}
                            className={`p-2 rounded-lg border text-center text-xs transition-all ${
                              form.type === type.id
                                ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                                : 'border-slate-600 text-slate-400'
                            }`}
                          >
                            {type.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'welcome' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Welcome Experience</h3>
                  
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Pesan Sambutan</label>
                    <textarea
                      value={form.welcome?.greeting}
                      onChange={(e) => setForm({ ...form, welcome: { ...form.welcome!, greeting: e.target.value } })}
                      placeholder="Pesan yang ditampilkan saat pengguna pertama kali membuka chat..."
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Conversation Starters (max 5)</label>
                    <div className="space-y-2">
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={form.welcome?.starters?.[idx] || ''}
                          onChange={(e) => {
                            const starters = [...(form.welcome?.starters || [])];
                            starters[idx] = e.target.value;
                            setForm({ ...form, welcome: { ...form.welcome!, starters } });
                          }}
                          placeholder={`Prompt ${idx + 1}...`}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'personality' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Kepribadian & Perilaku</h3>
                  
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Gaya Komunikasi</label>
                    <textarea
                      value={form.personality?.communicationStyle}
                      onChange={(e) => setForm({ ...form, personality: { ...form.personality!, communicationStyle: e.target.value } })}
                      placeholder="Jelaskan gaya komunikasi dan nilai-nilai yang dianut chatbot..."
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">System Prompt</label>
                    <textarea
                      value={form.personality?.systemPrompt}
                      onChange={(e) => setForm({ ...form, personality: { ...form.personality!, systemPrompt: e.target.value } })}
                      placeholder="Instruksi utama yang mendefinisikan perilaku chatbot..."
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono text-sm"
                      rows={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Nada Suara</label>
                    <div className="grid md:grid-cols-4 gap-3">
                      {toneOptions.map((tone) => (
                        <button
                          key={tone.id}
                          type="button"
                          onClick={() => setForm({ ...form, personality: { ...form.personality!, tone: tone.id as any } })}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            form.personality?.tone === tone.id
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-slate-600 hover:border-slate-500'
                          }`}
                        >
                          <div className="font-medium text-white text-sm">{tone.name}</div>
                          <div className="text-xs text-slate-400">{tone.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <h4 className="text-md font-semibold text-white mb-3">Off-Topic Handling</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Strategi Respons</label>
                        <select
                          value={form.offTopic?.strategy}
                          onChange={(e) => setForm({ ...form, offTopic: { ...form.offTopic!, strategy: e.target.value as any } })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        >
                          <option value="polite_redirect">Arahkan dengan Sopan</option>
                          <option value="ignore">Abaikan</option>
                          <option value="custom">Respons Kustom</option>
                        </select>
                      </div>
                      {form.offTopic?.strategy === 'custom' && (
                        <div>
                          <label className="block text-sm text-slate-300 mb-2">Respons Kustom</label>
                          <textarea
                            value={form.offTopic?.customResponse}
                            onChange={(e) => setForm({ ...form, offTopic: { ...form.offTopic!, customResponse: e.target.value } })}
                            placeholder="Contoh: Maaf, saya hanya bisa membantu dengan pertanyaan..."
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai-model' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Konfigurasi AI Model</h3>
                  
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">AI Model</label>
                    <select
                      value={form.aiConfig?.model}
                      onChange={(e) => setForm({ ...form, aiConfig: { ...form.aiConfig!, model: e.target.value } })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    >
                      <option value="gpt-4o">GPT-4o (Terbaik)</option>
                      <option value="gpt-4o-mini">GPT-4o Mini (Cepat & Murah)</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fallback)</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Temperature: {form.aiConfig?.temperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={form.aiConfig?.temperature || 0.7}
                        onChange={(e) => setForm({ ...form, aiConfig: { ...form.aiConfig!, temperature: parseFloat(e.target.value) } })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Konsisten</span>
                        <span>Kreatif</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Max Tokens: {form.aiConfig?.maxTokens}
                      </label>
                      <input
                        type="range"
                        min="256"
                        max="4096"
                        step="256"
                        value={form.aiConfig?.maxTokens || 1024}
                        onChange={(e) => setForm({ ...form, aiConfig: { ...form.aiConfig!, maxTokens: parseInt(e.target.value) } })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>256</span>
                        <span>4096</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'agentic' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Attentive Agentic AI</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.agentic?.enabled}
                        onChange={(e) => setForm({ ...form, agentic: { ...form.agentic!, enabled: e.target.checked } })}
                        className="w-5 h-5 rounded bg-slate-700 border-slate-600"
                      />
                      <span className="text-white">Aktifkan</span>
                    </label>
                  </div>

                  {form.agentic?.enabled && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          { key: 'attentiveListening', label: 'Attentive Listening', desc: 'AI memperhatikan konteks percakapan dengan lebih teliti' },
                          { key: 'proactiveHelp', label: 'Bantuan Proaktif', desc: 'AI memberikan saran tanpa diminta' },
                          { key: 'adaptiveLearning', label: 'Pembelajaran Adaptif', desc: 'AI belajar dari interaksi untuk meningkatkan respons' },
                          { key: 'emotionalIntelligence', label: 'Kecerdasan Emosional', desc: 'AI mendeteksi dan merespons emosi pengguna' },
                          { key: 'multiStepReasoning', label: 'Penalaran Multi-Langkah', desc: 'AI memecah masalah kompleks menjadi langkah-langkah' },
                          { key: 'selfCorrection', label: 'Koreksi Mandiri', desc: 'AI mendeteksi dan memperbaiki kesalahannya sendiri' },
                        ].map((item) => (
                          <label
                            key={item.key}
                            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                              form.agentic?.[item.key as keyof typeof form.agentic]
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-slate-600 hover:border-slate-500'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!form.agentic?.[item.key as keyof typeof form.agentic]}
                              onChange={(e) => setForm({ ...form, agentic: { ...form.agentic!, [item.key]: e.target.checked } })}
                              className="mt-1 w-4 h-4 rounded bg-slate-700 border-slate-600"
                            />
                            <div>
                              <div className="font-medium text-white text-sm">{item.label}</div>
                              <div className="text-xs text-slate-400">{item.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm text-slate-300 mb-2">
                          Retensi Konteks: {form.agentic?.contextRetention} pesan
                        </label>
                        <select
                          value={form.agentic?.contextRetention}
                          onChange={(e) => setForm({ ...form, agentic: { ...form.agentic!, contextRetention: parseInt(e.target.value) } })}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        >
                          <option value={1}>1 pesan (Minimal)</option>
                          <option value={6}>6 pesan (Normal)</option>
                          <option value={12}>12 pesan (Lengkap)</option>
                          <option value={50}>50 pesan (Maksimal)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'knowledge' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Knowledge Base (RAG)</h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.rag?.enabled}
                        onChange={(e) => setForm({ ...form, rag: { ...form.rag!, enabled: e.target.checked } })}
                        className="w-5 h-5 rounded bg-slate-700 border-slate-600"
                      />
                      <span className="text-white">Aktifkan RAG</span>
                    </label>
                  </div>

                  {form.rag?.enabled && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-slate-300 mb-2">Chunk Size</label>
                          <input
                            type="number"
                            value={form.rag?.chunkSize}
                            onChange={(e) => setForm({ ...form, rag: { ...form.rag!, chunkSize: parseInt(e.target.value) } })}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                          />
                          <p className="text-xs text-slate-500 mt-1">Ukuran potongan dokumen</p>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-2">Overlap</label>
                          <input
                            type="number"
                            value={form.rag?.overlap}
                            onChange={(e) => setForm({ ...form, rag: { ...form.rag!, overlap: parseInt(e.target.value) } })}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                          />
                          <p className="text-xs text-slate-500 mt-1">Tumpang tindih antar chunk</p>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-300 mb-2">Top-K</label>
                          <input
                            type="number"
                            value={form.rag?.topK}
                            onChange={(e) => setForm({ ...form, rag: { ...form.rag!, topK: parseInt(e.target.value) } })}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                          />
                          <p className="text-xs text-slate-500 mt-1">Jumlah hasil pencarian</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Modul yang Dikuasai</label>
                        <div className="flex flex-wrap gap-2">
                          {moduleOptions.map((mod) => (
                            <button
                              key={mod}
                              type="button"
                              onClick={() => {
                                const newModules = form.modules?.includes(mod)
                                  ? form.modules.filter(m => m !== mod)
                                  : [...(form.modules || []), mod];
                                setForm({ ...form, modules: newModules });
                              }}
                              className={`px-3 py-1 rounded-full text-sm transition-all ${
                                form.modules?.includes(mod)
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
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm text-slate-300">Knowledge Items</label>
                          <button
                            type="button"
                            onClick={() => {
                              const kb = [...(form.knowledgeBase || []), { id: `kb-${Date.now()}`, title: '', content: '' }];
                              setForm({ ...form, knowledgeBase: kb });
                            }}
                            className="text-amber-500 text-sm hover:underline"
                          >
                            + Tambah Knowledge
                          </button>
                        </div>
                        <div className="space-y-3">
                          {form.knowledgeBase?.map((kb, idx) => (
                            <div key={kb.id} className="p-4 bg-slate-700/50 rounded-xl space-y-2">
                              <input
                                type="text"
                                value={kb.title}
                                onChange={(e) => {
                                  const updated = [...form.knowledgeBase!];
                                  updated[idx].title = e.target.value;
                                  setForm({ ...form, knowledgeBase: updated });
                                }}
                                placeholder="Judul knowledge..."
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                              />
                              <textarea
                                value={kb.content}
                                onChange={(e) => {
                                  const updated = [...form.knowledgeBase!];
                                  updated[idx].content = e.target.value;
                                  setForm({ ...form, knowledgeBase: updated });
                                }}
                                placeholder="Konten knowledge..."
                                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                                rows={3}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'project' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Otak Proyek (Project Brain)</h3>
                  <p className="text-slate-400 text-sm">Definisikan data proyek yang menjadi konteks chatbot</p>

                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white font-medium">Templates</h4>
                      <button
                        type="button"
                        className="text-amber-500 text-sm hover:underline"
                      >
                        + Buat Template
                      </button>
                    </div>
                    <p className="text-slate-400 text-sm">Belum ada template. Buat template untuk mendefinisikan field data proyek.</p>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Proyek Saat Ini</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {Object.entries(form.projectBrain?.currentProject || {}).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm text-slate-400 mb-1">{key}</label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const updated = { ...form.projectBrain?.currentProject };
                              updated[key] = e.target.value;
                              setForm({ ...form, projectBrain: { ...form.projectBrain!, currentProject: updated } });
                            }}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium"
                >
                  {editingId ? 'Simpan Perubahan' : 'Simpan Chatbot'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
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
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{chatbot.avatar}</div>
                  <div>
                    <h3 className="font-bold text-white">{chatbot.name}</h3>
                    {chatbot.tagline && (
                      <p className="text-xs text-amber-500">{chatbot.tagline}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editChatbot(chatbot)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteChatbot(chatbot.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-3">{chatbot.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="px-2 py-0.5 bg-amber-500/20 rounded text-xs text-amber-500">
                  {chatbotTypes.find(t => t.id === chatbot.type)?.icon} {chatbot.type}
                </span>
                {chatbot.agentic?.enabled && (
                  <span className="px-2 py-0.5 bg-green-500/20 rounded text-xs text-green-500">
                    ⚡ Agentic
                  </span>
                )}
                {chatbot.rag?.enabled && (
                  <span className="px-2 py-0.5 bg-blue-500/20 rounded text-xs text-blue-500">
                    📚 RAG
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
