import Link from 'next/link';
import type { LearningJourneyPanelProps, JourneyStep } from '@/lib/learning-journey';

function statusLabel(status: JourneyStep['status']) {
  if (status === 'completed') return 'Selesai';
  if (status === 'in-progress') return 'Sedang dipelajari';
  return 'Belum dimulai';
}

function StepRow({ step, index, compact = false }: { step: JourneyStep; index: number; compact?: boolean }) {
  const complete = step.status === 'completed';
  const active = step.status === 'in-progress';

  return (
    <li className="group relative">
      {!compact && index > 0 && (
        <span aria-hidden="true" className="absolute -top-5 left-[15px] h-5 w-px bg-slate-700" />
      )}
      <Link
        href={step.href}
        data-testid={`link-journey-step-${step.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`}
        className={`flex min-w-0 items-start gap-3 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
          compact ? 'py-2' : 'border border-slate-700/80 bg-slate-900/55 p-4 hover:border-sky-400/50 hover:bg-slate-800/80'
        }`}
      >
        <span
          aria-hidden="true"
          className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${
            complete
              ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-200'
              : active
                ? 'border-sky-300/70 bg-sky-300/15 text-sky-100'
                : 'border-slate-600 bg-slate-800 text-slate-300'
          }`}
        >
          {complete ? '✓' : String(index + 1).padStart(2, '0')}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.13em] text-sky-200/80">
              {step.type === 'module' ? 'Modul' : 'Latihan'}
            </span>
            <span className="text-[11px] text-slate-500">/</span>
            <span className="text-[11px] text-slate-400">{step.category}</span>
          </span>
          <span className="mt-1 block text-sm font-semibold leading-snug text-slate-100 transition-colors group-hover:text-sky-100">
            {step.title}
          </span>
          {!compact && (
            <>
              <span className="mt-1.5 block text-xs leading-relaxed text-slate-400">{step.description}</span>
              <span className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-slate-300">
                <span className={`h-1.5 w-1.5 rounded-full ${complete ? 'bg-emerald-300' : active ? 'bg-sky-300' : 'bg-slate-500'}`} />
                {statusLabel(step.status)}
                <span className="text-slate-600">·</span>
                Buka langkah
              </span>
            </>
          )}
        </span>
        {compact && (
          <span className="mt-2 shrink-0 text-xs text-slate-400" aria-hidden="true">›</span>
        )}
      </Link>
    </li>
  );
}

function GuidanceNote() {
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-950/45 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Tentang alur ini</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">
        Ini panduan pengantar editorial berdasarkan kategori jabatan, bukan skema SKK resmi. Penyelesaian modul
        ditandai sendiri; latihan tercatat selesai saat Anda mencapai hasil kuis, bukan karena lulus ambang nilai.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">
        Progress dipisahkan per akun dan tersimpan di browser ini; tidak tersinkron lintas perangkat. Ini bukan
        SKPK dan bukan penetapan kompetensi resmi.
      </p>
    </div>
  );
}

export function LearningJourneyPanel({
  targetName,
  steps,
  nextStep,
  completedCount,
  totalCount,
  progressPercent,
  isSignedIn,
  loading,
  notice,
  storageWarning,
  compact = false,
}: LearningJourneyPanelProps) {
  const percent = Math.max(0, Math.min(100, progressPercent));
  const safeCompletedCount = Math.max(0, Math.min(completedCount, totalCount));

  return (
    <section
      aria-labelledby={compact ? 'learning-journey-compact-title' : 'learning-journey-title'}
      className={`relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-[#101d2d] text-slate-100 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.85)] ${
        compact ? 'p-5 sm:p-6' : 'p-5 sm:p-7 lg:p-8'
      }`}
      data-testid={compact ? 'panel-learning-journey-compact' : 'panel-learning-journey'}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-sky-300/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full border border-sky-300/10" />

      <div className="relative">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">SIAP SKK · Panduan belajar</p>
            <h2
              id={compact ? 'learning-journey-compact-title' : 'learning-journey-title'}
              className={`mt-2 font-semibold tracking-tight text-white ${compact ? 'text-xl' : 'text-2xl sm:text-[1.75rem]'}`}
            >
              {compact ? 'Langkah belajar Anda' : 'Alur belajar pengantar'}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300">
              {isSignedIn && targetName
                ? <>Disusun sebagai pengantar kategori untuk <span className="font-medium text-slate-100">{targetName}</span>.</>
                : 'Panduan pengantar kategori belajar di SIAP SKK.'}
            </p>
          </div>
          {!compact && isSignedIn && targetName && !loading && totalCount > 0 && (
            <div className="shrink-0 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 sm:min-w-36">
              <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Progress tercatat</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                {percent}<span className="ml-0.5 text-sm text-slate-400">%</span>
              </p>
            </div>
          )}
        </div>

        {notice && (
          <div role="status" className="mt-5 rounded-lg border border-sky-300/25 bg-sky-300/10 px-4 py-3 text-sm leading-relaxed text-sky-100" data-testid="status-journey-notice">
            {notice}
          </div>
        )}
        {storageWarning && (
          <div role="alert" className="mt-3 rounded-lg border border-amber-300/35 bg-amber-300/10 px-4 py-3 text-sm leading-relaxed text-amber-100" data-testid="alert-journey-storage">
            {storageWarning}
          </div>
        )}

        {loading ? (
          <div className="mt-6">
            <div className="space-y-3" role="status" aria-label="Memuat alur belajar">
              <div className="h-3 w-40 animate-pulse rounded bg-slate-700/80" />
              <div className="h-2 w-full animate-pulse rounded-full bg-slate-700/70" />
              <div className="space-y-2 pt-2">
                <div className="h-16 animate-pulse rounded-xl bg-slate-700/45" />
                {!compact && <div className="h-16 animate-pulse rounded-xl bg-slate-700/35" />}
              </div>
              <span className="sr-only">Memuat alur belajar…</span>
            </div>
            {!isSignedIn && (
              <Link
                href="/login"
                data-testid="link-journey-login-loading"
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Masuk
              </Link>
            )}
          </div>
        ) : !isSignedIn ? (
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-950/45 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
              Masuk untuk melihat alur sesuai jabatan dan progress akun Anda.
            </p>
            <Link
              href="/login"
              data-testid="link-journey-login"
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-sky-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Masuk
            </Link>
          </div>
        ) : !targetName ? (
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-950/45 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
              Pilih jabatan terlebih dahulu agar rekomendasi kategori belajar dapat ditampilkan.
            </p>
            <Link
              href="/profile"
              data-testid="link-journey-profile"
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-sky-300/40 bg-sky-300/10 px-4 py-2 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Pilih jabatan
            </Link>
          </div>
        ) : (
          <>
            {totalCount > 0 ? (
              <div className={`mt-5 ${compact ? '' : 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(250px,0.72fr)]'}`}>
                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-300">
                      <span className="font-semibold tabular-nums text-white">{safeCompletedCount}</span> dari {totalCount} langkah selesai
                    </span>
                    <span className="font-semibold tabular-nums text-sky-200">{percent}%</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-slate-700"
                    role="progressbar"
                    aria-label="Progress alur belajar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    aria-valuetext={`${safeCompletedCount} dari ${totalCount} langkah selesai`}
                  >
                    <div
                      className="h-full rounded-full bg-sky-300 transition-[width] duration-500 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {compact ? (
                    <ol className="mt-4 divide-y divide-slate-700/70">
                      {steps.slice(0, 2).map((step, index) => (
                        <StepRow key={step.id} step={step} index={index} compact />
                      ))}
                    </ol>
                  ) : (
                    <ol className="mt-5 space-y-3">
                      {steps.map((step, index) => <StepRow key={step.id} step={step} index={index} />)}
                    </ol>
                  )}
                </div>

                <aside className={`flex flex-col gap-4 ${compact ? 'mt-5 border-t border-slate-700/80 pt-5' : ''}`}>
                  {nextStep ? (
                    <div className="rounded-xl border border-sky-300/25 bg-sky-300/[0.07] p-4 sm:p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-200">Langkah berikutnya</p>
                      <p className="mt-2 text-base font-semibold leading-snug text-white">{nextStep.title}</p>
                      {!compact && <p className="mt-1 text-xs text-slate-400">{nextStep.category}</p>}
                      <Link
                        href={nextStep.href}
                        data-testid="link-journey-continue"
                        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                      >
                        Lanjutkan Belajar <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/[0.07] p-4 sm:p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">Pengantar selesai</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-100">
                        Rute pengantar kategori ini telah selesai. Ini bukan sertifikasi atau penetapan kompetensi.
                      </p>
                      <Link
                        href="/bimtek"
                        data-testid="link-journey-further-learning"
                        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-emerald-200/35 bg-emerald-200/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-200/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                      >
                        Jelajahi BIMTEK <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  )}
                  {!compact && <GuidanceNote />}
                </aside>

                {compact && (
                  <>
                    <div className="mt-4">
                      <Link
                        href="/alur-belajar"
                        data-testid="link-journey-full-details"
                        className="inline-flex min-h-9 items-center gap-1 text-sm font-medium text-sky-200 underline decoration-sky-200/40 underline-offset-4 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                      >
                        Lihat detail alur belajar <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                    <div className="mt-4">
                      <GuidanceNote />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950/45 p-5">
                <p className="text-sm font-semibold text-white">Belum ada langkah yang tersedia</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Belum ada modul atau latihan kategori yang dapat ditampilkan untuk jabatan ini.
                </p>
                <Link
                  href="/bimtek"
                  data-testid="link-journey-bimtek"
                  className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-sky-300/40 px-4 py-2 text-sm font-semibold text-sky-100 transition-colors hover:bg-sky-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Jelajahi BIMTEK
                </Link>
                {compact && (
                  <Link href="/alur-belajar" className="ml-4 text-sm font-medium text-sky-200 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                    Detail alur
                  </Link>
                )}
              </div>
            )}
            {!compact && totalCount > 0 && (
              <p className="mt-5 border-t border-slate-700/70 pt-4 text-xs leading-relaxed text-slate-500">
                Setiap langkah tetap dapat dibuka kembali kapan saja. Progres ini membantu Anda mengikuti rute pengantar, bukan mengunci akses.
                {' '}Catatan lama dari penyimpanan browser bersama tidak dihapus dan tidak otomatis dimasukkan ke progres akun ini karena pemiliknya tidak dapat dipastikan.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
