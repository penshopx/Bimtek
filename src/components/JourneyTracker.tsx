'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export type JourneyStep = {
  step: number;
  icon: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
};

const STORAGE_KEY = 'siapskk_journey_completed';

type CompletionState = Record<number, boolean>;

function readCompletionState(): CompletionState {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};

    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.entries(parsed).reduce<CompletionState>((state, [step, completed]) => {
      if (/^\d+$/.test(step) && typeof completed === 'boolean') {
        state[Number(step)] = completed;
      }
      return state;
    }, {});
  } catch {
    return {};
  }
}

type JourneyTrackerProps = {
  steps: JourneyStep[];
};

export default function JourneyTracker({ steps }: JourneyTrackerProps) {
  const [completedSteps, setCompletedSteps] = useState<CompletionState>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setCompletedSteps(readCompletionState());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
    } catch {
      // Storage can be unavailable in private browsing or restricted previews.
    }
  }, [completedSteps]);

  const completedCount = steps.filter((step) => completedSteps[step.step]).length;

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((current) => ({
      ...current,
      [stepNumber]: !current[stepNumber],
    }));
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm">
          <span className="text-amber-400" aria-hidden="true">✓</span>
          <span>{completedCount} dari {steps.length} langkah selesai</span>
        </div>
        <div className="w-full sm:w-40 h-2 bg-slate-800 rounded-full overflow-hidden" aria-label={`Progress perjalanan ${completedCount} dari ${steps.length} langkah`}>
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative">
        {/* Connector line (desktop) */}
        <div className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/10 via-amber-500/40 to-amber-500/10 z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const isCompleted = Boolean(completedSteps[step.step]);

            return (
              <div
                key={step.step}
                className={`flex flex-col items-center text-center group transition-opacity ${isCompleted ? 'opacity-65' : ''}`}
              >
                {/* Step number bubble */}
                <div className="relative mb-4">
                  <div className={`w-20 h-20 rounded-2xl bg-slate-800 border-2 flex items-center justify-center text-3xl transition-all shadow-lg ${
                    isCompleted
                      ? 'border-emerald-500/70 bg-emerald-950/40'
                      : 'border-slate-700 group-hover:border-amber-500/60'
                  }`}>
                    {isCompleted ? <span className="text-emerald-400" aria-hidden="true">✓</span> : step.icon}
                  </div>
                  <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow ${
                    isCompleted ? 'bg-emerald-400 text-slate-950' : 'bg-amber-500 text-slate-900'
                  }`}>
                    {isCompleted ? '✓' : step.step}
                  </span>
                  {/* Arrow between steps (desktop) */}
                  {idx < steps.length - 1 && (
                    <span className="hidden lg:block absolute top-1/2 -right-[calc(50%+0.75rem)] -translate-y-1/2 text-amber-500/50 text-xl pointer-events-none select-none">›</span>
                  )}
                </div>

                <h3 className={`font-bold text-sm mb-1 transition-colors leading-tight ${
                  isCompleted ? 'text-slate-300 line-through decoration-emerald-400/70' : 'text-white group-hover:text-amber-400'
                }`}>
                  {step.title}
                </h3>
                <p className={`text-xs mb-4 leading-relaxed px-1 ${isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                  {step.desc}
                </p>

                <div className="flex flex-col items-center gap-2 mt-auto">
                  <Link
                    href={step.href}
                    className={`inline-block px-4 py-2 border rounded-xl text-xs font-semibold transition-all ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-slate-800 hover:bg-amber-500/20 border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-amber-400'
                    }`}
                  >
                    {step.cta} →
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleStep(step.step)}
                    aria-pressed={isCompleted}
                    aria-label={isCompleted ? `Tandai langkah ${step.title} belum selesai` : `Tandai langkah ${step.title} selesai`}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                      isCompleted ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-amber-400'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isCompleted ? 'bg-emerald-400 border-emerald-400 text-slate-950' : 'border-slate-600'
                    }`} aria-hidden="true">
                      {isCompleted && '✓'}
                    </span>
                    {isCompleted ? 'Selesai' : 'Tandai selesai'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}