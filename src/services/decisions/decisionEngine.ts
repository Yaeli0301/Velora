import type { Goal } from "@/types";
import type {
  Decision,
  DecisionHomePayload,
  RecommendationImpact,
} from "@/types/decisions";
import { formatCurrency } from "@/lib/utils";
import { GOAL_LABELS } from "@/lib/constants";
import {
  buildInsightContext,
  monthsToGoalAtPace,
  type InsightEngineInput,
} from "@/services/insights/insightEngine";
import { buildSnapshot } from "@/services/finance/financeService";
import { buildHealthTimeline } from "@/services/decisions/healthTimeline";

function calcImpact(
  snapshot: ReturnType<typeof buildSnapshot>,
  goal: Goal | undefined,
  monthlyBoost: number
): RecommendationImpact {
  if (!goal || monthlyBoost <= 0) {
    return {
      financialImpact: monthlyBoost,
      timeSavedMonths: 0,
      goalAccelerationPercent: 0,
    };
  }

  const monthsBefore = monthsToGoalAtPace(goal, snapshot.savings);
  const monthsAfter = monthsToGoalAtPace(goal, snapshot.savings + monthlyBoost);

  const timeSavedMonths =
    isFinite(monthsBefore) && isFinite(monthsAfter)
      ? Math.max(0, Math.round(monthsBefore - monthsAfter))
      : 0;

  const goalAccelerationPercent =
    isFinite(monthsBefore) && monthsBefore > 0
      ? Math.min(100, Math.round((timeSavedMonths / monthsBefore) * 100))
      : 0;

  return {
    financialImpact: monthlyBoost,
    timeSavedMonths,
    goalAccelerationPercent,
  };
}

function buildPrimaryDecision(
  ctx: ReturnType<typeof buildInsightContext>,
  goal: Goal | undefined,
  monthlyBoost: number
): Decision {
  const financeSnapshot = {
    income: ctx.snapshot.income,
    expenses: ctx.snapshot.expenses,
    savings: ctx.snapshot.savings,
    savingsRate: ctx.snapshot.savingsRate,
  };

  const impact = calcImpact(financeSnapshot, goal, monthlyBoost);

  let title: string;
  let rationale: string;

  if (monthlyBoost <= 0 && ctx.snapshot.savings <= 0) {
    title = "צמצם הוצאות קבועות";
    rationale =
      "כרגע אין עודף בסוף החודש. ה-CFO ממליץ לזהות הוצאה אחת לצמצום כדי לפתוח מרווח חיסכון.";
    impact.financialImpact = Math.round(ctx.snapshot.expenses * 0.05);
  } else if (monthlyBoost > 0) {
    title = `הגדל חיסכון חודשי ב-${formatCurrency(monthlyBoost)}`;
    const goalLabel = goal ? GOAL_LABELS[goal.type] : "היעד שלך";
    rationale = `כדי להגיע ל${goalLabel} בזמן, צריך לחסוך ${formatCurrency(
      (goal?.monthlyContribution ?? monthlyBoost)
    )} בחודש. כרגע חוסכים ${formatCurrency(ctx.snapshot.savings)}.`;
  } else {
    title = "המשך בקצב הנוכחי";
    rationale = ctx.headline;
  }

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);

  return {
    id: `dec-${Date.now()}`,
    title,
    rationale,
    impact,
    confidence: ctx.confidence,
    status: "pending",
    validUntil: validUntil.toISOString(),
    planType: goal?.type,
  };
}

export interface DecisionEngineInput extends InsightEngineInput {
  decisionStatus?: Decision["status"];
}

/**
 * Top-level orchestrator for Decision Home.
 * Flow: DecisionEngine → InsightEngine → FinanceService
 */
export function buildDecisionHomePayload(
  input: DecisionEngineInput
): DecisionHomePayload {
  const ctx = buildInsightContext(input);
  const primaryGoal = input.goals[0];
  const gap = primaryGoal
    ? Math.max(0, primaryGoal.monthlyContribution - ctx.snapshot.savings)
    : 0;
  const monthlyBoost = gap > 0 ? gap : ctx.snapshot.savings <= 0 ? 0 : 0;

  const effectiveBoost =
    monthlyBoost > 0
      ? monthlyBoost
      : ctx.snapshot.savings <= 0
        ? Math.round(ctx.snapshot.expenses * 0.05)
        : 0;

  let decision = buildPrimaryDecision(ctx, primaryGoal, effectiveBoost);
  if (input.decisionStatus) {
    decision = { ...decision, status: input.decisionStatus };
  }

  const timeline = buildHealthTimeline(
    {
      income: ctx.snapshot.income,
      expenses: ctx.snapshot.expenses,
      savings: ctx.snapshot.savings,
      savingsRate: ctx.snapshot.savingsRate,
    },
    primaryGoal,
    decision.impact.financialImpact
  );

  const months = monthsToGoalAtPace(primaryGoal, ctx.snapshot.savings);
  const yearsToGoal = isFinite(months) ? months / 12 : 0;

  return {
    decision,
    timeline,
    insightContext: ctx,
    topInsight: ctx.insights[0] ?? null,
    yearsToGoal,
  };
}
