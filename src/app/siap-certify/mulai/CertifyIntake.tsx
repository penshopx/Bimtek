'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  analyzeCertifyProfile,
  CERTIFY_DISCLAIMER,
  CERTIFY_PROFILE_KEY,
  EMPTY_CERTIFY_PROFILE,
  ELIGIBILITY_LABELS,
  profileStepError,
  restoreCertifyProfile,
  type CertifyProfile,
  type CertifyResult,
} from '@/lib/certify-intake';

const stepNames = ['Profil Dasar', 'Pengalaman', 'Target SKK'];

const inputClass =
  'mt-2 block w-full rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-60';
const labelClass = 'block text-sm font-semibold text-slate-200';

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-2 text-xs leading-relaxed text-slate-400">{hint}</p>}
    </div>
  );
}

export default function CertifyIntake() {
  const [profile, setProfile] = useState<CertifyProfile>(EMPTY_CERTIFY_PROFILE);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [result, setResult] = useState<CertifyResult | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedDocuments, setCheckedDocuments] = useState<Set<number>>(new Set());
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CERTIFY_PROFILE_KEY);
      if (saved === null) return;
      const restored = restoreCertifyProfile(JSON.parse(saved) as unknown);
      if (restored) {
        setProfile(restored);
        setStorageMessage('Profil tersimpan di perangkat ini telah dipulihkan.');
      } else {
        setStorageMessage('Data profil tersimpan tidak dapat dibaca. Anda dapat mengisi profil baru.');
      }
    } catch {
      setStorageMessage('Penyimpanan lokal tidak dapat dibaca di perangkat ini. Anda tetap dapat mengisi profil.');
    }
  }, []);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function updateProfile<K extends keyof CertifyProfile>(key: K, value: CertifyProfile[K]) {
    setProfile(current => ({ ...current, [key]: value }));
    setStepError(null);
    setRequestError(null);
    if (result) {
      setResult(null);
      setCheckedDocuments(new Set());
      setStorageMessage('Profil berubah. Hasil sebelumnya dihapus agar tidak tertukar dengan profil terbaru.');
    }
  }

  function goToStep(nextStep: number) {
    if (loading) return;
    if (result) {
      setResult(null);
      setCheckedDocuments(new Set());
      setStorageMessage('Profil berubah. Hasil sebelumnya dihapus agar tidak tertukar dengan profil terbaru.');
    }
    setStepError(null);
    setRequestError(null);
    setStep(Math.max(0, Math.min(2, nextStep)));
  }

  function continueStep() {
    const error = profileStepError(profile, step);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStep(step + 1);
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (step < 2) {
      continueStep();
      return;
    }
    for (let index = 0; index < 3; index += 1) {
      const error = profileStepError(profile, index);
      if (error) {
        setStep(index);
        setStepError(error);
        return;
      }
    }

    setLoading(true);
    setRequestError(null);
    setStorageMessage(null);
    try {
      window.localStorage.setItem(CERTIFY_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      setStorageMessage('Profil tidak dapat disimpan di perangkat ini. Analisis tetap dilanjutkan; simpanan profil tidak tersedia.');
    }

    try {
      const analysis = await analyzeCertifyProfile(profile);
      setResult(analysis);
      setCheckedDocuments(new Set());
      setRequestError(null);
    } catch (error) {
      const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
      const message = isTimeout
        ? 'Analisis melewati batas waktu. Isian Anda tetap ada; silakan coba lagi.'
        : error instanceof Error && error.message
          ? error.message
          : 'Analisis belum berhasil. Isian Anda tetap ada; silakan coba lagi.';
      setRequestError(message);
    } finally {
      setLoading(false);
    }
  }

  function eraseSavedProfile() {
    if (!window.confirm('Hapus profil SIAP CERTIFY yang tersimpan di perangkat ini?')) return;
    try {
      window.localStorage.removeItem(CERTIFY_PROFILE_KEY);
      setProfile({ ...EMPTY_CERTIFY_PROFILE });
      setResult(null);
      setCheckedDocuments(new Set());
      setStep(0);
      setStepError(null);
      setRequestError(null);
      setStorageMessage('Profil lokal telah dihapus dari perangkat ini.');
    } catch {
      setStorageMessage('Profil tidak berhasil dihapus. Data dan isian tetap dipertahankan; silakan coba lagi.');
    }
  }

  const statusStyles = result?.status === 'potentially_eligible'
    ? { panel: 'border-emerald-400/40 bg-emerald-400/10', pill: 'bg-emerald-300 text-emerald-950', marker: 'bg-emerald-400' }
    : result?.status === 'potentially_ineligible'
      ? { panel: 'border-rose-400/40 bg-rose-400/10', pill: 'bg-rose-300 text-rose-950', marker: 'bg-rose-400' }
      : { panel: 'border-amber-300/40 bg-amber-300/10', pill: 'bg-amber-200 text-amber-950', marker: 'bg-amber-300' };

  const chatHref = result
    ? `/chat?q=${encodeURIComponent(`Saya ingin menindaklanjuti analisis awal untuk jabatan ${profile.targetPosition}, jenjang ${profile.level}. Bantu saya memahami langkah persiapannya.`)}`
    : '/chat';

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.16),_transparent_48%),linear-gradient(145deg,#0b1220_0%,#111c2d_52%,#0d1727_100%)] px-4 py-8 text-slate-100 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/siap-certify" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300">
          <span aria-hidden="true">←</span> Kembali ke SIAP CERTIFY
        </Link>

        <header className="relative mt-7 overflow-hidden rounded-[2rem] border border-blue-300/15 bg-slate-900/75 p-6 shadow-2xl shadow-black/20 sm:p-10">
          <div aria-hidden="true" className="absolute -right-14 -top-20 h-64 w-64 rounded-full border border-blue-300/10" />
          <div aria-hidden="true" className="absolute -right-2 -top-8 h-40 w-40 rounded-full border border-blue-300/10" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">SIAP CERTIFY / ANALISIS AWAL</p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">Mulai dari profil Anda.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Ceritakan pengalaman dan jabatan SKK yang dituju. Anda akan menerima gambaran awal beserta hal yang perlu diverifikasi dan checklist persiapan.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
              <span>3 langkah singkat</span>
              <span>Nama tetap di perangkat</span>
              <span>Keputusan resmi tetap di LSP</span>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 rounded-3xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-xl shadow-black/15 sm:p-8" aria-label="Formulir analisis kelayakan">
            {!result && (
              <>
                <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Tahapan formulir">
                  {stepNames.map((name, index) => (
                    <li key={name}>
                      <button
                        type="button"
                        onClick={() => index < step ? goToStep(index) : undefined}
                        disabled={loading || index > step}
                        aria-current={step === index ? 'step' : undefined}
                        className={`w-full border-t-2 pt-3 text-left text-xs font-semibold transition sm:text-sm ${
                          index === step ? 'border-blue-400 text-blue-200' : index < step ? 'border-slate-500 text-slate-300 hover:text-white' : 'border-slate-700 text-slate-600'
                        } disabled:cursor-default`}
                      >
                        <span className="mr-2 font-mono">{String(index + 1).padStart(2, '0')}</span>{name}
                      </button>
                    </li>
                  ))}
                </ol>

                <form onSubmit={submitProfile} noValidate>
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Langkah {String(step + 1).padStart(2, '0')} dari 03</p>
                    <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-bold text-white focus:outline-none">{stepNames[step]}</h2>
                  </div>

                  {step === 0 && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Nama lengkap" htmlFor="certify-name" hint="Disimpan lokal di perangkat ini dan tidak dikirim untuk analisis.">
                        <input id="certify-name" className={inputClass} autoComplete="name" value={profile.name} disabled={loading} maxLength={2000} onChange={event => updateProfile('name', event.target.value)} required />
                      </Field>
                      <Field label="Jabatan saat ini" htmlFor="certify-current-position">
                        <input id="certify-current-position" className={inputClass} value={profile.currentPosition} disabled={loading} maxLength={2000} onChange={event => updateProfile('currentPosition', event.target.value)} required />
                      </Field>
                      <Field label="Pendidikan terakhir" htmlFor="certify-education">
                        <input id="certify-education" className={inputClass} placeholder="Contoh: D4, S1, atau SMK" value={profile.education} disabled={loading} maxLength={2000} onChange={event => updateProfile('education', event.target.value)} required />
                      </Field>
                      <Field label="Jurusan pendidikan" htmlFor="certify-major">
                        <input id="certify-major" className={inputClass} value={profile.educationMajor} disabled={loading} maxLength={2000} onChange={event => updateProfile('educationMajor', event.target.value)} required />
                      </Field>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid gap-5">
                      <Field label="Lama pengalaman kerja (tahun)" htmlFor="certify-years" hint="Boleh menggunakan desimal. Isi 0 jika belum memiliki pengalaman kerja.">
                        <input id="certify-years" type="number" min="0" max="80" step="any" inputMode="decimal" className={inputClass} placeholder="Misalnya 4,5" value={profile.yearsExperience} disabled={loading} onChange={event => updateProfile('yearsExperience', event.target.value)} required />
                      </Field>
                      <Field label="Bidang pengalaman" htmlFor="certify-field">
                        <textarea id="certify-field" rows={3} className={inputClass} placeholder="Ceritakan bidang pekerjaan yang paling relevan" value={profile.field} disabled={loading} maxLength={2000} onChange={event => updateProfile('field', event.target.value)} required />
                      </Field>
                      <Field label="Proyek atau praktik yang pernah dikerjakan" htmlFor="certify-projects" hint="Jika belum memiliki proyek, jelaskan kondisi tersebut. Anda dapat menulis “Belum memiliki proyek” dan menyebutkan pelatihan atau praktik yang pernah diikuti.">
                        <textarea id="certify-projects" rows={4} className={inputClass} placeholder="Peran, lingkup pekerjaan, dan bukti yang mungkin tersedia" value={profile.projects} disabled={loading} maxLength={2000} onChange={event => updateProfile('projects', event.target.value)} required />
                      </Field>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid gap-5">
                      <Field label="Jabatan SKK yang dituju" htmlFor="certify-target" hint="Tuliskan nama jabatan persis seperti yang Anda tuju. Kami tidak akan menggantinya dengan pemetaan otomatis.">
                        <input id="certify-target" className={inputClass} placeholder="Jabatan yang ingin dituju" value={profile.targetPosition} disabled={loading} maxLength={2000} onChange={event => updateProfile('targetPosition', event.target.value)} required />
                      </Field>
                      <Field label="Jenjang SKK" htmlFor="certify-level">
                        <select id="certify-level" className={inputClass} value={profile.level} disabled={loading} onChange={event => updateProfile('level', event.target.value)} required>
                          <option value="">Pilih jenjang 1–9</option>
                          {Array.from({ length: 9 }, (_, index) => String(index + 1)).map(level => <option key={level} value={level}>Jenjang {level}</option>)}
                        </select>
                      </Field>
                      <fieldset disabled={loading} className="grid gap-3">
                        <legend className={labelClass}>Apakah Anda pernah memiliki SKK?</legend>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { value: 'yes', text: 'Ya, pernah' },
                            { value: 'no', text: 'Belum pernah' },
                          ].map(option => (
                            <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${profile.hasPreviousSkk === option.value ? 'border-blue-400 bg-blue-400/10 text-blue-100' : 'border-slate-600 bg-slate-950/40 text-slate-300'}`}>
                              <input type="radio" name="previous-skk" value={option.value} checked={profile.hasPreviousSkk === option.value} onChange={event => updateProfile('hasPreviousSkk', event.target.value)} className="accent-blue-400" required />
                              {option.text}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      {profile.hasPreviousSkk === 'yes' && (
                        <Field label="Detail SKK sebelumnya" htmlFor="certify-previous-skk" hint="Cantumkan jabatan, jenjang, dan status SKK sebelumnya.">
                          <textarea id="certify-previous-skk" rows={3} className={inputClass} value={profile.previousSkk} disabled={loading} maxLength={2000} onChange={event => updateProfile('previousSkk', event.target.value)} required />
                        </Field>
                      )}
                      <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-relaxed text-amber-100/90">
                        <strong className="text-amber-200">Sebelum mengirim:</strong> {CERTIFY_DISCLAIMER}. Profil relevan selain nama akan dikirim ke AI untuk analisis.
                      </div>
                    </div>
                  )}

                  {stepError && <p role="alert" className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{stepError}</p>}
                  {requestError && <p role="alert" className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{requestError}</p>}
                  {storageMessage && <p role="status" className="mt-5 rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-sm text-slate-300">{storageMessage}</p>}

                  <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-700/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={() => goToStep(step - 1)} disabled={step === 0 || loading} className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
                      Kembali
                    </button>
                    {step < 2 ? (
                      <button type="submit" disabled={loading} className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-60">
                        Lanjutkan <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <button type="submit" disabled={loading} className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-300 disabled:cursor-wait disabled:opacity-70">
                        {loading ? 'Menganalisis profil…' : 'Analisis Profil Saya'}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}

            {loading && (
              <div role="status" aria-live="polite" className="mt-5 space-y-3">
                <p className="text-sm font-semibold text-blue-200">Sedang menyusun panduan awal Anda.</p>
                <div className="h-3 animate-pulse rounded-full bg-slate-700" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-700" />
                <div className="h-3 w-3/5 animate-pulse rounded-full bg-slate-700" />
              </div>
            )}

            {result && !loading && (
              <div aria-live="polite">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Hasil analisis awal</p>
                    <h2 className="mt-2 text-2xl font-bold text-white">Gambaran untuk target Anda</h2>
                    <p className="mt-2 text-sm text-slate-300">{profile.targetPosition} · Jenjang {profile.level}</p>
                  </div>
                  <button type="button" onClick={() => goToStep(0)} className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
                    Ubah profil
                  </button>
                </div>

                <div className={`mt-6 rounded-2xl border p-5 ${statusStyles.panel}`}>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${statusStyles.pill}`}>
                    <span aria-hidden="true" className={`h-2 w-2 rounded-full ${statusStyles.marker}`} />
                    {ELIGIBILITY_LABELS[result.status]}
                  </span>
                  <p className="mt-4 text-base leading-7 text-slate-100">{result.summary}</p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-300">{CERTIFY_DISCLAIMER}.</p>
                </div>

                <div className="mt-7 grid gap-6 sm:grid-cols-2">
                  <section>
                    <h3 className="text-sm font-bold text-white">Pertimbangan awal</h3>
                    <ul className="mt-3 space-y-3">
                      {result.reasons.map((reason, index) => (
                        <li key={`${reason}-${index}`} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />{reason}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-4">
                    <h3 className="text-sm font-bold text-amber-200">Yang perlu diverifikasi</h3>
                    <ul className="mt-3 space-y-3">
                      {result.verification.map((item, index) => (
                        <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />{item}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section className="mt-8">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-white">Checklist persiapan pribadi</h3>
                      <p className="mt-1 text-xs text-slate-400">Tandai progres di sesi ini. Saran ini bukan daftar persyaratan resmi.</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{checkedDocuments.size}/{result.documents.length} selesai</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {result.documents.map((document, index) => (
                      <li key={`${document.name}-${index}`} className={`rounded-xl border transition ${checkedDocuments.has(index) ? 'border-emerald-400/30 bg-emerald-400/[0.06]' : 'border-slate-700 bg-slate-950/40'}`}>
                        <label className="flex cursor-pointer gap-3 p-4">
                          <input
                            type="checkbox"
                            checked={checkedDocuments.has(index)}
                            onChange={() => setCheckedDocuments(current => {
                              const updated = new Set(current);
                              if (updated.has(index)) updated.delete(index);
                              else updated.add(index);
                              return updated;
                            })}
                            className="mt-1 h-4 w-4 shrink-0 accent-emerald-400"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-slate-100">{document.name}</span>
                            <span className="mt-1 block text-sm leading-relaxed text-slate-400">{document.guidance}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>

                <div className="mt-8 rounded-2xl border border-blue-300/20 bg-blue-400/[0.06] p-5">
                  <p className="text-sm font-bold text-white">Ingin membahas langkah berikutnya?</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">Lanjutkan percakapan dengan konteks jabatan dan jenjang target. Nama atau detail identitas tidak ditambahkan ke tautan.</p>
                  <Link href={chatHref} className="mt-4 inline-flex rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-300">
                    Tanyakan langkah persiapan <span aria-hidden="true" className="ml-2">→</span>
                  </Link>
                </div>
                {storageMessage && <p role="status" className="mt-5 rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-3 text-sm text-slate-300">{storageMessage}</p>}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Privasi profil</p>
              <h2 className="mt-2 text-base font-bold text-white">Tersimpan di perangkat Anda</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Profil yang dikirim disimpan di browser ini. Pada perangkat bersama, pengguna lain dapat membacanya; hapus setelah selesai. Nama tetap lokal; data profil lainnya dikirim ke AI untuk analisis.
              </p>
              <button type="button" onClick={eraseSavedProfile} disabled={loading} className="mt-4 w-full rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-rose-300/50 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50">
                Hapus profil tersimpan
              </button>
              {storageMessage && <p role="status" className="mt-3 text-xs leading-relaxed text-slate-400">{storageMessage}</p>}
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">Panduan awal, bukan keputusan</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Analisis tidak menetapkan persyaratan resmi atau menjamin hasil. Konfirmasikan persyaratan skema dan bukti yang diterima langsung kepada LSP.
              </p>
              <p className="mt-3 text-xs font-semibold text-amber-100">{CERTIFY_DISCLAIMER}.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
