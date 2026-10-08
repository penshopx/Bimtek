export function shuffleArray<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function orderQuizQuestions<T extends { category: string }>(
  questions: readonly T[],
  {
    relatedCategories,
    jabatanFilterActive,
    prioritizeRelevant,
    randomMode,
  }: {
    relatedCategories: readonly string[];
    jabatanFilterActive: boolean;
    prioritizeRelevant: boolean;
    randomMode: boolean;
  },
): T[] {
  const related = new Set(relatedCategories);
  const base = jabatanFilterActive && related.size > 0
    ? questions.filter((question) => related.has(question.category))
    : [...questions];
  const ordered = randomMode ? shuffleArray(base) : base;

  if (!jabatanFilterActive && prioritizeRelevant && related.size > 0) {
    // Stable partition: preserve fixed/shuffled order within each group.
    return [
      ...ordered.filter((question) => related.has(question.category)),
      ...ordered.filter((question) => !related.has(question.category)),
    ];
  }
  return ordered;
}
