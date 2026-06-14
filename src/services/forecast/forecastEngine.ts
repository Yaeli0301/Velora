import type { ForecastPoint } from "@/types";
import type { FinanceSnapshot } from "@/services/finance/financeService";

/**
 * Forecast Engine
 * -----------------------------------------------------------------------------
 * Lightweight statistical helpers used to project a user's financial future.
 * The maths stays here and is never exposed to the user — the UI only ever
 * shows the resulting plain-language numbers.
 */

/** Simple arithmetic mean. */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Population standard deviation — used to express volatility/uncertainty. */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  const variance =
    values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Moving average over a window. Smooths noisy month-to-month spending so the
 * forecast reflects the underlying trend rather than one-off spikes.
 */
export function movingAverage(values: number[], window: number): number[] {
  if (window <= 0 || values.length === 0) return [];
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    result.push(mean(slice));
  }
  return result;
}

/**
 * Estimates a linear trend (slope per period) using least squares.
 * A positive slope on savings means the user is improving over time.
 */
export function linearTrend(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xs = Array.from({ length: n }, (_, i) => i);
  const xMean = mean(xs);
  const yMean = mean(values);
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (xs[i] - xMean) * (values[i] - yMean);
    denominator += (xs[i] - xMean) ** 2;
  }
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Projects accumulated savings (net worth contribution) at the given year
 * horizons, assuming the current monthly savings continues and grows with a
 * conservative trend factor.
 */
export function buildForecast(
  snapshot: FinanceSnapshot,
  horizonsInYears: number[],
  opts: { monthlyGrowth?: number } = {}
): ForecastPoint[] {
  const monthlyGrowth = opts.monthlyGrowth ?? 0.002; // ~2.4%/yr drift
  const baseMonthly = Math.max(0, snapshot.savings);

  return horizonsInYears.map((years) => {
    const months = years * 12;
    let accumulated = 0;
    let monthly = baseMonthly;
    for (let m = 0; m < months; m++) {
      accumulated += monthly;
      monthly *= 1 + monthlyGrowth;
    }
    return {
      year: years,
      savings: Math.round(accumulated),
      income: Math.round(snapshot.income * 12 * years),
      expenses: Math.round(snapshot.expenses * 12 * years),
      netWorth: Math.round(accumulated),
    };
  });
}

/**
 * Estimates how many months until a target is reached given current savings.
 * Returns Infinity when the user is not saving.
 */
export function monthsUntilTarget(
  target: number,
  current: number,
  monthlySavings: number
): number {
  if (monthlySavings <= 0) return Infinity;
  const gap = target - current;
  if (gap <= 0) return 0;
  return Math.ceil(gap / monthlySavings);
}

/**
 * Describes the spending trend in one of three plain words for the UI.
 */
export function describeTrend(
  monthlyExpenses: number[]
): "improving" | "stable" | "worsening" {
  const slope = linearTrend(monthlyExpenses);
  const volatility = standardDeviation(monthlyExpenses);
  const threshold = Math.max(50, volatility * 0.25);
  if (slope < -threshold) return "improving";
  if (slope > threshold) return "worsening";
  return "stable";
}
