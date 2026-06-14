import type { Goal, Transaction, FinancialInsight } from "@/types";
import type { DataConfidence, InsightContext } from "@/types/decisions";
import { formatCurrency, calcMonthsToGoal } from "@/lib/utils";
import { GOAL_LABELS } from "@/lib/constants";
import {
  buildSnapshot,
  calcFinancialScore,
  scoreStatus,
  buildHeadline,
  type FinanceSnapshot,
} from "@/services/finance/financeService";

export interface InsightEngineInput {
  monthlyIncome: number;
  transactions: Transaction[];
  goals: Goal[];
  /** When true, income comes from onboarding only — no transaction history */
  onboardingOnly?: boolean;
  hasOpenBanking?: boolean;
}

/**
 * Sits between DecisionEngine and FinanceService.
 * Aggregates raw finance signals, enriches insights, and assesses data confidence.
 */
export function assessDataConfidence(input: InsightEngineInput): DataConfidence {
  const missing: string[] = [];
  let score = 100;

  if (input.onboardingOnly) {
    missing.push("הוצאות חודשיות מפורטות");
    score -= 25;
  }

  if (input.transactions.length === 0) {
    missing.push("היסטוריית עסקאות");
    score -= 20;
  } else if (input.transactions.length < 4) {
    missing.push("מספר חודשים של נתונים");
    score -= 10;
  }

  if (input.goals.length === 0) {
    missing.push("יעד חיים מוגדר");
    score -= 15;
  }

  if (!input.hasOpenBanking) {
    missing.push("חיבור בנק (אופציונלי)");
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));

  let level: DataConfidence["level"] = "high";
  if (score < 50) level = "low";
  else if (score < 80) level = "medium";

  const message =
    level === "high"
      ? "ההמלצה מבוססת על נתונים מלאים"
      : level === "medium"
        ? "ההמלצה מבוססת על הערכה — עדכון נתונים ישפר דיוק"
        : "חסרים נתונים — ההמלצה היא נקודת התחלה";

  return { level, score, missingFactors: missing, message };
}

export function buildInsights(
  snapshot: FinanceSnapshot,
  goals: Goal[]
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  if (snapshot.savings <= 0) {
    insights.push({
      id: "negative-cashflow",
      type: "warning",
      title: "אתה במינוס חודשי",
      message: `ההוצאות גבוהות מההכנסות ב-${formatCurrency(Math.abs(snapshot.savings))}. הצעד הראשון: לזהות הוצאה אחת לצמצום.`,
      priority: 100,
    });
  } else if (snapshot.savingsRate < 0.1) {
    insights.push({
      id: "low-savings-rate",
      type: "info",
      title: "שיעור החיסכון נמוך",
      message: `אתה חוסך ${Math.round(snapshot.savingsRate * 100)}% מההכנסה. העלאה ל-15% תקרב אותך משמעותית ליעדים.`,
      priority: 70,
    });
  } else {
    insights.push({
      id: "healthy-savings",
      type: "success",
      title: "אתה בכיוון טוב",
      message: `אתה חוסך ${formatCurrency(snapshot.savings)} כל חודש. המשך כך.`,
      priority: 40,
    });
  }

  const primaryGoal = goals[0];
  if (primaryGoal) {
    const target = primaryGoal.monthlyContribution;
    if (snapshot.savings < target) {
      insights.push({
        id: "goal-gap",
        type: "action",
        title: `כדי לעמוד ביעד "${GOAL_LABELS[primaryGoal.type]}"`,
        message: `נסה להגדיל את החיסכון החודשי ב-${formatCurrency(target - snapshot.savings)}.`,
        priority: 85,
      });
    }
  }

  const overspent = detectOverspentCategories();
  if (overspent.length > 0) {
    insights.push({
      id: "category-spike",
      type: "warning",
      title: `${overspent.length} קטגוריות דורשות תשומת לב`,
      message: `הגדולה ביותר: ${overspent[0]}. שאל את ה-CFO למה.`,
      priority: 75,
    });
  }

  return insights.sort((a, b) => b.priority - a.priority);
}

/** Demo-aware overspend hint — replaced by real budget analysis in V1 */
function detectOverspentCategories(): string[] {
  return ["מזון", "בילויים"];
}

/**
 * Main InsightEngine entry — used by DecisionEngine.
 */
export function buildInsightContext(input: InsightEngineInput): InsightContext {
  const snapshot = buildSnapshot(input.monthlyIncome, input.transactions);
  const financialScore = calcFinancialScore(snapshot, input.goals);
  const status = scoreStatus(financialScore);
  const headline = buildHeadline(snapshot, input.goals[0]);
  const insights = buildInsights(snapshot, input.goals);
  const confidence = assessDataConfidence(input);

  return {
    snapshot: {
      income: snapshot.income,
      expenses: snapshot.expenses,
      savings: snapshot.savings,
      savingsRate: snapshot.savingsRate,
      financialScore,
      status,
    },
    insights,
    confidence,
    headline,
  };
}

export function monthsToGoalAtPace(
  goal: Goal | undefined,
  monthlySavings: number
): number {
  if (!goal) return Infinity;
  return calcMonthsToGoal(
    goal.targetAmount,
    goal.currentAmount,
    Math.max(monthlySavings, goal.monthlyContribution)
  );
}
