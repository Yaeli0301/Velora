import type { Goal } from "@/types";
import type {
  FinancialHealthTimeline,
  TimelineMilestone,
} from "@/types/decisions";
import type { FinanceSnapshot } from "@/services/finance/financeService";
import { calcFinancialScore, scoreStatus } from "@/services/finance/financeService";

const MONTHLY_GROWTH = 0.002;

function addMonths(date: Date, months: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function projectSavingsAtMonth(baseMonthly: number, months: number): number {
  let accumulated = 0;
  let monthly = Math.max(0, baseMonthly);
  for (let m = 0; m < months; m++) {
    accumulated += monthly;
    monthly *= 1 + MONTHLY_GROWTH;
  }
  return Math.round(accumulated);
}

function projectScore(
  snapshot: FinanceSnapshot,
  goal: Goal | undefined,
  monthsAhead: number,
  baseMonthly: number
): number {
  const projectedMonthly = baseMonthly * (1 + MONTHLY_GROWTH) ** monthsAhead;
  const projectedSnapshot: FinanceSnapshot = {
    ...snapshot,
    savings: projectedMonthly,
    savingsRate:
      snapshot.income > 0 ? projectedMonthly / snapshot.income : snapshot.savingsRate,
  };
  const goals = goal ? [goal] : [];
  const progressBoost = goal
    ? Math.min(0.15, monthsAhead / 120)
    : 0;
  const adjustedGoal: Goal | undefined = goal
    ? {
        ...goal,
        currentAmount: Math.min(
          goal.targetAmount,
          goal.currentAmount + projectedMonthly * monthsAhead * 0.5
        ),
      }
    : undefined;
  const base = calcFinancialScore(
    projectedSnapshot,
    adjustedGoal ? [{ ...adjustedGoal, currentAmount: adjustedGoal.currentAmount + goal!.targetAmount * progressBoost }] : goals
  );
  return Math.min(100, Math.round(base));
}

function goalProgressAt(goal: Goal, extraSavings: number): number {
  const pct =
    ((goal.currentAmount + extraSavings) / Math.max(1, goal.targetAmount)) * 100;
  return Math.min(100, Math.round(pct));
}

/**
 * Financial Health Timeline: Today → 6M → 1Y → Goal Date
 */
export function buildHealthTimeline(
  snapshot: FinanceSnapshot,
  primaryGoal: Goal | undefined,
  recommendedMonthlyBoost = 0
): FinancialHealthTimeline {
  const today = new Date();
  const effectiveMonthly = Math.max(0, snapshot.savings + recommendedMonthlyBoost);
  const goalDateIso = primaryGoal?.targetDate ?? addMonths(today, 60);

  const defs: { id: TimelineMilestone["id"]; label: string; months: number }[] = [
    { id: "today", label: "היום", months: 0 },
    { id: "6m", label: "6 חודשים", months: 6 },
    { id: "1y", label: "שנה", months: 12 },
    { id: "goal", label: "תאריך יעד", months: -1 },
  ];

  const milestones: TimelineMilestone[] = defs.map((def) => {
    let months = def.months;
    let dateIso = addMonths(today, months);

    if (def.id === "goal" && primaryGoal) {
      dateIso = primaryGoal.targetDate;
      const goalDate = new Date(primaryGoal.targetDate);
      months = Math.max(
        0,
        (goalDate.getFullYear() - today.getFullYear()) * 12 +
          (goalDate.getMonth() - today.getMonth())
      );
    } else if (def.id === "goal") {
      months = 60;
      dateIso = addMonths(today, months);
    }

    const projectedSavings =
      def.id === "today"
        ? Math.max(0, primaryGoal?.currentAmount ?? 0)
        : (primaryGoal?.currentAmount ?? 0) + projectSavingsAtMonth(effectiveMonthly, months);

    const projectedScore = projectScore(snapshot, primaryGoal, months, effectiveMonthly);
    const status = scoreStatus(projectedScore);
    const goalProgressPercent = primaryGoal
      ? goalProgressAt(
          primaryGoal,
          def.id === "today" ? 0 : projectSavingsAtMonth(effectiveMonthly, months)
        )
      : 0;

    return {
      id: def.id,
      label: def.label,
      dateIso,
      projectedSavings,
      projectedScore,
      status,
      goalProgressPercent,
    };
  });

  return { milestones, goalDateIso };
}
