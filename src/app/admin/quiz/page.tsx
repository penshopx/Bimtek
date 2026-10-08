'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import {
  getQuizQuestions,
  getQuizCategories,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  reorderQuizQuestions,
  getQuizAttemptStats,
  resetQuizAttempts,
  resetStaleAttempts,
} from '@/app/actions/quiz';
import type { QuizQuestion, QuizAttemptStat } from '@/app/actions/quiz';
import { getDisplayedAdminQuizQuestions } from '@/lib/adminQuizQuestionOrder';
import { getAdminQuizCategoryRates } from '@/lib/adminQuizCategoryStats';

export default function AdminQuizPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<Map<number, QuizAttemptStat>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ question: '', category: '', options: ['', '', '', ''], correct: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [reordering, setReordering] = useState(false);
  const [resetConfirmId, setResetConfirmId] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);
  const [clearingStaleId, setClearingStaleId] = useState<number | null>(null);
  const [sortBySuccessRate, setSortBySuccessRate] = useState(false);
  const [clearAttempts, setClearAttempts] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [, startTransition] = useTransition();
  const categoryRates = useMemo(
    () => getAdminQuizCategoryRates(questions, stats),
    [questions, stats],
  );

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (user?.role === 'admin') loadData();
  }, [user]);

  const loadData = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const sessionId = localStorage.getItem('sessionId');
        const [qs, cats, attemptStats] = await Promise.all([
          getQuizQuestions(),
          getQuizCategories(),
          getQuizAttemptStats(sessionId),
        ]);
        setQuestions(qs);
        setCategories(cats);
        setStats(new Map(attemptStats.map((s) => [s.questionId, s])));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ question: '', category: '', options: ['', '', '', ''], correct: 0 });
    setClearAttempts(false);
    setShowForm(true);
    setMessage('');
  };

  const openEdit = (q: QuizQuestion) => {
    setEditingId(q.id);
    setForm({ question: q.question, category: q.category, options: [...q.options], correct: q.correct });
    setClearAttempts(false);
    setShowForm(true);
    setMessage('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setClearAttempts(false);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.category.trim() || form.options.some((o) => !o.trim())) {
      setMessage('Harap isi semua field.');
      return;
    }
    setSaving(true);
    try {
      const sessionId = localStorage.getItem('sessionId');
      const result = editingId !== null
        ? await updateQuizQuestion(editingId, form, sessionId)
        : await createQuizQuestion(form, sessionId);

      if (result.success) {
        if (clearAttempts && editingId !== null) {
          const resetResult = await resetQuizAttempts(editingId, sessionId);
          if (!resetResult.success) {
            // The question was saved but the attempt reset failed — keep the
            // form open so the admin can retry or dismiss deliberately.
            setSaving(false);
            setMessage(
              `Soal berhasil diperbarui, tetapi gagal menghapus riwayat percobaan: ${resetResult.message || 'Terjadi kesalahan.'}`
            );
            loadData();
            return;
          }
        }
        setMessage(editingId !== null ? 'Soal berhasil diperbarui.' : 'Soal berhasil ditambahkan.');
        loadData();
        closeForm();
      } else {
        setMessage(result.message || 'Gagal menyimpan soal.');
      }
    } catch {
      setMessage('Terjadi kesalahan.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus soal ini?')) return;
    try {
      const sessionId = localStorage.getItem('sessionId');
      const result = await deleteQuizQuestion(id, sessionId);
      loadData();
      if (result?.success === false) {
        showToast(result.message || 'Gagal menghapus soal.', 'error');
      } else {
        showToast('✅ Soal berhasil dihapus.');
      }
    } catch {
      showToast('Terjadi kesalahan saat menghapus soal.', 'error');
    }
  };

  const handleResetStats = async () => {
    if (resetConfirmId === null) return;
    setResetting(true);
    try {
      const sessionId = localStorage.getItem('sessionId');
      const result = await resetQuizAttempts(resetConfirmId, sessionId);
      setResetConfirmId(null);
      loadData();
      if (result.success) {
        showToast('✅ Statistik soal berhasil direset.');
      } else {
        showToast(result.message || 'Gagal mereset statistik.', 'error');
      }
    } catch {
      setResetConfirmId(null);
      showToast('Terjadi kesalahan saat mereset statistik.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleClearStale = async (questionId: number) => {
    if (clearingStaleId !== null || !confirm(
      'Hapus permanen hanya percobaan yang sudah tidak valid untuk soal ini? Percobaan valid tetap tersimpan. Total dan persentase keberhasilan akan dihitung ulang dari data yang tersisa.'
    )) return;
    setClearingStaleId(questionId);
    try {
      const sessionId = localStorage.getItem('sessionId');
      const result = await resetStaleAttempts(questionId, sessionId);
      if (!result.success) {
        showToast(result.message || 'Gagal menghapus data usang.', 'error');
        return;
      }
      try {
        const attemptStats = await getQuizAttemptStats(sessionId);
        setStats(new Map(attemptStats.map((s) => [s.questionId, s])));
        showToast('Data usang berhasil dihapus. Percobaan valid tetap tersimpan.');
      } catch {
        showToast('Data usang telah dihapus, tetapi statistik gagal dimuat ulang. Muat ulang halaman untuk memperbarui statistik.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat menghapus data usang.', 'error');
    } finally {
      setClearingStaleId(null);
    }
  };

  /** Move a question within the filtered list up (-1) or down (+1), then persist. */
  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= filtered.length) return;

    // Build new order for the filtered list
    const newFiltered = [...filtered];
    const [moved] = newFiltered.splice(index, 1);
    newFiltered.splice(targetIndex, 0, moved);

    // Merge back into the full questions list preserving positions of other categories
    const newQuestions = [...questions];
    newFiltered.forEach((q, i) => {
      const globalIdx = newQuestions.findIndex((x) => x.id === filtered[i === 0 && direction === 1 ? i : i].id);
      void globalIdx; // not needed below
    });

    // Replace the filtered slots in the full list with the new order
    const filteredIds = new Set(filtered.map((q) => q.id));
    let filteredPointer = 0;
    const merged = newQuestions.map((q) => {
      if (filteredIds.has(q.id)) {
        return newFiltered[filteredPointer++];
      }
      return q;
    });

    setQuestions(merged);
    setReordering(true);
    try {
      const sessionId = localStorage.getItem('sessionId');
      await reorderQuizQuestions(merged.map((q) => q.id), sessionId);
    } catch {
      // revert on error
      loadData();
    } finally {
      setReordering(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Akses Ditolak</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Halaman ini hanya untuk admin</p>
          <Link href="/dashboard" className="text-amber-500 hover:underline">Kembali ke Dashboard</Link>
        </div>
      </div>
    );
  }

  const filtered = filterCategory === 'Semua' ? questions : questions.filter((q) => q.category === filterCategory);

  const displayed = getDisplayedAdminQuizQuestions(questions, stats, filterCategory, sortBySuccessRate);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-xs transition-all
            ${toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
            }`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white/80 hover:text-white shrink-0 text-base leading-none"
            aria-label="Tutup notifikasi"
          >
            ×
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">✍️ Manajemen Soal Quiz</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{questions.length} soal tersedia</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm">
              ← Admin
            </Link>
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium"
            >
              + Tambah Soal
            </button>
          </div>
        </div>

        {/* Category filter + sort toggle */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm ${
                filterCategory === cat
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
              }`}
            >
              {cat}
              {cat !== 'Semua' && categoryRates.has(cat) && (
                <span
                  className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    categoryRates.get(cat)! < 40
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                      : categoryRates.get(cat)! < 60
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                  }`}
                  title="Rata-rata tingkat benar per soal yang memiliki percobaan; soal tanpa percobaan tidak dihitung."
                >
                  Rata-rata {categoryRates.get(cat)}%
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => setSortBySuccessRate((v) => !v)}
            className={`ml-auto px-3 py-1 rounded-full text-sm border transition-colors ${
              sortBySuccessRate
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-red-400 hover:text-red-500'
            }`}
            title={sortBySuccessRate ? 'Kembali ke urutan tampilan' : 'Urutkan dari tingkat benar terendah'}
          >
            {sortBySuccessRate ? '⚠️ Urutan: Tersulit ↑' : 'Sort: Tersulit ↑'}
          </button>
        </div>

        {/* Reorder hint — hidden while sort-by-success-rate is active */}
        {filtered.length > 1 && !sortBySuccessRate && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            ↕ Gunakan tombol panah untuk mengubah urutan tampilan soal.
            {reordering && <span className="ml-2 text-amber-500">Menyimpan urutan...</span>}
          </p>
        )}

        {/* Reset stats confirmation dialog */}
        {resetConfirmId !== null && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reset Statistik Soal?</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Semua data percobaan untuk soal ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setResetConfirmId(null)}
                  disabled={resetting}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  onClick={handleResetStats}
                  disabled={resetting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60"
                >
                  {resetting ? 'Mereset...' : 'Ya, Reset'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                {editingId !== null ? 'Edit Soal' : 'Tambah Soal Baru'}
              </h2>

              {message && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pertanyaan</label>
                  <textarea
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Tulis pertanyaan di sini..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    list="cat-list"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Contoh: Sipil, K3, Material..."
                  />
                  <datalist id="cat-list">
                    {categories.filter((c) => c !== 'Semua').map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pilihan Jawaban</label>
                  <div className="space-y-2">
                    {form.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={form.correct === idx}
                          onChange={() => setForm({ ...form, correct: idx })}
                          className="accent-amber-500"
                        />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-5">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...form.options];
                            newOpts[idx] = e.target.value;
                            setForm({ ...form, options: newOpts });
                          }}
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Pilih radio button di kiri untuk menandai jawaban benar.</p>
                </div>
              </div>

              {/* Clear attempts checkbox — only shown when editing a question that already has attempts */}
              {editingId !== null && stats.get(editingId) && (stats.get(editingId)!.totalAttempts > 0) && (
                <div className="mt-5 flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <input
                    id="clear-attempts-checkbox"
                    type="checkbox"
                    checked={clearAttempts}
                    onChange={(e) => setClearAttempts(e.target.checked)}
                    className="mt-0.5 accent-red-500 shrink-0"
                  />
                  <label htmlFor="clear-attempts-checkbox" className="text-sm text-red-700 dark:text-red-400 cursor-pointer leading-snug">
                    Hapus juga riwayat percobaan untuk soal ini saat menyimpan
                    <span className="block text-xs text-red-500 dark:text-red-500 mt-0.5">
                      {stats.get(editingId)!.totalAttempts} percobaan akan dihapus permanen
                    </span>
                  </label>
                </div>
              )}

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  onClick={closeForm}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions table */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Memuat soal...</div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    {!sortBySuccessRate && (
                      <th className="px-2 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300 w-16">Urutan</th>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 w-8">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Pertanyaan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 w-28">Kategori</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 w-20">Benar</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 w-32">
                      Tingkat Benar
                      <span className="block text-xs font-normal text-slate-400 dark:text-slate-500">% jawaban benar</span>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {displayed.length === 0 ? (
                    <tr>
                      <td colSpan={sortBySuccessRate ? 6 : 7} className="px-4 py-8 text-center text-slate-500">
                        Belum ada soal di kategori ini.
                      </td>
                    </tr>
                  ) : (
                    displayed.map((q, i) => {
                      const stat = stats.get(q.id);
                      const hasAttempts = stat && stat.totalAttempts > 0;
                      const isLowRate = hasAttempts && stat!.successRate < 40;
                      return (
                        <tr
                          key={q.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 ${isLowRate ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                        >
                          {/* Up/Down buttons — hidden in sort-by-success-rate mode */}
                          {!sortBySuccessRate && (
                          <td className="px-2 py-3">
                            <div className="flex flex-col items-center gap-0.5">
                              <button
                                onClick={() => handleMove(i, -1)}
                                disabled={i === 0 || reordering}
                                title="Pindah ke atas"
                                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => handleMove(i, 1)}
                                disabled={i === filtered.length - 1 || reordering}
                                title="Pindah ke bawah"
                                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                ▼
                              </button>
                            </div>
                          </td>
                          )}
                          <td className="px-4 py-3 text-slate-400 text-sm">{i + 1}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{q.question}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {q.options.map((o, idx) => (
                                <span key={idx} className={idx === q.correct ? 'text-green-600 font-medium' : ''}>
                                  {String.fromCharCode(65 + idx)}. {o}{idx < q.options.length - 1 ? ' · ' : ''}
                                </span>
                              ))}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                              {q.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-green-600 font-medium">
                            {String.fromCharCode(65 + q.correct)}
                          </td>
                          <td className="px-4 py-3">
                            {hasAttempts ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  {isLowRate && (
                                    <span title="Tingkat keberhasilan rendah — perlu ditinjau" className="text-red-500 text-xs">⚠️</span>
                                  )}
                                  <span className={`text-sm font-semibold ${
                                    stat!.successRate >= 60 ? 'text-green-600' :
                                    stat!.successRate >= 40 ? 'text-amber-500' :
                                    'text-red-600'
                                  }`}>
                                    {stat!.successRate}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all ${
                                      stat!.successRate >= 60 ? 'bg-green-500' :
                                      stat!.successRate >= 40 ? 'bg-amber-400' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${stat!.successRate}%` }}
                                  />
                                </div>
                                <p className="text-xs text-slate-400">{stat!.totalAttempts} percobaan</p>
                                {/* Per-option breakdown */}
                                {stat!.hasStaleAttempts ? (
                                  <div className="mt-1 flex items-start gap-1.5 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-2 py-1.5">
                                    <span className="text-amber-500 text-xs mt-0.5 shrink-0">⚠️</span>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-snug">
                                      Soal diubah setelah percobaan tercatat. Rincian per-opsi disembunyikan agar tidak menyesatkan.
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => handleClearStale(q.id)}
                                      disabled={clearingStaleId !== null}
                                      title="Hapus hanya percobaan tidak valid; total dan persentase dihitung ulang dari percobaan valid."
                                      className="shrink-0 text-xs text-amber-800 dark:text-amber-300 underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {clearingStaleId === q.id ? 'Menghapus...' : 'Clear stale data'}
                                    </button>
                                  </div>
                                ) : stat!.optionCounts.length > 0 && stat!.optionCounts.some((c) => c > 0) && (
                                  <div className="mt-1 space-y-0.5">
                                    {stat!.optionCounts.map((count, optIdx) => {
                                      const pct = stat!.totalAttempts > 0
                                        ? Math.round((count / stat!.totalAttempts) * 100)
                                        : 0;
                                      const isCorrectOpt = optIdx === q.correct;
                                      const isMostWrong = !isCorrectOpt && count > 0 && count === Math.max(
                                        ...stat!.optionCounts.filter((_, i) => i !== q.correct)
                                      );
                                      return (
                                        <div key={optIdx} className="flex items-center gap-1">
                                          <span className={`text-xs font-medium w-5 shrink-0 ${
                                            isCorrectOpt ? 'text-green-600' :
                                            isMostWrong ? 'text-red-500' :
                                            'text-slate-400'
                                          }`}>
                                            {String.fromCharCode(65 + optIdx)}.
                                          </span>
                                          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                            <div
                                              className={`h-1.5 rounded-full ${
                                                isCorrectOpt ? 'bg-green-400' :
                                                isMostWrong ? 'bg-red-400' :
                                                'bg-slate-300 dark:bg-slate-500'
                                              }`}
                                              style={{ width: `${pct}%` }}
                                            />
                                          </div>
                                          <span className={`text-xs w-8 text-right shrink-0 ${
                                            isCorrectOpt ? 'text-green-600' :
                                            isMostWrong ? 'text-red-500' :
                                            'text-slate-400'
                                          }`}>
                                            {pct}%
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                <button
                                  onClick={() => setResetConfirmId(q.id)}
                                  className="mt-1.5 text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-2"
                                >
                                  Reset stats
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Belum ada data</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEdit(q)}
                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(q.id)}
                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
