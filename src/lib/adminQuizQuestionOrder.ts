type Question = { id: number; category: string };
type AttemptStat = { totalAttempts: number; successRate: number };

/** Select the admin table rows without changing the saved display order. */
export function getDisplayedAdminQuizQuestions<T extends Question>(
  questions: T[],
  stats: ReadonlyMap<number, AttemptStat>,
  category: string,
  sortBySuccessRate: boolean,
): T[] {
  const filtered = category === 'Semua'
    ? questions
    : questions.filter((question) => question.category === category);

  if (!sortBySuccessRate) return filtered;

  const rate = (question: T) => {
    const stat = stats.get(question.id);
    // No attempts is not a 0% result: place it after every real 0–100% rate.
    return stat && stat.totalAttempts > 0 ? stat.successRate : 101;
  };
  return [...filtered].sort((a, b) => rate(a) - rate(b));
}
