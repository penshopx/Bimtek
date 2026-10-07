'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  APL02_DRAFT_KEY, EMPTY_APL02_FORM, hasApl02Answers, parseApl02Draft, serializeApl02Draft,
  type Apl02Form, type Apl02Unit as UnitKompetensi,
} from '@/lib/apl02-draft';

// Jabatan data from sertifikasi
const allPositions = [
  { id: 'B001', name: 'Ahli Madya Teknik Bangunan Gedung', level: 'Ahli Madya', subklasifikasi: 'B' },
  { id: 'B002', name: 'Ahli Teknik Bangunan Gedung', level: 'Ahli', subklasifikasi: 'B' },
  { id: 'B003', name: 'Teknisi Teknik Bangunan Gedung', level: 'Teknisi', subklasifikasi: 'B' },
  { id: 'B004', name: 'Pelaksana Teknik Bangunan Gedung', level: 'Pelaksana', subklasifikasi: 'B' },
  { id: 'B005', name: 'Ahli Desain Interior', level: 'Ahli', subklasifikasi: 'B' },
  { id: 'B006', name: 'Ahli Arsitektur Lanskap', level: 'Ahli', subklasifikasi: 'B' },
  { id: 'B007', name: 'Manager Proyek Gedung', level: 'Manager', subklasifikasi: 'B' },
  { id: 'B008', name: 'Supervisor Konstruksi Gedung', level: 'Supervisor', subklasifikasi: 'B' },
  { id: 'C001', name: 'Ahli Madya Teknik Sipil', level: 'Ahli Madya', subklasifikasi: 'C' },
  { id: 'C002', name: 'Ahli Teknik Sipil', level: 'Ahli', subklasifikasi: 'C' },
  { id: 'C003', name: 'Teknisi Teknik Sipil', level: 'Teknisi', subklasifikasi: 'C' },
  { id: 'C004', name: 'Pelaksana Teknik Sipil', level: 'Pelaksana', subklasifikasi: 'C' },
  { id: 'C005', name: 'Ahli Geoteknik', level: 'Ahli', subklasifikasi: 'C' },
  { id: 'C006', name: 'Ahli Hidrologi', level: 'Ahli', subklasifikasi: 'C' },
  { id: 'C007', name: 'Ahli Struktur', level: 'Ahli', subklasifikasi: 'C' },
  { id: 'D001', name: 'Ahli Madya Teknik Mekanikal', level: 'Ahli Madya', subklasifikasi: 'D' },
  { id: 'D002', name: 'Ahli Teknik Mekanikal', level: 'Ahli', subklasifikasi: 'D' },
  { id: 'D003', name: 'Teknisi Teknik Mekanikal', level: 'Teknisi', subklasifikasi: 'D' },
  { id: 'D004', name: 'Ahli Plumbing', level: 'Ahli', subklasifikasi: 'D' },
  { id: 'D005', name: 'Ahli HVAC', level: 'Ahli', subklasifikasi: 'D' },
  { id: 'D006', name: 'Ahli Fire Protection', level: 'Ahli', subklasifikasi: 'D' },
  { id: 'E001', name: 'Ahli Madya Teknik Elektrikal', level: 'Ahli Madya', subklasifikasi: 'E' },
  { id: 'E002', name: 'Ahli Teknik Elektrikal', level: 'Ahli', subklasifikasi: 'E' },
  { id: 'E003', name: 'Teknisi Teknik Elektrikal', level: 'Teknisi', subklasifikasi: 'E' },
  { id: 'E004', name: 'Ahli Instalasi Listrik', level: 'Ahli', subklasifikasi: 'E' },
  { id: 'E005', name: 'Ahli Sistem Pendingin', level: 'Ahli', subklasifikasi: 'E' },
  { id: 'F001', name: 'Ahli Madya Teknik Jalan', level: 'Ahli Madya', subklasifikasi: 'F' },
  { id: 'F002', name: 'Ahli Teknik Jalan', level: 'Ahli', subklasifikasi: 'F' },
  { id: 'F003', name: 'Teknisi Teknik Jalan', level: 'Teknisi', subklasifikasi: 'F' },
  { id: 'F004', name: 'Ahli Perkerasan Jalan', level: 'Ahli', subklasifikasi: 'F' },
  { id: 'F005', name: 'Ahli Drainase Jalan', level: 'Ahli', subklasifikasi: 'F' },
  { id: 'G001', name: 'Ahli Madya Teknik Jembatan', level: 'Ahli Madya', subklasifikasi: 'G' },
  { id: 'G002', name: 'Ahli Teknik Jembatan', level: 'Ahli', subklasifikasi: 'G' },
  { id: 'G003', name: 'Teknisi Teknik Jembatan', level: 'Teknisi', subklasifikasi: 'G' },
  { id: 'G004', name: 'Ahli Struktur Jembatan', level: 'Ahli', subklasifikasi: 'G' },
  { id: 'H001', name: 'Ahli Benda Cagar Budaya', level: 'Ahli', subklasifikasi: 'H' },
  { id: 'H002', name: 'Teknisi Benda Cagar Budaya', level: 'Teknisi', subklasifikasi: 'H' },
  { id: 'MG001', name: 'Penanggung Jawab Badan Usaha (PJBU)', level: 'PJBU', subklasifikasi: 'MG' },
  { id: 'MG002', name: 'Penanggung Jawab Teknik (PJT)', level: 'PJT', subklasifikasi: 'MG' },
  { id: 'MG003', name: 'Penanggung Jawab Bidang (PJKB)', level: 'PJKB', subklasifikasi: 'MG' },
  { id: 'MG004', name: 'Penanggung Jawab Subklasifikasi (PJSKBBU)', level: 'PJSKBBU', subklasifikasi: 'MG' },
  { id: 'MG005', name: 'Manajer Keuangan', level: 'Manager', subklasifikasi: 'MG' },
  { id: 'MG006', name: 'Manajer Pengadaan (Procurement)', level: 'Manager', subklasifikasi: 'MG' },
  { id: 'MG007', name: 'Manajer Rantai Pasok Material', level: 'Manager', subklasifikasi: 'MG' },
  { id: 'MG008', name: 'Petugas K3 Konstruksi', level: 'K3', subklasifikasi: 'MG' },
  { id: 'MG009', name: 'Ahli K3 Konstruksi', level: 'Ahli', subklasifikasi: 'MG' },
  { id: 'PN001', name: 'Pejabat Pengadaan', level: 'Ahli', subklasifikasi: 'PN' },
  { id: 'PN002', name: 'Pokja Pemilihan', level: 'Ahli', subklasifikasi: 'PN' },
  { id: 'PN003', name: 'Penyusun Dokumen Tender', level: 'Ahli', subklasifikasi: 'PN' },
  { id: 'MP001', name: 'Pelaksana Lapangan Pekerjaan Gedung', level: 'Pelaksana', subklasifikasi: 'MP' },
  { id: 'MP002', name: 'Pelaksana Lapangan Pekerjaan Jalan', level: 'Pelaksana', subklasifikasi: 'MP' },
  { id: 'MP003', name: 'Site Engineer / Ahli Teknik Pelaksana', level: 'Ahli', subklasifikasi: 'MP' },
  { id: 'MP004', name: 'Site Manager Pekerjaan Gedung', level: 'Manager', subklasifikasi: 'MP' },
  { id: 'MP005', name: 'Project Manager Konstruksi', level: 'Ahli Madya', subklasifikasi: 'MP' },
  { id: 'MP006', name: 'Quality Control Engineer', level: 'Teknisi', subklasifikasi: 'MP' },
  { id: 'MP007', name: 'Quantity Surveyor / Cost Estimator', level: 'Ahli', subklasifikasi: 'MP' },
  { id: 'MP008', name: 'Scheduling Engineer (Perencana Jadwal)', level: 'Ahli', subklasifikasi: 'MP' },
  { id: 'MP009', name: 'Inspector Pekerjaan Sipil', level: 'Teknisi', subklasifikasi: 'MP' },
  { id: 'MP010', name: 'Kepala Tukang Batu / Beton', level: 'Pelaksana', subklasifikasi: 'MP' },
];

interface DraftUnit {
  kode: string;
  nama: string;
  pernyataan: string;
  buktKompetensi: string[];
  statusMandiri: string;
  catatan: string;
}

interface DraftResult {
  namaAsesi: string;
  jabatan: string;
  tanggalDibuat: string;
  ringkasan: string;
  units: DraftUnit[];
  disclaimer: string;
}

const STEP_LABELS = ['Pilih Jabatan', 'Isi Pengalaman', 'Hasil FR.APL.02'];

export default function Apl02GeneratorPage() {
  const [form, setForm] = useState<Apl02Form>(EMPTY_APL02_FORM);
  const formRef = useRef(form);
  const [storageReady, setStorageReady] = useState(false);
  const [savedDraft, setSavedDraft] = useState<Apl02Form | null>(null);
  const [storageError, setStorageError] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const { step, selectedId, namaAsesi, pendidikan, pengalaman, units } = form;
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [loginRequired, setLoginRequired] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Step 3 data
  const [draft, setDraft] = useState<DraftResult | null>(null);

  const selectedPos = allPositions.find((p) => p.id === selectedId);

  useEffect(() => {
    if (loginRequired) {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      errorRef.current?.focus({ preventScroll: true });
    }
  }, [loginRequired]);

  useEffect(() => {
    // Read only on mount: never overwrite a saved draft before the user chooses.
    try {
      const raw = localStorage.getItem(APL02_DRAFT_KEY);
      if (raw) setSavedDraft(parseApl02Draft(raw, allPositions.map((p) => p.id)));
    } catch {
      setStorageError('Draft tidak dapat dibaca. Penyimpanan browser mungkin diblokir atau draft rusak. Hapus draft untuk mulai baru.');
    } finally {
      setStorageReady(true);
    }
  }, []);

  function updateForm(patch: Partial<Apl02Form>) {
    const next = { ...formRef.current, ...patch };
    formRef.current = next;
    setForm(next);
    // Write synchronously on each change, with no debounce or unload dependency.
    try {
      if (hasApl02Answers(next)) {
        localStorage.setItem(APL02_DRAFT_KEY, serializeApl02Draft(next));
        setDraftSaved(true);
      } else {
        localStorage.removeItem(APL02_DRAFT_KEY);
        setDraftSaved(false);
      }
      setStorageError('');
    } catch {
      setDraftSaved(false);
      setStorageError('Draft belum tersimpan. Penyimpanan browser penuh atau diblokir. Jangan tutup halaman sebelum menyalin jawaban Anda.');
    }
  }

  function resumeDraft() {
    if (!savedDraft) return;
    updateForm(savedDraft);
    setSavedDraft(null);
    setError('');
  }

  function getSessionHeaders(): HeadersInit {
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;
    return sessionId
      ? { 'Content-Type': 'application/json', 'x-session-id': sessionId }
      : { 'Content-Type': 'application/json' };
  }

  function showApiError(status: number, message: string) {
    const needsLogin = status === 401;
    setLoginRequired(needsLogin);
    setError(needsLogin
      ? 'Silakan masuk terlebih dahulu untuk menggunakan generator FR.APL.02. Setelah masuk, Anda akan kembali ke halaman ini. Isian yang tersimpan dapat dilanjutkan.'
      : message);
  }

  async function handleStep1Submit() {
    setLoginRequired(false);
    if (!selectedId) { setError('Pilih jabatan terlebih dahulu.'); return; }
    if (!namaAsesi.trim()) { setError('Nama lengkap harus diisi.'); return; }
    setError('');
    if (units.length) {
      updateForm({ step: 2 });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/apl02', {
        method: 'POST',
        headers: getSessionHeaders(),
        body: JSON.stringify({
          action: 'getUnits',
          jabatan: selectedPos?.name,
          level: selectedPos?.level,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showApiError(res.status, data.error || 'Terjadi kesalahan. Coba lagi.');
        return;
      }
      updateForm({
        units: (data.units ?? []).map((u: Omit<UnitKompetensi, 'pengalaman'>) => ({ ...u, pengalaman: '' })),
        step: 2,
      });
    } catch {
      setError('Koneksi gagal. Periksa jaringan Anda.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2Submit() {
    setLoginRequired(false);
    const empty = units.filter((u) => !u.pengalaman.trim());
    if (empty.length === units.length) {
      setError('Isi minimal satu unit kompetensi dengan pengalaman Anda.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/apl02', {
        method: 'POST',
        headers: getSessionHeaders(),
        body: JSON.stringify({
          action: 'generateDraft',
          jabatan: selectedPos?.name,
          level: selectedPos?.level,
          namaAsesi,
          pendidikan,
          pengalaman,
          units: units.map((u) => ({ kode: u.kode, nama: u.nama, pengalaman: u.pengalaman })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showApiError(res.status, data.error || 'Terjadi kesalahan. Coba lagi.');
        return;
      }
      setDraft(data);
      updateForm({ step: 3 });
    } catch {
      setError('Koneksi gagal. Periksa jaringan Anda.');
    } finally {
      setLoading(false);
    }
  }

  function updateUnitPengalaman(idx: number, val: string) {
    updateForm({ units: formRef.current.units.map((u, i) => (i === idx ? { ...u, pengalaman: val } : u)) });
  }

  function buildCopyText(): string {
    if (!draft) return '';
    const lines: string[] = [
      '═══════════════════════════════════════════════════',
      'FR.APL.02 — ASESMEN MANDIRI',
      '═══════════════════════════════════════════════════',
      `Nama Asesi      : ${draft.namaAsesi}`,
      `Jabatan         : ${draft.jabatan}`,
      `Tanggal         : ${draft.tanggalDibuat}`,
      '',
      'PROFIL SINGKAT:',
      draft.ringkasan,
      '',
      '───────────────────────────────────────────────────',
      'PERNYATAAN MANDIRI PER UNIT KOMPETENSI',
      '───────────────────────────────────────────────────',
    ];
    draft.units.forEach((u, i) => {
      lines.push('');
      lines.push(`${i + 1}. [${u.kode}] ${u.nama}`);
      lines.push(`   Status Mandiri  : ${u.statusMandiri}`);
      lines.push(`   Pernyataan      : ${u.pernyataan}`);
      lines.push('   Bukti Kompetensi:');
      u.buktKompetensi.forEach((b) => lines.push(`     • ${b}`));
      if (u.catatan) lines.push(`   Catatan         : ${u.catatan}`);
    });
    lines.push('');
    lines.push('───────────────────────────────────────────────────');
    lines.push('PERNYATAAN:');
    lines.push(draft.disclaimer);
    lines.push('');
    lines.push(`Tanda Tangan Asesi: ________________________`);
    lines.push(`Tanggal           : ${draft.tanggalDibuat}`);
    return lines.join('\n');
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildCopyText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadPdf() {
    if (!draft || downloading) return;
    setLoginRequired(false);
    setDownloading(true);
    setError('');
    try {
      const res = await fetch('/api/apl02', {
        method: 'POST',
        headers: getSessionHeaders(),
        body: JSON.stringify({
          action: 'exportPdf',
          draft,
          pendidikan,
          pengalaman,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showApiError(res.status, data.error || 'PDF gagal dibuat. Silakan coba lagi.');
        return;
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition') || '';
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);
      const filename = filenameMatch?.[1] || 'FR.APL.02-draft.pdf';
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setError('Koneksi gagal saat membuat PDF. Periksa jaringan Anda.');
    } finally {
      setDownloading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleReset() {
    if (!window.confirm('Hapus draft tersimpan dan semua jawaban di halaman ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      localStorage.removeItem(APL02_DRAFT_KEY);
    } catch {
      setStorageError('Draft tidak dapat dihapus dari browser. Jawaban tetap dipertahankan. Periksa izin penyimpanan lalu coba lagi.');
      return;
    }
    formRef.current = EMPTY_APL02_FORM;
    setForm(EMPTY_APL02_FORM);
    setSavedDraft(null);
    setDraftSaved(false);
    setStorageError('');
    setDraft(null);
    setError('');
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 print:bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8 print:hidden">
          <div className="text-4xl mb-3">📝</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Generator FR.APL.02</h1>
          <p className="text-slate-500 text-sm">
            Buat draft asesmen mandiri Anda dengan bantuan AI — siap cetak untuk LSP
          </p>
        </div>

        <div className="mb-6 print:hidden">
          {storageError && (
            <p role="alert" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {storageError}
            </p>
          )}
          {savedDraft ? (
            <section aria-label="Draft tersimpan" className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="font-semibold text-slate-800">Draft FR.APL.02 sebelumnya tersedia</p>
              <p className="mt-1 text-sm text-slate-600">Lanjutkan isian yang tersimpan di browser ini, atau hapus untuk mulai dari awal.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button onClick={resumeDraft} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                  Lanjutkan draft sebelumnya
                </button>
                <button onClick={handleReset} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Hapus draft dan mulai baru
                </button>
              </div>
            </section>
          ) : storageReady && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p role="status" className="text-slate-600">
                {draftSaved ? 'Draft tersimpan otomatis di browser ini.' : 'Isian akan disimpan otomatis di browser ini.'}
                {' '}Draft tidak tersinkron ke perangkat lain.
              </p>
              <button onClick={handleReset} disabled={loading || downloading} className="text-red-700 underline disabled:opacity-50">
                Hapus draft dan mulai baru
              </button>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8 print:hidden">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={n} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active ? 'bg-amber-500 text-white' :
                  done ? 'bg-green-500 text-white' :
                  'bg-slate-200 text-slate-500'
                }`}>
                  <span>{done ? '✓' : n}</span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`h-0.5 w-6 ${done ? 'bg-green-400' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div ref={errorRef} role="alert" tabIndex={-1} className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-2 items-start print:hidden">
            <span className="shrink-0">⚠️</span>
            <div className="min-w-0">
              <p>{error}</p>
              {loginRequired && (
                <Link
                  href="/login?redirect=/apl02-generator"
                  className="mt-2 inline-flex min-h-11 items-center rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                >
                  Masuk / Login
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 1 ── */}
        {storageReady && !savedDraft && step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Langkah 1 — Pilih Jabatan SKK</h2>
            <p className="text-sm text-slate-500 mb-6">
              Pilih jabatan yang akan Anda ajukan sertifikasinya, lalu lengkapi data diri Anda.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jabatan SKK <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => { updateForm({ selectedId: e.target.value, units: [] }); setDraft(null); setError(''); }}
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">— Pilih jabatan —</option>
                  {allPositions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      [{pos.id}] {pos.name} — {pos.level}
                    </option>
                  ))}
                </select>
                {selectedPos && (
                  <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                    ✓ Level: <strong>{selectedPos.level}</strong> · Subklasifikasi: <strong>{selectedPos.subklasifikasi}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaAsesi}
                  onChange={(e) => updateForm({ namaAsesi: e.target.value })}
                  placeholder="Sesuai KTP / ijazah"
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pendidikan Terakhir</label>
                <select
                  value={pendidikan}
                  onChange={(e) => updateForm({ pendidikan: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">— Pilih —</option>
                  <option>SMP / Sederajat</option>
                  <option>SMA / SMK / Sederajat</option>
                  <option>D3 / Diploma</option>
                  <option>S1 / Sarjana</option>
                  <option>S2 / Magister</option>
                  <option>S3 / Doktor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total Pengalaman Kerja di Bidang Ini
                </label>
                <input
                  type="text"
                  value={pengalaman}
                  onChange={(e) => updateForm({ pengalaman: e.target.value })}
                  placeholder="Contoh: 5 tahun sebagai pelaksana lapangan"
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                onClick={handleStep1Submit}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>AI sedang menyiapkan unit kompetensi…</span>
                  </>
                ) : (
                  <>Lanjut ke Pengisian Pengalaman →</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {storageReady && !savedDraft && step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-lg font-semibold text-slate-800">Langkah 2 — Isi Pengalaman per Unit Kompetensi</h2>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
                {selectedPos?.name}
              </span>
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                {selectedPos?.level}
              </span>
            </div>

            <p className="text-sm text-slate-500 mb-5">
              Untuk setiap unit kompetensi di bawah, ceritakan pengalaman kerja, proyek, atau pelatihan yang membuktikan kompetensi Anda.
              Tulis dengan jelas — semakin detail, semakin baik draftnya.
            </p>

            <div className="space-y-6">
              {units.map((unit, idx) => (
                <div key={unit.kode} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex gap-2 items-start mb-3">
                    <span className="shrink-0 text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded mt-0.5">
                      {unit.kode}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{unit.nama}</p>
                      {unit.elemen?.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {unit.elemen.map((el, ei) => (
                            <li key={ei} className="text-xs text-slate-500 flex gap-1.5">
                              <span className="text-amber-400 shrink-0">•</span>
                              {el}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Bukti pengalaman Anda <span className="text-slate-400">(opsional tapi disarankan)</span>
                  </label>
                  <textarea
                    value={unit.pengalaman}
                    onChange={(e) => updateUnitPengalaman(idx, e.target.value)}
                    rows={3}
                    placeholder="Contoh: Saya pernah mengerjakan proyek jalan nasional sepanjang 12 km di Kaltim tahun 2021, bertanggung jawab atas survey lokasi, gambar kerja, dan koordinasi kontraktor..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { updateForm({ step: 1 }); setError(''); }}
                className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
              >
                ← Kembali
              </button>
              <button
                onClick={handleStep2Submit}
                disabled={loading}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>AI sedang membuat FR.APL.02…</span>
                  </>
                ) : (
                  <>✨ Buat FR.APL.02 Saya</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && draft && (
          <div>
            {/* Action bar */}
            <div className="flex flex-wrap gap-3 mb-5 print:hidden">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                {copied ? '✅ Tersalin!' : '📋 Salin Teks'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                🖨️ Cetak / Simpan PDF
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 disabled:bg-amber-300 transition-colors"
              >
                {downloading ? '⏳ Menyiapkan PDF…' : '⬇️ Unduh PDF'}
              </button>
              <button
                onClick={() => { updateForm({ step: 2 }); setError(''); }}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
              >
                ← Edit Pengalaman
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
              >
                🔄 Mulai Baru
              </button>
            </div>

            {/* Disclaimer */}
            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm print:hidden">
              <p className="font-semibold mb-1">⚠️ Perhatian sebelum menyerahkan ke LSP</p>
              <p>
                Draft ini dibuat oleh AI sebagai panduan awal. Anda <strong>wajib memeriksa</strong> kembali
                setiap pernyataan, memastikan bukti yang disebutkan benar-benar Anda miliki, dan
                berkonsultasi dengan asesor / panitia LSP sebelum menyerahkan formulir final.
              </p>
            </div>

            {/* FR.APL.02 Document */}
            <div className="bg-white border-2 border-slate-300 rounded-2xl overflow-hidden print:border-black print:rounded-none">
              {/* Document header */}
              <div className="bg-slate-800 text-white p-5 print:bg-white print:text-black print:border-b-2 print:border-black">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 print:text-slate-600 mb-1">
                      Formulir Asesmen Mandiri
                    </p>
                    <h2 className="text-xl font-bold">FR.APL.02</h2>
                    <p className="text-sm text-slate-300 print:text-slate-600">
                      Asesmen Mandiri Calon Tenaga Ahli SKK
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-400 print:text-slate-600">
                    <p>Tanggal: {draft.tanggalDibuat}</p>
                    <p className="mt-0.5">Ref: BNSP / LSP Konstruksi</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Identity */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">
                    A. Identitas Asesi
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Nama Lengkap</p>
                      <p className="font-semibold text-slate-800">{draft.namaAsesi}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Jabatan Diajukan</p>
                      <p className="font-semibold text-slate-800">{draft.jabatan}</p>
                    </div>
                    {pendidikan && (
                      <div>
                        <p className="text-slate-500 text-xs">Pendidikan Terakhir</p>
                        <p className="font-semibold text-slate-800">{pendidikan}</p>
                      </div>
                    )}
                    {pengalaman && (
                      <div>
                        <p className="text-slate-500 text-xs">Pengalaman Kerja</p>
                        <p className="font-semibold text-slate-800">{pengalaman}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Profile summary */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">
                    B. Profil Kompetensi Singkat
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{draft.ringkasan}</p>
                </section>

                {/* Units */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-4">
                    C. Pernyataan Mandiri per Unit Kompetensi
                  </h3>
                  <div className="space-y-5">
                    {draft.units.map((u, i) => (
                      <div key={u.kode} className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-200">
                          <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {u.kode}
                          </span>
                          <span className="font-medium text-slate-800 text-sm flex-1">{u.nama}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            u.statusMandiri?.toLowerCase().includes('kompeten') && !u.statusMandiri?.toLowerCase().includes('belum')
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {u.statusMandiri || 'Kompeten'}
                          </span>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-medium mb-1">Pernyataan Mandiri</p>
                            <p className="text-slate-700 leading-relaxed">{u.pernyataan}</p>
                          </div>
                          {u.buktKompetensi?.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase font-medium mb-1">Bukti Kompetensi</p>
                              <ul className="space-y-1">
                                {u.buktKompetensi.map((b, bi) => (
                                  <li key={bi} className="flex items-start gap-2 text-slate-700">
                                    <span className="text-amber-500 shrink-0 mt-0.5">□</span>
                                    {b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {u.catatan && (
                            <div className="pt-2 border-t border-slate-100">
                              <p className="text-xs text-slate-500 uppercase font-medium mb-1">Catatan untuk Asesor</p>
                              <p className="text-slate-600 italic text-xs">{u.catatan}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Signature */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">
                    D. Pernyataan &amp; Tanda Tangan
                  </h3>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    {draft.disclaimer}
                  </p>
                  <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                      <p className="text-slate-500 mb-10">Tanda tangan Asesi:</p>
                      <div className="border-b border-slate-400 mb-1" />
                      <p className="text-slate-700 font-medium">{draft.namaAsesi}</p>
                      <p className="text-xs text-slate-500">Asesi</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-10">Tanda tangan Asesor:</p>
                      <div className="border-b border-slate-400 mb-1" />
                      <p className="text-slate-700 font-medium">___________________________</p>
                      <p className="text-xs text-slate-500">Asesor BNSP yang ditunjuk LSP</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">Tanggal: {draft.tanggalDibuat}</p>
                </section>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex flex-wrap gap-3 mt-5 print:hidden">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                {copied ? '✅ Tersalin!' : '📋 Salin Teks'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                🖨️ Cetak / Simpan PDF
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 disabled:bg-amber-300 transition-colors"
              >
                {downloading ? '⏳ Menyiapkan PDF…' : '⬇️ Unduh PDF'}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
              >
                🔄 Buat untuk Jabatan Lain
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
