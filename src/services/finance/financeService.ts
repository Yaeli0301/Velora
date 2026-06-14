import type {
  Transaction,
  Goal,
  DashboardSummary,
  FinancialInsight,
} from "@/types";
import { formatCurrency, calcMonthsToGoal } from "@/lib/utils";
import { GOAL_LABELS } from "@/lib/constants";
import { buildForecast } from "@/services/forecast/forecastEngine";
import { buildInsights as insightEngineBuildInsights } from "@/services/insights/insightEngine";

export interface FinanceSnapshot {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

/**
 * Aggregates a list of transactions into a monthly snapshot.
 * Income and expenses are summed separately; savings is the difference.
 */
export function buildSnapshot(
  monthlyIncome: number,
  transactions: Transaction[]
): FinanceSnapshot {
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const extraIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const income = monthlyIncome + extraIncome;
  const savings = income - expenses;
  const savingsRate = income > 0 ? savings / income : 0;

  return { income, expenses, savings, savingsRate };
}

/**
 * Calculates a 0-100 financial score from behaviour signals.
 * The score is intentionally simple to explain: it rewards a healthy
 * savings rate, an emergency buffer, and progress toward goals.
 */
export function calcFinancialScore(
  snapshot: FinanceSnapshot,
  goals: Goal[]
): number {
  const { savingsRate } = snapshot;

  // Savings rate contributes up to 50 points (20% rate => full marks).
  const savingsPoints = Math.max(0, Math.min(50, (savingsRate / 0.2) * 50));

  // Positive cashflow contributes up to 25 points.
  const cashflowPoints = snapshot.savings > 0 ? 25 : 0;

  // Goal progress contributes up to 25 points (average completion).
  const goalProgress =
    goals.length > 0
      ? goals.reduce(
          (sum, g) =>
            sum + Math.min(1, g.currentAmount / Math.max(1, g.targetAmount)),
          0
        ) / goals.length
      : 0.5;
  const goalPoints = goalProgress * 25;

  return Math.round(savingsPoints + cashflowPoints + goalPoints);
}

export function scoreStatus(
  score: number
): DashboardSummary["status"] {
  if (score >= 70) return "on-track";
  if (score >= 45) return "at-risk";
  return "off-track";
}

/**
 * Produces the single, human headline shown at the top of the dashboard.
 * This is the heart of the product: a decision, not a statistic.
 */
export function buildHeadline(
  snapshot: FinanceSnapshot,
  primaryGoal: Goal | undefined
): string {
  if (!primaryGoal) {
    if (snapshot.savings <= 0) {
      return "אתה מוציא יותר ממה שאתה מכניס — בוא נמצא יחד מאיפה להתחיל לחסוך.";
    }
    return `אתה חוסך ${formatCurrency(snapshot.savings)} בחודש. בוא נגדיר יעד כדי לתת לכסף הזה כיוון.`;
  }

  const gap = primaryGoal.targetAmount - primaryGoal.currentAmount;
  const months = calcMonthsToGoal(
    primaryGoal.targetAmount,
    primaryGoal.currentAmount,
    Math.max(snapshot.savings, primaryGoal.monthlyContribution)
  );

  if (gap <= 0) {
    return `הגעת ליעד "${GOAL_LABELS[primaryGoal.type]}"! זה הזמן להגדיר את היעד הבא.`;
  }

  if (!isFinite(months)) {
    return `כדי להגיע ל"${GOAL_LABELS[primaryGoal.type]}" צריך להתחיל לחסוך — כרגע לא נשאר עודף בסוף החודש.`;
  }

  const years = (months / 12).toFixed(1);
  return `בקצב הנוכחי תגיע ליעד "${GOAL_LABELS[primaryGoal.type]}" בעוד כ-${years} שנים. חסרים עוד ${formatCurrency(gap)}.`;
}

/** @deprecated Prefer insightEngine.buildInsights */
export function buildInsights(
  snapshot: FinanceSnapshot,
  goals: Goal[]
): FinancialInsight[] {
  return insightEngineBuildInsights(snapshot, goals);
}

/**
 * Top-level orchestration used by the dashboard.
 */
export function buildDashboardSummary(
  monthlyIncome: number,
  transactions: Transaction[],
  goals: Goal[]
): DashboardSummary {
  const snapshot = buildSnapshot(monthlyIncome, transactions);
  const financialScore = calcFinancialScore(snapshot, goals);
  const status = scoreStatus(financialScore);
  const headline = buildHeadline(snapshot, goals[0]);
  const forecasts = buildForecast(snapshot, [1, 3, 5]);
  const insights = insightEngineBuildInsights(snapshot, goals);

  return {
    income: snapshot.income,
    expenses: snapshot.expenses,
    savings: snapshot.savings,
    savingsRate: snapshot.savingsRate,
    financialScore,
    status,
    headline,
    forecasts,
    insights,
  };
}
