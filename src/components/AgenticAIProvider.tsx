'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AppFeature {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: string;
  category: 'learning' | 'tools' | 'certification' | 'community' | 'profile';
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  execute: (params?: any) => any;
}

export interface AgentSuggestion {
  id: string;
  type: 'action' | 'navigation' | 'information';
  title: string;
  description: string;
  action: () => void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: AgentSuggestion[];
  toolsUsed?: string[];
}

interface AgenticAIContextType {
  messages: ChatMessage[];
  isProcessing: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  addMessage: (content: string, role: 'user' | 'assistant' | 'system') => void;
  processMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  appFeatures: AppFeature[];
}

const appFeatures: AppFeature[] = [
  { id: 'dashboard', name: 'Dashboard', description: 'Ringkasan progress belajar dan statistik', path: '/dashboard', icon: '📊', category: 'profile' },
  { id: 'knowledge-base', name: 'Knowledge Base', description: 'Artikel dan panduan konstruksi', path: '/knowledge-base', icon: '📚', category: 'learning' },
  { id: 'bimtek', name: 'BIMTEK', description: '67+ modul pelatihan dengan AI Learning Companion', path: '/bimtek', icon: '🎓', category: 'learning' },
  { id: 'quiz', name: 'Quiz', description: '65+ soal latihan berbagai kategori', path: '/quiz', icon: '✍️', category: 'learning' },
  { id: 'solver', name: 'Solver', description: 'Kalkulator teknik (balok, kolom, fondasi, dll)', path: '/solver', icon: '🧮', category: 'tools' },
  { id: 'tools', name: 'Tools', description: 'RAB Calculator & Mix Design Calculator', path: '/tools', icon: '🔧', category: 'tools' },
  { id: 'matrix', name: 'Matrix', description: 'Peta hubungan subklasifikasi dan jabatan', path: '/matrix', icon: '🔗', category: 'certification' },
  { id: 'sertifikasi', name: 'Sertifikasi', description: '334+ posisi pekerjaan dan persyaratan SKK', path: '/sertifikasi', icon: '📋', category: 'certification' },
  { id: 'certify', name: 'Certify', description: 'Panduan 5 langkah mendapatkan sertifikasi', path: '/certify', icon: '✅', category: 'certification' },
  { id: 'offline', name: 'Bimtek Offline', description: 'Event pelatihan offline terdekat', path: '/offline', icon: '📍', category: 'community' },
  { id: 'chat', name: 'AI Chat', description: '8 Expert Agents untuk konsultasi', path: '/chat', icon: '💬', category: 'learning' },
  { id: 'achievements', name: 'Achievements', description: '14 achievement yang bisa diraih', path: '/achievements', icon: '🏆', category: 'profile' },
  { id: 'calendar', name: 'Calendar', description: 'Visualisasi aktivitas belajar harian', path: '/calendar', icon: '📅', category: 'profile' },
  { id: 'streak', name: 'Learning Streak', description: 'Tracker hari berturut-turut belajar', path: '/dashboard', icon: '🔥', category: 'profile' },
  { id: 'bookmarks', name: 'Bookmarks', description: 'Simpan konten favorit', path: '/bookmarks', icon: '🔖', category: 'profile' },
  { id: 'activity', name: 'Activity Log', description: 'Riwayat aktivitas belajar', path: '/activity', icon: '📝', category: 'profile' },
  { id: 'profile', name: 'Profile', description: 'Edit profil dan statistik', path: '/profile', icon: '👤', category: 'profile' },
  { id: 'settings', name: 'Settings', description: 'Pengaturan tema dan data', path: '/settings', icon: '⚙️', category: 'profile' },
  { id: 'shortcuts', name: 'Shortcuts', description: 'Pintasan keyboard', path: '/shortcuts', icon: '⌨️', category: 'profile' },
  { id: 'leaderboard', name: 'Leaderboard', description: 'Peringkat learner terbaik', path: '/leaderboard', icon: '🏆', category: 'profile' },
];

const AgenticAIContext = createContext<AgenticAIContextType | undefined>(undefined);

function buildSystemPrompt(): string {
  return `Anda adalah Agentic AI BimtekKita, asisten AI profesional untuk platform pelatihan konstruksi Indonesia.

TENTANG BIMTEKKITA:
- Platform pelatihan dan sertifikasi bidang konstruksi No.1 di Indonesia
- 67+ modul BIMTEK pelatihan (Struktur, K3, Manajemen, Elektrikal, Plumbing)
- 65+ soal quiz berbagai kategori
- 334+ posisi sertifikasi pekerjaan (SKK, BNSP)
- 8 Expert Agents: Struktur, K3, Manajemen, Elektrikal, Plumbing, RAB, Fondasi, QC
- Event offline (Bimtek Offline) - ride-sharing style
- Tools: Solver (6 kalkulator), RAB Calculator, Mix Design
- Learning Streak, Achievements, Leaderboard

FITUR APLIKASI:
- /dashboard - Ringkasan progress dan statistik
- /bimtek - Modul pelatihan dengan AI Learning Companion
- /quiz - Latihan soal dengan scoring
- /sertifikasi - 334+ posisi dan persyaratan SKK
- /certify - Panduan 5 langkah sertifikasi
- /matrix - Hubungan subklasifikasi dan jabatan
- /offline - Event pelatihan offline
- /chat - Konsultasi dengan 8 Expert Agents
- /solver - Kalkulator teknik (balok, kolom, fondasi, dll)
- /tools - RAB Calculator & Mix Design
- /achievements - 14 achievement yang bisa diraih
- /leaderboard - Peringkat learner terbaik

KAPABILITAS ANDA:
1. Menjawab pertanyaan teknis tentang konstruksi (SNI, material, desain)
2. Membantu navigasi ke fitur aplikasi
3. Memberikan saran pembelajaran personal
4. Menjelaskan materi teknis (K3, Struktur, Manajemen, dll)
5. Membantu memecahkan masalah teknis konstruksi

PERATURAN:
- Selalu jawab dalam bahasa Indonesia yang baik
- Jika tidak yakin, akui ketidakpastian
- Gunakan formatting markdown untuk jawaban
- Berikan jawaban yang actionable
- Sertakan referensi SNI/standar jika relevan

ANDA MEMILIKI AKSES KE KNOWLEDGE BASE yang berisi:
- SNI 2847:2019 (Beton), SNI 1729:2020 (Baja), SNI 1726:2019 (Gempa)
- Permenaker 9/2016 (K3 Konstruksi)
- PMBOK, EVM, CPM
- PUIL 2020 (Listrik)
- Analisis Harga Satuan

Gunakan pengetahuan ini untuk memberikan jawaban yang akurat dan terverifikasi.`;
}

async function callOpenAIAPI(apiKey: string, message: string, history: ChatMessage[]): Promise<string> {
  const systemPrompt = buildSystemPrompt();
  
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda.';
}

function generateRuleBasedResponse(userMessage: string): { content: string; suggestions?: AgentSuggestion[] } {
  const lowerMessage = userMessage.toLowerCase();
  let response = '';
  let suggestions: AgentSuggestion[] = [];
  
  if (lowerMessage.includes('halo') || lowerMessage.includes('hi') || lowerMessage.includes('halo')) {
    response = `Halo! Saya Agentic AI BimtekKita 🤖

Saya adalah asisten AI yang dapat membantu Anda dengan:
• **Navigasi** - Menunjukkan fitur-fitur aplikasi
• **Informasi** - Menjelaskan tentang BIMTEK, Quiz, Sertifikasi
• **Saran** - Memberikan rekomendasi pembelajaran
• **Tugas** - Membantu выполнения tugas (membuka halaman, dll)

Coba tanyakan sesuatu, например:
- "Apa saja fitur di aplikasi ini?"
- "Bagaimana cara belajar BIMTEK?"
- "Bawa saya ke halaman Quiz"
- "Apa saja persyaratan sertifikasi?"

${localStorage.getItem('openai_api_key') ? '✅ API Key telah dikonfigurasi - Anda bisa bertanya apapun!' : '⚠️ API Key belum dikonfigurasi - Responses masih berbasis aturan. Konfigurasi di Settings untuk pengalaman lebih baik!'}`;
    
    suggestions = [
      { id: '1', type: 'information', title: 'Fitur Aplikasi', description: 'Lihat semua fitur', action: () => {} },
      { id: '2', type: 'navigation', title: 'Mulai Belajar', description: 'Ke halaman BIMTEK', action: () => window.location.href = '/bimtek' },
    ];
  }
  else if (lowerMessage.includes('fitur') || lowerMessage.includes('ada apa') || lowerMessage.includes('menu')) {
    response = `📱 **Fitur-fitur BimtekKita:**

**🎓 Pembelajaran:**
• BIMTEK - 67+ modul pelatihan
• Quiz - 65+ soal latihan
• Knowledge Base - Artikel konstruksi
• Chat dengan 8 Expert Agents

**🔧 Tools:**
• Solver - Kalkulator teknik
• Tools - RAB & Mix Design

**📋 Sertifikasi:**
• Sertifikasi - 334+ posisi pekerjaan
• Certify - Panduan 5 langkah
• Matrix - Hubungan jabatan
• Bimtek Offline - Event pelatihan

**👤 Profile:**
• Dashboard, Achievements, Calendar
• Streak, Bookmarks, Leaderboard`;
    
    suggestions = [
      { id: 'bimtek', type: 'navigation', title: 'Ke BIMTEK', description: '67+ modul', action: () => window.location.href = '/bimtek' },
      { id: 'quiz', type: 'navigation', title: 'Ke Quiz', description: 'Latihan soal', action: () => window.location.href = '/quiz' },
      { id: 'sertifikasi', type: 'navigation', title: 'Ke Sertifikasi', description: 'Persyaratan SKK', action: () => window.location.href = '/sertifikasi' },
    ];
  }
  else if (lowerMessage.includes('bimtek') || lowerMessage.includes('modul') || lowerMessage.includes('belajar')) {
    response = `🎓 **BIMTEK - Pelatihan Konstruksi**

BimtekKita menawarkan **67+ modul pelatihan** 包括:

**Kategori:**
• Struktur Beton & Baja
• Fondasi
• Manajemen Proyek
• K3 Konstruksi
• Instalasi Listrik
• Plumbing & HVAC

**Fitur:**
• ✅ AI Learning Companion
• ✅ PKB Tracker
• ✅ Sertifikat completion
• ✅ Bookmark favorit

Gunakan /bimtek untuk mulai belajar!`;
    
    suggestions = [
      { id: 'bimtek-list', type: 'navigation', title: 'Ke BIMTEK', description: 'Pilih modul', action: () => window.location.href = '/bimtek' },
    ];
  }
  else if (lowerMessage.includes('sertifikasi') || lowerMessage.includes('skk') || lowerMessage.includes('bnsp')) {
    response = `📋 **Sertifikasi & Regulasi**

BimtekKita menyediakan **334+ posisi pekerjaan** dengan persyaratan SKK.

**Jenis:**
• SKK (SNI) - BNP
• BNSP - Sertifikasi nasional
• LSP - Lembaga sertifikasi

**Tingkat:**
• Jenjang 1 (Terlatih)
• Jenjang 2 (Mahir)
• Jenjang 3 (Ahli)
• Jenjang 4 (Ahli Utama)

Gunakan /sertifikasi untuk cari posisi!`;
    
    suggestions = [
      { id: 'sertifikasi', type: 'navigation', title: 'Ke Sertifikasi', description: '334+ posisi', action: () => window.location.href = '/sertifikasi' },
      { id: 'certify', type: 'navigation', title: 'Panduan Certify', description: '5 langkah', action: () => window.location.href = '/certify' },
    ];
  }
  else if (lowerMessage.includes('offline') || lowerMessage.includes('event')) {
    response = `📍 **Bimtek Offline**

Event pelatihan offline terdekat:
• Jakarta - K3 Konstruksi
• Surabaya - Struktur Beton
• Bandung - Manajemen Proyek
• Denpasar - Instalasi Listrik

Gunakan /offline untuk lihat event!`;
    
    suggestions = [
      { id: 'offline', type: 'navigation', title: 'Ke Offline', description: 'Lihat event', action: () => window.location.href = '/offline' },
    ];
  }
  else if (lowerMessage.includes('k3') || lowerMessage.includes('keselamatan')) {
    response = `🦺 **K3 & Keselamatan Kerja**

Topik K3 tersedia:
• K3 Konstruksi Gedung
• K3 Pekerjaan Tinggi
• K3 Listrik
• Safety Induction
• APD

Gunakan /bimtek atau /chat dengan Expert K3!`;
    
    suggestions = [
      { id: 'bimtek-k3', type: 'navigation', title: 'BIMTEK K3', description: 'Modul K3', action: () => window.location.href = '/bimtek' },
    ];
  }
  else if (lowerMessage.includes('bawa') || lowerMessage.includes('ke') || lowerMessage.includes('pergi')) {
    const paths: Record<string, string> = {
      'dashboard': '/dashboard', 'bimtek': '/bimtek', 'quiz': '/quiz',
      'solver': '/solver', 'tools': '/tools', 'matrix': '/matrix',
      'sertifikasi': '/sertifikasi', 'certify': '/certify', 'chat': '/chat',
      'offline': '/offline', 'profile': '/profile', 'achievements': '/achievements',
      'calendar': '/calendar', 'settings': '/settings', 'bookmarks': '/bookmarks',
      'activity': '/activity', 'knowledge': '/knowledge-base', 'leaderboard': '/leaderboard',
    };
    
    for (const [key, path] of Object.entries(paths)) {
      if (lowerMessage.includes(key)) {
        response = `MengNavigasi ke ${path}...`;
        window.location.href = path;
        break;
      }
    }
    
    if (!response) {
      response = `Saya bisa membawa Anda ke halaman manapun. Coba katakan:
• "Ke BIMTEK", "Ke Quiz", "Ke Dashboard"`;
    }
  }
  else {
    response = `🤖 **Agentic AI BimtekKita**

Saya mengerti "${userMessage}". 

Saya bisa membantu Anda dengan:
• Navigasi: "Ke BIMTEK", "Ke Quiz"
• Informasi: "Apa itu SKK?", "Berapa banyak modul?"
• Saran: "Apa yang harus saya belajar?"

⚠️ **Tips**: Konfigurasi API Key di Settings untuk responses yang lebih intelligent!`;
    
    suggestions = [
      { id: 'bimtek', type: 'navigation', title: 'Jelajahi BIMTEK', description: '67+ modul', action: () => window.location.href = '/bimtek' },
      { id: 'settings', type: 'navigation', title: 'Pengaturan API', description: 'Konfigurasi AI', action: () => window.location.href = '/settings' },
    ];
  }
  
  return { content: response, suggestions };
}

export function AgenticAIProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKeyState] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key') || '';
    setApiKeyState(savedKey);
    setIsHydrated(true);
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem('openai_api_key', key);
    } else {
      localStorage.removeItem('openai_api_key');
    }
  };

  const addMessage = (content: string, role: 'user' | 'assistant' | 'system') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const processMessage = async (content: string) => {
    addMessage(content, 'user');
    setIsProcessing(true);

    const userMessage = content;
    const history = messages;

    try {
      let response: string;
      
      if (apiKey && apiKey.trim()) {
        try {
          response = await callOpenAIAPI(apiKey, userMessage, history);
        } catch (apiError) {
          console.error('API Error:', apiError);
          const fallback = generateRuleBasedResponse(userMessage);
          response = fallback.content + '\n\n⚠️ API Error - Menggunakan responses aturan.';
        }
      } else {
        const ruleBased = generateRuleBasedResponse(userMessage);
        response = ruleBased.content;
      }

      const suggestions = generateRuleBasedResponse(userMessage).suggestions;
      
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions,
        toolsUsed: apiKey ? ['OpenAI API'] : ['Rule-based'],
      };
      
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsProcessing(false);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <AgenticAIContext.Provider value={{
      messages,
      isProcessing,
      apiKey,
      setApiKey,
      addMessage,
      processMessage,
      clearMessages,
      appFeatures,
    }}>
      {children}
    </AgenticAIContext.Provider>
  );
}

export function useAgenticAI() {
  const context = useContext(AgenticAIContext);
  if (!context) {
    throw new Error('useAgenticAI must be used within AgenticAIProvider');
  }
  return context;
}
