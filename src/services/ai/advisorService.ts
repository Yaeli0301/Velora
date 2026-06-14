import type { Goal } from "@/types";
import type { FinanceSnapshot } from "@/services/finance/financeService";
import { formatCurrency } from "@/lib/utils";
import { GOAL_LABELS } from "@/lib/constants";
import { monthsUntilTarget } from "@/services/forecast/forecastEngine";

export interface AdvisorContext {
  snapshot: FinanceSnapshot;
  goals: Goal[];
}

export interface AdvisorReply {
  answer: string;
  /** Optional concrete action the UI can surface as a button/CTA. */
  action?: string;
}

/**
 * Rule-based financial advisor.
 *
 * This deterministic engine answers the most common questions in plain
 * Hebrew. It is intentionally decoupled from any provider so that an
 * OpenAI-backed implementation can be swapped in behind the same interface
 * (see `answer` signature) without touching the UI.
 */
export function answer(question: string, ctx: AdvisorContext): AdvisorReply {
  const q = question.trim();
  const { snapshot, goals } = ctx;
  const primaryGoal = goals[0];

  const yearMatch = q.match(/(\d+)\s*שנ/);
  const requestedYears = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

  // "How much should I save monthly to reach my goal (in N years)?"
  if (primaryGoal && (q.includes("לחסוך") || q.includes("חיסכון") || requestedYears)) {
    const gap = primaryGoal.targetAmount - primaryGoal.currentAmount;
    const horizonMonths = (requestedYears ?? 5) * 12;
    const requiredMonthly = Math.ceil(gap / horizonMonths);
    const extra = requiredMonthly - snapshot.savings;

    if (extra <= 0) {
      return {
        answer: `אתה כבר בכיוון! בקצב החיסכון הנוכחי (${formatCurrency(
          snapshot.savings
        )} בחודש) תגיע ל"${GOAL_LABELS[primaryGoal.type]}" בזמן.`,
      };
    }

    return {
      answer: `כדי להגיע ל"${GOAL_LABELS[primaryGoal.type]}" בעוד ${
        requestedYears ?? 5
      } שנים, צריך לחסוך כ-${formatCurrency(
        requiredMonthly
      )} בחודש. כרגע אתה חוסך ${formatCurrency(
        snapshot.savings
      )}, כלומר חסרים עוד כ-${formatCurrency(extra)} חיסכון חודשי.`,
      action: `הגדל חיסכון ב-${formatCurrency(extra)}`,
    };
  }

  // "When will I reach my goal?"
  if (primaryGoal && (q.includes("מתי") || q.includes("כמה זמן"))) {
    const months = monthsUntilTarget(
      primaryGoal.targetAmount,
      primaryGoal.currentAmount,
      Math.max(snapshot.savings, primaryGoal.monthlyContribution)
    );
    if (!isFinite(months)) {
      return {
        answer: `כדי להגיע ל"${GOAL_LABELS[primaryGoal.type]}" צריך קודם להתחיל לחסוך — כרגע אין עודף חודשי.`,
      };
    }
    const years = (months / 12).toFixed(1);
    return {
      answer: `בקצב הנוכחי תגיע ל"${GOAL_LABELS[primaryGoal.type]}" בעוד כ-${years} שנים.`,
    };
  }

  // "Where does my money go?" / general status
  if (q.includes("כסף") || q.includes("מצב") || q.includes("הוצאות")) {
    if (snapshot.savings <= 0) {
      return {
        answer: `החודש יצאת באיזון שלילי של ${formatCurrency(
          Math.abs(snapshot.savings)
        )}. הצעד הראשון הוא לזהות הוצאה אחת קבועה לצמצום.`,
        action: "עבור ל-Smart Budget",
      };
    }
    return {
      answer: `מתוך הכנסה של ${formatCurrency(
        snapshot.income
      )} אתה מוציא ${formatCurrency(
        snapshot.expenses
      )} ונשאר עם ${formatCurrency(snapshot.savings)} לחיסכון.`,
    };
  }

  // Fallback
  return {
    answer:
      "אני כאן כדי לעזור לך להגיע ליעדים שלך. נסה לשאול: \u201Cכמה לחסוך כדי לקנות דירה בעוד 5 שנים?\u201D או \u201Cלאן הכסף שלי הולך?\u201D",
  };
}

export const SUGGESTED_QUESTIONS = [
  "כמה לחסוך כדי לקנות דירה בעוד 5 שנים?",
  "מתי אגיע ליעד שלי?",
  "לאן הכסף שלי הולך?",
] as const;
