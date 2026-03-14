// BimtekKita AI Configuration
// Comprehensive AI system for construction training platform

// ============================================
// EXPORTS
// ============================================

// Personas
export { personas, getPersona, getPersonasByCategory, type Persona } from './personas';

// System Prompts
export { 
  systemPrompts, 
  buildSystemPrompt, 
  getSystemPromptConfig, 
  type SystemPromptConfig 
} from './system-prompts';

// Knowledge Base
export { 
  knowledgeDocuments, 
  knowledgeChunks, 
  knowledgeCategories,
  searchKnowledge, 
  getKnowledgeByCategory, 
  getKnowledgeSummary,
  type KnowledgeDocument, 
  type KnowledgeChunk 
} from './knowledge-base';

// RAG
export { 
  ragConfig,
  analyzeQuery,
  ragPipeline,
  augmentContextWithKnowledge,
  formatSources,
  defaultResponseOptions,
  type RAGConfig,
  type QueryAnalysis,
  type RetrievalResult,
  type ResponseOptions
} from './rag';

// Expert Agents
export { 
  expertAgents, 
  getExpertAgent, 
  getAllExpertAgents,
  getExpertAgentsByCategory,
  getExpertAgentForQuery,
  type ExpertAgent,
  type AgentTool
} from './agents';

// ============================================
// AI CONFIGURATION
// ============================================

export interface AIConfiguration {
  version: string;
  lastUpdated: string;
  features: {
    agenticChat: boolean;
    rag: boolean;
    expertAgents: boolean;
    chatbotBuilder: boolean;
    knowledgeBase: boolean;
    marketingBot: boolean;
  };
  models: {
    primary: string;
    fallback: string;
    embedding: string;
  };
  limits: {
    maxTokens: number;
    maxContextLength: number;
    maxHistoryLength: number;
    rateLimit: number;
  };
}

export const aiConfig: AIConfiguration = {
  version: '1.0.0',
  lastUpdated: '2024-03-14',
  features: {
    agenticChat: true,
    rag: true,
    expertAgents: true,
    chatbotBuilder: true,
    knowledgeBase: true,
    marketingBot: true,
  },
  models: {
    primary: 'gpt-4o',
    fallback: 'gpt-4o-mini',
    embedding: 'text-embedding-3-small',
  },
  limits: {
    maxTokens: 4000,
    maxContextLength: 8000,
    maxHistoryLength: 20,
    rateLimit: 60, // requests per minute
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getAIConfig(): AIConfiguration {
  return aiConfig;
}

export function isAIFeatureEnabled(feature: keyof AIConfiguration['features']): boolean {
  return aiConfig.features[feature];
}

// ============================================
// CHATBOT BUILDER TYPES
// ============================================

export interface CustomChatbotConfig {
  id: string;
  name: string;
  description: string;
  type: 'mentoring' | 'problem-solving' | 'project-consultant';
  systemPrompt: string;
  modules: string[];
  knowledgeBase: string[];
  behavior: {
    temperature: number;
    maxTokens: number;
    includeSources: boolean;
    useRAG: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export function createDefaultChatbotConfig(type: CustomChatbotConfig['type']): Partial<CustomChatbotConfig> {
  const defaults: Record<CustomChatbotConfig['type'], Partial<CustomChatbotConfig>> = {
    'mentoring': {
      name: '',
      description: '',
      systemPrompt: `Anda adalah mentor AI untuk pembelajaran konstruksi. 
      
Fokus utama Anda adalah:
- Membantu pengguna memahami konsep dengan jelas
- Memberikan contoh aplikasi nyata di industri
- Memberikan latihan untuk menguji pemahaman
- Memberikan feedback dan saran perbaikan

Gunakan metode pembelajaran bertahap: Konsep → Contoh → Praktik → Evaluasi.`,
      behavior: {
        temperature: 0.7,
        maxTokens: 2000,
        includeSources: true,
        useRAG: true,
      },
    },
    'problem-solving': {
      name: '',
      description: '',
      systemPrompt: `Anda adalah ahli teknik konstruksi yang membantu memecahkan masalah.
      
Pendekatan Anda:
1. Pahami masalah dengan detail
2. Analisis kondisi dan batasan
3. Berikan solusi alternatif
4. Rekomendasikan solusi terbaik

Selalu jelaskan alasan teknis di balik rekomendasi Anda.`,
      behavior: {
        temperature: 0.5,
        maxTokens: 3000,
        includeSources: true,
        useRAG: true,
      },
    },
    'project-consultant': {
      name: '',
      description: '',
      systemPrompt: `Anda adalah konsultan proyek konstruksi.
      
Anda membantu pengguna dalam:
- Perencanaan proyek
- Pengambilan keputusan teknis
- Manajemen risiko
- Optimasi biaya dan waktu

Berikan analisis komprehensif dengan mempertimbangkan aspek teknis, biaya, dan waktu.`,
      behavior: {
        temperature: 0.3,
        maxTokens: 3500,
        includeSources: true,
        useRAG: true,
      },
    },
  };
  
  return defaults[type];
}

// ============================================
// MARKETING CHATBOT CONFIG
// ============================================

export interface MarketingChatbotConfig {
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  greeting: string;
  primaryColor: string;
  theme: 'light' | 'dark';
  features: {
    showLauncher: boolean;
    showAvatars: boolean;
    enableSound: boolean;
    persistent: boolean;
  };
  quickReplies: {
    label: string;
    action: string;
  }[];
}

export const marketingBotConfig: MarketingChatbotConfig = {
  enabled: true,
  position: 'bottom-right',
  greeting: 'Halo! Ada yang bisa kami bantu? 👋',
  primaryColor: '#F59E0B',
  theme: 'dark',
  features: {
    showLauncher: true,
    showAvatars: true,
    enableSound: false,
    persistent: false,
  },
  quickReplies: [
    { label: '📚 Pelajari BIMTEK', action: 'navigate:/bimtek' },
    { label: '❓ Tanya Jawab', action: 'open:chat' },
    { label: '📋 Sertifikasi', action: 'navigate:/sertifikasi' },
    { label: '🚀 Mulai Belajar', action: 'navigate:/dashboard' },
  ],
};

// ============================================
// EXPORT ALL TYPES
// ============================================

// Note: AppFeature, AgentSuggestion, ChatMessage are in AgenticAIProvider.tsx
// Import them from '@/components/AgenticAIProvider'
