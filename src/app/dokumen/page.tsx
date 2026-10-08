'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';

// ──────────────────────────────────────────────────────────────
// Data: jabatan & document requirements
// ──────────────────────────────────────────────────────────────

interface DocItem {
  id: string;
  name: string;
  description: string;
  category: 'identitas' | 'formulir' | 'pendidikan' | 'pengalaman' | 'portofolio' | 'sertifikasi';
  templateUrl?: string;
  note?: string;
}

interface Jabatan {
  id: string;
  name: string;
  bidang: string;
  kualifikasi: string;
  skema?: string;
  docs: DocItem[];
}

const COMMON_DOCS: DocItem[] = [
  {
    id: 'ktp',
    name: 'KTP / Kartu Identitas',
    description: 'Fotokopi KTP yang masih berlaku (scan/foto jelas).',
    category: 'identitas',
  },
  {
    id: 'foto',
    name: 'Pas Foto 3×4',
    description: 'Foto formal terbaru latar merah/biru (2 lembar atau file digital).',
    category: 'identitas',
  },
  {
    id: 'ijazah',
    name: 'Ijazah Pendidikan Terakhir',
    description: 'Fotokopi ijazah yang dilegalisir sesuai jenjang pendidikan.',
    category: 'pendidikan',
  },
  {
    id: 'fraplo1',
    name: 'FR.APL.01 — Permohonan Sertifikasi',
    description:
      'Formulir permohonan sertifikasi kompetensi yang diisi lengkap dan ditandatangani.',
    category: 'formulir',
    templateUrl: 'https://bnsp.go.id/unduhan',
    note: 'Unduh dari LSP/BNSP atau minta ke TUK tempat Anda mendaftar.',
  },
  {
    id: 'fraplo2',
    name: 'FR.APL.02 — Asesmen Mandiri',
    description:
      'Formulir self-assessment per unit kompetensi: nyatakan bukti dan tingkat penguasaan Anda.',
    category: 'formulir',
    templateUrl: 'https://bnsp.go.id/unduhan',
    note: 'Isi jujur; asesor menggunakannya sebagai dasar wawancara.',
  },
  {
    id: 'cv',
    name: 'CV / Daftar Riwayat Hidup',
    description:
      'Riwayat pekerjaan lengkap: nama proyek, posisi, nilai kontrak, tahun pelaksanaan.',
    category: 'pengalaman',
  },
  {
    id: 'surat_kerja',
    name: 'Surat Keterangan Pengalaman Kerja',
    description:
      'Surat dari perusahaan/pemberi kerja yang menerangkan jabatan dan masa kerja.',
    category: 'pengalaman',
  },
];

const PORTOFOLIO_DOC: DocItem = {
  id: 'portofolio',
  name: 'Portofolio Proyek',
  description:
    'Dokumentasi proyek relevan: gambar kerja, foto, laporan, atau as-built yang menunjukkan keterlibatan langsung Anda.',
  category: 'portofolio',
};

const SKK_LAMA_DOC: DocItem = {
  id: 'skk_lama',
  name: 'SKK / SKA / SKTK Lama (jika perpanjangan)',
  description:
    'Fotokopi sertifikat kompetensi sebelumnya bila ini adalah perpanjangan/re-sertifikasi.',
  category: 'sertifikasi',
};

const JOB_DESK_DOC: DocItem = {
  id: 'jobdesk',
  name: 'Uraian Tugas / Job Description',
  description: 'Dokumen resmi dari perusahaan yang merinci tugas dan tanggung jawab Anda di jabatan yang bersangkutan.',
  category: 'pengalaman',
};

// Jabatan-specific extra docs
const SIPIL_EXTRA: DocItem[] = [
  {
    id: 'gambar_kerja',
    name: 'Gambar Kerja / Shop Drawing',
    description: 'Contoh gambar kerja proyek yang pernah Anda buat atau supervisi (sebagian).',
    category: 'portofolio',
  },
  {
    id: 'laporan_harian',
    name: 'Laporan Harian / Mingguan Proyek',
    description: 'Contoh laporan kemajuan pekerjaan (daily/weekly report) yang Anda susun.',
    category: 'portofolio',
  },
];

const MANPEL_EXTRA: DocItem[] = [
  {
    id: 'rencana_mutu',
    name: 'Rencana Mutu Kontrak (RMK)',
    description: 'Dokumen RMK proyek yang pernah Anda susun atau terlibat dalam penyusunannya.',
    category: 'portofolio',
  },
  {
    id: 'schedule',
    name: 'Jadwal Pelaksanaan / S-Curve',
    description: 'Master schedule atau S-Curve proyek yang Anda kelola.',
    category: 'portofolio',
  },
  {
    id: 'bop',
    name: 'Dokumen Biaya / RAB / BOP',
    description:
      'Rencana Anggaran Biaya atau Bill of Quantity proyek sebagai bukti kompetensi estimasi.',
    category: 'portofolio',
  },
];

const JABATAN_LIST: Jabatan[] = [
  // ── Sipil ──────────────────────────────────────────────────────
  {
    id: 'pelaks-gedung',
    name: 'Pelaksana Lapangan Pekerjaan Gedung',
    bidang: 'Sipil',
    kualifikasi: 'Jenjang perlu dikonfirmasi sesuai skema LSP',
    skema: 'SKK Konstruksi – Sipil',
    docs: [
      ...COMMON_DOCS,
      PORTOFOLIO_DOC,
      ...SIPIL_EXTRA,
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
  {
    id: 'pelaks-jalan',
    name: 'Pelaksana Lapangan Pekerjaan Jalan',
    bidang: 'Sipil',
    kualifikasi: 'Jenjang perlu dikonfirmasi sesuai skema LSP',
    skema: 'SKK Konstruksi – Sipil',
    docs: [
      ...COMMON_DOCS,
      PORTOFOLIO_DOC,
      ...SIPIL_EXTRA,
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
  {
    id: 'pelaks-jembatan',
    name: 'Pelaksana Lapangan Pekerjaan Jembatan',
    bidang: 'Sipil',
    kualifikasi: 'Jenjang perlu dikonfirmasi sesuai skema LSP',
    skema: 'SKK Konstruksi – Sipil',
    docs: [
      ...COMMON_DOCS,
      PORTOFOLIO_DOC,
      ...SIPIL_EXTRA,
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
  {
    id: 'surveyor',
    name: 'Teknisi Survey Pemetaan',
    bidang: 'Sipil',
    kualifikasi: 'Analis / Teknisi Madya (L4)',
    skema: 'SKK Konstruksi – Sipil',
    docs: [
      ...COMMON_DOCS,
      {
        id: 'laporan_survey',
        name: 'Laporan Hasil Survey / Peta Topografi',
        description: 'Contoh laporan survey lapangan atau peta yang pernah Anda buat.',
        category: 'portofolio',
      },
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
  {
    id: 'drafter',
    name: 'Drafter / Juru Gambar Sipil',
    bidang: 'Sipil',
    kualifikasi: 'Operator / Teknisi (L1–L3)',
    skema: 'SKK Konstruksi – Sipil',
    docs: [
      ...COMMON_DOCS,
      {
        id: 'contoh_gambar',
        name: 'Contoh Hasil Gambar Teknik',
        description: 'File CAD / PDF gambar teknik yang pernah Anda buat sebagai portofolio.',
        category: 'portofolio',
      },
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
  {
    id: 'ahli-sipil-madya',
    name: 'Ahli Teknik Jalan – Madya',
    bidang: 'Sipil',
    kualifikasi: 'Ahli Madya (L8)',
    skema: 'SKK Konstruksi – Sipil',
    docs: [
      ...COMMON_DOCS,
      PORTOFOLIO_DOC,
      ...SIPIL_EXTRA,
      {
        id: 'desain_perkerasan',
        name: 'Dokumen Desain Perkerasan / Analisis Teknis',
        description: 'Laporan atau perhitungan teknis desain jalan yang pernah Anda susun.',
        category: 'portofolio',
      },
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
  // ── Manajemen Pelaksanaan ───────────────────────────────────────
  {
    id: 'manajer-proyek',
    name: 'Manajer Proyek',
    bidang: 'Manajemen Pelaksanaan',
    kualifikasi: 'Ahli Madya (L8)',
    skema: 'SKK Konstruksi – Manajemen Pelaksanaan',
    docs: [
      ...COMMON_DOCS,
      PORTOFOLIO_DOC,
      ...MANPEL_EXTRA,
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
  {
    id: 'manajer-lapangan',
    name: 'Manajer Lapangan Pekerjaan Gedung',
    bidang: 'Manajemen Pelaksanaan',
    kualifikasi: 'Jenjang perlu dikonfirmasi sesuai skema LSP',
    skema: 'SKK Konstruksi – Manajemen Pelaksanaan',
    docs: [
      ...COMMON_DOCS,
      PORTOFOLIO_DOC,
      ...MANPEL_EXTRA,
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
  {
    id: 'site-engineer',
    name: 'Site Engineer',
    bidang: 'Manajemen Pelaksanaan',
    kualifikasi: 'Ahli Pertama (L4)',
    skema: 'SKK Konstruksi – Manajemen Pelaksanaan',
    docs: [
      ...COMMON_DOCS,
      PORTOFOLIO_DOC,
      ...SIPIL_EXTRA,
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
  {
    id: 'qs',
    name: 'Quantity Surveyor',
    bidang: 'Manajemen Pelaksanaan',
    kualifikasi: 'Jenjang perlu dikonfirmasi sesuai skema LSP',
    skema: 'SKK Konstruksi – Manajemen Pelaksanaan',
    docs: [
      ...COMMON_DOCS,
      {
        id: 'bq',
        name: 'Bill of Quantity (BQ) / RAB',
        description:
          'Contoh BQ atau RAB proyek yang pernah Anda hitung / verifikasi.',
        category: 'portofolio',
      },
      {
        id: 'progres_bayar',
        name: 'Dokumen Kemajuan Pembayaran / Monthly Certificate',
        description: 'Laporan monthly certificate atau progress billing yang pernah Anda kelola.',
        category: 'portofolio',
      },
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
  {
    id: 'qc',
    name: 'Quality Control (QC) Konstruksi',
    bidang: 'Manajemen Pelaksanaan',
    kualifikasi: 'Jenjang perlu dikonfirmasi sesuai skema LSP',
    skema: 'SKK Konstruksi – Manajemen Pelaksanaan',
    docs: [
      ...COMMON_DOCS,
      {
        id: 'rmk_qc',
        name: 'Rencana Mutu Kontrak (RMK)',
        description: 'Dokumen RMK / Quality Plan proyek yang Anda susun.',
        category: 'portofolio',
      },
      {
        id: 'checklist_qc',
        name: 'Checklist Inspeksi / Pengujian Material',
        description: 'Contoh checklist inspeksi atau laporan hasil uji material (test report).',
        category: 'portofolio',
      },
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
  {
    id: 'k3',
    name: 'Ahli K3 Konstruksi',
    bidang: 'Manajemen Pelaksanaan',
    kualifikasi: 'Ahli Muda (L7)',
    skema: 'SKK Konstruksi – Manajemen Pelaksanaan',
    docs: [
      ...COMMON_DOCS,
      {
        id: 'rk3k',
        name: 'Rencana K3 Kontrak (RK3K)',
        description: 'Dokumen RK3K proyek yang pernah Anda susun atau implementasikan.',
        category: 'portofolio',
      },
      {
        id: 'laporan_k3',
        name: 'Laporan Kecelakaan / Near Miss / Safety Patrol',
        description: 'Laporan inspeksi K3 atau investigasi insiden yang pernah Anda buat.',
        category: 'portofolio',
      },
      {
        id: 'sertifikat_k3',
        name: 'Sertifikat K3 Umum / AK3',
        description: 'Fotokopi sertifikat K3 Umum Kemenaker atau sertifikat Ahli K3 yang relevan.',
        category: 'sertifikasi',
      },
      JOB_DESK_DOC,
      SKK_LAMA_DOC,
    ],
  },
];

// Explicit mapping from saved profile values → JABATAN_LIST checklist IDs.
// Only includes roles with an explicit correspondence. Values not listed
// here produce no pre-selection (empty state / user picks manually).
const PROFILE_TO_CHECKLIST_MAP: Record<string, string> = {
  // ── Manajemen Pelaksanaan ──────────────────────────────────────
  MP001: 'pelaks-gedung',    // Pelaksana Lapangan Pekerjaan Gedung
  MP002: 'pelaks-jalan',     // Pelaksana Lapangan Pekerjaan Jalan
  MP003: 'site-engineer',    // Site Engineer / Ahli Teknik Pelaksana
  MP004: 'manajer-lapangan', // Site Manager Pekerjaan Gedung
  MP005: 'manajer-proyek',   // Project Manager Konstruksi
  MP006: 'qc',               // Quality Control Engineer
  MP007: 'qs',               // Quantity Surveyor / Cost Estimator
  // ── Jalan (Sipil) ─────────────────────────────────────────────
  F001:  'ahli-sipil-madya', // Ahli Madya Teknik Jalan → Ahli Teknik Jalan – Madya
  // These checklist roles have no exact ID in SKK_JABATAN. Preserve their
  // explicit names rather than assigning an unrelated certification role.
  'Pelaksana Lapangan Pekerjaan Jembatan': 'pelaks-jembatan',
  'Teknisi Survey Pemetaan': 'surveyor',
  'Drafter / Juru Gambar Sipil': 'drafter',
  'Ahli K3 Konstruksi': 'k3',
};

const CHECKLIST_TO_PROFILE_MAP = Object.fromEntries(
  Object.entries(PROFILE_TO_CHECKLIST_MAP).map(([profileId, checklistId]) => [checklistId, profileId]),
);

// Group jabatan by bidang
const BIDANG_LIST = ['Sipil', 'Manajemen Pelaksanaan'];

// Category labels & colors
const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  identitas:   { label: 'Identitas',   color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30' },
  formulir:    { label: 'Formulir',    color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/30' },
  pendidikan:  { label: 'Pendidikan',  color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  pengalaman:  { label: 'Pengalaman',  color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30' },
  portofolio:  { label: 'Portofolio',  color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/30' },
  sertifikasi: { label: 'Sertifikasi', color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/30' },
};

// ──────────────────────────────────────────────────────────────
// Auth helpers — read sessionId from localStorage; generate a
// per-device guest ID so guest checklists are never shared.
// ──────────────────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const headers: Record<string, string> = {};

  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  } else {
    // Generate a stable per-device guest ID so every device gets its own
    // isolated checklist instead of sharing a single "guest" bucket.
    let deviceId = localStorage.getItem('siapskk-device-id');
    if (!deviceId) {
      deviceId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('siapskk-device-id', deviceId);
    }
    headers['x-device-id'] = deviceId;
  }

  return headers;
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export default function DokumenPage() {
  const { user, isLoading: authLoading, updateProfile } = useAuth();
  const [activeBidang, setActiveBidang] = useState<string>('Sipil');
  const [activeJabatan, setActiveJabatan] = useState<Jabatan | null>(null);
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [naMap, setNaMap] = useState<Record<string, boolean>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const categorySavePending = useRef(false);
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedJabatan, setSavedJabatan] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [savingDefault, setSavingDefault] = useState(false);
  const [defaultError, setDefaultError] = useState<string | null>(null);
  const [defaultToast, setDefaultToast] = useState<string | null>(null);
  const manualSelection = useRef(false);
  const defaultSavePending = useRef(false);

  const jabatanInBidang = JABATAN_LIST.filter((j) => j.bidang === activeBidang);
  const selectedProfileJabatan = activeJabatan ? CHECKLIST_TO_PROFILE_MAP[activeJabatan.id] : null;
  const canSaveDefault = !!user && !authLoading && profileLoaded && manualSelection.current
    && !!selectedProfileJabatan && selectedProfileJabatan !== savedJabatan;

  useEffect(() => {
    if (!defaultToast) return;
    const timer = window.setTimeout(() => setDefaultToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [defaultToast]);

  const saveDefaultJabatan = async () => {
    if (!canSaveDefault || !activeJabatan || defaultSavePending.current) return;
    const jabatanSkk = selectedProfileJabatan!;
    const name = activeJabatan.name;
    defaultSavePending.current = true;
    setSavingDefault(true);
    setDefaultError(null);
    setDefaultToast(null);
    try {
      const success = await updateProfile({ jabatanSkk });
      if (!success) throw new Error('Profile update failed');
      setSavedJabatan(jabatanSkk);
      setDefaultToast(`${name} berhasil disimpan sebagai jabatan default Anda.`);
    } catch {
      setDefaultError('Jabatan default belum tersimpan. Silakan coba lagi.');
    } finally {
      defaultSavePending.current = false;
      setSavingDefault(false);
    }
  };

  // On mount: pre-select jabatan from the authenticated user's profile
  useEffect(() => {
    async function preSelectFromProfile() {
      try {
        const res = await fetch('/api/auth?action=me', {
          headers: getAuthHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();
        const jabatanSkk: string | null | undefined = data?.jabatanSkk ?? data?.user?.jabatanSkk;
        setSavedJabatan(jabatanSkk?.trim() || null);
        setProfileLoaded(true);
        if (!jabatanSkk) return;

        // Look up the checklist entry via the explicit profile → checklist map.
        // Unrecognised values produce no pre-selection (empty state).
        const checklistId = PROFILE_TO_CHECKLIST_MAP[jabatanSkk.trim()];
        if (!checklistId) return;

        const match = JABATAN_LIST.find((j) => j.id === checklistId);
        if (match && !manualSelection.current) {
          setActiveBidang(match.bidang);
          setActiveJabatan(match);
        }
      } catch {
        // Network error or unauthenticated — silently fall through to empty state
      }
    }
    preSelectFromProfile();
  }, []);

  // Load saved state when jabatan changes
  const loadChecklist = useCallback(async (jabatan: Jabatan) => {
    setLoading(true);
    setSaveError(null);
    try {
      const res = await fetch(
        `/api/dokumen?jabatan=${encodeURIComponent(jabatan.id)}`,
        { headers: getAuthHeaders() },
      );
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, boolean> = {};
        const naData: Record<string, boolean> = {};
        const noteData: Record<string, string> = {};
        (data.items as { documentId: string; checked: boolean; na: boolean; note?: string | null }[]).forEach((item) => {
          map[item.documentId] = item.checked;
          if (item.na) naData[item.documentId] = true;
          if (item.note) noteData[item.documentId] = item.note;
        });
        setCheckedMap(map);
        setNaMap(naData);
        setNoteMap(noteData);
      }
      // Non-OK (e.g. 401 on first-ever load before device ID exists) → start with empty map
    } catch {
      // network error → start with empty map
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeJabatan) {
      loadChecklist(activeJabatan);
    }
  }, [activeJabatan, loadChecklist]);

  const toggleDoc = async (docId: string, currentVal: boolean) => {
    if (!activeJabatan || categorySavePending.current) return;
    const newVal = !currentVal;
    // Optimistic update
    setCheckedMap((prev) => ({ ...prev, [docId]: newVal }));
    setSaving(docId);
    setSaveError(null);
    try {
      const res = await fetch('/api/dokumen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          jabatanId: activeJabatan.id,
          documentId: docId,
          checked: newVal,
        }),
      });
      if (!res.ok) {
        // Rollback on server error
        setCheckedMap((prev) => ({ ...prev, [docId]: currentVal }));
        setSaveError('Gagal menyimpan. Silakan coba lagi.');
      }
    } catch {
      // Rollback on network error
      setCheckedMap((prev) => ({ ...prev, [docId]: currentVal }));
      setSaveError('Koneksi gagal. Perubahan tidak tersimpan.');
    } finally {
      setSaving(null);
    }
  };

  const toggleNA = async (docId: string, currentNA: boolean) => {
    if (!activeJabatan || categorySavePending.current) return;
    const newNA = !currentNA;
    // Capture prior checked value before optimistic update so we can restore it on failure
    const priorChecked = !!checkedMap[docId];
    // Optimistic update: marking N/A also clears checked state locally
    setNaMap((prev) => ({ ...prev, [docId]: newNA }));
    if (newNA) setCheckedMap((prev) => ({ ...prev, [docId]: false }));
    setSaving(docId);
    setSaveError(null);
    try {
      const res = await fetch('/api/dokumen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          jabatanId: activeJabatan.id,
          documentId: docId,
          na: newNA,
        }),
      });
      if (!res.ok) {
        setNaMap((prev) => ({ ...prev, [docId]: currentNA }));
        if (newNA) setCheckedMap((prev) => ({ ...prev, [docId]: priorChecked }));
        setSaveError('Gagal menyimpan. Silakan coba lagi.');
      }
    } catch {
      setNaMap((prev) => ({ ...prev, [docId]: currentNA }));
      if (newNA) setCheckedMap((prev) => ({ ...prev, [docId]: priorChecked }));
      setSaveError('Koneksi gagal. Perubahan tidak tersimpan.');
    } finally {
      setSaving(null);
    }
  };

  const toggleCategoryNA = async (category: string, docs: DocItem[]) => {
    if (!activeJabatan || saving || savingNote || categorySavePending.current) return;
    const jabatanId = activeJabatan.id;
    const newNA = !docs.every((doc) => naMap[doc.id]);
    const previousChecked = { ...checkedMap };
    const previousNA = { ...naMap };
    categorySavePending.current = true;
    setSavingCategory(category);
    setSaveError(null);
    setCheckedMap((prev) => ({
      ...prev, ...Object.fromEntries(docs.map((doc) => [doc.id, false])),
    }));
    setNaMap((prev) => ({
      ...prev, ...Object.fromEntries(docs.map((doc) => [doc.id, newNA])),
    }));
    try {
      const results = await Promise.allSettled(docs.map(async (doc) => {
        const response = await fetch('/api/dokumen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ jabatanId, documentId: doc.id, checked: false, na: newNA }),
        });
        if (!response.ok || !(await response.json()).success) {
          throw new Error('Checklist save failed');
        }
      }));
      const failedDocs = docs.filter((_, index) => results[index].status === 'rejected');
      if (failedDocs.length) {
        // Keep successful writes visible; restore only documents that failed.
        setCheckedMap((prev) => ({
          ...prev, ...Object.fromEntries(failedDocs.map((doc) => [doc.id, !!previousChecked[doc.id]])),
        }));
        setNaMap((prev) => ({
          ...prev, ...Object.fromEntries(failedDocs.map((doc) => [doc.id, !!previousNA[doc.id]])),
        }));
        setSaveError(`Gagal menyimpan ${failedDocs.length} dokumen dalam kategori. Silakan coba lagi.`);
      }
    } finally {
      categorySavePending.current = false;
      setSavingCategory(null);
    }
  };

  const saveNote = async (docId: string, value: string) => {
    if (!activeJabatan) return;
    const trimmed = value.trim();
    // Optimistic update already applied via noteMap state; just persist
    setSavingNote(docId);
    try {
      await fetch('/api/dokumen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          jabatanId: activeJabatan.id,
          documentId: docId,
          note: trimmed || null,
        }),
      });
    } catch {
      // Silently ignore network errors for note saves; the field still shows what the user typed
    } finally {
      setSavingNote(null);
    }
  };

  const applicableDocs = activeJabatan
    ? activeJabatan.docs.filter((d) => !naMap[d.id])
    : [];
  const checkedCount = applicableDocs.filter((d) => checkedMap[d.id]).length;
  const totalCount = applicableDocs.length;
  const progressPct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Group docs by category
  const docsByCategory = activeJabatan
    ? activeJabatan.docs.reduce<Record<string, DocItem[]>>((acc, doc) => {
        if (!acc[doc.category]) acc[doc.category] = [];
        acc[doc.category].push(doc);
        return acc;
      }, {})
    : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      {defaultToast && (
        <div role="status" className="fixed bottom-6 right-4 left-4 sm:left-auto z-50 max-w-lg rounded-xl border border-green-500/40 bg-slate-900 px-5 py-4 text-sm text-green-300 shadow-lg">
          {defaultToast}
        </div>
      )}
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-4">
            📄 Persiapan Dokumen SKK · KM PUPR 713/2022 · SK DJBK 114/2024
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Checklist Dokumen
            <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Persiapan Sertifikasi SKK
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Pilih jabatan SKK Anda untuk melihat daftar dokumen yang harus disiapkan.
            Status centang tersimpan otomatis.
          </p>
        </div>

        {/* Bidang tabs */}
        <div className="flex gap-3 mb-6 justify-center flex-wrap">
          {BIDANG_LIST.map((b) => (
            <button
              key={b}
              onClick={() => {
                manualSelection.current = true;
                setDefaultError(null);
                setActiveBidang(b);
                setActiveJabatan(null);
                setCheckedMap({});
              }}
              disabled={savingCategory !== null}
              className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                activeBidang === b
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
              }`}
            >
              {b === 'Sipil' ? '🏗️' : '📋'} {b}
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: jabatan list */}
          <div className="lg:col-span-1">
            <h2 className="text-slate-400 text-xs uppercase font-semibold mb-3 tracking-wider">
              Pilih Jabatan
            </h2>
            <div className="space-y-2">
              {jabatanInBidang.map((j) => {
                const isActive = activeJabatan?.id === j.id;
                return (
                  <button
                    key={j.id}
                    disabled={savingCategory !== null}
                    onClick={() => {
                      manualSelection.current = true;
                      setDefaultError(null);
                      if (activeJabatan?.id !== j.id) {
                        setActiveJabatan(j);
                        setCheckedMap({});
                      }
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/60 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    <div className="font-medium text-sm leading-snug">{j.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{j.kualifikasi}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: checklist */}
          <div className="lg:col-span-2">
            {!activeJabatan ? (
              <div className="h-72 flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-2xl text-slate-500">
                <span className="text-4xl mb-3">📂</span>
                <p className="text-sm">Pilih jabatan di sebelah kiri untuk memulai</p>
              </div>
            ) : loading ? (
              <div className="h-72 flex flex-col items-center justify-center rounded-2xl text-slate-500">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm">Memuat checklist...</p>
              </div>
            ) : (
              <div>
                {/* Jabatan header & progress */}
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 mb-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-white font-bold text-xl">{activeJabatan.name}</h2>
                      <p className="text-slate-400 text-sm mt-0.5">
                        {activeJabatan.bidang} · {activeJabatan.kualifikasi}
                      </p>
                      {activeJabatan.skema && (
                        <p className="text-slate-500 text-xs mt-0.5">{activeJabatan.skema}</p>
                      )}
                      {canSaveDefault && (
                        <button
                          type="button"
                          onClick={saveDefaultJabatan}
                          disabled={savingDefault}
                          className="mt-3 text-sm text-amber-300 underline underline-offset-4 hover:text-amber-200 disabled:opacity-50 disabled:cursor-wait"
                        >
                          {savingDefault ? 'Menyimpan jabatan...' : 'Jadikan jabatan default saya'}
                        </button>
                      )}
                      {defaultError && <p role="alert" className="mt-2 text-sm text-red-300">{defaultError}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-amber-400">{progressPct}%</span>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {checkedCount} / {totalCount} dokumen
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        progressPct === 100
                          ? 'bg-green-500'
                          : progressPct >= 60
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {progressPct === 100 && (
                    <div className="mt-3 flex items-center gap-2 text-green-400 text-sm font-medium">
                      <span>✅</span>
                      <span>Semua dokumen sudah disiapkan! Anda siap mendaftar asesmen.</span>
                    </div>
                  )}
                </div>

                {/* Reference banner */}
                <div className="mb-5 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-xs flex gap-2">
                  <span>ℹ️</span>
                  <span>
                    Berdasarkan <strong>KM PUPR No. 713/KPTS/M/2022</strong> dan{' '}
                    <strong>SK DJBK No. 114/KPTS/DK/2024</strong>. Persyaratan dokumen dapat
                    berbeda antar LSP/TUK — konfirmasi ke lembaga tempat Anda mendaftar.
                  </span>
                </div>

                {/* Documents grouped by category */}
                {Object.entries(docsByCategory).map(([cat, docs]) => {
                  const meta = CATEGORY_META[cat] ?? {
                    label: cat,
                    color: 'text-slate-400',
                    bg: 'bg-slate-700/40 border-slate-600',
                  };
                  const allNA = docs.every((doc) => !!naMap[doc.id]);
                  return (
                    <div key={cat} className="mb-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </div>
                        <button
                          type="button"
                          aria-label={`${allNA ? 'Batalkan N/A Semua' : 'N/A Semua'} — ${meta.label}`}
                          aria-pressed={allNA}
                          disabled={savingCategory !== null || saving !== null || savingNote !== null}
                          onClick={() => toggleCategoryNA(cat, docs)}
                          title={allNA ? 'Kembalikan semua dokumen kategori ke status belum dicentang' : 'Tandai semua dokumen kategori sebagai Tidak Berlaku (N/A)'}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-500 text-slate-200 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
                        >
                          {savingCategory === cat ? 'Menyimpan...' : allNA ? 'Batalkan N/A Semua' : 'N/A Semua'}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {docs.map((doc) => {
                          const isChecked = !!checkedMap[doc.id];
                          const isNA = !!naMap[doc.id];
                          const isSaving = saving === doc.id || savingCategory !== null;
                          return (
                            <div
                              key={doc.id}
                              onClick={() => !isSaving && !isNA && toggleDoc(doc.id, isChecked)}
                              className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                                isNA
                                  ? 'bg-slate-700/20 border-slate-600/30 cursor-default opacity-60'
                                  : isChecked
                                  ? 'bg-green-500/10 border-green-500/30 cursor-pointer'
                                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 cursor-pointer'
                              }`}
                            >
                              {/* Checkbox */}
                              <div className="mt-0.5 flex-shrink-0">
                                {isSaving ? (
                                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                      isNA
                                        ? 'border-slate-600 bg-slate-700/50'
                                        : isChecked
                                        ? 'bg-green-500 border-green-500'
                                        : 'border-slate-600'
                                    }`}
                                  >
                                    {isChecked && !isNA && (
                                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none">
                                        <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className={`font-semibold text-sm ${
                                  isNA
                                    ? 'text-slate-500 line-through'
                                    : isChecked
                                    ? 'text-green-300 line-through decoration-green-500/50'
                                    : 'text-white'
                                }`}>
                                  {doc.name}
                                </div>
                                <div className={`text-xs mt-1 leading-relaxed ${isNA ? 'text-slate-600' : 'text-slate-400'}`}>
                                  {doc.description}
                                </div>
                                {doc.note && !isNA && (
                                  <div className="text-amber-400/80 text-xs mt-1.5 italic">
                                    💡 {doc.note}
                                  </div>
                                )}
                                {doc.templateUrl && !isNA && (
                                  <a
                                    href={doc.templateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
                                  >
                                    ⬇️ Unduh Template
                                  </a>
                                )}

                                {/* User note / file location field */}
                                <div
                                  className="mt-2.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={noteMap[doc.id] ?? ''}
                                    onChange={(e) =>
                                      setNoteMap((prev) => ({ ...prev, [doc.id]: e.target.value }))
                                    }
                                    onBlur={(e) => saveNote(doc.id, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                    }}
                                    placeholder="📎 Lokasi file atau catatan (opsional)…"
                                    disabled={isNA || savingCategory !== null}
                                    className={`w-full text-xs rounded-lg px-2.5 py-1.5 border transition-colors outline-none ${
                                      isNA
                                        ? 'bg-slate-800/20 border-slate-700/30 text-slate-600 cursor-not-allowed'
                                        : 'bg-slate-900/60 border-slate-600/50 text-slate-200 placeholder-slate-600 hover:border-slate-500 focus:border-amber-500/60 focus:bg-slate-900'
                                    } ${savingNote === doc.id ? 'opacity-60' : ''}`}
                                  />
                                </div>
                              </div>

                              {/* N/A toggle button */}
                              <button
                                disabled={isSaving}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isSaving) toggleNA(doc.id, isNA);
                                }}
                                title={isNA ? 'Batalkan N/A — dokumen ini berlaku' : 'Tandai sebagai Tidak Berlaku (N/A)'}
                                className={`flex-shrink-0 self-center text-xs font-semibold px-2 py-1 rounded-md border transition-all ${
                                  isNA
                                    ? 'bg-slate-600 border-slate-500 text-slate-200 hover:bg-slate-500'
                                    : 'border-slate-600 text-slate-500 hover:border-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                                }`}
                              >
                                N/A
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Save error banner */}
                {saveError && (
                  <div role="alert" className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                    <span>⚠️</span>
                    <span>{saveError}</span>
                    <button
                      onClick={() => setSaveError(null)}
                      className="ml-auto text-red-400/60 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Reset all button */}
                <div className="mt-4 flex justify-end">
                  <button
                    disabled={savingCategory !== null}
                    onClick={async () => {
                      if (!activeJabatan) return;
                      const prevCheckedMap = { ...checkedMap };
                      const prevNaMap = { ...naMap };
                      setCheckedMap({});
                      setNaMap({});
                      setSaveError(null);
                      try {
                        // Single request per document resets both checked and na atomically,
                        // avoiding an insert race when two concurrent POSTs share the same row ID.
                        const results = await Promise.all(
                          activeJabatan.docs.map((d) =>
                            fetch('/api/dokumen', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                              body: JSON.stringify({
                                jabatanId: activeJabatan.id,
                                documentId: d.id,
                                checked: false,
                                na: false,
                              }),
                            }),
                          ),
                        );
                        const anyFailed = results.some((r) => !r.ok);
                        if (anyFailed) {
                          setCheckedMap(prevCheckedMap);
                          setNaMap(prevNaMap);
                          setSaveError('Gagal mereset sebagian dokumen. Silakan coba lagi.');
                        }
                      } catch {
                        setCheckedMap(prevCheckedMap);
                        setNaMap(prevNaMap);
                        setSaveError('Koneksi gagal saat mereset. Perubahan tidak tersimpan.');
                      }
                    }}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                  >
                    Reset Semua
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-10">
          Status centang tersimpan secara otomatis di server. Gunakan fitur ini bersama{' '}
          <a href="/skk-coach/chat?agent=dokumen" className="text-amber-500 hover:text-amber-400 underline underline-offset-2">SKK Coach AI</a>{' '}
          untuk panduan per dokumen.
        </p>
      </div>
    </div>
  );
}
