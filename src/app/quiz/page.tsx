'use client';

import { useState, useEffect, useTransition, useCallback, useMemo } from 'react';
import { getQuizQuestions, getQuizCategories, recordQuizAttempt } from '@/app/actions/quiz';
import type { QuizQuestion } from '@/app/actions/quiz';
import { useAuth } from '@/components/AuthProvider';
import { getRelatedQuizCategories, getJabatanById } from '@/lib/skkData';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizPage() {
  const { user } = useAuth();
  const jabatanSkk = user?.jabatanSkk ?? null;
  const jabatanInfo = useMemo(() => (jabatanSkk ? getJabatanById(jabatanSkk) : null), [jabatanSkk]);
  const relatedCategories = useMemo(
    () => (jabatanSkk ? getRelatedQuizCategories(jabatanSkk) : []),
    [jabatanSkk],
  );

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [displayQuestions, setDisplayQuestions] = useState<QuizQuestion[]>([]);
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [jabatanFilterActive, setJabatanFilterActive] = useState(false);
  const [randomMode, setRandomMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState<QuizQuestion[]>([]);
  const [isRetrySession, setIsRetrySession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Fetch categories once on mount
  useEffect(() => {
    startTransition(async () => {
      try {
        const cats = await getQuizCategories();
        setCategories(cats);
      } catch {
        // keep default
      }
    });
  }, []);

  // Fetch questions — when jabatan filter is active always fetch all so we can filter client-side
  useEffect(() => {
    const fetchCategory = jabatanFilterActive ? 'Semua' : selectedCategory;
    setLoading(true);
    setError(null);
    startTransition(async () => {
      try {
        const qs = await getQuizQuestions(fetchCategory);
        setQuestions(qs);
      } catch {
        setError('Gagal memuat soal.');
      } finally {
        setLoading(false);
      }
    });
  }, [selectedCategory, jabatanFilterActive]);

  // Apply order mode and jabatan filter whenever questions / mode / filter changes
  useEffect(() => {
    let baseQs = questions;
    if (jabatanFilterActive && relatedCategories.length > 0) {
      baseQs = questions.filter((q) => relatedCategories.includes(q.category));
    }
    setDisplayQuestions(randomMode ? shuffleArray(baseQs) : baseQs);
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setWrongQuestions([]);
    setIsRetrySession(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, randomMode, jabatanFilterActive]);

  const handleAnswer = (answerIndex: number) => {
    if (answered) return;
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    const currentQ = displayQuestions[currentQuestion];
    const isCorrect = answerIndex === currentQ.correct;
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setWrongQuestions((prev) => {
        // Avoid duplicates in case of retry-within-retry scenarios
        if (prev.some((q) => q.id === currentQ.id)) return prev;
        return [...prev, currentQ];
      });
    }
    // Record per-question attempt for admin analytics (server derives correctness)
    recordQuizAttempt(currentQ.id, answerIndex).catch(() => {});
  };

  const nextQuestion = () => {
    if (currentQuestion < displayQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = useCallback(() => {
    let baseQs = questions;
    if (jabatanFilterActive && relatedCategories.length > 0) {
      baseQs = questions.filter((q) => relatedCategories.includes(q.category));
    }
    setDisplayQuestions(randomMode ? shuffleArray(baseQs) : baseQs);
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setWrongQuestions([]);
    setIsRetrySession(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, randomMode, jabatanFilterActive]);

  const retryWrongQuestions = useCallback(() => {
    // Sort wrong questions by sortOrder ASC (mirroring the default fetch order)
    const sorted = [...wrongQuestions].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    setDisplayQuestions(randomMode ? shuffleArray(sorted) : sorted);
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setWrongQuestions([]);
    setIsRetrySession(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrongQuestions, randomMode]);

  const handleCategoryChange = (cat: string) => {
    setJabatanFilterActive(false);
    setSelectedCategory(cat);
  };

  const handleToggleJabatanFilter = () => {
    setJabatanFilterActive((prev) => !prev);
  };

  const handleToggleRandomMode = () => {
    setRandomMode((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 text-lg">Memuat soal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (showScore) {
    const percentage = Math.round((score / displayQuestions.length) * 100);
    const wrongCount = wrongQuestions.length;
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : '📚'}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {isRetrySession ? 'Sesi Ulang Selesai!' : 'Quiz Selesai!'}
            </h2>
            <p className="text-slate-600 mb-6">
              Skor Anda: {score} dari {displayQuestions.length} ({percentage}%)
              {isRetrySession && (
                <span className="block text-sm text-slate-400 mt-1">
                  (hanya soal yang sebelumnya salah)
                </span>
              )}
            </p>
            <div className={`text-4xl font-bold mb-6 ${percentage >= 60 ? 'text-green-600' : 'text-amber-600'}`}>
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Learning!'}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {wrongCount > 0 && (
                <button
                  onClick={retryWrongQuestions}
                  className="px-8 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
                >
                  ❌ Ulangi Soal yang Salah ({wrongCount})
                </button>
              )}
              <button
                onClick={restartQuiz}
                className="px-8 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600"
              >
                🔄 Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (displayQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Belum ada soal</h2>
          <p className="text-slate-600">
            {jabatanFilterActive
              ? 'Belum ada soal untuk jabatan Anda. Silakan pilih kategori lain.'
              : 'Kategori ini belum memiliki soal. Silakan pilih kategori lain.'}
          </p>
          {jabatanFilterActive && (
            <button
              onClick={() => setJabatanFilterActive(false)}
              className="mt-4 px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600"
            >
              Tampilkan Semua Soal
            </button>
          )}
        </div>
      </div>
    );
  }

  const question = displayQuestions[currentQuestion];
  const isQuestionRelevant = relatedCategories.includes(question.category);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">✍️ Simulasi Quiz</h1>
          <p className="text-lg text-slate-600">
            {displayQuestions.length} soal persiapan ujian sertifikasi
          </p>
        </div>

        {/* Jabatan quick-filter — only shown when user has a jabatan set */}
        {jabatanInfo && relatedCategories.length > 0 && (
          <div className="flex justify-center mb-3">
            <button
              onClick={handleToggleJabatanFilter}
              title={
                jabatanFilterActive
                  ? 'Menampilkan soal relevan untuk jabatan Anda — klik untuk semua soal'
                  : `Tampilkan soal relevan untuk ${jabatanInfo.name}`
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                jabatanFilterActive
                  ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                  : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span>🎯</span>
              <span>
                {jabatanFilterActive
                  ? `Relevan: ${jabatanInfo.name}`
                  : `Relevan untuk jabatan Anda`}
              </span>
            </button>
          </div>
        )}

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                !jabatanFilterActive && selectedCategory === cat
                  ? 'bg-amber-500 text-white'
                  : jabatanFilterActive
                  ? 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Order mode toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleToggleRandomMode}
            title={randomMode ? 'Soal ditampilkan acak — klik untuk urutan admin' : 'Soal ditampilkan sesuai urutan admin — klik untuk acak'}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              randomMode
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700 hover:bg-indigo-200'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {randomMode ? '🔀 Acak' : '📋 Urutan Tetap'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {question.category}
              </span>
              {/* Highlight badge when this question's category matches the user's jabatan */}
              {jabatanInfo && isQuestionRelevant && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  🎯 Relevan
                </span>
              )}
            </div>
            <span className="text-slate-500">
              {currentQuestion + 1} / {displayQuestions.length}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                className={`w-full p-4 text-left rounded-xl transition-all ${
                  answered
                    ? index === question.correct
                      ? 'bg-green-100 border-2 border-green-500 text-green-800'
                      : selectedAnswer === index
                        ? 'bg-red-100 border-2 border-red-500 text-red-800'
                        : 'bg-slate-50 text-slate-600'
                    : selectedAnswer === index
                      ? 'bg-amber-100 border-2 border-amber-500'
                      : 'bg-slate-50 border-2 border-slate-200 hover:border-amber-300'
                }`}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>

          {answered && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={nextQuestion}
                className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600"
              >
                {currentQuestion < displayQuestions.length - 1 ? 'Soal Berikutnya →' : 'Lihat Hasil'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl p-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / displayQuestions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-slate-500 mt-2">
            Progress: {currentQuestion + 1} / {displayQuestions.length}
          </p>
        </div>
      </div>
    </div>
  );
}
