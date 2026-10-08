'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

type Category = 'administrasi' | 'pendidikan' | 'pengalaman' | 'pkb' | 'lainnya';
type Context = 'persiapan-skk' | 'portofolio' | 'pkb';

interface ProofItem {
  id: string;
  originalName: string;
  mime: string;
  size: number;
  category: Category;
  contexts: Context[];
  note: string;
  period: string;
  createdAt: string;
  updatedAt: string;
  status: 'tersimpan';
}

interface Metadata {
  category: Category;
  contexts: Context[];
  note: string;
  period: string;
}

const CATEGORIES: { value: Category | 'semua'; label: string }[] = [
  { value: 'semua', label: 'Semua kategori' },
  { value: 'administrasi', label: 'Administrasi' },
  { value: 'pendidikan', label: 'Pendidikan' },
  { value: 'pengalaman', label: 'Pengalaman' },
  { value: 'pkb', label: 'Pengembangan keprofesian' },
  { value: 'lainnya', label: 'Lainnya' },
];

const CONTEXTS: { value: Context; label: string }[] = [
  { value: 'persiapan-skk', label: 'Persiapan SKK' },
  { value: 'portofolio', label: 'Portofolio' },
  { value: 'pkb', label: 'PKB' },
];

const EMPTY_METADATA: Metadata = { category: 'administrasi', contexts: [], note: '', period: '' };

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function dateLabel(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? 'Tanggal tidak tersedia'
    : parsed.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function responseError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data.error || data.message || fallback;
  } catch {
    return fallback;
  }
}

function fileKind(mime: string, name: string) {
  if (mime === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) return 'PDF';
  if (mime.startsWith('image/')) return 'GAMBAR';
  return 'TEKS';
}

export default function RuangBuktiPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<ProofItem[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'semua'>('semua');
  const [modal, setModal] = useState<'upload' | 'edit' | null>(null);
  const [editingItem, setEditingItem] = useState<ProofItem | null>(null);
  const [metadata, setMetadata] = useState<Metadata>(EMPTY_METADATA);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<ProofItem | null>(null);
  const [mutationError, setMutationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const ownerRef = useRef<string | null>(null);

  const fetchItems = useCallback(async (quiet = false) => {
    if (!user) return;
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      setItems([]);
      setLoading(false);
      setError('Sesi masuk tidak ditemukan. Silakan masuk kembali.');
      return;
    }
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    const ownerId = user.id;
    ownerRef.current = ownerId;
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ruang-bukti', {
        headers: { 'x-session-id': sessionId },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(await responseError(response, 'Bukti belum dapat dimuat.'));
      const result = await response.json();
      if (controller.signal.aborted || ownerRef.current !== ownerId) return;
      setItems(Array.isArray(result.items) ? result.items : []);
      setStorageAvailable(Boolean(result.storageAvailable));
      setStorageMessage(result.storageMessage || null);
    } catch (caught) {
      if (controller.signal.aborted || ownerRef.current !== ownerId) return;
      setError(caught instanceof Error ? caught.message : 'Terjadi gangguan saat memuat bukti.');
    } finally {
      if (!controller.signal.aborted && ownerRef.current === ownerId) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    requestRef.current?.abort();
    ownerRef.current = user?.id ?? null;
    setItems([]);
    setError('');
    setModal(null);
    setEditingItem(null);
    setSelectedFile(null);
    setMetadata(EMPTY_METADATA);
    setMutationError('');
    setDeleteItem(null);
    setBusyId(null);
    setSaving(false);
    setLoading(Boolean(user));
    setStorageAvailable(true);
    setStorageMessage(null);
    if (user) void fetchItems();
    else setLoading(false);
    return () => requestRef.current?.abort();
  }, [user?.id, authLoading, fetchItems, user]);

  useEffect(() => {
    if (!user) return;
    const refreshOnFocus = () => { if (document.visibilityState === 'visible') void fetchItems(true); };
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [user, fetchItems]);

  const visibleItems = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('id-ID');
    return items.filter((item) => {
      const matchesCategory = categoryFilter === 'semua' || item.category === categoryFilter;
      const haystack = `${item.originalName} ${item.note} ${item.period} ${item.category} ${item.contexts.join(' ')}`.toLocaleLowerCase('id-ID');
      return matchesCategory && (!needle || haystack.includes(needle));
    });
  }, [items, query, categoryFilter]);

  function startUpload() {
    setMetadata(EMPTY_METADATA);
    setSelectedFile(null);
    setMutationError('');
    setModal('upload');
  }

  function startEdit(item: ProofItem) {
    setEditingItem(item);
    setMetadata({ category: item.category, contexts: item.contexts || [], note: item.note || '', period: item.period || '' });
    setMutationError('');
    setModal('edit');
  }

  function toggleContext(value: Context) {
    setMetadata((current) => ({
      ...current,
      contexts: current.contexts.includes(value)
        ? current.contexts.filter((context) => context !== value)
        : [...current.contexts, value],
    }));
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
    const extensionAllowed = /\.(pdf|png|jpe?g|txt)$/i.test(file.name);
    if ((!allowed.includes(file.type) && !extensionAllowed) || file.size > 10 * 1024 * 1024) {
      setMutationError(file.size > 10 * 1024 * 1024
        ? 'Ukuran file melebihi batas 10 MB.'
        : 'Format yang didukung: PDF, PNG, JPG, dan TXT.');
      event.target.value = '';
      setSelectedFile(null);
      return;
    }
    setMutationError('');
    setSelectedFile(file);
  }

  async function submitMetadata(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId || !user) {
      setMutationError('Sesi masuk tidak ditemukan. Silakan masuk kembali.');
      return;
    }
    if (modal === 'upload' && !selectedFile) {
      setMutationError('Pilih berkas yang akan disimpan.');
      return;
    }
    if (modal === 'upload' && !storageAvailable) return;
    setSaving(true);
    setMutationError('');
    const ownerId = user.id;
    try {
      let response: Response;
      if (modal === 'upload') {
        const body = new FormData();
        body.append('file', selectedFile as File);
        body.append('metadata', JSON.stringify(metadata));
        response = await fetch('/api/ruang-bukti', {
          method: 'POST',
          headers: { 'x-session-id': sessionId },
          body,
        });
      } else if (editingItem) {
        response = await fetch(`/api/ruang-bukti/${encodeURIComponent(editingItem.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
          body: JSON.stringify(metadata),
        });
      } else return;
      if (!response.ok) throw new Error(await responseError(response, 'Perubahan belum berhasil disimpan.'));
      if (ownerRef.current !== ownerId) return;
      setModal(null);
      setEditingItem(null);
      setSelectedFile(null);
      await fetchItems(true);
    } catch (caught) {
      if (ownerRef.current === ownerId) setMutationError(caught instanceof Error ? caught.message : 'Perubahan belum berhasil disimpan.');
    } finally {
      if (ownerRef.current === ownerId) setSaving(false);
    }
  }

  async function downloadItem(item: ProofItem) {
    if (!storageAvailable || busyId) return;
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      setError('Sesi masuk tidak ditemukan. Silakan masuk kembali.');
      return;
    }
    setBusyId(item.id);
    setError('');
    const ownerId = user?.id;
    try {
      const response = await fetch(`/api/ruang-bukti/${encodeURIComponent(item.id)}`, {
        headers: { 'x-session-id': sessionId },
      });
      if (!response.ok) throw new Error(await responseError(response, 'Berkas belum dapat diunduh.'));
      const blob = await response.blob();
      if (ownerRef.current !== ownerId) return;
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = item.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (caught) {
      if (ownerRef.current === ownerId) setError(caught instanceof Error ? caught.message : 'Berkas belum dapat diunduh.');
    } finally {
      if (ownerRef.current === ownerId) setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteItem) return;
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      setError('Sesi masuk tidak ditemukan. Silakan masuk kembali.');
      return;
    }
    const ownerId = user?.id;
    setBusyId(deleteItem.id);
    setError('');
    try {
      const response = await fetch(`/api/ruang-bukti/${encodeURIComponent(deleteItem.id)}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId },
      });
      if (!response.ok) throw new Error(await responseError(response, 'Bukti belum berhasil dihapus.'));
      setDeleteItem(null);
      if (ownerRef.current === ownerId) await fetchItems(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Bukti belum berhasil dihapus.');
    } finally {
      if (ownerRef.current === ownerId) setBusyId(null);
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-[70vh] bg-[#071a31] px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-8 w-56 rounded-lg bg-slate-700/70" />
          <div className="h-44 rounded-3xl bg-slate-800/80" />
          <div className="h-20 rounded-2xl bg-slate-800/80" />
          <div className="h-32 rounded-2xl bg-slate-800/80" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] bg-[#071a31] px-5 py-16 text-slate-100">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-sky-900/70 bg-[#0b2341] shadow-2xl shadow-slate-950/30">
          <div className="grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Ruang Bukti · arsip pribadi</p>
              <h1 className="max-w-xl text-4xl font-bold leading-tight text-white md:text-5xl">Simpan bukti kerja dalam satu ruang.</h1>
              <p className="mt-5 max-w-xl leading-7 text-slate-300">Masuk untuk mengelola berkas, memberi konteks, dan menemukannya kembali saat dibutuhkan.</p>
            </div>
            <Link href="/login" className="inline-flex items-center justify-center rounded-xl bg-cyan-300 px-6 py-3 font-bold text-[#06203b] transition hover:bg-cyan-200">
              Masuk ke akun
            </Link>
          </div>
          <div className="border-t border-sky-900/70 px-8 py-5 text-sm text-slate-400 md:px-12">
            Data ruang bukti hanya tampil setelah Anda masuk ke akun.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#071a31] px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-11">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-6 border-b border-sky-900/70 pb-7 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
              <span className="h-px w-8 bg-cyan-300" /> Arsip pribadi
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Ruang Bukti</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Simpan dokumen pendukung, beri konteks, dan temukan kembali dengan cepat.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => void fetchItems(true)} disabled={refreshing || loading} className="rounded-xl border border-sky-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 disabled:opacity-50">
              {refreshing ? 'Memperbarui…' : 'Perbarui daftar'}
            </button>
            <button onClick={startUpload} disabled={!storageAvailable} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#06203b] shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-45">
              <span className="text-lg leading-none">+</span> Simpan bukti
            </button>
          </div>
        </header>

        <section className="mb-7 grid gap-5 rounded-3xl border border-sky-900/80 bg-[#0b2341] p-5 md:grid-cols-[1.35fr_0.65fr] md:items-center md:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <path d="M12 3 4.5 6v5.2c0 4.7 3.2 8.2 7.5 9.8 4.3-1.6 7.5-5.1 7.5-9.8V6L12 3Z" />
                <path d="m8.8 12.1 2.1 2.1 4.4-4.6" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-white">Tersimpan untuk Anda, bukan tanda verifikasi</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                Ruang ini hanya menyimpan file dan catatan Anda. Berkas di sini belum dinyatakan resmi, tervalidasi, atau membuktikan kompetensi.
              </p>
            </div>
          </div>
          <div className={`rounded-2xl border px-4 py-3 ${storageAvailable ? 'border-sky-800 bg-[#081d36]' : 'border-amber-400/40 bg-amber-300/10'}`}>
            <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${storageAvailable ? 'text-cyan-200' : 'text-amber-200'}`}>
              {storageAvailable ? 'Penyimpanan berkas' : 'Penyimpanan tidak tersedia'}
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-300">
              {storageAvailable ? 'Berkas PDF, PNG, JPG, atau TXT · maksimal 10 MB.' : storageMessage || 'Layanan penyimpanan belum siap. Unggah dan unduh dinonaktifkan sementara.'}
            </p>
          </div>
        </section>

        {error && (
          <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-400/30 bg-rose-950/40 px-5 py-4 text-sm text-rose-100">
            <span>{error}</span>
            <button onClick={() => void fetchItems()} className="rounded-lg border border-rose-300/30 px-3 py-1.5 font-semibold hover:bg-rose-400/10">Coba lagi</button>
          </div>
        )}

        <section aria-label="Daftar bukti">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-sky-900/80 bg-[#0b2341] p-4 md:flex-row md:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Cari bukti</span>
              <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" />
              </svg>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama file, catatan, periode…" className="w-full rounded-xl border border-sky-900 bg-[#071a31] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/15" />
            </label>
            <label className="min-w-[220px]">
              <span className="sr-only">Filter kategori</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as Category | 'semua')} className="w-full rounded-xl border border-sky-900 bg-[#071a31] px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-300">
                {CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </label>
            <span className="px-1 text-xs font-medium text-slate-400">{visibleItems.length} dari {items.length} bukti</span>
          </div>

          {loading ? (
            <div className="space-y-3" aria-label="Memuat bukti">
              {[0, 1, 2].map((row) => <div key={row} className="h-28 animate-pulse rounded-2xl border border-sky-900/70 bg-[#0b2341]" />)}
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-sky-800 bg-[#0b2341]/70 px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-900/60 text-cyan-200">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10l2 2h5.5A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" />
                  <path d="M12 10v6m-3-3h6" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">{items.length ? 'Belum ada hasil yang cocok' : 'Ruang bukti masih kosong'}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                {items.length ? 'Ubah kata pencarian atau pilih kategori lain.' : 'Simpan berkas pendukung dan tambahkan konteks agar mudah ditemukan nanti.'}
              </p>
              {!items.length && storageAvailable && (
                <button onClick={startUpload} className="mt-6 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#06203b] transition hover:bg-cyan-200">Simpan bukti pertama</button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleItems.map((item) => (
                <article key={item.id} className="group rounded-2xl border border-sky-900/80 bg-[#0b2341] p-5 transition hover:border-sky-700 hover:bg-[#0d294b] md:p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-[10px] font-black tracking-widest ${fileKind(item.mime, item.originalName) === 'PDF' ? 'border-rose-300/20 bg-rose-300/10 text-rose-200' : fileKind(item.mime, item.originalName) === 'GAMBAR' ? 'border-cyan-300/20 bg-cyan-300/10 text-cyan-200' : 'border-amber-300/20 bg-amber-300/10 text-amber-200'}`}>
                      {fileKind(item.mime, item.originalName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="max-w-full truncate font-semibold text-white" title={item.originalName}>{item.originalName}</h3>
                        <span className="rounded-full border border-sky-700 bg-sky-900/50 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">
                          {CATEGORIES.find((category) => category.value === item.category)?.label || 'Lainnya'}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span>{humanSize(item.size)}</span>
                        <span>Ditambahkan {dateLabel(item.createdAt)}</span>
                        {item.period && <span>Periode {item.period}</span>}
                      </div>
                      {item.note && <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-300">{item.note}</p>}
                      {!!item.contexts?.length && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.contexts.map((context) => <span key={context} className="rounded-md bg-[#071a31] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">{CONTEXTS.find((entry) => entry.value === context)?.label || context}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-sky-900/70 pt-4 md:border-0 md:pt-0">
                      <button onClick={() => void downloadItem(item)} disabled={!storageAvailable || busyId === item.id} className="rounded-lg border border-sky-800 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-300/5 disabled:cursor-not-allowed disabled:opacity-40">
                        {busyId === item.id ? 'Memproses…' : 'Unduh'}
                      </button>
                      <button onClick={() => startEdit(item)} className="rounded-lg border border-sky-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-sky-500 hover:text-white">Edit detail</button>
                      <button onClick={() => { setDeleteItem(item); setError(''); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/10 hover:text-rose-200">Hapus</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <p className="mt-8 border-t border-sky-900/70 pt-5 text-xs leading-5 text-slate-500">
          Ruang Bukti adalah penyimpanan file pribadi. Simpan dokumen asli dengan aman; unggahan di sini tidak menggantikan verifikasi resmi.
        </p>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#020b17]/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setModal(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="proof-modal-title" className="my-auto w-full max-w-xl rounded-3xl border border-sky-800 bg-[#0b2341] shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between border-b border-sky-900 px-6 py-5 md:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">{modal === 'upload' ? 'Arsipkan bukti' : 'Perbarui keterangan'}</p>
                <h2 id="proof-modal-title" className="mt-1 text-xl font-bold text-white">{modal === 'upload' ? 'Simpan bukti baru' : 'Edit detail bukti'}</h2>
              </div>
              <button onClick={() => setModal(null)} disabled={saving} aria-label="Tutup formulir" className="rounded-lg px-3 py-2 text-slate-400 hover:bg-sky-900 hover:text-white disabled:opacity-40">Tutup</button>
            </div>
            <form onSubmit={submitMetadata} className="space-y-5 p-6 md:p-7">
              {mutationError && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-950/50 px-4 py-3 text-sm text-rose-100">{mutationError}</p>}
              {modal === 'upload' && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Berkas <span className="text-rose-300">*</span></label>
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!storageAvailable} className="flex w-full flex-col items-center rounded-2xl border border-dashed border-sky-700 bg-[#071a31] px-5 py-6 text-center transition hover:border-cyan-300 disabled:opacity-40">
                    <span className="font-semibold text-white">{selectedFile ? selectedFile.name : 'Pilih file dari perangkat'}</span>
                    <span className="mt-1 text-xs text-slate-400">{selectedFile ? `${humanSize(selectedFile.size)} · ${selectedFile.type || 'format dokumen'}` : 'PDF, PNG, JPG, atau TXT · maksimal 10 MB'}</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain" onChange={chooseFile} className="sr-only" />
                </div>
              )}
              {modal === 'edit' && editingItem && (
                <div className="rounded-xl border border-sky-900 bg-[#071a31] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Nama berkas</p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-200">{editingItem.originalName}</p>
                </div>
              )}
              <div>
                <label htmlFor="proof-category" className="mb-2 block text-sm font-semibold text-slate-200">Kategori</label>
                <select id="proof-category" value={metadata.category} onChange={(event) => setMetadata({ ...metadata, category: event.target.value as Category })} className="w-full rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300">
                  {CATEGORIES.filter((category) => category.value !== 'semua').map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-slate-200">Konteks penggunaan</legend>
                <div className="flex flex-wrap gap-2">
                  {CONTEXTS.map((context) => {
                    const checked = metadata.contexts.includes(context.value);
                    return <button type="button" key={context.value} aria-pressed={checked} onClick={() => toggleContext(context.value)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${checked ? 'border-cyan-300 bg-cyan-300/10 text-cyan-100' : 'border-sky-800 text-slate-400 hover:border-sky-600 hover:text-slate-200'}`}>{context.label}</button>;
                  })}
                </div>
              </fieldset>
              <div>
                <label htmlFor="proof-period" className="mb-2 block text-sm font-semibold text-slate-200">Periode <span className="font-normal text-slate-500">(opsional)</span></label>
                <input id="proof-period" value={metadata.period} onChange={(event) => setMetadata({ ...metadata, period: event.target.value })} maxLength={80} placeholder="Contoh: 2023–2024" className="w-full rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300" />
              </div>
              <div>
                <label htmlFor="proof-note" className="mb-2 block text-sm font-semibold text-slate-200">Catatan <span className="font-normal text-slate-500">(opsional)</span></label>
                <textarea id="proof-note" value={metadata.note} onChange={(event) => setMetadata({ ...metadata, note: event.target.value })} rows={3} maxLength={500} placeholder="Tambahkan keterangan agar dokumen mudah dikenali." className="w-full resize-y rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm leading-5 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300" />
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-sky-900 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setModal(null)} disabled={saving} className="rounded-xl border border-sky-800 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-sky-900/50 disabled:opacity-50">Batal</button>
                <button type="submit" disabled={saving || (modal === 'upload' && !storageAvailable)} className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#06203b] transition hover:bg-cyan-200 disabled:opacity-50">
                  {saving ? 'Menyimpan…' : modal === 'upload' ? 'Simpan berkas' : 'Simpan perubahan'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteItem && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020b17]/80 p-4 backdrop-blur-sm">
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-3xl border border-sky-800 bg-[#0b2341] p-6 shadow-2xl shadow-black/50">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300">Konfirmasi penghapusan</p>
            <h2 id="delete-title" className="mt-2 text-xl font-bold text-white">Hapus bukti ini?</h2>
            <p className="mt-3 break-all text-sm font-medium text-slate-200">{deleteItem.originalName}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Berkas dan detailnya akan dihapus dari Ruang Bukti. Tindakan ini tidak dapat dibatalkan.</p>
            {error && <p role="alert" className="mt-4 rounded-xl bg-rose-950/50 px-4 py-3 text-sm text-rose-100">{error}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeleteItem(null)} disabled={busyId === deleteItem.id} className="flex-1 rounded-xl border border-sky-800 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-sky-900/50">Batal</button>
              <button onClick={() => void confirmDelete()} disabled={busyId === deleteItem.id} className="flex-1 rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-400 disabled:opacity-50">{busyId === deleteItem.id ? 'Menghapus…' : 'Ya, hapus'}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
