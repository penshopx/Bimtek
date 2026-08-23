'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

const JABATAN_LIST = [
  'Ahli Teknik Sipil Madya',
  'Ahli Teknik Bangunan Gedung',
  'Ahli K3 Konstruksi',
  'Site Manager Bangunan Gedung',
  'Project Manager Konstruksi',
  'Quantity Surveyor',
  'Ahli Jalan Raya',
  'Ahli Jembatan',
  'Ahli Geoteknik',
  'Ahli Teknik Lingkungan',
  'Ahli Mekanikal Gedung',
  'Ahli Elektrikal Gedung',
  'Pelaksana Lapangan Pekerjaan Gedung',
  'Pelaksana Lapangan Pekerjaan Jalan',
  'Mandor Konstruksi',
];

const JENJANG_LIST = [
  { value: 'Operator (Level 1-3)', label: 'Operator — Level 1–3' },
  { value: 'Teknisi/Analis (Level 4-5)', label: 'Teknisi/Analis — Level 4–5' },
  { value: 'Muda (Level 5)', label: 'Muda — Level 5' },
  { value: 'Madya (Level 6)', label: 'Madya — Level 6' },
  { value: 'Utama (Level 7-9)', label: 'Utama — Level 7–9' },
];

type Mode = 'latihan' | 'simulasi';
type MicState = 'idle' | 'listening' | 'unsupported' | 'denied';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Browser SpeechRecognition type shim
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function SimulatorWawancaraPage() {
  const router = useRouter();
  const [jabatan, setJabatan] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [mode, setMode] = useState<Mode>('latihan');
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(false);
  const [micState, setMicState] = useState<MicState>('idle');
  const [interimText, setInterimText] = useState('');
  const [voiceAvailable, setVoiceAvailable] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  // AbortController for in-flight AI requests
  const abortRef = useRef<AbortController | null>(null);
  // Session tag: incremented on reset so a stale response is discarded
  const sessionTagRef = useRef(0);

  useEffect(() => {
    setVoiceAvailable(getSpeechRecognition() !== null);
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, interimText]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setMicState('idle');
    setInterimText('');
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setMicState('unsupported');
      return;
    }
    if (recognitionRef.current) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = e.results.length - 1; i >= 0; i--) {
        if (e.results[i].isFinal) {
          final = e.results[i][0].transcript;
          break;
        } else {
          interim = e.results[i][0].transcript;
        }
      }
      if (final) {
        setInput((prev) => (prev ? prev + ' ' + final.trim() : final.trim()));
        setInterimText('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height =
            Math.min(textareaRef.current.scrollHeight, 160) + 'px';
        }
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'not-allowed' || e.error === 'permission-denied') {
        setMicState('denied');
      } else if (e.error !== 'aborted') {
        setMicState('idle');
      }
      recognitionRef.current = null;
      setInterimText('');
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setMicState((prev) => (prev === 'listening' ? 'idle' : prev));
      setInterimText('');
    };

    try {
      recognition.start();
      setMicState('listening');
      setInterimText('');
    } catch {
      setMicState('idle');
      recognitionRef.current = null;
    }
  }, [stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  async function sendToAI(
    history: Message[],
    jab: string,
    jen: string,
    mod: Mode,
    tag: number
  ) {
    // Abort any previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError('');
    setAuthError(false);
    try {
      const sessionId =
        typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;
      const res = await fetch('/api/simulator-wawancara', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId ? { 'x-session-id': sessionId } : {}),
        },
        signal: controller.signal,
        body: JSON.stringify({ messages: history, jabatan: jab, jenjang: jen, mode: mod }),
      });

      // Discard stale response if session was reset
      if (sessionTagRef.current !== tag) return;

      if (res.status === 401) {
        setAuthError(true);
        setStarted(false);
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Gagal terhubung ke AI' }));
        throw new Error(err.error ?? 'Gagal terhubung ke AI');
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const assistantMsg: Message = { role: 'assistant', content: data.content };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return; // cancelled
      if (sessionTagRef.current !== tag) return;
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
    } finally {
      if (sessionTagRef.current === tag) setLoading(false);
    }
  }

  async function startSession() {
    if (!jabatan || !jenjang) return;
    // New session tag to invalidate any previous requests
    sessionTagRef.current += 1;
    const tag = sessionTagRef.current;
    setStarted(true);
    setMessages([]);
    setError('');
    setAuthError(false);
    await sendToAI([], jabatan, jenjang, mode, tag);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    stopListening();
    const userMsg: Message = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setInterimText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendToAI(newHistory, jabatan, jenjang, mode, sessionTagRef.current);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleReset() {
    // Increment tag so any in-flight response is discarded
    sessionTagRef.current += 1;
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    stopListening();
    setStarted(false);
    setMessages([]);
    setInput('');
    setInterimText('');
    setError('');
    setAuthError(false);
    setLoading(false);
    setMicState('idle');
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  }

  const canStart = jabatan !== '' && jenjang !== '';

  const micLabel =
    micState === 'listening'
      ? 'Mendengarkan… (klik untuk stop)'
      : micState === 'denied'
      ? 'Izin mikrofon ditolak'
      : micState === 'unsupported'
      ? 'Browser tidak mendukung mikrofon'
      : 'Jawab dengan suara';

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Hero */}
        <div className="border-b border-slate-700 bg-slate-900/60 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎙️</span>
              <h1 className="text-2xl font-bold text-white">Simulator Wawancara SKK</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xl">
              Latih dirimu menjawab pertanyaan asesor BNSP sebelum hari-H asesmen. AI berperan
              sebagai asesor yang menguji kompetensi sesuai jabatan dan jenjangmu. Jawab dengan
              mengetik atau langsung bicara menggunakan mikrofon.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
          {/* Auth error banner */}
          {authError && (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl px-5 py-4 flex items-start gap-3">
              <span className="text-2xl">🔐</span>
              <div>
                <p className="text-amber-300 font-semibold text-sm">Masuk terlebih dahulu</p>
                <p className="text-amber-400/80 text-xs mt-0.5">
                  Simulator Wawancara hanya tersedia untuk pengguna yang sudah login.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-semibold transition-all"
                >
                  Masuk Sekarang
                </button>
              </div>
            </div>
          )}

          {/* Setup panel */}
          {!started && !authError && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-5">
              <h2 className="text-white font-semibold text-lg">Pilih Jabatan &amp; Mode</h2>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">
                  Jabatan SKK
                </label>
                <select
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">— Pilih jabatan —</option>
                  {JABATAN_LIST.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">
                  Jenjang KKNI
                </label>
                <select
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">— Pilih jenjang —</option>
                  {JENJANG_LIST.map((j) => (
                    <option key={j.value} value={j.value}>{j.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Mode Latihan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode('latihan')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      mode === 'latihan'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">💬</span>
                      <span className="font-semibold text-white text-sm">Latihan Bebas</span>
                      {mode === 'latihan' && (
                        <span className="ml-auto text-amber-400 text-xs font-bold">✓ Dipilih</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Chat terbuka dengan asesor AI. Tanya, jawab, dan minta feedback kapan saja.
                    </p>
                  </button>

                  <button
                    onClick={() => setMode('simulasi')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      mode === 'simulasi'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🎯</span>
                      <span className="font-semibold text-white text-sm">Simulasi Terstruktur</span>
                      {mode === 'simulasi' && (
                        <span className="ml-auto text-blue-400 text-xs font-bold">✓ Dipilih</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      5 pertanyaan resmi berurutan dengan penilaian akhir. Mirip asesmen BNSP
                      sesungguhnya — cocok untuk uji kesiapan.
                    </p>
                  </button>
                </div>
              </div>

              {voiceAvailable && (
                <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-300 text-xs">
                  <span className="text-base flex-shrink-0">🎙️</span>
                  <span>
                    <strong>Fitur suara tersedia.</strong> Setelah sesi dimulai, gunakan tombol
                    mikrofon untuk menjawab pertanyaan langsung dengan berbicara — persis seperti
                    wawancara sungguhan.
                  </span>
                </div>
              )}

              <button
                onClick={startSession}
                disabled={!canStart}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-400 text-slate-900"
              >
                {canStart ? '🚀 Mulai Sesi Wawancara' : 'Pilih jabatan & jenjang terlebih dahulu'}
              </button>
            </div>
          )}

          {/* Chat area */}
          {started && (
            <div className="flex flex-col gap-4">
              {/* Session header */}
              <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg">{mode === 'simulasi' ? '🎯' : '💬'}</span>
                  <span className="text-white font-semibold text-sm">{jabatan}</span>
                  <span className="text-slate-400 text-sm">·</span>
                  <span className="text-slate-400 text-sm">{jenjang}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      mode === 'simulasi'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {mode === 'simulasi' ? 'Simulasi Terstruktur' : 'Latihan Bebas'}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:text-white text-sm transition-colors ml-2"
                  title="Mulai ulang"
                >
                  ↩ Ulang
                </button>
              </div>

              {/* Messages */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="p-4 space-y-4 min-h-[300px] max-h-[55vh] overflow-y-auto">
                  {messages.length === 0 && loading && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm flex-shrink-0">
                        🎙️
                      </div>
                      <div className="bg-slate-700 rounded-xl px-4 py-3 max-w-[85%]">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm flex-shrink-0">
                          🎙️
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-sm flex-shrink-0">
                          👤
                        </div>
                      )}
                      <div
                        className={`rounded-xl px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'assistant'
                            ? 'bg-slate-700 text-slate-100'
                            : 'bg-amber-600/20 text-amber-100 border border-amber-600/30'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {loading && messages.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm flex-shrink-0">
                        🎙️
                      </div>
                      <div className="bg-slate-700 rounded-xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interim speech preview */}
                  {micState === 'listening' && interimText && (
                    <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-sm flex-shrink-0 animate-pulse">
                        🎤
                      </div>
                      <div className="rounded-xl px-4 py-3 max-w-[85%] text-sm leading-relaxed bg-red-500/10 border border-red-500/30 text-red-200 italic">
                        {interimText}…
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                      ⚠️ {error}
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Listening status bar */}
                {micState === 'listening' && (
                  <div className="border-t border-red-500/20 bg-red-500/5 px-4 py-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-xs font-medium">
                      Mendengarkan… bicara sekarang, lalu klik tombol stop atau kirim.
                    </span>
                  </div>
                )}

                {/* Mic denied / unsupported notice */}
                {(micState === 'denied' || micState === 'unsupported') && (
                  <div className="border-t border-slate-700 bg-slate-700/30 px-4 py-2">
                    <p className="text-slate-400 text-xs">
                      {micState === 'denied'
                        ? '⚠️ Izin mikrofon ditolak. Aktifkan izin mikrofon di pengaturan browser lalu muat ulang halaman.'
                        : '⚠️ Browser kamu tidak mendukung fitur mikrofon. Gunakan Chrome atau Edge untuk fitur suara.'}
                    </p>
                  </div>
                )}

                {/* Input area */}
                <div className="border-t border-slate-700 p-3 flex gap-2 items-end">
                  {/* Mic button */}
                  {voiceAvailable && (
                    <button
                      onClick={micState === 'listening' ? stopListening : startListening}
                      disabled={loading || micState === 'denied' || micState === 'unsupported'}
                      title={micLabel}
                      className={`p-2.5 rounded-xl flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        micState === 'listening'
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      {micState === 'listening' ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-6.5 9.5a.75.75 0 0 1 .75.75 5.75 5.75 0 0 0 11.5 0 .75.75 0 0 1 1.5 0 7.25 7.25 0 0 1-6.5 7.21V21h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.54A7.25 7.25 0 0 1 4.75 11.25a.75.75 0 0 1 .75-.75z" />
                        </svg>
                      )}
                    </button>
                  )}

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={autoResize}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      micState === 'listening'
                        ? 'Bicara sekarang… teks akan muncul di sini'
                        : 'Tulis atau rekam jawaban… (Enter kirim, Shift+Enter baris baru)'
                    }
                    rows={1}
                    disabled={loading}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 placeholder-slate-500"
                    style={{ minHeight: '42px', maxHeight: '160px' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-semibold text-sm transition-all flex-shrink-0"
                  >
                    Kirim
                  </button>
                </div>
              </div>

              {/* Tips */}
              {mode === 'simulasi' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 text-blue-300 text-xs">
                  💡 <strong>Tips Simulasi:</strong> Jawab setiap pertanyaan seolah kamu sedang
                  diasesmen sungguhan. Gunakan metode STAR: ceritakan <em>Situasi</em>,{' '}
                  <em>Tugas</em>, <em>Aksi</em>, dan <em>Hasil</em> nyata dari pengalamanmu.
                </div>
              )}
              {mode === 'latihan' && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-xs">
                  💡 <strong>Tips Latihan:</strong> Tidak ada aturan ketat di sini. Kamu bisa
                  meminta asesor mengulangi pertanyaan, meminta contoh jawaban yang baik, atau
                  bertanya topik tertentu yang ingin kamu kuasai.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
