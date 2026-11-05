'use client';

import { useEffect, useState } from 'react';
import { getQuizCategories } from '@/app/actions/quiz';
import { useAuth } from '@/components/AuthProvider';
import { buildLearningJourney } from '@/lib/learning-journey';
import { useJourneyProgress } from '@/lib/useJourneyProgress';
import { LearningJourneyPanel } from './LearningJourneyPanel';

export function LearningJourney({ compact = false }: { compact?: boolean }) {
  const { user, isLoading } = useAuth();
  const { progress, warning, loading: progressLoading } = useJourneyProgress(user?.id);
  const [quiz, setQuiz] = useState<{ categories: string[]; loading: boolean; error: string | null }>({
    categories: [], loading: true, error: null,
  });
  useEffect(() => {
    let active = true;
    getQuizCategories().then(categories => {
      if (active) setQuiz({ categories, loading: false, error: null });
    }).catch(() => {
      if (active) setQuiz({
        categories: [], loading: false,
        error: 'Kategori latihan belum dapat dimuat. Progres di bawah hanya mencakup materi yang tersedia. Muat ulang untuk mencoba lagi.',
      });
    });
    return () => { active = false; };
  }, []);
  const journey = buildLearningJourney(user?.jabatanSkk, quiz.categories, progress);
  const notice = user?.jabatanSkk && !journey.targetName
    ? 'Target jabatan tersimpan belum dikenali katalog belajar. Pilih kembali target melalui Profil; progres lama tidak dihapus.'
    : quiz.error;
  return <LearningJourneyPanel
    {...journey}
    isSignedIn={Boolean(user)}
    loading={isLoading || progressLoading || quiz.loading}
    notice={notice}
    storageWarning={warning}
    compact={compact}
  />;
}
