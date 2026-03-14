'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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
];

const agentTools: AgentTool[] = [
  {
    id: 'navigate',
    name: 'Navigasi Halaman',
    description: 'Bawa user ke halaman tertentu',
    execute: (path: string) => {
      window.location.href = path;
      return { success: true, message: `MengNavigasi ke ${path}` };
    },
  },
  {
    id: 'search',
    name: 'Pencarian Konten',
    description: 'Cari konten dalam aplikasi',
    execute: async (query: string) => {
      const results = appFeatures.filter(f => 
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.description.toLowerCase().includes(query.toLowerCase())
      );
      return { success: true, results };
    },
  },
  {
    id: 'getFeatureInfo',
    name: 'Info Fitur',
    description: 'Berikan detail tentang fitur tertentu',
    execute: (featureId: string) => {
      const feature = appFeatures.find(f => f.id === featureId);
      return feature || null;
    },
  },
  {
    id: 'listFeatures',
    name: 'List Semua Fitur',
    description: 'Berikan daftar semua fitur aplikasi',
    execute: (category?: string) => {
      if (category) {
        return appFeatures.filter(f => f.category === category);
      }
      return appFeatures;
    },
  },
  {
    id: 'calculate',
    name: 'Kalkulasi Teknik',
    description: 'Lakukan kalkulasi teknik sederhana',
    execute: (params: { type: string; params: any }) => {
      const { type, params: p } = params;
      switch (type) {
        case 'concrete':
          const volume = p.length * p.width * p.height;
          const cement = volume * p.ratio;
          return { volume, cement, sand: volume * 2, aggregate: volume * 4 };
        default:
          return { error: 'Kalkulasi tidak dikenal' };
      }
    },
  },
];

const AgenticAIContext = createContext<AgenticAIContextType | undefined>(undefined);

function generateResponse(userMessage: string, features: AppFeature[]): { content: string; suggestions?: AgentSuggestion[]; toolsUsed?: string[] } {
  const lowerMessage = userMessage.toLowerCase();
  let response = '';
  let suggestions: AgentSuggestion[] = [];
  const toolsUsed: string[] = [];
  
  toolsUsed.push('getFeatureInfo');
  
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
- "Apa saja persyaratan sertifikasi?"`;
    
    suggestions = [
      { id: '1', type: 'information', title: 'Fitur Aplikasi', description: 'Lihat semua fitur', action: () => {} },
      { id: '2', type: 'navigation', title: 'Mulai Belajar', description: 'Ke halaman BIMTEK', action: () => window.location.href = '/bimtek' },
    ];
  }
  else if (lowerMessage.includes('fitur') || lowerMessage.includes('ada apa') || lowerMessage.includes('menu')) {
    toolsUsed.push('listFeatures');
    response = `📱 **Fitur-fitur BimtekKita:**

**🎓 Pembelajaran:**
• BIMTEK - 67+ modul pelatihan dengan AI companion
• Quiz - 65+ soal latihan
• Knowledge Base - Artikel konstruksi
• Chat dengan 8 Expert Agents

**🔧 Tools:**
• Solver - Kalkulator teknik (balok, kolom, fondasi)
• Tools - RAB & Mix Design calculator

**📋 Sertifikasi:**
• Sertifikasi - 334+ posisi pekerjaan
• Certify - Panduan 5 langkah
• Matrix - Hubungan jabatan & subklasifikasi
• Bimtek Offline - Event pelatihan offline

**👤 Profile:**
• Dashboard, Profile, Achievements
• Calendar, Streak, Bookmarks
• Activity Log, Settings

Anda ingin ke halaman tertentu atau tahu lebih banyak tentang fitur tertentu?`;
    
    suggestions = [
      { id: 'bimtek', type: 'navigation', title: 'BIMTEK', description: '67+ modul', action: () => window.location.href = '/bimtek' },
      { id: 'quiz', type: 'navigation', title: 'Quiz', description: 'Latihan soal', action: () => window.location.href = '/quiz' },
      { id: 'sertifikasi', type: 'navigation', title: 'Sertifikasi', description: 'Persyaratan SKK', action: () => window.location.href = '/sertifikasi' },
    ];
  }
  else if (lowerMessage.includes('bimtek') || lowerMessage.includes('modul') || lowerMessage.includes('belajar')) {
    response = `🎓 **BIMTEK - Pelatihan Konstruksi**

BimtekKita menawarkan **67+ modul pelatihan** 包括:

**Kategori Teknik:**
• Struktur Beton & Baja
• Fondasi
• Manajemen Proyek
• K3 Konstruksi
• Instalasi Listrik
• Plumbing & HVAC

**Fitur BIMTEK:**
• ✅ AI Learning Companion - Mentor AI per modul
• ✅ PKB Tracker - Lacak progress pelatihan
• ✅ Sertifikat completion
• ✅ Bookmark favorit

**Cara Menggunakan:**
1. Pilih modul dari /bimtek
2. Pelajari materi per lesson
3. Tandai lesson selesai
4. Diskusi dengan AI Companion jika ada pertanyaan

Anda ingin mulai belajar modul tertentu?`;
    
    suggestions = [
      { id: 'bimtek-list', type: 'navigation', title: 'Ke BIMTEK', description: 'Pilih modul', action: () => window.location.href = '/bimtek' },
      { id: 'ai-companion', type: 'information', title: 'AI Companion', description: 'Tentang mentor AI', action: () => {} },
    ];
  }
  else if (lowerMessage.includes('quiz') || lowerMessage.includes('soal') || lowerMessage.includes('latihan')) {
    response = `✍️ **Quiz - Latihan SoaL**

Tersedia **65+ soal** dalam **13 kategori** 包括:

**Kategori Quiz:**
• K3 Konstruksi
• Struktur Beton
• Manajemen Proyek
• Kelistrikan
• Plumbing
• Dan lainnya...

**Fitur:**
• Best score tracking per kategori
• Review jawaban salah
• Timer per soal
• Ringkasan hasil

Anda ingin mencoba quiz sekarang?`;
    
    suggestions = [
      { id: 'quiz-start', type: 'navigation', title: 'Mulai Quiz', description: 'Ke halaman quiz', action: () => window.location.href = '/quiz' },
    ];
  }
  else if (lowerMessage.includes('sertifikasi') || lowerMessage.includes('skk') || lowerMessage.includes('bnsp')) {
    response = `📋 **Sertifikasi & Regulasi**

BimtekKita menyediakan **334+ posisi pekerjaan** dengan persyaratan SKK.

**Jenis Sertifikasi:**
• SKK (Sertifikat Kompetensi Kerja) - BNP
• BNSP - Sertifikasi nasional
• LSP - Lembaga sertifikasi profesi

**Gunakan fitur:**
• /sertifikasi - Cari posisi & persyaratan
• /certify - Panduan 5 langkah
• /matrix - Hubungan jabatan & subklasifikasi
• /offline - Daftar Bimtek Offline

**Tingkat SKK:**
• Jenjang 1 (Terlatih)
• Jenjang 2 (Mahir)
• Jenjang 3 (Ahli)
• Jenjang 4 (Ahli Utama)

Butuh bantuan menemukan sertifikasi yang tepat?`;
    
    suggestions = [
      { id: 'sertifikasi', type: 'navigation', title: 'Cari Sertifikasi', description: '334+ posisi', action: () => window.location.href = '/sertifikasi' },
      { id: 'certify', type: 'navigation', title: 'Panduan Certify', description: '5 langkah', action: () => window.location.href = '/certify' },
    ];
  }
  else if (lowerMessage.includes('k3') || lowerMessage.includes('keselamatan') || lowerMessage.includes('safety') || lowerMessage.includes('amdal')) {
    response = `🦺 **K3 & Keselamatan Kerja**

Topik K3 yang tersedia di BimtekKita:

**Materi K3:**
• K3 Konstruksi Gedung
• K3 Pekerjaan Tinggi
• K3 Listrik
• Safety Induction
• APD (Alat Pelindung Diri)

**Fitur Terkait:**
• Quiz K3 - 10+ soal
• Knowledge Base K3
• Chat dengan Expert K3
• Bimtek Offline K3

**Link Terkait:**
• /bimtek (cari "K3")
• /knowledge-base (artikel K3)
• /chat ( Expert K3)`;
    
    suggestions = [
      { id: 'bimtek-k3', type: 'navigation', title: 'BIMTEK K3', description: 'Modul K3', action: () => window.location.href = '/bimtek' },
      { id: 'chat-k3', type: 'navigation', title: 'Expert K3', description: 'Konsultasi', action: () => window.location.href = '/chat' },
    ];
  }
  else if (lowerMessage.includes('offline') || lowerMessage.includes('event') || lowerMessage.includes('pelatihan offline')) {
    response = `📍 **Bimtek Offline**

Event pelatihan offline terdekat Anda:

**Fitur:**
• Cari event berdasarkan kota
• Filter berdasarkan kategori
• Daftar langsung
• Tracking kehadiran
• Sertifikat otomatis

**Event Tersedia:**
• Jakarta - K3 Konstruksi
• Surabaya - Struktur Beton
• Bandung - Manajemen Proyek
• Denpasar - Instalasi Listrik

Gunakan /offline untuk melihat event lengkap!`;
    
    suggestions = [
      { id: 'offline', type: 'navigation', title: 'Lihat Event', description: 'Semua event', action: () => window.location.href = '/offline' },
      { id: 'offline-create', type: 'navigation', title: 'Buat Event', description: 'Jadilah instruktur', action: () => window.location.href = '/offline/create' },
    ];
  }
  else if (lowerMessage.includes('hitung') || lowerMessage.includes('kalkulator') || lowerMessage.includes('solver') || lowerMessage.includes('hitung')) {
    response = `🔧 **Kalkulator & Tools**

**Solver (6 Template):**
• Balok Beton Bertulang
• Kolom
• Fondasi
• Mix Design Beton
• Cut & Fill Tanah
• Ramp / Landasan

**Tools:**
• RAB Calculator - Buat rencana anggaran
• Mix Design - Desain mix beton

Akses: /solver atau /tools`;
    
    suggestions = [
      { id: 'solver', type: 'navigation', title: 'Ke Solver', description: 'Kalkulator teknik', action: () => window.location.href = '/solver' },
      { id: 'tools', type: 'navigation', title: 'Ke Tools', description: 'RAB & Mix', action: () => window.location.href = '/tools' },
    ];
  }
  else if (lowerMessage.includes('bawa') || lowerMessage.includes('ke') || lowerMessage.includes('pergi') || lowerMessage.includes('akses')) {
    const paths: Record<string, string> = {
      'dashboard': '/dashboard',
      'bimtek': '/bimtek',
      'quiz': '/quiz',
      'solver': '/solver',
      'tools': '/tools',
      'matrix': '/matrix',
      'sertifikasi': '/sertifikasi',
      'certify': '/certify',
      'chat': '/chat',
      'offline': '/offline',
      'profile': '/profile',
      'achievements': '/achievements',
      'calendar': '/calendar',
      'settings': '/settings',
      'bookmarks': '/bookmarks',
      'activity': '/activity',
      'knowledge': '/knowledge-base',
    };
    
    for (const [key, path] of Object.entries(paths)) {
      if (lowerMessage.includes(key)) {
        toolsUsed.push('navigate');
        response = `MengNavigasi ke ${path}...`;
        window.location.href = path;
        break;
      }
    }
    
    if (!response) {
      response = `Saya bisa membawa Anda ke halaman manapun. Coba katakan:
• "Ke BIMTEK"
• "Ke Quiz"
• "Ke Dashboard"
• "Buka Profile"`;
    }
  }
  else if (lowerMessage.includes('achievement') || lowerMessage.includes('streak') || lowerMessage.includes('progress')) {
    response = `🏆 **Progress & Achievements**

**Fitur Tracking:**
• 📊 Dashboard - Ringkasan lengkap
• 🔥 Streak - Hari berturut-turut belajar
• 🏅 Achievements - 14 achievement
• 📅 Calendar - Aktivitas harian
• 📝 Activity Log - Riwayat lengkap

**Contoh Achievement:**
• 🎯 First Quiz - Selesaikan quiz pertama
• 📚 Scholar - Selesaikan 10 modul BIMTEK
• 🔥 On Fire - Streak 7 hari
• 📖 Bookworm - Bookmark 10 konten

Cek progress Anda di /dashboard!`;
    
    suggestions = [
      { id: 'dashboard', type: 'navigation', title: 'Dashboard', description: 'Lihat progress', action: () => window.location.href = '/dashboard' },
      { id: 'achievements', type: 'navigation', title: 'Achievements', description: 'Lihat achievement', action: () => window.location.href = '/achievements' },
    ];
  }
  else if (lowerMessage.includes('ai') || lowerMessage.includes('chatbot') || lowerMessage.includes('expert')) {
    response = `💬 **AI Chat System**

BimtekKita memiliki **8 Expert Agents**:

1. 🏗️ Ahli Teknik Sipil
2. 🏛️ Arsitek & Interior
3. ⚙️ Teknik Mekanikal
4. ⚡ Teknik Elektrikal
5. 🦺 K3 Konstruksi
6. 📊 Manajemen Proyek
7. 📜 Sertifikasi & Regulasi
8. 🌿 Tata Lingkungan

Setiap expert memiliki **toolbox** untuk kalkulasi spesifik.

Gunakan /chat untuk konsultasi!`;
    
    suggestions = [
      { id: 'chat', type: 'navigation', title: 'Ke Chat', description: 'Konsultasi expert', action: () => window.location.href = '/chat' },
    ];
  }
  else {
    response = `🤖 **Agentic AI BimtekKita**

Saya mengerti "${userMessage}". Saya bisa membantu Anda dengan:

**Navigasi & Aksi:**
• "Ke BIMTEK", "Buka Quiz", "Ke Profile"
• "Cari modul struktur beton"
• "Buat event offline"

**Informasi:**
• "Apa itu SKK?"
• "Berapa banyak modul BIMTEK?"
• "Bagaimana cara sertifikasi?"

**Saran:**
• "Apa yang harus saya belajar hari ini?"
• "Modul apa yang cocok untuk saya?"

Coba tanyakan lagi dengan lebih spesifik!`;
    
    suggestions = [
      { id: 'bimtek', type: 'navigation', title: 'Jelajahi BIMTEK', description: '67+ modul', action: () => window.location.href = '/bimtek' },
      { id: 'features', type: 'information', title: 'Lihat Semua Fitur', description: 'Menu lengkap', action: () => {} },
    ];
  }
  
  return { content: response, suggestions, toolsUsed };
}

export function AgenticAIProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: '', timestamp: new Date() }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

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

    await new Promise(resolve => setTimeout(resolve, 500));

    const { content: response, suggestions, toolsUsed } = generateResponse(content, appFeatures);
    
    const responseMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      suggestions,
      toolsUsed,
    };
    
    setMessages(prev => [...prev, responseMessage]);
    setIsProcessing(false);
  };

  const clearMessages = () => {
    setMessages([{ id: 'welcome', role: 'assistant', content: '', timestamp: new Date() }]);
  };

  return (
    <AgenticAIContext.Provider value={{
      messages,
      isProcessing,
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
