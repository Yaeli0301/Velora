import type { Goal, Transaction } from "@/types";
import type { FinanceSnapshot } from "@/services/finance/financeService";
import { buildSnapshot, buildDashboardSummary } from "@/services/finance/financeService";
import { buildDecisionHomePayload } from "@/services/decisions/decisionEngine";
import { monthsToGoalAtPace } from "@/services/insights/insightEngine";
import { GOAL_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { BudgetCategory } from "@/types";

export interface CFOToolContext {
  monthlyIncome: number;
  transactions: Transaction[];
  goals: Goal[];
  fromOnboarding: boolean;
}

export function execGetFinancialSnapshot(ctx: CFOToolContext) {
  const summary = buildDashboardSummary(ctx.monthlyIncome, ctx.transactions, ctx.goals);
  return {
    income: summary.income,
    expenses: summary.expenses,
    savings: summary.savings,
    savingsRate: Math.round(summary.savingsRate * 100),
    financialScore: summary.financialScore,
    status: summary.status,
    headline: summary.headline,
  };
}

export function execGetLifePlanStatus(ctx: CFOToolContext) {
  const goal = ctx.goals[0];
  if (!goal) return { error: "no_goal" };

  const snapshot = buildSnapshot(ctx.monthlyIncome, ctx.transactions);
  const months = monthsToGoalAtPace(goal, snapshot.savings);
  const gap = goal.targetAmount - goal.currentAmount;

  return {
    goalType: goal.type,
    goalLabel: GOAL_LABELS[goal.type],
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    gap,
    monthlyContribution: goal.monthlyContribution,
    monthsRemaining: isFinite(months) ? months : null,
    yearsRemaining: isFinite(months) ? Number((months / 12).toFixed(1)) : null,
    onTrack: snapshot.savings >= goal.monthlyContribution,
  };
}

export function execGetSpendingBreakdown(ctx: CFOToolContext) {
  const byCategory: Partial<Record<BudgetCategory, number>> = {};
  for (const tx of ctx.transactions.filter((t) => t.type === "expense")) {
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;
  }

  const sorted = Object.entries(byCategory)
    .map(([category, amount]) => ({
      category,
      label: CATEGORY_LABELS[category as BudgetCategory],
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    categories: sorted,
    topCategory: sorted[0] ?? null,
    totalExpenses: sorted.reduce((s, c) => s + c.amount, 0),
  };
}

export function execSimulateScenario(
  ctx: CFOToolContext,
  args: { monthlySavingsBoost?: number; incomeChangePercent?: number }
) {
  const boost = args.monthlySavingsBoost ?? 0;
  const incomeMultiplier = 1 + (args.incomeChangePercent ?? 0) / 100;
  const adjustedIncome = Math.round(ctx.monthlyIncome * incomeMultiplier);

  const snapshot = buildSnapshot(adjustedIncome, ctx.transactions);
  const adjustedSavings = snapshot.savings + boost;
  const goal = ctx.goals[0];

  const monthsBefore = monthsToGoalAtPace(goal, snapshot.savings);
  const monthsAfter = monthsToGoalAtPace(goal, adjustedSavings);

  return {
    baselineSavings: snapshot.savings,
    projectedSavings: adjustedSavings,
    monthsBefore: isFinite(monthsBefore) ? monthsBefore : null,
    monthsAfter: isFinite(monthsAfter) ? monthsAfter : null,
    monthsSaved:
      isFinite(monthsBefore) && isFinite(monthsAfter)
        ? Math.max(0, Math.round(monthsBefore - monthsAfter))
        : 0,
    summary:
      boost > 0
        ? `הוספת ${formatCurrency(boost)} חיסכון חודשי`
        : args.incomeChangePercent
          ? `שינוי הכנסה של ${args.incomeChangePercent}%`
          : "ללא שינוי",
  };
}

export function execCreateDecisionRecommendation(ctx: CFOToolContext) {
  const payload = buildDecisionHomePayload({
    monthlyIncome: ctx.monthlyIncome,
    transactions: ctx.transactions,
    goals: ctx.goals,
    onboardingOnly: ctx.fromOnboarding,
  });

  return {
    title: payload.decision.title,
    rationale: payload.decision.rationale,
    impact: payload.decision.impact,
    confidence: payload.decision.confidence,
  };
}

export const CFO_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "get_financial_snapshot",
      description: "Get current income, expenses, savings, score and status",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_life_plan_status",
      description: "Get primary goal gap, timeline, on-track status",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_spending_breakdown",
      description: "Get expenses by category",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "simulate_scenario",
      description: "Simulate savings boost or income change impact on goal timeline",
      parameters: {
        type: "object",
        properties: {
          monthlySavingsBoost: { type: "number" },
          incomeChangePercent: { type: "number" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_decision_recommendation",
      description: "Get the current primary CFO decision recommendation",
      parameters: { type: "object", properties: {} },
    },
  },
];

export function executeCFOTool(
  name: string,
  args: Record<string, unknown>,
  ctx: CFOToolContext
): unknown {
  switch (name) {
    case "get_financial_snapshot":
      return execGetFinancialSnapshot(ctx);
    case "get_life_plan_status":
      return execGetLifePlanStatus(ctx);
    case "get_spending_breakdown":
      return execGetSpendingBreakdown(ctx);
    case "simulate_scenario":
      return execSimulateScenario(ctx, args);
    case "create_decision_recommendation":
      return execCreateDecisionRecommendation(ctx);
    default:
      return { error: "unknown_tool" };
  }
}
