import { bimtekModules } from './bimtekCatalog';
import { getJabatanById, QUIZ_CATEGORY_MAP } from './skkData';

export const JOURNEY_LESSONS = [
  'Pengenalan Materi',
  'Teori dan Konsep Dasar',
  'Studi Kasus',
  'Praktik dan Aplikasi',
  'Standar dan Regulasi',
  'Quiz dan Evaluasi',
] as const;

export interface JourneyProgress {
  version: 1;
  modules: Record<string, { completed: boolean; updatedAt: string; lessons: string[] }>;
  quizzes: Record<string, { completedAt: string; total: number; score: number }>;
}

export interface JourneyStep {
  id: string;
  type: 'module' | 'quiz';
  title: string;
  category: string;
  href: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

export function emptyJourneyProgress(): JourneyProgress {
  return { version: 1, modules: {}, quizzes: {} };
}

/**
 * Editorial category recommendations, not an official certification scheme.
 * Each category has at most two introductory modules and one available practice.
 */
export function buildLearningJourney(
  targetId: string | undefined,
  availableQuizCategories: string[],
  progress: JourneyProgress,
) {
  const target = targetId ? getJabatanById(targetId) : undefined;
  const steps: JourneyStep[] = [];
  const addedQuizzes = new Set<string>();
  if (target) {
    for (const category of target.relatedCategories.slice(0, 3)) {
      for (const learningModule of bimtekModules.filter(item => item.category === category).slice(0, 2)) {
        const saved = progress.modules[learningModule.id];
        steps.push({
          id: `module:${learningModule.id}`,
          type: 'module',
          title: learningModule.title,
          category,
          href: `/bimtek/${encodeURIComponent(learningModule.id)}`,
          description: `${learningModule.duration} estimasi • selesai berdasarkan penandaan mandiri`,
          status: saved?.completed ? 'completed' : saved?.lessons.length ? 'in-progress' : 'not-started',
        });
      }
      const quizCategory = (QUIZ_CATEGORY_MAP[category] ?? []).find(
        item => availableQuizCategories.includes(item) && !addedQuizzes.has(item),
      );
      if (quizCategory) {
        addedQuizzes.add(quizCategory);
        const saved = progress.quizzes[quizCategory];
        steps.push({
          id: `quiz:${quizCategory}`,
          type: 'quiz',
          title: `Latihan ${quizCategory}`,
          category: quizCategory,
          href: `/quiz?category=${encodeURIComponent(quizCategory)}`,
          description: saved
            ? `Latihan terakhir: ${saved.score}/${saved.total} jawaban benar • bukan keputusan kompetensi`
            : 'Jawab latihan sampai ringkasan hasil untuk mencatat penyelesaian.',
          status: saved ? 'completed' : 'not-started',
        });
      }
    }
  }
  const completedCount = steps.filter(step => step.status === 'completed').length;
  return {
    targetName: target?.name ?? null,
    steps,
    nextStep: steps.find(step => step.status !== 'completed') ?? null,
    completedCount,
    totalCount: steps.length,
    progressPercent: steps.length ? Math.round(completedCount / steps.length * 100) : 0,
  };
}

export interface LearningJourneyPanelProps {
  targetName: string | null;
  steps: JourneyStep[];
  nextStep: JourneyStep | null;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  isSignedIn: boolean;
  loading: boolean;
  notice: string | null;
  storageWarning: string | null;
  compact?: boolean;
}
