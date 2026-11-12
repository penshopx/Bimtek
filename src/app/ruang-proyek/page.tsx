'use client';

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getJabatanByBidang, getJabatanById } from '@/lib/skkData';

interface Project {
  id: string;
  name: string;
  clientName: string;
  location: string;
  role: string;
  targetJabatanId: string;
  startedYear: string;
  completedYear: string;
  description: string;
  outcomes: string;
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface Evidence {
  id: string;
  originalName: string;
  category: string;
  contexts: string[];
  note: string;
  period: string;
  size: number;
  mime: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface ProjectInput {
  name: string;
  clientName: string;
  location: string;
  role: string;
  targetJabatanId: string;
  startedYear: string;
  completedYear: string;
  description: string;
  outcomes: string;
  evidenceIds: string[];
}

const EMPTY_FORM: ProjectInput = {
  name: '',
  clientName: '',
  location: '',
  role: '',
  targetJabatanId: '',
  startedYear: '',
  completedYear: '',
  description: '',
  outcomes: '',
  evidenceIds: [],
};

const JABATAN_OPTIONS = [
  ...getJabatanByBidang('Sipil'),
  ...getJabatanByBidang('Manajemen Pelaksanaan'),
];

async function responseError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data.error || data.message || fallback;
  } catch {
    return fallback;
  }
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Tanggal tidak tersedia'
    : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function projectPeriod(project: Pick<Project, 'startedYear' | 'completedYear'>) {
  if (project.startedYear && project.completedYear) return `${project.startedYear} — ${project.completedYear}`;
  return project.startedYear || project.completedYear || 'Periode tidak dicatat';
}

function FieldLabel({ htmlFor, children, optional = false }: { htmlFor: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-200">
      {children}{optional && <span className="font-normal text-slate-400"> (opsional)</span>}
    </label>
  );
}

export default function RuangProyekPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [evidenceError, setEvidenceError] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectInput>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const ownerRef = useRef<string | null>(null);

  const fetchData = useCallback(async (quiet = false) => {
    if (!user) return;
    const sessionId = localStorage.getItem('sessionId');
    const ownerId = user.id;
    if (!sessionId) {
      setProjects([]);
      setEvidence([]);
      setLoading(false);
      setError('Sesi masuk tidak ditemukan. Silakan masuk kembali untuk membuka data Anda.');
      setEvidenceError('');
      return;
    }
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    ownerRef.current = ownerId;
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    setEvidenceError('');
    const headers = { 'x-session-id': sessionId };
    const [projectResult, evidenceResult] = await Promise.allSettled([
      fetch('/api/ruang-proyek', { headers, signal: controller.signal }),
      fetch('/api/ruang-bukti', { headers, signal: controller.signal }),
    ]);
    if (controller.signal.aborted || ownerRef.current !== ownerId) return;
    if (projectResult.status === 'fulfilled') {
      const response = projectResult.value;
      if (response.ok) {
        try {
          const result = await response.json();
          if (!controller.signal.aborted && ownerRef.current === ownerId) {
            setProjects(Array.isArray(result.projects) ? result.projects : []);
          }
        } catch {
          if (!controller.signal.aborted) setError('Respons proyek tidak terbaca. Coba perbarui daftar.');
        }
      } else {
        setError(await responseError(response, response.status === 401
          ? 'Sesi Anda berakhir. Masuk kembali untuk memuat proyek.'
          : 'Proyek belum dapat dimuat.'));
      }
    } else if (!controller.signal.aborted) {
      setError('Koneksi bermasalah. Proyek belum dapat dimuat.');
    }
    if (evidenceResult.status === 'fulfilled') {
      const response = evidenceResult.value;
      if (response.ok) {
        try {
          const result = await response.json();
          if (!controller.signal.aborted && ownerRef.current === ownerId) {
            setEvidence(Array.isArray(result.items) ? result.items : []);
            setStorageAvailable(Boolean(result.storageAvailable));
            setStorageMessage(result.storageMessage || null);
          }
        } catch {
          if (!controller.signal.aborted) {
            setEvidence([]);
            setEvidenceError('Respons Ruang Bukti tidak terbaca. Anda tetap dapat mencatat proyek tanpa menautkan bukti.');
          }
        }
      } else {
        setEvidence([]);
        setEvidenceError(await responseError(response, response.status === 401
          ? 'Sesi Anda berakhir. Masuk kembali untuk memuat daftar Ruang Bukti.'
          : 'Daftar Ruang Bukti belum dapat dimuat; Anda tetap dapat mencatat proyek tanpa menautkan bukti.'));
      }
    } else if (!controller.signal.aborted) {
      setEvidence([]);
      setEvidenceError('Koneksi ke Ruang Bukti bermasalah. Anda tetap dapat mencatat proyek tanpa menautkan bukti.');
    }
    if (!controller.signal.aborted && ownerRef.current === ownerId) {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    requestRef.current?.abort();
    ownerRef.current = user?.id ?? null;
    setProjects([]);
    setEvidence([]);
    setError('');
    setEvidenceError('');
    setStorageAvailable(true);
    setStorageMessage(null);
    setQuery('');
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setSuccess('');
    setSaving(false);
    setDeletingId(null);
    setBusyDelete(false);
    setExpandedId(null);
    setLoading(Boolean(user));
    setRefreshing(false);
    if (user) void fetchData();
    else setLoading(false);
    return () => requestRef.current?.abort();
  }, [user?.id, user, authLoading, fetchData]);

  useEffect(() => {
    if (!user) return;
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') void fetchData(true);
    };
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [user, fetchData]);

  const evidenceById = useMemo(() => new Map(evidence.map((item) => [item.id, item])), [evidence]);
  const visibleProjects = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('id-ID');
    if (!needle) return projects;
    return projects.filter((project) => {
      const jabatan = getJabatanById(project.targetJabatanId);
      return `${project.name} ${project.clientName} ${project.location} ${project.role} ${project.description} ${project.outcomes} ${jabatan?.name || ''}`
        .toLocaleLowerCase('id-ID').includes(needle);
    });
  }, [projects, query]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setSuccess('');
    setModalOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setForm({
      name: project.name || '',
      clientName: project.clientName || '',
      location: project.location || '',
      role: project.role || '',
      targetJabatanId: project.targetJabatanId || '',
      startedYear: project.startedYear || '',
      completedYear: project.completedYear || '',
      description: project.description || '',
      outcomes: project.outcomes || '',
      evidenceIds: Array.isArray(project.evidenceIds) ? project.evidenceIds : [],
    });
    setFormError('');
    setSuccess('');
    setModalOpen(true);
  }

  function toggleEvidence(id: string) {
    setForm((current) => ({
      ...current,
      evidenceIds: current.evidenceIds.includes(id)
        ? current.evidenceIds.filter((itemId) => itemId !== id)
        : current.evidenceIds.length < 20 ? [...current.evidenceIds, id] : current.evidenceIds,
    }));
  }

  function validateForm() {
    if (!form.name.trim() || !form.role.trim() || !form.description.trim()) return 'Lengkapi nama proyek, peran, dan ringkasan pengalaman.';
    if (form.name.trim().length > 120 || form.clientName.trim().length > 120 || form.location.trim().length > 120 || form.role.trim().length > 120) return 'Nama, klien, lokasi, dan peran maksimal 120 karakter.';
    if (form.description.trim().length > 3000 || form.outcomes.trim().length > 2000) return 'Ringkasan maksimal 3.000 karakter dan hasil maksimal 2.000 karakter.';
    const yearPattern = /^\d{4}$/;
    for (const year of [form.startedYear, form.completedYear]) {
      if (year && (!yearPattern.test(year) || Number(year) < 1900 || Number(year) > new Date().getFullYear() + 10)) return 'Tahun harus berupa empat angka dalam rentang yang wajar.';
    }
    if (form.startedYear && form.completedYear && Number(form.startedYear) > Number(form.completedYear)) return 'Tahun selesai tidak boleh lebih awal dari tahun mulai.';
    if (form.evidenceIds.length > 20) return 'Pilih maksimal 20 bukti.';
    return '';
  }

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId || !user) {
      setFormError('Sesi masuk tidak ditemukan. Masuk kembali sebelum menyimpan.');
      return;
    }
    const ownerId = user.id;
    const input: ProjectInput = {
      ...form,
      name: form.name.trim(),
      clientName: form.clientName.trim(),
      location: form.location.trim(),
      role: form.role.trim(),
      targetJabatanId: form.targetJabatanId.trim(),
      startedYear: form.startedYear.trim(),
      completedYear: form.completedYear.trim(),
      description: form.description.trim(),
      outcomes: form.outcomes.trim(),
      evidenceIds: [...form.evidenceIds],
    };
    setSaving(true);
    setFormError('');
    try {
      const response = await fetch(editing ? `/api/ruang-proyek/${encodeURIComponent(editing.id)}` : '/api/ruang-proyek', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error(await responseError(response, response.status === 401
        ? 'Sesi Anda berakhir. Masuk kembali, lalu coba simpan lagi.'
        : 'Proyek belum berhasil disimpan.'));
      if (ownerRef.current !== ownerId) return;
      setModalOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setSuccess(editing ? 'Perubahan proyek berhasil disimpan.' : 'Proyek berhasil ditambahkan.');
      await fetchData(true);
    } catch (caught) {
      if (ownerRef.current === ownerId) setFormError(caught instanceof Error ? caught.message : 'Terjadi gangguan. Isian Anda tetap tersimpan di formulir.');
    } finally {
      if (ownerRef.current === ownerId) setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingId || !user) return;
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      setError('Sesi masuk tidak ditemukan. Masuk kembali sebelum menghapus proyek.');
      return;
    }
    const ownerId = user.id;
    setBusyDelete(true);
    setError('');
    try {
      const response = await fetch(`/api/ruang-proyek/${encodeURIComponent(deletingId)}`, {
        method: 'DELETE',
        headers: { 'x-session-id': sessionId },
      });
      if (!response.ok) throw new Error(await responseError(response, response.status === 401
        ? 'Sesi Anda berakhir. Masuk kembali, lalu coba hapus lagi.'
        : 'Proyek belum berhasil dihapus.'));
      if (ownerRef.current !== ownerId) return;
      setDeletingId(null);
      setSuccess('Catatan proyek berhasil dihapus.');
      await fetchData(true);
    } catch (caught) {
      if (ownerRef.current === ownerId) setError(caught instanceof Error ? caught.message : 'Proyek belum berhasil dihapus.');
    } finally {
      if (ownerRef.current === ownerId) setBusyDelete(false);
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-[70vh] bg-[#071a31] px-5 py-12 text-white">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6" aria-label="Memeriksa sesi">
          <div className="h-8 w-48 rounded-lg bg-slate-700/70" />
          <div className="h-48 rounded-3xl bg-[#0b2341]" />
          <div className="h-28 rounded-2xl bg-[#0b2341]" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100dvh-4rem)] bg-[#071a31] px-5 py-16 text-slate-100">
        <section className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-sky-900/70 bg-[#0b2341] shadow-2xl shadow-slate-950/30">
          <div className="grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">SIAP SKK · catatan kerja pribadi</p>
              <h1 className="max-w-xl text-4xl font-bold leading-tight text-white md:text-5xl">Ruang Proyek</h1>
              <p className="mt-5 max-w-xl leading-7 text-slate-300">Susun pengalaman proyek dan refleksi untuk persiapan belajar Anda. Catatan ini hanya milik akun Anda.</p>
            </div>
            <Link href="/login" className="inline-flex items-center justify-center rounded-xl bg-cyan-300 px-6 py-3 font-bold text-[#06203b] transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-[#0b2341]">
              Masuk ke akun
            </Link>
          </div>
          <div className="border-t border-sky-900/70 px-8 py-5 text-sm leading-6 text-slate-300 md:px-12">
            Data proyek tidak tampil untuk pengguna yang belum masuk. Ini bukan portofolio publik atau penilaian kompetensi resmi.
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#071a31] px-4 py-8 text-slate-100 sm:px-6 lg:px-8 lg:py-11">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col justify-between gap-6 border-b border-sky-900/70 pb-7 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
              <span className="h-px w-8 bg-cyan-300" /> Buku kerja privat
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Ruang Proyek</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Catat pekerjaan yang pernah Anda lakukan, lalu siapkan bahan refleksi untuk belajar berikutnya.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void fetchData(true)} disabled={refreshing || loading} className="rounded-xl border border-sky-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-50">
              {refreshing ? 'Memperbarui…' : 'Perbarui daftar'}
            </button>
            <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#06203b] shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:ring-offset-2 focus:ring-offset-[#071a31]">
              <span className="text-lg leading-none" aria-hidden="true">+</span> Catat proyek
            </button>
          </div>
        </header>

        <section className="mb-7 grid gap-5 rounded-3xl border border-sky-900/80 bg-[#0b2341] p-5 md:grid-cols-[1.35fr_0.65fr] md:items-center md:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M4 19.5h16M6 16V8l6-4 6 4v8M9 16v-5h6v5" /><path d="M3 20h18" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-white">Ruang pribadi untuk merapikan pengalaman</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                Catatan proyek dan tautan berkas hanya untuk akun Anda. Entri maupun berkas yang ditautkan bukan bukti kompetensi dan tidak memprediksi hasil sertifikasi.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-300/35 bg-amber-300/10 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">Jaga kerahasiaan</p>
            <p className="mt-1 text-sm leading-5 text-amber-50">Jangan cantumkan informasi proyek rahasia tanpa izin.</p>
          </div>
        </section>

        {success && <p role="status" className="mb-5 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">{success}</p>}
        {error && (
          <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-400/30 bg-rose-950/40 px-5 py-4 text-sm text-rose-100">
            <span>{error}</span>
            <button type="button" onClick={() => void fetchData()} className="rounded-lg border border-rose-300/30 px-3 py-1.5 font-semibold hover:bg-rose-400/10 focus:outline-none focus:ring-2 focus:ring-rose-200">Coba lagi</button>
          </div>
        )}

        <section aria-label="Daftar proyek">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-sky-900/80 bg-[#0b2341] p-4 md:flex-row md:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Cari proyek</span>
              <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></svg>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari proyek, peran, lokasi…" className="w-full rounded-xl border border-sky-900 bg-[#071a31] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
            </label>
            <span className="px-1 text-xs font-medium text-slate-300">{visibleProjects.length} dari {projects.length} proyek</span>
          </div>

          {loading ? (
            <div className="space-y-3" aria-label="Memuat proyek">
              {[0, 1, 2].map((row) => <div key={row} className="h-32 animate-pulse rounded-2xl border border-sky-900/70 bg-[#0b2341]" />)}
            </div>
          ) : visibleProjects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-sky-800 bg-[#0b2341]/70 px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-900/60 text-cyan-200" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 19.5h16M6 16V8l6-4 6 4v8M9 16v-5h6v5" /></svg>
              </div>
              <h2 className="text-xl font-semibold text-white">{projects.length ? 'Belum ada hasil yang cocok' : 'Mulai dari satu pengalaman kerja'}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
                {projects.length ? 'Coba kata kunci lain untuk menemukan catatan proyek.' : 'Tuliskan konteks pekerjaan, peran Anda, dan hal yang ingin dipelajari kembali.'}
              </p>
              {!projects.length && <button type="button" onClick={openCreate} className="mt-6 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#06203b] transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-100">Catat proyek pertama</button>}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleProjects.map((project, index) => {
                const target = project.targetJabatanId ? getJabatanById(project.targetJabatanId) : undefined;
                const linkedEvidence = project.evidenceIds.map((id) => evidenceById.get(id)).filter((item): item is Evidence => Boolean(item));
                const missingEvidenceCount = Math.max(0, project.evidenceIds.length - linkedEvidence.length);
                const expanded = expandedId === project.id;
                return (
                  <article key={project.id} className="rounded-2xl border border-sky-900/80 bg-[#0b2341] p-5 transition hover:border-sky-700 hover:bg-[#0d294b] md:p-6" style={{ animationDelay: `${Math.min(index * 45, 180)}ms` }}>
                    <div className="flex flex-col gap-5 md:flex-row md:items-start">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-bold tracking-wide text-cyan-100" aria-hidden="true">
                        {project.startedYear ? project.startedYear.slice(-2) : '—'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="break-words text-lg font-bold text-white md:text-xl">{project.name}</h2>
                            <p className="mt-1 text-sm font-medium text-cyan-100">{project.role}</p>
                          </div>
                          <span className="rounded-full border border-sky-700 bg-sky-900/50 px-3 py-1 text-xs font-semibold text-slate-100">{projectPeriod(project)}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
                          {project.clientName && <span>{project.clientName}</span>}
                          {project.location && <span>{project.location}</span>}
                          <span>Diperbarui {dateLabel(project.updatedAt)}</span>
                        </div>
                        {target && <p className="mt-3 text-xs leading-5 text-slate-200">Target belajar: <span className="font-semibold text-cyan-100">{target.name}</span></p>}
                        <p className={`mt-3 text-sm leading-6 text-slate-200 ${expanded ? '' : 'line-clamp-2'}`}>{project.description}</p>
                        {expanded && (
                          <div className="mt-4 space-y-4 border-t border-sky-900/70 pt-4">
                            {project.outcomes && <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">Hasil dan refleksi</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-200">{project.outcomes}</p></div>}
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">Berkas Ruang Bukti tertaut</p>
                              {linkedEvidence.length ? (
                                <ul className="mt-2 space-y-2">
                                  {linkedEvidence.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-900 bg-[#071a31] px-3 py-2.5">
                                    <span className="min-w-0 break-all text-sm text-slate-200">{item.originalName}</span>
                                    <Link href="/ruang-bukti" className="shrink-0 text-xs font-semibold text-cyan-200 underline decoration-cyan-200/40 underline-offset-4 hover:text-cyan-100">Buka Ruang Bukti</Link>
                                  </li>)}
                                </ul>
                              ) : <p className="mt-1 text-sm text-slate-300">{project.evidenceIds.length ? 'Berkas tertaut tidak tersedia di daftar Ruang Bukti saat ini.' : 'Belum ada berkas yang ditautkan.'}</p>}
                              {missingEvidenceCount > 0 && <p className="mt-2 text-xs text-amber-200">{missingEvidenceCount} tautan berkas tidak ditemukan pada daftar akun saat ini.</p>}
                            </div>
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-sky-900/70 pt-4">
                          <button type="button" onClick={() => setExpandedId(expanded ? null : project.id)} aria-expanded={expanded} className="rounded-lg border border-sky-800 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300">
                            {expanded ? 'Ringkas catatan' : 'Lihat refleksi dan berkas'}
                          </button>
                          <button type="button" onClick={() => openEdit(project)} className="rounded-lg border border-sky-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300">Edit catatan</button>
                          <button type="button" onClick={() => { setDeletingId(project.id); setError(''); }} className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/10 focus:outline-none focus:ring-2 focus:ring-rose-300">Hapus</button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-3xl border border-sky-900/80 bg-[#0b2341] p-5 md:p-7" aria-labelledby="learning-tools-title">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Lanjutkan persiapan</p>
            <h2 id="learning-tools-title" className="mt-1 text-xl font-bold text-white">Ruang ini untuk belajar, bukan penilaian</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Gunakan catatan sebagai bahan diskusi dan refleksi. Periksa kembali kebutuhan Anda melalui sarana belajar SIAP SKK.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/ruang-bukti', label: 'Ruang Bukti', detail: 'Kelola berkas pribadi' },
              { href: '/alur-belajar', label: 'Alur Belajar', detail: 'Rencanakan langkah belajar' },
              { href: '/klinik-uji-kompetensi', label: 'Klinik Uji Kompetensi', detail: 'Siapkan pertanyaan belajar' },
              { href: '/skk-coach', label: 'Konsultasi SKK', detail: 'Tanyakan panduan persiapan' },
              { href: '/dokumen', label: 'Checklist Dokumen', detail: 'Kelola persiapan berkas' },
              { href: '/bimtek', label: 'Materi BIMTEK', detail: 'Telusuri materi belajar' },
              { href: '/knowledge-base', label: 'Knowledge Base', detail: 'Telusuri regulasi dan panduan' },
              { href: '/skk', label: 'Kompetensi Hub', detail: 'Jelajahi alat persiapan SKK' },
            ].map((tool) => (
              <Link key={tool.href} href={tool.href} className="group rounded-2xl border border-sky-900 bg-[#071a31] p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-300">
                <span className="block text-sm font-bold text-white group-hover:text-cyan-100">{tool.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-300">{tool.detail}</span>
              </Link>
            ))}
          </div>
        </section>
        <p className="mt-8 border-t border-sky-900/70 pt-5 text-xs leading-5 text-slate-300">
          Catatan ini privat dan tersimpan pada akun Anda. Pengisian proyek atau tautan berkas tidak menggantikan verifikasi resmi maupun menyatakan kompetensi.
        </p>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#020b17]/85 p-3 backdrop-blur-sm sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setModalOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="project-modal-title" className="my-auto w-full max-w-3xl rounded-3xl border border-sky-800 bg-[#0b2341] shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between border-b border-sky-900 px-5 py-5 sm:px-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">{editing ? 'Perbarui catatan' : 'Catatan pengalaman'}</p>
                <h2 id="project-modal-title" className="mt-1 text-xl font-bold text-white">{editing ? 'Edit proyek' : 'Catat proyek'}</h2>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} disabled={saving} aria-label="Tutup formulir" className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-sky-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-40">Tutup</button>
            </div>
            <form onSubmit={submitProject} className="max-h-[calc(100dvh-9rem)] space-y-5 overflow-y-auto p-5 sm:p-7">
              {formError && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-950/50 px-4 py-3 text-sm leading-5 text-rose-100">{formError}</p>}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="project-name">Nama proyek <span className="text-rose-200">*</span></FieldLabel>
                  <input id="project-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={120} required autoFocus placeholder="Contoh: Renovasi gedung sekolah" className="w-full rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
                  <p className="mt-1 text-right text-xs text-slate-300">{form.name.length}/120</p>
                </div>
                <div>
                  <FieldLabel htmlFor="project-role">Peran Anda <span className="text-rose-200">*</span></FieldLabel>
                  <input id="project-role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} maxLength={120} required placeholder="Contoh: Pelaksana lapangan" className="w-full rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
                </div>
                <div>
                  <FieldLabel htmlFor="project-client" optional>Klien / pemberi kerja</FieldLabel>
                  <input id="project-client" value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} maxLength={120} placeholder="Boleh dikosongkan" className="w-full rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
                </div>
                <div>
                  <FieldLabel htmlFor="project-location" optional>Lokasi</FieldLabel>
                  <input id="project-location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} maxLength={120} placeholder="Kota atau wilayah" className="w-full rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
                </div>
                <div>
                  <FieldLabel htmlFor="project-start" optional>Tahun mulai</FieldLabel>
                  <input id="project-start" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={form.startedYear} onChange={(event) => setForm({ ...form, startedYear: event.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="2022" className="w-full rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
                </div>
                <div>
                  <FieldLabel htmlFor="project-completed" optional>Tahun selesai</FieldLabel>
                  <input id="project-completed" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={form.completedYear} onChange={(event) => setForm({ ...form, completedYear: event.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="2023" className="w-full rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
                </div>
              </div>
              <div>
                <FieldLabel htmlFor="project-target" optional>Target jabatan untuk persiapan belajar</FieldLabel>
                <select id="project-target" value={form.targetJabatanId} onChange={(event) => setForm({ ...form, targetJabatanId: event.target.value })} className="w-full rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20">
                  <option value="">Belum memilih target</option>
                  {JABATAN_OPTIONS.map((jabatan) => <option key={jabatan.id} value={jabatan.id}>{jabatan.name} · {jabatan.id}</option>)}
                </select>
                <p className="mt-1.5 text-xs leading-5 text-slate-300">Pilihan ini membantu mengarahkan refleksi belajar; bukan penetapan skema atau klaim hubungan resmi.</p>
              </div>
              <div>
                <FieldLabel htmlFor="project-description">Ringkasan pekerjaan <span className="text-rose-200">*</span></FieldLabel>
                <textarea id="project-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} maxLength={3000} required placeholder="Ceritakan lingkup pekerjaan, tanggung jawab, metode, dan situasi yang Anda hadapi." className="w-full resize-y rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
                <p className="mt-1 text-right text-xs text-slate-300">{form.description.length}/3000</p>
              </div>
              <div>
                <FieldLabel htmlFor="project-outcomes" optional>Hasil dan refleksi pribadi</FieldLabel>
                <textarea id="project-outcomes" value={form.outcomes} onChange={(event) => setForm({ ...form, outcomes: event.target.value })} rows={4} maxLength={2000} placeholder="Apa yang berjalan baik? Apa yang ingin Anda pelajari atau lakukan berbeda?" className="w-full resize-y rounded-xl border border-sky-800 bg-[#071a31] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" />
                <p className="mt-1 text-right text-xs text-slate-300">{form.outcomes.length}/2000</p>
              </div>
              <fieldset>
                <legend className="text-sm font-semibold text-slate-200">Tautkan berkas Ruang Bukti <span className="font-normal text-slate-300">(opsional · maksimal 20)</span></legend>
                <p className="mt-1 text-xs leading-5 text-slate-300">Hanya berkas yang sudah tersimpan di akun Anda yang dapat dipilih. Berkas tidak disalin ke catatan proyek.</p>
                {evidenceError && <p role="status" className="mt-3 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100">{evidenceError}</p>}
                {!evidenceError && !loading && evidence.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-dashed border-sky-800 bg-[#071a31] px-4 py-4 text-sm text-slate-300">
                    Belum ada berkas yang tersedia untuk ditautkan. <Link href="/ruang-bukti" className="font-semibold text-cyan-200 underline underline-offset-4 hover:text-cyan-100">Buka Ruang Bukti</Link>
                  </div>
                ) : evidence.length > 0 ? (
                  <div className="mt-3 max-h-52 space-y-2 overflow-y-auto rounded-xl border border-sky-900 bg-[#071a31] p-2">
                    {evidence.map((item) => {
                      const checked = form.evidenceIds.includes(item.id);
                      const disabled = !checked && form.evidenceIds.length >= 20;
                      return (
                        <div key={item.id} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition ${checked ? 'bg-cyan-300/10' : 'hover:bg-sky-900/40'} ${disabled ? 'opacity-50' : ''}`}>
                          <label htmlFor={`evidence-${item.id}`} className={`flex min-w-0 flex-1 cursor-pointer items-start gap-3 ${disabled ? 'cursor-not-allowed' : ''}`}>
                            <input id={`evidence-${item.id}`} type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleEvidence(item.id)} className="mt-1 h-4 w-4 accent-cyan-300 focus:ring-2 focus:ring-cyan-300" />
                            <span className="min-w-0 flex-1">
                              <span className="block break-all text-sm font-medium text-white">{item.originalName}</span>
                              <span className="mt-0.5 block text-xs text-slate-300">{item.category} {item.period ? `· ${item.period}` : ''}</span>
                            </span>
                          </label>
                          <Link href="/ruang-bukti" className="shrink-0 text-xs font-semibold text-cyan-200 underline underline-offset-4 hover:text-cyan-100">Lihat berkas</Link>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {form.evidenceIds.some((id) => !evidenceById.has(id)) && (
                  <p className="mt-2 text-xs leading-5 text-amber-200">Beberapa bukti tertaut sebelumnya tidak tersedia pada daftar saat ini. Simpan tanpa memilih ulang untuk menghapus tautan yang tidak ditemukan.</p>
                )}
                {!storageAvailable && storageMessage && <p className="mt-2 text-xs leading-5 text-amber-200">{storageMessage}</p>}
                <p className="mt-2 text-xs text-slate-300">{form.evidenceIds.length}/20 berkas dipilih</p>
              </fieldset>
              <div className="rounded-xl border border-amber-300/25 bg-amber-300/5 px-4 py-3 text-xs leading-5 text-amber-50">
                Jangan simpan rincian rahasia, data pribadi pihak lain, atau informasi proyek tanpa izin yang memadai.
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-sky-900 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setModalOpen(false)} disabled={saving} className="rounded-xl border border-sky-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-sky-900/60 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-50">Batal</button>
                <button type="submit" disabled={saving} className="rounded-xl bg-cyan-300 px-6 py-3 text-sm font-bold text-[#06203b] transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:ring-offset-2 focus:ring-offset-[#0b2341] disabled:cursor-wait disabled:opacity-60">{saving ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Simpan proyek'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020b17]/85 p-4 backdrop-blur-sm" role="presentation">
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-project-title" aria-describedby="delete-project-description" className="w-full max-w-md rounded-3xl border border-sky-800 bg-[#0b2341] p-6 shadow-2xl shadow-black/50">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-200">Hapus catatan</p>
            <h2 id="delete-project-title" className="mt-2 text-xl font-bold text-white">Hapus proyek ini?</h2>
            <p id="delete-project-description" className="mt-3 text-sm leading-6 text-slate-200">Catatan proyek akan dihapus dari akun Anda. Tautan ke berkas Ruang Bukti tidak menghapus berkas aslinya.</p>
            {error && <p role="alert" className="mt-4 rounded-lg border border-rose-400/30 bg-rose-950/50 px-3 py-2 text-sm text-rose-100">{error}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDeletingId(null)} disabled={busyDelete} className="rounded-xl border border-sky-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-sky-900/60 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-50">Batal</button>
              <button type="button" onClick={() => void confirmDelete()} disabled={busyDelete} className="rounded-xl bg-rose-300 px-4 py-2.5 text-sm font-bold text-[#32101a] hover:bg-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-100 disabled:opacity-50">{busyDelete ? 'Menghapus…' : 'Ya, hapus proyek'}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
