'use client';

import { useCallback, useEffect, useState } from 'react';

const domains = [
  { id: 'manpro', name: 'Manajemen Pelaksanaan', level: 'Ahli Madya', code: 'SKK-501', icon: '📋', color: 'blue' },
  { id: 'gedung', name: 'Teknik Bangunan Gedung', level: 'Ahli Muda', code: 'SKK-602', icon: '🏢', color: 'purple' },
  { id: 'k3', name: 'K3 Konstruksi', level: 'Ahli Muda', code: 'SKK-601', icon: '🦺', color: 'red' },
  { id: 'proyek', name: 'Manajemen Proyek', level: 'Ahli Muda', code: 'SKK-503', icon: '📊', color: 'green' },
  { id: 'qs', name: 'Quantity Surveyor', level: 'Ahli Muda', code: 'SKK-604', icon: '🧮', color: 'amber' },
  { id: 'pengawas', name: 'Pengawas Konstruksi', level: 'Ahli Muda', code: 'SKK-611', icon: '🔍', color: 'cyan' },
  { id: 'jalan', name: 'Jalan & Jembatan', level: 'Ahli Madya', code: 'SKK-202', icon: '🛣️', color: 'orange' },
  { id: 'geo', name: 'Geoteknik', level: 'Ahli Muda', code: 'SKK-203', icon: '🌍', color: 'emerald' },
  { id: 'mep', name: 'Mekanikal Elektrikal', level: 'Ahli Muda', code: 'SKK-401', icon: '⚙️', color: 'slate' },
  { id: 'kontrak', name: 'Manajemen Kontrak', level: 'Ahli Muda', code: 'SKK-512', icon: '📄', color: 'indigo' },
];

const colorMap: Record<string, string> = {
  blue: 'border-blue-400 bg-blue-50 hover:bg-blue-100',
  purple: 'border-purple-400 bg-purple-50 hover:bg-purple-100',
  red: 'border-red-400 bg-red-50 hover:bg-red-100',
  green: 'border-green-400 bg-green-50 hover:bg-green-100',
  amber: 'border-amber-400 bg-amber-50 hover:bg-amber-100',
  cyan: 'border-cyan-400 bg-cyan-50 hover:bg-cyan-100',
  orange: 'border-orange-400 bg-orange-50 hover:bg-orange-100',
  emerald: 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100',
  slate: 'border-slate-400 bg-slate-50 hover:bg-slate-100',
  indigo: 'border-indigo-400 bg-indigo-50 hover:bg-indigo-100',
};

interface Question {
  id: number;
  type: 'knowledge' | 'scenario';
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  explanation: string;
}

type Phase = 'select' | 'loading' | 'quiz' | 'result';

export default function MockAsesmenPage() {
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedDomain, setSelectedDomain] = useState<typeof domains[0] | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [targetUnit, setTargetUnit] = useState<string | null>(null);

  const startAsesmen = useCallback(async (domain: typeof domains[0], unit?: string | null) => {
    setSelectedDomain(domain);
    setTargetUnit(unit ?? null);
    setPhase('loading');
    setError(null);
    setAnswers({});
    setRevealed({});
    setCurrentQ(0);

    try {
      const res = await fetch('/api/mock-asesmen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.name, level: domain.level, domainCode: domain.code, unit }),
      });
      const data = await res.json();
      if (!res.ok || !data.questions?.length) throw new Error(data.error ?? 'Gagal memuat soal');
      setQuestions(data.questions.slice(0, 5));
      setPhase('quiz');
    } catch (e: any) {
      setError(e.message);
      setPhase('select');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const domainParam = params.get('domain');
    const unitParam = params.get('unit');
    const domain = domains.find(d => d.id === domainParam || d.code === domainParam);
    if (domain) void startAsesmen(domain, unitParam);
  }, [startAsesmen]);

  const selectAnswer = (qId: number, option: string) => {
    if (answers[qId]) return; // locked after answering
    setAnswers(prev => ({ ...prev, [qId]: option }));
    setRevealed(prev => ({ ...prev, [qId]: true }));
  };

  const score = questions.filter(q => answers[q.id] === q.correct).length;
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id]);

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
            🎯 Simulasi Uji Kompetensi SKK
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Mock Asesmen SKK</h1>
          <p className="text-slate-400">AI menghasilkan soal berbasis SKKNI & standar BNSP · 5 soal per sesi</p>
        </div>

        {/* SELECT DOMAIN */}
        {phase === 'select' && (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-sm text-center">
                ⚠️ {error} — Pastikan AI tersedia dan coba lagi.
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {domains.map(d => (
                <button
                  key={d.id}
                  onClick={() => startAsesmen(d)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${colorMap[d.color]}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{d.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-800">{d.name}</div>
                      <div className="text-xs text-slate-500">{d.level} · {d.code}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">3 soal pengetahuan + 2 soal skenario lapangan</div>
                </button>
              ))}
            </div>
            <p className="text-center text-slate-500 text-xs mt-6">
              Soal dihasilkan AI berdasarkan SKKNI dan standar BNSP. Bukan soal resmi BNSP.
            </p>
          </>
        )}

        {/* LOADING */}
        {phase === 'loading' && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4 animate-spin">⚙️</div>
            <p className="text-white font-semibold text-lg mb-2">Menyiapkan soal asesmen…</p>
            <p className="text-slate-400 text-sm">
              AI menganalisis SKKNI untuk {targetUnit ? `${targetUnit} · ${selectedDomain?.name}` : selectedDomain?.name}
            </p>
          </div>
        )}

        {/* QUIZ */}
        {phase === 'quiz' && q && (
          <div className="bg-slate-800/70 rounded-2xl border border-slate-700 overflow-hidden">
            {/* Progress bar */}
            <div className="h-1.5 bg-slate-700">
              <div
                className="h-1.5 bg-amber-500 transition-all"
                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className="p-6">
              {/* Meta */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedDomain?.icon}</span>
                  <div>
                    <span className="text-slate-400 text-sm">{selectedDomain?.name}</span>
                    {targetUnit && <p className="text-amber-300 text-xs mt-0.5">{targetUnit}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    q.type === 'scenario'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {q.type === 'scenario' ? '🏗️ Skenario Lapangan' : '📚 Pengetahuan'}
                  </span>
                  <span className="text-slate-500 text-sm">Soal {currentQ + 1}/{questions.length}</span>
                </div>
              </div>

              {/* Question */}
              <p className="text-white text-lg leading-relaxed mb-6">{q.question}</p>

              {/* Options */}
              <div className="space-y-3">
                {(['A', 'B', 'C', 'D'] as const).map(opt => {
                  const isSelected = answers[q.id] === opt;
                  const isCorrect = q.correct === opt;
                  const isRevealed = revealed[q.id];

                  let style = 'border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-slate-200 cursor-pointer';
                  if (isRevealed) {
                    if (isCorrect) style = 'border-green-500 bg-green-500/20 text-green-300 cursor-default';
                    else if (isSelected) style = 'border-red-500 bg-red-500/20 text-red-300 cursor-default';
                    else style = 'border-slate-600 bg-slate-700/30 text-slate-500 cursor-default';
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => selectAnswer(q.id, opt)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${style}`}
                    >
                      <span className="font-bold min-w-[1.5rem]">{opt}.</span>
                      <span>{q.options[opt]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation after answer */}
              {revealed[q.id] && (
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm">
                  <span className="font-semibold">💡 Penjelasan: </span>{q.explanation}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                  disabled={currentQ === 0}
                  className="px-5 py-2.5 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Sebelumnya
                </button>
                {currentQ < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQ(prev => prev + 1)}
                    disabled={!answers[q.id]}
                    className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Soal Berikutnya →
                  </button>
                ) : (
                  <button
                    onClick={() => setPhase('result')}
                    disabled={!allAnswered}
                    className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Lihat Hasil ✓
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <div className="space-y-6">
            {/* Score card */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-3">
                {score >= 4 ? '🏆' : score >= 3 ? '✅' : '📚'}
              </div>
              <div className="text-5xl font-bold text-white mb-1">{score}<span className="text-2xl text-slate-400">/{questions.length}</span></div>
              <div className="text-slate-400 mb-4">
                {selectedDomain?.name} · {selectedDomain?.level}
              </div>
              <div className={`inline-block px-6 py-2 rounded-full font-semibold text-lg ${
                score >= 4 ? 'bg-green-500/20 text-green-400' :
                score >= 3 ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {score >= 4 ? 'Kompeten — Siap Asesmen' : score >= 3 ? 'Cukup — Perlu Penguatan' : 'Belum Kompeten — Perlu Belajar Lagi'}
              </div>
            </div>

            {/* Review per soal */}
            <div className="space-y-4">
              {questions.map((qq, i) => {
                const userAns = answers[qq.id];
                const correct = userAns === qq.correct;
                return (
                  <div key={qq.id} className={`rounded-xl border p-5 ${correct ? 'border-green-600/50 bg-green-900/10' : 'border-red-600/50 bg-red-900/10'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xl">{correct ? '✅' : '❌'}</span>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Soal {i + 1} · {qq.type === 'scenario' ? 'Skenario' : 'Pengetahuan'}</div>
                        <p className="text-white text-sm">{qq.question}</p>
                      </div>
                    </div>
                    <div className="ml-8 space-y-1 text-sm">
                      <div className="text-slate-400">Jawaban kamu: <span className={correct ? 'text-green-400' : 'text-red-400'}>{userAns}. {qq.options[userAns as keyof typeof qq.options]}</span></div>
                      {!correct && <div className="text-slate-400">Jawaban benar: <span className="text-green-400">{qq.correct}. {qq.options[qq.correct as keyof typeof qq.options]}</span></div>}
                      <div className="mt-2 text-amber-300 text-xs">💡 {qq.explanation}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => { setPhase('select'); setQuestions([]); }}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium"
              >
                🔄 Coba Domain Lain
              </button>
              {selectedDomain && (
                <button
                  onClick={() => startAsesmen(selectedDomain)}
                  className="px-6 py-3 border border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-400 rounded-xl font-medium"
                >
                  ↩ Ulangi Domain Ini
                </button>
              )}
              <a
                href="/agentic-chat"
                className="px-6 py-3 border border-slate-600 hover:border-amber-500 text-slate-300 hover:text-amber-400 rounded-xl font-medium"
              >
                🤖 Tanya AI tentang topik ini
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
