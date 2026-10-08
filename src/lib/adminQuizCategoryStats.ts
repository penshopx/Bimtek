type Question = { id: number; category: string };
type AttemptStat = { totalAttempts: number; successRate: number };

/** Average question success rates, giving each attempted question equal weight. */
export function getAdminQuizCategoryRates(
  questions: readonly Question[],
  stats: ReadonlyMap<number, AttemptStat>,
): Map<string, number> {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const question of questions) {
    const stat = stats.get(question.id);
    if (!stat || stat.totalAttempts <= 0) continue;
    const total = totals.get(question.category) ?? { sum: 0, count: 0 };
    total.sum += stat.successRate;
    total.count += 1;
    totals.set(question.category, total);
  }
  return new Map(
    [...totals].map(([category, total]) => [
      category,
      Math.round(total.sum / total.count),
    ]),
  );
}
