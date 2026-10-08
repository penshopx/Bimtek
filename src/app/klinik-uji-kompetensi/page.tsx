'use client';

import { useState, useRef, useEffect } from 'react';
import { klinikJenjangOptions, validateKlinikTarget, matchesKlinikTarget, type KlinikTarget } from '@/lib/klinik-target';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Blueprint {
  target: KlinikTarget;
  skorKesiapan: number;
  label: string;
  ringkasan: string;
  kekuatan: string[];
  gap: { area: string; deskripsi: string; prioritas: string }[];
  unitKompetensiPrioritas: { kode: string; nama: string; catatan: string }[];
  rencanaBelajar: { minggu: string; fokus: string; aktivitas: string }[];
  rekomendasiDokumen: string[];
  pesanMotivasi: string;
}

interface Question {
  id: number;
  type: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  explanation: string;
  unitKompetensi?: string;
}

interface ChatMsg { role: 'user' | 'assistant'; content: string; }

type Phase = 'dialog' | 'loading-blueprint' | 'blueprint' | 'chatbot' | 'loading-ujian' | 'ujian' | 'keputusan';

// ─── Step indicator ───────────────────────────────────────────────────────────

const steps = ['Dialog', 'Blueprint', 'Chatbot', 'Ruang Ujian', 'Keputusan'];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto py-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            i < current ? 'bg-green-500/20 text-green-400' :
            i === current ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' :
            'text-slate-500'
          }`}>
            <span>{i < current ? '✓' : i + 1}</span>
            <span className="hidden sm:block">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-6 h-0.5 mx-0.5 ${i < current ? 'bg-green-500' : 'bg-slate-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pendidikanOptions = ['SMA/SMK', 'D3', 'D4 / Sarjana Terapan', 'S1 (Sarjana)', 'S2 (Magister)'];
const pengalamanOptions = ['< 1 tahun', '1–2 tahun', '2–3 tahun', '3–5 tahun', '5–8 tahun', '8+ tahun'];

function scoreColor(s: number) {
  if (s >= 85) return { bar: 'bg-green-500', text: 'text-green-400', ring: 'text-green-400' };
  if (s >= 70) return { bar: 'bg-amber-500', text: 'text-amber-400', ring: 'text-amber-400' };
  return { bar: 'bg-red-500', text: 'text-red-400', ring: 'text-red-400' };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KlinikPage() {
  const [phase, setPhase] = useState<Phase>('dialog');
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dialog form
  const [jabatan, setJabatan] = useState('');
  const [jenjang, setJenjang] = useState<number | null>(null);
  const [pendidikan, setPendidikan] = useState('');
  const [pengalaman, setPengalaman] = useState('');
  const [ceritaProyek, setCeritaProyek] = useState('');
  const [materiSulit, setMateriSulit] = useState('');
  const [kendala, setKendala] = useState('');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMsgs]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetJabatan = params.get('jabatan');
    const targetMateri = params.get('materi');
    const targetContext = params.get('context');

    if (targetJabatan) setJabatan(targetJabatan);
    if (targetMateri) setMateriSulit(targetMateri);
    if (targetContext) setCeritaProyek(targetContext);
  }, []);

  const phaseIndex = { dialog: 0, 'loading-blueprint': 1, blueprint: 1, chatbot: 2, 'loading-ujian': 3, ujian: 3, keputusan: 4 }[phase] ?? 0;
  const targetValidation = validateKlinikTarget(jabatan, jenjang);

  // Step 1 → 2: Submit dialog → get blueprint
  const submitDialog = async () => {
    if (!targetValidation.ok || !pendidikan || !pengalaman) return;
    setPhase('loading-blueprint');
    setError(null);
    try {
      const res = await fetch('/api/klinik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'blueprint', ...targetValidation.target, pendidikan, pengalaman, ceritaProyek, materiSulit, kendala }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!matchesKlinikTarget(data.target, targetValidation.target)) throw new Error('Target hasil AI tidak sesuai. Silakan coba lagi.');
      setBlueprint(data);
      setPhase('blueprint');
    } catch (e: any) {
      setError(e.message ?? 'Gagal membuat blueprint');
      setPhase('dialog');
    }
  };

  // Step 3: Chat companion
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading || !blueprint) return;
    const userMsg: ChatMsg = { role: 'user', content: chatInput };
    const newMsgs = [...chatMsgs, userMsg];
    setChatMsgs(newMsgs);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/klinik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', messages: newMsgs, blueprint, ...blueprint.target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI tidak tersedia saat ini.');
      if (!matchesKlinikTarget(data.target, blueprint.target)) throw new Error('Target chat tidak sesuai dengan blueprint.');
      if (typeof data.content !== 'string' || !data.content.trim()) throw new Error('Respons chat kosong.');
      setChatMsgs(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (e) {
      setChatMsgs(prev => [...prev, { role: 'assistant', content: e instanceof Error ? e.message : 'AI tidak tersedia saat ini.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Step 4: Load exam
  const startUjian = async () => {
    if (!blueprint) return;
    setError(null);
    setPhase('loading-ujian');
    setAnswers({});
    setRevealed({});
    setCurrentQ(0);
    try {
      const res = await fetch('/api/klinik', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ujian', ...blueprint.target, gaps: blueprint.gap }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat soal latihan');
      if (!matchesKlinikTarget(data.target, blueprint.target)) throw new Error('Target latihan tidak sesuai dengan blueprint.');
      if (!Array.isArray(data.questions) || data.questions.length !== 5) throw new Error('Hasil soal latihan tidak valid.');
      setQuestions((data.questions ?? []).slice(0, 5));
      setPhase('ujian');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat soal latihan');
      setPhase('chatbot');
    }
  };

  const selectAnswer = (qId: number, opt: string) => {
    if (answers[qId]) return;
    setAnswers(p => ({ ...p, [qId]: opt }));
    setRevealed(p => ({ ...p, [qId]: true }));
  };

  const examScore = questions.filter(q => answers[q.id] === q.correct).length;
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id]);
  const q = questions[currentQ];

  const finalScore = blueprint
    ? Math.round(blueprint.skorKesiapan * 0.6 + (examScore / Math.max(questions.length, 1)) * 100 * 0.4)
    : 0;
  const colors = scoreColor(finalScore);

  const reset = () => {
    setPhase('dialog'); setBlueprint(null); setQuestions([]); setAnswers({}); setRevealed({});
    setChatMsgs([]); setError(null); setCurrentQ(0);
    setJabatan(''); setJenjang(null); setPendidikan(''); setPengalaman('');
    setCeritaProyek(''); setMateriSulit(''); setKendala('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4">
            🏥 Jalur Lengkap Kesiapan SKK
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Klinik Uji Kompetensi</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Dialog → Blueprint kesiapan → Chatbot belajar → Ruang Ujian → Skor & keputusan
          </p>
        </div>

        <StepBar current={phaseIndex} />
        {blueprint && (
          <p className="mb-5 rounded-xl border border-blue-400/30 bg-blue-500/10 p-3 text-sm text-blue-100">
            Target latihan: {blueprint.target.jabatan} · {blueprint.target.jenjangLabel}.
            {' '}Estimasi belajar, bukan keputusan sertifikasi resmi.
          </p>
        )}

        {/* Error */}
        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* ═══ STEP 1: DIALOG ═══ */}
        {phase === 'dialog' && (
          <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">📝 Tahap 1 — Ceritakan kondisi Anda</h2>
            <p className="text-slate-400 text-sm mb-6">Jawab santai saja. Dari cerita ini AI menyusun blueprint kesiapan Anda.</p>
            <div className="space-y-5">
              <div>
                <label htmlFor="klinik-jabatan" className="block text-sm font-medium text-slate-300 mb-1">Jabatan kerja SKK yang dituju *</label>
                <input
                  id="klinik-jabatan"
                  type="text"
                  value={jabatan}
                  onChange={e => setJabatan(e.target.value)}
                  placeholder="Contoh: Site Manager Gedung, Ahli K3 Konstruksi, Project Manager…"
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Jenjang yang dituju *</label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih jenjang KKNI">
                  {klinikJenjangOptions.map(j => (
                    <button type="button" key={j.value} aria-pressed={jenjang === j.value} onClick={() => setJenjang(j.value)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all focus-visible:outline-2 focus-visible:outline-blue-300 ${jenjang === j.value ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-slate-600 text-slate-300 hover:border-slate-400'}`}>
                      {j.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-300">Pilih satu jenjang sesuai skema LSP yang dituju, bukan rentang. Pilihan ini tidak memastikan ketersediaan skema atau kelayakan sertifikasi.</p>
                {jabatan.trim() && jenjang !== null && !targetValidation.ok && (
                  <p role="alert" className="mt-2 text-sm text-red-300">{targetValidation.error}</p>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Pendidikan terakhir *</label>
                  <div className="flex flex-col gap-1.5">
                    {pendidikanOptions.map(p => (
                      <button key={p} onClick={() => setPendidikan(p)}
                        className={`px-3 py-2 rounded-lg border text-sm text-left transition-all ${pendidikan === p ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-slate-600 text-slate-400 hover:border-slate-400'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Lama pengalaman relevan *</label>
                  <div className="flex flex-col gap-1.5">
                    {pengalamanOptions.map(p => (
                      <button key={p} onClick={() => setPengalaman(p)}
                        className={`px-3 py-2 rounded-lg border text-sm text-left transition-all ${pengalaman === p ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-slate-600 text-slate-400 hover:border-slate-400'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Ceritakan pengalaman / proyek yang relevan</label>
                <textarea value={ceritaProyek} onChange={e => setCeritaProyek(e.target.value)} rows={3}
                  placeholder="Contoh: Saya 3 tahun bekerja sebagai pelaksana lapangan pada proyek gedung 20 lantai di Jakarta, bertanggung jawab atas koordinasi subkontraktor dan pengawasan mutu beton…"
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none resize-none text-sm"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Materi yang dirasa sulit</label>
                  <textarea value={materiSulit} onChange={e => setMateriSulit(e.target.value)} rows={2}
                    placeholder="Contoh: perhitungan struktur, manajemen risiko, AMDAL…"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Kendala / kekhawatiran lain</label>
                  <textarea value={kendala} onChange={e => setKendala(e.target.value)} rows={2}
                    placeholder="Contoh: bingung soal dokumen FR.APL, takut gagal wawancara asesor…"
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 outline-none resize-none text-sm"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={submitDialog}
              disabled={!targetValidation.ok || !pendidikan || !pengalaman}
              className="mt-6 w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold transition-colors"
            >
              🧠 Susun Blueprint Kesiapan →
            </button>
          </div>
        )}

        {/* ═══ LOADING BLUEPRINT ═══ */}
        {phase === 'loading-blueprint' && (
          <div className="text-center py-24 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="text-5xl mb-4 animate-pulse">🧠</div>
            <p className="text-white font-semibold text-lg mb-2">AI menyusun Blueprint Kesiapan…</p>
            <p className="text-slate-400 text-sm">Menganalisis profil berdasarkan SKKNI dan regulasi BNSP</p>
          </div>
        )}

        {/* ═══ STEP 2: BLUEPRINT ═══ */}
        {phase === 'blueprint' && blueprint && (() => {
          const c = scoreColor(blueprint.skorKesiapan);
          return (
            <div className="space-y-5">
              {/* Score */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 text-center">
                <h2 className="text-lg font-bold text-white mb-4">📊 Blueprint Kesiapan Asesmen</h2>
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor"
                        strokeWidth="3" strokeDasharray={`${blueprint.skorKesiapan} 100`}
                        className={c.ring} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${c.text}`}>{blueprint.skorKesiapan}</span>
                      <span className="text-slate-400 text-xs">/ 100</span>
                    </div>
                  </div>
                </div>
                <div className={`inline-block px-5 py-1.5 rounded-full font-semibold text-sm mb-3 ${c.text} bg-slate-700`}>
                  {blueprint.label}
                </div>
                <p className="text-slate-300 text-sm">{blueprint.ringkasan}</p>
                {blueprint.pesanMotivasi && (
                  <p className="text-amber-400 text-sm mt-3 italic">💬 &quot;{blueprint.pesanMotivasi}&quot;</p>
                )}
              </div>

              {/* Kekuatan & Gap side by side */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                  <h3 className="text-green-400 font-semibold mb-3">✅ Kekuatan</h3>
                  <ul className="space-y-1.5">
                    {blueprint.kekuatan?.map((k, i) => (
                      <li key={i} className="text-slate-300 text-sm flex gap-2"><span className="text-green-500 mt-0.5">•</span>{k}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                  <h3 className="text-red-400 font-semibold mb-3">⚡ Gap Kompetensi</h3>
                  <ul className="space-y-2">
                    {blueprint.gap?.map((g, i) => (
                      <li key={i} className="text-sm">
                        <span className="text-slate-200 font-medium">{g.area}</span>
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${g.prioritas === 'tinggi' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{g.prioritas}</span>
                        <p className="text-slate-400 text-xs mt-0.5">{g.deskripsi}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Unit Kompetensi Prioritas */}
              {blueprint.unitKompetensiPrioritas?.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-3">📚 Unit Kompetensi Prioritas</h3>
                  <div className="space-y-2">
                    {blueprint.unitKompetensiPrioritas.map((u, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="text-amber-400 font-mono text-xs bg-amber-500/10 px-2 py-1 rounded whitespace-nowrap">{u.kode}</span>
                        <div>
                          <span className="text-slate-200">{u.nama}</span>
                          {u.catatan && <p className="text-slate-500 text-xs mt-0.5">{u.catatan}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rencana Belajar */}
              {blueprint.rencanaBelajar?.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-3">🗓️ Rencana Belajar</h3>
                  <div className="space-y-2">
                    {blueprint.rencanaBelajar.map((r, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <span className="text-blue-400 font-medium min-w-[7rem] text-xs mt-0.5">{r.minggu}</span>
                        <div>
                          <span className="text-slate-200 font-medium">{r.fokus}</span>
                          <p className="text-slate-400 text-xs">{r.aktivitas}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dokumen */}
              {blueprint.rekomendasiDokumen?.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-3">📋 Dokumen yang Perlu Disiapkan</h3>
                  <ul className="space-y-1">
                    {blueprint.rekomendasiDokumen.map((d, i) => (
                      <li key={i} className="flex gap-2 text-slate-300 text-sm"><span className="text-amber-400">□</span>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-3">
                <button onClick={() => { setChatMsgs([]); setPhase('chatbot'); }}
                  className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors">
                  💬 Lanjut ke Chatbot Belajar →
                </button>
              </div>
            </div>
          );
        })()}

        {/* ═══ STEP 3: CHATBOT ═══ */}
        {phase === 'chatbot' && (
          <div className="bg-slate-800/70 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">💬 Chatbot Teman Belajar</h2>
                <p className="text-slate-400 text-xs mt-0.5">AI disesuaikan dengan blueprint kesiapan {jabatan}</p>
              </div>
              <div className="text-right">
                <div className="text-amber-400 font-semibold">{blueprint?.skorKesiapan}/100</div>
                <div className="text-slate-500 text-xs">{blueprint?.label}</div>
              </div>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {chatMsgs.length === 0 && (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">🤝</div>
                  <p className="text-white font-medium mb-1">Hai! Saya siap membantu belajar</p>
                  <p className="text-slate-400 text-sm">Tanyakan tentang materi {jabatan}, unit kompetensi yang sulit, atau minta penjelasan lebih detail dari blueprint.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {[`Jelaskan gap "${blueprint?.gap?.[0]?.area}"`, 'Unit kompetensi apa yang paling penting?', 'Bagaimana cara menyiapkan FR.APL.02?'].map(s => (
                      <button key={s} onClick={() => { setChatInput(s); }}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMsgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${m.role === 'user' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-1 pl-2">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-slate-700 flex gap-2">
              <input
                type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendChat(); }}
                placeholder="Tanyakan sesuatu tentang materi atau jabatan…"
                className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
              />
              <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                className="px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl font-medium transition-colors">
                ↑
              </button>
            </div>

            <div className="p-4 pt-0">
              <button onClick={startUjian}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
                📝 Siap ke Ruang Ujian →
              </button>
            </div>
          </div>
        )}

        {/* ═══ LOADING UJIAN ═══ */}
        {phase === 'loading-ujian' && (
          <div className="text-center py-24 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="text-5xl mb-4 animate-spin">📝</div>
            <p className="text-white font-semibold text-lg mb-2">Menyiapkan soal ujian…</p>
            <p className="text-slate-400 text-sm">AI membuat 5 soal berdasarkan jabatan dan gap kompetensi kamu</p>
          </div>
        )}

        {/* ═══ STEP 4: UJIAN ═══ */}
        {phase === 'ujian' && q && (
          <div className="bg-slate-800/70 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="h-1.5 bg-slate-700">
              <div className="h-1.5 bg-blue-500 transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${q.type === 'scenario' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                  {q.type === 'scenario' ? '🏗️ Skenario' : '📚 Pengetahuan'}
                </span>
                <span className="text-slate-500 text-sm">Soal {currentQ + 1}/{questions.length}</span>
              </div>
              {q.unitKompetensi && <div className="text-xs text-amber-400/70 mb-2">{q.unitKompetensi}</div>}
              <p className="text-white text-base leading-relaxed mb-6">{q.question}</p>
              <div className="space-y-3">
                {(['A','B','C','D'] as const).map(opt => {
                  const sel = answers[q.id] === opt;
                  const cor = q.correct === opt;
                  const rev = revealed[q.id];
                  let cls = 'border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-slate-200 cursor-pointer';
                  if (rev) {
                    if (cor) cls = 'border-green-500 bg-green-500/20 text-green-300 cursor-default';
                    else if (sel) cls = 'border-red-500 bg-red-500/20 text-red-300 cursor-default';
                    else cls = 'border-slate-600 bg-slate-700/30 text-slate-500 cursor-default';
                  }
                  return (
                    <button key={opt} onClick={() => selectAnswer(q.id, opt)}
                      className={`w-full p-3.5 rounded-xl border-2 text-left text-sm flex gap-3 transition-all ${cls}`}>
                      <span className="font-bold">{opt}.</span>
                      <span>{q.options[opt]}</span>
                    </button>
                  );
                })}
              </div>
              {revealed[q.id] && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm">
                  💡 {q.explanation}
                </div>
              )}
              <div className="flex justify-between mt-6">
                <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0}
                  className="px-4 py-2.5 border border-slate-600 text-slate-400 hover:text-white rounded-lg disabled:opacity-30">
                  ← Kembali
                </button>
                {currentQ < questions.length - 1 ? (
                  <button onClick={() => setCurrentQ(p => p + 1)} disabled={!answers[q.id]}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white rounded-lg font-medium">
                    Soal Berikutnya →
                  </button>
                ) : (
                  <button onClick={() => setPhase('keputusan')} disabled={!allAnswered}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-30 text-white rounded-lg font-medium">
                    Lihat Keputusan ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 5: KEPUTUSAN ═══ */}
        {phase === 'keputusan' && blueprint && (
          <div className="space-y-5">
            {/* Final verdict */}
            <div className={`bg-slate-800/70 border rounded-2xl p-8 text-center ${finalScore >= 85 ? 'border-green-500/40' : finalScore >= 70 ? 'border-amber-500/40' : 'border-red-500/40'}`}>
              <div className="text-5xl mb-3">
                {finalScore >= 85 ? '🏆' : finalScore >= 70 ? '✅' : '📚'}
              </div>
              <div className={`text-5xl font-bold mb-1 ${colors.text}`}>{finalScore}<span className="text-2xl text-slate-400">/100</span></div>
              <div className="text-slate-400 text-sm mb-4">Skor Gabungan Kesiapan Asesmen</div>
              <div className={`inline-block px-6 py-2.5 rounded-xl font-bold text-lg ${colors.text} bg-slate-700`}>
                {finalScore >= 85 ? '🎯 Siap Lanjut ke LSP' : finalScore >= 70 ? '⚠️ Perlu Penguatan Singkat' : '📖 Belajar Lagi Sebelum Asesmen'}
              </div>
              <p className="text-slate-400 text-sm mt-4 max-w-sm mx-auto">
                {finalScore >= 85
                  ? 'Profil dan hasil ujianmu menunjukkan kesiapan yang baik. Segera hubungi LSP terdekat untuk mendaftar.'
                  : finalScore >= 70
                  ? 'Masih ada gap yang perlu diperkuat. Fokus pada unit kompetensi prioritas dalam blueprint, lalu daftar asesmen.'
                  : 'Disarankan mempelajari lebih dalam materi yang lemah. Manfaatkan chatbot belajar dan mock asesmen terlebih dahulu.'}
              </p>
            </div>

            {/* Score breakdown */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">📊 Rincian Skor</h3>
              <div className="space-y-3">
                {[
                  { label: 'Blueprint Kesiapan (60%)', score: blueprint.skorKesiapan, weight: 0.6 },
                  { label: `Hasil Ujian ${examScore}/${questions.length} (40%)`, score: Math.round((examScore / Math.max(questions.length, 1)) * 100), weight: 0.4 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white font-medium">{item.score}/100</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full">
                      <div className={`h-2 rounded-full ${scoreColor(item.score).bar}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam review */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold">📝 Review Jawaban Ujian</h3>
              {questions.map((qq, i) => {
                const ua = answers[qq.id];
                const ok = ua === qq.correct;
                return (
                  <div key={qq.id} className={`rounded-xl border p-4 ${ok ? 'border-green-600/40 bg-green-900/10' : 'border-red-600/40 bg-red-900/10'}`}>
                    <div className="flex gap-2 mb-2">
                      <span>{ok ? '✅' : '❌'}</span>
                      <p className="text-white text-sm">{qq.question}</p>
                    </div>
                    <div className="text-sm space-y-0.5 ml-6">
                      <div className="text-slate-400">Jawaban kamu: <span className={ok ? 'text-green-400' : 'text-red-400'}>{ua}. {qq.options[ua as keyof typeof qq.options]}</span></div>
                      {!ok && <div className="text-slate-400">Benar: <span className="text-green-400">{qq.correct}. {qq.options[qq.correct as keyof typeof qq.options]}</span></div>}
                      <div className="text-amber-300 text-xs mt-1">💡 {qq.explanation}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button onClick={reset} className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm">
                🔄 Mulai Klinik Baru
              </button>
              <a href="/mock-asesmen" className="px-5 py-3 border border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-400 rounded-xl font-medium text-sm">
                🎯 Mock Asesmen Lagi
              </a>
              <a href="/skk-coach/chat?agent=dokumen" className="px-5 py-3 border border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-400 rounded-xl font-medium text-sm">
                📄 Cek Dokumen SKK
              </a>
              <a href="/skk-coach/chat?agent=kelayakan" className="px-5 py-3 border border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-400 rounded-xl font-medium text-sm">
                🔍 Cek Kelayakan
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
