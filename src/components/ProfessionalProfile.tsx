'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getSavedJabatanTarget } from '@/lib/jabatanPreference';
import {
  EMPTY_PROFILE,
  PROFESSIONAL_PROFILE_KEY,
  jabatanName,
  parseProfessionalProfile,
  profileCompleteness,
  profileToolHref,
  type ProfessionalProfile as ProfessionalProfileData,
  type ProfileField,
} from '@/lib/professional-profile';

type SaveState = 'loading' | 'saved' | 'dirty' | 'saving' | 'error';

const fieldGroups: {
  title: string;
  eyebrow: string;
  description: string;
  fields: { key: ProfileField; label: string; placeholder: string; type?: string; hint?: string }[];
}[] = [
  {
    title: 'Profil Dasar',
    eyebrow: '01 / PROFESIONAL',
    description: 'Informasi yang membantu alat SIAP SKK memahami latar belakang Anda.',
    fields: [
      { key: 'nama', label: 'Nama lengkap', placeholder: 'Nama sesuai identitas' },
      { key: 'jabatan', label: 'Jabatan saat ini', placeholder: 'Contoh: Pelaksana Lapangan' },
      { key: 'pendidikan', label: 'Pendidikan terakhir', placeholder: 'Contoh: S1 Teknik Sipil' },
      { key: 'pengalaman', label: 'Pengalaman kerja', placeholder: 'Jumlah tahun, termasuk 0', type: 'number', hint: 'Masukkan 0 bila belum memiliki pengalaman kerja.' },
    ],
  },
  {
    title: 'SKK Saat Ini',
    eyebrow: '02 / SERTIFIKASI AKTIF',
    description: 'Catat sertifikat yang sudah dimiliki. Jabatan dari akun tidak otomatis dianggap sebagai SKK aktif.',
    fields: [
      { key: 'skkJabatan', label: 'Jabatan pada SKK', placeholder: 'Jabatan yang tercantum di sertifikat' },
      { key: 'lsp', label: 'Lembaga Sertifikasi Profesi', placeholder: 'Nama LSP penerbit' },
      { key: 'terbit', label: 'Tanggal terbit', placeholder: '', type: 'date' },
      { key: 'berakhir', label: 'Tanggal berakhir', placeholder: '', type: 'date' },
    ],
  },
  {
    title: 'Target SKK',
    eyebrow: '03 / LANGKAH BERIKUTNYA',
    description: 'Susun sasaran sertifikasi dan waktu yang ingin Anda capai.',
    fields: [
      { key: 'targetJabatan', label: 'Jabatan yang dituju', placeholder: 'Jabatan SKK yang ingin dicapai' },
      { key: 'jenjang', label: 'Jenjang KKNI', placeholder: 'Pilih jenjang' },
      { key: 'timeline', label: 'Target tanggal asesmen', placeholder: '', type: 'date' },
    ],
  },
];

const statusCopy: Record<SaveState, string> = {
  loading: 'Memuat profil tersimpan',
  saved: 'Perubahan tersimpan di perangkat ini',
  dirty: 'Ada perubahan yang belum disimpan',
  saving: 'Menyimpan profil…',
  error: 'Profil belum tersimpan',
};

function Field({
  field,
  value,
  onChange,
  disabled,
}: {
  field: (typeof fieldGroups)[number]['fields'][number];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const shared = 'w-full rounded-xl border border-[#35414a] bg-[#111a20] px-4 py-3 text-[15px] text-[#f4f0e7] outline-none transition placeholder:text-[#74818a] focus:border-[#d8a75b] focus:ring-2 focus:ring-[#d8a75b]/15';
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[13px] font-medium tracking-[.02em] text-[#d8dedc]">{field.label}</span>
      {field.key === 'jenjang' ? (
        <select
          disabled={disabled}
          data-testid={`select-${field.key}`}
          className={shared}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Pilih jenjang</option>
          {Array.from({ length: 9 }, (_, index) => String(index + 1)).map((level) => (
            <option key={level} value={level}>Jenjang {level}</option>
          ))}
        </select>
      ) : (
        <input
          disabled={disabled}
          data-testid={`input-${field.key}`}
          className={shared}
          type={field.type ?? 'text'}
          min={field.type === 'number' ? 0 : undefined}
          step={field.type === 'number' ? 1 : undefined}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.hint && <span className="mt-1.5 block text-xs leading-relaxed text-[#819099]">{field.hint}</span>}
    </label>
  );
}

export default function ProfessionalProfile() {
  const { user, isLoading: authLoading } = useAuth();
  return <ProfessionalProfileForm user={user} authLoading={authLoading} />;
}

export function ProfessionalProfileForm({ user, authLoading }: {
  user: { jabatanSkk?: string } | null;
  authLoading: boolean;
}) {
  const [profile, setProfile] = useState<ProfessionalProfileData>({ ...EMPTY_PROFILE });
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasStoredProfile, setHasStoredProfile] = useState(false);
  const [explicitRecovery, setExplicitRecovery] = useState(false);
  const [readBlocked, setReadBlocked] = useState(false);
  const initialized = useRef(false);

  const completeness = useMemo(() => profileCompleteness(profile), [profile]);

  const readProfile = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(PROFESSIONAL_PROFILE_KEY);
      if (raw !== null) {
        const parsed = parseProfessionalProfile(raw);
        setProfile(parsed);
        initialized.current = true;
        setHasStoredProfile(true);
        setExplicitRecovery(false);
        setReadBlocked(false);
        setSaveState('saved');
        setErrorMessage('');
      } else {
        setHasStoredProfile(false);
        setReadBlocked(false);
        setSaveState('loading');
        setErrorMessage('');
      }
      setHydrated(true);
    } catch {
      setHydrated(true);
      setReadBlocked(true);
      setSaveState('error');
      setErrorMessage('Data profil yang tersimpan tidak dapat dibaca. Profil lama tidak diubah; coba baca ulang atau mulai profil baru secara sadar.');
    }
  }, []);

  useEffect(() => {
    readProfile();
  }, [readProfile]);

  useEffect(() => {
    if (initialized.current || !hydrated || hasStoredProfile || readBlocked || authLoading) return;
    initialized.current = true;
    const importedPosition = user?.jabatanSkk?.trim() || getSavedJabatanTarget() || '';
    const importedName = importedPosition ? jabatanName(importedPosition) : '';
    const initial: ProfessionalProfileData = {
      ...EMPTY_PROFILE,
      jabatan: importedName,
      targetJabatan: importedName,
    };
    setProfile(initial);
    setSaveState('dirty');
  }, [authLoading, hasStoredProfile, hydrated, readBlocked, user?.jabatanSkk]);

  const saveProfile = useCallback((next: ProfessionalProfileData = profile) => {
    if (readBlocked && !explicitRecovery) return;
    if (next.pengalaman && (!Number.isFinite(Number(next.pengalaman)) || Number(next.pengalaman) < 0)) {
      setSaveState('error');
      setErrorMessage('Pengalaman kerja harus berupa jumlah tahun 0 atau lebih.');
      return;
    }
    if (next.terbit && next.berakhir && next.berakhir < next.terbit) {
      setSaveState('error');
      setErrorMessage('Tanggal berakhir SKK tidak boleh sebelum tanggal terbit.');
      return;
    }
    setSaveState('saving');
    setErrorMessage('');
    try {
      window.localStorage.setItem(PROFESSIONAL_PROFILE_KEY, JSON.stringify(next));
      setHasStoredProfile(true);
      setExplicitRecovery(false);
      setReadBlocked(false);
      setSaveState('saved');
    } catch {
      setSaveState('error');
      setErrorMessage('Penyimpanan di perangkat ini gagal. Periksa ruang penyimpanan, lalu coba simpan kembali.');
    }
  }, [explicitRecovery, profile, readBlocked]);

  const updateField = (key: ProfileField, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaveState('dirty');
    setErrorMessage('');
  };

  const recoverWithNewProfile = () => {
    if (!window.confirm('Ganti profil yang tidak terbaca dengan profil baru? Data lama akan ditimpa hanya setelah Anda menekan Simpan profil baru.')) return;
    initialized.current = true;
    setProfile({ ...EMPTY_PROFILE });
    setHasStoredProfile(false);
    setExplicitRecovery(true);
    setReadBlocked(false);
    setSaveState('dirty');
    setErrorMessage('Profil baru dipilih. Simpan untuk mengganti data tersimpan yang tidak terbaca.');
  };

  const quickActions = [
    { label: 'Cek Kelayakan', detail: 'Lihat jalur SKK yang relevan', href: profileToolHref('/skk-coach/chat', profile), accent: true },
    { label: 'Cek Dokumen', detail: 'Siapkan berkas pengajuan', href: profileToolHref('/dokumen', profile), accent: false },
    { label: 'Mulai Persiapan', detail: 'Buat rencana belajar', href: profileToolHref('/rencana-belajar', profile), accent: false },
  ];

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[#10171b] text-[#f4f0e7]">
      <div className="pointer-events-none fixed inset-0 opacity-[.12]" aria-hidden="true">
        <div className="absolute -right-40 -top-44 h-[32rem] w-[32rem] rounded-full border border-[#d8a75b]/50" />
        <div className="absolute -right-24 -top-28 h-[25rem] w-[25rem] rounded-full border border-[#d8a75b]/30" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#d8a75b]/40 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1180px] px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:px-12">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
          <Link href="/skk" data-testid="link-back-skk" className="inline-flex items-center gap-2 text-sm text-[#aab5b6] transition hover:text-[#f4f0e7]">
            <span aria-hidden="true">←</span> Ekosistem SKK
          </Link>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.18em] text-[#d8a75b]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d8a75b]" />
            Ruang profesional
          </div>
        </div>

        <header className="grid gap-8 border-b border-[#334047] pb-10 md:grid-cols-[1fr_250px] md:items-end">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-[#d8a75b]">SIAP SKK / PROFIL</p>
            <h1 className="font-[var(--font-display,inherit)] text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[.98] tracking-[-.055em] text-[#f2eee4]">
              Profil <span className="text-[#d8a75b]">Profesional</span>
            </h1>
            <p className="mt-5 max-w-[600px] text-base leading-7 text-[#aeb9b9]">
              Satu titik awal untuk perjalanan SKK Anda. Lengkapi profil, catat sertifikat yang dimiliki, lalu tentukan langkah berikutnya.
            </p>
          </div>
          <div className="relative rounded-2xl border border-[#435047] bg-[#182126] p-5 md:mb-1">
            <div className="mb-5 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#9ca9a7]">Profil terisi</p>
                <p data-testid="text-profile-completeness" className="mt-1 text-4xl font-semibold tracking-[-.04em] text-[#f2eee4]">{completeness}<span className="text-xl text-[#d8a75b]">%</span></p>
              </div>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-[.16em] text-[#83908d]">Kelengkapan data</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#2c383e]">
              <div className="h-full rounded-full bg-[#d8a75b] transition-all duration-500" style={{ width: `${completeness}%` }} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#98a5a4]">Persentase data profil yang sudah diisi, bukan penilaian kompetensi.</p>
          </div>
        </header>

        <section className="py-8" aria-label="Aksi cepat">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-7 bg-[#d8a75b]" />
            <h2 className="text-xs font-semibold uppercase tracking-[.18em] text-[#aab5b1]">Lanjutkan dengan</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {quickActions.map((action, index) => (
              <Link
                key={action.label}
                href={action.href}
                data-testid={`link-quick-${index + 1}`}
                className={`group flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 transition duration-200 hover:-translate-y-0.5 ${
                  action.accent
                    ? 'border-[#d8a75b]/65 bg-[#d8a75b] text-[#1a1d1a] hover:bg-[#e4bb7e]'
                    : 'border-[#35434a] bg-[#182126] text-[#f4f0e7] hover:border-[#718077]'
                }`}
              >
                <span>
                  <span className="block text-[15px] font-semibold">{action.label}</span>
                  <span className={`mt-1 block text-xs ${action.accent ? 'text-[#54472f]' : 'text-[#91a09f]'}`}>{action.detail}</span>
                </span>
                <span className="text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>

        {saveState === 'error' && (
          <div role="alert" className="mb-5 flex flex-col gap-4 rounded-xl border border-[#b96f63]/50 bg-[#3a2523]/70 p-4 text-sm text-[#f1c5b8] sm:flex-row sm:items-center sm:justify-between">
            <p data-testid="status-profile-error" className="leading-relaxed">{errorMessage}</p>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button type="button" onClick={readProfile} data-testid="button-retry-read" className="rounded-lg border border-[#b96f63]/60 px-3 py-2 text-xs font-semibold transition hover:bg-[#b96f63]/15">Coba baca ulang</button>
              <button type="button" onClick={recoverWithNewProfile} data-testid="button-recover-profile" className="rounded-lg bg-[#d8a75b] px-3 py-2 text-xs font-semibold text-[#211d16] transition hover:bg-[#e6bd81]">Mulai profil baru</button>
            </div>
          </div>
        )}

        {hydrated && saveState !== 'error' && !authLoading && !hasStoredProfile && user?.jabatanSkk && (
          <p className="mb-5 rounded-xl border border-[#59674d]/60 bg-[#202a22] px-4 py-3 text-sm leading-relaxed text-[#c1c9b4]">
            Jabatan dari akun telah disalin sebagai jabatan saat ini dan target. Sertifikat aktif hanya dicatat bila Anda mengisinya pada bagian SKK Saat Ini.
          </p>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div className="space-y-5">
            {fieldGroups.map((group, groupIndex) => (
              <section key={group.title} className="rounded-2xl border border-[#303d43] bg-[#151e23] p-5 sm:p-7" aria-labelledby={`heading-${groupIndex}`}>
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-[#2b373c] pb-5">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold tracking-[.18em] text-[#d8a75b]">{group.eyebrow}</p>
                    <h2 id={`heading-${groupIndex}`} className="text-xl font-semibold tracking-[-.02em] text-[#f1eee6]">{group.title}</h2>
                    <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#94a1a1]">{group.description}</p>
                  </div>
                  <span className="hidden font-mono text-xs text-[#778681] sm:block">0{groupIndex + 1}</span>
                </div>
                <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                  {group.fields.map((field) => (
                    <Field key={field.key} field={field} value={profile[field.key]} disabled={!hydrated || authLoading || readBlocked} onChange={(value) => updateField(field.key, value)} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-8">
            <section className="rounded-2xl border border-[#39464a] bg-[#192328] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#d8a75b]">Status Persiapan</p>
              <h2 className="mt-2 text-lg font-semibold text-[#f2eee4]">Alat untuk langkah Anda</h2>
              <p className="mt-2 text-sm leading-6 text-[#9ba7a6]">Buka alat persiapan dengan konteks profil ini.</p>
              <div className="mt-5 space-y-2">
                {[
                  { title: 'SIAP Index', desc: 'Ukur kesiapan persiapan', path: '/siap-index' },
                  { title: 'Rencana Belajar', desc: 'Susun ritme belajar', path: '/rencana-belajar' },
                  { title: 'Dokumen', desc: 'Kelola kebutuhan berkas', path: '/dokumen' },
                ].map((item) => (
                  <Link key={item.path} href={profileToolHref(item.path, profile)} data-testid={`link-tool-${item.path.slice(1)}`} className="group flex items-center justify-between rounded-xl border border-[#354148] bg-[#121a1e] px-3.5 py-3 transition hover:border-[#d8a75b]/60">
                    <span>
                      <span className="block text-sm font-medium text-[#e8e6dd]">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-[#879493]">{item.desc}</span>
                    </span>
                    <span className="text-[#a4b0ac] transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#39464a] bg-[#151e23] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[#e9e6dd]">Penyimpanan lokal</h2>
                <span className={`h-2 w-2 rounded-full ${saveState === 'saved' ? 'bg-[#86ad83]' : saveState === 'error' ? 'bg-[#d78673]' : 'bg-[#d8a75b]'}`} />
              </div>
              <p data-testid="status-profile-save" aria-live="polite" className="mt-2 text-xs leading-relaxed text-[#98a4a2]">
                {saveState === 'loading' ? 'Memastikan profil tersimpan…' : statusCopy[saveState]}
              </p>
              {saveState === 'error' && errorMessage && <p className="mt-2 text-xs leading-relaxed text-[#e7a99b]">{errorMessage}</p>}
              <button
                type="button"
                disabled={!hydrated || authLoading || saveState === 'loading' || saveState === 'saving' || (readBlocked && !explicitRecovery) || (saveState === 'saved' && !explicitRecovery)}
                onClick={() => saveProfile(profile)}
                data-testid="button-save-profile"
                className="mt-4 w-full rounded-xl bg-[#d8a75b] px-4 py-3 text-sm font-semibold text-[#211d16] transition hover:bg-[#e5bb7c] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {saveState === 'saving' ? 'Menyimpan…' : explicitRecovery ? 'Simpan profil baru' : saveState === 'saved' ? 'Profil tersimpan' : 'Simpan profil'}
              </button>
              <p className="mt-3 text-[11px] leading-relaxed text-[#98a4a2]">Profil disimpan di browser ini. Tautan hanya membawa target jabatan, jenjang, dan tanggal persiapan. Simpan perubahan agar alat dapat membaca rincian profil terbaru secara lokal. Rincian hanya masuk ke pesan AI jika Anda memilihnya, lalu menekan Kirim.</p>
            </section>

            <p className="px-1 text-xs leading-relaxed text-[#778582]">
              {hasStoredProfile ? 'Profil yang tersimpan selalu diprioritaskan; nilai kosong yang Anda pilih tetap dipertahankan.' : 'Profil belum pernah disimpan di perangkat ini.'}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
