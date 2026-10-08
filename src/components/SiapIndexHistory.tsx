'use client';

import type { DimensionId, SiapHistoryEntry } from '@/lib/siap-index-history';

interface SiapIndexHistoryProps {
  history: SiapHistoryEntry[];
  dimensions: { id: DimensionId; label: string }[];
  onRetake: () => void;
}

const formatDate = (timestamp: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));

const formatDelta = (value: number) => {
  if (value > 0) return `+${value}`;
  return `${value}`;
};

const deltaTone = (value: number) =>
  value > 0 ? 'text-teal-300' : value < 0 ? 'text-rose-300' : 'text-slate-300';

export default function SiapIndexHistory({
  history,
  dimensions,
  onRetake,
}: SiapIndexHistoryProps) {
  const chronological = [...history].sort(
    (a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp),
  );
  const first = chronological[0];
  const latest = chronological[chronological.length - 1];
  const overallDelta = first && latest ? latest.overallScore - first.overallScore : 0;
  const newestFirst = [...chronological].reverse();

  return (
    <section
      aria-labelledby="siap-history-title"
      className="space-y-5 text-slate-100"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
            Catatan perkembangan
          </p>
          <h2 id="siap-history-title" className="text-2xl font-bold tracking-tight text-white">
            Riwayat kesiapan
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-400">
            Pantau perubahan hasil self-assessment Anda. Indeks ini adalah indikator persiapan,
            bukan keputusan resmi sertifikasi.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-teal-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200"
        >
          Ambil Ulang Asesmen
        </button>
      </header>

      {chronological.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/40 px-6 py-10 text-center">
          <div
            aria-hidden="true"
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-lg text-teal-300"
          >
            —
          </div>
          <h3 className="text-base font-semibold text-white">Belum ada riwayat asesmen</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            Hasil asesmen berikutnya akan tersimpan di perangkat ini dan muncul di sini untuk
            dibandingkan.
          </p>
          <p className="mt-4 text-xs text-slate-500">
            Riwayat disimpan secara lokal pada perangkat ini, maksimal 10 hasil.
          </p>
        </div>
      ) : (
        <>
          <article
            aria-labelledby="readiness-delta-title"
            className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-800/55"
          >
            <div className="border-b border-slate-700/70 px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 id="readiness-delta-title" className="font-semibold text-white">
                    Readiness Delta
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Perubahan dari hasil tersimpan paling awal hingga hasil terbaru.
                  </p>
                </div>
                <span
                  className={`rounded-full border border-slate-600/80 bg-slate-900/60 px-3 py-1 text-sm font-semibold tabular-nums ${deltaTone(overallDelta)}`}
                  aria-label={`Perubahan keseluruhan ${formatDelta(overallDelta)} poin`}
                >
                  {formatDelta(overallDelta)} poin
                </span>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/45 p-4">
                  <p className="text-xs text-slate-400">Awal tersimpan</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-slate-100">
                    {first?.overallScore}
                    <span className="ml-1 text-sm font-medium text-slate-500">/100</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{first && formatDate(first.timestamp)}</p>
                </div>
                <div className="rounded-xl border border-teal-300/20 bg-teal-300/[0.06] p-4">
                  <p className="text-xs text-slate-400">Terbaru</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-white">
                    {latest?.overallScore}
                    <span className="ml-1 text-sm font-medium text-slate-500">/100</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{latest && formatDate(latest.timestamp)}</p>
                </div>
              </div>

              <div className="min-w-0">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Perubahan per dimensi
                </h4>
                <ul className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {dimensions.map((dimension) => {
                    const change =
                      (latest?.dimensionScores[dimension.id] ?? 0) -
                      (first?.dimensionScores[dimension.id] ?? 0);
                    return (
                      <li
                        key={dimension.id}
                        className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-700/50 pb-2"
                      >
                        <span className="text-xs text-slate-300">{dimension.label}</span>
                        <span
                          className={`shrink-0 text-xs font-semibold tabular-nums ${deltaTone(change)}`}
                          aria-label={`${formatDelta(change)} poin`}
                        >
                          {formatDelta(change)} poin
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <p className="px-5 pb-5 text-xs leading-relaxed text-slate-500 sm:px-6">
              Baseline memakai hasil paling awal yang masih tersimpan. Riwayat disimpan di perangkat
              ini dan dibatasi hingga 10 hasil terbaru; jika hasil awal terhapus dari batas tersebut,
              baseline ikut bergeser.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-700/80 bg-slate-800/55 p-5 sm:p-6">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">Tren skor keseluruhan</h3>
                <p className="mt-1 text-xs text-slate-400">Urut kronologis, skala tetap 0–100.</p>
              </div>
              <span className="text-xs tabular-nums text-slate-500">100 ─ 0</span>
            </div>
            <div
              role="img"
              aria-label={`Tren skor keseluruhan dari ${chronological
                .map((entry) => `${formatDate(entry.timestamp)}: ${entry.overallScore} dari 100`)
                .join('; ')}`}
              className="relative"
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                <span className="border-t border-slate-700/60" />
                <span className="border-t border-dashed border-slate-700/50" />
                <span className="border-t border-slate-700/60" />
              </div>
              <ol className="relative flex h-32 items-end gap-2 sm:h-40 sm:gap-3">
                {chronological.map((entry, index) => (
                  <li
                    key={`${entry.timestamp}-${index}`}
                    className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-1 text-[10px] font-semibold tabular-nums text-teal-200 sm:text-xs">
                      {entry.overallScore}
                    </span>
                    <div className="flex min-h-0 flex-1 w-full items-end">
                      <div
                        aria-hidden="true"
                        className="w-full rounded-t-md border border-teal-200/30 bg-teal-300/75 transition-opacity group-hover:opacity-100"
                        style={{ height: `${entry.overallScore}%`, minHeight: '2px' }}
                      />
                    </div>
                    <time
                      dateTime={entry.timestamp}
                      className="mt-2 w-full truncate text-center text-[9px] text-slate-500 sm:text-[10px]"
                      title={formatDate(entry.timestamp)}
                    >
                      {formatDate(entry.timestamp)}
                    </time>
                  </li>
                ))}
              </ol>
            </div>
            <ol className="sr-only">
              {chronological.map((entry, index) => (
                <li key={`${entry.timestamp}-description-${index}`}>
                  {formatDate(entry.timestamp)}: {entry.overallScore} dari 100.
                </li>
              ))}
            </ol>
          </article>

          <section aria-labelledby="assessment-list-title">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 id="assessment-list-title" className="font-semibold text-white">
                Hasil asesmen
              </h3>
              <span className="text-xs text-slate-500">{chronological.length} dari maksimal 10</span>
            </div>
            <ol className="divide-y divide-slate-700/70 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-800/45">
              {newestFirst.map((entry, reverseIndex) => {
                const chronologicalIndex = chronological.length - 1 - reverseIndex;
                const previous = chronological[chronologicalIndex - 1];
                const change = previous ? entry.overallScore - previous.overallScore : null;
                return (
                  <li
                    key={`${entry.timestamp}-${chronologicalIndex}`}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <time
                        dateTime={entry.timestamp}
                        className="text-sm font-medium text-slate-200"
                      >
                        {formatDate(entry.timestamp)}
                      </time>
                      <p className="mt-1 text-xs text-slate-500">
                        {change === null
                          ? 'Baseline — belum ada hasil sebelumnya'
                          : `Dibanding hasil sebelumnya: ${formatDelta(change)} poin`}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-xs text-slate-400">Skor keseluruhan</span>
                      <span className="text-lg font-bold tabular-nums text-white">
                        {entry.overallScore}
                        <span className="ml-1 text-xs font-medium text-slate-500">/100</span>
                      </span>
                      {change !== null && (
                        <span className={`min-w-14 text-right text-xs font-semibold tabular-nums ${deltaTone(change)}`}>
                          {formatDelta(change)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}
    </section>
  );
}
