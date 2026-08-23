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
  isAIError?: boolean;
  retryMessage?: string;
  isMessageTooLarge?: boolean;
  /** True when this message was sent as a truncated version of an oversized message. */
  isMessageTruncated?: boolean;
}

/** Thrown when the user's own message exceeds the remaining context budget. */
class MessageTooLargeError extends Error {
  constructor() {
    super('MESSAGE_TOO_LARGE');
    this.name = 'MessageTooLargeError';
  }
}

interface AgenticAIContextType {
  messages: ChatMessage[];
  isProcessing: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  addMessage: (content: string, role: 'user' | 'assistant' | 'system') => void;
  processMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearMessages: () => void;
  appFeatures: AppFeature[];
  /** The original text of the most recent oversized message, or null if none. */
  oversizedMessage: string | null;
  /** Send a truncated version of the last oversized message to the AI. */
  sendShortenedMessage: () => Promise<void>;
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
  return `Anda adalah Agentic AI SiapSKK, asisten AI profesional untuk platform persiapan uji kompetensi SKK (Sertifikat Kompetensi Kerja) bidang konstruksi Indonesia.

TENTANG SIAPSKK:
- Platform persiapan uji kompetensi SKK bidang Sipil & Manajemen Pelaksanaan
- 67+ modul BIMTEK pelatihan (Struktur, K3, Manajemen, Elektrikal, Plumbing)
- 65+ soal latihan berdasarkan unit kompetensi SKKNI
- 334+ posisi jabatan SKK (Operator, Teknisi/Analis, Ahli)
- 8 Expert Agents: Struktur, K3, Manajemen, Elektrikal, Plumbing, RAB, Fondasi, QC
- Event offline Bimtek tatap muka di berbagai kota
- Tools: Solver teknis, RAB Calculator, Mix Design

FITUR APLIKASI:
- /dashboard - Ringkasan progress persiapan SKK
- /bimtek - Modul pelatihan per unit kompetensi
- /quiz - Simulasi asesmen & latihan soal
- /sertifikasi - 334+ jabatan SKK & persyaratan
- /certify - Panduan 5 langkah proses sertifikasi
- /matrix - Peta unit kompetensi per jabatan
- /offline - Event Bimtek tatap muka
- /chat - Konsultasi dengan 8 Expert AI
- /solver - Kalkulator teknik sipil & manajemen
- /knowledge-base - Regulasi & standar SKK

TENTANG SERTIFIKASI KOMPETENSI KERJA (SKK):
SKK adalah bukti tertulis yang diberikan oleh lembaga sertifikasi profesi terakreditasi kepada tenaga kerja konstruksi yang telah memenuhi standar kompetensi. SKK wajib dimiliki oleh tenaga kerja konstruksi sesuai UU No. 2 Tahun 2017 tentang Jasa Konstruksi.

REGULASI SKK YANG BERLAKU:
1. Permen PU No. 6 Tahun 2025 — Standar kompetensi tenaga kerja konstruksi terbaru
2. KM PUPR No. 713/KPTS/M/2022 — Pengaturan jabatan dan kualifikasi SKK
3. SK DJBK No. 114/KPTS/DK/2024 — Pedoman pelaksanaan Asesmen Jarak Jauh (AJJ)
4. Permen PU No. 12 Tahun 2021 — Standar dan pedoman pengadaan jasa konstruksi

TIGA METODE ASESMEN SKK:
1. **Hardcopy** — Asesmen tatap muka dengan formulir fisik (tradisional)
2. **Paperless** — Asesmen digital di lokasi tanpa kertas, formulir elektronik
3. **Asesmen Jarak Jauh (AJJ)** — Asesmen online via video call, diatur dalam SK DJBK 114/2024

DOKUMEN PORTOFOLIO YANG DIPERLUKAN:
- FR.APL.01 — Formulir permohonan sertifikasi kompetensi
- FR.APL.02 — Asesmen mandiri (self-assessment)
- Bukti pengalaman kerja (referensi proyek, foto, kontrak)
- Ijazah pendidikan formal
- KTP dan pas foto
- Sertifikat pelatihan yang relevan

KUALIFIKASI JABATAN SKK (BIDANG SIPIL & MANAJEMEN PELAKSANAAN):
- **Operator** — Jenjang 1-4 KKNI, pelaksana lapangan
- **Teknisi/Analis** — Jenjang 4-6 KKNI, pengawas dan teknisi
- **Ahli** — Jenjang 6-9 KKNI: Ahli Muda, Ahli Madya, Ahli Utama

KAPABILITAS ANDA:
1. Membantu Asesi memahami persyaratan dan prosedur uji kompetensi SKK
2. Menjelaskan perbedaan metode asesmen (hardcopy/paperless/AJJ)
3. Memandu persiapan dokumen portofolio per jabatan SKK
4. Menjawab pertanyaan teknis (SNI, SKKNI, unit kompetensi)
5. Memberikan saran strategi persiapan asesmen
6. Membantu navigasi ke fitur aplikasi yang tepat

ATURAN MENJAWAB:
- Selalu jawab dalam bahasa Indonesia yang baik dan mudah dipahami
- Gunakan formatting markdown untuk jawaban yang terstruktur
- Sebutkan regulasi/standar yang relevan (Permen PU, SKKNI, SNI)
- Berikan langkah-langkah konkret dan actionable
- Jika tidak yakin, akui ketidakpastian dan sarankan sumber resmi (LPJK, BSN, Kementerian PU)

KNOWLEDGE BASE MENCAKUP:
- SNI 2847:2019 (Beton), SNI 1729:2020 (Baja), SNI 1726:2019 (Gempa)
- Permenaker 9/2016 (K3 Konstruksi)
- PMBOK, EVM, CPM (Manajemen Proyek)
- PUIL 2020 (Instalasi Listrik)
- Analisis Harga Satuan & RAB
- Regulasi SKK: Permen PU 6/2025, KM 713/2022, SK DJBK 114/2024

Gunakan pengetahuan ini untuk membantu Asesi sukses dalam uji kompetensi SKK.`;
}

async function callAIAPI(
  message: string,
  history: ChatMessage[],
  reserveForUserMessage = 300,
): Promise<string> {
  const systemPrompt = buildSystemPrompt();

  // Trim history by estimated token budget rather than a fixed message count.
  // Budget: 8000 context tokens − system prompt − 1000 reserved for the response − reserveForUserMessage.
  const { trimHistoryByTokenBudget, isMessageTooLargeForBudget } = await import('@/lib/ai/token-utils');

  // Guard: if the user's own message is too large to fit in the context window
  // (even with no history), throw a typed error so the caller can warn the user.
  if (isMessageTooLargeForBudget(message, systemPrompt, 8000, 1000)) {
    throw new MessageTooLargeError();
  }

  const trimmedHistory = trimHistoryByTokenBudget(
    history.filter(m => m.role === 'user' || m.role === 'assistant'),
    systemPrompt,
    8000,
    1000,
    reserveForUserMessage,
  );

  const messages = [
    { role: 'system', content: systemPrompt },
    ...trimmedHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ];

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 1000, temperature: 0.7 }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda.';
}

function generateRuleBasedResponse(userMessage: string): { content: string; suggestions?: AgentSuggestion[] } {
  const lowerMessage = userMessage.toLowerCase();
  let response = '';
  let suggestions: AgentSuggestion[] = [];
  
  if (lowerMessage.includes('halo') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
    response = `Halo! Saya Agentic AI SiapSKK 🤖

Saya adalah asisten AI yang dapat membantu Anda dengan:
• **Navigasi** - Menunjukkan fitur-fitur aplikasi
• **Informasi** - Menjelaskan tentang BIMTEK, Quiz, Sertifikasi
• **Saran** - Memberikan rekomendasi pembelajaran
• **Konsultasi** - Menjawab pertanyaan teknis konstruksi

Coba tanyakan sesuatu:
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
    response = `📱 **Fitur-fitur SiapSKK:**

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

SiapSKK menawarkan **67+ modul pelatihan** 包括:

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

SiapSKK menyediakan **334+ posisi pekerjaan** dengan persyaratan SKK.

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
    response = `🤖 **Agentic AI SiapSKK**

Saya mengerti "${userMessage}". 

Saya bisa membantu Anda dengan:
• Navigasi: "Ke BIMTEK", "Ke Quiz"
• Informasi: "Apa itu SKK?", "Berapa banyak modul?"
• Saran: "Apa yang harus saya belajar?"
• Pertanyaan teknis konstruksi`;
    
    suggestions = [
      { id: 'bimtek', type: 'navigation', title: 'Jelajahi BIMTEK', description: '67+ modul', action: () => window.location.href = '/bimtek' },
      { id: 'chat', type: 'navigation', title: 'Expert Chat', description: '8 expert agents', action: () => window.location.href = '/chat' },
    ];
  }
  
  return { content: response, suggestions };
}

export function AgenticAIProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [oversizedMessage, setOversizedMessage] = useState<string | null>(null);

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
    setLastUserMessage(content);
    setIsProcessing(true);

    const userMessage = content;
    const history = messages;

    try {
      let response: string;
      let aiError = false;

      try {
        response = await callAIAPI(userMessage, history);
      } catch (apiError) {
        console.error('AI API Error:', apiError);

        // If the user's message is too large to fit the context window, surface a
        // dedicated inline warning with a shorten offer instead of falling back silently.
        if (apiError instanceof MessageTooLargeError) {
          setOversizedMessage(userMessage);
          const warningMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content:
              'Pesan Anda terlalu panjang untuk diproses AI dalam satu konteks. Anda dapat mengirim versi yang diperpendek, atau pisahkan pesan menjadi bagian-bagian yang lebih pendek.',
            timestamp: new Date(),
            isMessageTooLarge: true,
          };
          setMessages(prev => [...prev, warningMessage]);
          setIsProcessing(false);
          return;
        }

        aiError = true;
        // Fall back to rule-based if AI unavailable
        const fallback = generateRuleBasedResponse(userMessage);
        response = fallback.content;
      }

      const suggestions = generateRuleBasedResponse(userMessage).suggestions;
      
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions,
        toolsUsed: aiError ? [] : ['OpenAI API'],
        isAIError: aiError,
        retryMessage: aiError ? userMessage : undefined,
      };
      
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date(),
        isAIError: true,
        retryMessage: userMessage,
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsProcessing(false);
  };

  const sendShortenedMessage = async () => {
    if (!oversizedMessage || isProcessing) return;
    setIsProcessing(true);

    const { truncateMessageToFit, estimateTokens } = await import('@/lib/ai/token-utils');
    const systemPrompt = buildSystemPrompt();
    const truncated = truncateMessageToFit(oversizedMessage, systemPrompt, 8000, 1000);
    // Reserve the actual token count of the truncated message so history trimming
    // leaves the right budget (not just the default 300-token reserve).
    const truncatedTokens = estimateTokens(truncated) + 10;

    // Compute the cleaned history: remove the oversized user bubble and the too-large warning.
    let historyForAI = [...messages];
    const lastTooLargeIdx = [...historyForAI].map(m => m.isMessageTooLarge).lastIndexOf(true);
    if (lastTooLargeIdx !== -1) historyForAI.splice(lastTooLargeIdx, 1);
    const lastUserIdx = [...historyForAI].map(m => m.role).lastIndexOf('user');
    if (lastUserIdx !== -1) historyForAI.splice(lastUserIdx, 1);

    const truncatedUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: truncated,
      timestamp: new Date(),
      isMessageTruncated: true,
    };
    setMessages([...historyForAI, truncatedUserMsg]);
    setOversizedMessage(null);
    setLastUserMessage(truncated);

    try {
      let response: string;
      let aiError = false;

      try {
        response = await callAIAPI(truncated, historyForAI, truncatedTokens);
      } catch (apiError) {
        console.error('AI API Error (shortened):', apiError);
        aiError = true;
        const fallback = generateRuleBasedResponse(truncated);
        response = fallback.content;
      }

      const suggestions = generateRuleBasedResponse(truncated).suggestions;
      const responseMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions,
        toolsUsed: aiError ? [] : ['OpenAI API'],
        isAIError: aiError,
        retryMessage: aiError ? truncated : undefined,
        isMessageTruncated: true,
      };
      setMessages(prev => [...prev, responseMsg]);
    } catch (error) {
      console.error('Error (shortened):', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date(),
        isAIError: true,
        retryMessage: truncated,
        isMessageTruncated: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    }

    setIsProcessing(false);
  };

  const retryLastMessage = async () => {
    if (!lastUserMessage || isProcessing) return;
    // Remove the last assistant message (the error one) before retrying
    setMessages(prev => {
      const last = [...prev].reverse().find(m => m.role === 'assistant' && m.isAIError);
      if (!last) return prev;
      return prev.filter(m => m.id !== last.id);
    });
    // Also remove the last user message so processMessage can re-add it
    setMessages(prev => {
      const reversed = [...prev].reverse();
      const lastUser = reversed.find(m => m.role === 'user');
      if (!lastUser) return prev;
      return prev.filter(m => m.id !== lastUser.id);
    });
    await processMessage(lastUserMessage);
  };

  const clearMessages = () => {
    setMessages([]);
    setLastUserMessage(null);
  };

  return (
    <AgenticAIContext.Provider value={{
      messages,
      isProcessing,
      apiKey: '',
      setApiKey: () => {},
      addMessage,
      processMessage,
      retryLastMessage,
      clearMessages,
      appFeatures,
      oversizedMessage,
      sendShortenedMessage,
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
