import { searchKnowledge, knowledgeChunks, knowledgeDocuments, KnowledgeDocument, KnowledgeChunk } from './knowledge-base';

export interface RAGConfig {
  enabled: boolean;
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  similarityThreshold: number;
  maxContextLength: number;
  useHybridSearch: boolean;
  rerankResults: boolean;
}

export interface RetrievalResult {
  document: KnowledgeDocument;
  chunks: string[];
  score: number;
  source: string;
}

export interface RAGResponse {
  answer: string;
  sources: RetrievalResult[];
  context: string;
}

// Default RAG Configuration
export const ragConfig: RAGConfig = {
  enabled: true,
  chunkSize: 500,
  chunkOverlap: 100,
  topK: 5,
  similarityThreshold: 0.3,
  maxContextLength: 4000,
  useHybridSearch: true,
  rerankResults: true,
};

// ============================================
// RETRIEVAL FUNCTIONS
// ============================================

function keywordMatchScore(query: string, chunk: KnowledgeChunk): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  let score = 0;
  
  // Check category match
  if (chunk.metadata.category.toLowerCase().includes(queryWords[0])) {
    score += 5;
  }
  
  // Check keywords
  chunk.metadata.keywords.forEach(kw => {
    queryWords.forEach(qw => {
      if (kw.toLowerCase().includes(qw)) {
        score += 2;
      }
    });
  });
  
  // Check importance
  score += chunk.metadata.importance * 0.5;
  
  return score;
}

function calculateChunkRelevance(query: string, chunks: KnowledgeChunk[]): KnowledgeChunk[] {
  return chunks
    .map(chunk => ({
      chunk,
      score: keywordMatchScore(query, chunk),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.chunk);
}

function buildContextFromChunks(chunks: string[], maxLength: number = 4000): string {
  let context = '';
  
  for (const chunk of chunks) {
    if ((context + chunk).length > maxLength) {
      break;
    }
    context += chunk + '\n\n';
  }
  
  return context.trim();
}

function extractRelevantChunks(query: string, topK: number = 5): RetrievalResult[] {
  // Use the searchKnowledge function
  const results = searchKnowledge(query, topK);
  
  return results.map(result => ({
    document: result.document,
    chunks: result.chunks,
    score: 1,
    source: result.document.source,
  }));
}

// ============================================
// RAG PIPELINE
// ============================================

export async function ragPipeline(
  query: string,
  options: {
    useRAG?: boolean;
    customContext?: string;
    personaId?: string;
  } = {}
): Promise<RAGResponse> {
  const { useRAG = true, customContext, personaId } = options;
  
  if (!useRAG) {
    return {
      answer: '',
      sources: [],
      context: customContext || '',
    };
  }
  
  // Retrieve relevant knowledge
  const retrieved = extractRelevantChunks(query, ragConfig.topK);
  
  // Build context from retrieved knowledge
  const allChunks = retrieved.flatMap(r => r.chunks);
  const context = buildContextFromChunks(allChunks, ragConfig.maxContextLength);
  
  // Build sources list
  const sources: RetrievalResult[] = retrieved.map(r => ({
    document: r.document,
    chunks: r.chunks.slice(0, 2),
    score: r.score,
    source: r.source,
  }));
  
  return {
    answer: '',
    sources,
    context,
  };
}

// ============================================
// CONTEXT AUGMENTATION
// ============================================

export function augmentContextWithKnowledge(
  systemPrompt: string,
  userQuery: string,
  maxContextLength: number = 4000
): string {
  const retrieval = extractRelevantChunks(userQuery, 3);
  
  if (retrieval.length === 0) {
    return systemPrompt;
  }
  
  let knowledgeContext = '\n\n## KNOWLEDGE BASE CONTEXT\n';
  knowledgeContext += 'Gunakan informasi berikut untuk menjawab pertanyaan:\n\n';
  
  retrieval.forEach((result, idx) => {
    knowledgeContext += `--- Sumber ${idx + 1}: ${result.document.title} (${result.source}) ---\n`;
    result.chunks.slice(0, 2).forEach(chunk => {
      knowledgeContext += chunk + '\n';
    });
    knowledgeContext += '\n';
  });
  
  // Truncate if too long
  if ((systemPrompt + knowledgeContext).length > maxContextLength * 2) {
    knowledgeContext = knowledgeContext.slice(0, maxContextLength);
  }
  
  return systemPrompt + knowledgeContext;
}

// ============================================
// QUERY ANALYSIS
// ============================================

export interface QueryAnalysis {
  category: string | null;
  intent: 'information' | 'calculation' | 'guidance' | 'troubleshooting' | 'recommendation';
  complexity: 'simple' | 'moderate' | 'complex';
  keywords: string[];
  requiresRAG: boolean;
}

export function analyzeQuery(query: string): QueryAnalysis {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/);
  
  // Detect category
  let category: string | null = null;
  const categoryKeywords: Record<string, string[]> = {
    struktur: ['struktur', 'beton', 'baja', 'balok', 'kolom', 'plat', 'tulangan', 'lentur', 'geser'],
    fondasi: ['fondasi', 'pondasi', 'bore', 'pile', 'tanah', 'dukung', 'settlement'],
    k3: ['k3', 'keselamatan', 'apd', 'safety', 'p2k3', 'hazard', 'risiko'],
    manajemen: ['manajemen', 'proyek', 'schedule', 'cpm', 'evm', 'biaya', 'budget'],
    elektrikal: ['listrik', 'elektrikal', 'kabel', 'mcb', 'puil', 'tegangan'],
    rab: ['rab', 'harga', 'satuan', 'estimasi', 'boq', 'quantity', 'biaya'],
    qc: ['quality', 'qc', 'test', 'pengujian', 'inspeksi', 'beton'],
    sertifikasi: ['sertifikasi', 'skk', 'bnsp', 'kompetensi', 'jenjang'],
  };
  
  for (const [cat, kws] of Object.entries(categoryKeywords)) {
    if (kws.some(kw => queryLower.includes(kw))) {
      category = cat;
      break;
    }
  }
  
  // Detect intent
  let intent: QueryAnalysis['intent'] = 'information';
  if (queryLower.includes('hitung') || queryLower.includes('berapakah') || queryLower.includes('rumus')) {
    intent = 'calculation';
  } else if (queryLower.includes('bagaimana') || queryLower.includes('cara')) {
    intent = 'guidance';
  } else if (queryLower.includes('mengapa') || queryLower.includes('kenapa') || queryLower.includes('problem')) {
    intent = 'troubleshooting';
  } else if (queryLower.includes('saran') || queryLower.includes('rekomendasi') || queryLower.includes('pilihan')) {
    intent = 'recommendation';
  }
  
  // Detect complexity
  let complexity: QueryAnalysis['complexity'] = 'simple';
  if (query.length > 100 || words.length > 15) {
    complexity = 'moderate';
  }
  if (queryLower.includes('jelaskan secara detail') || queryLower.includes('analisis lengkap')) {
    complexity = 'complex';
  }
  
  // Determine if RAG is needed
  const requiresRAG = category !== null || intent !== 'information';
  
  return {
    category,
    intent,
    complexity,
    keywords: words.filter(w => w.length > 3),
    requiresRAG,
  };
}

// ============================================
// HYBRID RESPONSE GENERATOR
// ============================================

export interface ResponseOptions {
  persona: string;
  temperature: number;
  maxTokens: number;
  useRAG: boolean;
  includeSources: boolean;
}

export const defaultResponseOptions: ResponseOptions = {
  persona: 'general',
  temperature: 0.7,
  maxTokens: 1500,
  useRAG: true,
  includeSources: true,
};

export function formatSources(sources: RetrievalResult[]): string {
  if (sources.length === 0) return '';
  
  let formatted = '\n\n---\n**Sumber:**\n';
  sources.forEach((src, idx) => {
    formatted += `${idx + 1}. ${src.document.title} (${src.source})\n`;
  });
  
  return formatted;
}
