'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
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
  modules: string[];
  knowledgeBase: { id: string; title: string; content: string }[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isAIError?: boolean;
  isMessageTooLarge?: boolean;
}

export default function ChatbotDetailPage() {
  const params = useParams();
  const chatbotId = params.id as string;
  
  const [chatbot, setChatbot] = useState<CustomChatbot | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('customChatbots');
    if (saved) {
      const chatbots: CustomChatbot[] = JSON.parse(saved);
      const found = chatbots.find(c => c.id === chatbotId);
      if (found) {
        setChatbot(found);
        if (found.welcome?.greeting) {
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: found.welcome.greeting,
            timestamp: new Date(),
          }]);
        }
      }
    }
  }, [chatbotId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<{ content: string; isAIError: boolean; isMessageTooLarge?: boolean }> => {
    if (!chatbot) return { content: 'Chatbot not found', isAIError: false };
    
    const systemPrompt = chatbot.personality?.systemPrompt || `Anda adalah ${chatbot.name} - ${chatbot.description || 'asisten AI'}`;
    
    try {
      // Trim history by estimated token budget rather than a fixed message count.
      // Budget: 8000 context tokens − system prompt − reserved response tokens − 300 for the new user message.
      const { trimHistoryByTokenBudget, isMessageTooLargeForBudget } = await import('@/lib/ai/token-utils');
      const reserveForResponse = chatbot.aiConfig?.maxTokens || 1024;

      // Guard: warn the user if their message alone exceeds the context window.
      if (isMessageTooLargeForBudget(userMessage, systemPrompt, 8000, reserveForResponse)) {
        return {
          content:
            'Pesan Anda terlalu panjang untuk diproses AI dalam satu konteks. Coba pisahkan pesan menjadi bagian-bagian yang lebih pendek atau kurangi panjangnya.',
          isAIError: false,
          isMessageTooLarge: true,
        };
      }

      const trimmedHistory = trimHistoryByTokenBudget(
        messages.filter(m => m.role === 'user' || m.role === 'assistant'),
        systemPrompt,
        8000,
        reserveForResponse,
      );
      const history = trimmedHistory.map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: chatbot.aiConfig?.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: userMessage }
          ],
          max_tokens: chatbot.aiConfig?.maxTokens || 1024,
          temperature: chatbot.aiConfig?.temperature || 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        content: data.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda.',
        isAIError: false,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        content: generateRuleBasedResponse(userMessage, chatbot),
        isAIError: true,
      };
    }
  };

  const generateRuleBasedResponse = (userMessage: string, cb: CustomChatbot): string => {
    const lower = userMessage.toLowerCase();
    
    // Check off-topic
    if (cb.offTopic?.strategy === 'custom' && cb.offTopic.customResponse) {
      // Simple off-topic detection
      const keywords = cb.modules?.map(m => m.toLowerCase()) || [];
      const isOffTopic = !keywords.some(kw => lower.includes(kw));
      if (isOffTopic) {
        return cb.offTopic.customResponse;
      }
    }
    
    // Default responses based on type
    if (cb.type === 'mentoring') {
      return `Saya ${cb.name} - mentor pembelajaran konstruksi Anda.

Fokus pembelajaran: ${cb.modules?.join(', ') || 'konstruksi umum'}

Saya bisa membantu:
• Menjelaskan konsep dengan detail
• Memberikan contoh aplikasi
• Memberikan latihan untuk menguji pemahaman
• Memberikan feedback

Apa yang ingin Anda pelajari?`;
    }
    
    if (cb.type === 'problem-solving') {
      return `Saya ${cb.name} - konsultan pemecahan masalah konstruksi.

Saya fokus pada: ${cb.modules?.join(', ') || 'konstruksi'}

Ceritakan masalah teknis yang Anda hadapi, saya akan membantu menganalisis dan memberikan solusi.`;
    }
    
    if (cb.type === 'project-consultant') {
      return `Saya ${cb.name} - konsultan proyek konstruksi.

Saya siap membantu Anda dengan:
• Perencanaan proyek
• Pengambilan keputusan teknis
• Manajemen risiko
• Optimasi biaya dan waktu

Apa yang ingin Anda konsultasikan?`;
    }
    
    return `Halo! Saya ${cb.name}. ${cb.description || 'Saya siap membantu Anda.'}`;
  };

  const sendMessage = async (userMessage: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);
    setLastUserMessage(userMessage);
    setIsProcessing(true);
    
    const { content, isAIError, isMessageTooLarge } = await generateResponse(userMessage);
    
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      isAIError,
      isMessageTooLarge,
    }]);
    
    setIsProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !chatbot) return;
    const userMessage = input;
    setInput('');
    await sendMessage(userMessage);
  };

  const handleRetry = async () => {
    if (!lastUserMessage || isProcessing) return;
    // Remove last error assistant message and last user message, then resend
    setMessages(prev => {
      const reversed = [...prev].reverse();
      const lastAssistant = reversed.find(m => m.role === 'assistant' && m.isAIError);
      const lastUser = reversed.find(m => m.role === 'user');
      return prev.filter(m => m.id !== lastAssistant?.id && m.id !== lastUser?.id);
    });
    await sendMessage(lastUserMessage);
  };

  const handleQuickReply = async (text: string) => {
    if (isProcessing) return;
    await sendMessage(text);
  };

  if (!chatbot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-white mb-2">Chatbot Tidak Ditemukan</h2>
          <p className="text-slate-400 mb-4">Chatbot yang Anda cari mungkin sudah dihapus</p>
          <Link href="/chatbot-builder" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl">
            Kembali ke Chatbot Builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/chatbot-builder" className="text-slate-400 hover:text-white">
            ← Kembali
          </Link>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-700 flex items-center gap-3">
            <div className="text-3xl">{chatbot.avatar}</div>
            <div>
              <h1 className="text-xl font-bold text-white">{chatbot.name}</h1>
              {chatbot.tagline && (
                <p className="text-sm text-amber-500">{chatbot.tagline}</p>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {chatbot.agentic?.enabled && (
                <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">
                  ⚡ Agentic
                </span>
              )}
              {chatbot.rag?.enabled && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded-full">
                  📚 RAG
                </span>
              )}
            </div>
          </div>

          {/* Quick Replies (Conversation Starters) */}
          {chatbot.welcome?.starters && messages.length === 1 && (
            <div className="p-3 border-b border-slate-700 flex gap-2 overflow-x-auto">
              {chatbot.welcome.starters.filter(s => s).map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(starter)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-amber-500 text-white text-sm rounded-full whitespace-nowrap transition-colors"
                >
                  {starter}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{chatbot.avatar}</span>
                      <span className="text-slate-400 text-sm">{chatbot.name}</span>
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
                    {msg.isMessageTooLarge && (
                      <div className="flex items-center gap-2 mb-2 text-red-400 text-xs font-medium">
                        <span>✂️</span>
                        <span>Pesan terlalu panjang untuk konteks AI</span>
                      </div>
                    )}
                    {msg.isAIError && !msg.isMessageTooLarge && (
                      <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-medium">
                        <span>⚠️</span>
                        <span>AI sedang tidak tersedia — menggunakan respons otomatis</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.isAIError && !msg.isMessageTooLarge && (
                      <button
                        onClick={handleRetry}
                        disabled={isProcessing}
                        className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/40 disabled:opacity-50 text-amber-400 text-xs rounded-lg transition-colors"
                      >
                        <span>🔄</span>
                        <span>Coba lagi dengan AI</span>
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{chatbot.avatar}</span>
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

          {/* Input Form */}
          <form id="chat-form" onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Tanyakan sesuatu ke ${chatbot.name}...`}
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
          </form>
        </div>
      </div>
    </div>
  );
}
