import type { Metadata } from 'next';
import { LearningJourney } from '@/components/learning/LearningJourney';

export const metadata: Metadata = {
  title: 'Alur Belajar Terarah | SIAP SKK',
  description: 'Lanjutkan materi dan latihan sesuai target jabatan, dengan catatan progres belajar pribadi.',
};

export default function LearningJourneyPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <LearningJourney />
      </div>
    </main>
  );
}
