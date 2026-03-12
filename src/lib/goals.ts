import type { Goal } from '../interfaces/goal';
import { isCurrentMonth, isPreviousMonth } from './date';

export function sumGoals(goals: Goal[]): number {
  return goals.reduce((acc, g) => acc + (g.goal ?? 0), 0);
}

export function computeMetrics(goals: Goal[]) {
  const currentGoals = goals.filter((g) => isCurrentMonth(g.period));
  const prevGoals = goals.filter((g) => isPreviousMonth(g.period));

  const periodTotals = new Map<string, number>();
  for (const g of goals) {
    const key = g.period?.slice(0, 7) ?? '';
    if (!key) continue;
    periodTotals.set(key, (periodTotals.get(key) ?? 0) + (g.goal ?? 0));
  }
  const totals = [...periodTotals.values()];

  const currentTotal = sumGoals(currentGoals);
  const prevTotal = sumGoals(prevGoals);
  const avgTotal = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  const regionCount = new Set(currentGoals.map((g) => g.region).filter(Boolean)).size;

  const varPrev = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;
  const varAvg = avgTotal > 0 ? ((currentTotal - avgTotal) / avgTotal) * 100 : 0;

  return { currentTotal, prevTotal, avgTotal, regionCount, varPrev, varAvg };
}
